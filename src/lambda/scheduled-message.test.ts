import ChatRepository from "../repository/chat-repository";
import { MiniTelegramClient } from "../telegram/client";
import { getConfig } from "./config";
import { handler } from "./scheduled-message";

jest.mock("./config");

describe("Scheduled message lambda", () => {
  beforeEach(() => {
    jest.mocked(getConfig).mockResolvedValue({
      tableName: "telegram-bot",
      botToken: "test-bot-token",
    });
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  test("publishes message to all registered chats", async () => {
    jest
      .spyOn(MiniTelegramClient.prototype, "sendMessage")
      .mockImplementation();
    jest.spyOn(ChatRepository.prototype, "list").mockResolvedValueOnce([1, 2]);

    await handler();

    expect(MiniTelegramClient.prototype.sendMessage).toHaveBeenCalledWith(
      1,
      "Hi there!"
    );
    expect(MiniTelegramClient.prototype.sendMessage).toHaveBeenCalledWith(
      2,
      "Hi there!"
    );
  });
});
