// import { TenantStatus } from "tenant-management-service";
import {TenantStatus} from '../../enum';
import {Address, Contact, Lead, Resource} from '../../models';
import {IPlan} from '../../types';

export {IPlan} from './../../types';
export interface ISubscription {
  deleted?: boolean;
  deletedOn?: Date;
  deletedBy?: string;
  createdOn?: Date;
  modifiedOn?: Date;
  createdBy?: string;
  modifiedBy?: string;
  id: string;
  subscriberId: string;
  startDate: string;
  endDate: string;
  status: number;
  planId: string;
  plan?: IPlan;
}

export interface ITenant {
  deleted?: boolean;
  deletedOn?: Date;
  deletedBy?: string;
  createdOn?: Date;
  modifiedOn?: Date;
  createdBy?: string;
  modifiedBy?: string;
  id: string;
  name: string;
  status: TenantStatus;
  key: string;
  spocUserId?: string;
  domains: string[];
  contacts: Contact[];
  resources: Resource[];
  leadId?: string;
  addressId: string;
  lead?: Lead;
  address?: Address;
}

export type SubscriptionCreationType = Omit<
  ISubscription,
  | 'id'
  | 'deleted'
  | 'deletedOn'
  | 'deletedBy'
  | 'createdOn'
  | 'modifiedOn'
  | 'createdBy'
  | 'modifiedBy'
  | 'plan'
  | 'startDate'
  | 'endDate'
>;

export type SubscriptionUpdationType = Partial<
  Omit<
    ISubscription,
    | 'id'
    | 'deleted'
    | 'deletedOn'
    | 'deletedBy'
    | 'createdOn'
    | 'modifiedOn'
    | 'createdBy'
    | 'modifiedBy'
    | 'plan'
  >
>;

export type SubscriptionBulkUpdationType = Partial<
  Omit<
    ISubscription,
    | 'id'
    | 'deleted'
    | 'deletedOn'
    | 'deletedBy'
    | 'createdOn'
    | 'modifiedOn'
    | 'createdBy'
    | 'modifiedBy'
    | 'plan'
  >
>;

export interface IBillingCycle {
  deleted: boolean;
  deletedOn?: string;
  deletedBy?: string;
  createdOn: string;
  modifiedOn?: string;
  createdBy: string;
  modifiedBy?: string;
  id: string;
  cycleName: string;
  duration: number;
  durationUnit: string;
  description: string;
}

export interface ICurrency {
  id: string;
  currencyCode: string;
  currencyName: string;
  symbol: string;
  country: string;
}

export interface IMetaData {
  pipelineName: string;
}
