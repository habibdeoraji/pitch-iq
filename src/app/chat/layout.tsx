import { listChats } from "@/lib/chats";
import { Sidebar } from "./sidebar";

export default async function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const chats = await listChats();

  return (
    <div className="flex min-h-0 flex-1">
      <Sidebar chats={chats} />
      <main className="flex min-h-0 min-w-0 flex-1 flex-col">{children}</main>
    </div>
  );
}
