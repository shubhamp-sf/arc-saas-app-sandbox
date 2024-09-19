import {Model, model, property} from '@loopback/repository';

@model({
  description:
    'Model describing payload used to create and onboard a tenant from external marketplaces.',
})
export class TenantRegistrationExternalDTO extends Model {
  @property({
    type: 'object',
    description: 'Customer details for the tenant registration',
    jsonSchema: {
      type: 'object',
      properties: {
        firstName: {type: 'string'},
        lastName: {type: 'string'},
        email: {type: 'string'},
        address: {type: 'string'},
        zip: {type: 'string'},
        country: {type: 'string'},
      },
      required: ['firstName', 'lastName', 'email', 'address', 'zip', 'country'],
    },
  })
  customer: {
    firstName: string;
    lastName: string;
    email: string;
    address: string;
    zip: string;
    country: string;
  };

  @property({
    type: 'object',
    description: 'Company details for the tenant registration',
    jsonSchema: {
      type: 'object',
      properties: {
        name: {type: 'string'},
      },
      required: ['name'],
    },
  })
  company: {
    name: string;
  };

  @property({
    type: 'object',
    description: 'app configuration for the tenant registration',
    jsonSchema: {
      type: 'object',
      properties: {
        preferredSubdomain: {type: 'string'},
      },
      required: ['preferredSubdomain'],
    },
  })
  appConfig: {
    preferredSubdomain: string;
  };

  @property({
    type: 'object',
    description: 'plan details for the tenant registration',
    jsonSchema: {
      type: 'object',
      properties: {
        identifier: {type: 'string'},
      },
      required: ['identifier'],
    },
  })
  plan: {
    identifier: string;
  };

  constructor(data?: Partial<TenantRegistrationExternalDTO>) {
    super(data);
  }
}
