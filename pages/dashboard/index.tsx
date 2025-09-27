import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  Button,
  Stack,
  Chip,
  Avatar,
  LinearProgress,
  IconButton,
  Tabs,
  Tab,
  useTheme,
  alpha,
  Tooltip,
} from '@mui/material';
import {
  Add as AddIcon,
  PlayArrow as PlayIcon,
  Refresh as RefreshIcon,
  Timeline as TimelineIcon,
  Code as CodeIcon,
  BugReport as BugIcon,
  Speed as SpeedIcon,
  Security as SecurityIcon,
} from '@mui/icons-material';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';
import { useSocket } from '@/contexts/SocketContext';
import Layout from '@/components/Layout';
import ProjectCard from '@/components/dashboard/ProjectCard';
import MetricsCard from '@/components/dashboard/MetricsCard';
import ActivityFeed from '@/components/dashboard/ActivityFeed';
import WorkflowVisualization from '@/components/dashboard/WorkflowVisualization';
import AgentStatus from '@/components/dashboard/AgentStatus';
import { projectService } from '@/services/projectService';
import { agentService } from '@/services/agentService';
import toast from 'react-hot-toast';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`dashboard-tabpanel-${index}`}
      aria-labelledby={`dashboard-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

const Dashboard = () => {
  const router = useRouter();
  const theme = useTheme();
  const { user } = useAuth();
  const { socket, connected } = useSocket();
  const [tabValue, setTabValue] = useState(0);
  const [projects, setProjects] = useState([]);
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    totalProjects: 0,
    activeProjects: 0,
    completedTasks: 0,
    codeQuality: 0,
    deploymentSuccess: 0,
    aiTokensUsed: 0,
  });

  useEffect(() => {
    if (user) {
      loadDashboardData();
      subscribeToUpdates();
    }
  }, [user, socket]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [projectsData, agentsData] = await Promise.all([
        projectService.getProjects(),
        agentService.getAgents(),
      ]);

      setProjects(projectsData.projects || []);
      setAgents(agentsData.agents?.all || []);

      // Calculate metrics
      const activeProjects = projectsData.projects.filter(p => p.status === 'active').length;
      const totalTasks = projectsData.projects.reduce((sum, p) => sum + (p.metrics?.completedTasks || 0), 0);
      const avgQuality = projectsData.projects.reduce((sum, p) => sum + (p.metrics?.codeQuality || 0), 0) / (projectsData.projects.length || 1);

      setMetrics({
        totalProjects: projectsData.projects.length,
        activeProjects,
        completedTasks: totalTasks,
        codeQuality: Math.round(avgQuality),
        deploymentSuccess: 95, // Mock data
        aiTokensUsed: 125000, // Mock data
      });
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const subscribeToUpdates = () => {
    if (!socket) return;

    socket.on('project-update', (data) => {
      setProjects((prev) =>
        prev.map((p) => (p._id === data.projectId ? { ...p, ...data.updates } : p))
      );
    });

    socket.on('agent-status', (data) => {
      setAgents((prev) =>
        prev.map((a) => (a.id === data.agentId ? { ...a, ...data } : a))
      );
    });

    socket.on('workflow-update', (data) => {
      toast.success(`Workflow ${data.type}: ${data.workflow?.name}`);
      loadDashboardData();
    });

    return () => {
      socket.off('project-update');
      socket.off('agent-status');
      socket.off('workflow-update');
    };
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const metricsData = [
    {
      title: 'Active Projects',
      value: metrics.activeProjects,
      total: metrics.totalProjects,
      icon: <CodeIcon />,
      color: theme.palette.primary.main,
      trend: '+12%',
    },
    {
      title: 'Tasks Completed',
      value: metrics.completedTasks,
      icon: <TimelineIcon />,
      color: theme.palette.success.main,
      trend: '+23%',
    },
    {
      title: 'Code Quality',
      value: `${metrics.codeQuality}%`,
      icon: <BugIcon />,
      color: theme.palette.warning.main,
      trend: '+5%',
    },
    {
      title: 'Deployment Rate',
      value: `${metrics.deploymentSuccess}%`,
      icon: <SpeedIcon />,
      color: theme.palette.info.main,
      trend: '+8%',
    },
  ];

  return (
    <Layout>
      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
            <Box>
              <Typography variant="h3" fontWeight={700}>
                Welcome back, {user?.name}!
              </Typography>
              <Typography color="text.secondary" sx={{ mt: 1 }}>
                Your Autonomous Development Platform dashboard
              </Typography>
            </Box>
            <Stack direction="row" spacing={2}>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => router.push('/projects/new')}
                sx={{
                  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.4)}`,
                  },
                }}
              >
                New Project
              </Button>
              <IconButton onClick={loadDashboardData} disabled={loading}>
                <RefreshIcon />
              </IconButton>
            </Stack>
          </Stack>

          {/* Connection Status */}
          <Chip
            label={connected ? 'Connected' : 'Connecting...'}
            color={connected ? 'success' : 'warning'}
            size="small"
            sx={{ mb: 2 }}
          />
        </Box>

        {/* Metrics Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {metricsData.map((metric, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <MetricsCard {...metric} />
            </Grid>
          ))}
        </Grid>

        {/* Main Content Tabs */}
        <Paper sx={{ borderRadius: 3, p: 3, mb: 4 }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            aria-label="dashboard tabs"
            sx={{
              borderBottom: 1,
              borderColor: 'divider',
              '& .MuiTab-root': {
                textTransform: 'none',
                fontSize: '1rem',
                fontWeight: 500,
              },
            }}
          >
            <Tab label="Projects" />
            <Tab label="Workflows" />
            <Tab label="Agents" />
            <Tab label="Analytics" />
          </Tabs>

          <TabPanel value={tabValue} index={0}>
            {/* Projects Grid */}
            <Grid container spacing={3}>
              {projects.length === 0 ? (
                <Grid item xs={12}>
                  <Box
                    sx={{
                      textAlign: 'center',
                      py: 8,
                      background: alpha(theme.palette.primary.main, 0.05),
                      borderRadius: 2,
                      border: `2px dashed ${alpha(theme.palette.primary.main, 0.2)}`,
                    }}
                  >
                    <Typography variant="h5" color="text.secondary" gutterBottom>
                      No projects yet
                    </Typography>
                    <Button
                      variant="contained"
                      startIcon={<AddIcon />}
                      onClick={() => router.push('/projects/new')}
                      sx={{ mt: 2 }}
                    >
                      Create Your First Project
                    </Button>
                  </Box>
                </Grid>
              ) : (
                projects.map((project) => (
                  <Grid item xs={12} md={6} lg={4} key={project._id}>
                    <ProjectCard project={project} onUpdate={loadDashboardData} />
                  </Grid>
                ))
              )}
            </Grid>
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            {/* Workflow Visualization */}
            <WorkflowVisualization projects={projects} />
          </TabPanel>

          <TabPanel value={tabValue} index={2}>
            {/* Agents Status */}
            <Grid container spacing={3}>
              <Grid item xs={12} md={8}>
                <Typography variant="h5" gutterBottom fontWeight={600}>
                  Active Agents
                </Typography>
                <Grid container spacing={2}>
                  {agents
                    .filter((agent) => agent.status !== 'offline')
                    .map((agent) => (
                      <Grid item xs={12} sm={6} key={agent.id}>
                        <AgentStatus agent={agent} />
                      </Grid>
                    ))}
                </Grid>
              </Grid>
              <Grid item xs={12} md={4}>
                <Paper sx={{ p: 3, borderRadius: 2 }}>
                  <Typography variant="h6" gutterBottom fontWeight={600}>
                    Agent Performance
                  </Typography>
                  <Stack spacing={2}>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Total Active Agents
                      </Typography>
                      <Typography variant="h4">{agents.filter((a) => a.status === 'available').length}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Tasks in Queue
                      </Typography>
                      <Typography variant="h4">12</Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Avg Response Time
                      </Typography>
                      <Typography variant="h4">2.3s</Typography>
                    </Box>
                  </Stack>
                </Paper>
              </Grid>
            </Grid>
          </TabPanel>

          <TabPanel value={tabValue} index={3}>
            {/* Analytics */}
            <Grid container spacing={3}>
              <Grid item xs={12} md={8}>
                <Paper sx={{ p: 3, borderRadius: 2 }}>
                  <Typography variant="h6" gutterBottom fontWeight={600}>
                    Project Progress Overview
                  </Typography>
                  {projects.map((project) => (
                    <Box key={project._id} sx={{ mb: 3 }}>
                      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
                        <Typography variant="body1">{project.name}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {project.progress}%
                        </Typography>
                      </Stack>
                      <LinearProgress
                        variant="determinate"
                        value={project.progress}
                        sx={{
                          height: 8,
                          borderRadius: 1,
                          backgroundColor: alpha(theme.palette.primary.main, 0.1),
                          '& .MuiLinearProgress-bar': {
                            borderRadius: 1,
                            background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.light} 100%)`,
                          },
                        }}
                      />
                    </Box>
                  ))}
                </Paper>
              </Grid>
              <Grid item xs={12} md={4}>
                <ActivityFeed />
              </Grid>
            </Grid>
          </TabPanel>
        </Paper>
      </Container>
    </Layout>
  );
};

export default Dashboard;
