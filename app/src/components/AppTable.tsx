import Box from '@mui/material/Box'
import Collapse from '@mui/material/Collapse'
import LinearProgress from '@mui/material/LinearProgress'
import IconButton from '@mui/material/IconButton'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TablePagination from '@mui/material/TablePagination'
import TableRow from '@mui/material/TableRow'
import type { SxProps, Theme } from '@mui/material/styles'
import { alpha, styled, useTheme } from '@mui/material/styles'
import DragIndicatorIcon from '@mui/icons-material/DragIndicator'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import { Fragment, useRef, useState, type DragEvent } from 'react'
import { useTranslation } from 'react-i18next'
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

export type AppTablePaginationConfig = {
  count: number
  page: number
  onPageChange: (page: number) => void
  rowsPerPage: number
}

export type AppTableRowReorderConfig<T> = {
  getRowId: (row: T) => number
  onReorder: (orderedRows: T[]) => void
  disabled?: boolean
  dragHandleAriaLabel?: string
}

type AppTableProps<T> = {
  columns: AppTableColumn<T>[]
  rows: T[]
  getRowKey: (row: T) => string | number
  emptyMessage?: React.ReactNode
  toolbar?: React.ReactNode
  footer?: React.ReactNode
  pagination?: AppTablePaginationConfig
  expandable?: AppTableExpandableConfig<T>
  getRowSx?: (row: T) => SxProps<Theme> | undefined
  onRowClick?: (row: T) => void
  loading?: boolean
  rowReorder?: AppTableRowReorderConfig<T>
}

const expandColumnWidth = 40
const dragColumnWidth = 36

const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
  border: '1px solid',
  borderColor: theme.palette.divider,
  borderRadius: theme.shape.borderRadius,
  overflow: 'hidden',
  backgroundColor: alpha(colors.neutral[100], 0.02),
}))

const StyledTableToolbar = styled(Box)(({ theme }) => ({
  paddingLeft: theme.spacing(2),
  paddingRight: theme.spacing(2),
  paddingTop: theme.spacing(1.5),
  paddingBottom: theme.spacing(1.5),
  borderBottom: '1px solid',
  borderColor: theme.palette.divider,
}))

const StyledTableFooter = styled(Box)(({ theme }) => ({
  borderTop: '1px solid',
  borderColor: theme.palette.divider,
}))

const StyledTableLoadingSpacer = styled(Box)(({ theme }) => ({
  minHeight: theme.spacing(15),
}))

const StyledProgressSlot = styled(Box)({
  height: 4,
  flexShrink: 0,
})

const StyledTableProgress = styled(LinearProgress, {
  shouldForwardProp: (prop) => prop !== 'active',
})<{ active?: boolean }>(({ active }) => ({
  height: 4,
  visibility: active ? 'visible' : 'hidden',
}))

const StyledTableEmpty = styled(Box)(({ theme }) => ({
  paddingLeft: theme.spacing(2),
  paddingRight: theme.spacing(2),
  paddingTop: theme.spacing(3),
  paddingBottom: theme.spacing(3),
  textAlign: 'center',
  color: theme.palette.text.secondary,
  fontSize: '0.875rem',
}))

const StyledTableEmptyContainer = styled(Box)(({ theme }) => ({
  border: '1px solid',
  borderColor: theme.palette.divider,
  borderRadius: theme.shape.borderRadius,
  overflow: 'hidden',
  backgroundColor: alpha(colors.neutral[100], 0.02),
  paddingLeft: theme.spacing(2),
  paddingRight: theme.spacing(2),
  paddingTop: theme.spacing(3),
  paddingBottom: theme.spacing(3),
  textAlign: 'center',
  color: theme.palette.text.secondary,
  fontSize: '0.875rem',
}))

const StyledTable = styled(Table)({
  tableLayout: 'fixed',
  width: '100%',
})

const StyledHeadRow = styled(TableRow)({
  backgroundColor: alpha(colors.neutral[100], 0.03),
})

const StyledHeadCell = styled(TableCell, {
  shouldForwardProp: (prop) => prop !== 'cellWidth' && prop !== 'cellMinWidth',
})<{ cellWidth?: number | string; cellMinWidth?: number | string }>(
  ({ theme, cellWidth, cellMinWidth }) => ({
    width: cellWidth,
    minWidth: cellMinWidth,
    borderBottom: '1px solid',
    borderColor: theme.palette.divider,
    color: theme.palette.text.secondary,
    fontSize: '0.6875rem',
    fontWeight: 600,
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    paddingTop: theme.spacing(1.25),
    paddingBottom: theme.spacing(1.25),
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
    whiteSpace: 'nowrap',
  }),
)

const StyledExpandHeadCell = styled(StyledHeadCell)({
  width: expandColumnWidth,
  minWidth: expandColumnWidth,
  paddingLeft: 8,
  paddingRight: 8,
})

const StyledDragHeadCell = styled(StyledHeadCell)({
  width: dragColumnWidth,
  minWidth: dragColumnWidth,
  paddingLeft: 4,
  paddingRight: 4,
})

const StyledDataRow = styled(TableRow)({
  transition: 'background-color 0.15s ease',
  '&:hover': {
    backgroundColor: alpha(colors.neutral[100], 0.04),
  },
  '&:last-child .MuiTableCell-root': {
    borderBottom: 0,
  },
})

const StyledBodyCell = styled(TableCell, {
  shouldForwardProp: (prop) => prop !== 'cellWidth' && prop !== 'cellMinWidth',
})<{ cellWidth?: number | string; cellMinWidth?: number | string }>(
  ({ theme, cellWidth, cellMinWidth }) => ({
    width: cellWidth,
    minWidth: cellMinWidth,
    borderBottom: '1px solid',
    borderColor: alpha(colors.neutral[100], 0.05),
    paddingTop: theme.spacing(1.5),
    paddingBottom: theme.spacing(1.5),
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
    fontSize: '0.875rem',
    verticalAlign: 'middle',
  }),
)

const StyledExpandBodyCell = styled(StyledBodyCell)({
  width: expandColumnWidth,
  minWidth: expandColumnWidth,
  paddingLeft: 8,
  paddingRight: 8,
})

const StyledDragBodyCell = styled(StyledBodyCell)({
  width: dragColumnWidth,
  minWidth: dragColumnWidth,
  paddingLeft: 4,
  paddingRight: 4,
  color: colors.neutral[400],
  cursor: 'grab',
  '&:active': {
    cursor: 'grabbing',
  },
})

const StyledExpandButton = styled(IconButton, {
  shouldForwardProp: (prop) => prop !== 'expanded',
})<{ expanded?: boolean }>(({ theme, expanded }) => ({
  width: 28,
  height: 28,
  color: theme.palette.text.secondary,
  transform: expanded ? 'rotate(180deg)' : 'none',
  transition: 'transform 0.15s ease',
}))

const StyledDetailRow = styled(TableRow)({})

const StyledDetailCell = styled(TableCell)({
  padding: 0,
  borderBottom: '1px solid',
  borderColor: alpha(colors.neutral[100], 0.05),
  'tr:last-child &': {
    borderBottom: 0,
  },
})

const StyledDetailPanel = styled(Box)(({ theme }) => ({
  paddingLeft: theme.spacing(2),
  paddingRight: theme.spacing(2),
  paddingTop: theme.spacing(1.5),
  paddingBottom: theme.spacing(1.5),
  backgroundColor: alpha(colors.neutral[100], 0.03),
  borderTop: '1px solid',
  borderColor: alpha(colors.neutral[100], 0.05),
}))

function draggingRowHighlightSx(theme: Theme): SxProps<Theme> {
  const accent = theme.palette.success.main

  return {
    '& .MuiTableCell-root': {
      backgroundColor: alpha(accent, 0.18),
      borderTop: `2px solid ${accent}`,
      borderBottom: `2px solid ${accent}`,
      '&:first-of-type': {
        borderLeft: `2px solid ${accent}`,
      },
      '&:last-of-type': {
        borderRight: `2px solid ${accent}`,
      },
    },
    position: 'relative',
    zIndex: 1,
    opacity: 0.92,
  }
}

function setTableRowDragImage(
  event: DragEvent<HTMLElement>,
  accentColor: string,
): HTMLElement | null {
  const handle = event.currentTarget
  const sourceRow = handle.closest('tr')
  const sourceTable = handle.closest('table')
  if (!sourceRow || !sourceTable) {
    return null
  }

  const dragTable = document.createElement('table')
  dragTable.style.position = 'fixed'
  dragTable.style.top = '-10000px'
  dragTable.style.left = '-10000px'
  dragTable.style.pointerEvents = 'none'
  dragTable.style.width = `${sourceRow.getBoundingClientRect().width}px`
  dragTable.style.tableLayout = 'fixed'
  dragTable.className = sourceTable.className

  const dragRow = sourceRow.cloneNode(true) as HTMLTableRowElement
  const dragFill = alpha(accentColor, 0.18)
  const cells = Array.from(dragRow.cells)
  cells.forEach((cell, index) => {
    cell.style.backgroundColor = dragFill
    cell.style.borderTop = `2px solid ${accentColor}`
    cell.style.borderBottom = `2px solid ${accentColor}`
    if (index === 0) {
      cell.style.borderLeft = `2px solid ${accentColor}`
    }
    if (index === cells.length - 1) {
      cell.style.borderRight = `2px solid ${accentColor}`
    }
  })
  dragTable.appendChild(dragRow)
  document.body.appendChild(dragTable)

  const handleRect = handle.getBoundingClientRect()
  const rowRect = sourceRow.getBoundingClientRect()
  const offsetX = handleRect.left - rowRect.left + event.nativeEvent.offsetX
  const offsetY = event.nativeEvent.offsetY

  event.dataTransfer.setDragImage(dragTable, offsetX, offsetY)
  return dragTable
}

const StyledTablePagination = styled(TablePagination)({
  border: 0,
  width: '100%',
  '& .MuiTablePagination-selectLabel': {
    display: 'none',
  },
  '& .MuiTablePagination-select': {
    display: 'none',
  },
  '& .MuiTablePagination-displayedRows': {
    marginLeft: 'auto',
  },
})

export function AppTable<T>({
  columns,
  rows,
  getRowKey,
  emptyMessage,
  toolbar,
  footer,
  pagination,
  expandable,
  getRowSx,
  onRowClick,
  loading = false,
  rowReorder,
}: AppTableProps<T>) {
  const { t } = useTranslation()
  const theme = useTheme()
  const [draggingRowId, setDraggingRowId] = useState<number | null>(null)
  const [dragOverRowId, setDragOverRowId] = useState<number | null>(null)
  const dragImageRef = useRef<HTMLElement | null>(null)
  const isEmpty = rows.length === 0
  const reorderEnabled = rowReorder != null && !rowReorder.disabled

  function reorderRows(dragId: number, targetId: number) {
    if (!rowReorder || dragId === targetId) {
      return
    }

    const fromIndex = rows.findIndex(
      (row) => rowReorder.getRowId(row) === dragId,
    )
    const toIndex = rows.findIndex(
      (row) => rowReorder.getRowId(row) === targetId,
    )
    if (fromIndex < 0 || toIndex < 0) {
      return
    }

    const next = [...rows]
    const [moved] = next.splice(fromIndex, 1)
    next.splice(toIndex, 0, moved)
    rowReorder.onReorder(next)
  }
  const showPagination = pagination != null && pagination.count > 0
  const showFooter = Boolean(footer) || showPagination

  if (isEmpty && emptyMessage && !toolbar && !loading) {
    return <StyledTableEmptyContainer>{emptyMessage}</StyledTableEmptyContainer>
  }

  return (
    <StyledTableContainer>
      {toolbar ? <StyledTableToolbar>{toolbar}</StyledTableToolbar> : null}
      <StyledProgressSlot aria-hidden={!loading}>
        <StyledTableProgress active={loading} aria-hidden={!loading} />
      </StyledProgressSlot>
      {isEmpty && !loading && emptyMessage ? (
        <StyledTableEmpty>{emptyMessage}</StyledTableEmpty>
      ) : !isEmpty ? (
        <StyledTable size="small">
          <colgroup>
            {expandable ? (
              <col style={{ width: expandColumnWidth, minWidth: expandColumnWidth }} />
            ) : null}
            {reorderEnabled ? (
              <col style={{ width: dragColumnWidth, minWidth: dragColumnWidth }} />
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
            <StyledHeadRow>
              {expandable ? <StyledExpandHeadCell /> : null}
              {reorderEnabled ? <StyledDragHeadCell aria-hidden /> : null}
              {columns.map((column) => (
                <StyledHeadCell
                  key={column.id}
                  align={column.align}
                  cellWidth={column.width}
                  cellMinWidth={column.minWidth}
                >
                  {column.header}
                </StyledHeadCell>
              ))}
            </StyledHeadRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => {
              const rowKey = getRowKey(row)
              const expanded = expandable?.isExpanded(row) ?? false
              const rowSx = getRowSx?.(row)
              const rowId = rowReorder?.getRowId(row)
              const isDragging =
                reorderEnabled &&
                rowId !== undefined &&
                draggingRowId === rowId
              const isDragOver =
                reorderEnabled &&
                rowId !== undefined &&
                dragOverRowId === rowId &&
                draggingRowId !== rowId

              return (
                <Fragment key={rowKey}>
                  <StyledDataRow
                    hover
                    sx={
                      isDragging
                        ? ([
                            ...(rowSx ? [rowSx] : []),
                            draggingRowHighlightSx(theme),
                          ] as SxProps<Theme>)
                        : isDragOver
                          ? ([
                              ...(rowSx ? [rowSx] : []),
                              {
                                backgroundColor: alpha(colors.neutral[100], 0.08),
                              },
                            ] as SxProps<Theme>)
                          : rowSx
                    }
                    onClick={onRowClick ? () => onRowClick(row) : undefined}
                    style={onRowClick ? { cursor: 'pointer' } : undefined}
                    onDragOver={
                      reorderEnabled && rowId !== undefined
                        ? (event) => {
                            event.preventDefault()
                            setDragOverRowId(rowId)
                          }
                        : undefined
                    }
                    onDrop={
                      reorderEnabled && rowId !== undefined
                        ? (event) => {
                            event.preventDefault()
                            const dragId = Number.parseInt(
                              event.dataTransfer.getData('text/plain'),
                              10,
                            )
                            if (Number.isFinite(dragId)) {
                              reorderRows(dragId, rowId)
                            }
                            setDraggingRowId(null)
                            setDragOverRowId(null)
                          }
                        : undefined
                    }
                    onDragLeave={
                      reorderEnabled
                        ? () => {
                            if (dragOverRowId === rowId) {
                              setDragOverRowId(null)
                            }
                          }
                        : undefined
                    }
                  >
                    {expandable ? (
                      <StyledExpandBodyCell>
                        <StyledExpandButton
                          size="small"
                          expanded={expanded}
                          aria-label={
                            expandable.ariaLabel?.(row) ??
                            (expanded
                              ? t('bonusBuy.collapseDetails')
                              : t('bonusBuy.expandDetails'))
                          }
                          aria-expanded={expanded}
                          onClick={() => expandable.onToggle(row)}
                        >
                          <ExpandMoreIcon sx={{ fontSize: 16 }} aria-hidden />
                        </StyledExpandButton>
                      </StyledExpandBodyCell>
                    ) : null}
                    {reorderEnabled && rowId !== undefined ? (
                      <StyledDragBodyCell
                        draggable
                        onDragStart={(event) => {
                          event.dataTransfer.setData(
                            'text/plain',
                            String(rowId),
                          )
                          event.dataTransfer.effectAllowed = 'move'
                          dragImageRef.current?.remove()
                          dragImageRef.current = setTableRowDragImage(
                            event,
                            theme.palette.success.main,
                          )
                          setDraggingRowId(rowId)
                        }}
                        onDragEnd={() => {
                          dragImageRef.current?.remove()
                          dragImageRef.current = null
                          setDraggingRowId(null)
                          setDragOverRowId(null)
                        }}
                        aria-label={
                          rowReorder?.dragHandleAriaLabel ??
                          t('table.dragRowAria')
                        }
                      >
                        <DragIndicatorIcon sx={{ fontSize: 18 }} aria-hidden />
                      </StyledDragBodyCell>
                    ) : null}
                    {columns.map((column) => (
                      <StyledBodyCell
                        key={column.id}
                        align={column.align}
                        cellWidth={column.width}
                        cellMinWidth={column.minWidth}
                        sx={column.sx}
                      >
                        {column.render(row)}
                      </StyledBodyCell>
                    ))}
                  </StyledDataRow>
                  {expandable && expanded ? (
                    <StyledDetailRow key={`${rowKey}-details`}>
                      <StyledDetailCell
                        colSpan={
                          columns.length +
                          (expandable ? 1 : 0) +
                          (reorderEnabled ? 1 : 0)
                        }
                      >
                        <Collapse in timeout="auto">
                          <StyledDetailPanel>
                            {expandable.renderDetail(row)}
                          </StyledDetailPanel>
                        </Collapse>
                      </StyledDetailCell>
                    </StyledDetailRow>
                  ) : null}
                </Fragment>
              )
            })}
          </TableBody>
        </StyledTable>
      ) : loading ? (
        <StyledTableLoadingSpacer />
      ) : null}
      {showFooter ? (
        <StyledTableFooter>
          {footer}
          {showPagination ? (
            <StyledTablePagination
              slots={{ root: 'div' }}
              count={pagination.count}
              page={pagination.page - 1}
              onPageChange={(_, newPage) => pagination.onPageChange(newPage + 1)}
              rowsPerPage={pagination.rowsPerPage}
              rowsPerPageOptions={[pagination.rowsPerPage]}
              labelRowsPerPage=""
              labelDisplayedRows={({ from, to, count }) =>
                count !== -1
                  ? t('table.displayedRows', { from, to, count })
                  : t('table.displayedRowsMoreThan', { to })
              }
            />
          ) : null}
        </StyledTableFooter>
      ) : null}
    </StyledTableContainer>
  )
}
