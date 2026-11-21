/*
# Create quotes table for "Be kind to you" button (retry of create_quotes_table)

1. New Tables
- `quotes`
  - `id` (uuid, primary key)
  - `text` (text, not null) — the motivational quote
  - `credit` (text, not null) — who said it / source label
  - `created_at` (timestamp)

2. Seed Data
- 14 gentle, ADHD-friendly motivational quotes inserted idempotently (only if the table is empty).

3. Security
- Enable RLS on `quotes`.
- Grant SELECT to `anon` + `authenticated` (single-tenant app, no sign-in — quotes are shared public content).
- Read-only: no INSERT/UPDATE/DELETE policies, so the anon client can never modify quotes.
*/

CREATE TABLE IF NOT EXISTS quotes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  text text NOT NULL,
  credit text NOT NULL DEFAULT 'A gentle reminder',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;

GRANT SELECT ON quotes TO anon, authenticated;

DROP POLICY IF EXISTS "Anyone can read quotes" ON quotes;
CREATE POLICY "Anyone can read quotes"
ON quotes FOR SELECT
TO anon, authenticated
USING (true);

DO $$
BEGIN
  IF (SELECT COUNT(*) FROM quotes) = 0 THEN
    INSERT INTO quotes (text, credit) VALUES
      ('Doing one tiny thing is still doing something.', 'A gentle reminder'),
      ('You don''t have to see the whole staircase. Just the next little step.', 'A gentle reminder'),
      ('Start where you are. Use what you have. Do what you can.', 'Arthur Ashe'),
      ('Slow progress is still progress. You are not behind.', 'A gentle reminder'),
      ('The secret of getting ahead is getting started.', 'Mark Twain'),
      ('You don''t need more motivation. You need a smaller first step.', 'A gentle reminder'),
      ('Done is kinder than perfect.', 'A gentle reminder'),
      ('It always seems impossible until it''s done.', 'Nelson Mandela'),
      ('Rest is productive too. Your brain is working while you breathe.', 'A gentle reminder'),
      ('Little by little, a little becomes a lot.', 'Tanzanian proverb'),
      ('You are not lazy. Your to-do list is just very loud.', 'A gentle reminder'),
      ('Focus on being productive instead of busy.', 'Tim Ferriss'),
      ('One step, however small, is a step away from stuck.', 'A gentle reminder'),
      ('A year from now you may wish you had started today.', 'Karen Lamb'),
      ('Be patient with yourself. Nothing in nature blooms all year.', 'A gentle reminder'),
      ('The best way out is always through.', 'Robert Frost');
  END IF;
END $$;
