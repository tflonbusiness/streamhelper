export const FIRST_REACTION_WIDGET_DEFAULTS = {
  width: 500,
  height: 500,
} as const;

export const FIRST_REACTION_WIDGET_INSERT_SQL = `
  INSERT INTO first_reaction_widget (account_id, width, height)
  VALUES ($1, $2, $3)
  ON CONFLICT (account_id) DO NOTHING
`;

export function firstReactionWidgetInsertParams(
  accountId: number,
): [number, number, number] {
  return [
    accountId,
    FIRST_REACTION_WIDGET_DEFAULTS.width,
    FIRST_REACTION_WIDGET_DEFAULTS.height,
  ];
}
