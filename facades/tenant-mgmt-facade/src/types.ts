export type BaseUser = {
  id: string;
};

export type LeadUser = {
  userTenantId: string;
  email: string;
} & BaseUser;

export type LeadUserWithToken = {
  token: string;
} & LeadUser;

import {IServiceConfig} from '@sourceloop/core';

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

// sonarignore:start
export interface ITenantManagementServiceConfig extends IServiceConfig {
  //do nothing
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

export interface IPlan {
  deleted?: boolean;
  deletedOn?: Date;
  deletedBy?: string;
  createdOn?: Date;
  modifiedOn?: Date;
  createdBy?: string;
  modifiedBy?: string;
  id: string;
  name: string;
  description: string;
  price: number;
  currencyId: string;
  metaData: IMetaData;
  tier: string;
  size?: string;
  billingCycleId: string;
  billingCycle?: IBillingCycle;
  currency?: ICurrency;
  sizeConfig?: object;
  features?: object;
}

export interface IMetaData {
  pipelineName: string;
}

export interface IPlanItem {
  deleted?: boolean;
  deletedOn?: string;
  deletedBy?: string;
  createdOn?: string;
  modifiedOn?: string;
  createdBy?: string;
  modifiedBy?: string;
  id: string;
  name: string;
  planItemType: string;
  value: IValue;
  planId?: string;
}

export interface IValue {
  name: string;
  value: number | string | boolean;
}

export interface OrganizationDetails {
  data: {
    id: string;
    branding?: {
      logo_url?: string;
      colors?: {
        page_background?: string;
        primary?: string;
      };
    };
    display_name?: string;
    name?: string;
  };
}
export interface IOrganization {
  name: string;
  display_name: string;
  logo_url?: string;
  primary_color?: string;
  page_background?: string;
  form_background?: string;
  link_color?: string;
}
export interface IUser {
  email: string;
  name: string;
  connection: string;
  password: string;
  verify_email: boolean;
  username?: string;
  phone_number?: string;
}
export interface IMember {
  userId: string;
}

export interface Identity {
  connection: string;
  user_id: string;
  provider: string;
  isSocial: boolean;
}

export interface UserDetailsData {
  created_at: string;
  email: string;
  email_verified: boolean;
  identities: Identity[];
  name: string;
  nickname: string;
  picture: string;
  updated_at: string;
  user_id: string;
}

export interface UserDetails {
  data: UserDetailsData;
  headers: Record<string, any>;
  status: number;
  statusText: string;
}
