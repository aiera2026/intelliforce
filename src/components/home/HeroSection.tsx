import React from 'react';
import { Box, Typography, Button, Stack, Container, useTheme, alpha } from '@mui/material';
import { motion } from 'framer-motion';
import { ArrowForward, PlayArrow } from '@mui/icons-material';
import { useRouter } from 'next/router';

const HeroSection: React.FC = () => {
  const theme = useTheme();
  const router = useRouter();

  return (
    <Box
      sx={{
        position: 'relative',
        minHeight: '80vh',
        display: 'flex',
        alignItems: 'center',
        background: `linear-gradient(135deg, ${alpha(
          theme.palette.primary.main,
          0.05
        )} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`,
        overflow: 'hidden',
      }}
    >
      {/* Background Animation */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          opacity: 0.1,
          '&::before': {
            content: '""',
            position: 'absolute',
            width: '200%',
            height: '200%',
            top: '-50%',
            left: '-50%',
            background: `radial-gradient(circle, ${theme.palette.primary.main} 0%, transparent 70%)`,
            animation: 'rotate 30s linear infinite',
          },
          '@keyframes rotate': {
            '0%': { transform: 'rotate(0deg)' },
            '100%': { transform: 'rotate(360deg)' },
          },
        }}
      />

      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <Typography
            variant="h1"
            sx={{
              fontSize: { xs: '3rem', md: '5rem' },
              fontWeight: 900,
              background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 3,
              textAlign: 'center',
            }}
          >
            The Future of Software Development
          </Typography>
          <Typography
            variant="h4"
            sx={{
              fontSize: { xs: '1.2rem', md: '1.8rem' },
              color: 'text.secondary',
              mb: 5,
              textAlign: 'center',
              maxWidth: 900,
              mx: 'auto',
            }}
          >
            Experience the world's first comprehensive AI-powered SDLC platform with multi-agent orchestration
          </Typography>
          <Stack direction="row" spacing={3} justifyContent="center">
            <Button
              variant="contained"
              size="large"
              endIcon={<ArrowForward />}
              onClick={() => router.push('/auth/register')}
              sx={{
                px: 5,
                py: 2,
                fontSize: '1.2rem',
                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                '&:hover': {
                  transform: 'translateY(-3px)',
                  boxShadow: `0 12px 32px ${alpha(theme.palette.primary.main, 0.5)}`,
                },
              }}
            >
              Start Free Trial
            </Button>
            <Button
              variant="outlined"
              size="large"
              startIcon={<PlayArrow />}
              onClick={() => router.push('/demo')}
              sx={{
                px: 5,
                py: 2,
                fontSize: '1.2rem',
                borderWidth: 2,
                '&:hover': {
                  borderWidth: 2,
                  transform: 'translateY(-3px)',
                },
              }}
            >
              Watch Demo
            </Button>
          </Stack>
        </motion.div>
      </Container>
    </Box>
  );
};

export default HeroSection;
