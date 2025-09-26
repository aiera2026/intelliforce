const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware to authenticate user
const authenticate = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key-change-in-production');
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    req.user = user;
    req.userId = user._id;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid authentication' });
  }
};

// Get all available agents (both AI and human)
router.get('/', authenticate, async (req, res) => {
  try {
    const agentOrchestrator = req.app.locals.agentOrchestrator;
    
    // Get AI agents
    const aiAgents = await agentOrchestrator.handleAgentAction({
      action: 'get-agents',
      payload: {}
    });

    // Get human agents
    const humanAgents = await User.find({
      'agentProfile.isAgent': true,
      'agentProfile.availability.status': { $in: ['available', 'busy'] }
    }).select('name email avatar agentProfile skills department title');

    // Format human agents to match AI agent structure
    const formattedHumanAgents = humanAgents.map(user => ({
      id: user.agentProfile.agentId || `human-${user._id}`,
      name: user.name,
      type: 'human',
      category: 'employee',
      avatar: user.avatarUrl,
      skills: user.skills.map(s => s.name),
      capabilities: user.agentProfile.capabilities,
      status: user.agentProfile.availability.status,
      workload: user.agentProfile.availability.workload,
      department: user.department,
      title: user.title,
      userId: user._id
    }));

    res.json({
      agents: {
        ai: aiAgents,
        human: formattedHumanAgents,
        all: [...aiAgents, ...formattedHumanAgents]
      }
    });
  } catch (error) {
    console.error('Get agents error:', error);
    res.status(500).json({ error: 'Failed to get agents' });
  }
});

// Get agent by ID
router.get('/:id', authenticate, async (req, res) => {
  try {
    const agentOrchestrator = req.app.locals.agentOrchestrator;
    
    // Try to get AI agent first
    const aiAgents = await agentOrchestrator.handleAgentAction({
      action: 'get-agents',
      payload: {}
    });

    const aiAgent = aiAgents.find(agent => agent.id === req.params.id);
    
    if (aiAgent) {
      return res.json({ agent: aiAgent });
    }

    // Try to get human agent
    const humanAgent = await User.findOne({
      $or: [
        { 'agentProfile.agentId': req.params.id },
        { _id: req.params.id.replace('human-', '') }
      ]
    });

    if (humanAgent) {
      return res.json({
        agent: {
          id: humanAgent.agentProfile.agentId || `human-${humanAgent._id}`,
          name: humanAgent.name,
          type: 'human',
          category: 'employee',
          avatar: humanAgent.avatarUrl,
          skills: humanAgent.skills.map(s => s.name),
          capabilities: humanAgent.agentProfile.capabilities,
          status: humanAgent.agentProfile.availability.status,
          workload: humanAgent.agentProfile.availability.workload,
          department: humanAgent.department,
          title: humanAgent.title,
          userId: humanAgent._id
        }
      });
    }

    res.status(404).json({ error: 'Agent not found' });
  } catch (error) {
    console.error('Get agent error:', error);
    res.status(500).json({ error: 'Failed to get agent' });
  }
});

// Assign task to agent
router.post('/assign-task', authenticate, async (req, res) => {
  try {
    const agentOrchestrator = req.app.locals.agentOrchestrator;
    
    const result = await agentOrchestrator.assignTask(req.body);
    
    res.json({
      message: 'Task assigned successfully',
      task: result
    });
  } catch (error) {
    console.error('Assign task error:', error);
    res.status(500).json({ error: 'Failed to assign task' });
  }
});

// Get agent tasks
router.get('/:id/tasks', authenticate, async (req, res) => {
  try {
    const agentOrchestrator = req.app.locals.agentOrchestrator;
    
    const tasks = await agentOrchestrator.handleAgentAction({
      action: 'get-tasks',
      payload: {}
    });

    const agentTasks = tasks.filter(task => task.assignedAgent === req.params.id);
    
    res.json({ tasks: agentTasks });
  } catch (error) {
    console.error('Get agent tasks error:', error);
    res.status(500).json({ error: 'Failed to get agent tasks' });
  }
});

// Update agent status
router.put('/:id/status', authenticate, async (req, res) => {
  try {
    const { status } = req.body;
    const agentId = req.params.id;

    // Check if it's a human agent
    if (agentId.startsWith('human-')) {
      const userId = agentId.replace('human-', '');
      const user = await User.findById(userId);
      
      if (!user) {
        return res.status(404).json({ error: 'Agent not found' });
      }

      user.agentProfile.availability.status = status;
      await user.save();

      return res.json({
        message: 'Agent status updated',
        agent: {
          id: agentId,
          status
        }
      });
    }

    // Update AI agent status (this would typically involve updating the orchestrator)
    const agentOrchestrator = req.app.locals.agentOrchestrator;
    
    const result = await agentOrchestrator.handleAgentAction({
      action: 'update-agent',
      payload: {
        agentId,
        updates: { status }
      }
    });

    res.json({
      message: 'Agent status updated',
      agent: result
    });
  } catch (error) {
    console.error('Update agent status error:', error);
    res.status(500).json({ error: 'Failed to update agent status' });
  }
});

// Get agent performance metrics
router.get('/:id/performance', authenticate, async (req, res) => {
  try {
    const agentOrchestrator = req.app.locals.agentOrchestrator;
    
    const agents = await agentOrchestrator.handleAgentAction({
      action: 'get-agents',
      payload: {}
    });

    const agent = agents.find(a => a.id === req.params.id);
    
    if (!agent) {
      // Check human agents
      const humanAgent = await User.findOne({
        'agentProfile.agentId': req.params.id
      });

      if (humanAgent) {
        return res.json({
          performance: {
            tasksCompleted: humanAgent.stats.tasksCompleted,
            averageRating: humanAgent.stats.averageRating,
            projectsCompleted: humanAgent.stats.projectsCompleted,
            bugsFixed: humanAgent.stats.bugsFixed,
            featuresDeployed: humanAgent.stats.featuresDeployed
          }
        });
      }

      return res.status(404).json({ error: 'Agent not found' });
    }

    res.json({
      performance: agent.performance
    });
  } catch (error) {
    console.error('Get agent performance error:', error);
    res.status(500).json({ error: 'Failed to get agent performance' });
  }
});

// Register human as agent
router.post('/register-human', authenticate, async (req, res) => {
  try {
    const { capabilities, skills } = req.body;

    const user = await User.findById(req.userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Update user to be an agent
    user.agentProfile.isAgent = true;
    user.agentProfile.agentId = `human-${user._id}`;
    user.agentProfile.capabilities = capabilities || user.agentProfile.capabilities;
    
    if (skills) {
      user.skills = skills;
    }

    await user.save();

    res.json({
      message: 'Successfully registered as agent',
      agent: {
        id: user.agentProfile.agentId,
        name: user.name,
        capabilities: user.agentProfile.capabilities,
        skills: user.skills
      }
    });
  } catch (error) {
    console.error('Register human agent error:', error);
    res.status(500).json({ error: 'Failed to register as agent' });
  }
});

module.exports = router;
