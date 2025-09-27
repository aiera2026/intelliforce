import React from 'react';
import { Card, CardContent, Typography, Box, useTheme, alpha } from '@mui/material';
import { motion } from 'framer-motion';

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
  delay?: number;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description, color, delay = 0 }) => {
  const theme = useTheme();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      whileHover={{ scale: 1.05 }}
    >
      <Card
        sx={{
          height: '100%',
          background: alpha(theme.palette.background.paper, 0.9),
          backdropFilter: 'blur(10px)',
          border: `1px solid ${alpha(color, 0.2)}`,
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-8px)',
            boxShadow: `0 16px 40px ${alpha(color, 0.3)}`,
            border: `1px solid ${alpha(color, 0.4)}`,
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
              background: `linear-gradient(135deg, ${alpha(color, 0.2)} 0%, ${alpha(color, 0.1)} 100%)`,
              mb: 3,
            }}
          >
            <Box sx={{ color }}>{icon}</Box>
          </Box>
          <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
            {title}
          </Typography>
          <Typography color="text.secondary">{description}</Typography>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default FeatureCard;
