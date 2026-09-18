import {
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
} from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import { useId, useState } from 'react'

export type RowAction = {
  id: string
  label: string
  icon?: React.ReactNode
  onClick: () => void
  disabled?: boolean
  destructive?: boolean
}

type RowActionsMenuProps = {
  actions: RowAction[]
  ariaLabel?: string
}

export function RowActionsMenu({
  actions,
  ariaLabel = 'Row actions',
}: RowActionsMenuProps) {
  const menuId = useId()
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const open = Boolean(anchorEl)

  if (actions.length === 0) {
    return null
  }

  return (
    <>
      <IconButton
        size="small"
        aria-label={ariaLabel}
        aria-controls={open ? menuId : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
        onClick={(event) => setAnchorEl(event.currentTarget)}
        sx={{
          bgcolor: 'primary.main',
          color: 'primary.contrastText',
          borderRadius: 1,
          width: 28,
          height: 28,
          '&:hover': {
            bgcolor: 'primary.dark',
          },
        }}
      >
        <ExpandMoreIcon sx={{ fontSize: 14 }} aria-hidden />
      </IconButton>
      <Menu
        id={menuId}
        anchorEl={anchorEl}
        open={open}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{ paper: { sx: { minWidth: 160 } } }}
      >
        {actions.map((action) => (
          <MenuItem
            key={action.id}
            disabled={action.disabled}
            onClick={() => {
              setAnchorEl(null)
              action.onClick()
            }}
            sx={action.destructive ? { color: 'error.main' } : undefined}
          >
            {action.icon ? (
              <ListItemIcon
                sx={{
                  minWidth: 32,
                  color: action.destructive ? 'error.main' : 'inherit',
                }}
              >
                {action.icon}
              </ListItemIcon>
            ) : null}
            <ListItemText>{action.label}</ListItemText>
          </MenuItem>
        ))}
      </Menu>
    </>
  )
}
