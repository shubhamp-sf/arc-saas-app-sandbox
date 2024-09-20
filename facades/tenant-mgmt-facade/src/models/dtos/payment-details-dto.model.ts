import {model, property} from '@loopback/repository';

@model()
export class PaymentDetailsDTO {
  @property({
    type: 'string',
    required: true,
    name: 'number',
  })
  cardNumber: string;

  @property({
    type: 'number',
    required: true,
    name: 'expiry_month',
  })
  expiryMonth: number;

  @property({
    type: 'number',
    required: true,
    name: 'expiry_year',
  })
  expiryYear: number;

  @property({
    type: 'string',
    required: true,
    name: 'cvv',
  })
  cvv: string;
}
