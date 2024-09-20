import {BindingKey, Interceptor} from '@loopback/context';
import {VerifyFunction} from 'loopback4-authentication';
import {LeadUserWithToken} from './types';

/**
 * Binding key for the lead token verifier.
 */
export const LEAD_TOKEN_VERIFIER = BindingKey.create<
  VerifyFunction.BearerFn<LeadUserWithToken>
>('sf.user.lead.verifier');

export const PAYMENT_WEBHOOK_VERIFIER = BindingKey.create<Interceptor>(
  'sf.webhook.payment.verifier',
);
