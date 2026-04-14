import axios from 'axios';
import type { AuthResponse, Team, Match, MatchSuggestion, Field, FieldTimeSlot, User } from '../types';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth
export const authApi = {
  login: (email: string, password: string) =>
    api.post<AuthResponse>('/auth/login', { email, password }),
  register: (data: Record<string, unknown>) =>
    api.post<AuthResponse>('/auth/register', data),
  me: () => api.get<User>('/auth/me'),
};

// Teams
export const teamsApi = {
  getAll: () => api.get<Team[]>('/teams'),
  getById: (id: string) => api.get<Team>(`/teams/${id}`),
  getMy: () => api.get<Team[]>('/teams/my'),
  create: (data: { name: string; address: string; latitude: number; longitude: number }) =>
    api.post<Team>('/teams', data),
  invite: (teamId: string, userId: string) =>
    api.post<Team>(`/teams/${teamId}/invite`, { userId }),
  removeMember: (teamId: string, playerId: string) =>
    api.delete(`/teams/${teamId}/members/${playerId}`),
};

// Matches
export const matchesApi = {
  getById: (id: string) => api.get<Match>(`/matches/${id}`),
  getByTeam: (teamId: string) => api.get<Match[]>(`/matches/team/${teamId}`),
  create: (data: { teamAId: string; teamBId: string; matchTime: string; location: string; fieldId?: string }) =>
    api.post<Match>('/matches', data),
  confirm: (id: string) => api.post<Match>(`/matches/${id}/confirm`),
  cancel: (id: string) => api.post<Match>(`/matches/${id}/cancel`),
  submitResult: (id: string, scoreA: number, scoreB: number) =>
    api.post<Match>(`/matches/${id}/result`, { scoreA, scoreB }),
  confirmResult: (id: string) => api.post<Match>(`/matches/${id}/confirm-result`),
};

// Matchmaking
export const matchmakingApi = {
  getBestMatches: (teamId: string, count = 3) =>
    api.get<MatchSuggestion[]>(`/matchmaking/${teamId}?count=${count}`),
};

// Fields
export const fieldsApi = {
  getAll: () => api.get<Field[]>('/fields'),
  getById: (id: string) => api.get<Field>(`/fields/${id}`),
  create: (data: Record<string, unknown>) => api.post<Field>('/fields', data),
  addTimeSlot: (fieldId: string, data: Record<string, unknown>) =>
    api.post<FieldTimeSlot>(`/fields/${fieldId}/timeslots`, data),
  getAvailableSlots: (fieldId: string) =>
    api.get<FieldTimeSlot[]>(`/fields/${fieldId}/timeslots`),
};

// Users
export const usersApi = {
  getAll: () => api.get<User[]>('/users'),
  getById: (id: string) => api.get<User>(`/users/${id}`),
};

export default api;
