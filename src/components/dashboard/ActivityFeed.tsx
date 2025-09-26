import React from 'react';
import {
  Paper,
  Typography,
  Box,
  Stack,
  Avatar,
  Chip,
  Divider,
  useTheme,
  alpha,
} from '@mui/material';
import {
  CheckCircle as CheckIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
} from '@mui/icons-material';

const ActivityFeed: React.FC = () => {
  const theme = useTheme();

  const activities = [
    {
      id: 1,
      type: 'success',
      title: 'Deployment Successful',
      description: 'Production deployment completed for E-Commerce Platform',
      time: '2 minutes ago',
      icon: <CheckIcon />,
      color: theme.palette.success.main,
    },
    {
      id: 2,
      type: 'warning',
      title: 'Code Review Required',
      description: 'Python Expert flagged 3 issues in authentication module',
      time: '15 minutes ago',
      icon: <WarningIcon />,
      color: theme.palette.warning.main,
    },
    {
      id: 3,
      type: 'info',
      title: 'New Agent Assigned',
      description: 'CodeRabbit Agent joined the Analytics Dashboard project',
      time: '1 hour ago',
      icon: <InfoIcon />,
      color: theme.palette.info.main,
    },
    {
      id: 4,
      type: 'success',
      title: 'Testing Completed',
      description: 'All unit tests passed with 95% coverage',
      time: '2 hours ago',
      icon: <CheckIcon />,
      color: theme.palette.success.main,
    },
    {
      id: 5,
      type: 'error',
      title: 'Build Failed',
      description: 'CI/CD pipeline failed for feature/payment-integration branch',
      time: '3 hours ago',
      icon: <ErrorIcon />,
      color: theme.palette.error.main,
    },
  ];

  return (
    <Paper sx={{ p: 3, borderRadius: 2, height: '100%' }}>
      <Typography variant="h6" fontWeight={600} gutterBottom>
        Recent Activity
      </Typography>
      <Stack spacing={2} divider={<Divider />}>
        {activities.map((activity) => (
          <Box key={activity.id}>
            <Stack direction="row" spacing={2}>
              <Avatar
                sx={{
                  width: 36,
                  height: 36,
                  bgcolor: alpha(activity.color, 0.1),
                  color: activity.color,
                }}
              >
                {activity.icon}
              </Avatar>
              <Box flex={1}>
                <Typography variant="subtitle2" fontWeight={600}>
                  {activity.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                  {activity.description}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {activity.time}
                </Typography>
              </Box>
            </Stack>
          </Box>
        ))}
      </Stack>
    </Paper>
  );
};

export default ActivityFeed;
