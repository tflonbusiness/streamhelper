CREATE TABLE first_reaction_widget_style_preset (
  id                  BIGSERIAL PRIMARY KEY,
  account_id          BIGINT REFERENCES accounts(id) ON DELETE CASCADE,
  created_by_user_id  BIGINT REFERENCES users(id),
  source              TEXT NOT NULL CHECK (source IN ('system', 'user')),
  name                TEXT NOT NULL,
  style_settings      JSONB NOT NULL,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (
    (source = 'system' AND account_id IS NULL AND created_by_user_id IS NULL)
    OR (source = 'user' AND account_id IS NOT NULL AND created_by_user_id IS NOT NULL)
  )
);

CREATE UNIQUE INDEX idx_first_reaction_widget_style_preset_system_name
  ON first_reaction_widget_style_preset (name)
  WHERE source = 'system';

CREATE UNIQUE INDEX idx_first_reaction_widget_style_preset_account_user
  ON first_reaction_widget_style_preset (account_id)
  WHERE source = 'user';

INSERT INTO first_reaction_widget_style_preset (source, name, style_settings) VALUES
  ('system', 'Main', '{"boltFillStart":"#FFF9C4","boltFillEnd":"#FFC107","boltStroke":"#FFFDE7","boltGlow":"#FFE566","textHint":"#FFF8E6","textKeyword":"#FFFEF7","textTimer":"#FFF8DC"}'::jsonb),
  ('system', 'Classic', '{"boltFillStart":"#FFF000","boltFillEnd":"#E6A800","boltStroke":"#FFF5B8","boltGlow":"#FFD54F","textHint":"#E8E0C8","textKeyword":"#FFFEF5","textTimer":"#F5E6B8"}'::jsonb),
  ('system', 'Electric', '{"boltFillStart":"#E0F4FF","boltFillEnd":"#269BFF","boltStroke":"#F0FAFF","boltGlow":"#5CB8FF","textHint":"#B8D4F0","textKeyword":"#F5FAFF","textTimer":"#C8E4FF"}'::jsonb),
  ('system', 'Ruby', '{"boltFillStart":"#FFD0D8","boltFillEnd":"#E6193C","boltStroke":"#FFE8EC","boltGlow":"#FF6B85","textHint":"#F0C8D0","textKeyword":"#FFF5F7","textTimer":"#FFC8D4"}'::jsonb),
  ('system', 'Purple', '{"boltFillStart":"#F0D4FF","boltFillEnd":"#A855F7","boltStroke":"#F8EEFF","boltGlow":"#C084FC","textHint":"#D8C8F0","textKeyword":"#FBF5FF","textTimer":"#E8D4FF"}'::jsonb),
  ('system', 'Midnight', '{"boltFillStart":"#E7E7E9","boltFillEnd":"#9CA3AF","boltStroke":"#F4F4F5","boltGlow":"#D4D4D8","textHint":"#A1A1AA","textKeyword":"#FAFAFA","textTimer":"#D4D4D8"}'::jsonb),
  ('system', 'Neon', '{"boltFillStart":"#FFE0F8","boltFillEnd":"#FF2BD6","boltStroke":"#FFF0FA","boltGlow":"#FF6BE8","textHint":"#F0C8E8","textKeyword":"#FFF5FC","textTimer":"#FFC8F0"}'::jsonb);

ALTER TABLE first_reaction_widget
  ADD COLUMN IF NOT EXISTS preset_id BIGINT REFERENCES first_reaction_widget_style_preset(id);

UPDATE first_reaction_widget
SET preset_id = (
  SELECT id FROM first_reaction_widget_style_preset
  WHERE source = 'system' AND name = 'Main'
  LIMIT 1
)
WHERE preset_id IS NULL;

ALTER TABLE first_reaction_widget
  ALTER COLUMN preset_id SET NOT NULL;

ALTER TABLE first_reaction_widget
  DROP COLUMN IF EXISTS style;
