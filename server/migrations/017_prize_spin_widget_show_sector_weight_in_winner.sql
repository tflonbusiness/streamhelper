ALTER TABLE prize_spin_widget
  ADD COLUMN IF NOT EXISTS show_sector_weight_in_winner BOOLEAN NOT NULL DEFAULT false;
