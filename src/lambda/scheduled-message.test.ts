import ChatRepository from "../repository/chat-repository";
import { MiniTelegramClient } from "../client/telegram";
import { getConfig } from "./config";
import { handler } from "./scheduled-message";
import { generateCatPicture } from "../client/openai";

jest.mock("./config");
jest.mock("../client/openai");

describe("Scheduled message lambda", () => {
  beforeEach(() => {
    jest.mocked(getConfig).mockResolvedValue({
      tableName: "telegram-bot",
      botToken: "test-bot-token",
      dalleApiKey: "dalle-api-key",
    });
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  test("publishes message to all registered chats", async () => {
    jest.spyOn(MiniTelegramClient.prototype, "sendPhoto").mockImplementation();
    jest.spyOn(ChatRepository.prototype, "list").mockResolvedValueOnce([1, 2]);
    jest.mocked(generateCatPicture).mockResolvedValueOnce({
      url: "https://localhost/cat.png",
      prompt: "Cool cat",
    });

    await handler();

    expect(MiniTelegramClient.prototype.sendPhoto).toHaveBeenCalledWith(
      1,
      "https://localhost/cat.png"
    );
    expect(MiniTelegramClient.prototype.sendPhoto).toHaveBeenCalledWith(
      2,
      "https://localhost/cat.png"
    );
  });
});
