ALTER TABLE account_subscriptions
  ADD COLUMN purchase_price NUMERIC(12, 2);

COMMENT ON COLUMN account_subscriptions.purchase_price IS
  'Amount paid when the current paid period was granted; NULL for trial / no purchase.';
