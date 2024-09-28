import {authorize} from 'loopback4-authorization';
import {
  AuthenticationBindings,
  STRATEGY,
  authenticate,
} from 'loopback4-authentication';

import {get, getModelSchemaRef, param, post, requestBody} from '@loopback/openapi-v3';
import {inject, service} from '@loopback/core';
import {
  CONTENT_TYPE,
  OPERATION_SECURITY_SPEC,
  STATUS_CODE,
} from '@sourceloop/core';
import {PermissionKey} from '../permissions';
import {TenantHelperService} from '../services';
import {LeadUser} from '@sourceloop/ctrl-plane-tenant-management-service';
import {TenantConfig} from '../models/dtos/tenant-config';
import { Filter } from '@loopback/repository';

export class TenantConfigController {
  constructor(
    @service(TenantHelperService)
    private readonly tenantHelper: TenantHelperService,
  ) {}

  @authorize({
    permissions: [PermissionKey.CreateTenantConfig],
  })
  @authenticate(STRATEGY.BEARER, {
    passReqToCallback: true,
  })
  @post(`/tenant-configs`, {
    description: 'This api posts tenant config.',
    security: OPERATION_SECURITY_SPEC,
    responses: {
      [STATUS_CODE.OK]: {
        description: 'Tenant Config Instance',
        content: {
          [CONTENT_TYPE.JSON]: {schema: getModelSchemaRef(TenantConfig)},
        },
      },
    },
  })
  async createTenantConfig(
    @requestBody({
      content: {
        [CONTENT_TYPE.JSON]: {
          schema: getModelSchemaRef(TenantConfig, {
            title: 'TenantConfig',
          }),
        },
      },
    })
    dto: TenantConfig,
  ): Promise<TenantConfig> {
    return this.tenantHelper.createTenantConfig(dto)
  }
  @authorize({
    permissions: [PermissionKey.ViewTenantConfig],
  })
  @authenticate(STRATEGY.BEARER, {
    passReqToCallback: true,
  })
  @get('/tenant-configs', {
    description: 'This API retrieves tenant configurations.',
    security: OPERATION_SECURITY_SPEC,
    responses: {
      [STATUS_CODE.OK]: {
        description: 'Array of Tenant Config model instances',
        content: {
          [CONTENT_TYPE.JSON]: {
            schema: {
              type: 'array',
              items: getModelSchemaRef(TenantConfig, {
                includeRelations: true,
              }),
            },
          },
        },
      },
    },
  })
  async findTenantConfigs(
  
    @inject(AuthenticationBindings.CURRENT_USER)
    currentUser: LeadUser,
    @param.filter(TenantConfig) filter?: Filter<TenantConfig>,
  ): Promise<TenantConfig[]> {
    const tenantConfig= await this.tenantHelper.getTenantConfig(currentUser.id,filter);
    return tenantConfig;
  }
}
