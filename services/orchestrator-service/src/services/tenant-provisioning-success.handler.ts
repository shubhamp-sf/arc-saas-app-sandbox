import {TenantProvisioningSuccessHandler} from '@arc-saas/orchestrator-service';
import {injectable, BindingScope, Provider} from '@loopback/core';
import {AnyObject} from '@loopback/repository';
import {IncomingMessage} from 'http';

@injectable({scope: BindingScope.TRANSIENT})
export class TenantProvisioningSuccessHandlerProvider
  implements Provider<TenantProvisioningSuccessHandler>
{
  constructor() {}

  value() {
    return async (body: AnyObject) => this.handler(body);
  }

  private async handler(detail: AnyObject): Promise<void> {
    console.log('Detail Received', detail);
    const http =
      detail.API_ENDPOINT.split('://')[0] === 'https'
        ? require('https')
        : require('http');
    const crypto = require('crypto');

    const timestamp = Date.now();
    const secret = detail.secret;
    const context = detail.context;

    const tenantData = JSON.parse(detail.tenant);
    const contact = tenantData.contacts[0];

    const getPayload = () =>
      JSON.stringify({
        initiatorId: tenantData.id,
        type: 0,
        data: {
          status: Number(`${detail.CODEBUILD_BUILD_SUCCEEDING}`),
          resources: [
            {
              type: 's3',
              metadata: {
                bucket: detail.TF_STATE_BUCKET,
                path: detail.TF_KEY,
              },
            },
          ],
          appPlaneUrl: detail.APP_PLANE_REDIRECT_URL,
        },
      });

    const tenantPayload = JSON.stringify({
      email: contact?.email,
      phone: contact?.phone,
      username: contact?.username,
      tenantName: tenantData.name,
      tenantKey: tenantData.key,
      firstName: contact?.firstName,
      lastName: contact?.lastName,
      middleName: contact?.middleName,
      cognitoAuthId: detail.COGNITO_AUTH_ID,
      authClient: {
        clientId: detail.CLIENT_ID,
        clientSecret: detail.CLIENT_SECRET,
        redirectUrl: detail.APP_PLANE_REDIRECT_URL,
        secret: secret,
        accessTokenExpiration: Number(detail.ACCESS_TOKEN_EXPIRATION),
        refreshTokenExpiration: Number(detail.REFRESH_TOKEN_EXPIRATION),
        authCodeExpiration: Number(detail.AUTH_CODE_EXPIRATION),
      },
      address: {
        address: tenantData.address?.address,
        city: tenantData.address?.city,
        state: tenantData.address?.state,
        zip: tenantData.address?.zip,
        country: tenantData.address?.country,
      },
    });

    function makeCall(endpoint: string, payload: string, name: string) {
      return new Promise((resolve, reject) => {
        let str = '';
        if (name === 'user-callback') {
          str = `${payload}${timestamp}`;
        } else {
          str = `${payload}${context}${timestamp}`;
        }
        const signature = crypto
          .createHmac('sha256', secret)
          .update(str)
          .digest('hex');
        const options = {
          method: 'POST',
          headers: {
            'content-type': 'application/json',
            'x-timestamp': timestamp,
            'x-signature': signature,
            'bypass-tunnel-reminder': true,
          },
        };

        console.log('Endpoint', endpoint);
        const req = http.request(endpoint, options, (res: IncomingMessage) => {
          console.log('statusCode:', res.statusCode);
          res.on('data', function (chunk) {
            console.log('BODY: ' + chunk);
          });

          if (res.statusCode !== 204) {
            reject(`Call failed for ${name}`);
            return;
          }
          resolve(`Call succeeded for ${name}`);
        });

        req.on('error', (e: Error) => {
          console.error(e);
          throw e;
        });

        req.write(payload);
        req.end();
      });
    }

    if (detail.CODEBUILD_BUILD_SUCCEEDING === '0') {
      await makeCall(detail.API_ENDPOINT, getPayload(), 'webhook');
    } else if (detail.CODEBUILD_BUILD_POSTBUILD === '1') {
      try {
        if (detail.CREATE_USER === '1') {
          await makeCall(
            detail.USER_CALLBACK_ENDPOINT,
            tenantPayload,
            'user-callback',
          );
        }
      } catch (e) {
        detail.CODEBUILD_BUILD_SUCCEEDING = '0';
      } finally {
        await makeCall(detail.API_ENDPOINT, getPayload(), 'webhook');
      }
    } else {
      console.log('No call made');
    }
  }
}
