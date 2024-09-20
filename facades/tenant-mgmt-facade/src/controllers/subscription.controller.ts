import {inject} from '@loopback/context';
import {service} from '@loopback/core';
import {getModelSchemaRef, post, requestBody} from '@loopback/openapi-v3';
import {
  CONTENT_TYPE,
  OPERATION_SECURITY_SPEC,
  STATUS_CODE,
} from '@sourceloop/core';
import {
  authenticate,
  AuthenticationBindings,
  STRATEGY,
} from 'loopback4-authentication';
import {authorize} from 'loopback4-authorization';
import {CheckBillingSubscriptionsDTO, Tenant} from '../models';
import {TenantHelperService} from '../services';
import {LeadUser} from '../types';

const basePath = '/subscriptions';

export class SubscriptionController {
  constructor(
    @service(TenantHelperService)
    private readonly tenantHelper: TenantHelperService,
  ) {}

  @authorize({
    permissions: ['*'],
  })
  @authenticate(STRATEGY.BEARER, {
    passReqToCallback: true,
  })
  @post(`${basePath}/send-reminders`, {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      [STATUS_CODE.OK]: {
        description: 'Check billing subscription response',
        content: {
          [CONTENT_TYPE.JSON]: {schema: getModelSchemaRef(Tenant)},
        },
      },
    },
  })
  async checkBillingSubscriptions(
    @inject(AuthenticationBindings.CURRENT_USER)
    currentUser: LeadUser,
    @requestBody({
      content: {
        [CONTENT_TYPE.JSON]: {
          schema: getModelSchemaRef(CheckBillingSubscriptionsDTO, {
            title: 'CheckBillingSubscriptionsDTO',
          }),
        },
      },
    })
    dto: CheckBillingSubscriptionsDTO,
  ): Promise<void> {
    this.tenantHelper
      .checkBillingSubscriptions(currentUser.id, dto)
      .catch(err => {
        console.error(err); //NOSONAR
      });
  }
}
