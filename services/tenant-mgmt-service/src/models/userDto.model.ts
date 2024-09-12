import {Model, model, property} from '@loopback/repository';

@model({
  description: 'DTO for creating a user',
})
export class UserDTO extends Model {
  @property({
    type: 'string',
    required: true,
    description: 'User email address',
  })
  email: string;

  @property({
    type: 'string',
    required: true,
    description: 'Full name of the user',
  })
  name: string;

  @property({
    type: 'string',
    required: true,
    description: 'Connection type (e.g., database, social)',
  })
  connection: string;

  @property({
    type: 'string',
    required: true,
    description: 'User password',
  })
  password: string;

  @property({
    type: 'boolean',
    required: true,
    description: 'Whether to verify the user\'s email',
  })
  verify_email: boolean;

  @property({
    type: 'string',
    description: 'Optional username',
  })
  username?: string;

  @property({
    type: 'string',
    description: 'Optional phone number',
  })
  phone_number?: string;

  constructor(data?: Partial<UserDTO>) {
    super(data);
  }
}
