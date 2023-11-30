import { GetParametersCommand, SSMClient } from "@aws-sdk/client-ssm";
import { z } from "zod";
import constants from "../constants";

const Config = z.object({
  tableName: z.string(),
  botToken: z.string(),
  dalleApiKey: z.string(),
});

let cachedConfig: z.infer<typeof Config>;

export async function getConfig() {
  if (cachedConfig) {
    return cachedConfig;
  }
  const ssmClient = new SSMClient();
  const parameters = await ssmClient.send(
    new GetParametersCommand({
      Names: [constants.BOT_TOKEN_PARAMETER_NAME, constants.DALLE_API_KEY],
      WithDecryption: true,
    })
  );
  const [botToken, dalleApiKey] = parameters.Parameters ?? [];
  cachedConfig = Config.parse({
    tableName: process.env.TABLE_NAME,
    botToken: botToken?.Value,
    dalleApiKey: dalleApiKey?.Value,
  });

  return cachedConfig;
}
