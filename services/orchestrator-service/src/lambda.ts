import {APIGatewayEvent, APIGatewayProxyEvent, Context} from 'aws-lambda';
const serverlessExpress = require('@vendia/serverless-express');

export * from './application';
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let serverlessApp: (arg0: APIGatewayProxyEvent, arg1: Context) => any; // NOSONAR

export async function setup(event: APIGatewayEvent, context: Context) {
  const {OrchestratorServiceApplication} = require('./application');
  const config = {
    rest: {
      openApiSpec: {
        setServersFromRequest: true,
      },
    },
  };
  const app = new OrchestratorServiceApplication(config);
  await app.boot();
  const requestHandler = app.restServer.requestHandler;
  serverlessApp = serverlessExpress({app: requestHandler});
  return serverlessApp(event, context);
}

export const handler = async (event: APIGatewayEvent, context: Context) => {
  if (serverlessApp) {
    return serverlessApp(event, context);
  }

  return setup(event, context);
};
