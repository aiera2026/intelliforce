import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export const agentService = {
  async getAgents() {
    const response = await axios.get(`${API_URL}/api/agents`);
    return response.data;
  },

  async getAgent(id: string) {
    const response = await axios.get(`${API_URL}/api/agents/${id}`);
    return response.data;
  },

  async assignTask(task: any) {
    const response = await axios.post(`${API_URL}/api/agents/assign-task`, task);
    return response.data;
  },

  async getAgentTasks(agentId: string) {
    const response = await axios.get(`${API_URL}/api/agents/${agentId}/tasks`);
    return response.data;
  },

  async updateAgentStatus(agentId: string, status: string) {
    const response = await axios.put(`${API_URL}/api/agents/${agentId}/status`, { status });
    return response.data;
  },

  async getAgentPerformance(agentId: string) {
    const response = await axios.get(`${API_URL}/api/agents/${agentId}/performance`);
    return response.data;
  },

  async registerAsAgent(capabilities: any, skills: any[]) {
    const response = await axios.post(`${API_URL}/api/agents/register-human`, {
      capabilities,
      skills,
    });
    return response.data;
  },
};
