ALTER TABLE growing_jackpot_widget
  ADD COLUMN IF NOT EXISTS style JSONB NOT NULL DEFAULT '{
    "prizeText": "#d4af37",
    "prizeTextDim": "rgba(212, 175, 55, 0.85)",
    "keywordText": "#fff8e6",
    "timerText": "#fff8dc"
  }'::jsonb;
