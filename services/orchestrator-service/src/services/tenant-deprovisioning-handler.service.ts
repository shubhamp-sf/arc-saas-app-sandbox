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
  TierDetailsFn,
  OrchestratorServiceBindings,
  TenantDeprovisioningHandler,
} from '@arc-saas/orchestrator-service';
import {DataStoreService} from './data-store.service';
import {TierDetails} from './tier-details.service';

export interface DeprovisioningInputs {
  builderConfig: {
    type: string;
    config: AnyObject;
  };
  tier: string;
  tenant: {
    id: string;
    key: string;
  };
}

@injectable({scope: BindingScope.TRANSIENT})
export class TenantDeprovisioningHandlerProvider
  implements Provider<TenantDeprovisioningHandler<DeprovisioningInputs>>
{
  constructor(
    @inject(OrchestratorServiceBindings.TIER_DETAILS_PROVIDER)
    private tierDetails: TierDetailsFn<TierDetails>,
    @inject(OrchestratorServiceBindings.BUILDER_SERVICE)
    private builderService: BuilderService,

    @service(DataStoreService)
    private readonly dataStoreService: DataStoreService,
  ) {}

  value() {
    return async (body: DeprovisioningInputs) => {
      // Extract plan and builder information from the body
      const builder = body.builderConfig;
      const tier = body.tier;
      const tenant = body.tenant;

      /* await this.dataStoreService.storeDataInDynamoDB({
        tenantId: tenant.id,
        ...body,
      }); */

      try {
        // Fetch tier details based on the provided tier
        const {deprovisioningJobName, ...otherTierDetails} =
          await this.tierDetails(tier);
        const jobName = deprovisioningJobName;

        // Ensure Deprovisioning Job name is present in the tier details
        if (!jobName) {
          throw new Error('Deprovisioning Job name not found in plan details');
        }

        // Check if the builder type is CODE_BUILD
        if (builder.type === 'CODE_BUILD') {
          // Trigger CodeBuild with the necessary environments
          const codeBuildResponse = await this.builderService.startJob(
            jobName,
            {
              ...otherTierDetails,
              TENANT_ID: tenant.id,
              KEY: tenant.key,
              ...(builder?.config?.environmentOverride ?? {}),
            },
          );

          console.log(
            'Deprovisioning Code Build Response: ',
            codeBuildResponse,
          );

          return;
        } else {
          // Throw an error if the builder config is invalid
          throw Error('Invalid builder config provided.');
        }
      } catch (error) {
        console.error('Error in tenant deprovisioning:', error);
        return;
      }
    };
  }
}
