ALTER TABLE prize_spin_widget
  ADD COLUMN IF NOT EXISTS equal_sector_slices BOOLEAN NOT NULL DEFAULT true;
