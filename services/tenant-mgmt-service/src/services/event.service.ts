import {injectable, BindingScope} from '@loopback/core';
import {
  EventTypes,
  SubscriptionDTO,
  TenantWithRelations,
} from '@sourceloop/ctrl-plane-tenant-management-service';
import {EventBridgeClient, PutEventsCommand} from '@aws-sdk/client-eventbridge';
import {AnyObject} from '@loopback/repository';
import {IEventConnector} from '@sourceloop/ctrl-plane-tenant-management-service';

export enum Builder {
  CODE_BUILD = 'CODE_BUILD',
  JENKINS = 'JENKINS',
}

type EventBodyType = {
  type: EventTypes;
  tenant: TenantWithRelations;
  subscription: SubscriptionDTO;
  secret: string;
  context: string;
} & AnyObject;

@injectable({scope: BindingScope.TRANSIENT})
export class EventConnector implements IEventConnector<EventBodyType> {
  constructor() {}

  async publish(eventBody: EventBodyType) {
    console.log('Event body received in the event connector:', eventBody);
    const {type, secret, context, ...data} = eventBody;

    console.log('Secret', secret);
    console.log('Context', context);

    // Configure the AWS SDK with your credentials and region
    const eventBridgeClient = new EventBridgeClient({
      region: process.env.EVENT_BUS_REGION,
    });

    const extraPlanConfig: AnyObject = {};

    if (data.subscription.plan?.sizeConfig) {
      for (const key in data.subscription.plan?.sizeConfig) {
        extraPlanConfig[key] = data.subscription.plan?.sizeConfig[key];
      }
    }

    // Define the event payload
    const eventPayload = {
      Entries: [
        {
          Source: 'TenantManagementService',
          DetailType: type,
          Detail: JSON.stringify({
            tenant: data.tenant,
            appConfig: data?.appConfig,
            planConfig: data.subscription.plan,
            builderConfig: {
              type: Builder.CODE_BUILD,
              config: {
                environmentOverride: {
                  ...extraPlanConfig,
                  plan: JSON.stringify(data.subscription.plan),
                  tenant: JSON.stringify(data.tenant),
                  secret: secret,
                  context: context,
                },
              },
            },
          }),
          EventBusName: process.env.EVENT_BUS_NAME,
        },
      ],
    };

    console.log('Event bus name', process.env.EVENT_BUS_NAME);
    // Create the PutEventsCommand with the event payload
    const putEventsCommand = new PutEventsCommand(eventPayload);

    // Send the event to the event bus
    const response = await eventBridgeClient
      .send(putEventsCommand)
      .catch(err => {
        console.error('Error sending event:', err);
      });

    if (response) {
      console.log('Event sent successfully:', response);
    }
  }
}
