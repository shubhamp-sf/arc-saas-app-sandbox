import {model, property, AnyObject} from '@loopback/repository';

@model({
  description: 'DTO for tenant configuration settings',
})
export class TenantConfigDTO {
 

  @property({
    type: 'string',
    description: 'Key of the configuration setting',
    required: true,
  })
  configKey: string;

  @property({
    type: 'object',
    description: 'Value of the configuration setting',
    required: true,
  })
  configValue: AnyObject;
  @property({
    type: 'string',
    description: 'ID of the tenant to which this configuration belongs',
    required: true,
  })
  tenantId: string;

  constructor(data?: Partial<TenantConfigDTO>) {
    Object.assign(this, data);
  }
}
