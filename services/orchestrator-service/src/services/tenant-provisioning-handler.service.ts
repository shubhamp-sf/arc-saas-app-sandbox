import {
  injectable,
  BindingScope,
  Provider,
  inject,
  service,
} from '@loopback/core';
import {AnyObject} from '@loopback/repository';
import {
  BuilderService,
  TenantProvisioningHandler,
  TierDetailsFn,
  OrchestratorServiceBindings,
} from '@arc-saas/orchestrator-service';
import {DataStoreService} from './data-store.service';

export interface ProvisioningInputs {
  planConfig: AnyObject;
  builderConfig: AnyObject;
  tenant: {
    id: string;
    name: string;
    status: number;
    key: string;
    spocUserId: string | null;
    domains: string[];
    leadId: string | null;
    addressId: string;
    contacts: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
      isPrimary: boolean;
      type: string | null;
      tenantId: string;
    }[];
    address: {
      id: string;
      address: string;
      city: string | null;
      state: string | null;
      zip: string;
      country: string;
    };
  };
}

@injectable({scope: BindingScope.TRANSIENT})
export class TenantProvisioningHandlerProvider
  implements Provider<TenantProvisioningHandler<ProvisioningInputs>>
{
  constructor(
    @inject(OrchestratorServiceBindings.TIER_DETAILS_PROVIDER)
    private tierDetails: TierDetailsFn,
    @inject(OrchestratorServiceBindings.BUILDER_SERVICE)
    private builderService: BuilderService,

    @service(DataStoreService)
    private readonly dataStoreService: DataStoreService,
  ) {}

  value() {
    return async (body: ProvisioningInputs) => {
      // Extract plan and builder information from the body
      const planConfig = body.planConfig;
      const builder = body.builderConfig;
      const tier = planConfig.tier;
      const tenant = body.tenant;

      await this.dataStoreService.storeDataInDynamoDB({
        tenantId: tenant.id,
        ...body,
      });

      try {
        // Fetch tier details based on the provided tier
        const {jobIdentifier, ...otherTierDetails} =
          await this.tierDetails(tier);
        const jobName = jobIdentifier;

        // Ensure Job name is present in the tier details
        if (!jobName) {
          throw new Error('Builder Job name not found in plan details');
        }

        // Check if the builder type is CODE_BUILD
        if (builder?.type === 'CODE_BUILD') {
          // Trigger CodeBuild with the necessary environments
          const codeBuildResponse = await this.builderService.startJob(
            jobName,
            {
              ...otherTierDetails,
              ...(builder?.config?.environmentOverride ?? {}),
            },
          );

          console.log('Code Build Response: ', codeBuildResponse);

          return;
        } else {
          // Throw an error if the builder config is invalid
          throw Error('Invalid builder config provided.');
        }
      } catch (error) {
        console.error('Error in tenant provisioning:', error);
        return;
      }
    };
  }
}
