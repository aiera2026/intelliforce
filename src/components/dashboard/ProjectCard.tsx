import React from 'react';
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Box,
  Stack,
  Chip,
  Button,
  LinearProgress,
  Avatar,
  AvatarGroup,
  IconButton,
  Tooltip,
  useTheme,
  alpha,
} from '@mui/material';
import {
  PlayArrow as PlayIcon,
  Pause as PauseIcon,
  Settings as SettingsIcon,
  Visibility as ViewIcon,
} from '@mui/icons-material';
import { useRouter } from 'next/router';

interface ProjectCardProps {
  project: any;
  onUpdate: () => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project, onUpdate }) => {
  const theme = useTheme();
  const router = useRouter();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return theme.palette.success.main;
      case 'completed':
        return theme.palette.info.main;
      case 'draft':
        return theme.palette.warning.main;
      case 'archived':
        return theme.palette.grey[500];
      default:
        return theme.palette.primary.main;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'error';
      case 'high':
        return 'warning';
      case 'medium':
        return 'primary';
      case 'low':
        return 'default';
      default:
        return 'default';
    }
  };

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'all 0.3s ease',
        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: `0 12px 24px ${alpha(theme.palette.primary.main, 0.15)}`,
        },
      }}
    >
      <CardContent sx={{ flexGrow: 1 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={2}>
          <Box>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              {project.name}
            </Typography>
            <Stack direction="row" spacing={1}>
              <Chip
                label={project.status}
                size="small"
                sx={{
                  backgroundColor: alpha(getStatusColor(project.status), 0.1),
                  color: getStatusColor(project.status),
                  textTransform: 'capitalize',
                }}
              />
              <Chip
                label={project.priority}
                size="small"
                color={getPriorityColor(project.priority) as any}
                variant="outlined"
              />
            </Stack>
          </Box>
          <Tooltip title="Settings">
            <IconButton size="small" onClick={() => router.push(`/projects/${project._id}/settings`)}>
              <SettingsIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 3, minHeight: 40 }}>
          {project.description.length > 100 
            ? project.description.substring(0, 100) + '...' 
            : project.description}
        </Typography>

        <Box sx={{ mb: 2 }}>
          <Stack direction="row" justifyContent="space-between" mb={1}>
            <Typography variant="body2" color="text.secondary">
              Progress
            </Typography>
            <Typography variant="body2" fontWeight={600}>
              {project.progress}%
            </Typography>
          </Stack>
          <LinearProgress
            variant="determinate"
            value={project.progress}
            sx={{
              height: 6,
              borderRadius: 1,
              backgroundColor: alpha(theme.palette.primary.main, 0.1),
              '& .MuiLinearProgress-bar': {
                borderRadius: 1,
                background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.light} 100%)`,
              },
            }}
          />
        </Box>

        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <AvatarGroup max={4} sx={{ '& .MuiAvatar-root': { width: 28, height: 28 } }}>
            {project.team?.slice(0, 4).map((member: any, index: number) => (
              <Tooltip key={index} title={member.userId?.name || 'Team Member'}>
                <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
                  {member.userId?.name?.charAt(0) || 'U'}
                </Avatar>
              </Tooltip>
            ))}
          </AvatarGroup>
          <Stack direction="row" spacing={0.5}>
            {project.stages?.slice(0, 3).map((stage: string) => (
              <Chip
                key={stage}
                label={stage}
                size="small"
                sx={{
                  height: 20,
                  fontSize: '0.7rem',
                  textTransform: 'capitalize',
                }}
              />
            ))}
          </Stack>
        </Stack>
      </CardContent>

      <CardActions sx={{ px: 2, pb: 2 }}>
        <Button
          fullWidth
          variant="contained"
          startIcon={<ViewIcon />}
          onClick={() => router.push(`/projects/${project._id}`)}
          sx={{
            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
            '&:hover': {
              background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
            },
          }}
        >
          View Project
        </Button>
      </CardActions>
    </Card>
  );
};

export default ProjectCard;
