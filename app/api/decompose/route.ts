import { GoogleGenAI } from '@google/genai'
import { NextResponse } from 'next/server'

export const maxDuration = 30

const modelName = 'gemini-3.1-flash-lite'

const systemInstruction = `You are a kind, practical task coach for people with ADHD. Break tasks into concrete, do-able next actions. Avoid shame, urgency, streaks, and vague advice. Return ONLY a valid JSON array of strings, e.g. ["Step 1", "Step 2"]. No markdown formatting, no backticks, just the raw JSON array.`

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
      return NextResponse.json({ error: 'API key is not configured on the server.' }, { status: 500 })
    }

    const ai = new GoogleGenAI({ apiKey })
    const prompt = parentStep
      ? `Break this step into smaller actions. Overall task: ${task}\nStep to break down: ${parentStep}\nGranularity: ${level}/5.`
      : `Break this task into steps: ${task}\nGranularity: ${level}/5.`

    console.log('[task-decomposer] Calling production model:', modelName)
    const response = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.5,
        maxOutputTokens: 1024,
      },
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