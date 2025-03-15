import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
});

export const registerUser = (userData) => api.post('/users/register', userData);
export const getAllPaths = () => api.get('/paths');