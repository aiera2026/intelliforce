const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  requirements: {
    type: String,
    required: true
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  team: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    role: {
      type: String,
      enum: ['owner', 'developer', 'designer', 'tester', 'viewer'],
      default: 'developer'
    },
    addedAt: {
      type: Date,
      default: Date.now
    }
  }],
  selectedAgents: [{
    type: String
  }],
  workflowId: {
    type: String
  },
  stages: [{
    type: String,
    enum: ['planning', 'design', 'development', 'code-review', 'testing', 'deployment', 'maintenance']
  }],
  status: {
    type: String,
    enum: ['draft', 'active', 'completed', 'archived'],
    default: 'draft'
  },
  progress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  repository: {
    url: String,
    branch: String,
    lastCommit: String
  },
  deployments: [{
    environment: String,
    url: String,
    status: String,
    deployedAt: Date
  }],
  metrics: {
    codeQuality: {
      type: Number,
      default: 0
    },
    testCoverage: {
      type: Number,
      default: 0
    },
    vulnerabilities: {
      type: Number,
      default: 0
    },
    performance: {
      type: Number,
      default: 0
    }
  },
  artifacts: [{
    type: {
      type: String,
      enum: ['document', 'code', 'design', 'test', 'report']
    },
    name: String,
    url: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  timeline: {
    estimatedStart: Date,
    estimatedEnd: Date,
    actualStart: Date,
    actualEnd: Date
  },
  budget: {
    estimated: Number,
    spent: Number,
    currency: {
      type: String,
      default: 'USD'
    }
  },
  aiUsage: {
    tokensUsed: {
      type: Number,
      default: 0
    },
    apiCalls: {
      type: Number,
      default: 0
    },
    cost: {
      type: Number,
      default: 0
    }
  },
  settings: {
    autoApprove: {
      type: Boolean,
      default: false
    },
    notificationPreferences: {
      email: {
        type: Boolean,
        default: true
      },
      inApp: {
        type: Boolean,
        default: true
      },
      slack: {
        type: Boolean,
        default: false
      }
    },
    securitySettings: {
      requireCodeReview: {
        type: Boolean,
        default: true
      },
      requireTesting: {
        type: Boolean,
        default: true
      },
      minTestCoverage: {
        type: Number,
        default: 80
      }
    }
  },
  tags: [String],
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for better query performance
projectSchema.index({ owner: 1, status: 1 });
projectSchema.index({ 'team.userId': 1 });
projectSchema.index({ workflowId: 1 });
projectSchema.index({ createdAt: -1 });
projectSchema.index({ tags: 1 });

// Virtual for team members count
projectSchema.virtual('teamSize').get(function() {
  return this.team.length;
});

// Virtual for is completed
projectSchema.virtual('isCompleted').get(function() {
  return this.status === 'completed';
});

// Method to add team member
projectSchema.methods.addTeamMember = function(userId, role) {
  const existingMember = this.team.find(member => 
    member.userId.toString() === userId.toString()
  );
  
  if (!existingMember) {
    this.team.push({ userId, role });
  }
  
  return this.save();
};

// Method to update progress
projectSchema.methods.updateProgress = function(progress) {
  this.progress = Math.min(100, Math.max(0, progress));
  
  if (this.progress === 100 && this.status !== 'completed') {
    this.status = 'completed';
    this.timeline.actualEnd = new Date();
  }
  
  return this.save();
};

// Method to add artifact
projectSchema.methods.addArtifact = function(artifact) {
  this.artifacts.push(artifact);
  return this.save();
};

// Pre-save middleware
projectSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  
  // Start timeline if project becomes active
  if (this.isModified('status') && this.status === 'active' && !this.timeline.actualStart) {
    this.timeline.actualStart = new Date();
  }
  
  next();
});

const Project = mongoose.model('Project', projectSchema);

module.exports = Project;
