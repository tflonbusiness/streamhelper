export const CHAT_ROLL_WIDGET_DEFAULTS = {
  width: 500,
  height: 500,
} as const;

export const CHAT_ROLL_WIDGET_INSERT_SQL = `
  INSERT INTO chat_roll_widget (account_id, width, height)
  VALUES ($1, $2, $3)
  ON CONFLICT (account_id) DO NOTHING
`;

export function chatRollWidgetInsertParams(accountId: number): [number, number, number] {
  return [
    accountId,
    CHAT_ROLL_WIDGET_DEFAULTS.width,
    CHAT_ROLL_WIDGET_DEFAULTS.height,
  ];
}
