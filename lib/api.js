import axios from 'axios'

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: { 'Content-Type': 'application/json' }
})

// Projects
export const getProjects = () => api.get('/projects/')
export const getProject = (id) => api.get(`/projects/${id}`)
export const createProject = (data) => api.post('/projects/', data)
export const updateProject = (id, data) => api.put(`/projects/${id}`, data)
export const deleteProject = (id) => api.delete(`/projects/${id}`)

// Chat
export const sendMessage = (projectId, data) =>
  api.post(`/projects/${projectId}/chat`, data)
export const getConversations = (projectId) =>
  api.get(`/projects/${projectId}/conversations`)
export const getMessages = (projectId, conversationId) =>
  api.get(`/projects/${projectId}/conversations/${conversationId}/messages`)

// Images
export const generateImage = (projectId, prompt) =>
  api.post(`/projects/${projectId}/images/generate`, { prompt })
export const analyzeImage = (imageId, question) =>
  api.post(`/projects/images/analyze`, { image_id: imageId, question })
export const getImages = (projectId) =>
  api.get(`/projects/${projectId}/images`)

// Agent
export const runAgent = (projectId) =>
  api.post(`/projects/${projectId}/run-agent`)
export const getAgentStatus = (runId) =>
  api.get(`/projects/agent-runs/${runId}`)