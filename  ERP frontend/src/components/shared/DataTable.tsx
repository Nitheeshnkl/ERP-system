import { DataGrid, GridColDef, GridPaginationModel } from '@mui/x-data-grid'
import { Paper } from '@mui/material'

interface DataTableProps<T extends { id: string }> {
  rows: T[]
  columns: GridColDef[]
  loading?: boolean
  page: number
  pageSize: number
  rowCount: number
  onPaginationModelChange: (model: GridPaginationModel) => void
}

export default function DataTable<T extends { id: string }>({
  rows,
  columns,
  loading = false,
  page,
  pageSize,
  rowCount,
  onPaginationModelChange,
}: DataTableProps<T>) {
  return (
    <Paper>
      <DataGrid
        autoHeight
        rows={rows}
        columns={columns}
        loading={loading}
        paginationMode="server"
        rowCount={rowCount}
        paginationModel={{ page: Math.max(page - 1, 0), pageSize }}
        onPaginationModelChange={onPaginationModelChange}
        pageSizeOptions={[10, 20, 50]}
        disableRowSelectionOnClick
      />
    </Paper>
  )
}
