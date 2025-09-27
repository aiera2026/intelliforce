import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Stack,
  Avatar,
  Chip,
  LinearProgress,
  useTheme,
  alpha,
} from '@mui/material';
import {
  Circle as CircleIcon,
} from '@mui/icons-material';

interface AgentStatusProps {
  agent: any;
}

const AgentStatus: React.FC<AgentStatusProps> = ({ agent }) => {
  const theme = useTheme();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return theme.palette.success.main;
      case 'busy':
        return theme.palette.warning.main;
      case 'offline':
        return theme.palette.error.main;
      default:
        return theme.palette.grey[500];
    }
  };

  const getAgentTypeColor = (type: string) => {
    return type === 'bigboss' ? theme.palette.secondary.main : theme.palette.primary.main;
  };

  return (
    <Card
      sx={{
        height: '100%',
        transition: 'all 0.3s ease',
        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: `0 8px 16px ${alpha(getAgentTypeColor(agent.type), 0.15)}`,
        },
      }}
    >
      <CardContent>
        <Stack direction="row" spacing={2} alignItems="flex-start">
          <Avatar
            src={agent.avatar}
            sx={{
              width: 48,
              height: 48,
              bgcolor: getAgentTypeColor(agent.type),
              border: `2px solid ${alpha(getAgentTypeColor(agent.type), 0.3)}`,
            }}
          >
            {agent.name[0]}
          </Avatar>
          <Box flex={1}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
              <Typography variant="subtitle1" fontWeight={600}>
                {agent.name}
              </Typography>
              <Stack direction="row" alignItems="center" spacing={0.5}>
                <CircleIcon sx={{ fontSize: 8, color: getStatusColor(agent.status) }} />
                <Typography variant="caption" color={getStatusColor(agent.status)}>
                  {agent.status}
                </Typography>
              </Stack>
            </Stack>

            <Stack direction="row" spacing={1} mb={2}>
              <Chip
                label={agent.type}
                size="small"
                sx={{
                  backgroundColor: alpha(getAgentTypeColor(agent.type), 0.1),
                  color: getAgentTypeColor(agent.type),
                  textTransform: 'capitalize',
                }}
              />
              <Chip
                label={agent.category}
                size="small"
                variant="outlined"
              />
            </Stack>

            <Box mb={1}>
              <Stack direction="row" justifyContent="space-between" mb={0.5}>
                <Typography variant="caption" color="text.secondary">
                  Workload
                </Typography>
                <Typography variant="caption" fontWeight={600}>
                  {agent.workload}%
                </Typography>
              </Stack>
              <LinearProgress
                variant="determinate"
                value={agent.workload}
                sx={{
                  height: 4,
                  borderRadius: 1,
                  backgroundColor: alpha(theme.palette.primary.main, 0.1),
                  '& .MuiLinearProgress-bar': {
                    borderRadius: 1,
                    backgroundColor: 
                      agent.workload > 80 
                        ? theme.palette.error.main 
                        : agent.workload > 50 
                        ? theme.palette.warning.main 
                        : theme.palette.success.main,
                  },
                }}
              />
            </Box>

            {agent.currentTask && (
              <Box
                sx={{
                  mt: 2,
                  p: 1,
                  borderRadius: 1,
                  backgroundColor: alpha(theme.palette.info.main, 0.05),
                  border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
                }}
              >
                <Typography variant="caption" color="text.secondary">
                  Current Task
                </Typography>
                <Typography variant="body2" fontWeight={500}>
                  {agent.currentTask}
                </Typography>
              </Box>
            )}

            {agent.skills && (
              <Box mt={2}>
                <Typography variant="caption" color="text.secondary" gutterBottom>
                  Skills
                </Typography>
                <Stack direction="row" spacing={0.5} flexWrap="wrap" mt={0.5}>
                  {agent.skills.slice(0, 3).map((skill: string, index: number) => (
                    <Chip
                      key={index}
                      label={skill}
                      size="small"
                      sx={{ 
                        height: 20, 
                        fontSize: '0.7rem',
                        mb: 0.5,
                      }}
                    />
                  ))}
                </Stack>
              </Box>
            )}
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
};

export default AgentStatus;
