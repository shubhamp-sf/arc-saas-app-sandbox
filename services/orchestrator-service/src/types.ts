import {BindingKey} from '@loopback/core';
import {AnyObject} from '@loopback/repository';

export namespace Bindings {
  export const TENANT_REGISTRATION_HANDLER = BindingKey.create<
    TypicalEventHandler<TenantRegistrationDetails>
  >(`saas-app.providers.tenant-registration-handler`);
}

export type TypicalEventHandler<T extends AnyObject = {}> = (
  body: T,
) => Promise<void>;

export type TenantRegistrationDetails = {
  company: {
    name: string;
  };
  customer: {
    firstName: string;
    lastName: string;
    email: string;
    address: string;
    zip: string;
    country: string;
  };
  appConfig: {
    preferredSubdomain: string;
  };
  plan: {
    identifier: string;
  };
};
