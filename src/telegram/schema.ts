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
  text: z.string(),
  chat: Chat,
});

export const UpdateEvent = z.object({
  update_id: z.number(),
  my_chat_member: MyChatMember.optional(),
});

export type UpdateEvent = z.infer<typeof UpdateEvent>;
