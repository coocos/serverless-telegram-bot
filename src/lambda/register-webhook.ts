import { z } from "zod";
import type { CloudFormationCustomResourceEvent } from "aws-lambda";
import { MiniTelegramClient } from "../client/telegram";
import { GetParameterCommand, SSMClient } from "@aws-sdk/client-ssm";
import constants from "../constants";

const ResourceProperties = z.object({
  webhookUrl: z.string(),
});

async function getBotToken() {
  const ssmClient = new SSMClient();
  const response = await ssmClient.send(
    new GetParameterCommand({
      Name: constants.BOT_TOKEN_PARAMETER_NAME,
      WithDecryption: true,
    })
  );
  if (!response.Parameter?.Value) {
    throw new Error("Bot token not found from SSM");
  }
  return response.Parameter.Value;
}

async function setWebhook(webhookUrl: string) {
  const botToken = await getBotToken();
  const client = new MiniTelegramClient(botToken);
  return await client.setWebhook(webhookUrl);
}

async function deleteWebhook() {
  const botToken = await getBotToken();
  const client = new MiniTelegramClient(botToken);
  return await client.deleteWebhook();
}

export async function handler(event: CloudFormationCustomResourceEvent) {
  const { webhookUrl } = ResourceProperties.parse(event.ResourceProperties);
  switch (event.RequestType) {
    case "Create":
      console.log("Setting webhook to", webhookUrl);
      console.log(await setWebhook(webhookUrl));
      return {
        PhysicalResourceId: webhookUrl,
      };
    case "Update":
      console.log("Updating custom resource");
      return {
        PhysicalResourceId: webhookUrl,
      };
    case "Delete":
      console.log("Deleting webhook");
      console.log(await deleteWebhook());
      return;
  }
}
