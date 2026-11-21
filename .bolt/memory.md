# Project memory

## Product intent & audience

- "Brain Un-Stucker" — a gentle ADHD-friendly web app that helps users break overwhelming tasks into small, actionable steps
- Core features: a scale (now slider) to size tasks, a "brain parking lot" for intrusive thoughts, step cards with progress, and a "Be kind to you" motivational quote button
- Audience: neurodivergent users who need calm, low-friction, encouraging interaction design

## Brand personality & voice

- Gentle, kind, non-judgmental; calming but not sleepy
- Playful and tactile in interactions; warm and human in copy
- Motivational language is soft and supportive, not aggressive hustle-speak

## Visual design & UX direction

- Moving away from nature/garden theme toward "brainy and worky but still calming"
- New palette: soft blues, cool teals, warm neutral grays; friendly but focus-oriented
- Iconography: brain, lightbulb, checklist, magnifying glass (replace nature emojis)
- Brain parking lot: fixed bottom overlay layer, follows scroll; collapsed bar by default, expands upward into a card on click
- Scale control: single slider replacing numbered buttons; live label changes from "big picture" to "tiny/open laptop"; thumb grows and shows number while dragging
- Buttons: fluid, springy hover (gentle rise, not snap), dip on press, stronger shadow response; "clickier" tactile feel
- Motion: subtle entrance fade/float for cards and headings; background doodles drift/twinkle; progress bar bounces on step completion; steps wiggle on completion; quote fade-in; livelier loading state

## Decisions, constraints & rationale

- Framework: Next.js
- Parking lot pinned to viewport bottom so it stays accessible across scroll without covering work
- Slider chosen over buttons for scale to make granularity clearer and more playful
- Quotes backed by a database (not hardcoded array) with at least 10 entries; random selection per click for freshness and extensibility
- Springy easings and micro-interactions chosen to reduce the "static" feel and reward every touch

## Open questions & assumptions

- Animation library not confirmed (likely Framer Motion given Next.js + desired spring physics)
- Database/quote storage mechanism unspecified — could be local JSON, a CMS, or a DB table
- Exact quote content not yet defined
- Accessibility implications of heavy motion (prefers-reduced-motion handling) not yet addressed