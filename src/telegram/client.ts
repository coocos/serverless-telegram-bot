import { z } from "zod";
import { Message } from "./schema";

export const SendMessageApiRequest = z.object({
  chat_id: z.number(),
  text: z.string(),
});

const SendMessageApiResponse = z.object({
  ok: z.boolean(),
  description: z.string().optional(),
  result: Message.optional(),
});

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
}
