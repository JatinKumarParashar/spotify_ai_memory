import axios from 'axios';

const API = axios.create({ baseURL: 'http://localhost:3000/v1' });

export const getMemories = (userId) => API.get(`/memories?userId=${userId}`);
export const addMemory = (data) => API.post('/events', data);
export const editMemory = (id, fact) => API.patch(`/memories/${id}`, { fact });
export const deleteMemory = (id) => API.delete(`/memories/${id}`);
export const sendChat = (userId, prompt) => API.post('/chat', { userId, prompt });