'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { ArrowDown, Brain, Check, ChevronDown, ChevronUp, Heart, Lightbulb, RotateCcw, SlidersHorizontal, Sparkles, WandSparkles } from 'lucide-react'
import { fallbackQuote, fetchRandomQuote, type Quote } from '@/lib/supabase-client'

type TaskStep = { id: string; text: string; done: boolean; children?: TaskStep[]; busy?: boolean }
type Palette = 'lemon' | 'pink' | 'lilac'
const palette: Palette[] = ['lemon', 'pink', 'lilac']
const loadingLines = ['Untangling the chaos…', 'Finding the first tiny step…', 'Juggling your thoughts…']
const levelNames = ['Big picture', 'Rough sketch', 'Balanced bits', 'Small moves', '“Open laptop” tiny']

function makeSteps(items: string[]): TaskStep[] {
  return items.map((text) => ({ id: crypto.randomUUID(), text, done: false }))
}

export function TaskDecomposer() {
  const [task, setTask] = useState('')
  const [level, setLevel] = useState(3)
  const [steps, setSteps] = useState<TaskStep[]>([])
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const [quoteShuffle, setQuoteShuffle] = useState(0)
  const [parkingOpen, setParkingOpen] = useState(false)
  const [parking, setParking] = useState('')
  const [quoteLoading, setQuoteLoading] = useState(false)
  const [loadingIndex, setLoadingIndex] = useState(0)
  const quoteCache = useRef<Quote[]>([])
  const messageRef = useRef<HTMLDivElement>(null)

  const showKindness = useCallback(async () => {
    setQuoteLoading(true)
    setMessage('')
    setQuoteShuffle((n) => n + 1)
    try {
      let pool = quoteCache.current
      if (pool.length < 2) {
        const fresh = await fetchRandomQuote()
        pool = quoteCache.current = [...quoteCache.current.filter((q) => q.text !== fresh.text), fresh]
      }
      const quote = pool[Math.floor(Math.random() * pool.length)]
      quoteCache.current = pool.filter((q) => q.text !== quote.text)
      setMessage(`${quote.text} — ${quote.credit}`)
    } catch {
      setMessage(`${fallbackQuote.text} — ${fallbackQuote.credit}`)
    } finally {
      setQuoteLoading(false)
      messageRef.current?.classList.remove('pop-in')
      void messageRef.current?.offsetWidth
      messageRef.current?.classList.add('pop-in')
    }
  }, [])

  useEffect(() => {
    if (!message) return
    const timer = setTimeout(() => setMessage(''), 9000)
    return () => clearTimeout(timer)
  }, [message, quoteShuffle])

  async function decompose(parentStep?: string) {
    if (!task.trim() || busy) return
    setBusy(true)
    setMessage('')
    setLoadingIndex((index) => (index + 1) % loadingLines.length)
    try {
      const response = await fetch('/api/decompose', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ task: task.trim(), level, parentStep }),
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Could not make those steps.')
      const next = makeSteps(result.steps)
      if (parentStep) {
        const updateChildren = (items: TaskStep[]): TaskStep[] => items.map((item) => item.text === parentStep ? { ...item, children: next } : { ...item, children: item.children ? updateChildren(item.children) : undefined })
        setSteps(updateChildren(steps))
      } else setSteps(next)
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Something got tangled. Try again.')
    } finally {
      setBusy(false)
    }
  }

  function updateStep(id: string, update: Partial<TaskStep>, items = steps): TaskStep[] {
    return items.map((item) => item.id === id ? { ...item, ...update } : { ...item, children: item.children ? updateStep(id, update, item.children) : undefined })
  }

  function renderSteps(items: TaskStep[], depth = 0) {
    return <ul className={`step-list depth-${depth}`}>
      {items.map((step, index) => <li key={step.id} className="step-item rise-in" style={{ animationDelay: `${Math.min(index * 55, 330)}ms` }}>
        <article className={`step-card ${palette[(index + depth) % palette.length]} ${step.done ? 'is-done' : ''}`}>
          <button className="check-button tactile" type="button" aria-label={`${step.done ? 'Mark' : 'Complete'}: ${step.text}`} aria-pressed={step.done} onClick={() => setSteps(updateStep(step.id, { done: !step.done }))}>
            {step.done && <Check size={19} strokeWidth={3} />}
          </button>
          <span className="step-number">{String(index + 1).padStart(2, '0')}</span>
          <span className="step-text">{step.text}</span>
          <button className="smaller-button tactile" type="button" disabled={busy} onClick={() => decompose(step.text)} aria-label={`Break down: ${step.text}`}>
            <WandSparkles size={15} /><span>Break it down smaller</span>
          </button>
        </article>
        {step.children && renderSteps(step.children, depth + 1)}
      </li>)}
    </ul>
  }

  const completed = steps.filter((step) => step.done).length

  return <main className="app-shell">
    <header className="topbar">
      <a className="brand" href="#top" aria-label="Brain Un-Stucker home"><span className="brand-mark"><Brain size={18} /></span> little by little</a>
      <span className="top-note"><span className="online-dot" /> Your gentle productivity pal</span>
      <button className="kindness-chip tactile" type="button" onClick={showKindness} disabled={quoteLoading}><Heart size={15} /> {quoteLoading ? 'Finding words…' : 'Be kind to you'}</button>
    </header>

    <div className="main-layout" id="top">
      <section className="intro-column" aria-labelledby="page-title">
        <div className="eyebrow rise-in"><span className="eyebrow-icon"><Sparkles size={14} /></span> A softer way to get started</div>
        <h1 id="page-title" className="rise-in" style={{ animationDelay: '60ms' }}>Brain<br /><span>Un-Stucker</span><span className="title-sparkle drift" aria-hidden="true">✳</span></h1>
        <p className="intro-copy rise-in" style={{ animationDelay: '120ms' }}>Type what&apos;s overwhelming you.<br />We&apos;ll chew it up into <em>bite-sized pieces.</em></p>
        <div className="tiny-note rise-in" style={{ animationDelay: '170ms' }}><span className="note-emoji">✳</span><span>No perfect plan needed. Just a place to begin.</span></div>
        <div className="doodle drift" aria-hidden="true"><span className="doodle-star">✳</span><span className="doodle-line" /><span className="doodle-heart">✦</span></div>
        <div className="side-quote rise-in" style={{ animationDelay: '220ms' }}><span className="quote-mark">“</span><p>You don&apos;t have to see the whole staircase.<br />Just the next little step.</p><span className="quote-credit">A gentle reminder</span></div>
      </section>

      <section className="work-column" aria-label="Task decomposer">
        <div className="composer-card rise-in" style={{ animationDelay: '90ms' }}>
          <div className="card-topline"><div><span className="section-kicker">LET&apos;S GET IT OUT OF YOUR HEAD</span><h2>What&apos;s feeling big?</h2></div><span className="card-illustration" aria-hidden="true">✳</span></div>
          <label className="sr-only" htmlFor="task-input">The task that feels overwhelming</label>
          <textarea id="task-input" className="task-input" maxLength={1200} value={task} onChange={(event) => setTask(event.target.value)} placeholder="e.g., Write my APUSH essay, clean my room, reply to that email…" />
          <div className="input-footer"><span>It can be messy. We&apos;re not judging. <span aria-hidden="true">☺</span></span><span>{task.length}/1200</span></div>
          <div className="granularity">
            <div className="granularity-heading"><span className="granularity-icon"><SlidersHorizontal size={16} /></span><div><strong>How spicy should the steps be?</strong><span>Slide to your kind of help</span></div></div>
            <div className="slider-row">
              <input
                type="range" min={1} max={5} step={1} value={level}
                onChange={(event) => setLevel(Number(event.target.value))}
                id="level-slider" className="level-slider"
                style={{ '--fill': `${(level - 1) / 4 * 100}%` } as React.CSSProperties}
                aria-label="Step size" aria-valuetext={levelNames[level - 1]}
              />
              <span className="slider-value" aria-hidden="true">{level}</span>
            </div>
            <div className="level-captions"><span>{levelNames[level - 1]}</span><span className="level-caption-end">{level === 5 ? 'Open the laptop' : 'Tiny steps'}</span></div>
          </div>
          <button className="unstuck-button tactile" type="button" onClick={() => decompose()} disabled={!task.trim() || busy}>
            {busy ? <><span className="button-spinner" /> Working on it…</> : <>Un-stuck me! <Sparkles size={18} /></>}
          </button>
          <p className="privacy-note"><Heart size={12} /> Just you and your thoughts. No pressure, ever.</p>
        </div>

        {message && <div className="feedback-message pop-in" role="status" ref={messageRef}><span>✦</span>{message}<button type="button" onClick={() => setMessage('')} aria-label="Dismiss">×</button></div>}

        {busy && <div className="loading-card" role="status"><span className="loading-bubble">✦</span><div><strong>{loadingLines[loadingIndex]}</strong><span>We&apos;re making it feel a little more manageable.</span></div><span className="loading-dots"><i /><i /><i /></span></div>}

        {steps.length > 0 && <section className="results-section" aria-live="polite">
          <div className="results-heading"><div><span className="section-kicker">YOUR FIRST LITTLE PLAN</span><h2>Look at you, starting. <span aria-hidden="true">✳</span></h2><p>{completed === steps.length && steps.length > 0 ? 'You did it. Take a breath and enjoy that.' : `${completed} of ${steps.length} steps done · go at your own pace`}</p></div><button className="reset-button tactile" type="button" onClick={() => { setSteps([]); setMessage('') }} aria-label="Clear plan"><RotateCcw size={16} /></button></div>
          <div className="progress-track" role="progressbar" aria-label="Plan progress" aria-valuenow={completed} aria-valuemin={0} aria-valuemax={steps.length}><span style={{ width: `${steps.length ? completed / steps.length * 100 : 0}%` }} /></div>
          {renderSteps(steps)}
        </section>}
      </section>
    </div>

    <section className={`parking-lot-viewport ${parkingOpen ? 'open' : ''}`} aria-labelledby="parking-title">
      <div className="parking-lot">
        <button className="parking-toggle tactile" type="button" onClick={() => setParkingOpen(!parkingOpen)} aria-expanded={parkingOpen} aria-controls="parking-content">
          <span className="parking-icon"><Lightbulb size={19} /></span><span className="parking-heading"><strong id="parking-title">Brain Parking Lot</strong><span>Save your spot for later. Your brain can let go for now.</span></span><span className="parking-toggle-label">{parkingOpen ? 'Close' : 'Park a thought'} {parkingOpen ? <ChevronDown size={17} /> : <ChevronUp size={17} />}</span>
        </button>
        {parkingOpen && <div className="parking-content" id="parking-content"><div className="parking-prompt"><Lightbulb size={17} /><p>Interrupted mid-task? Jot down where you left off so future-you can pick it back up without starting from scratch.</p></div><label className="sr-only" htmlFor="parking-note">Where did you leave off?</label><textarea id="parking-note" value={parking} onChange={(event) => setParking(event.target.value)} placeholder="I was halfway through… Next I need to…" /><div className="parking-footer"><span>{parking ? 'Saved right here for this session' : 'A note to your future self'}</span><span><ArrowDown size={13} /> No need to finish the thought</span></div></div>}
      </div>
    </section>
    <footer className="footer"><span>Made for brains that work a little differently <span aria-hidden="true">♡</span></span><span>Small steps count. Always.</span></footer>
  </main>
}
