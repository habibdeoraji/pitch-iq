import { anthropic } from '@ai-sdk/anthropic'

export const DEFAULT_MODEL = anthropic('claude-sonnet-4-5')

export const SYSTEM_PROMPT = `You are the PitchIQ assistant. Be direct and concise, and get to the point without preamble.`