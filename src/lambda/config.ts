import { GetParameterCommand, SSMClient } from "@aws-sdk/client-ssm";
import { z } from "zod";

const Config = z.object({
  tableName: z.string(),
  botToken: z.string(),
});

let cachedConfig: z.infer<typeof Config>;

export async function getConfig() {
  if (cachedConfig) {
    return cachedConfig;
  }
  const ssmClient = new SSMClient();
  const botToken = await ssmClient.send(
    new GetParameterCommand({
      Name: "/serverless-telegram-bot/bot-token",
      WithDecryption: true,
    })
  );
  cachedConfig = Config.parse({
    tableName: process.env.TABLE_NAME,
    botToken: botToken.Parameter?.Value,
  });

  return cachedConfig;
}
