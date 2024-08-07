import {BootMixin} from '@loopback/boot';
import {ApplicationConfig} from '@loopback/core';
import {
  RestExplorerBindings,
  RestExplorerComponent,
} from '@loopback/rest-explorer';
import {RepositoryMixin} from '@loopback/repository';
import {RestApplication} from '@loopback/rest';
import {ServiceMixin} from '@loopback/service-proxy';
import path from 'path';
import {MySequence} from './sequence';
import {
  OrchestratorServiceComponent,
  OrchestratorServiceBindings,
  TenantProvisioningHandler,
  TenantProvisioningSuccessHandler,
} from '@arc-saas/orchestrator-service';
import {
  AwsCodeBuildService,
  OrchestratorService,
  ProvisioningInputs,
  TenantProvisioningHandlerProvider,
  TenantProvisioningSuccessHandlerProvider,
  TierDetailsProvider,
} from './services';

export {ApplicationConfig};

export class OrchestratorServiceApplication extends BootMixin(
  ServiceMixin(RepositoryMixin(RestApplication)),
) {
  constructor(options: ApplicationConfig = {}) {
    super(options);

    // Configure orchestrator service
    this.bind<TenantProvisioningHandler<ProvisioningInputs>>(
      OrchestratorServiceBindings.TENANT_PROVISIONING_HANDLER,
    ).toProvider(TenantProvisioningHandlerProvider);
    this.bind<TenantProvisioningSuccessHandler>(
      OrchestratorServiceBindings.TENANT_PROVISIONING_SUCCESS_HANDLER,
    ).toProvider(TenantProvisioningSuccessHandlerProvider);

    this.bind(OrchestratorServiceBindings.TIER_DETAILS_PROVIDER).toProvider(
      TierDetailsProvider,
    );

    this.bind(OrchestratorServiceBindings.ORCHESTRATOR_SERVICE).toClass(
      OrchestratorService,
    );
    this.bind(OrchestratorServiceBindings.BUILDER_SERVICE).toClass(
      AwsCodeBuildService,
    );

    this.component(OrchestratorServiceComponent);

    // Set up the custom sequence
    this.sequence(MySequence);

    // Set up default home page
    this.static('/', path.join(__dirname, '../public'));

    // Customize @loopback/rest-explorer configuration here
    this.configure(RestExplorerBindings.COMPONENT).to({
      path: '/explorer',
    });
    this.component(RestExplorerComponent);

    this.projectRoot = __dirname;
    // Customize @loopback/boot Booter Conventions

    this.bootOptions = {
      controllers: {
        // Customize ControllerBooter Conventions here
        dirs: ['controllers'],
        extensions: ['.controller.js'],
        nested: true,
      },
    };
  }
}
