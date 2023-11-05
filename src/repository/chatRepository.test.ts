import { Server } from "http";
import ChatRepository from "./chatRepository";
import { dynamoConfiguration, startDynamoServer } from "../test/fakeDynamo";

describe("ChatRepository", () => {
  let dynamoServer: Server;

  beforeAll(async () => {
    dynamoServer = await startDynamoServer();
  });

  afterAll((callback) => {
    dynamoServer.close(callback);
  });

  test("should return an empty list if no chats exist", async () => {
    const repository = new ChatRepository(dynamoConfiguration);

    const chats = await repository.list();

    expect(chats.length).toBe(0);
  });

  test("should add chat", async () => {
    const repository = new ChatRepository(dynamoConfiguration);
    await repository.add(1);

    const chats = await repository.list();
    expect(chats).toEqual([1]);
  });

  test("should remove chat", async () => {
    const repository = new ChatRepository(dynamoConfiguration);

    await repository.add(1);
    await repository.add(2);
    const chatsBefore = await repository.list();
    expect(chatsBefore).toEqual([1, 2]);

    await repository.remove(1);
    const chatsAfter = await repository.list();
    expect(chatsAfter).toEqual([2]);
  });
});
