import { Skeleton, Box, Grid, Card, CardContent } from '@mui/material'

export function TableRowSkeleton() {
  return (
    <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
      <Skeleton variant="text" width="10%" />
      <Skeleton variant="text" width="20%" />
      <Skeleton variant="text" width="15%" />
      <Skeleton variant="text" width="15%" />
      <Skeleton variant="text" width="10%" />
    </Box>
  )
}

export function KPICardSkeleton() {
  return (
    <Card>
      <CardContent>
        <Skeleton variant="text" width="60%" height={24} sx={{ mb: 1 }} />
        <Skeleton variant="text" width="40%" height={32} />
      </CardContent>
    </Card>
  )
}

export function DashboardSkeleton() {
  return (
    <Box>
      <Skeleton variant="text" width="20%" height={40} sx={{ mb: 3 }} />
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {[1, 2, 3, 4].map((i) => (
          <Grid item xs={12} sm={6} md={3} key={i}>
            <KPICardSkeleton />
          </Grid>
        ))}
      </Grid>
      <Card>
        <CardContent>
          <Skeleton variant="text" width="15%" height={24} sx={{ mb: 2 }} />
          <Skeleton variant="rectangular" height={300} />
        </CardContent>
      </Card>
    </Box>
  )
}

export function DataTableSkeleton() {
  return (
    <Box>
      <Skeleton variant="text" width="20%" height={40} sx={{ mb: 3 }} />
      <Card>
        <CardContent>
          {[1, 2, 3, 4, 5].map((i) => (
            <TableRowSkeleton key={i} />
          ))}
        </CardContent>
      </Card>
    </Box>
  )
}
