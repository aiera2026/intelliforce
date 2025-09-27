const EventEmitter = require('events');
const { v4: uuidv4 } = require('uuid');

class WorkflowEngine extends EventEmitter {
  constructor(io, agentOrchestrator) {
    super();
    this.io = io;
    this.agentOrchestrator = agentOrchestrator;
    this.workflows = new Map();
    this.activeProjects = new Map();
    this.sdlcStages = this.initializeSDLCStages();
    this.running = false;
    this.start();
  }

  initializeSDLCStages() {
    return {
      planning: {
        id: 'planning',
        name: 'Planning',
        description: 'Requirements analysis, project scoping, timeline estimation',
        order: 1,
        requiredAgents: ['product-ideation', 'raindrop'],
        tasks: [
          'requirements-gathering',
          'feasibility-analysis',
          'project-scoping',
          'timeline-estimation',
          'resource-planning'
        ],
        outputs: ['PRD', 'project-plan', 'timeline', 'resource-allocation'],
        estimatedDuration: 7200000, // 2 hours in ms
        color: '#4CAF50'
      },
      design: {
        id: 'design',
        name: 'Design',
        description: 'Architecture design, UI/UX mockups, technical specifications',
        order: 2,
        requiredAgents: ['uiux-designer', 'expert-programmer'],
        tasks: [
          'architecture-design',
          'ui-mockups',
          'ux-flows',
          'technical-specifications',
          'api-design'
        ],
        outputs: ['design-mockups', 'architecture-diagram', 'tech-specs', 'api-docs'],
        estimatedDuration: 10800000, // 3 hours
        color: '#2196F3'
      },
      development: {
        id: 'development',
        name: 'Development',
        description: 'Code generation, implementation, version control integration',
        order: 3,
        requiredAgents: ['expert-programmer', 'python-expert', 'java-expert'],
        tasks: [
          'setup-environment',
          'implement-features',
          'integrate-apis',
          'database-setup',
          'frontend-development',
          'backend-development'
        ],
        outputs: ['source-code', 'documentation', 'commit-history'],
        estimatedDuration: 28800000, // 8 hours
        color: '#FF9800'
      },
      codeReview: {
        id: 'code-review',
        name: 'Code Analysis & Reviews',
        description: 'Automated and human code reviews, quality metrics',
        order: 4,
        requiredAgents: ['coderabbit', 'expert-programmer'],
        tasks: [
          'static-analysis',
          'code-review',
          'security-scanning',
          'performance-analysis',
          'best-practices-check'
        ],
        outputs: ['review-report', 'issues-list', 'improvement-suggestions'],
        estimatedDuration: 3600000, // 1 hour
        color: '#9C27B0'
      },
      testing: {
        id: 'testing',
        name: 'Testing',
        description: 'Unit testing, integration testing, automated test generation',
        order: 5,
        requiredAgents: ['expert-programmer', 'operation'],
        tasks: [
          'unit-testing',
          'integration-testing',
          'e2e-testing',
          'performance-testing',
          'security-testing'
        ],
        outputs: ['test-results', 'coverage-report', 'bug-reports'],
        estimatedDuration: 7200000, // 2 hours
        color: '#F44336'
      },
      deployment: {
        id: 'deployment',
        name: 'Deployment',
        description: 'CI/CD pipeline management, environment provisioning',
        order: 6,
        requiredAgents: ['devops-engineer', 'raindrop'],
        tasks: [
          'build-preparation',
          'environment-setup',
          'deployment-pipeline',
          'configuration-management',
          'rollout-strategy'
        ],
        outputs: ['deployment-status', 'environment-urls', 'deployment-logs'],
        estimatedDuration: 3600000, // 1 hour
        color: '#00BCD4'
      },
      maintenance: {
        id: 'maintenance',
        name: 'Maintenance',
        description: 'Monitoring, bug fixes, performance optimization, security updates',
        order: 7,
        requiredAgents: ['devops-engineer', 'optimization'],
        tasks: [
          'monitoring-setup',
          'performance-monitoring',
          'error-tracking',
          'security-patching',
          'optimization'
        ],
        outputs: ['monitoring-dashboard', 'performance-metrics', 'maintenance-log'],
        estimatedDuration: 0, // Ongoing
        color: '#795548'
      }
    };
  }

  async createWorkflow(projectData) {
    const workflowId = uuidv4();
    const workflow = {
      id: workflowId,
      projectId: projectData.projectId,
      name: projectData.name,
      description: projectData.description,
      requirements: projectData.requirements,
      selectedAgents: projectData.selectedAgents || [],
      stages: this.prepareStages(projectData),
      currentStage: null,
      status: 'created',
      progress: 0,
      createdAt: new Date(),
      startedAt: null,
      completedAt: null,
      metrics: {
        totalTasks: 0,
        completedTasks: 0,
        failedTasks: 0,
        averageTaskTime: 0,
        estimatedCompletion: null
      },
      outputs: {},
      logs: []
    };

    this.workflows.set(workflowId, workflow);
    this.activeProjects.set(projectData.projectId, workflowId);

    this.emit('workflow-created', workflow);
    this.io.emit('workflow-update', {
      type: 'created',
      workflow
    });

    return workflow;
  }

  prepareStages(projectData) {
    const stages = {};
    const selectedStages = projectData.stages || Object.keys(this.sdlcStages);

    for (const stageId of selectedStages) {
      const stageTemplate = this.sdlcStages[stageId];
      if (stageTemplate) {
        stages[stageId] = {
          ...stageTemplate,
          status: 'pending',
          progress: 0,
          startedAt: null,
          completedAt: null,
          tasks: stageTemplate.tasks.map(taskType => ({
            id: uuidv4(),
            type: taskType,
            status: 'pending',
            assignedAgent: null,
            result: null,
            startedAt: null,
            completedAt: null
          })),
          outputs: {}
        };
      }
    }

    return stages;
  }

  async startWorkflow(workflowId) {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) {
      throw new Error('Workflow not found');
    }

    workflow.status = 'running';
    workflow.startedAt = new Date();
    workflow.currentStage = Object.keys(workflow.stages)[0];

    this.logWorkflowEvent(workflow, 'Workflow started');

    this.io.emit('workflow-update', {
      type: 'started',
      workflow
    });

    // Start processing stages sequentially
    await this.processNextStage(workflow);

    return workflow;
  }

  async processNextStage(workflow) {
    if (!workflow.currentStage) {
      // Find next pending stage
      const pendingStages = Object.entries(workflow.stages)
        .filter(([, stage]) => stage.status === 'pending')
        .sort((a, b) => a[1].order - b[1].order);

      if (pendingStages.length === 0) {
        // All stages completed
        await this.completeWorkflow(workflow);
        return;
      }

      workflow.currentStage = pendingStages[0][0];
    }

    const currentStage = workflow.stages[workflow.currentStage];
    currentStage.status = 'in-progress';
    currentStage.startedAt = new Date();

    this.logWorkflowEvent(workflow, `Started ${currentStage.name} stage`);

    this.io.emit('stage-update', {
      workflowId: workflow.id,
      stageId: workflow.currentStage,
      stage: currentStage
    });

    // Process all tasks in the stage
    await this.processStageTasks(workflow, currentStage);
  }

  async processStageTasks(workflow, stage) {
    const tasksToProcess = stage.tasks.filter(task => task.status === 'pending');
    let completedTasks = 0;

    for (const task of tasksToProcess) {
      try {
        // Find suitable agents for this task
        const requiredAgents = stage.requiredAgents;
        const availableAgents = workflow.selectedAgents.filter(agentId =>
          requiredAgents.includes(agentId)
        );

        if (availableAgents.length === 0) {
          // Use default agents if none selected
          availableAgents.push(...requiredAgents);
        }

        // Create task for agent orchestrator
        const agentTask = await this.agentOrchestrator.assignTask({
          type: task.type,
          workflowId: workflow.id,
          stageId: stage.id,
          priority: 'normal',
          requiredAgents: availableAgents,
          data: {
            requirements: workflow.requirements,
            stageContext: stage,
            previousOutputs: workflow.outputs
          }
        });

        task.status = 'in-progress';
        task.assignedAgent = agentTask.assignedAgent;
        task.startedAt = new Date();

        // Wait for task completion
        await this.waitForTaskCompletion(agentTask.id);

        const completedTask = this.agentOrchestrator.tasks.get(agentTask.id);
        
        if (completedTask.status === 'completed') {
          task.status = 'completed';
          task.result = completedTask.result;
          task.completedAt = new Date();
          completedTasks++;
          
          workflow.metrics.completedTasks++;
          this.updateWorkflowMetrics(workflow, task);
        } else {
          task.status = 'failed';
          task.error = completedTask.error;
          workflow.metrics.failedTasks++;
        }

        // Update stage progress
        const totalTasks = stage.tasks.length;
        const completed = stage.tasks.filter(t => t.status === 'completed').length;
        stage.progress = (completed / totalTasks) * 100;

        this.io.emit('task-progress', {
          workflowId: workflow.id,
          stageId: stage.id,
          task,
          stageProgress: stage.progress
        });

      } catch (error) {
        task.status = 'failed';
        task.error = error.message;
        workflow.metrics.failedTasks++;
        
        this.logWorkflowEvent(workflow, `Task ${task.type} failed: ${error.message}`);
      }
    }

    // Complete stage
    stage.status = completedTasks === stage.tasks.length ? 'completed' : 'partially-completed';
    stage.completedAt = new Date();
    stage.progress = 100;

    // Generate stage outputs
    await this.generateStageOutputs(workflow, stage);

    this.logWorkflowEvent(workflow, `Completed ${stage.name} stage`);

    this.io.emit('stage-complete', {
      workflowId: workflow.id,
      stageId: stage.id,
      stage
    });

    // Process next stage
    workflow.currentStage = null;
    await this.processNextStage(workflow);
  }

  async waitForTaskCompletion(taskId, timeout = 300000) { // 5 min timeout
    return new Promise((resolve, reject) => {
      const checkInterval = setInterval(() => {
        const task = this.agentOrchestrator.tasks.get(taskId);
        
        if (!task) {
          clearInterval(checkInterval);
          reject(new Error('Task not found'));
          return;
        }

        if (task.status === 'completed' || task.status === 'failed') {
          clearInterval(checkInterval);
          resolve(task);
        }
      }, 1000); // Check every second

      setTimeout(() => {
        clearInterval(checkInterval);
        reject(new Error('Task timeout'));
      }, timeout);
    });
  }

  async generateStageOutputs(workflow, stage) {
    // Aggregate task results to create stage outputs
    const outputs = {};

    for (const outputType of stage.outputs) {
      const relevantTasks = stage.tasks.filter(
        task => task.status === 'completed' && task.result
      );

      outputs[outputType] = {
        type: outputType,
        generatedAt: new Date(),
        content: relevantTasks.map(task => ({
          taskType: task.type,
          result: task.result
        }))
      };
    }

    stage.outputs = outputs;
    workflow.outputs[stage.id] = outputs;

    this.io.emit('outputs-generated', {
      workflowId: workflow.id,
      stageId: stage.id,
      outputs
    });
  }

  async completeWorkflow(workflow) {
    workflow.status = 'completed';
    workflow.completedAt = new Date();
    workflow.progress = 100;

    const duration = workflow.completedAt - workflow.startedAt;
    
    this.logWorkflowEvent(workflow, `Workflow completed in ${this.formatDuration(duration)}`);

    // Generate final report
    const report = this.generateWorkflowReport(workflow);

    this.emit('workflow-completed', {
      workflow,
      report
    });

    this.io.emit('workflow-update', {
      type: 'completed',
      workflow,
      report
    });

    return report;
  }

  generateWorkflowReport(workflow) {
    const stageReports = Object.entries(workflow.stages).map(([stageId, stage]) => ({
      stageId,
      name: stage.name,
      status: stage.status,
      duration: stage.completedAt && stage.startedAt ? 
        stage.completedAt - stage.startedAt : 0,
      tasksCompleted: stage.tasks.filter(t => t.status === 'completed').length,
      totalTasks: stage.tasks.length,
      outputs: stage.outputs
    }));

    return {
      workflowId: workflow.id,
      projectId: workflow.projectId,
      name: workflow.name,
      status: workflow.status,
      totalDuration: workflow.completedAt - workflow.startedAt,
      stages: stageReports,
      metrics: workflow.metrics,
      outputs: workflow.outputs,
      summary: {
        totalStages: Object.keys(workflow.stages).length,
        completedStages: stageReports.filter(s => s.status === 'completed').length,
        successRate: (workflow.metrics.completedTasks / 
          (workflow.metrics.completedTasks + workflow.metrics.failedTasks)) * 100
      }
    };
  }

  updateWorkflowMetrics(workflow, task) {
    const taskDuration = task.completedAt - task.startedAt;
    const totalTasks = workflow.metrics.completedTasks + workflow.metrics.failedTasks;
    
    workflow.metrics.averageTaskTime = 
      (workflow.metrics.averageTaskTime * (totalTasks - 1) + taskDuration) / totalTasks;

    // Update estimated completion
    const remainingTasks = workflow.metrics.totalTasks - totalTasks;
    const estimatedRemainingTime = remainingTasks * workflow.metrics.averageTaskTime;
    workflow.metrics.estimatedCompletion = new Date(Date.now() + estimatedRemainingTime);

    // Update overall progress
    workflow.progress = (totalTasks / workflow.metrics.totalTasks) * 100;
  }

  logWorkflowEvent(workflow, message) {
    const logEntry = {
      timestamp: new Date(),
      message,
      level: 'info'
    };

    workflow.logs.push(logEntry);

    this.io.emit('workflow-log', {
      workflowId: workflow.id,
      log: logEntry
    });
  }

  formatDuration(ms) {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  }

  async handleWorkflowAction(data) {
    const { action, payload } = data;

    switch (action) {
      case 'create':
        return await this.createWorkflow(payload);
      
      case 'start':
        return await this.startWorkflow(payload.workflowId);
      
      case 'pause':
        const workflow = this.workflows.get(payload.workflowId);
        if (workflow) {
          workflow.status = 'paused';
          return workflow;
        }
        throw new Error('Workflow not found');
      
      case 'resume':
        const pausedWorkflow = this.workflows.get(payload.workflowId);
        if (pausedWorkflow && pausedWorkflow.status === 'paused') {
          pausedWorkflow.status = 'running';
          await this.processNextStage(pausedWorkflow);
          return pausedWorkflow;
        }
        throw new Error('Workflow not found or not paused');
      
      case 'cancel':
        const cancelWorkflow = this.workflows.get(payload.workflowId);
        if (cancelWorkflow) {
          cancelWorkflow.status = 'cancelled';
          cancelWorkflow.completedAt = new Date();
          return cancelWorkflow;
        }
        throw new Error('Workflow not found');
      
      case 'get':
        return this.workflows.get(payload.workflowId);
      
      case 'list':
        return Array.from(this.workflows.values());
      
      default:
        throw new Error(`Unknown action: ${action}`);
    }
  }

  start() {
    this.running = true;
    
    // Count total tasks for all workflows
    setInterval(() => {
      for (const [, workflow] of this.workflows) {
        if (workflow.status === 'running') {
          let totalTasks = 0;
          for (const stage of Object.values(workflow.stages)) {
            totalTasks += stage.tasks.length;
          }
          workflow.metrics.totalTasks = totalTasks;
        }
      }
    }, 5000); // Every 5 seconds
  }

  isRunning() {
    return this.running;
  }

  shutdown() {
    this.running = false;
    this.removeAllListeners();
  }
}

module.exports = WorkflowEngine;
