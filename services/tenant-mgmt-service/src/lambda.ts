import {AnyObject} from '@loopback/repository';
const serverlessExpress = require('@vendia/serverless-express');

export * from './application';
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let serverlessApp: (arg0: AnyObject, arg1: unknown) => any; // NOSONAR

export const PORT = 3000;

export async function setup(event: AnyObject, context: unknown) {
  const {TntMngmtApplication} = require('./application');
  const config = {
    rest: {
      port: +(process.env.PORT ?? PORT),
      host: process.env.HOST,
      gracePeriodForClose: 5000, // 5 seconds
      openApiSpec: {
        // useful when used with OpenAPI-to-GraphQL to locate your application
        setServersFromRequest: true,
      },
    },
  };
  const app = new TntMngmtApplication(config);
  await app.boot();
  const requestHandler = app.restServer.requestHandler;
  serverlessApp = serverlessExpress({app: requestHandler});
  return serverlessApp(event, context);
}

export const handler = async (event: AnyObject, context: unknown) => {
  if (serverlessApp) {
    return serverlessApp(event, context);
  }

  return setup(event, context);
};
