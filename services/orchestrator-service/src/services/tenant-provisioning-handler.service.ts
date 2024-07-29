import {injectable, BindingScope, Provider, inject} from '@loopback/core';
import {AnyObject} from '@loopback/repository';
import {
  BuilderService,
  TenantProvisioningHandler,
  TierDetailsFn,
  OrchestratorServiceBindings,
} from '@arc-saas/orchestrator-service';

export type ProvisioningInputs = {
  planConfig: AnyObject;
  builderConfig: AnyObject;
};

@injectable({scope: BindingScope.TRANSIENT})
export class TenantProvisioningHandlerProvider
  implements Provider<TenantProvisioningHandler<ProvisioningInputs>>
{
  constructor(
    @inject(OrchestratorServiceBindings.TIER_DETAILS_PROVIDER)
    private tierDetails: TierDetailsFn,
    @inject(OrchestratorServiceBindings.BUILDER_SERVICE)
    private builderService: BuilderService,
  ) {}

  value() {
    return async (body: ProvisioningInputs) => {
      // Extract plan and builder information from the body
      const planConfig = body.planConfig;
      const builder = body.builderConfig;
      const tier = planConfig.tier;

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
