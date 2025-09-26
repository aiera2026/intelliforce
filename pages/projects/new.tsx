import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  TextField,
  Button,
  Grid,
  Card,
  CardContent,
  Avatar,
  Chip,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  IconButton,
  Tooltip,
  Fade,
  useTheme,
  alpha,
  TextareaAutosize,
} from '@mui/material';
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from 'react-beautiful-dnd';
import {
  Add as AddIcon,
  Remove as RemoveIcon,
  Code as CodeIcon,
  Design as DesignIcon,
  BugReport as TestIcon,
  Cloud as DeployIcon,
  Security as SecurityIcon,
  ArrowBack as BackIcon,
  ArrowForward as NextIcon,
  Check as CheckIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';
import Layout from '@/components/Layout';
import { projectService } from '@/services/projectService';
import { agentService } from '@/services/agentService';
import toast from 'react-hot-toast';

interface Agent {
  id: string;
  name: string;
  type: string;
  category: string;
  avatar: string;
  skills: string[];
  capabilities: any;
  status: string;
}

const NewProject = () => {
  const router = useRouter();
  const theme = useTheme();
  const { user } = useAuth();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [availableAgents, setAvailableAgents] = useState<Agent[]>([]);
  const [selectedAgents, setSelectedAgents] = useState<Agent[]>([]);
  
  const [projectData, setProjectData] = useState({
    name: '',
    description: '',
    requirements: '',
    priority: 'medium',
    stages: ['planning', 'design', 'development', 'testing', 'deployment'],
    timeline: {
      estimatedStart: new Date().toISOString().split('T')[0],
      estimatedEnd: '',
    },
    budget: {
      estimated: 0,
      currency: 'USD',
    },
    tags: [] as string[],
  });

  const steps = [
    'Project Details',
    'Requirements',
    'Select Agents',
    'Configure Workflow',
    'Review & Create',
  ];

  const stageIcons = {
    planning: <InfoIcon />,
    design: <DesignIcon />,
    development: <CodeIcon />,
    testing: <TestIcon />,
    deployment: <DeployIcon />,
    maintenance: <SecurityIcon />,
  };

  useEffect(() => {
    loadAgents();
  }, []);

  const loadAgents = async () => {
    try {
      const response = await agentService.getAgents();
      setAvailableAgents(response.agents?.all || []);
    } catch (error) {
      toast.error('Failed to load agents');
    }
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const { source, destination } = result;

    if (source.droppableId === 'available' && destination.droppableId === 'selected') {
      // Moving from available to selected
      const agent = availableAgents[source.index];
      if (!selectedAgents.find(a => a.id === agent.id)) {
        setSelectedAgents([...selectedAgents, agent]);
      }
    } else if (source.droppableId === 'selected' && destination.droppableId === 'available') {
      // Moving from selected back to available
      const newSelected = [...selectedAgents];
      newSelected.splice(source.index, 1);
      setSelectedAgents(newSelected);
    } else if (source.droppableId === 'selected' && destination.droppableId === 'selected') {
      // Reordering within selected
      const newSelected = [...selectedAgents];
      const [removed] = newSelected.splice(source.index, 1);
      newSelected.splice(destination.index, 0, removed);
      setSelectedAgents(newSelected);
    }
  };

  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const validateStep = (step: number) => {
    switch (step) {
      case 0:
        if (!projectData.name || !projectData.description) {
          toast.error('Please fill in all project details');
          return false;
        }
        break;
      case 1:
        if (!projectData.requirements) {
          toast.error('Please enter project requirements');
          return false;
        }
        break;
      case 2:
        if (selectedAgents.length === 0) {
          toast.error('Please select at least one agent');
          return false;
        }
        break;
      case 3:
        if (projectData.stages.length === 0) {
          toast.error('Please select at least one workflow stage');
          return false;
        }
        break;
    }
    return true;
  };

  const handleCreateProject = async () => {
    try {
      setLoading(true);
      const projectPayload = {
        ...projectData,
        selectedAgents: selectedAgents.map(a => a.id),
      };

      const response = await projectService.createProject(projectPayload);
      toast.success('Project created successfully!');
      
      // Create and start workflow
      await projectService.createWorkflow(response.project._id);
      
      router.push(`/projects/${response.project._id}`);
    } catch (error) {
      toast.error('Failed to create project');
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Project Name"
                value={projectData.name}
                onChange={(e) => setProjectData({ ...projectData, name: e.target.value })}
                variant="outlined"
                required
                placeholder="My Awesome AI Project"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                value={projectData.description}
                onChange={(e) => setProjectData({ ...projectData, description: e.target.value })}
                variant="outlined"
                required
                multiline
                rows={3}
                placeholder="Brief description of your project"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Priority</InputLabel>
                <Select
                  value={projectData.priority}
                  onChange={(e) => setProjectData({ ...projectData, priority: e.target.value })}
                  label="Priority"
                >
                  <MenuItem value="low">Low</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="high">High</MenuItem>
                  <MenuItem value="critical">Critical</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Estimated Budget"
                type="number"
                value={projectData.budget.estimated}
                onChange={(e) => setProjectData({
                  ...projectData,
                  budget: { ...projectData.budget, estimated: Number(e.target.value) }
                })}
                variant="outlined"
                InputProps={{
                  startAdornment: '$',
                }}
              />
            </Grid>
          </Grid>
        );

      case 1:
        return (
          <Box>
            <Typography variant="body1" color="text.secondary" gutterBottom>
              Enter your project requirements in natural language. Our AI agents will understand and process them.
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={12}
              value={projectData.requirements}
              onChange={(e) => setProjectData({ ...projectData, requirements: e.target.value })}
              variant="outlined"
              placeholder="Example: I need a modern e-commerce platform with user authentication, product catalog, shopping cart, payment integration, and admin dashboard. The platform should be mobile-responsive and support multiple languages..."
              sx={{
                mt: 2,
                '& .MuiOutlinedInput-root': {
                  fontFamily: 'monospace',
                  fontSize: '0.95rem',
                },
              }}
            />
          </Box>
        );

      case 2:
        return (
          <DragDropContext onDragEnd={handleDragEnd}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>
                  Available Agents
                </Typography>
                <Droppable droppableId="available">
                  {(provided) => (
                    <Paper
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      sx={{
                        p: 2,
                        minHeight: 400,
                        background: alpha(theme.palette.primary.main, 0.05),
                        border: `2px dashed ${alpha(theme.palette.primary.main, 0.2)}`,
                      }}
                    >
                      {availableAgents
                        .filter(agent => !selectedAgents.find(s => s.id === agent.id))
                        .map((agent, index) => (
                          <Draggable key={agent.id} draggableId={agent.id} index={index}>
                            {(provided, snapshot) => (
                              <Card
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                sx={{
                                  mb: 2,
                                  cursor: 'grab',
                                  transition: 'all 0.2s ease',
                                  ...(snapshot.isDragging && {
                                    transform: 'rotate(3deg)',
                                    boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.3)}`,
                                  }),
                                }}
                              >
                                <CardContent sx={{ p: 2 }}>
                                  <Stack direction="row" spacing={2} alignItems="center">
                                    <Avatar src={agent.avatar} sx={{ bgcolor: theme.palette.primary.main }}>
                                      {agent.name[0]}
                                    </Avatar>
                                    <Box flex={1}>
                                      <Typography variant="subtitle1" fontWeight={600}>
                                        {agent.name}
                                      </Typography>
                                      <Stack direction="row" spacing={1} mt={0.5}>
                                        <Chip
                                          label={agent.type}
                                          size="small"
                                          color={agent.type === 'bigboss' ? 'secondary' : 'primary'}
                                        />
                                        <Chip label={agent.category} size="small" variant="outlined" />
                                      </Stack>
                                    </Box>
                                  </Stack>
                                </CardContent>
                              </Card>
                            )}
                          </Draggable>
                        ))}
                      {provided.placeholder}
                    </Paper>
                  )}
                </Droppable>
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>
                  Selected Team
                </Typography>
                <Droppable droppableId="selected">
                  {(provided) => (
                    <Paper
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      sx={{
                        p: 2,
                        minHeight: 400,
                        background: alpha(theme.palette.success.main, 0.05),
                        border: `2px solid ${alpha(theme.palette.success.main, 0.3)}`,
                      }}
                    >
                      {selectedAgents.length === 0 ? (
                        <Box
                          sx={{
                            height: 350,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'text.secondary',
                          }}
                        >
                          <Typography>Drag agents here to add to your team</Typography>
                        </Box>
                      ) : (
                        selectedAgents.map((agent, index) => (
                          <Draggable key={agent.id} draggableId={`selected-${agent.id}`} index={index}>
                            {(provided, snapshot) => (
                              <Card
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                sx={{
                                  mb: 2,
                                  cursor: 'grab',
                                  background: alpha(theme.palette.success.main, 0.1),
                                  ...(snapshot.isDragging && {
                                    transform: 'rotate(-3deg)',
                                    boxShadow: `0 8px 24px ${alpha(theme.palette.success.main, 0.3)}`,
                                  }),
                                }}
                              >
                                <CardContent sx={{ p: 2 }}>
                                  <Stack direction="row" spacing={2} alignItems="center">
                                    <Avatar src={agent.avatar} sx={{ bgcolor: theme.palette.success.main }}>
                                      {agent.name[0]}
                                    </Avatar>
                                    <Box flex={1}>
                                      <Typography variant="subtitle1" fontWeight={600}>
                                        {agent.name}
                                      </Typography>
                                      <Typography variant="body2" color="text.secondary">
                                        {agent.skills.slice(0, 3).join(', ')}
                                      </Typography>
                                    </Box>
                                  </Stack>
                                </CardContent>
                              </Card>
                            )}
                          </Draggable>
                        ))
                      )}
                      {provided.placeholder}
                    </Paper>
                  )}
                </Droppable>
              </Grid>
            </Grid>
          </DragDropContext>
        );

      case 3:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Select SDLC Stages
            </Typography>
            <Grid container spacing={2}>
              {Object.entries(stageIcons).map(([stage, icon]) => (
                <Grid item xs={12} sm={6} md={4} key={stage}>
                  <Card
                    sx={{
                      cursor: 'pointer',
                      border: projectData.stages.includes(stage) ? 2 : 1,
                      borderColor: projectData.stages.includes(stage) 
                        ? theme.palette.primary.main 
                        : alpha(theme.palette.divider, 0.3),
                      background: projectData.stages.includes(stage)
                        ? alpha(theme.palette.primary.main, 0.1)
                        : 'transparent',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: 2,
                      },
                    }}
                    onClick={() => {
                      const newStages = projectData.stages.includes(stage)
                        ? projectData.stages.filter(s => s !== stage)
                        : [...projectData.stages, stage];
                      setProjectData({ ...projectData, stages: newStages });
                    }}
                  >
                    <CardContent>
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Box
                          sx={{
                            width: 40,
                            height: 40,
                            borderRadius: 1,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: alpha(theme.palette.primary.main, 0.1),
                            color: theme.palette.primary.main,
                          }}
                        >
                          {icon}
                        </Box>
                        <Typography variant="subtitle1" fontWeight={500} textTransform="capitalize">
                          {stage}
                        </Typography>
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        );

      case 4:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Review Project Configuration
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Project Details
                  </Typography>
                  <Typography variant="h5" fontWeight={600} gutterBottom>
                    {projectData.name}
                  </Typography>
                  <Typography variant="body1" color="text.secondary" paragraph>
                    {projectData.description}
                  </Typography>
                  <Stack direction="row" spacing={1}>
                    <Chip label={`Priority: ${projectData.priority}`} color="primary" />
                    <Chip label={`Budget: $${projectData.budget.estimated}`} />
                  </Stack>
                </Paper>
              </Grid>

              <Grid item xs={12}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Requirements
                  </Typography>
                  <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                    {projectData.requirements}
                  </Typography>
                </Paper>
              </Grid>

              <Grid item xs={12}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Selected Agents ({selectedAgents.length})
                  </Typography>
                  <Stack direction="row" spacing={1} flexWrap="wrap">
                    {selectedAgents.map((agent) => (
                      <Chip
                        key={agent.id}
                        label={agent.name}
                        avatar={<Avatar src={agent.avatar}>{agent.name[0]}</Avatar>}
                        sx={{ mb: 1 }}
                      />
                    ))}
                  </Stack>
                </Paper>
              </Grid>

              <Grid item xs={12}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Workflow Stages
                  </Typography>
                  <Stack direction="row" spacing={1} flexWrap="wrap">
                    {projectData.stages.map((stage) => (
                      <Chip
                        key={stage}
                        label={stage}
                        icon={stageIcons[stage]}
                        color="primary"
                        variant="outlined"
                        sx={{ mb: 1, textTransform: 'capitalize' }}
                      />
                    ))}
                  </Stack>
                </Paper>
              </Grid>
            </Grid>
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Layout>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h3" fontWeight={700} gutterBottom>
            Create New Project
          </Typography>
          <Typography color="text.secondary">
            Set up your Autonomous Development workflow in just a few steps
          </Typography>
        </Box>

        <Paper sx={{ p: 4 }}>
          <Stepper activeStep={activeStep} orientation="vertical">
            {steps.map((label, index) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
                <StepContent>
                  <Box sx={{ mb: 3, mt: 2 }}>
                    {renderStepContent(index)}
                  </Box>
                  <Box sx={{ mb: 2 }}>
                    <Stack direction="row" spacing={2}>
                      {index === steps.length - 1 ? (
                        <Button
                          variant="contained"
                          onClick={handleCreateProject}
                          disabled={loading}
                          startIcon={<CheckIcon />}
                          sx={{
                            background: `linear-gradient(135deg, ${theme.palette.success.main} 0%, ${theme.palette.success.dark} 100%)`,
                          }}
                        >
                          Create Project
                        </Button>
                      ) : (
                        <Button
                          variant="contained"
                          onClick={handleNext}
                          endIcon={<NextIcon />}
                        >
                          Next
                        </Button>
                      )}
                      <Button
                        disabled={index === 0}
                        onClick={handleBack}
                        startIcon={<BackIcon />}
                      >
                        Back
                      </Button>
                    </Stack>
                  </Box>
                </StepContent>
              </Step>
            ))}
          </Stepper>
        </Paper>
      </Container>
    </Layout>
  );
};

export default NewProject;
