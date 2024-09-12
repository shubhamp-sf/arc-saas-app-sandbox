import {service, inject} from '@loopback/core';
import {
  param,
  post,
  requestBody,
  response,
  RestBindings,
  HttpErrors,
  getModelSchemaRef,
} from '@loopback/rest';
import {authorize} from 'loopback4-authorization';
import {STATUS_CODE, CONTENT_TYPE, ILogger, LOGGER} from '@sourceloop/core';

import {OrganizationDTO} from '../models/organizationDto.model';
import {UserDTO} from '../models/userDto.model';
import {AddMemberDTO} from '../models/memberDto';
import {Auth0Service} from '../services/oidc-service';

export class OrganizationController {
  constructor(
    @service(Auth0Service)
    private readonly auth0Service: Auth0Service,
    @inject(RestBindings.Http.REQUEST)
    private readonly request: Request,
    @inject(LOGGER.LOGGER_INJECT)
    private logger: ILogger,
  ) {}

  @authorize({permissions: ['*']})
  @post('/organizations')
  @response(STATUS_CODE.OK, {
    description: 'Organization creation ',
    content: {
      [CONTENT_TYPE.JSON]: {schema: getModelSchemaRef(OrganizationDTO)},
    },
  })
  async createOrganization(
    @requestBody({
      content: {
        [CONTENT_TYPE.JSON]: {
          schema: getModelSchemaRef(OrganizationDTO, {
            title: 'CreateOrganization',
          }),
        },
      },
    })
    organizationData: OrganizationDTO,
  ) {
    try {
      const result =
        await this.auth0Service.createOrganization(organizationData);
      return result;
    } catch (error) {
      this.logger.error(`Error creating organization: ${error.message}`);
      throw new HttpErrors.InternalServerError('Error creating organization');
    }
  }

  @authorize({permissions: ['*']})
  @post('/users')
  @response(STATUS_CODE.OK, {
    description: 'User creation',
    content: {[CONTENT_TYPE.JSON]: {schema: getModelSchemaRef(UserDTO)}},
  })
  async createUser(
    @requestBody({
      content: {
        [CONTENT_TYPE.JSON]: {
          schema: getModelSchemaRef(UserDTO, {
            title: 'CreateUser',
          }),
        },
      },
    })
    userData: UserDTO,
  ) {
    try {
      const result = await this.auth0Service.createUser(userData);
      return result;
    } catch (error) {
      this.logger.error(`Error creating user: ${error.message}`);
      throw new HttpErrors.InternalServerError('Error creating user');
    }
  }

  @authorize({permissions: ['*']})
  @post('/organizations/{id}/members')
  @response(STATUS_CODE.OK, {
    description: 'Member addition success',
    content: {[CONTENT_TYPE.JSON]: {schema: getModelSchemaRef(AddMemberDTO)}},
  })
  async addMember(
    @param.path.string('id') organizationId: string,
    @requestBody({
      content: {
        [CONTENT_TYPE.JSON]: {
          schema: getModelSchemaRef(AddMemberDTO, {
            title: 'AddMemberToOrganization',
          }),
        },
      },
    })
    memberData: AddMemberDTO,
  ) {
    try {
      const result = await this.auth0Service.addMemberToOrganization(
        organizationId,
        memberData.userId,
      );
      return result;
    } catch (error) {
      this.logger.error(
        `Error adding member to organization: ${error.message}`,
      );
      throw new HttpErrors.InternalServerError(
        'Error adding member to organization',
      );
    }
  }
}
