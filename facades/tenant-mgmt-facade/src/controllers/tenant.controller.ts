import {authorize} from 'loopback4-authorization';
import {STRATEGY, authenticate} from 'loopback4-authentication';
import {getModelSchemaRef, post, requestBody} from '@loopback/openapi-v3';
import {
  CONTENT_TYPE,
  OPERATION_SECURITY_SPEC,
  STATUS_CODE,
} from '@sourceloop/core';
import {PermissionKey} from '../permissions';
import {CreateTenantWithPlanDTO, Tenant} from '../models';
import {service} from '@loopback/core';
import {TenantHelperService} from '../services';

export class TenantController {
  constructor(
    @service(TenantHelperService)
    private readonly tenantHelper: TenantHelperService,
  ) {}
  @authorize({
    permissions: [PermissionKey.CreateTenant],
  })
  @authenticate(STRATEGY.BEARER, {
    passReqToCallback: true,
  })
  @post(`/tenants`, {
    description:
      'This api creates a tenant with a contact, so it also expects contact info in the payload. The start of subscription is the time of creation of tenant and end date of plan depends on the duration of plan.',
    security: OPERATION_SECURITY_SPEC,
    responses: {
      [STATUS_CODE.OK]: {
        description: 'Tenant model instance',
        content: {
          [CONTENT_TYPE.JSON]: {schema: getModelSchemaRef(Tenant)},
        },
      },
    },
  })
  async onboard(
    @requestBody({
      content: {
        [CONTENT_TYPE.JSON]: {
          schema: getModelSchemaRef(CreateTenantWithPlanDTO, {
            title: 'CreateTenantDTO',
            exclude: [],
          }),
        },
      },
    })
    dto: CreateTenantWithPlanDTO,
  ): Promise<Tenant> {
    return this.tenantHelper.createTenant(dto);
  }
}
