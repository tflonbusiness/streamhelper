export const MODULES_ROUTE = '/modules'

export const BONUS_BUY_ROUTE = '/modules/bonus-buy'
export const bonusBuySessionRoute = (id: number | string) =>
  `/modules/bonus-buy/${id}`
export const bonusBuyWidgetRoute = (id: number | string) =>
  `/modules/bonus-buy/${id}/widget`

export const PRIZE_SPIN_ROUTE = '/modules/prize-spin'
export const prizeSpinSessionRoute = (id: number | string) =>
  `/modules/prize-spin/${id}`
export const prizeSpinWidgetRoute = (id: number | string) =>
  `/modules/prize-spin/${id}/widget`

export const CHAT_ROLL_ROUTE = '/modules/chat-roll'
export const chatRollSessionRoute = (id: number | string) =>
  `/modules/chat-roll/${id}`
