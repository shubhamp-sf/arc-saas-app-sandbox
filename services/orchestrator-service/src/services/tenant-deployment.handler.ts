import {TenantDeploymentHandler} from '@arc-saas/orchestrator-service';
import {injectable, BindingScope, Provider, service} from '@loopback/core';
import {AnyObject} from '@loopback/repository';
import {IncomingMessage} from 'http';
import * as https from 'https';
import * as http from 'http';
import * as crypto from 'crypto';
import {DataStoreService} from './data-store.service';

@injectable({scope: BindingScope.TRANSIENT})
export class TenantDeploymentProvider
  implements Provider<TenantDeploymentHandler>
{
  constructor(
    @service(DataStoreService)
    private readonly dataStoreService: DataStoreService,
  ) {}

  value() {
    return async (body: AnyObject) => this.handler(body);
  }

  private async handler(detail: AnyObject): Promise<void> {
    console.log('Tenant Deployment: ', detail);

    const httpModule = this.getHttpModule(detail.API_ENDPOINT);
    const getTimestamp = () => {
      return Date.now();
    };
    const secret = detail.secret;
    const context = detail.context;

    const tenantData = JSON.parse(detail.tenant);
    const contact = tenantData.contacts[0];

    const provisioningRecord =
      await this.dataStoreService.retrieveDataFromDynamoDB(
        tenantData.id,
        'tenantId',
      );

    console.log(
      `Provisioning record for the tenant: ${tenantData.id}`,
      provisioningRecord,
    );

    const tenantContextPayload = this.createTenantContextPayload(
      detail,
      provisioningRecord.planConfig,
    );
    console.log('tenantContextPayload', tenantContextPayload);

    console.log(
      'detail.APP_PLANE_ENDPOINT_FEATURE_SERVICE',
      detail.APP_PLANE_ENDPOINT_FEATURE_SERVICE,
    );
    if (detail.APP_PLANE_ENDPOINT_FEATURE_SERVICE) {
      console.log('Triggering APP_PLANE_ENDPOINT_FEATURE_SERVICE');
      await this.makeCall(
        httpModule,
        detail.APP_PLANE_ENDPOINT_FEATURE_SERVICE.concat('/bootstrap'),
        tenantContextPayload,
        'service-callback',
        secret,
        getTimestamp(),
        context,
      ).catch(err => {
        console.log('Error in APP_PLANE_ENDPOINT_FEATURE_SERVICE call', err);
      });
    } else {
      console.log(
        '🟥 APP_PLANE_ENDPOINT_FEATURE_SERVICE is not available in the detail object.',
      );
    }

    const tenantPayload = this.createTenantPayload(
      detail,
      tenantData,
      contact,
      secret,
    );

    try {
      if (detail.CODEBUILD_BUILD_SUCCEEDING === '0') {
        await this.makeCall(
          httpModule,
          detail.API_ENDPOINT,
          this.createPayload(detail, tenantData),
          'webhook',
          secret,
          getTimestamp(),
          context,
        ).catch(err => {
          console.log('Error in API_ENDPOINT call', err);
        });
      } else if (detail.CODEBUILD_BUILD_POSTBUILD === '1') {
        // if (detail.CREATE_USER === '1') {
        await this.makeCall(
          httpModule,
          detail.USER_CALLBACK_ENDPOINT.replace('user-callback', 'bootstrap'),
          tenantPayload,
          'service-callback',
          secret,
          getTimestamp(),
          context,
        ).catch(err => {
          console.log(
            `Error in ${detail.USER_CALLBACK_ENDPOINT.replace('user-callback', 'bootstrap')} call`,
            err,
          );
        });
        // }
        await this.makeCall(
          httpModule,
          detail.API_ENDPOINT,
          this.createPayload(detail, tenantData),
          'webhook',
          secret,
          getTimestamp(),
          context,
        ).catch(err => {
          console.log(`Error in ${detail.API_ENDPOINT} call:`, err);
        });
      } else {
        console.log('No call made');
      }
    } catch (e) {
      console.error(e);
      detail.CODEBUILD_BUILD_SUCCEEDING = '0';
      await this.makeCall(
        httpModule,
        detail.API_ENDPOINT,
        this.createPayload(detail, tenantData),
        'webhook',
        secret,
        getTimestamp(),
        context,
      );
    }
  }

  private getHttpModule(endpoint: string): typeof https | typeof http {
    return endpoint.split('://')[0] === 'https' ? https : http;
  }

  private createTenantContextPayload(detail: AnyObject, plan: AnyObject) {
    return JSON.stringify({
      tenant: JSON.parse(detail.tenant),
      plan: plan,
    });
  }

  private createPayload(detail: AnyObject, tenantData: AnyObject) {
    return JSON.stringify({
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
  }

  private createTenantPayload(
    detail: AnyObject,
    tenantData: AnyObject,
    contact: AnyObject,
    secret: string,
  ) {
    return JSON.stringify({
      tenant: tenantData,
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
      // excluding address temporarily because the user tenant service in the new app plane does not support address
      /*  address: {
        address: tenantData.address?.address,
        city: tenantData.address?.city,
        state: tenantData.address?.state,
        zip: tenantData.address?.zip,
        country: tenantData.address?.country,
      }, */
    });
  }

  private makeCall(
    httpModule: AnyObject,
    endpoint: string,
    payload: string,
    name: 'service-callback' | 'webhook',
    secret: string,
    timestamp: number,
    context: string,
  ) {
    console.log('Make call', endpoint, payload, secret, timestamp, context);
    return new Promise((resolve, reject) => {
      const str =
        name === 'service-callback'
          ? `${payload}${timestamp}`
          : `${payload}${context}${timestamp}`;
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

      console.log(`${endpoint} Options: `, options);

      console.log('Endpoint', endpoint);
      const req = httpModule.request(
        endpoint,
        options,
        (res: IncomingMessage) => {
          console.log('statusCode:', res.statusCode);
          res.on('data', chunk => {
            console.log(`BODY: ${endpoint}` + chunk);
          });

          if (res.statusCode !== 204) {
            reject(`Call failed for ${name}`);
            return;
          }
          resolve(`Call succeeded for ${name}`);
        },
      );

      req.on('error', (e: Error) => {
        console.error(e);
        reject(e);
      });

      req.write(payload);
      req.end();
    });
  }
}