import {inject, intercept, service} from '@loopback/core';
import {post, requestBody} from '@loopback/rest';
import {authorize} from 'loopback4-authorization';
import {PAYMENT_WEBHOOK_VERIFIER} from '../keys';
import {PermissionKey} from '../permissions';
import {BillingHelperService} from '../services/billing-helper.service';
import {
  SubscriptionProxyService,
  TenantMgmtProxyService,
} from '../services/proxies';
import {ISubscription} from '../types';

import {CryptoHelperService} from '@sourceloop/ctrl-plane-tenant-management-service';
export class WebhookPaymentController {
  constructor(
    @service(CryptoHelperService)
    private readonly cryptoHelperService: CryptoHelperService,
    @inject('services.SubscriptionProxyService')
    private readonly subscriptionProxyService: SubscriptionProxyService,
    @inject('services.BillingHelperService')
    private readonly billingHelperService: BillingHelperService,
    @inject('services.TenantMgmtProxyService')
    private readonly tenantMgmtProxyService: TenantMgmtProxyService,
  ) {}

  @authorize({
    permissions: ['*'],
  })
  @intercept(PAYMENT_WEBHOOK_VERIFIER)
  @post('/webhooks/payments')
  async handleWebhook(@requestBody() payload: any): Promise<void> {
    const event = payload.event_type;
    const content = payload.content;

    console.log(
      'webhook inside controller, with payload,',payload
    );
    switch (event) {
      case 'payment_succeeded':
        await this.handlePaymentSucceeded(content);
        break;
      // Handle other events here
      default:
        console.log(`Unhandled event type: ${event}`);
    }
  }

  private async handlePaymentSucceeded(content: any): Promise<void> {
    console.log('handle suceeed payment started');
    const customer = await this.billingHelperService.getCustomer({
      where: {customerId: content.customer.id},
      include: [
        {
          relation: 'invoices', // This includes related invoices
        },
      ],
    });
    console.log('get customer succedd customer=',customer);
    const token = this.cryptoHelperService.generateTempToken({
      id: customer.info.tenantId,
      userTenantId: customer.info.tenantId,
      permissions: [
        PermissionKey.ViewSubscription,
        PermissionKey.ViewPlan,
        PermissionKey.CreateSubscription,
        PermissionKey.CreateInvoice,
        '7029', // view plan sizes
        '7033', // view plan features
      ],
    });
    const subscription = await this.subscriptionProxyService.find(token, {
      where: {subscriberId: customer.info.tenantId},
      include: ['plan'],
    });
    console.log('subscription service succeed, subscription=',subscription);

    if (subscription.length === 0) throw new Error('Suscription not  found');
    const sdto: ISubscription = {
      id: subscription[0].id,
      subscriberId: subscription[0].subscriberId,
      startDate: subscription[0].startDate,
      endDate: subscription[0].endDate,
      status: subscription[0].status,
      planId: subscription[0].planId,
      plan: subscription[0].plan,
      invoiceId: subscription[0].invoiceId,
    };
    console.log(' provision started');
    await this.tenantMgmtProxyService.provisionTenant(
      token,
      customer.info.tenantId,
      sdto,
    );
  }
}
