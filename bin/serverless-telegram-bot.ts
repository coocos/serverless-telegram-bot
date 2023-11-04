#!/usr/bin/env node
import * as cdk from "aws-cdk-lib";
import { ServerlessTelegramBotStack } from "../lib/serverless-telegram-bot-stack";

const app = new cdk.App();
new ServerlessTelegramBotStack(app, "ServerlessTelegramBotStack", {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
});
