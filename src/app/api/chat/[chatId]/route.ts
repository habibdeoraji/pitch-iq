import { saveChatMessages } from "@/lib/chats";
import { DEFAULT_MODEL, SYSTEM_PROMPT } from "@/lib/llm";
import {
  convertToModelMessages,
  createUIMessageStreamResponse,
  generateId,
  smoothStream,
  streamText,
  toUIMessageStream,
  type UIMessage,
} from "ai";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ chatId: string }> }
) {
  const { chatId } = await params;
  const { messages }: { messages: UIMessage[] } = await req.json();

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
      onFinish: async ({ messages: allMessages }) => {
        await saveChatMessages(chatId, allMessages);
      },
    }),
  });
}
