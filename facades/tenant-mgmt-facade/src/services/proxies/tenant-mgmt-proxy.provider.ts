import {Provider, inject} from '@loopback/core';
import {DataObject, Filter} from '@loopback/repository';
import {getService} from '@loopback/service-proxy';
import {TenantMgmtServiceDataSource} from '../../datasources';
import {
  Invoice,
  Lead,
  Tenant,
  TenantOnboardDTO,
  VerifyLeadResponseDTO,
} from '../../models';
import {ISubscription} from '../../types';
import {ITenant} from './types';
import {TenantMgmtConfig} from '../../models/dtos/tenant-mgmt-config.model';

export interface TenantMgmtProxyService {
  createInvoice(token: string, payload: DataObject<Invoice>): Promise<Invoice>;
  createLead(payload: DataObject<Lead>): Promise<{id: string; key: string}>;
  createLead(payload: DataObject<Lead>): Promise<{id: string; key: string}>;
  createTenant(token: string, payload: TenantOnboardDTO): Promise<Tenant>;
  createTenantConfig(
    token: string,
    payload: TenantMgmtConfig,
  ): Promise<TenantMgmtConfig>;
  getTenantConfig(
    token: string,
    filter?: Filter<TenantMgmtConfig>,
  ): Promise<TenantMgmtConfig[]>;
  createTenantFromLead(
    token: string,
    id: string,
    payload: Omit<TenantOnboardDTO, 'contact'>,
  ): Promise<Tenant>;
  provisionTenant(
    token: string,
    id: string,
    payload: ISubscription,
  ): Promise<void>;
  verifyLead(token: string, id: string): Promise<VerifyLeadResponseDTO>;
  getLeads(token: string, filter: Filter<Lead>): Promise<Lead[]>;
  getTenants(token: string, filter: Filter<Tenant>): Promise<ITenant[]>;
}

export class TenantMgmtProxyServiceProvider
  implements Provider<TenantMgmtProxyService>
{
  constructor(
    @inject('datasources.TenantMgmtService')
    protected dataSource: TenantMgmtServiceDataSource,
  ) {}
  value(): Promise<TenantMgmtProxyService> {
    return getService(this.dataSource);
  }
}
