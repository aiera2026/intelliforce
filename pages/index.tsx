import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Stack,
  Avatar,
  Chip,
  IconButton,
  Fade,
  Grow,
  useTheme,
  alpha,
} from '@mui/material';
import {
  Code as CodeIcon,
  Dashboard as DashboardIcon,
  Group as GroupIcon,
  Speed as SpeedIcon,
  Security as SecurityIcon,
  CloudUpload as CloudUploadIcon,
  ArrowForward as ArrowForwardIcon,
  PlayArrow as PlayArrowIcon,
  GitHub as GitHubIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import Layout from '@/components/Layout';
import HeroSection from '@/components/home/HeroSection';
import FeatureCard from '@/components/home/FeatureCard';
import AgentShowcase from '@/components/home/AgentShowcase';

const HomePage = () => {
  const router = useRouter();
  const { user, loading } = useAuth();
  const theme = useTheme();
  const [animateIn, setAnimateIn] = useState(false);

  useEffect(() => {
    setAnimateIn(true);
  }, []);

  const features = [
    {
      icon: <CodeIcon sx={{ fontSize: 40 }} />,
      title: 'Multi-Agent Architecture',
      description: 'Specialized AI agents for each SDLC stage working in perfect harmony',
      color: theme.palette.primary.main,
    },
    {
      icon: <DashboardIcon sx={{ fontSize: 40 }} />,
      title: 'Real-Time Dashboard',
      description: 'Monitor progress, track metrics, and visualize workflows instantly',
      color: theme.palette.secondary.main,
    },
    {
      icon: <GroupIcon sx={{ fontSize: 40 }} />,
      title: 'Human-AI Collaboration',
      description: 'Seamlessly blend human expertise with AI capabilities',
      color: '#10b981',
    },
    {
      icon: <SpeedIcon sx={{ fontSize: 40 }} />,
      title: 'Accelerated Development',
      description: 'Reduce development cycle time by up to 70%',
      color: '#f59e0b',
    },
    {
      icon: <SecurityIcon sx={{ fontSize: 40 }} />,
      title: 'AI Safety First',
      description: 'Built-in guardrails and human oversight mechanisms',
      color: '#ef4444',
    },
    {
      icon: <CloudUploadIcon sx={{ fontSize: 40 }} />,
      title: 'End-to-End Automation',
      description: 'From planning to deployment, everything automated',
      color: '#8b5cf6',
    },
  ];

  const sdlcStages = [
    { name: 'Planning', color: '#4CAF50', progress: 100 },
    { name: 'Design', color: '#2196F3', progress: 85 },
    { name: 'Development', color: '#FF9800', progress: 60 },
    { name: 'Testing', color: '#F44336', progress: 40 },
    { name: 'Deployment', color: '#00BCD4', progress: 20 },
    { name: 'Maintenance', color: '#795548', progress: 10 },
  ];

  return (
    <Layout>
      <Box
        sx={{
          minHeight: '100vh',
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(
            theme.palette.secondary.main,
            0.05
          )} 100%)`,
        }}
      >
        {/* Hero Section */}
        <Container maxWidth="lg" sx={{ pt: { xs: 8, md: 12 }, pb: { xs: 6, md: 10 } }}>
          <Fade in={animateIn} timeout={1000}>
            <Box textAlign="center">
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 3 }}>
                <Box
                  component="img"
                  src="/logo.svg"
                  alt="Intelliforce Logo"
                  sx={{
                    width: { xs: 60, md: 80 },
                    height: { xs: 60, md: 80 },
                    mr: 3,
                  }}
                />
                <Typography
                  variant="h1"
                  sx={{
                    fontSize: { xs: '2.5rem', md: '4rem' },
                    fontWeight: 900,
                    background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  Intelliforce
                </Typography>
              </Box>
              <Typography
                variant="h4"
                sx={{
                  fontSize: { xs: '1.2rem', md: '1.8rem' },
                  fontWeight: 600,
                  color: 'text.primary',
                  mb: 2,
                  textAlign: 'center',
                }}
              >
                The Autonomous Development Platform
              </Typography>
              <Typography
                variant="h5"
                color="text.secondary"
                sx={{ mb: 5, maxWidth: 800, mx: 'auto' }}
              >
                that brings Technology and Human intelligent forces together
              </Typography>
              <Stack direction="row" spacing={2} justifyContent="center">
                <Button
                  variant="contained"
                  size="large"
                  endIcon={<ArrowForwardIcon />}
                  onClick={() => router.push(user ? '/dashboard' : '/auth/login')}
                  sx={{
                    px: 4,
                    py: 1.5,
                    fontSize: '1.1rem',
                    background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.4)}`,
                    },
                  }}
                >
                  {user ? 'Go to Dashboard' : 'Get Started'}
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  startIcon={<PlayArrowIcon />}
                  onClick={() => router.push('/demo')}
                  sx={{
                    px: 4,
                    py: 1.5,
                    fontSize: '1.1rem',
                    borderWidth: 2,
                    '&:hover': {
                      borderWidth: 2,
                      transform: 'translateY(-2px)',
                    },
                  }}
                >
                  Watch Demo
                </Button>
              </Stack>
            </Box>
          </Fade>
        </Container>

        {/* Features Grid */}
        <Container maxWidth="lg" sx={{ pb: 10 }}>
          <Typography
            variant="h2"
            textAlign="center"
            sx={{ mb: 6, fontSize: { xs: '2rem', md: '3rem' } }}
          >
            Revolutionary Features
          </Typography>
          <Grid container spacing={4}>
            {features.map((feature, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Grow in={animateIn} timeout={1000 + index * 200}>
                  <Card
                    sx={{
                      height: '100%',
                      background: alpha(theme.palette.background.paper, 0.8),
                      backdropFilter: 'blur(10px)',
                      border: `1px solid ${alpha(feature.color, 0.2)}`,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-8px)',
                        boxShadow: `0 12px 32px ${alpha(feature.color, 0.3)}`,
                        border: `1px solid ${alpha(feature.color, 0.4)}`,
                      },
                    }}
                  >
                    <CardContent sx={{ p: 4 }}>
                      <Box
                        sx={{
                          width: 80,
                          height: 80,
                          borderRadius: 2,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: `linear-gradient(135deg, ${alpha(
                            feature.color,
                            0.2
                          )} 0%, ${alpha(feature.color, 0.1)} 100%)`,
                          mb: 3,
                        }}
                      >
                        <Box sx={{ color: feature.color }}>{feature.icon}</Box>
                      </Box>
                      <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
                        {feature.title}
                      </Typography>
                      <Typography color="text.secondary">{feature.description}</Typography>
                    </CardContent>
                  </Card>
                </Grow>
              </Grid>
            ))}
          </Grid>
        </Container>

        {/* SDLC Workflow Visualization */}
        <Container maxWidth="lg" sx={{ pb: 10 }}>
          <Typography
            variant="h2"
            textAlign="center"
            sx={{ mb: 6, fontSize: { xs: '2rem', md: '3rem' } }}
          >
            Complete SDLC Coverage
          </Typography>
          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 2,
              justifyContent: 'center',
            }}
          >
            {sdlcStages.map((stage, index) => (
              <motion.div
                key={stage.name}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
              >
                <Box
                  sx={{
                    position: 'relative',
                    width: 150,
                    height: 150,
                    borderRadius: 3,
                    background: alpha(stage.color, 0.1),
                    border: `2px solid ${alpha(stage.color, 0.3)}`,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'scale(1.1)',
                      boxShadow: `0 8px 24px ${alpha(stage.color, 0.4)}`,
                    },
                  }}
                >
                  <Typography
                    variant="h6"
                    sx={{
                      color: stage.color,
                      fontWeight: 600,
                      mb: 1,
                    }}
                  >
                    {stage.name}
                  </Typography>
                  <Box
                    sx={{
                      width: '80%',
                      height: 6,
                      borderRadius: 3,
                      background: alpha(stage.color, 0.2),
                      overflow: 'hidden',
                    }}
                  >
                    <Box
                      sx={{
                        width: `${stage.progress}%`,
                        height: '100%',
                        background: stage.color,
                        transition: 'width 1s ease',
                      }}
                    />
                  </Box>
                </Box>
              </motion.div>
            ))}
          </Box>
        </Container>

        {/* Agent Showcase */}
        <AgentShowcase />

        {/* CTA Section */}
        <Container maxWidth="md" sx={{ py: 10 }}>
          <Box
            sx={{
              background: `linear-gradient(135deg, ${alpha(
                theme.palette.primary.main,
                0.1
              )} 0%, ${alpha(theme.palette.secondary.main, 0.1)} 100%)`,
              borderRadius: 4,
              p: 6,
              textAlign: 'center',
              border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
            }}
          >
            <Typography variant="h3" sx={{ mb: 3, fontWeight: 700 }}>
              Ready to Transform Your Development Process?
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>
              Join thousands of teams already accelerating their software delivery
            </Typography>
            <Button
              variant="contained"
              size="large"
              endIcon={<ArrowForwardIcon />}
              onClick={() => router.push('/auth/register')}
              sx={{
                px: 5,
                py: 2,
                fontSize: '1.2rem',
                background: `linear-gradient(135deg, ${theme.palette.secondary.main} 0%, ${theme.palette.secondary.dark} 100%)`,
                '&:hover': {
                  transform: 'scale(1.05)',
                  boxShadow: `0 12px 32px ${alpha(theme.palette.secondary.main, 0.5)}`,
                },
              }}
            >
              Start Free Trial
            </Button>
          </Box>
        </Container>
      </Box>
    </Layout>
  );
};

export default HomePage;
