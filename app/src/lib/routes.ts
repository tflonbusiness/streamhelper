export const MODULES_ROUTE = '/modules'

export const BONUS_BUY_ROUTE = '/modules/bonus-buy'
export const bonusBuySessionRoute = (id: number | string) =>
  `/modules/bonus-buy/${id}`
export const bonusBuyWidgetRoute = (accountUcid: string) =>
  `/modules/bonus-buy/widget/${accountUcid}`

export const PRIZE_SPIN_ROUTE = '/modules/prize-spin'
export const prizeSpinSessionRoute = (id: number | string) =>
  `/modules/prize-spin/${id}`
export const prizeSpinWidgetRoute = (accountUcid: string) =>
  `/modules/prize-spin/widget/${accountUcid}`

export const MEDIA_INTERACTIVE_ROUTE = '/modules/media-interactive'
export const mediaInteractiveWidgetRoute = (accountUcid: string) =>
  `/modules/media-interactive/widget/${accountUcid}`

export const CHAT_ROLL_ROUTE = '/modules/chat-roll'
export const chatRollSessionRoute = (id: number | string) =>
  `/modules/chat-roll/${id}`
export const chatRollWidgetRoute = (accountUcid: string) =>
  `/modules/chat-roll/widget/${accountUcid}`

export const FIRST_REACTION_ROUTE = '/modules/first-reaction'
export const firstReactionSessionRoute = (id: number | string) =>
  `/modules/first-reaction/${id}`
export const firstReactionWidgetRoute = (accountUcid: string) =>
  `/modules/first-reaction/widget/${accountUcid}`

export const GROWING_JACKPOT_ROUTE = '/modules/growing-jackpot'
export const growingJackpotSessionRoute = (id: number | string) =>
  `/modules/growing-jackpot/${id}`
export const growingJackpotWidgetRoute = (accountUcid: string) =>
  `/modules/growing-jackpot/widget/${accountUcid}`
