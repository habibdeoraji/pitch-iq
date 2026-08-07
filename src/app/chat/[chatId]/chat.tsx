"use client";

import { useChat } from "@ai-sdk/react";
import { renderMarkdown } from "@/lib/markdown";
import { DefaultChatTransport, type UIMessage } from "ai";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

export function Chat({
  chatId,
  initialMessages,
}: {
  chatId: string;
  initialMessages: UIMessage[];
}) {
  const [input, setInput] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const { messages, sendMessage, regenerate, setMessages, stop, status, error } =
    useChat({
      id: chatId,
      messages: initialMessages,
      transport: new DefaultChatTransport({ api: `/api/chat/${chatId}` }),
      // Keep the sidebar's chat list (title, ordering) in sync with what
      // just got persisted server-side.
      onFinish: () => router.refresh(),
    });

  const isStreaming = status === "submitted" || status === "streaming";

  // `status` flips to "streaming" as soon as the response connection opens —
  // before the model has actually produced any visible text. Keep the
  // typing indicator up until there's real content to show, so there's no
  // blank gap between hitting enter and the first token landing.
  const lastMessage = messages.at(-1);
  const lastMessageHasVisibleText =
    lastMessage?.role === "assistant" &&
    lastMessage.parts.some((part) => part.type === "text" && part.text.length > 0);
  const showTypingIndicator =
    status === "submitted" || (status === "streaming" && !lastMessageHasVisibleText);

  // Edit/retry only ever apply to the most recent turn — acting on an
  // earlier message would silently discard everything after it.
  const lastUserMessageId = useMemo(
    () => [...messages].reverse().find((m) => m.role === "user")?.id,
    [messages]
  );
  const lastAssistantMessageId = useMemo(
    () => [...messages].reverse().find((m) => m.role === "assistant")?.id,
    [messages]
  );

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages, status]);

  function handleSubmit(e: React.SubmitEvent) {
    e.preventDefault();
    if (!input.trim() || isStreaming) return;
    sendMessage({ text: input });
    setInput("");
  }

  function startEdit(message: UIMessage) {
    const text = message.parts
      .filter((part) => part.type === "text")
      .map((part) => part.text)
      .join("");
    setEditingId(message.id);
    setEditingText(text);
  }

  function cancelEdit() {
    setEditingId(null);
    setEditingText("");
  }

  function saveEdit(messageId: string) {
    if (!editingText.trim()) return;
    const index = messages.findIndex((m) => m.id === messageId);
    if (index === -1) return;
    setMessages(messages.slice(0, index));
    sendMessage({ text: editingText });
    setEditingId(null);
    setEditingText("");
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <header className="shrink-0 border-b border-black/10 dark:border-white/10 px-6 py-4">
        <h1 className="text-lg font-semibold tracking-tight">PitchIQ</h1>
      </header>

      <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto flex max-w-2xl flex-col gap-6 px-4 py-8">
          {messages.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-2 py-24 text-center text-black/40 dark:text-white/40">
              <p className="text-sm">Ask anything to get started.</p>
            </div>
          ) : (
            messages.map((message) => (
              <ChatBubble
                key={message.id}
                message={message}
                isEditing={editingId === message.id}
                editingText={editingText}
                onEditingTextChange={setEditingText}
                onStartEdit={() => startEdit(message)}
                onCancelEdit={cancelEdit}
                onSaveEdit={() => saveEdit(message.id)}
                onRetry={() => regenerate({ messageId: message.id })}
                canEdit={message.id === lastUserMessageId}
                canRetry={message.id === lastAssistantMessageId}
                disabled={isStreaming}
              />
            ))
          )}

          {showTypingIndicator && <TypingIndicator />}

          {error && (
            <p className="rounded-lg bg-red-500/10 px-4 py-2 text-sm text-red-600 dark:text-red-400">
              {error.message}
            </p>
          )}
        </div>
      </div>

      <div className="shrink-0 border-t border-black/10 dark:border-white/10 px-4 py-4">
        <form
          onSubmit={handleSubmit}
          className="mx-auto flex max-w-2xl items-end gap-2"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isStreaming}
            placeholder="Message PitchIQ..."
            autoFocus
            className="flex-1 rounded-full border border-black/10 bg-black/3 px-4 py-2.5 text-sm outline-none transition-colors placeholder:text-black/40 focus:border-black/20 disabled:opacity-50 dark:border-white/10 dark:bg-white/6 dark:placeholder:text-white/40 dark:focus:border-white/20"
          />
          {isStreaming ? (
            <button
              type="button"
              onClick={stop}
              aria-label="Stop generating"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-black text-white transition-opacity hover:opacity-80 dark:bg-white dark:text-black"
            >
              <span className="h-2.5 w-2.5 rounded-xs bg-current" />
            </button>
          ) : (
            <button
              type="submit"
              disabled={!input.trim()}
              aria-label="Send message"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-black text-white transition-opacity hover:opacity-80 disabled:opacity-30 dark:bg-white dark:text-black"
            >
              <ArrowUpIcon />
            </button>
          )}
        </form>
      </div>
    </div>
  );
}

function ChatBubble({
  message,
  isEditing,
  editingText,
  onEditingTextChange,
  onStartEdit,
  onCancelEdit,
  onSaveEdit,
  onRetry,
  canEdit,
  canRetry,
  disabled,
}: {
  message: UIMessage;
  isEditing: boolean;
  editingText: string;
  onEditingTextChange: (text: string) => void;
  onStartEdit: () => void;
  onCancelEdit: () => void;
  onSaveEdit: () => void;
  onRetry: () => void;
  canEdit: boolean;
  canRetry: boolean;
  disabled: boolean;
}) {
  const isUser = message.role === "user";
  const text = message.parts
    .filter((part) => part.type === "text")
    .map((part) => part.text)
    .join("");
  if (!text && !isEditing) return null;

  if (isEditing) {
    return (
      <div className="flex justify-end">
        <div className="flex w-full max-w-[80%] flex-col gap-2">
          <textarea
            value={editingText}
            onChange={(e) => onEditingTextChange(e.target.value)}
            autoFocus
            rows={3}
            className="w-full resize-none rounded-2xl border border-black/10 bg-black/3 px-4 py-2.5 text-[0.95rem] leading-relaxed outline-none focus:border-black/20 dark:border-white/10 dark:bg-white/6 dark:focus:border-white/20"
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onCancelEdit}
              className="rounded-full px-3 py-1 text-xs text-black/50 hover:text-black/80 dark:text-white/50 dark:hover:text-white/80"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onSaveEdit}
              className="rounded-full bg-black px-3 py-1 text-xs text-white hover:opacity-80 dark:bg-white dark:text-black"
            >
              Save &amp; resend
            </button>
          </div>
        </div>
      </div>
    );
  }

  const showAction = isUser ? canEdit : canRetry;

  return (
    <div
      className={`group flex flex-col ${isUser ? "items-end" : "items-start"}`}
    >
      {isUser ? (
        <div className="max-w-[80%] rounded-2xl bg-black px-4 py-2.5 text-[0.95rem] leading-relaxed whitespace-pre-wrap text-white dark:bg-white dark:text-black">
          {text}
        </div>
      ) : (
        <div
          className="markdown-doc max-w-full text-[0.95rem]"
          dangerouslySetInnerHTML={{ __html: renderMarkdown(text) }}
        />
      )}
      {showAction && (
        <div className="mt-1 flex h-5 gap-2 px-1 opacity-0 transition-opacity group-hover:opacity-100">
          {isUser ? (
            <button
              type="button"
              onClick={onStartEdit}
              disabled={disabled}
              aria-label="Edit message"
              className="text-black/40 hover:text-black/70 disabled:opacity-40 dark:text-white/40 dark:hover:text-white/70"
            >
              <PencilIcon />
            </button>
          ) : (
            <button
              type="button"
              onClick={onRetry}
              disabled={disabled}
              aria-label="Retry response"
              className="text-black/40 hover:text-black/70 disabled:opacity-40 dark:text-white/40 dark:hover:text-white/70"
            >
              <RetryIcon />
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex justify-start">
      <div className="flex items-center gap-1 rounded-2xl bg-black/4 px-4 py-3 dark:bg-white/8">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="h-1.5 w-1.5 animate-bounce rounded-full bg-black/40 dark:bg-white/40"
            style={{ animationDelay: `${i * 120}ms` }}
          />
        ))}
      </div>
    </div>
  );
}

function ArrowUpIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 19V5" />
      <path d="M5 12l7-7 7 7" />
    </svg>
  );
}

function PencilIcon() {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </svg>
  );
}

function RetryIcon() {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 12a9 9 0 1 1 2.64 6.36" />
      <path d="M3 21v-6h6" />
    </svg>
  );
}
