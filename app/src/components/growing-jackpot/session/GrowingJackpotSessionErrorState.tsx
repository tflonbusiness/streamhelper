import { Typography } from '@mui/material'
import { ModulePageShell } from '@/components/ModulePageShell'

type GrowingJackpotSessionErrorStateProps = {
  message: string
}

export function GrowingJackpotSessionErrorState({
  message,
}: GrowingJackpotSessionErrorStateProps) {
  return (
    <ModulePageShell moduleId="growing-jackpot">
      <Typography color="error">{message}</Typography>
    </ModulePageShell>
  )
}
