import type { LucideIcon } from 'lucide-react'
import {
  CircleDot,
  Hash,
  Lock,
  Palette,
  Timer,
  TowerControl,
  TrendingUp,
  Zap,
} from 'lucide-react'

import type { ModuleIconVariant } from '@/lib/modules'

export type MockGame = {
  id: string
  name: string
  icon: LucideIcon
  iconVariant: ModuleIconVariant
  tag: string
}

export const MOCK_GAMES: MockGame[] = [
  {
    id: 'wheel',
    name: 'Wheel of Fortune',
    icon: CircleDot,
    iconVariant: 'primary',
    tag: 'Luck',
  },
  {
    id: 'first-reaction',
    name: 'First Reaction',
    icon: Zap,
    iconVariant: 'warning',
    tag: 'Speed',
  },
  {
    id: 'growing-jackpot',
    name: 'Growing Jackpot',
    icon: TrendingUp,
    iconVariant: 'success',
    tag: 'Jackpot',
  },
  {
    id: 'red-vs-black',
    name: 'Red vs Black',
    icon: Palette,
    iconVariant: 'danger',
    tag: 'Choice',
  },
  {
    id: 'tower',
    name: 'Tower',
    icon: TowerControl,
    iconVariant: 'info',
    tag: 'Risk',
  },
  {
    id: 'safe-crack',
    name: 'Safe Crack',
    icon: Lock,
    iconVariant: 'muted',
    tag: 'Puzzle',
  },
  {
    id: 'limit-50',
    name: 'Limit 50',
    icon: Hash,
    iconVariant: 'purple',
    tag: 'Numbers',
  },
  {
    id: 'marathon',
    name: 'Marathon',
    icon: Timer,
    iconVariant: 'success',
    tag: 'Endurance',
  },
]
