import {inject, lifeCycleObserver, LifeCycleObserver} from '@loopback/core';
import {juggler} from '@loopback/repository';
import {CONTENT_TYPE} from '@sourceloop/core';
const webookTokenKey = '{token}';
const tokenKey = 'Bearer {token}';
const config = {
  name: 'SubscriptionService',
  connector: 'rest',
  baseURL: '',
  crud: false,
  options: {
    baseUrl: process.env.SUBSCRIPTION_SERVICE_URL as string,
    headers: {
      accept: CONTENT_TYPE.JSON,
      ['content-type']: CONTENT_TYPE.JSON,
    },
  },
  operations: [
    {
      template: {
        method: 'GET',
        url: '/subscriptions/{id}',
        headers: {
          Authorization: tokenKey,
        },
        query: {
          filter: '{filter}',
        },
      },
      functions: {
        findById: ['token', 'id', 'filter'],
      },
    },
    {
      template: {
        method: 'GET',
        url: '/subscriptions',
        headers: {
          Authorization: tokenKey,
        },
        query: {
          filter: '{filter}',
        },
      },
      functions: {
        find: ['token', 'filter'],
      },
    },
    {
      template: {
        method: 'GET',
        url: '/subscriptions/expire-soon',
        headers: {
          Authorization: tokenKey,
        },
        query: {
          filter: '{filter}',
        },
      },
      functions: {
        expireSoonSubscription: ['token', 'filter'],
      },
    },
    {
      template: {
        method: 'GET',
        url: '/subscriptions/expired',
        headers: {
          Authorization: tokenKey,
        },
        query: {
          filter: '{filter}',
          days: '{days}',
        },
      },
      functions: {
        expiredSubscription: ['token', 'days', 'filter'],
      },
    },
    {
      template: {
        method: 'PATCH',
        url: '/subscriptions/{id}',
        headers: {
          Authorization: tokenKey,
        },
        body: '{partialSubscription}',
      },
      functions: {
        updateById: ['token', 'id', 'partialSubscription'],
      },
    },
    {
      template: {
        method: 'GET',
        url: '/plans/{id}',
        headers: {
          Authorization: tokenKey,
        },
        query: {
          filter: '{filter}',
        },
      },
      functions: {
        findPlanById: ['token', 'id', 'filter'],
      },
    },
    {
      template: {
        method: 'GET',
        url: '/plans',
        headers: {
          Authorization: tokenKey,
        },
        query: {
          filter: '{filter}',
        },
      },
      functions: {
        getPlans: ['token', 'filter'],
      },
    },
    {
      template: {
        method: 'GET',
        url: '/plan-sizes',
        headers: {
          Authorization: `{token}`,
        },
        query: {
          filter: '{filter}',
        },
      },
      functions: {
        getPlanSizeConfig: ['token', 'filter'],
      },
    },
    {
      template: {
        method: 'GET',
        url: '/plans/{planId}/features',
        headers: {
          Authorization: `{token}`,
        },
      },
      functions: {
        getPlanFeatures: ['token', 'planId'],
      },
    },
    {
      template: {
        method: 'POST',
        url: '/subscriptions',
        headers: {
          Authorization: tokenKey,
        },
        body: '{body}',
      },
      functions: {
        create: ['token', 'body'],
      },
    },
    {
      template: {
        method: 'POST',
        url: '/billing-customer',
        headers: {
          Authorization: tokenKey,
          tenantId: '{tenantId}',
        },
        body: '{customerDto}',
      },
      functions: {
        createCustomer: ['token', 'customerDto', 'tenantId'],
      },
    },
    {
      template: {
        method: 'POST',
        url: '/billing-invoice',
        headers: {
          Authorization: tokenKey,
        },
        body: '{invoiceDto}',
      },
      functions: {
        createInvoice: ['token', 'invoiceDto'],
      },
    },
    {
      template: {
        method: 'POST',
        url: '/billing-payment-source',
        headers: {
          Authorization: tokenKey,
        },
        body: '{paymentSourceDto}',
      },
      functions: {
        createPaymentSource: ['token', 'paymentSourceDto'],
      },
    },
    {
      template: {
        method: 'GET',
        url: '/billing-customer',
        headers: {
          Authorization: tokenKey,
        },
        query: {
          filter: '{filter}',
        },
      },
      functions: {
        getCustomer: ['token', 'filter'],
      },
    },
    {
      template: {
        method: 'POST',
        url: '/billing-invoice/{invoiceId}/payments',
        headers: {
          Authorization: tokenKey,
        },
        body: '{transactionDto}',
      },
      functions: {
        applyPaymentForInvoice: ['token', 'invoiceId', 'transactionDto'],
      },
    },
    {
      template: {
        method: 'POST',
        url: '/webhooks/billing-payment',
        headers: {
          Authorization: webookTokenKey,
        },
        body: '{content}',
      },
      functions: {
        webhookBillingPayment: ['token', 'content'],
      },
    },
  ],
};

// Observe application's life cycle to disconnect the datasource when
// application is stopped. This allows the application to be shut down
// gracefully. The `stop()` method is inherited from `juggler.DataSource`.
// Learn more at https://loopback.io/doc/en/lb4/Life-cycle.html
@lifeCycleObserver('datasource')
export class SubscriptionServiceDataSource
  extends juggler.DataSource
  implements LifeCycleObserver
{
  static readonly dataSourceName = 'SubscriptionService';
  static readonly defaultConfig = config;

  constructor(
    @inject('datasources.config.SubscriptionService', {optional: true})
    dsConfig: object = config,
  ) {
    super(dsConfig);
  }
}
