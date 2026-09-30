ALTER TABLE chat_roll
  ADD COLUMN IF NOT EXISTS widget_keyword_prefix TEXT NOT NULL DEFAULT 'Кодовое слово для розыгрыша';
