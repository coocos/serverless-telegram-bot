import type { APIGatewayProxyEventV2 } from "aws-lambda";
import { UpdateEvent } from "../telegram/schema";
import ChatRepository from "../repository/chat-repository";
import { getConfig } from "./config";
import { MiniTelegramClient } from "../telegram/client";

export const handler = async (event: APIGatewayProxyEventV2) => {
  if (!event.body) {
    return {
      statusCode: 200,
    };
  }
  console.log("Raw update event:", JSON.parse(event.body));
  const config = await getConfig();

  const chatRepository = new ChatRepository({
    table: config.tableName,
  });
  try {
    const updateEvent = UpdateEvent.parse(JSON.parse(event.body));
    if (updateEvent.my_chat_member) {
      const status = updateEvent.my_chat_member.new_chat_member.status;
      if (status === "member") {
        const chatId = updateEvent.my_chat_member.chat.id;
        await chatRepository.add(chatId);
        const telegramClient = new MiniTelegramClient(config.botToken);
        await telegramClient.sendMessage(chatId, "Thanks for inviting me!");
      } else {
        await chatRepository.remove(updateEvent.my_chat_member.chat.id);
      }
    }
  } catch (error) {
    console.log("Failed to parse update event");
    console.log(error);
  }
  return {
    statusCode: 200,
  };
};
