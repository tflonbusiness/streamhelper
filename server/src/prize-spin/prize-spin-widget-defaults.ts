export const PRIZE_SPIN_WIDGET_DEFAULTS = {
  width: 800,
  height: 800,
  equalSectorSlices: true,
} as const;

export const PRIZE_SPIN_WIDGET_INSERT_SQL = `
  INSERT INTO prize_spin_widget (account_id, width, height, equal_sector_slices)
  VALUES ($1, $2, $3, $4)
  ON CONFLICT (account_id) DO NOTHING
`;

export function prizeSpinWidgetInsertParams(
  accountId: number,
): [number, number, number, boolean] {
  return [
    accountId,
    PRIZE_SPIN_WIDGET_DEFAULTS.width,
    PRIZE_SPIN_WIDGET_DEFAULTS.height,
    PRIZE_SPIN_WIDGET_DEFAULTS.equalSectorSlices,
  ];
}
