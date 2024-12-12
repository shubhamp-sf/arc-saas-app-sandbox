import {getJsonSchema} from '@loopback/openapi-v3';
import {AnyObject, Model, model, property} from '@loopback/repository';
import { User } from '@sourceloop/user-tenant-service';
import { UserDto } from './user-dto.model';

@model({
  description: 'model describing payload for IDP controller',
})
export class IdpDetailsDTO extends UserDto {
  @property({
    type: 'object',
    description: 'Tenat object',
    jsonSchema: getJsonSchema(Object),
  })
  tenant: AnyObject;

  constructor(data?: Partial<IdpDetailsDTO>) {
    super(data);
  }
}
