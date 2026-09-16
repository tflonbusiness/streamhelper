export const BONUS_BUY_WIDGET_DEFAULTS = {
  width: 500,
  height: 600,
  backgroundColor: '#0A0A0C',
  surfaceColor: '#121215',
  borderColor: '#2F2F31',
  accentColor: '#F59E0B',
  positiveColor: '#10B981',
  negativeColor: '#EF4444',
  liveColor: '#FF2222',
  textMutedColor: '#9CA3AF',
  borderRadius: 20,
  padding: 18,
  fontFamily: 'Inter, system-ui, sans-serif',
} as const;

export const BONUS_BUY_WIDGET_INSERT_SQL = `
  INSERT INTO bonus_buy_widget (
    account_id,
    width,
    height,
    background_color,
    surface_color,
    border_color,
    accent_color,
    positive_color,
    negative_color,
    live_color,
    text_muted_color,
    border_radius,
    padding,
    font_family
  )
  VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
  ON CONFLICT (account_id) DO NOTHING
`;

export function bonusBuyWidgetInsertParams(accountId: number): [
  number,
  number,
  number,
  string,
  string,
  string,
  string,
  string,
  string,
  string,
  string,
  number,
  number,
  string,
] {
  return [
    accountId,
    BONUS_BUY_WIDGET_DEFAULTS.width,
    BONUS_BUY_WIDGET_DEFAULTS.height,
    BONUS_BUY_WIDGET_DEFAULTS.backgroundColor,
    BONUS_BUY_WIDGET_DEFAULTS.surfaceColor,
    BONUS_BUY_WIDGET_DEFAULTS.borderColor,
    BONUS_BUY_WIDGET_DEFAULTS.accentColor,
    BONUS_BUY_WIDGET_DEFAULTS.positiveColor,
    BONUS_BUY_WIDGET_DEFAULTS.negativeColor,
    BONUS_BUY_WIDGET_DEFAULTS.liveColor,
    BONUS_BUY_WIDGET_DEFAULTS.textMutedColor,
    BONUS_BUY_WIDGET_DEFAULTS.borderRadius,
    BONUS_BUY_WIDGET_DEFAULTS.padding,
    BONUS_BUY_WIDGET_DEFAULTS.fontFamily,
  ];
}
