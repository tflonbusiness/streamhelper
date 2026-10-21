export const FIRST_REACTION_WIDGET_DEFAULTS = {
  width: 500,
  height: 500,
} as const;

export const FIRST_REACTION_WIDGET_INSERT_SQL = `
  INSERT INTO first_reaction_widget (account_id, width, height, preset_id)
  VALUES ($1, $2, $3, $4)
  ON CONFLICT (account_id) DO NOTHING
`;

export function firstReactionWidgetInsertParams(
  accountId: number,
  width: number,
  height: number,
  presetId: number,
): [number, number, number, number] {
  return [accountId, width, height, presetId];
}
