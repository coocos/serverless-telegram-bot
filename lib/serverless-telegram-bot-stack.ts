import * as cdk from "aws-cdk-lib";
import * as lambda from "aws-cdk-lib/aws-lambda";
import { AttributeType, BillingMode, Table } from "aws-cdk-lib/aws-dynamodb";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { Construct } from "constructs";

export class ServerlessTelegramBotStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const table = new Table(this, "BotTable", {
      tableName: "telegram-bot",
      partitionKey: {
        name: "pk",
        type: AttributeType.STRING,
      },
      sortKey: {
        name: "sk",
        type: AttributeType.NUMBER,
      },
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      billingMode: BillingMode.PROVISIONED,
      readCapacity: 5,
      writeCapacity: 5,
      timeToLiveAttribute: "ttl",
    });

    const webhookHandler = new NodejsFunction(this, "WebhookHandler", {
      runtime: lambda.Runtime.NODEJS_18_X,
      entry: "./src/lambda/webhook.ts",
      environment: {
        TABLE_NAME: table.tableName,
      },
    });
    const webhookUrl = webhookHandler.addFunctionUrl({
      authType: lambda.FunctionUrlAuthType.NONE,
    });

    table.grantReadWriteData(webhookHandler);

    const telegramBotToken =
      cdk.aws_ssm.StringParameter.fromSecureStringParameterAttributes(
        this,
        "TelegramBotToken",
        {
          parameterName: "/serverless-telegram-bot/bot-token",
        }
      );
    telegramBotToken.grantRead(webhookHandler);

    new cdk.CfnOutput(this, "WebhookUrl", {
      value: webhookUrl.url,
      description: "Function URL for the webhook lambda",
    });
  }
}
