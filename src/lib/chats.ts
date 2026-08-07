import { db } from "@/lib/db";
import type { UIMessage } from "ai";

export type ChatSummary = {
  id: string;
  title: string;
  updatedAt: string;
};

export async function getChatMessages(chatId: string): Promise<UIMessage[]> {
  const result = await db.query<{ messages: UIMessage[] }>(
    "select messages from chats where id = $1",
    [chatId]
  );
  return result.rows[0]?.messages ?? [];
}

export async function listChats(limit = 50): Promise<ChatSummary[]> {
  const result = await db.query<{
    id: string;
    messages: UIMessage[];
    updated_at: string;
  }>(
    `select id, messages, updated_at
     from chats
     where jsonb_array_length(messages) > 0
     order by updated_at desc
     limit $1`,
    [limit]
  );

  return result.rows.map((row) => ({
    id: row.id,
    title: titleFromMessages(row.messages),
    updatedAt: row.updated_at,
  }));
}

function titleFromMessages(messages: UIMessage[]): string {
  const firstUserMessage = messages.find((message) => message.role === "user");
  const text =
    firstUserMessage?.parts
      .filter((part) => part.type === "text")
      .map((part) => part.text)
      .join("")
      .trim() ?? "";
  if (!text) return "New chat";
  return text.length > 48 ? `${text.slice(0, 48)}…` : text;
}

export async function saveChatMessages(
  chatId: string,
  messages: UIMessage[]
): Promise<void> {
  await db.query(
    `insert into chats (id, messages, updated_at)
     values ($1, $2, now())
     on conflict (id) do update set messages = excluded.messages, updated_at = now()`,
    [chatId, JSON.stringify(messages)]
  );
}
