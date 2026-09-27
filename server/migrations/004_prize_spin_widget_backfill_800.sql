-- Legacy bootstrap used 500×500; spec standard is 800×800.
UPDATE prize_spin_widget
SET
  width = 800,
  height = 800,
  updated_at = now()
WHERE width = 500 AND height = 500;
