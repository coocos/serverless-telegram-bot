import { SetupServer, setupServer } from "msw/node";
import { http, HttpResponse } from "msw";
import { MiniTelegramClient, SendMessageApiRequest } from "./client";

function setupMockServer(token: string) {
  return setupServer(
    http.post(
      `https://api.telegram.org/bot${token}/sendMessage`,
      async ({ request }) => {
        const body = await request.json();
        const parsedApiRequest = SendMessageApiRequest.parse(body);
        return HttpResponse.json({
          ok: true,
          result: {
            message_id: 21,
            from: {
              id: 1234567890,
              is_bot: true,
              first_name: "TestBot",
              username: "TestBot",
            },
            chat: {
              id: parsedApiRequest.chat_id,
              title: "Bot test group",
              type: "group",
              all_members_are_administrators: true,
            },
            date: 1699169982,
            text: parsedApiRequest.text,
          },
        });
      }
    )
  );
}

describe("MiniTelegramClient", () => {
  const token = "testToken";
  let server: SetupServer;

  beforeAll(() => {
    server = setupMockServer(token);
    server.listen();
  });

  afterAll(() => {
    server.close();
  });

  test("sends message and returns response", async () => {
    const client = new MiniTelegramClient(token);
    const chatId = 1234;
    const message = "Hello Telegram!";

    const response = await client.sendMessage(chatId, message);

    expect(response).toEqual({
      chat: {
        id: chatId,
        title: "Bot test group",
        type: "group",
      },
      date: 1699169982,
      message_id: 21,
      text: message,
    });
  });
});
