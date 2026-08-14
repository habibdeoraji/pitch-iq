import { saveChatMessages } from "@/lib/chats";
import { DEFAULT_MODEL, SYSTEM_PROMPT } from "@/lib/llm";
import type { ChatMessage } from "@/lib/usage";
import {
  convertToModelMessages,
  createUIMessageStreamResponse,
  generateId,
  smoothStream,
  streamText,
  toUIMessageStream,
} from "ai";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ chatId: string }> }
) {
  const { chatId } = await params;
  const { messages }: { messages: ChatMessage[] } = await req.json();

  const result = streamText({
    model: DEFAULT_MODEL,
    system: SYSTEM_PROMPT,
    messages: await convertToModelMessages(messages),
    abortSignal: req.signal,
    experimental_transform: smoothStream({ chunking: "word" }),
  });

  return createUIMessageStreamResponse({
    stream: toUIMessageStream({
      stream: result.stream,
      originalMessages: messages,
      generateMessageId: generateId,
      messageMetadata: ({ part }) => {
        if (part.type !== "finish") return undefined;
        return {
          usage: {
            inputTokens: part.totalUsage.inputTokens ?? 0,
            outputTokens: part.totalUsage.outputTokens ?? 0,
            totalTokens: part.totalUsage.totalTokens ?? 0,
          },
        };
      },
      onFinish: async ({ messages: allMessages }) => {
        await saveChatMessages(chatId, allMessages);
      },
    }),
  });
}
