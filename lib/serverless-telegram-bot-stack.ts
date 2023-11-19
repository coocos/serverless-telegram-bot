import * as cdk from "aws-cdk-lib";
import * as lambda from "aws-cdk-lib/aws-lambda";
import {
  AttributeType,
  BillingMode,
  StreamViewType,
  Table,
} from "aws-cdk-lib/aws-dynamodb";
import { DynamoEventSource } from "aws-cdk-lib/aws-lambda-event-sources";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { Construct } from "constructs";
import { WebhookRegistration } from "./webhook-registration";
import constants from "../src/constants";
import { LogGroup, RetentionDays } from "aws-cdk-lib/aws-logs";

export class ServerlessTelegramBotStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const sharedLogGroup = new LogGroup(this, "SharedLambdaLogGroup", {
      retention: RetentionDays.ONE_MONTH,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

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
      stream: StreamViewType.NEW_IMAGE,
    });

    const dynamoStreamHandler = new NodejsFunction(this, "StreamHandler", {
      description: "Lambda for reacting to chat additions and removals",
      runtime: lambda.Runtime.NODEJS_18_X,
      entry: "./src/lambda/stream-handler.ts",
      environment: {
        TABLE_NAME: table.tableName,
      },
      logFormat: lambda.LogFormat.JSON,
      logGroup: sharedLogGroup,
    });
    dynamoStreamHandler.addEventSource(
      new DynamoEventSource(table, {
        startingPosition: lambda.StartingPosition.TRIM_HORIZON,
      })
    );

    const webhookHandler = new NodejsFunction(this, "WebhookHandler", {
      description: "Lambda for receiving events from Telegram",
      runtime: lambda.Runtime.NODEJS_18_X,
      entry: "./src/lambda/webhook.ts",
      environment: {
        TABLE_NAME: table.tableName,
      },
      logFormat: lambda.LogFormat.JSON,
      logGroup: sharedLogGroup,
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
          parameterName: constants.BOT_TOKEN_PARAMETER_NAME,
        }
      );
    telegramBotToken.grantRead(webhookHandler);
    telegramBotToken.grantRead(dynamoStreamHandler);

    new WebhookRegistration(this, "WebhookRegistration", {
      webhookUrl: webhookUrl.url,
      botToken: telegramBotToken,
      logGroup: sharedLogGroup,
    });

    new cdk.CfnOutput(this, "WebhookUrl", {
      value: webhookUrl.url,
      description: "Function URL for the webhook lambda",
    });
  }
}
