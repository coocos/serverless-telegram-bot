import { z } from "zod";
import { Message } from "./schema";

export const SendMessageApiRequest = z.object({
  chat_id: z.number(),
  text: z.string(),
});

const ApiResponse = z.object({
  ok: z.boolean(),
  description: z.string().optional(),
});

const SendMessageApiResponse = z.intersection(
  ApiResponse,
  z.object({
    result: Message.optional(),
  })
);

export class MiniTelegramClient {
  #apiUrl: string;

  constructor(token: string) {
    this.#apiUrl = `https://api.telegram.org/bot${token}`;
  }

  async sendMessage(chatId: number, message: string) {
    const url = `${this.#apiUrl}/sendMessage`;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
      }),
    });
    const apiResponse = SendMessageApiResponse.parse(await response.json());
    if (!apiResponse.ok) {
      throw new Error(`Failed to send message: ${apiResponse.description}`);
    }
    return Message.parse(apiResponse.result);
  }

  async setWebhook(webhookUrl: string) {
    const url = `${this.#apiUrl}/setWebhook`;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        url: webhookUrl,
        max_connections: 2,
        drop_pending_updates: true,
        allowed_updates: ["my_chat_member"],
      }),
    });
    const body = await response.json();
    const apiResponse = ApiResponse.parse(body);
    if (!apiResponse.ok) {
      throw new Error(`Failed to set webhook: ${apiResponse.description}`);
    }
    return apiResponse;
  }

  async deleteWebhook() {
    const url = `${this.#apiUrl}/deleteWebhook`;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        drop_pending_updates: true,
      }),
    });
    const body = await response.json();
    const apiResponse = ApiResponse.parse(body);
    if (!apiResponse.ok) {
      throw new Error(`Failed to delete webhook: ${apiResponse.description}`);
    }
    return apiResponse;
  }
}
