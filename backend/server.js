const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Import routes
const authRoutes = require('./routes/auth');
const projectRoutes = require('./routes/projects');
const agentRoutes = require('./routes/agents');
const workflowRoutes = require('./routes/workflows');

// Import services
const AgentOrchestrator = require('./services/AgentOrchestrator');
const WorkflowEngine = require('./services/WorkflowEngine');

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Database connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/sdlc-ai-platform', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err));

// Initialize services
const agentOrchestrator = new AgentOrchestrator(io);
const workflowEngine = new WorkflowEngine(io, agentOrchestrator);

// Make services available to routes
app.locals.agentOrchestrator = agentOrchestrator;
app.locals.workflowEngine = workflowEngine;
app.locals.io = io;

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/agents', agentRoutes);
app.use('/api/workflows', workflowRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    services: {
      database: mongoose.connection.readyState === 1,
      orchestrator: agentOrchestrator.isRunning(),
      workflow: workflowEngine.isRunning()
    }
  });
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  socket.on('join-project', (projectId) => {
    socket.join(`project-${projectId}`);
    console.log(`Client ${socket.id} joined project ${projectId}`);
  });

  socket.on('leave-project', (projectId) => {
    socket.leave(`project-${projectId}`);
    console.log(`Client ${socket.id} left project ${projectId}`);
  });

  socket.on('agent-action', async (data) => {
    try {
      const result = await agentOrchestrator.handleAgentAction(data);
      socket.emit('agent-response', result);
    } catch (error) {
      socket.emit('agent-error', { error: error.message });
    }
  });

  socket.on('workflow-action', async (data) => {
    try {
      const result = await workflowEngine.handleWorkflowAction(data);
      socket.emit('workflow-response', result);
    } catch (error) {
      socket.emit('workflow-error', { error: error.message });
    }
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: err.message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

const PORT = process.env.PORT || 5001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`WebSocket server ready for connections`);
});
