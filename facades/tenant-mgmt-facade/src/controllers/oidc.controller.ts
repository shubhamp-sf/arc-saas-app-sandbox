import {inject, service} from '@loopback/core';
import {
  get,
  getModelSchemaRef,
  param,
  post,
  requestBody,
  response,
} from '@loopback/openapi-v3';

import {authorize} from 'loopback4-authorization';

import {TenantHelperService} from '../services';

import {OrganizationDataDTO} from '../models/dtos/organizationDetailDto';

export class OIDCController {
  constructor(
    @service(TenantHelperService)
    private readonly tenantHelper: TenantHelperService,
  ) {}

  @authorize({
    permissions: ['*'],
  })
  @post('/organizations')
  @response(200, {
    description: 'Organization creation success',
  })
  async createOrganization(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(OrganizationDataDTO, {
            title: 'NewOrganization',
          }),
        },
      },
    })
    organizationData: OrganizationDataDTO,
  ) {
    try {
      const organization = {
        name: organizationData.organizationname,
        display_name: organizationData.display_name,
        logo_url: organizationData.logo_url,
        primary_color: organizationData.primary_color,
        page_background: organizationData.page_background,
        form_background: organizationData.form_background,
        link_color: organizationData.link_color,
      };
      const organizationDetails =
        await this.tenantHelper.createOrganization(organization);
      const user = {
        email: organizationData.email,
        name: organizationData.name,
        connection: organizationData.connection,
        password: organizationData.password,
        verify_email: organizationData.verify_email,
        username: organizationData.username,
        phone_number: organizationData.phone_number,
      };
      const userDetails = await this.tenantHelper.createUser(user);
      const organizationId = organizationDetails.data.id;
      const userId = userDetails.data.user_id;
      const response = await this.tenantHelper.addMemberToOrganization(
        organizationId,
        userId,
      );
    } catch (error) {
      return {error: error.message};
    }
  }
}
