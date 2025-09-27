import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export const projectService = {
  async createProject(data: any) {
    const response = await axios.post(`${API_URL}/api/projects`, data);
    return response.data;
  },

  async getProjects(status?: string) {
    const params = status ? { status } : {};
    const response = await axios.get(`${API_URL}/api/projects`, { params });
    return response.data;
  },

  async getProject(id: string) {
    const response = await axios.get(`${API_URL}/api/projects/${id}`);
    return response.data;
  },

  async updateProject(id: string, data: any) {
    const response = await axios.put(`${API_URL}/api/projects/${id}`, data);
    return response.data;
  },

  async deleteProject(id: string) {
    const response = await axios.delete(`${API_URL}/api/projects/${id}`);
    return response.data;
  },

  async addTeamMember(projectId: string, userId: string, role: string) {
    const response = await axios.post(`${API_URL}/api/projects/${projectId}/team`, {
      userId,
      role,
    });
    return response.data;
  },

  async removeTeamMember(projectId: string, userId: string) {
    const response = await axios.delete(`${API_URL}/api/projects/${projectId}/team/${userId}`);
    return response.data;
  },

  async updateProgress(projectId: string, progress: number) {
    const response = await axios.put(`${API_URL}/api/projects/${projectId}/progress`, {
      progress,
    });
    return response.data;
  },

  async addArtifact(projectId: string, artifact: any) {
    const response = await axios.post(`${API_URL}/api/projects/${projectId}/artifacts`, artifact);
    return response.data;
  },

  async updateMetrics(projectId: string, metrics: any) {
    const response = await axios.put(`${API_URL}/api/projects/${projectId}/metrics`, metrics);
    return response.data;
  },

  async createWorkflow(projectId: string, stages?: string[]) {
    const response = await axios.post(`${API_URL}/api/workflows/create`, {
      projectId,
      stages,
    });
    return response.data;
  },

  async startWorkflow(workflowId: string) {
    const response = await axios.post(`${API_URL}/api/workflows/${workflowId}/start`);
    return response.data;
  },

  async pauseWorkflow(workflowId: string) {
    const response = await axios.post(`${API_URL}/api/workflows/${workflowId}/pause`);
    return response.data;
  },

  async resumeWorkflow(workflowId: string) {
    const response = await axios.post(`${API_URL}/api/workflows/${workflowId}/resume`);
    return response.data;
  },

  async cancelWorkflow(workflowId: string) {
    const response = await axios.post(`${API_URL}/api/workflows/${workflowId}/cancel`);
    return response.data;
  },

  async getWorkflow(workflowId: string) {
    const response = await axios.get(`${API_URL}/api/workflows/${workflowId}`);
    return response.data;
  },

  async getWorkflowReport(workflowId: string) {
    const response = await axios.get(`${API_URL}/api/workflows/${workflowId}/report`);
    return response.data;
  },

  async getWorkflowLogs(workflowId: string) {
    const response = await axios.get(`${API_URL}/api/workflows/${workflowId}/logs`);
    return response.data;
  },

  async getWorkflowOutputs(workflowId: string) {
    const response = await axios.get(`${API_URL}/api/workflows/${workflowId}/outputs`);
    return response.data;
  },
};
