CREATE TABLE user_module_favorites (
  user_id    BIGINT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  module_ids JSONB NOT NULL DEFAULT '[]'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT user_module_favorites_module_ids_is_array
    CHECK (jsonb_typeof(module_ids) = 'array')
);
