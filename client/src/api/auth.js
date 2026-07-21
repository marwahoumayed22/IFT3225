import { apiClient } from './client';

export function register({ email, password, name }) {
  return apiClient.post('/auth/register', { email, password, name });
}

export function login({ email, password }) {
  return apiClient.post('/auth/login', { email, password });
}
