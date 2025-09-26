import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Avatar,
  Chip,
  Stack,
  Tabs,
  Tab,
  useTheme,
  alpha,
} from '@mui/material';
import { motion } from 'framer-motion';

const AgentShowcase: React.FC = () => {
  const theme = useTheme();
  const [tabValue, setTabValue] = useState(0);

  const humanAgents = [
    {
      name: 'Expert Programmer',
      avatar: '/avatars/expert-programmer.svg',
      skills: ['JavaScript', 'Python', 'Java', 'Go'],
      description: 'Master of multiple programming languages with deep expertise in architecture and optimization',
      color: '#6366f1',
    },
    {
      name: 'Product Ideation Master',
      avatar: '/avatars/product-ideation.svg',
      skills: ['Requirements Analysis', 'User Stories', 'PRD Creation'],
      description: 'Transforms ideas into actionable requirements and comprehensive product documentation',
      color: '#10b981',
    },
    {
      name: 'UI/UX Designer',
      avatar: '/avatars/uiux-designer.svg',
      skills: ['Figma', 'User Research', 'Prototyping'],
      description: 'Creates intuitive and beautiful user interfaces with focus on user experience',
      color: '#ec4899',
    },
    {
      name: 'DevOps Engineer',
      avatar: '/avatars/devops-engineer.svg',
      skills: ['Docker', 'Kubernetes', 'CI/CD', 'AWS'],
      description: 'Ensures smooth deployment and infrastructure management with automation',
      color: '#f59e0b',
    },
  ];

  const bigbossAgents = [
    {
      name: 'CodeRabbit Agent',
      avatar: '/avatars/coderabbit.svg',
      skills: ['Code Review', 'Quality Analysis', 'Security Scanning'],
      description: 'Automated code review with AI-powered insights for quality and security',
      color: '#8b5cf6',
    },
    {
      name: 'Raindrop Agent',
      avatar: '/avatars/raindrop.svg',
      skills: ['PRD Planning', 'Backend Dev', 'Deployment'],
      description: 'Comprehensive project planning and execution from requirements to deployment',
      color: '#06b6d4',
    },
    {
      name: 'Dispatch Agent',
      avatar: '/avatars/dispatch.svg',
      skills: ['Task Prioritization', 'Load Balancing'],
      description: 'Intelligently assigns tasks to optimal agents based on expertise and availability',
      color: '#ef4444',
    },
    {
      name: 'Optimization Agent',
      avatar: '/avatars/optimization.svg',
      skills: ['Conflict Resolution', 'Performance Optimization'],
      description: 'Resolves conflicts and optimizes system performance across all workflows',
      color: '#84cc16',
    },
  ];

  const agents = tabValue === 0 ? humanAgents : bigbossAgents;

  return (
    <Container maxWidth="lg" sx={{ pb: 10 }}>
      <Typography
        variant="h2"
        textAlign="center"
        sx={{ mb: 2, fontSize: { xs: '2rem', md: '3rem' } }}
      >
        Meet Your AI Agents
      </Typography>
      <Typography
        variant="h6"
        textAlign="center"
        color="text.secondary"
        sx={{ mb: 6, maxWidth: 800, mx: 'auto' }}
      >
        Specialized agents working together to deliver exceptional results
      </Typography>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 4 }}>
        <Tabs
          value={tabValue}
          onChange={(_, newValue) => setTabValue(newValue)}
          centered
          sx={{
            '& .MuiTab-root': {
              fontSize: '1.1rem',
              fontWeight: 600,
              textTransform: 'none',
            },
          }}
        >
          <Tab label="Human-Defined Agents" />
          <Tab label="BigBoss AI Agents" />
        </Tabs>
      </Box>

      <Grid container spacing={3}>
        {agents.map((agent, index) => (
          <Grid item xs={12} sm={6} md={3} key={agent.name}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card
                sx={{
                  height: '100%',
                  background: alpha(theme.palette.background.paper, 0.9),
                  backdropFilter: 'blur(10px)',
                  border: `1px solid ${alpha(agent.color, 0.3)}`,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-8px) scale(1.02)',
                    boxShadow: `0 16px 40px ${alpha(agent.color, 0.3)}`,
                    border: `1px solid ${alpha(agent.color, 0.5)}`,
                  },
                }}
              >
                <CardContent sx={{ textAlign: 'center', p: 3 }}>
                  <Avatar
                    sx={{
                      width: 80,
                      height: 80,
                      mx: 'auto',
                      mb: 2,
                      bgcolor: alpha(agent.color, 0.1),
                      border: `3px solid ${alpha(agent.color, 0.3)}`,
                    }}
                  >
                    <Box
                      sx={{
                        width: 60,
                        height: 60,
                        borderRadius: '50%',
                        background: `linear-gradient(135deg, ${agent.color} 0%, ${alpha(
                          agent.color,
                          0.7
                        )} 100%)`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontSize: '1.5rem',
                        fontWeight: 700,
                      }}
                    >
                      {agent.name[0]}
                    </Box>
                  </Avatar>
                  <Typography variant="h6" fontWeight={600} gutterBottom>
                    {agent.name}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 2, minHeight: 48 }}
                  >
                    {agent.description}
                  </Typography>
                  <Stack direction="row" spacing={0.5} flexWrap="wrap" justifyContent="center">
                    {agent.skills.map((skill) => (
                      <Chip
                        key={skill}
                        label={skill}
                        size="small"
                        sx={{
                          mb: 0.5,
                          backgroundColor: alpha(agent.color, 0.1),
                          color: agent.color,
                          border: `1px solid ${alpha(agent.color, 0.3)}`,
                        }}
                      />
                    ))}
                  </Stack>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default AgentShowcase;
