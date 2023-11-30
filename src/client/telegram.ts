import { z } from "zod";

const User = z.object({
  id: z.number(),
  is_bot: z.boolean(),
  first_name: z.string(),
  last_name: z.string().optional(),
});

const Chat = z.object({
  id: z.number(),
  type: z.string(),
  title: z.string().optional(),
});

const ChatMember = z.object({
  status: z.string(),
});

const MyChatMember = z.object({
  chat: Chat,
  from: User,
  date: z.number(),
  old_chat_member: ChatMember,
  new_chat_member: ChatMember,
});

export const Message = z.object({
  message_id: z.number(),
  date: z.number(),
  text: z.string().optional(),
  chat: Chat,
});

export const UpdateEvent = z.object({
  update_id: z.number(),
  my_chat_member: MyChatMember.optional(),
});

export type UpdateEvent = z.infer<typeof UpdateEvent>;

export const SendMessageApiRequest = z.object({
  chat_id: z.number(),
  text: z.string(),
});

export const SendPhotoApiRequest = z.object({
  chat_id: z.number(),
  photo: z.string(),
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

  async sendPhoto(chatId: number, photoUrl: string) {
    const url = `${this.#apiUrl}/sendPhoto`;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chat_id: chatId,
        photo: photoUrl,
      }),
    });
    const apiResponse = SendMessageApiResponse.parse(await response.json());
    if (!apiResponse.ok) {
      throw new Error(`Failed to send photo: ${apiResponse.description}`);
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
