import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Stack,
  useTheme,
  alpha,
} from '@mui/material';
import { TrendingUp, TrendingDown } from '@mui/icons-material';

interface MetricsCardProps {
  title: string;
  value: string | number;
  total?: number;
  icon: React.ReactNode;
  color: string;
  trend?: string;
}

const MetricsCard: React.FC<MetricsCardProps> = ({ title, value, total, icon, color, trend }) => {
  const theme = useTheme();
  const isPositiveTrend = trend && trend.startsWith('+');

  return (
    <Card
      sx={{
        height: '100%',
        background: alpha(theme.palette.background.paper, 0.8),
        backdropFilter: 'blur(10px)',
        border: `1px solid ${alpha(color, 0.2)}`,
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: `0 8px 24px ${alpha(color, 0.2)}`,
        },
      }}
    >
      <CardContent>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
          <Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {title}
            </Typography>
            <Typography variant="h4" fontWeight={700}>
              {value}
              {total && (
                <Typography
                  component="span"
                  variant="body1"
                  color="text.secondary"
                  sx={{ ml: 1, fontSize: '1rem' }}
                >
                  / {total}
                </Typography>
              )}
            </Typography>
            {trend && (
              <Stack direction="row" alignItems="center" spacing={0.5} mt={1}>
                {isPositiveTrend ? (
                  <TrendingUp sx={{ fontSize: 16, color: theme.palette.success.main }} />
                ) : (
                  <TrendingDown sx={{ fontSize: 16, color: theme.palette.error.main }} />
                )}
                <Typography
                  variant="body2"
                  color={isPositiveTrend ? 'success.main' : 'error.main'}
                  fontWeight={600}
                >
                  {trend}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  vs last month
                </Typography>
              </Stack>
            )}
          </Box>
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: `linear-gradient(135deg, ${alpha(color, 0.2)} 0%, ${alpha(color, 0.1)} 100%)`,
              color: color,
            }}
          >
            {icon}
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
};

export default MetricsCard;
