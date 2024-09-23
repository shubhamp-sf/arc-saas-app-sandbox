import {BindingScope, inject, injectable, service} from '@loopback/core';
import {Filter} from '@loopback/repository';
import {HttpErrors, Request, RestBindings} from '@loopback/rest';
import {CryptoHelperService} from '@sourceloop/ctrl-plane-tenant-management-service';
import {
  BillingCustomerType,
  CustomerDtoType,
  InvoiceDtoType,
  PaymentSourceDtoType,
  SubscriptionProxyService,
  TransactionType,
} from './proxies';
@injectable({scope: BindingScope.TRANSIENT})
export class BillingHelperService {
  constructor(
    @inject('services.SubscriptionProxyService')
    private readonly subscriptionProxyService: SubscriptionProxyService,
    @service(CryptoHelperService)
    private readonly cryptoHelperService: CryptoHelperService,
    @inject(RestBindings.Http.REQUEST)
    private readonly request: Request,
  ) {}

  async createCustomer(
    tenantId: string,
    customerDto: Omit<CustomerDtoType, 'id'>,
    token?: string,
  ): Promise<CustomerDtoType> {
    token = token ?? this.request.headers.authorization?.split(' ')[1];
    if (!token) {
      throw new HttpErrors.Unauthorized(
        'Authorization header not present. [Create Customer]',
      );
    }
    return this.subscriptionProxyService.createCustomer(
      token,
      customerDto,
      tenantId,
    );
  }

  async createInvoice(
    invoiceDto: Omit<InvoiceDtoType, 'id'>,
    token?: string,
  ): Promise<InvoiceDtoType> {
    token = token ?? this.request.headers.authorization?.split(' ')[1];
    if (!token) {
      throw new HttpErrors.Unauthorized(
        'Authorization header not present [Create Invoice]',
      );
    }
    return this.subscriptionProxyService.createInvoice(token, invoiceDto);
  }
  async getCustomer(filter: Filter<BillingCustomerType>): Promise<{
    customerDetails: CustomerDtoType;
    info: BillingCustomerType;
  }> {
    const token = this.request.headers.authorization?.split(' ')[1];
    if (!token) {
      throw new HttpErrors.Unauthorized('Authorization header not present');
    }

    return this.subscriptionProxyService.getCustomer(token, filter);
  }

  async createPaymentSource(
    paymentDetails: PaymentSourceDtoType,
  ): Promise<PaymentSourceDtoType> {
    const token = this.request.headers.authorization?.split(' ')[1];
    if (!token) {
      throw new HttpErrors.Unauthorized('Authorization header not present');
    }
    return this.subscriptionProxyService.createPaymentSource(
      token,
      paymentDetails,
    );
  }

  async applyPaymentForInvoice(
    invoiceId: string,
    transactionDto: TransactionType,
  ): Promise<void> {
    const token = this.request.headers.authorization?.split(' ')[1];
    if (!token) {
      throw new HttpErrors.Unauthorized('Authorization header not present');
    }
    return this.subscriptionProxyService.applyPaymentForInvoice(
      token,
      invoiceId,
      transactionDto,
    );
  }
}
