import { SetupServer, setupServer } from "msw/node";
import { http, HttpResponse } from "msw";
import {
  MiniTelegramClient,
  SendMessageApiRequest,
  SendPhotoApiRequest,
} from "./telegram";

describe("MiniTelegramClient", () => {
  const token = "testToken";
  let server: SetupServer;

  beforeAll(() => {
    server = setupServer();
    server.listen();
  });

  afterEach(() => {
    server.resetHandlers();
  });

  afterAll(() => {
    server.close();
  });

  test("sends message and return response", async () => {
    server.use(
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

    const client = new MiniTelegramClient(token);
    const response = await client.sendMessage(1234, "Hello Telegram!");

    expect(response).toEqual({
      chat: {
        id: 1234,
        title: "Bot test group",
        type: "group",
      },
      date: 1699169982,
      message_id: 21,
      text: "Hello Telegram!",
    });
  });

  test("sends photo", async () => {
    server.use(
      http.post(
        `https://api.telegram.org/bot${token}/sendPhoto`,
        async ({ request }) => {
          const body = await request.json();
          const parsedApiRequest = SendPhotoApiRequest.parse(body);
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
            },
          });
        }
      )
    );

    const client = new MiniTelegramClient(token);
    const response = await client.sendPhoto(1234, "https://localhost/1234.png");

    expect(response).toEqual({
      chat: {
        id: 1234,
        title: "Bot test group",
        type: "group",
      },
      date: 1699169982,
      message_id: 21,
    });
  });

  test("sets webhook", async () => {
    server.use(
      http.post(
        `https://api.telegram.org/bot${token}/setWebhook`,
        async ({ request }) => {
          const body = await request.json();
          expect(body).toEqual(
            expect.objectContaining({
              url: "https://localhost/webhook",
              drop_pending_updates: true,
              allowed_updates: ["my_chat_member"],
            })
          );
          return HttpResponse.json({
            ok: true,
            result: true,
            description: "Webhook was set",
          });
        }
      )
    );

    const client = new MiniTelegramClient(token);
    const response = await client.setWebhook("https://localhost/webhook");

    expect(response).toEqual({
      ok: true,
      description: "Webhook was set",
    });
  });

  test("deletes webhook", async () => {
    server.use(
      http.post(
        `https://api.telegram.org/bot${token}/deleteWebhook`,
        async ({ request }) => {
          const body = await request.json();
          expect(body).toEqual(
            expect.objectContaining({
              drop_pending_updates: true,
            })
          );
          return HttpResponse.json({
            ok: true,
            result: true,
            description: "Webhook was deleted",
          });
        }
      )
    );

    const client = new MiniTelegramClient(token);
    const response = await client.deleteWebhook();

    expect(response).toEqual({
      ok: true,
      description: "Webhook was deleted",
    });
  });
});
