import {BindingScope, injectable} from '@loopback/core';
import {
  DynamoDBClient,
  PutItemCommand,
  PutItemCommandInput,
  QueryCommand,
} from '@aws-sdk/client-dynamodb';
import {marshall, unmarshall} from '@aws-sdk/util-dynamodb';
import {AnyObject} from '@loopback/repository';

@injectable({scope: BindingScope.SINGLETON})
export class DataStoreService {
  private client: DynamoDBClient;

  constructor() {
    this.client = new DynamoDBClient({region: process.env.DYNAMO_DB_REGION});
  }

  async retrieveDataFromDynamoDB(
    filterValue: string,
    identifier: string = 'tenantId',
  ): Promise<{tenantId: string; planConfig: AnyObject} & AnyObject> {
    const params = {
      TableName: process.env.DATA_STORE_TABLE,
      KeyConditionExpression: `${identifier} = :${identifier}`,
      ExpressionAttributeValues: marshall({
        [`:${identifier}`]: filterValue,
      }),
    };

    try {
      const command = new QueryCommand(params);
      const response = await this.client.send(command);
      if (!response.Items) {
        throw Error('Items not found.');
      }
      const items = response.Items.map(item => unmarshall(item));
      console.log('DataStore Query results:', items);

      if (items.length === 0) {
        throw new Error(
          'Provided provisioning details not found in data store table.',
        );
      }

      const provisioningRequest = items[0];
      return {
        ...provisioningRequest,
        planConfig: provisioningRequest.planConfig,
        tenantId: provisioningRequest.tenantId as string,
      };
    } catch (error) {
      console.error(
        `Error fetching data from data store for the tenantId: ${filterValue}:`,
        error,
      );
      throw error;
    }
  }

  async storeDataInDynamoDB(
    data: {tenantId: string} & AnyObject,
  ): Promise<void> {
    const params: PutItemCommandInput = {
      TableName: process.env.DATA_STORE_TABLE,
      Item: marshall(data),
    };

    try {
      const command = new PutItemCommand(params);
      await this.client.send(command);
      console.log(
        `Data stored successfully in DynamoDB table.${params.TableName} `,
      );
    } catch (error) {
      console.error('Error storing data in DynamoDB:', error);
      throw error;
    }
  }
}
