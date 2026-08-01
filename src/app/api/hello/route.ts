import { generateText } from 'ai'
import { DEFAULT_MODEL } from '@/lib/llm'


export async function POST() {

    const { text } = await generateText({
        model: DEFAULT_MODEL,
        prompt: "Give me your introduction"
    })

    return Response.json({ data: text })

}
