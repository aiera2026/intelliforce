const express = require('express');
const router = express.Router();
const Project = require('../models/Project');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

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

// Create project
router.post('/', authenticate, async (req, res) => {
  try {
    const {
      name,
      description,
      requirements,
      selectedAgents,
      stages,
      timeline,
      budget,
      tags,
      priority
    } = req.body;

    const project = new Project({
      name,
      description,
      requirements,
      owner: req.userId,
      selectedAgents,
      stages: stages || ['planning', 'design', 'development', 'testing', 'deployment'],
      timeline,
      budget,
      tags,
      priority
    });

    // Add owner to team
    project.team.push({
      userId: req.userId,
      role: 'owner'
    });

    await project.save();

    // Add project to user's projects
    await User.findByIdAndUpdate(req.userId, {
      $push: { projects: project._id }
    });

    res.status(201).json({
      message: 'Project created successfully',
      project
    });
  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json({ error: 'Failed to create project' });
  }
});

// Get all projects for user
router.get('/', authenticate, async (req, res) => {
  try {
    const { status, role } = req.query;
    
    const query = {
      $or: [
        { owner: req.userId },
        { 'team.userId': req.userId }
      ]
    };

    if (status) {
      query.status = status;
    }

    const projects = await Project.find(query)
      .populate('owner', 'name email avatar')
      .populate('team.userId', 'name email avatar')
      .sort('-createdAt');

    res.json({ projects });
  } catch (error) {
    console.error('Get projects error:', error);
    res.status(500).json({ error: 'Failed to get projects' });
  }
});

// Get single project
router.get('/:id', authenticate, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('owner', 'name email avatar')
      .populate('team.userId', 'name email avatar skills agentProfile');

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Check if user has access
    const hasAccess = project.owner._id.toString() === req.userId.toString() ||
      project.team.some(member => member.userId._id.toString() === req.userId.toString());

    if (!hasAccess) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json({ project });
  } catch (error) {
    console.error('Get project error:', error);
    res.status(500).json({ error: 'Failed to get project' });
  }
});

// Update project
router.put('/:id', authenticate, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Check if user is owner or has edit permissions
    const isOwner = project.owner.toString() === req.userId.toString();
    const teamMember = project.team.find(m => m.userId.toString() === req.userId.toString());
    const canEdit = isOwner || (teamMember && ['owner', 'developer', 'manager'].includes(teamMember.role));

    if (!canEdit) {
      return res.status(403).json({ error: 'Permission denied' });
    }

    // Update allowed fields
    const allowedUpdates = [
      'name', 'description', 'requirements', 'selectedAgents',
      'stages', 'status', 'progress', 'repository', 'timeline',
      'budget', 'tags', 'priority', 'settings'
    ];

    const updates = Object.keys(req.body)
      .filter(key => allowedUpdates.includes(key))
      .reduce((obj, key) => {
        obj[key] = req.body[key];
        return obj;
      }, {});

    Object.assign(project, updates);
    await project.save();

    res.json({
      message: 'Project updated successfully',
      project
    });
  } catch (error) {
    console.error('Update project error:', error);
    res.status(500).json({ error: 'Failed to update project' });
  }
});

// Add team member
router.post('/:id/team', authenticate, async (req, res) => {
  try {
    const { userId, role } = req.body;

    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Check if user is owner
    const isOwner = project.owner.toString() === req.userId.toString();
    if (!isOwner) {
      return res.status(403).json({ error: 'Only project owner can add team members' });
    }

    // Check if user exists
    const userToAdd = await User.findById(userId);
    if (!userToAdd) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Add team member
    await project.addTeamMember(userId, role);

    // Add project to user's projects
    await User.findByIdAndUpdate(userId, {
      $addToSet: { projects: project._id }
    });

    res.json({
      message: 'Team member added successfully',
      project
    });
  } catch (error) {
    console.error('Add team member error:', error);
    res.status(500).json({ error: 'Failed to add team member' });
  }
});

// Remove team member
router.delete('/:id/team/:userId', authenticate, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Check if user is owner
    const isOwner = project.owner.toString() === req.userId.toString();
    if (!isOwner) {
      return res.status(403).json({ error: 'Only project owner can remove team members' });
    }

    // Remove team member
    project.team = project.team.filter(
      member => member.userId.toString() !== req.params.userId
    );
    await project.save();

    // Remove project from user's projects
    await User.findByIdAndUpdate(req.params.userId, {
      $pull: { projects: project._id }
    });

    res.json({
      message: 'Team member removed successfully',
      project
    });
  } catch (error) {
    console.error('Remove team member error:', error);
    res.status(500).json({ error: 'Failed to remove team member' });
  }
});

// Update project progress
router.put('/:id/progress', authenticate, async (req, res) => {
  try {
    const { progress } = req.body;

    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    await project.updateProgress(progress);

    // Emit progress update via socket
    const io = req.app.locals.io;
    io.to(`project-${project._id}`).emit('progress-update', {
      projectId: project._id,
      progress: project.progress,
      status: project.status
    });

    res.json({
      message: 'Progress updated successfully',
      project
    });
  } catch (error) {
    console.error('Update progress error:', error);
    res.status(500).json({ error: 'Failed to update progress' });
  }
});

// Add artifact
router.post('/:id/artifacts', authenticate, async (req, res) => {
  try {
    const { type, name, url } = req.body;

    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    await project.addArtifact({ type, name, url });

    res.json({
      message: 'Artifact added successfully',
      project
    });
  } catch (error) {
    console.error('Add artifact error:', error);
    res.status(500).json({ error: 'Failed to add artifact' });
  }
});

// Update metrics
router.put('/:id/metrics', authenticate, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    Object.assign(project.metrics, req.body);
    await project.save();

    res.json({
      message: 'Metrics updated successfully',
      metrics: project.metrics
    });
  } catch (error) {
    console.error('Update metrics error:', error);
    res.status(500).json({ error: 'Failed to update metrics' });
  }
});

// Delete project
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Check if user is owner
    const isOwner = project.owner.toString() === req.userId.toString();
    if (!isOwner) {
      return res.status(403).json({ error: 'Only project owner can delete project' });
    }

    // Remove project from all team members' projects
    await User.updateMany(
      { projects: project._id },
      { $pull: { projects: project._id } }
    );

    await project.deleteOne();

    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error('Delete project error:', error);
    res.status(500).json({ error: 'Failed to delete project' });
  }
});

module.exports = router;
