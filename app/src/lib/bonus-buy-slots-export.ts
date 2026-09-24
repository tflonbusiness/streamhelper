import { Decimal } from 'decimal.js'
import * as XLSX from 'xlsx'
import type { BonusBuySlot } from '@/api/bonus-buy'

function formatExportDate(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function buildSlotsFilename(sessionId: number): string {
  return `bonus-buy-${sessionId}-slots-${formatExportDate(new Date())}.xlsx`
}

function toExportNumber(value: string | null): number | '' {
  if (value === null || value.trim() === '') {
    return ''
  }
  return new Decimal(value).toNumber()
}

function mapSlotsToRows(slots: BonusBuySlot[]) {
  return slots.map((slot) => ({
    'Slot name': slot.name,
    Purchase: toExportNumber(slot.purchaseAmount),
    Win: toExportNumber(slot.winAmount),
    Multiplier: toExportNumber(slot.multiplier),
    'Username/Note': slot.providerName ?? '',
  }))
}

export function buildBonusBuySlotsXlsxBlob(slots: BonusBuySlot[]): Blob {
  const worksheet = XLSX.utils.json_to_sheet(mapSlotsToRows(slots))
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Bonus list')

  const buffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' }) as ArrayBuffer

  return new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  })
}

export function downloadBonusBuySlotsXlsx(
  slots: BonusBuySlot[],
  sessionId: number,
): void {
  const blob = buildBonusBuySlotsXlsxBlob(slots)
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = buildSlotsFilename(sessionId)
  anchor.click()
  URL.revokeObjectURL(url)
}
