import {Model, model, property} from '@loopback/repository';

@model({
  description: 'DTO for Organization Data',
})
export class OrganizationDataDTO extends Model {
  @property({
    type: 'string',
    required: true,
    description: 'Name of the organization',
  })
  organizationname: string;

  @property({
    type: 'string',
    required: true,
    description: 'Display name of the organization',
  })
  display_name: string;

  @property({
    type: 'string',
 
    description: 'URL to the organization logo',
  })
  logo_url?: string;

  @property({
    type: 'string',
  
    description: 'Primary color of the organization theme',
  })
  primary_color?: string;

  @property({
    type: 'string',
    description: 'Background color of the page',
  })
  page_background?: string;

  @property({
    type: 'string',
    description: 'Background color of the forms',
  })
  form_background?: string;

  @property({
    type: 'string',
    description: 'Color of the links in the organization theme',
  })
  link_color?: string;

  @property({
    type: 'string',
    required: true,
    description: 'Email of the user creating the organization',
  })
  email: string;

  @property({
    type: 'string',
    required: true,
    description: 'Name of the user creating the organization',
  })
  name: string;

  @property({
    type: 'string',
    required: true,
    description: 'The connection for the user (Auth0, etc.)',
  })
  connection: string;

  @property({
    type: 'string',
    required: true,
    description: 'Password for the user creating the organization',
  })
  password: string;

  @property({
    type: 'boolean',
    required: true,
    description: 'Whether the user’s email needs verification',
  })
  verify_email: boolean;

  @property({
    type: 'string',
    description: 'Optional username for the user',
  })
  username?: string;

  @property({
    type: 'string',
    description: 'Optional phone number for the user',
  })
  phone_number?: string;

  constructor(data?: Partial<OrganizationDataDTO>) {
    super(data);
  }
}
