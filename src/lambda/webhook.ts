import type { APIGatewayProxyEventV2 } from "aws-lambda";
import { UpdateEvent } from "../telegram/schema";
import { chatRepository } from "../repository/chat";

export const handler = async (event: APIGatewayProxyEventV2) => {
  if (!event.body) {
    return {
      statusCode: 200,
    };
  }
  console.log("Raw update event:", JSON.parse(event.body));

  try {
    const updateEvent = UpdateEvent.parse(JSON.parse(event.body));
    if (updateEvent.my_chat_member) {
      const status = updateEvent.my_chat_member.new_chat_member.status;
      if (status === "member") {
        chatRepository.add(updateEvent.my_chat_member.chat.id);
      } else {
        chatRepository.remove(updateEvent.my_chat_member.chat.id);
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
