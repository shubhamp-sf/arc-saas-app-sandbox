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
  TenantProvisioningFailureHandler,
  TenantDeploymentHandler,
} from '@arc-saas/orchestrator-service';
import {
  AwsCodeBuildService,
  OrchestratorService,
  ProvisioningInputs,
  TenantProvisioningHandlerProvider,
  TenantProvisioningSuccessHandlerProvider,
  TierDetailsProvider,
  TenantDeploymentProvider,
} from './services';
import {TenantRegistrationProvider} from './services/tenant-registration.handler';
import {Bindings} from './types';

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

    this.bind<TenantProvisioningFailureHandler>(
      OrchestratorServiceBindings.TENANT_PROVISIONING_FAILURE_HANDLER,
    ).toProvider(TenantProvisioningSuccessHandlerProvider);

    this.bind<TenantDeploymentHandler>(
      OrchestratorServiceBindings.TENANT_DEPLOYMENT_HANDLER,
    ).toProvider(TenantDeploymentProvider);

    this.bind(OrchestratorServiceBindings.TIER_DETAILS_PROVIDER).toProvider(
      TierDetailsProvider,
    );

    this.bind(OrchestratorServiceBindings.ORCHESTRATOR_SERVICE).toClass(
      OrchestratorService,
    );
    this.bind(OrchestratorServiceBindings.BUILDER_SERVICE).toClass(
      AwsCodeBuildService,
    );

    this.bind(Bindings.TENANT_REGISTRATION_HANDLER).toProvider(
      TenantRegistrationProvider,
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
