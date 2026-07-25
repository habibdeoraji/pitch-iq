import { after } from "next/server";
import { generateText } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import {
  observe,
  propagateAttributes,
  updateActiveObservation,
} from "@langfuse/tracing";

import { langfuseSpanProcessor } from "@/instrumentation";

interface ChatRequestBody {
  message: string;
  userId?: string;
  sessionId?: string;
}

const handler = async (req: Request) => {
  const { message, userId, sessionId }: ChatRequestBody = await req.json();

  updateActiveObservation({ input: message });

  const text = await propagateAttributes(
    {
      traceName: "generate-chat-response",
      userId,
      sessionId,
      tags: ["pitch-iq"],
    },
    async () => {
      const { text } = await generateText({
        model: anthropic("claude-sonnet-5"),
        prompt: message,
        telemetry: { functionId: "chat-response" },
      });
      return text;
    },
  );

  updateActiveObservation({ output: text });

  after(() => langfuseSpanProcessor.forceFlush());

  return Response.json({ reply: text });
};

export const POST = observe(handler, {
  name: "handle-chat-request",
  // Input/output are set explicitly above (the raw Request/Response objects
  // aren't useful trace data and would otherwise overwrite those calls).
  captureInput: false,
  captureOutput: false,
});
