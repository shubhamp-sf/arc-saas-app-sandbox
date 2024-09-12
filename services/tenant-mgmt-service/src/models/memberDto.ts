import {Model, model, property} from '@loopback/repository';

@model({
  description: 'DTO for adding a member to an organization',
})
export class AddMemberDTO extends Model {
  @property({
    type: 'string',
    required: true,
    description: 'User ID to be added to the organization',
  })
  userId: string;

  constructor(data?: Partial<AddMemberDTO>) {
    super(data);
  }
}
