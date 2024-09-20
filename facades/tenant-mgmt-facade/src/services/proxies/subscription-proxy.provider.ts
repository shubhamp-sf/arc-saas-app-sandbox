import {inject, Provider} from '@loopback/core';
import {AnyObject, Filter} from '@loopback/repository';
import {getService} from '@loopback/service-proxy';
import {SubscriptionServiceDataSource} from '../../datasources';
import {ISubscription} from '../../types';
import {
  BillingCustomerType,
  CustomerDtoType,
  InvoiceDtoType,
  IPlan,
  PaymentSourceDtoType,
  SubscriptionCreationType,
  SubscriptionUpdationType,
  TransactionType,
} from './types';

export interface SubscriptionProxyService {
  findById(
    token: string,
    id: string,
    filter?: Filter<ISubscription> | string,
  ): Promise<ISubscription>;
  create(token: string, body: SubscriptionCreationType): Promise<ISubscription>;
  updateById(
    token: string,
    id: string,
    partialSubscription: SubscriptionUpdationType,
  ): Promise<ISubscription>;
  findPlanById(
    token: string,
    id: string,
    filter?: Filter<IPlan>,
  ): Promise<IPlan>;
  getPlans(token: string, filter?: Filter<IPlan>): Promise<IPlan[]>;
  find(
    token: string,
    filter?: Filter<ISubscription> | string,
  ): Promise<ISubscription[]>;
  expireSoonSubscription(
    token: string,
    filter?: Filter<ISubscription> | string,
  ): Promise<
    {id: string; daysRemainingToExpiry: number; subscriberId: string}[]
  >;
  expiredSubscription(
    token: string,
    days: number,
    filter?: Filter<ISubscription> | string,
  ): Promise<{subscriptionId: string; subscriberId: string}[]>;
  getPlanSizeConfig(
    token: string,
    filter?: Filter<{size: string}> | string,
  ): Promise<{size: string; config: object}[]>;
  getPlanFeatures(
    token: string,
    planId: string,
  ): Promise<{features: AnyObject[]}>;
  createCustomer(
    token: string,
    customerDto: Omit<CustomerDtoType, 'id'>,
    tenantId: string,
  ): Promise<CustomerDtoType>;
  createInvoice(
    token: string,
    invoiceDto: Omit<InvoiceDtoType, 'id' | 'status'>,
  ): Promise<InvoiceDtoType>;
  getCustomer(
    token: string,
    filter?: Filter<BillingCustomerType>,
  ): Promise<{
    customerDetails: CustomerDtoType;
    info: BillingCustomerType;
  }>;
  createPaymentSource(
    token: string,
    paymentSourceDto: PaymentSourceDtoType,
  ): Promise<PaymentSourceDtoType>;
  applyPaymentForInvoice(
    token: string,
    invoiceId: string,
    transactionDto: TransactionType,
  ): Promise<void>;
  webhookBillingPayment(token: string, content: any): Promise<void>;
}

export class SubscriptionProxyServiceProvider
  implements Provider<SubscriptionProxyService>
{
  constructor(
    @inject('datasources.SubscriptionService')
    protected dataSource: SubscriptionServiceDataSource,
  ) {}
  value(): Promise<SubscriptionProxyService> {
    return getService(this.dataSource);
  }
}
