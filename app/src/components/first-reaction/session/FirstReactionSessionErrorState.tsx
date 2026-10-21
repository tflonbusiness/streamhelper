import { Typography } from '@mui/material'
import { ModulePageShell } from '@/components/ModulePageShell'

type FirstReactionSessionErrorStateProps = {
  message: string
}

export function FirstReactionSessionErrorState({
  message,
}: FirstReactionSessionErrorStateProps) {
  return (
    <ModulePageShell moduleId="first-reaction">
      <Typography color="error">{message}</Typography>
    </ModulePageShell>
  )
}
