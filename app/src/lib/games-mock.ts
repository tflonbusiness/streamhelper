import type { SvgIconComponent } from '@mui/icons-material'
import AdjustIcon from '@mui/icons-material/Adjust'
import BoltIcon from '@mui/icons-material/Bolt'
import CellTowerIcon from '@mui/icons-material/CellTower'
import LockIcon from '@mui/icons-material/Lock'
import PaletteIcon from '@mui/icons-material/Palette'
import TagIcon from '@mui/icons-material/Tag'
import TimerIcon from '@mui/icons-material/Timer'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'

import type { ModuleIconVariant } from '@/lib/modules'

export type MockGame = {
  id: string
  name: string
  icon: SvgIconComponent
  iconVariant: ModuleIconVariant
  tag: string
}

export const MOCK_GAMES: MockGame[] = [
  {
    id: 'wheel',
    name: 'Wheel of Fortune',
    icon: AdjustIcon,
    iconVariant: 'primary',
    tag: 'Luck',
  },
  {
    id: 'first-reaction',
    name: 'First Reaction',
    icon: BoltIcon,
    iconVariant: 'warning',
    tag: 'Speed',
  },
  {
    id: 'growing-jackpot',
    name: 'Growing Jackpot',
    icon: TrendingUpIcon,
    iconVariant: 'success',
    tag: 'Jackpot',
  },
  {
    id: 'red-vs-black',
    name: 'Red vs Black',
    icon: PaletteIcon,
    iconVariant: 'danger',
    tag: 'Choice',
  },
  {
    id: 'tower',
    name: 'Tower',
    icon: CellTowerIcon,
    iconVariant: 'info',
    tag: 'Risk',
  },
  {
    id: 'safe-crack',
    name: 'Safe Crack',
    icon: LockIcon,
    iconVariant: 'muted',
    tag: 'Puzzle',
  },
  {
    id: 'limit-50',
    name: 'Limit 50',
    icon: TagIcon,
    iconVariant: 'purple',
    tag: 'Numbers',
  },
  {
    id: 'marathon',
    name: 'Marathon',
    icon: TimerIcon,
    iconVariant: 'success',
    tag: 'Endurance',
  },
]
