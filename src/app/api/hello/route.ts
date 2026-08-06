import { DEFAULT_MODEL } from "@/lib/llm";
import { streamText, createTextStreamResponse, toTextStream } from "ai";


export async function POST(req: Request) {
    // const { message } = await req.json()


    const result = streamText({
        model: DEFAULT_MODEL,
        prompt: "Tell me about your self in 500 words",
        abortSignal: req.signal
    })

    return createTextStreamResponse({
        stream: toTextStream({ stream: result.stream })
    })
}