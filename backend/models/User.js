const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  avatar: {
    type: String,
    default: null
  },
  role: {
    type: String,
    enum: ['user', 'developer', 'manager', 'admin'],
    default: 'user'
  },
  skills: [{
    name: String,
    level: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced', 'expert'],
      default: 'intermediate'
    }
  }],
  department: {
    type: String,
    default: 'Engineering'
  },
  title: {
    type: String,
    default: 'Software Developer'
  },
  agentProfile: {
    isAgent: {
      type: Boolean,
      default: false
    },
    agentId: String,
    capabilities: {
      codeGeneration: { type: Number, default: 0 },
      debugging: { type: Number, default: 0 },
      testing: { type: Number, default: 0 },
      documentation: { type: Number, default: 0 },
      design: { type: Number, default: 0 },
      deployment: { type: Number, default: 0 }
    },
    availability: {
      status: {
        type: String,
        enum: ['available', 'busy', 'away', 'offline'],
        default: 'available'
      },
      workload: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
      }
    }
  },
  preferences: {
    theme: {
      type: String,
      enum: ['light', 'dark', 'auto'],
      default: 'light'
    },
    notifications: {
      email: { type: Boolean, default: true },
      inApp: { type: Boolean, default: true },
      push: { type: Boolean, default: false }
    },
    language: {
      type: String,
      default: 'en'
    }
  },
  projects: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project'
  }],
  stats: {
    projectsCompleted: { type: Number, default: 0 },
    tasksCompleted: { type: Number, default: 0 },
    codeReviews: { type: Number, default: 0 },
    bugsFixed: { type: Number, default: 0 },
    featuresDeployed: { type: Number, default: 0 },
    averageRating: { type: Number, default: 0 }
  },
  lastActive: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  },
  refreshToken: String,
  passwordResetToken: String,
  passwordResetExpires: Date,
  emailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: String,
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

// Indexes
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ 'agentProfile.isAgent': 1 });
userSchema.index({ 'agentProfile.availability.status': 1 });

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Update last active
userSchema.methods.updateLastActive = function() {
  this.lastActive = new Date();
  return this.save();
};

// Check if user can be assigned as agent
userSchema.methods.canBeAgent = function() {
  return this.agentProfile.isAgent && 
         this.agentProfile.availability.status === 'available' &&
         this.agentProfile.availability.workload < 80;
};

// Update workload
userSchema.methods.updateWorkload = function(delta) {
  this.agentProfile.availability.workload = Math.min(100, 
    Math.max(0, this.agentProfile.availability.workload + delta)
  );
  
  if (this.agentProfile.availability.workload >= 100) {
    this.agentProfile.availability.status = 'busy';
  } else if (this.agentProfile.availability.workload === 0) {
    this.agentProfile.availability.status = 'available';
  }
  
  return this.save();
};

// Virtual for full avatar URL
userSchema.virtual('avatarUrl').get(function() {
  if (this.avatar && this.avatar.startsWith('http')) {
    return this.avatar;
  }
  return this.avatar ? `/uploads/avatars/${this.avatar}` : '/avatars/default.svg';
});

// Remove sensitive data when converting to JSON
userSchema.methods.toJSON = function() {
  const obj = this.toObject();
  delete obj.password;
  delete obj.refreshToken;
  delete obj.passwordResetToken;
  delete obj.emailVerificationToken;
  return obj;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
