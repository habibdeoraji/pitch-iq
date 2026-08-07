"use client";

import type { ChatSummary } from "@/lib/chats";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function Sidebar({ chats }: { chats: ChatSummary[] }) {
  const pathname = usePathname();

  return (
    <aside className="flex w-64 shrink-0 flex-col border-r border-black/10 dark:border-white/10">
      <div className="shrink-0 p-3">
        <Link
          href="/"
          className="flex items-center gap-2 rounded-lg border border-black/10 px-3 py-2 text-sm font-medium transition-colors hover:bg-black/5 dark:border-white/10 dark:hover:bg-white/5"
        >
          <PlusIcon />
          New chat
        </Link>
      </div>

      <nav className="min-h-0 flex-1 overflow-y-auto px-3 pb-3">
        {chats.length === 0 ? (
          <p className="px-3 py-2 text-sm text-black/40 dark:text-white/40">
            No chats yet.
          </p>
        ) : (
          <ul className="flex flex-col gap-0.5">
            {chats.map((chat) => {
              const href = `/chat/${chat.id}`;
              const active = pathname === href;
              return (
                <li key={chat.id}>
                  <Link
                    href={href}
                    aria-current={active ? "page" : undefined}
                    className={`block truncate rounded-lg px-3 py-2 text-sm transition-colors ${active
                      ? "bg-black/8 font-medium text-black dark:bg-white/10 dark:text-white"
                      : "text-black/70 hover:bg-black/5 dark:text-white/70 dark:hover:bg-white/5"
                      }`}
                  >
                    {chat.title}
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </nav>
    </aside>
  );
}

function PlusIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </svg>
  );
}
