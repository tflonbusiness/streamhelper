import Box from '@mui/material/Box'
import Collapse from '@mui/material/Collapse'
import IconButton from '@mui/material/IconButton'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import type { SxProps, Theme } from '@mui/material/styles'
import { alpha } from '@mui/material/styles'
import { ChevronDown } from 'lucide-react'
import { Fragment } from 'react'
import { colors } from '@/theme/colors'

export type AppTableColumn<T> = {
  id: string
  header: React.ReactNode
  align?: 'left' | 'right' | 'center'
  width?: number | string
  minWidth?: number | string
  sx?: SxProps<Theme>
  render: (row: T) => React.ReactNode
}

export type AppTableExpandableConfig<T> = {
  isExpanded: (row: T) => boolean
  onToggle: (row: T) => void
  renderDetail: (row: T) => React.ReactNode
  ariaLabel?: (row: T) => string
}

type AppTableProps<T> = {
  columns: AppTableColumn<T>[]
  rows: T[]
  getRowKey: (row: T) => string | number
  emptyMessage?: React.ReactNode
  expandable?: AppTableExpandableConfig<T>
  getRowSx?: (row: T) => SxProps<Theme> | undefined
}

const tableContainerSx: SxProps<Theme> = {
  border: '1px solid',
  borderColor: 'divider',
  borderRadius: 1,
  overflow: 'hidden',
  bgcolor: alpha(colors.neutral[100], 0.02),
}

const tableSx: SxProps<Theme> = {
  '& .MuiTableHead-root .MuiTableRow-root': {
    bgcolor: alpha(colors.neutral[100], 0.03),
  },
  '& .MuiTableHead-root .MuiTableCell-root': {
    borderBottom: '1px solid',
    borderColor: 'divider',
    color: 'text.secondary',
    fontSize: '0.6875rem',
    fontWeight: 600,
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    py: 1.25,
    px: 2,
    whiteSpace: 'nowrap',
  },
  '& .MuiTableBody-root .MuiTableRow-root:not(.app-table-detail-row) .MuiTableCell-root': {
    borderBottom: '1px solid',
    borderColor: alpha(colors.neutral[100], 0.05),
    py: 1.5,
    px: 2,
    fontSize: '0.875rem',
    verticalAlign: 'middle',
  },
  '& .MuiTableBody-root .MuiTableRow-root': {
    transition: 'background-color 0.15s ease',
  },
  '& .MuiTableBody-root .MuiTableRow-root:hover': {
    bgcolor: alpha(colors.neutral[100], 0.04),
  },
  '& .MuiTableBody-root .MuiTableRow-root:last-child .MuiTableCell-root': {
    borderBottom: 0,
  },
}

const expandColumnWidth = 40

export function AppTable<T>({
  columns,
  rows,
  getRowKey,
  emptyMessage,
  expandable,
  getRowSx,
}: AppTableProps<T>) {
  if (rows.length === 0 && emptyMessage) {
    return (
      <Box
        sx={{
          ...tableContainerSx,
          px: 2,
          py: 3,
          textAlign: 'center',
          color: 'text.secondary',
          fontSize: '0.875rem',
        }}
      >
        {emptyMessage}
      </Box>
    )
  }

  return (
    <TableContainer sx={tableContainerSx}>
      <Table size="small" sx={{ ...tableSx, tableLayout: 'fixed', width: '100%' }}>
        <colgroup>
          {expandable ? (
            <col style={{ width: expandColumnWidth, minWidth: expandColumnWidth }} />
          ) : null}
          {columns.map((column) => (
            <col
              key={column.id}
              style={{
                width: column.width ?? column.minWidth,
                minWidth: column.minWidth,
              }}
            />
          ))}
        </colgroup>
        <TableHead>
          <TableRow>
            {expandable ? (
              <TableCell
                sx={{ width: expandColumnWidth, minWidth: expandColumnWidth, px: 1 }}
              />
            ) : null}
            {columns.map((column) => (
              <TableCell
                key={column.id}
                align={column.align}
                sx={{ width: column.width, minWidth: column.minWidth }}
              >
                {column.header}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row) => {
            const rowKey = getRowKey(row)
            const expanded = expandable?.isExpanded(row) ?? false
            const rowSx = getRowSx?.(row)

            return (
              <Fragment key={rowKey}>
                <TableRow hover sx={rowSx}>
                  {expandable ? (
                    <TableCell sx={{ width: expandColumnWidth, px: 1 }}>
                      <IconButton
                        size="small"
                        aria-label={
                          expandable.ariaLabel?.(row) ??
                          (expanded ? 'Collapse details' : 'Expand details')
                        }
                        aria-expanded={expanded}
                        onClick={() => expandable.onToggle(row)}
                        sx={{
                          width: 28,
                          height: 28,
                          color: 'text.secondary',
                          transform: expanded ? 'rotate(180deg)' : 'none',
                          transition: 'transform 0.15s ease',
                        }}
                      >
                        <ChevronDown size={16} aria-hidden />
                      </IconButton>
                    </TableCell>
                  ) : null}
                  {columns.map((column) => (
                    <TableCell
                      key={column.id}
                      align={column.align}
                      sx={{
                        width: column.width,
                        minWidth: column.minWidth,
                        ...(column.sx as object),
                      }}
                    >
                      {column.render(row)}
                    </TableCell>
                  ))}
                </TableRow>
                {expandable && expanded ? (
                  <TableRow key={`${rowKey}-details`} className="app-table-detail-row">
                    <TableCell
                      colSpan={columns.length + 1}
                      sx={{
                        p: 0,
                        borderBottom: '1px solid',
                        borderColor: alpha(colors.neutral[100], 0.05),
                      }}
                    >
                      <Collapse in timeout="auto">
                        <Box
                          sx={{
                            px: 2,
                            py: 1.5,
                            bgcolor: alpha(colors.neutral[100], 0.03),
                            borderTop: '1px solid',
                            borderColor: alpha(colors.neutral[100], 0.05),
                          }}
                        >
                          {expandable.renderDetail(row)}
                        </Box>
                      </Collapse>
                    </TableCell>
                  </TableRow>
                ) : null}
              </Fragment>
            )
          })}
        </TableBody>
      </Table>
    </TableContainer>
  )
}
