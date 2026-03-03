import { Box, Button, Stack, Typography } from '@mui/material'
import { ReactNode } from 'react'

interface PageLayoutProps {
  title: string
  actionLabel?: string
  onAction?: () => void
  actionDisabled?: boolean
  children: ReactNode
}

export default function PageLayout({ title, actionLabel, onAction, actionDisabled, children }: PageLayoutProps) {
  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>{title}</Typography>
        {actionLabel && onAction ? (
          <Button variant="contained" onClick={onAction} disabled={actionDisabled}>
            {actionLabel}
          </Button>
        ) : null}
      </Stack>
      {children}
    </Box>
  )
}
