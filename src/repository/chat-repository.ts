import {
  DeleteItemCommand,
  DynamoDBClient,
  PutItemCommand,
  QueryCommand,
} from "@aws-sdk/client-dynamodb";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";
import { z } from "zod";

type DynamoConfiguration = {
  table: string;
  endpoint?: string;
  region?: string;
  credentials?: {
    accessKeyId: string;
    secretAccessKey: string;
  };
};

export const ChatItem = z.object({
  pk: z.literal("CHAT"),
  sk: z.number(),
  created: z.string(),
});

class ChatRepository {
  #client: DynamoDBClient;
  #table: string;

  constructor(config: DynamoConfiguration) {
    this.#table = config.table;
    this.#client = new DynamoDBClient(config);
  }

  async add(id: number) {
    const command = new PutItemCommand({
      TableName: this.#table,
      Item: marshall({
        pk: "CHAT",
        sk: id,
        created: new Date().toISOString(),
      }),
    });
    await this.#client.send(command);
  }

  async remove(id: number) {
    const command = new DeleteItemCommand({
      TableName: this.#table,
      Key: marshall({
        pk: "CHAT",
        sk: id,
      }),
    });
    await this.#client.send(command);
  }

  async list() {
    const command = new QueryCommand({
      TableName: this.#table,
      KeyConditionExpression: "pk = :pk",
      ExpressionAttributeValues: {
        ":pk": {
          S: "CHAT",
        },
      },
    });
    const response = await this.#client.send(command);
    if (!response.Items) {
      return [];
    }
    return response.Items.map((item) => ChatItem.parse(unmarshall(item)).sk);
  }
}

export default ChatRepository;
