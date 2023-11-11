import { CustomResource } from "aws-cdk-lib";
import { Runtime } from "aws-cdk-lib/aws-lambda";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { IStringParameter } from "aws-cdk-lib/aws-ssm";
import { Provider } from "aws-cdk-lib/custom-resources";
import { Construct } from "constructs";

type WebHookRegistrationProps = {
  webhookUrl: string;
  botToken: IStringParameter;
};

/**
 * A construct which sets the webhook URL using Telegram API
 * at deployment time via a custom resource. When the
 * resource is deleted, it deletes the webhook.
 */
export class WebhookRegistration extends Construct {
  constructor(scope: Construct, id: string, props: WebHookRegistrationProps) {
    super(scope, id);

    const lambda = new NodejsFunction(this, "WebhookRegistrationLambda", {
      runtime: Runtime.NODEJS_18_X,
      entry: "./src/lambda/register-webhook.ts",
    });
    props.botToken.grantRead(lambda);

    const provider = new Provider(this, "WebhookCustomResourceProvider", {
      onEventHandler: lambda,
    });
    new CustomResource(this, "WebhookCustomResource", {
      serviceToken: provider.serviceToken,
      properties: {
        webhookUrl: props.webhookUrl,
      },
    });
  }
}
