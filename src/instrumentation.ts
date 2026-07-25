import { LangfuseSpanProcessor } from "@langfuse/otel";

export const langfuseSpanProcessor = new LangfuseSpanProcessor();

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { registerTelemetry } = await import("ai");
    const { LangfuseVercelAiSdkIntegration } = await import(
      "@langfuse/vercel-ai-sdk"
    );
    const { NodeSDK } = await import("@opentelemetry/sdk-node");

    const sdk = new NodeSDK({
      spanProcessors: [langfuseSpanProcessor],
    });
    sdk.start();

    registerTelemetry(new LangfuseVercelAiSdkIntegration());
  }
}
