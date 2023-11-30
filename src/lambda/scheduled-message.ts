import ChatRepository from "../repository/chat-repository";
import { getConfig } from "./config";
import { MiniTelegramClient } from "../client/telegram";
import { generateCatPicture } from "../client/openai";

export async function handler() {
  const config = await getConfig();
  const catPicture = await generateCatPicture(config.dalleApiKey);
  console.log("Created cat picture using prompt:", catPicture.prompt);

  const client = new MiniTelegramClient(config.botToken);
  const repository = new ChatRepository({
    table: config.tableName,
  });
  for (const chat of await repository.list()) {
    console.log("Sending picture to chat", chat);
    try {
      await client.sendPhoto(chat, catPicture.url);
    } catch (error) {
      console.log("Failed to send picture to chat", chat, error);
    }
  }
}
