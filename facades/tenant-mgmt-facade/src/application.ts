import {BootMixin} from '@loopback/boot';
import {ApplicationConfig, Component, Constructor} from '@loopback/core';
import {RepositoryMixin} from '@loopback/repository';
import {RestApplication} from '@loopback/rest';
import {
  RestExplorerBindings,
  RestExplorerComponent,
} from '@loopback/rest-explorer';
import {ServiceMixin} from '@loopback/service-proxy';
import {
  AuthCacheSourceName,
  BearerVerifierBindings,
  BearerVerifierComponent,
  BearerVerifierConfig,
  BearerVerifierType,
  CoreComponent,
  SECURITY_SCHEME_SPEC,
  SFCoreBindings,
  SecureSequence,
  rateLimitKeyGen,
} from '@sourceloop/core';
import {WebhookTenantManagementServiceComponent} from '@sourceloop/ctrl-plane-tenant-management-service';
import * as dotenv from 'dotenv';
import * as dotenvExt from 'dotenv-extended';
import {AuthenticationComponent} from 'loopback4-authentication';
import {
  AuthorizationBindings,
  AuthorizationComponent,
} from 'loopback4-authorization';
import {AuthenticationServiceComponent} from '@sourceloop/authentication-service';
import {HelmetSecurityBindings} from 'loopback4-helmet';
import {RateLimitSecurityBindings} from 'loopback4-ratelimiter';
import path from 'path';
import {PaymentWebhookVerifierProvider} from './interceptors';
import {LEAD_TOKEN_VERIFIER, PAYMENT_WEBHOOK_VERIFIER} from './keys';
import * as openapi from './openapi.json';
import {LeadTokenVerifierProvider} from './services';
import {NotificationService} from './services/notifications';

export {ApplicationConfig};

export class TenantMgmtFacadeApplication extends BootMixin(
  ServiceMixin(RepositoryMixin(RestApplication)),
) {
  constructor(options: ApplicationConfig = {}) {
    const port = 3000;
    dotenv.config();
    dotenvExt.load({
      schema: '.env.example',
      errorOnMissing: process.env.NODE_ENV !== 'test',
      includeProcessEnv: true,
    });
    options.rest = options.rest ?? {};
    options.rest.basePath = process.env.BASE_PATH ?? '';
    options.rest.port = +(process.env.PORT ?? port);
    options.rest.host = process.env.HOST;
    options.rest.openApiSpec = {
      endpointMapping: {
        [`${options.rest.basePath}/openapi.json`]: {
          version: '3.0.0',
          format: 'json',
        },
      },
    };

    super(options);

    // To check if monitoring is enabled from env or not
    const enableObf = !!+(process.env.ENABLE_OBF ?? 0);
    // To check if authorization is enabled for swagger stats or not
    const authentication = !!(
      process.env.SWAGGER_USER && process.env.SWAGGER_PASSWORD
    );
    this.bind(SFCoreBindings.config).to({
      enableObf,
      obfPath: process.env.OBF_PATH ?? '/obf',
      openapiSpec: openapi,
      authentication: authentication,
      swaggerUsername: process.env.SWAGGER_USER,
      swaggerPassword: process.env.SWAGGER_PASSWORD,
    });
    this.bind(PAYMENT_WEBHOOK_VERIFIER).toProvider(
      PaymentWebhookVerifierProvider,
    );
    this.component(CoreComponent);

    this.component(WebhookTenantManagementServiceComponent);

    // Set up the custom sequence
    this.sequence(SecureSequence);

    this.bind(HelmetSecurityBindings.CONFIG).to({
      referrerPolicy: {
        policy: 'same-origin',
      },
      contentSecurityPolicy: {
        directives: {
          frameSrc: ["'self'"],
          scriptSrc: ["'self'", `'${process.env.CSP_SCRIPT_SRC_HASH ?? ''}'`],
        },
      },
      hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true,
      },
    });

    this.bind(RateLimitSecurityBindings.CONFIG).to({
      name: AuthCacheSourceName,
      max: parseInt(process.env.RATE_LIMIT_REQUEST_CAP ?? '100'),
      keyGenerator: rateLimitKeyGen,
    });

    // Add authentication component
    this.component(AuthenticationComponent);

    this.component(AuthenticationServiceComponent);

    this.unbindControllers(AuthenticationServiceComponent);

    // Add bearer verifier component
    this.bind(BearerVerifierBindings.Config).to({
      type: BearerVerifierType.facade,
    } as BearerVerifierConfig);
    this.component(BearerVerifierComponent);
    // Add authorization component
    this.bind(AuthorizationBindings.CONFIG).to({
      allowAlwaysPaths: ['/explorer', '/openapi.json'],
    });
    this.component(AuthorizationComponent);

    // Set up default home page
    this.static('/', path.join(__dirname, '../public'));

    // Customize @loopback/rest-explorer configuration here
    this.configure(RestExplorerBindings.COMPONENT).to({
      path: '/explorer',
    });

    this.component(RestExplorerComponent);
    this.bind(LEAD_TOKEN_VERIFIER).toProvider(LeadTokenVerifierProvider);
    this.bind('services.NotificationService').toClass(NotificationService);
    // this.service(CryptoHelperService);
    this.projectRoot = __dirname;
    // Customize @loopback/boot Booter Conventions here
    this.bootOptions = {
      controllers: {
        // Customize ControllerBooter Conventions here
        dirs: ['controllers'],
        extensions: ['.controller.js'],
        nested: true,
      },
      services: {
        dirs: ['services'],
        extensions: ['.service.js', '.provider.js'],
        nested: true,
      },
    };

    this.api({
      openapi: '3.0.0',
      info: {
        title: 'tenant-mgmt-facade',
        version: '1.0.0',
      },
      paths: {},
      components: {
        securitySchemes: SECURITY_SCHEME_SPEC,
      },
      servers: [{url: '/'}],
    });
  }
  private unbindControllers(componentClass: Constructor<Component>) {
    const boundControllers = this.find('controllers.*').map(
      binding => binding.key,
    );

    const componentKey = `components.${componentClass.name}`;

    const componentInstance = this.getSync<Component>(componentKey);

    if (componentInstance.controllers) {
      const componentControllerNames = componentInstance.controllers.map(
        e => e.name,
      );

      boundControllers.forEach(bindingKey => {
        if (componentControllerNames.includes(bindingKey.split('.')[1])) {
          this.unbind(bindingKey);
        }
      });
    } else {
      console.log(
        `No controllers found in the component '${componentClass.name}' to unbind`,
      );
    }
  }
}
