import { Box, Typography, Button, Card, CardContent } from '@mui/material'
import { Inbox as InboxIcon } from '@mui/icons-material'

interface EmptyStateProps {
  title: string
  description: string
  actionLabel?: string
  onAction?: () => void
  icon?: React.ReactNode
}

export default function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
  icon = <InboxIcon sx={{ fontSize: 64, color: '#bdbdbd', mb: 2 }} />,
}: EmptyStateProps) {
  return (
    <Card>
      <CardContent>
        <Box
          sx={{
            textAlign: 'center',
            py: 5,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          {icon}
          <Typography variant="h6" sx={{ fontWeight: 600, color: '#212121', mb: 1 }}>
            {title}
          </Typography>
          <Typography variant="body2" sx={{ color: '#757575', mb: 2, maxWidth: 400 }}>
            {description}
          </Typography>
          {actionLabel && onAction && (
            <Button variant="contained" onClick={onAction}>
              {actionLabel}
            </Button>
          )}
        </Box>
      </CardContent>
    </Card>
  )
}
