import { keyframes } from '@mui/material/styles'

export const FIRST_REACTION_WIDGET_ENTER_MS = 420
export const FIRST_REACTION_WIDGET_EXIT_MS = 320

export const firstReactionWidgetEnter = keyframes`
  from {
    opacity: 0;
    transform: scale(0.94) translateY(10px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
`

export const firstReactionWidgetExit = keyframes`
  from {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
  to {
    opacity: 0;
    transform: scale(0.97) translateY(-6px);
  }
`
