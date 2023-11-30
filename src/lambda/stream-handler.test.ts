import { handler } from "./stream-handler";
import { MiniTelegramClient } from "../client/telegram";
import { getConfig } from "./config";

jest.mock("./config");

function createStreamEvent() {
  return {
    Records: [
      {
        eventID: "1",
        eventName: "INSERT" as const,
        eventVersion: "1.0",
        eventSource: "aws:dynamodb",
        awsRegion: "us-east-1",
        dynamodb: {
          ApproximateCreationDateTime: 1573251511,
          Keys: {
            pk: {
              S: "CHAT",
            },
            sk: {
              N: "-12345",
            },
          },
          NewImage: {
            pk: {
              S: "CHAT",
            },
            sk: {
              N: "-12345",
            },
            created: {
              S: "2023-11-19T11:00:39.434Z",
            },
          },
          StreamViewType: "NEW_IMAGE" as const,
          SizeBytes: 26,
          SequenceNumber: "1234567890",
        },
        eventSourceARN:
          "arn:aws:dynamodb:us-east-1:123456789012:table/YourTableName/stream/2023-01-01T00:00:00.000",
      },
    ],
  };
}

describe("Stream handler lambda", () => {
  beforeAll(() => {
    jest.mocked(getConfig).mockResolvedValue({
      tableName: "telegram-bot",
      botToken: "test-bot-token",
      dalleApiKey: "dalle-api-key",
    });
  });

  test("sends greeting to the chat that has been added", async () => {
    jest
      .spyOn(MiniTelegramClient.prototype, "sendMessage")
      .mockImplementation();

    await handler(createStreamEvent());

    expect(MiniTelegramClient.prototype.sendMessage).toHaveBeenCalledWith(
      -12345,
      "Thanks for inviting me!"
    );
  });
});
