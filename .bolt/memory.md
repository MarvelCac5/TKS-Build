# Project memory

## Product intent & audience

- "Brain Un-Stucker" — a gentle ADHD-friendly web app that helps users break overwhelming tasks into small, actionable steps
- Core features: a scale (now slider) to size tasks, a "brain parking lot" for intrusive thoughts, step cards with progress, and a "Be kind to you" motivational quote button
- Audience: neurodivergent users who need calm, low-friction, encouraging interaction design

## Brand personality & voice

- Gentle, kind, non-judgmental; calming but not sleepy
- Playful and tactile in interactions; warm and human in copy
- Motivational language is soft and supportive, not aggressive hustle-speak
- Microcopy: "Break it down smaller" (not just "smaller")

## Visual design & UX direction

- Layout: centered top-down single-column flow (large title → task card → slider → progress/steps)
- Aesthetic shifted from muted/calming to playful neo-brutalist: chunky black outlines, offset shadows, bold colors
- 3-color scheme: yellow, pink, lavender (no longer blue-only); task cards cycle through these colors
- Parking lot: bright yellow, fixed bottom overlay; collapsed bar by default, expands upward on click
- Background: subtle dotted-paper texture
- Slider: live label changes from "big picture" to "tiny/open laptop"; thumb grows and shows number while dragging
- Buttons: fluid, springy hover (gentle rise), dip on press, stronger shadow response; tactile "clicky" feel
- Motion: entrance fade/float for cards/headings; progress bar bounces on step completion; steps wiggle on completion; quote fade-in; livelier loading state

## Decisions, constraints & rationale

- Framework: Next.js
- Top-down centered layout chosen for clear visual hierarchy and reference alignment
- 3-color palette (yellow/pink/lavender) chosen to be more colorful and playful while staying friendly
- Chunky outlines + offset shadows for a tactile, approachable feel that reduces clinical "static" vibe
- Parking lot pinned to viewport bottom so it stays accessible across scroll without covering work
- Slider chosen over buttons for scale to make granularity clearer and more playful
- Quotes backed by a database (not hardcoded array) with at least 10 entries; random selection per click
- Springy easings and micro-interactions chosen to reward every touch

## Open questions & assumptions

- Animation library not confirmed (likely Framer Motion given Next.js + desired spring physics)
- Database/quote storage mechanism unspecified — could be local JSON, a CMS, or a DB table
- Exact quote content not yet defined
- Accessibility implications of heavy motion (prefers-reduced-motion handling) not yet addressed