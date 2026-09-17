import * as XLSX from 'xlsx'
import type { PrizeSpinWin } from '@/api/prize-spin'

function formatDateTime(iso: string): string {
  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(iso))
}

function formatExportDate(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function buildWinnersFilename(sessionId: number): string {
  return `prize-spin-${sessionId}-winners-${formatExportDate(new Date())}.xlsx`
}

function mapWinsToRows(wins: PrizeSpinWin[]) {
  return wins.map((win) => ({
    'Participant nick': win.participantNick,
    Prize: win.sectorLabel,
    'Spun by': win.spunByName,
    Time: formatDateTime(win.createdAt),
  }))
}

export function buildWinnersXlsxBlob(wins: PrizeSpinWin[]): Blob {
  const worksheet = XLSX.utils.json_to_sheet(mapWinsToRows(wins))
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Winners')

  const buffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' }) as ArrayBuffer

  return new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  })
}

export function downloadWinnersXlsx(wins: PrizeSpinWin[], sessionId: number): void {
  const blob = buildWinnersXlsxBlob(wins)
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = buildWinnersFilename(sessionId)
  anchor.click()
  URL.revokeObjectURL(url)
}
