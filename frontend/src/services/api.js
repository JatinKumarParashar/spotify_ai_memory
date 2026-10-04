import axios from 'axios';

const API = axios.create({ baseURL: 'http://localhost:3000/v1' });

const authConfig = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } });

export const getMemories = (userId) => API.get('/memories', { ...authConfig(), params: { userId } });
export const addMemory = (data) => API.post('/events', data, authConfig());
export const editMemory = (id, fact, userId) => API.patch(`/memories/${id}`, { fact, userId }, authConfig());
export const deleteMemory = (id, userId) => API.delete(`/memories/${id}`, { ...authConfig(), params: { userId } });
export const sendChat = (userId, prompt) => API.post('/chat', { userId, prompt }, authConfig());