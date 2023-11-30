import type {
  AttributeValue,
  DynamoDBRecord,
  DynamoDBStreamEvent,
} from "aws-lambda";
import type { AttributeValue as AttributeValueWithUnknown } from "@aws-sdk/client-dynamodb";
import { unmarshall } from "@aws-sdk/util-dynamodb";
import { getConfig } from "./config";
import { ChatItem } from "../repository/chat-repository";
import { MiniTelegramClient } from "../client/telegram";

interface InsertionEventRecord extends DynamoDBRecord {
  eventName: "INSERT";
  dynamodb: {
    NewImage: Record<string, AttributeValue>;
  };
}

function isInsertionEventRecord(
  record: DynamoDBRecord
): record is InsertionEventRecord {
  return (
    record.eventName === "INSERT" && record.dynamodb?.NewImage !== undefined
  );
}

export async function handler(event: DynamoDBStreamEvent) {
  const newChats = event.Records.filter(isInsertionEventRecord).map(
    (record) => {
      const newImage = unmarshall(
        // Needs an assertion due to https://stackoverflow.com/questions/73572769/incompatible-types-of-attributevalue-in-dynamodb-streams
        record.dynamodb.NewImage as Record<string, AttributeValueWithUnknown>
      );
      return ChatItem.parse(newImage);
    }
  );
  if (newChats.length === 0) {
    return;
  }

  const config = await getConfig();
  const telegramClient = new MiniTelegramClient(config.botToken);
  for (const chat of newChats) {
    console.log("Greeting", chat.sk);
    await telegramClient.sendMessage(chat.sk, "Thanks for inviting me!");
  }
}
