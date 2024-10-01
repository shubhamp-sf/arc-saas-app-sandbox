import {injectable, BindingScope, Provider} from '@loopback/core';
import {signPayload} from './utils';
import axios from 'axios';
import {TenantRegistrationDetails, TypicalEventHandler} from '../types';

@injectable({scope: BindingScope.TRANSIENT})
export class TenantRegistrationProvider
  implements Provider<TypicalEventHandler<TenantRegistrationDetails>>
{
  constructor() {}

  value() {
    return async (body: TenantRegistrationDetails) => this.handler(body);
  }

  private async handler(detail: TenantRegistrationDetails): Promise<void> {
    console.log('Tenant Registration: ', detail);

    const payload = detail;
    const signature = signPayload(payload);

    try {
      const facadeHost = process.env.TENANT_FACADE_BASE;
      if (!facadeHost) {
        throw new Error('TENANT_FACADE_BASE not set');
      }
      const response = await axios.post(
        facadeHost + '/external/tenants',
        payload,
        {
          headers: {
            'X-Signature': signature,
          },
        },
      );

      console.log('Tenant registration request successful:', response.data);
    } catch (error) {
      console.error(
        'Tenant registration request failed:',
        error?.response?.data ?? error,
      );
    } finally {
      console.log('Tenant registration request completed');
    }
  }
}
