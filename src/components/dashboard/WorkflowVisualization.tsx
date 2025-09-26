import React, { useState, useCallback } from 'react';
import ReactFlow, {
  Node,
  Edge,
  Controls,
  Background,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
} from 'react-flow-renderer';
import {
  Paper,
  Typography,
  Box,
  Chip,
  Stack,
  useTheme,
  alpha,
} from '@mui/material';

interface WorkflowVisualizationProps {
  projects: any[];
}

const WorkflowVisualization: React.FC<WorkflowVisualizationProps> = ({ projects }) => {
  const theme = useTheme();

  const initialNodes: Node[] = [
    {
      id: '1',
      type: 'input',
      data: { label: 'Requirements Input' },
      position: { x: 250, y: 0 },
      style: {
        background: alpha(theme.palette.primary.main, 0.1),
        color: theme.palette.text.primary,
        border: `2px solid ${theme.palette.primary.main}`,
        borderRadius: '8px',
        padding: '10px',
      },
    },
    {
      id: '2',
      data: { label: 'Planning & Analysis' },
      position: { x: 100, y: 100 },
      style: {
        background: alpha('#4CAF50', 0.1),
        color: theme.palette.text.primary,
        border: `2px solid #4CAF50`,
        borderRadius: '8px',
        padding: '10px',
      },
    },
    {
      id: '3',
      data: { label: 'Design' },
      position: { x: 400, y: 100 },
      style: {
        background: alpha('#2196F3', 0.1),
        color: theme.palette.text.primary,
        border: `2px solid #2196F3`,
        borderRadius: '8px',
        padding: '10px',
      },
    },
    {
      id: '4',
      data: { label: 'Development' },
      position: { x: 250, y: 200 },
      style: {
        background: alpha('#FF9800', 0.1),
        color: theme.palette.text.primary,
        border: `2px solid #FF9800`,
        borderRadius: '8px',
        padding: '10px',
      },
    },
    {
      id: '5',
      data: { label: 'Testing' },
      position: { x: 100, y: 300 },
      style: {
        background: alpha('#F44336', 0.1),
        color: theme.palette.text.primary,
        border: `2px solid #F44336`,
        borderRadius: '8px',
        padding: '10px',
      },
    },
    {
      id: '6',
      data: { label: 'Deployment' },
      position: { x: 400, y: 300 },
      style: {
        background: alpha('#00BCD4', 0.1),
        color: theme.palette.text.primary,
        border: `2px solid #00BCD4`,
        borderRadius: '8px',
        padding: '10px',
      },
    },
    {
      id: '7',
      type: 'output',
      data: { label: 'Production' },
      position: { x: 250, y: 400 },
      style: {
        background: alpha(theme.palette.success.main, 0.1),
        color: theme.palette.text.primary,
        border: `2px solid ${theme.palette.success.main}`,
        borderRadius: '8px',
        padding: '10px',
      },
    },
  ];

  const initialEdges: Edge[] = [
    { id: 'e1-2', source: '1', target: '2', animated: true },
    { id: 'e1-3', source: '1', target: '3', animated: true },
    { id: 'e2-4', source: '2', target: '4' },
    { id: 'e3-4', source: '3', target: '4' },
    { id: 'e4-5', source: '4', target: '5', animated: true },
    { id: 'e4-6', source: '4', target: '6' },
    { id: 'e5-7', source: '5', target: '7' },
    { id: 'e6-7', source: '6', target: '7' },
  ];

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" fontWeight={600}>
          SDLC Workflow Pipeline
        </Typography>
        <Stack direction="row" spacing={1}>
          <Chip label={`${projects.length} Active Projects`} color="primary" />
          <Chip label="Real-time Updates" color="success" />
        </Stack>
      </Stack>

      <Paper
        sx={{
          height: 500,
          borderRadius: 2,
          overflow: 'hidden',
          border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
        }}
      >
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          fitView
        >
          <Controls />
          <MiniMap
            nodeColor={(node) => {
              if (node.type === 'input') return theme.palette.primary.main;
              if (node.type === 'output') return theme.palette.success.main;
              return alpha(theme.palette.primary.main, 0.6);
            }}
            style={{
              backgroundColor: alpha(theme.palette.background.paper, 0.9),
            }}
          />
          <Background variant="dots" gap={12} size={1} />
        </ReactFlow>
      </Paper>

      <Stack direction="row" spacing={2} mt={2} flexWrap="wrap">
        {projects.slice(0, 5).map((project) => (
          <Paper
            key={project._id}
            sx={{
              p: 2,
              borderRadius: 2,
              minWidth: 180,
              border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
            }}
          >
            <Typography variant="subtitle2" fontWeight={600} gutterBottom>
              {project.name}
            </Typography>
            <Stack direction="row" spacing={1}>
              <Chip
                label={`Stage: ${project.currentStage || 'Planning'}`}
                size="small"
                color="primary"
                variant="outlined"
              />
              <Chip
                label={`${project.progress}%`}
                size="small"
                color="success"
              />
            </Stack>
          </Paper>
        ))}
      </Stack>
    </Box>
  );
};

export default WorkflowVisualization;
