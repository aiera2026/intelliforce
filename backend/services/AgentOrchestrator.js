const EventEmitter = require('events');
const { v4: uuidv4 } = require('uuid');

class AgentOrchestrator extends EventEmitter {
  constructor(io) {
    super();
    this.io = io;
    this.agents = new Map();
    this.tasks = new Map();
    this.conflicts = new Map();
    this.running = false;
    this.initializeAgents();
    this.startOrchestration();
  }

  initializeAgents() {
    // Initialize Human-Defined Natural Agents
    this.registerAgent({
      id: 'expert-programmer',
      name: 'Expert Programmer',
      type: 'human-defined',
      category: 'development',
      avatar: '/avatars/expert-programmer.svg',
      skills: ['JavaScript', 'Python', 'Java', 'C++', 'Go', 'Rust'],
      capabilities: {
        codeGeneration: 0.95,
        debugging: 0.90,
        optimization: 0.85,
        architecture: 0.80
      },
      status: 'available',
      workload: 0
    });

    this.registerAgent({
      id: 'product-ideation',
      name: 'Product Ideation Master',
      type: 'human-defined',
      category: 'planning',
      avatar: '/avatars/product-ideation.svg',
      skills: ['Requirements Analysis', 'User Stories', 'PRD Creation', 'Market Research'],
      capabilities: {
        requirements: 0.95,
        planning: 0.90,
        userResearch: 0.85,
        documentation: 0.88
      },
      status: 'available',
      workload: 0
    });

    this.registerAgent({
      id: 'python-expert',
      name: 'Python Expert',
      type: 'human-defined',
      category: 'development',
      avatar: '/avatars/python-expert.svg',
      skills: ['Django', 'FastAPI', 'NumPy', 'Pandas', 'TensorFlow', 'PyTorch'],
      capabilities: {
        pythonDevelopment: 0.98,
        mlEngineering: 0.85,
        dataProcessing: 0.90,
        apiDevelopment: 0.88
      },
      status: 'available',
      workload: 0
    });

    this.registerAgent({
      id: 'java-expert',
      name: 'Java Expert',
      type: 'human-defined',
      category: 'development',
      avatar: '/avatars/java-expert.svg',
      skills: ['Spring Boot', 'Hibernate', 'Microservices', 'JUnit', 'Maven'],
      capabilities: {
        javaDevelopment: 0.98,
        enterpriseApps: 0.90,
        microservices: 0.85,
        testing: 0.88
      },
      status: 'available',
      workload: 0
    });

    this.registerAgent({
      id: 'uiux-designer',
      name: 'UI/UX Designer',
      type: 'human-defined',
      category: 'design',
      avatar: '/avatars/uiux-designer.svg',
      skills: ['Figma', 'Sketch', 'Adobe XD', 'User Research', 'Prototyping'],
      capabilities: {
        uiDesign: 0.95,
        uxDesign: 0.92,
        prototyping: 0.88,
        userTesting: 0.85
      },
      status: 'available',
      workload: 0
    });

    this.registerAgent({
      id: 'devops-engineer',
      name: 'DevOps Engineer',
      type: 'human-defined',
      category: 'deployment',
      avatar: '/avatars/devops-engineer.svg',
      skills: ['Docker', 'Kubernetes', 'CI/CD', 'AWS', 'Azure', 'Terraform'],
      capabilities: {
        deployment: 0.95,
        infrastructure: 0.90,
        monitoring: 0.88,
        security: 0.85
      },
      status: 'available',
      workload: 0
    });

    // Initialize BigBoss Agents
    this.registerAgent({
      id: 'coderabbit',
      name: 'CodeRabbit Agent',
      type: 'bigboss',
      category: 'code-review',
      avatar: '/avatars/coderabbit.svg',
      skills: ['Automated Code Review', 'Quality Analysis', 'Best Practices', 'Security Scanning'],
      capabilities: {
        codeReview: 0.95,
        qualityAnalysis: 0.92,
        securityScanning: 0.88,
        performanceAnalysis: 0.85
      },
      status: 'available',
      workload: 0
    });

    this.registerAgent({
      id: 'raindrop',
      name: 'Raindrop Agent',
      type: 'bigboss',
      category: 'planning',
      avatar: '/avatars/raindrop.svg',
      skills: ['PRD Planning', 'Backend Development', 'Coordination', 'Deployment'],
      capabilities: {
        prdCreation: 0.90,
        backendDevelopment: 0.88,
        coordination: 0.92,
        deployment: 0.85
      },
      status: 'available',
      workload: 0
    });

    this.registerAgent({
      id: 'dispatch',
      name: 'Dispatch Agent',
      type: 'bigboss',
      category: 'orchestration',
      avatar: '/avatars/dispatch.svg',
      skills: ['Task Prioritization', 'Task Assignment', 'Load Balancing'],
      capabilities: {
        taskPrioritization: 0.95,
        taskAssignment: 0.92,
        loadBalancing: 0.90,
        scheduling: 0.88
      },
      status: 'available',
      workload: 0
    });

    this.registerAgent({
      id: 'operation',
      name: 'Operation Agent',
      type: 'bigboss',
      category: 'operations',
      avatar: '/avatars/operation.svg',
      skills: ['Resource Management', 'Monitoring', 'Status Reporting'],
      capabilities: {
        resourceManagement: 0.90,
        monitoring: 0.92,
        reporting: 0.88,
        dataAnalysis: 0.85
      },
      status: 'available',
      workload: 0
    });

    this.registerAgent({
      id: 'optimization',
      name: 'Optimization Agent',
      type: 'bigboss',
      category: 'optimization',
      avatar: '/avatars/optimization.svg',
      skills: ['Conflict Resolution', 'Debugging', 'Performance Optimization'],
      capabilities: {
        conflictResolution: 0.95,
        debugging: 0.90,
        optimization: 0.92,
        coordination: 0.88
      },
      status: 'available',
      workload: 0
    });
  }

  registerAgent(agentConfig) {
    this.agents.set(agentConfig.id, {
      ...agentConfig,
      taskQueue: [],
      currentTask: null,
      performance: {
        tasksCompleted: 0,
        averageTime: 0,
        successRate: 1.0
      }
    });
  }

  async assignTask(task) {
    const taskId = uuidv4();
    const taskData = {
      id: taskId,
      ...task,
      status: 'pending',
      assignedAgent: null,
      createdAt: new Date(),
      startedAt: null,
      completedAt: null,
      result: null
    };

    this.tasks.set(taskId, taskData);

    // Use Dispatch Agent to find optimal agent
    const dispatchAgent = this.agents.get('dispatch');
    const optimalAgent = await this.findOptimalAgent(task);

    if (optimalAgent) {
      taskData.assignedAgent = optimalAgent.id;
      taskData.status = 'assigned';
      optimalAgent.taskQueue.push(taskData);
      
      this.emit('task-assigned', {
        taskId,
        agentId: optimalAgent.id,
        task: taskData
      });

      this.io.emit('task-update', {
        type: 'assigned',
        task: taskData,
        agent: optimalAgent
      });

      // Process task asynchronously
      this.processAgentTask(optimalAgent, taskData);
    } else {
      taskData.status = 'queued';
      this.emit('task-queued', taskData);
      
      this.io.emit('task-update', {
        type: 'queued',
        task: taskData
      });
    }

    return taskData;
  }

  async findOptimalAgent(task) {
    const availableAgents = Array.from(this.agents.values()).filter(
      agent => agent.status === 'available' && 
               this.matchesTaskRequirements(agent, task)
    );

    if (availableAgents.length === 0) return null;

    // Score agents based on capabilities and workload
    const scoredAgents = availableAgents.map(agent => {
      const capabilityScore = this.calculateCapabilityScore(agent, task);
      const workloadScore = 1 - (agent.workload / 100);
      const performanceScore = agent.performance.successRate;
      
      return {
        agent,
        score: (capabilityScore * 0.5) + (workloadScore * 0.3) + (performanceScore * 0.2)
      };
    });

    scoredAgents.sort((a, b) => b.score - a.score);
    return scoredAgents[0].agent;
  }

  matchesTaskRequirements(agent, task) {
    if (task.requiredAgentType && agent.type !== task.requiredAgentType) {
      return false;
    }
    
    if (task.requiredCategory && agent.category !== task.requiredCategory) {
      return false;
    }

    if (task.requiredSkills) {
      const hasRequiredSkills = task.requiredSkills.some(skill => 
        agent.skills.includes(skill)
      );
      if (!hasRequiredSkills) return false;
    }

    return true;
  }

  calculateCapabilityScore(agent, task) {
    if (!task.requiredCapabilities) return 1.0;

    const scores = Object.keys(task.requiredCapabilities).map(capability => {
      const agentCapability = agent.capabilities[capability] || 0;
      const requiredLevel = task.requiredCapabilities[capability];
      return agentCapability >= requiredLevel ? agentCapability : 0;
    });

    return scores.length > 0 ? scores.reduce((a, b) => a + b) / scores.length : 1.0;
  }

  async processAgentTask(agent, task) {
    agent.status = 'busy';
    agent.currentTask = task;
    agent.workload = Math.min(100, agent.workload + 25);
    task.status = 'in-progress';
    task.startedAt = new Date();

    this.io.emit('agent-status', {
      agentId: agent.id,
      status: 'busy',
      currentTask: task.id,
      workload: agent.workload
    });

    try {
      // Simulate task processing (replace with actual AI processing)
      const result = await this.executeTask(agent, task);
      
      task.status = 'completed';
      task.completedAt = new Date();
      task.result = result;
      
      // Update agent performance metrics
      agent.performance.tasksCompleted++;
      const taskDuration = task.completedAt - task.startedAt;
      agent.performance.averageTime = 
        (agent.performance.averageTime * (agent.performance.tasksCompleted - 1) + taskDuration) / 
        agent.performance.tasksCompleted;

      this.emit('task-completed', {
        taskId: task.id,
        agentId: agent.id,
        result
      });

      this.io.emit('task-update', {
        type: 'completed',
        task,
        agent
      });
    } catch (error) {
      task.status = 'failed';
      task.error = error.message;
      agent.performance.successRate *= 0.95; // Decrease success rate

      this.emit('task-failed', {
        taskId: task.id,
        agentId: agent.id,
        error: error.message
      });

      this.io.emit('task-update', {
        type: 'failed',
        task,
        agent
      });

      // Check if conflict resolution is needed
      await this.handleConflict(task, error);
    } finally {
      agent.status = 'available';
      agent.currentTask = null;
      agent.workload = Math.max(0, agent.workload - 25);
      agent.taskQueue = agent.taskQueue.filter(t => t.id !== task.id);

      this.io.emit('agent-status', {
        agentId: agent.id,
        status: 'available',
        currentTask: null,
        workload: agent.workload
      });

      // Process next task in queue if any
      if (agent.taskQueue.length > 0) {
        const nextTask = agent.taskQueue[0];
        this.processAgentTask(agent, nextTask);
      }
    }
  }

  async executeTask(agent, task) {
    // Simulate different task types
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const success = Math.random() > 0.1; // 90% success rate
        
        if (success) {
          resolve({
            output: `Task ${task.type} completed by ${agent.name}`,
            metadata: {
              processingTime: Date.now() - task.startedAt,
              agentId: agent.id,
              confidence: 0.85 + Math.random() * 0.15
            }
          });
        } else {
          reject(new Error(`Task execution failed: Random failure for testing`));
        }
      }, 2000 + Math.random() * 3000); // 2-5 second processing time
    });
  }

  async handleConflict(task, error) {
    const optimizationAgent = this.agents.get('optimization');
    
    if (!optimizationAgent || optimizationAgent.status === 'busy') {
      // Queue conflict for later resolution
      const conflictId = uuidv4();
      this.conflicts.set(conflictId, {
        id: conflictId,
        task,
        error,
        status: 'pending',
        createdAt: new Date()
      });
      return;
    }

    // Assign conflict resolution to Optimization Agent
    await this.assignTask({
      type: 'conflict-resolution',
      priority: 'high',
      requiredAgentType: 'bigboss',
      requiredCategory: 'optimization',
      data: {
        originalTask: task,
        error: error.message
      }
    });
  }

  async handleAgentAction(data) {
    const { action, payload } = data;

    switch (action) {
      case 'assign-task':
        return await this.assignTask(payload);
      
      case 'get-agents':
        return Array.from(this.agents.values()).map(agent => ({
          id: agent.id,
          name: agent.name,
          type: agent.type,
          category: agent.category,
          avatar: agent.avatar,
          status: agent.status,
          workload: agent.workload,
          skills: agent.skills,
          performance: agent.performance
        }));
      
      case 'get-tasks':
        return Array.from(this.tasks.values());
      
      case 'get-conflicts':
        return Array.from(this.conflicts.values());
      
      case 'update-agent':
        const agent = this.agents.get(payload.agentId);
        if (agent) {
          Object.assign(agent, payload.updates);
          return agent;
        }
        throw new Error('Agent not found');
      
      default:
        throw new Error(`Unknown action: ${action}`);
    }
  }

  startOrchestration() {
    this.running = true;
    
    // Periodic health checks and optimization
    setInterval(() => {
      this.performHealthCheck();
      this.optimizeWorkload();
    }, 30000); // Every 30 seconds
  }

  performHealthCheck() {
    for (const [agentId, agent] of this.agents) {
      // Check for stuck tasks
      if (agent.currentTask && agent.currentTask.startedAt) {
        const taskAge = Date.now() - agent.currentTask.startedAt;
        if (taskAge > 600000) { // 10 minutes
          console.warn(`Task ${agent.currentTask.id} has been running for over 10 minutes on agent ${agentId}`);
          this.io.emit('health-warning', {
            type: 'stuck-task',
            agentId,
            taskId: agent.currentTask.id,
            duration: taskAge
          });
        }
      }
    }
  }

  optimizeWorkload() {
    const overloadedAgents = Array.from(this.agents.values()).filter(
      agent => agent.workload > 75
    );
    
    const underutilizedAgents = Array.from(this.agents.values()).filter(
      agent => agent.workload < 25 && agent.status === 'available'
    );

    // Rebalance if needed
    if (overloadedAgents.length > 0 && underutilizedAgents.length > 0) {
      for (const overloaded of overloadedAgents) {
        if (overloaded.taskQueue.length > 1) {
          const taskToMove = overloaded.taskQueue.pop();
          const targetAgent = underutilizedAgents[0];
          targetAgent.taskQueue.push(taskToMove);
          
          this.io.emit('workload-rebalanced', {
            from: overloaded.id,
            to: targetAgent.id,
            task: taskToMove.id
          });
        }
      }
    }
  }

  isRunning() {
    return this.running;
  }

  shutdown() {
    this.running = false;
    this.removeAllListeners();
  }
}

module.exports = AgentOrchestrator;
