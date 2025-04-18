import { create } from 'zustand';
import api from '../api/axios';

interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
}

interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  setToken: (token: string) => void;
  setUser: (user: User) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  setToken: (token) => {
    // Set token in api headers
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    set({ token, isAuthenticated: true });
  },
  setUser: (user) => set({ user }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  clearAuth: () => {
    delete api.defaults.headers.common['Authorization'];
    set({ token: null, user: null, isAuthenticated: false });
  },
})); 