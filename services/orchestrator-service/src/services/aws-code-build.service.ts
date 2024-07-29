import {injectable, /* inject, */ BindingScope} from '@loopback/core';
import {AnyObject} from '@loopback/repository';
import {BuilderServiceInterface} from '@arc-saas/orchestrator-service';
import {
  CodeBuildClient,
  StartBuildCommand,
  StartBuildCommandInput,
} from '@aws-sdk/client-codebuild';

@injectable({scope: BindingScope.TRANSIENT})
export class AwsCodeBuildService implements BuilderServiceInterface {
  constructor() {}

  async startJob(jobName: string, params: AnyObject): Promise<void> {
    const codeBuildClient = new CodeBuildClient({
      region: process.env.CODE_BUILD_REGION,
    });

    const buildParams: StartBuildCommandInput = {
      projectName: jobName,
      environmentVariablesOverride: Object.keys(params).map(key => {
        return {
          name: key,
          value: String(params[key]),
          type: 'PLAINTEXT',
        };
      }),
    };

    try {
      const command = new StartBuildCommand(buildParams);
      await codeBuildClient.send(command);
      console.log('CodeBuild triggered successfully.');
      return;
    } catch (error) {
      console.error('Error triggering CodeBuild:', error);
      throw error;
    }
  }
}
