import {
  Interceptor,
  InvocationContext,
  Provider,
  Setter,
  ValueOrPromise,
  inject,
  service,
} from '@loopback/core';
import {HttpErrors, RequestContext} from '@loopback/rest';
import {ILogger, LOGGER} from '@sourceloop/core';
import {SYSTEM_USER} from '@sourceloop/ctrl-plane-tenant-management-service';
import {AuthenticationBindings, IAuthUser} from 'loopback4-authentication';
import {PermissionKey} from '../permissions';
import {SubscriptionProxyService} from '../services/proxies';

import {CryptoHelperService} from '@sourceloop/ctrl-plane-tenant-management-service';

const dumyUserId = '88a0a51e-12f7-489b-a308-068849dc2972';

export class PaymentWebhookVerifierProvider implements Provider<Interceptor> {
  constructor(
    @inject(LOGGER.LOGGER_INJECT)
    private readonly logger: ILogger,
    @inject.setter(AuthenticationBindings.CURRENT_USER)
    private readonly setCurrentUser: Setter<IAuthUser>,
    @inject(SYSTEM_USER)
    private readonly systemUser: IAuthUser,
    @service(CryptoHelperService)
    private readonly cryptoHelperService: CryptoHelperService,
    @inject('services.SubscriptionProxyService')
    private readonly subscriptionProxyService: SubscriptionProxyService,
  ) {}

  value() {
    return this.intercept.bind(this);
  }

  async intercept<T>(
    invocationCtx: InvocationContext,
    next: () => ValueOrPromise<T>,
  ) {
    const {request} = invocationCtx.parent as RequestContext;

    const authHeader = request.headers['authorization'];
    const username = process.env.WEBHOOK_USERNAME;
    const password = process.env.WEBHOOK_PASSWORD;
    const expectedAuthHeader =
      'Basic ' + Buffer.from(`${username}:${password}`).toString('base64');

    try {
      if (!authHeader || authHeader !== expectedAuthHeader) {
        throw new HttpErrors.Unauthorized('Invalid authorization.');
      }
      console.log(
        'webhook interceptor of tenant management facade called for invoice',
        request.body.content.invoice.id,
      );
      await this.subscriptionProxyService.webhookBillingPayment(
        authHeader,
        request.body,
      );
      // Generate or retrieve a new token
      const newToken =
        'Bearer ' +
        this.cryptoHelperService.generateTempToken({
          id: dumyUserId,
          userTenantId: dumyUserId,
          permissions: [
            PermissionKey.ViewSubscription,
            PermissionKey.ViewPlan,
            PermissionKey.CreateSubscription,
            PermissionKey.CreateInvoice,
            PermissionKey.CreateBillingCustomer,
            PermissionKey.CreateBillingPaymentSource,
            PermissionKey.CreateBillingInvoice,
            PermissionKey.GetBillingCustomer,
            PermissionKey.GetBillingPaymentSource,
            PermissionKey.GetBillingInvoice,
            PermissionKey.UpdateBillingCustomer,
            PermissionKey.UpdateBillingPaymentSource,
            PermissionKey.UpdateBillingInvoice,
            PermissionKey.DeleteBillingCustomer,
            PermissionKey.DeleteBillingPaymentSource,
            PermissionKey.DeleteBillingInvoice,
          ],
        }); // Replace this with your token generation logic

      // Assign the new token to the authorization header
      request.headers['authorization'] = newToken;

      // Optionally log the new token for debugging
      this.logger.info('New token assigned:', newToken);
    } catch (e) {
      this.logger.error(e);
      throw new HttpErrors.Unauthorized();
    }

    this.setCurrentUser(this.systemUser);
    return next();
  }
}
