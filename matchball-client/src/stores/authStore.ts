import { create } from 'zustand';
import type { User } from '../types';
import { authApi } from '../services/api';

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: Record<string, unknown>) => Promise<void>;
  logout: () => void;
  loadUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: localStorage.getItem('token'),
  isLoading: false,

  login: async (email, password) => {
    set({ isLoading: true });
    const { data } = await authApi.login(email, password);
    localStorage.setItem('token', data.token);
    set({ user: data.user, token: data.token, isLoading: false });
  },

  register: async (formData) => {
    set({ isLoading: true });
    const { data } = await authApi.register(formData);
    localStorage.setItem('token', data.token);
    set({ user: data.user, token: data.token, isLoading: false });
  },

  logout: () => {
    localStorage.removeItem('token');
    set({ user: null, token: null });
  },

  loadUser: async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const { data } = await authApi.me();
      set({ user: data, token });
    } catch {
      localStorage.removeItem('token');
      set({ user: null, token: null });
    }
  },
}));
