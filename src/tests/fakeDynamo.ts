import {
  BillingMode,
  CreateTableCommand,
  DynamoDBClient,
} from "@aws-sdk/client-dynamodb";
import dynalite from "dynalite";

export const dynamoConfiguration = {
  table: "bot-table",
  endpoint: "http://localhost:4567",
  region: "eu-north-1",
  credentials: {
    accessKeyId: "test",
    secretAccessKey: "test",
  },
};

async function createTable() {
  const command = new CreateTableCommand({
    TableName: "bot-table",
    KeySchema: [
      { AttributeName: "pk", KeyType: "HASH" },
      { AttributeName: "sk", KeyType: "RANGE" },
    ],
    AttributeDefinitions: [
      { AttributeName: "pk", AttributeType: "S" },
      { AttributeName: "sk", AttributeType: "N" },
    ],
    BillingMode: BillingMode.PAY_PER_REQUEST,
  });
  const client = new DynamoDBClient(dynamoConfiguration);
  await client.send(command);
}

export async function startDynamoServer() {
  const server = dynalite({
    createTableMs: 0,
  });
  await new Promise<void>((resolve) => {
    server.listen(4567, resolve);
  });
  await createTable();
  return server;
}
