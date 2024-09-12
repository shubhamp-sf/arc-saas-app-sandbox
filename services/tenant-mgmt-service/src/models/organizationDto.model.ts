import {Model, model, property} from '@loopback/repository';

@model({
  description: 'DTO for creating an organization',
})
export class OrganizationDTO extends Model {
  @property({
    type: 'string',
    required: true,
    description: 'Organization name',
  })
  name: string;

  @property({
    type: 'string',
    required: true,
    description: 'Display name of the organization',
  })
  display_name: string;

  @property({
    type: 'string',
    required: true,
    description: 'URL of the organization logo',
  })
  logo_url?: string;

  @property({
    type: 'string',
    required: true,  
    description: 'Primary color for the organization',
  })
  primary_color?: string;

  @property({
    type: 'string',
    description: 'Background color for the page',
  })
  page_background?: string;

  @property({
    type: 'string',
    description: 'Background color for forms',
  })
  form_background?: string;

  @property({
    type: 'string',
    description: 'Link color for the organization',
  })
  link_color?: string;

  constructor(data?: Partial<OrganizationDTO>) {
    super(data);
  }
}
