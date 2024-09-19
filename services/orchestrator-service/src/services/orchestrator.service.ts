import {injectable, BindingScope, inject} from '@loopback/core';
import {AnyObject} from '@loopback/repository';
import {
  DefaultEventTypes,
  OrchestratorServiceBindings,
  OrchestratorServiceInterface,
  TenantDeploymentHandler,
  TenantDeprovisioningHandler,
  TenantProvisioningFailureHandler,
  TenantProvisioningHandler,
  TenantProvisioningSuccessHandler,
} from '@arc-saas/orchestrator-service';
import {Bindings, TypicalEventHandler} from '../types';

export interface AWSEventBridgeInterface {
  version: string;
  id: string;
  // eslint-disable-next-line @typescript-eslint/naming-convention
  'detail-type': DefaultEventTypes;
  source: string;
  account: string;
  time: string;
  region: string;
  resources: never[];
  detail: Record<string, string | AnyObject | number>;
}

enum ExtraEvents {
  TENANT_REGISTRATION = 'TENANT_REGISTRATION',
}

type EventTypes = DefaultEventTypes | ExtraEvents;

@injectable({scope: BindingScope.TRANSIENT})
export class OrchestratorService implements OrchestratorServiceInterface {
  constructor(
    @inject(OrchestratorServiceBindings.TENANT_PROVISIONING_HANDLER)
    private handleTenantProvisioning: TenantProvisioningHandler,
    @inject(OrchestratorServiceBindings.TENANT_DEPROVISIONING_HANDLER)
    private handleTenantDeprovisioning: TenantDeprovisioningHandler,
    @inject(OrchestratorServiceBindings.TENANT_PROVISIONING_SUCCESS_HANDLER)
    private handleTenantProvisioningSuccess: TenantProvisioningSuccessHandler,
    @inject(OrchestratorServiceBindings.TENANT_PROVISIONING_FAILURE_HANDLER)
    private handleTenantProvisioningFailure: TenantProvisioningFailureHandler,
    @inject(OrchestratorServiceBindings.TENANT_DEPLOYMENT_HANDLER)
    private handleTenantDeployment: TenantDeploymentHandler,
    @inject(Bindings.TENANT_REGISTRATION_HANDLER)
    private handleTenantRegistration: TypicalEventHandler,
  ) {}

  handleEvent(
    eventType: EventTypes,
    eventBody: AWSEventBridgeInterface,
  ): Promise<void> {
    switch (eventType) {
      case DefaultEventTypes.TENANT_PROVISIONING:
        return this.handleTenantProvisioning(eventBody.detail);
      case DefaultEventTypes.TENANT_DEPROVISIONING:
        return this.handleTenantDeprovisioning(eventBody.detail);
      case DefaultEventTypes.TENANT_PROVISIONING_SUCCESS:
        return this.handleTenantProvisioningSuccess(eventBody.detail);
      case DefaultEventTypes.TENANT_PROVISIONING_FAILURE:
        return this.handleTenantProvisioningFailure(eventBody.detail);
      case DefaultEventTypes.TENANT_DEPLOYMENT:
        return this.handleTenantDeployment(eventBody.detail);
      case ExtraEvents.TENANT_REGISTRATION:
        return this.handleTenantRegistration(eventBody.detail);
      default:
        throw new Error(`Unsupported event type: ${eventType}`);
    }
  }
}
