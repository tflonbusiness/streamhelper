ALTER TABLE first_reaction_widget
  ADD COLUMN IF NOT EXISTS style JSONB NOT NULL DEFAULT '{
    "boltFillStart": "#FFF9C4",
    "boltFillEnd": "#FFC107",
    "boltStroke": "#FFFDE7",
    "boltGlow": "#FFE566",
    "textHint": "#FFF8E6",
    "textKeyword": "#FFFEF7",
    "textTimer": "#FFF8DC"
  }'::jsonb;
