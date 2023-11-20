import ChatRepository from "../repository/chat-repository";
import { getConfig } from "./config";
import { MiniTelegramClient } from "../telegram/client";

export async function handler() {
  const config = await getConfig();
  const repository = new ChatRepository({
    table: config.tableName,
  });
  const client = new MiniTelegramClient(config.botToken);
  for (const chat of await repository.list()) {
    console.log("Publishing message to chat", chat);
    await client.sendMessage(chat, "Hi there!");
  }
}
