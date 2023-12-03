import type { APIGatewayProxyEventV2 } from "aws-lambda";
import { UpdateEvent } from "../client/telegram";
import ChatRepository from "../repository/chat-repository";
import { getConfig } from "./config";

export const handler = async (event: APIGatewayProxyEventV2) => {
  if (!event.body) {
    return {
      statusCode: 200,
    };
  }
  try {
    const updateEvent = UpdateEvent.parse(JSON.parse(event.body));
    if (updateEvent.my_chat_member) {
      const config = await getConfig();
      const chatRepository = new ChatRepository({
        table: config.tableName,
      });
      const status = updateEvent.my_chat_member.new_chat_member.status;
      if (status === "member") {
        const chatId = updateEvent.my_chat_member.chat.id;
        await chatRepository.add(chatId);
        console.log("Added new chat", chatId);
      } else {
        const chatId = updateEvent.my_chat_member.chat.id;
        await chatRepository.remove(chatId);
        console.log("Removed chat", chatId);
      }
    }
  } catch (error) {
    console.log("Failed to handle update event");
    console.log(error);
  }
  return {
    statusCode: 200,
  };
};
