const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Project = require('../models/Project');

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

// Create workflow for project
router.post('/create', authenticate, async (req, res) => {
  try {
    const { projectId, stages } = req.body;

    const project = await Project.findById(projectId);
    
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Check if user has permission
    const hasPermission = project.owner.toString() === req.userId.toString() ||
      project.team.some(member => member.userId.toString() === req.userId.toString());

    if (!hasPermission) {
      return res.status(403).json({ error: 'Permission denied' });
    }

    const workflowEngine = req.app.locals.workflowEngine;
    
    const workflow = await workflowEngine.createWorkflow({
      projectId: project._id,
      name: project.name,
      description: project.description,
      requirements: project.requirements,
      selectedAgents: project.selectedAgents,
      stages: stages || project.stages
    });

    // Update project with workflow ID
    project.workflowId = workflow.id;
    await project.save();

    res.json({
      message: 'Workflow created successfully',
      workflow
    });
  } catch (error) {
    console.error('Create workflow error:', error);
    res.status(500).json({ error: 'Failed to create workflow' });
  }
});

// Start workflow
router.post('/:workflowId/start', authenticate, async (req, res) => {
  try {
    const workflowEngine = req.app.locals.workflowEngine;
    
    const workflow = await workflowEngine.startWorkflow(req.params.workflowId);

    // Update project status
    const project = await Project.findOne({ workflowId: req.params.workflowId });
    if (project) {
      project.status = 'active';
      await project.save();
    }

    res.json({
      message: 'Workflow started successfully',
      workflow
    });
  } catch (error) {
    console.error('Start workflow error:', error);
    res.status(500).json({ error: 'Failed to start workflow' });
  }
});

// Pause workflow
router.post('/:workflowId/pause', authenticate, async (req, res) => {
  try {
    const workflowEngine = req.app.locals.workflowEngine;
    
    const workflow = await workflowEngine.handleWorkflowAction({
      action: 'pause',
      payload: { workflowId: req.params.workflowId }
    });

    res.json({
      message: 'Workflow paused successfully',
      workflow
    });
  } catch (error) {
    console.error('Pause workflow error:', error);
    res.status(500).json({ error: 'Failed to pause workflow' });
  }
});

// Resume workflow
router.post('/:workflowId/resume', authenticate, async (req, res) => {
  try {
    const workflowEngine = req.app.locals.workflowEngine;
    
    const workflow = await workflowEngine.handleWorkflowAction({
      action: 'resume',
      payload: { workflowId: req.params.workflowId }
    });

    res.json({
      message: 'Workflow resumed successfully',
      workflow
    });
  } catch (error) {
    console.error('Resume workflow error:', error);
    res.status(500).json({ error: 'Failed to resume workflow' });
  }
});

// Cancel workflow
router.post('/:workflowId/cancel', authenticate, async (req, res) => {
  try {
    const workflowEngine = req.app.locals.workflowEngine;
    
    const workflow = await workflowEngine.handleWorkflowAction({
      action: 'cancel',
      payload: { workflowId: req.params.workflowId }
    });

    // Update project status
    const project = await Project.findOne({ workflowId: req.params.workflowId });
    if (project) {
      project.status = 'archived';
      await project.save();
    }

    res.json({
      message: 'Workflow cancelled successfully',
      workflow
    });
  } catch (error) {
    console.error('Cancel workflow error:', error);
    res.status(500).json({ error: 'Failed to cancel workflow' });
  }
});

// Get workflow status
router.get('/:workflowId', authenticate, async (req, res) => {
  try {
    const workflowEngine = req.app.locals.workflowEngine;
    
    const workflow = await workflowEngine.handleWorkflowAction({
      action: 'get',
      payload: { workflowId: req.params.workflowId }
    });

    if (!workflow) {
      return res.status(404).json({ error: 'Workflow not found' });
    }

    res.json({ workflow });
  } catch (error) {
    console.error('Get workflow error:', error);
    res.status(500).json({ error: 'Failed to get workflow' });
  }
});

// Get all workflows
router.get('/', authenticate, async (req, res) => {
  try {
    const workflowEngine = req.app.locals.workflowEngine;
    
    const workflows = await workflowEngine.handleWorkflowAction({
      action: 'list',
      payload: {}
    });

    // Filter workflows based on user's projects
    const userProjects = await Project.find({
      $or: [
        { owner: req.userId },
        { 'team.userId': req.userId }
      ]
    }).select('_id');

    const projectIds = userProjects.map(p => p._id.toString());
    const userWorkflows = workflows.filter(w => 
      projectIds.includes(w.projectId.toString())
    );

    res.json({ workflows: userWorkflows });
  } catch (error) {
    console.error('Get workflows error:', error);
    res.status(500).json({ error: 'Failed to get workflows' });
  }
});

// Get workflow stages
router.get('/stages/list', authenticate, async (req, res) => {
  try {
    const workflowEngine = req.app.locals.workflowEngine;
    const stages = workflowEngine.sdlcStages;

    res.json({ stages });
  } catch (error) {
    console.error('Get stages error:', error);
    res.status(500).json({ error: 'Failed to get stages' });
  }
});

// Get workflow report
router.get('/:workflowId/report', authenticate, async (req, res) => {
  try {
    const workflowEngine = req.app.locals.workflowEngine;
    
    const workflow = await workflowEngine.handleWorkflowAction({
      action: 'get',
      payload: { workflowId: req.params.workflowId }
    });

    if (!workflow) {
      return res.status(404).json({ error: 'Workflow not found' });
    }

    const report = workflowEngine.generateWorkflowReport(workflow);

    res.json({ report });
  } catch (error) {
    console.error('Get workflow report error:', error);
    res.status(500).json({ error: 'Failed to get workflow report' });
  }
});

// Get workflow logs
router.get('/:workflowId/logs', authenticate, async (req, res) => {
  try {
    const workflowEngine = req.app.locals.workflowEngine;
    
    const workflow = await workflowEngine.handleWorkflowAction({
      action: 'get',
      payload: { workflowId: req.params.workflowId }
    });

    if (!workflow) {
      return res.status(404).json({ error: 'Workflow not found' });
    }

    res.json({ logs: workflow.logs });
  } catch (error) {
    console.error('Get workflow logs error:', error);
    res.status(500).json({ error: 'Failed to get workflow logs' });
  }
});

// Get workflow outputs
router.get('/:workflowId/outputs', authenticate, async (req, res) => {
  try {
    const workflowEngine = req.app.locals.workflowEngine;
    
    const workflow = await workflowEngine.handleWorkflowAction({
      action: 'get',
      payload: { workflowId: req.params.workflowId }
    });

    if (!workflow) {
      return res.status(404).json({ error: 'Workflow not found' });
    }

    res.json({ outputs: workflow.outputs });
  } catch (error) {
    console.error('Get workflow outputs error:', error);
    res.status(500).json({ error: 'Failed to get workflow outputs' });
  }
});

module.exports = router;
