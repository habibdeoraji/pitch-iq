import { getChatMessages } from "@/lib/chats";
import { Chat } from "./chat";

export default async function ChatPage({
  params,
}: {
  params: Promise<{ chatId: string }>;
}) {
  const { chatId } = await params;
  const initialMessages = await getChatMessages(chatId);

  return <Chat chatId={chatId} initialMessages={initialMessages} />;
}
