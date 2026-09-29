import { BONUS_BUY_WIDGET_DIMENSION_DEFAULTS } from './bonus-buy-widget-defaults.js';

export const BONUS_BUY_WIDGET_INSERT_SQL = `
  INSERT INTO bonus_buy_widget (account_id, width, height, preset_id)
  VALUES ($1, $2, $3, $4)
  ON CONFLICT (account_id) DO NOTHING
`;

export function bonusBuyWidgetInsertParams(
  accountId: number,
  presetId: number,
): [number, number, number, number] {
  return [
    accountId,
    BONUS_BUY_WIDGET_DIMENSION_DEFAULTS.width,
    BONUS_BUY_WIDGET_DIMENSION_DEFAULTS.height,
    presetId,
  ];
}
