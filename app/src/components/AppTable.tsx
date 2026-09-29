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
import { alpha, styled } from '@mui/material/styles'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import { Fragment } from 'react'
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
  loading?: boolean
}

const expandColumnWidth = 40

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
  loading = false,
}: AppTableProps<T>) {
  const { t } = useTranslation()
  const isEmpty = rows.length === 0
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

              return (
                <Fragment key={rowKey}>
                  <StyledDataRow hover sx={rowSx}>
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
                      <StyledDetailCell colSpan={columns.length + 1}>
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
