import { ApiError, GoogleGenAI, Type } from '@google/genai'
import { NextResponse } from 'next/server'

export const maxDuration = 30

const primaryModel = 'gemini-3.8-flash'
const fallbackModel = 'gemini-3.6-flash'

const systemInstruction = `You are a kind, practical task coach for people with ADHD. Break tasks into concrete, do-able next actions. Avoid shame, urgency, streaks, and vague advice. Return ONLY valid JSON as an array of short strings, no markdown. Keep the tone warm and calm. Granularity level 1 means 3-5 broad steps; 2 means 4-6 steps; 3 means 5-8 clear steps; 4 means 7-10 smaller actions; 5 means 8-12 tiny hand-holding steps including setup actions. Each step should start with a verb and be doable in one sitting. For a recursive breakdown, make each substep specific to the parent action.`

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const task = typeof body.task === 'string' ? body.task.trim() : ''
    const level = Number(body.level)
    const parentStep = typeof body.parentStep === 'string' ? body.parentStep.trim() : ''

    if (!task || task.length > 1200 || !Number.isInteger(level) || level < 1 || level > 5) {
      return NextResponse.json({ error: 'Add a task (up to 1,200 characters) and choose a step size.' }, { status: 400 })
    }

    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not set')
    }

    const ai = new GoogleGenAI({ apiKey })
    const prompt = parentStep
      ? `Break this step into smaller actions. Overall task: ${task}\nStep to break down: ${parentStep}\nGranularity: ${level}/5.`
      : `Break this task into steps: ${task}\nGranularity: ${level}/5.`

    const config = {
      systemInstruction,
      temperature: 0.6,
      maxOutputTokens: level > 3 ? 900 : 550,
      responseMimeType: 'application/json',
      responseJsonSchema: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
      },
    }

    let response
    try {
      response = await ai.models.generateContent({
        model: primaryModel,
        contents: prompt,
        config: {
          ...config, 
          maxOutputTokens: 2048,
          responseMimeType: "application/json",
          thinkingConfig: { thinkingBudget: 0 }
        },      })
    } catch (error) {
      if (!(error instanceof ApiError) || error.status !== 503) throw error
      console.error('[task-decomposer] Primary model overloaded, falling back:', error)
      response = await ai.models.generateContent({
        model: fallbackModel,
        contents: prompt,
        config: {
          maxOutputTokens: 2048,
          responseMimeType: "application/json",
          thinkingConfig: { thinkingBudget: 0 }
        }
      })    }

    const text = response.text ?? ''
    const parsed: unknown = JSON.parse(text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, ''))
    if (!Array.isArray(parsed)) throw new Error('Unexpected model response')
    const steps = parsed.filter((step): step is string => typeof step === 'string').slice(0, 12)
    if (steps.length === 0) throw new Error('No steps generated')
    return NextResponse.json({ steps })
  } catch (error) {
    console.error('[task-decomposer] Generation failed:', error)
    return NextResponse.json({ error: 'That didn’t quite work. Try again in a moment.' }, { status: 503 })
  }
}
