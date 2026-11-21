import { createClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export const supabase =
  url && anonKey
    ? createClient(url, anonKey, { realtime: { params: { eventsPerSecond: 0 } } })
    : null

export type Quote = { text: string; credit: string }

export async function fetchRandomQuote(): Promise<Quote> {
  if (!supabase) throw new Error('offline')
  const { data, error } = await supabase.from('quotes').select('text, credit')
  if (error || !data || data.length === 0) throw new Error(error?.message || 'empty')
  const pool = data as Quote[]
  return pool[Math.floor(Math.random() * pool.length)]
}

export const fallbackQuote: Quote = {
  text: 'Doing one tiny thing is still doing something.',
  credit: 'A gentle reminder',
}
