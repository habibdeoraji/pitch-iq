import type { UIMessage } from "ai";

export type ChatUsage = {
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
};

export type ChatMessageMetadata = {
  usage?: ChatUsage;
};

export type ChatMessage = UIMessage<ChatMessageMetadata>;

// $ per million tokens. Matches the model in lib/llm.ts — update together if
// that changes. This is an estimate for in-app visibility, not a billing
// record; check console.anthropic.com/settings/cost for actual spend.
const PRICE_PER_MILLION_TOKENS = {
  input: 3,
  output: 15,
};

export function estimateCostUsd(usage: ChatUsage): number {
  return (
    (usage.inputTokens / 1_000_000) * PRICE_PER_MILLION_TOKENS.input +
    (usage.outputTokens / 1_000_000) * PRICE_PER_MILLION_TOKENS.output
  );
}

export function sumUsage(messages: ChatMessage[]): ChatUsage {
  return messages.reduce<ChatUsage>(
    (total, message) => {
      const usage = message.metadata?.usage;
      if (!usage) return total;
      return {
        inputTokens: total.inputTokens + usage.inputTokens,
        outputTokens: total.outputTokens + usage.outputTokens,
        totalTokens: total.totalTokens + usage.totalTokens,
      };
    },
    { inputTokens: 0, outputTokens: 0, totalTokens: 0 }
  );
}
