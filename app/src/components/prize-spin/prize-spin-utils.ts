import { formatDateTime } from '@/lib/format-date-time'

export function formatPrizeSpinDateTime(iso: string): string {
  return formatDateTime(iso)
}
