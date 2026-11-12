import { GoogleGenAI, Type } from '@google/genai'
import { NextResponse } from 'next/server'

export const maxDuration = 30

const modelName = 'gemini-3.8-flash'

const systemInstruction = `You are a kind, practical task coach for people with ADHD. Break tasks into concrete, do-able next actions. Avoid shame, urgency, streaks, and vague advice. Return ONLY valid JSON as an array of short strings, no markdown. Keep the tone warm and calm. Granularity level 1 means 3-5 broad steps; 2 means 4-6 steps; 3 means 5-8 clear steps; 4 means 7-10 smaller actions; 5 means 8-12 tiny hand-holding steps including setup actions. Each step should start with a verb and be doable in one sitting. For a recursive breakdown, make each substep specific to the parent action.`

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}))
    const task = typeof body.task === 'string' ? body.task.trim() : ''
    const level = Number(body.level)
    const parentStep = typeof body.parentStep === 'string' ? body.parentStep.trim() : ''

    if (!task || task.length > 1200 || !Number.isInteger(level) || level < 1 || level > 5) {
      return NextResponse.json({ error: 'Add a task (up to 1,200 characters) and choose a step size.' }, { status: 400 })
    }

    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      console.error('[task-decomposer] GEMINI_API_KEY is missing from environment variables.')
      return NextResponse.json({ error: 'API key is not configured on the server.' }, { status: 500 })
    }

    const ai = new GoogleGenAI({ apiKey })
    const prompt = parentStep
      ? `Break this step into smaller actions. Overall task: ${task}\nStep to break down: ${parentStep}\nGranularity: ${level}/5.`
      : `Break this task into steps: ${task}\nGranularity: ${level}/5.`

    const config = {
      systemInstruction,
      temperature: 0.6,
      maxOutputTokens: 2048,
      responseMimeType: 'application/json',
      responseJsonSchema: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
      },
    }

    const response = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
      config,
    })

    const text = response.text ?? '[]'
    
    let parsed: unknown
    try {
      const cleaned = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim()
      parsed = JSON.parse(cleaned)
    } catch {
      parsed = text.split('\n').map(s => s.replace(/^[-*#\d.]+\s*/, '').trim()).filter(Boolean)
    }

    if (!Array.isArray(parsed)) {
      throw new Error('Model response was not an array')
    }

    const steps = parsed.filter((step): step is string => typeof step === 'string').slice(0, 12)
    if (steps.length === 0) {
      throw new Error('No steps generated')
    }

    return NextResponse.json({ steps })
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error('[task-decomposer] Generation failed:', errorMessage)
    return NextResponse.json({ error: 'That didn’t quite work. Try again in a moment.' }, { status: 500 })
  }
}