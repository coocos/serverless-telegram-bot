import { CustomResource } from "aws-cdk-lib";
import { Runtime } from "aws-cdk-lib/aws-lambda";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { ILogGroup } from "aws-cdk-lib/aws-logs";
import { IStringParameter } from "aws-cdk-lib/aws-ssm";
import { Provider } from "aws-cdk-lib/custom-resources";
import { Construct } from "constructs";
import * as lambda from "aws-cdk-lib/aws-lambda";

type WebHookRegistrationProps = {
  webhookUrl: string;
  botToken: IStringParameter;
  logGroup: ILogGroup;
};

/**
 * A construct which sets the webhook URL using Telegram API
 * at deployment time via a custom resource. When the
 * resource is deleted, it deletes the webhook.
 */
export class WebhookRegistration extends Construct {
  constructor(scope: Construct, id: string, props: WebHookRegistrationProps) {
    super(scope, id);

    const registrationLambda = new NodejsFunction(
      this,
      "WebhookRegistrationLambda",
      {
        description: "Lambda for registering webhook URL with Telegram",
        runtime: Runtime.NODEJS_18_X,
        entry: "./src/lambda/register-webhook.ts",
        logFormat: lambda.LogFormat.JSON,
        logGroup: props.logGroup,
      }
    );
    props.botToken.grantRead(registrationLambda);

    const provider = new Provider(this, "WebhookCustomResourceProvider", {
      onEventHandler: registrationLambda,
    });
    new CustomResource(this, "WebhookCustomResource", {
      serviceToken: provider.serviceToken,
      properties: {
        webhookUrl: props.webhookUrl,
      },
    });
  }
}
