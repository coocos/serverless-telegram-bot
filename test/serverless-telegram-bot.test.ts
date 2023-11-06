import * as cdk from "aws-cdk-lib";
import { Template } from "aws-cdk-lib/assertions";
import * as ServerlessTelegramBot from "../lib/serverless-telegram-bot-stack";

describe("ServerlessTelegramBotStack", () => {
  test("synthesizes as expected", () => {
    const app = new cdk.App();
    const stack = new ServerlessTelegramBot.ServerlessTelegramBotStack(
      app,
      "TestStack"
    );
    const template = Template.fromStack(stack);

    template.hasResourceProperties("AWS::Lambda::Function", {
      Runtime: "nodejs18.x",
    });
    template.resourceCountIs("AWS::Lambda::Url", 1);
    template.hasResourceProperties("AWS::DynamoDB::Table", {
      TableName: "telegram-bot",
      AttributeDefinitions: [
        { AttributeName: "pk", AttributeType: "S" },
        { AttributeName: "sk", AttributeType: "N" },
      ],
      KeySchema: [
        { AttributeName: "pk", KeyType: "HASH" },
        { AttributeName: "sk", KeyType: "RANGE" },
      ],
      TimeToLiveSpecification: {
        AttributeName: "ttl",
      },
    });
  });
});
