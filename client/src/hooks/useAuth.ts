import { useEffect, useRef, useState, useCallback } from 'react';
import { useAuthStore } from '../store/authStore';
import api from '../api/axios';

export const useAuth = () => {
  const { 
    token, 
    user, 
    isAuthenticated, 
    isLoading,
    error,
    setToken, 
    setUser, 
    setLoading, 
    setError,
    clearAuth 
  } = useAuthStore();
  
  // Track if we're already refreshing to prevent multiple refresh calls
  const isRefreshing = useRef(false);
  // Track if initial auth check has been done
  const isInitialized = useRef(false);
  // Track if auth check is pending
  const [isCheckingAuth, setIsCheckingAuth] = useState(true); // Start with true to block immediate redirects
  
  const refreshAuth = useCallback(async (): Promise<string | null> => {
    if (isRefreshing.current) return null;
    
    isRefreshing.current = true;
    
    try {
      const response = await api.post('/auth/refresh-token');
      const { token, ...userData } = response.data;
      
      setToken(token);
      setUser(userData);
      
      isRefreshing.current = false;
      return token;
    } catch (error) {
      clearAuth();
      isRefreshing.current = false;
      return null;
    }
  }, [setToken, setUser, clearAuth]);
  
  // Setup interceptors for automatic token refresh
  const setupInterceptors = useCallback(() => {    
    // Add token to all requests
    const requestInterceptor = api.interceptors.request.use(
      config => {
        if (token) {
          config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
      },
      error => Promise.reject(error)
    );
    
    // Handle 401 errors with token refresh
    const responseInterceptor = api.interceptors.response.use(
      response => response,
      async error => {
        const originalRequest = error.config;
        const is401Error = error.response?.status === 401;
        const isAuthEndpoint = originalRequest?.url && (
          originalRequest.url.includes('/auth/login') ||
          originalRequest.url.includes('/auth/register') ||
          originalRequest.url.includes('/auth/refresh-token') ||
          originalRequest.url.includes('/auth/me')
        );
        
        // Only attempt refresh for 401 errors on non-auth endpoints
        if (is401Error && !isAuthEndpoint && !originalRequest._retry) {
          originalRequest._retry = true;
          
          const newToken = await refreshAuth();
          if (newToken) {
            originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
            return api(originalRequest);
          }
        }
        
        return Promise.reject(error);
      }
    );
    
    // Return cleanup function
    return () => {
      api.interceptors.request.eject(requestInterceptor);
      api.interceptors.response.eject(responseInterceptor);
    };
  }, [token, refreshAuth]);
  
  // Check authentication status
  const checkAuth = useCallback(async () => {
    setLoading(true);
    setIsCheckingAuth(true);
    
    // Skip check if we're already authenticated
    if (isAuthenticated && token && user) {
      setLoading(false);
      setIsCheckingAuth(false);
      return;
    }
    
    try {
      await refreshAuth();
    } finally {
      setLoading(false);
      setIsCheckingAuth(false);
    }
  }, [isAuthenticated, token, user, setLoading, refreshAuth]);
  
  // Execute the auth check and set up interceptors
  useEffect(() => {
    // Only run once
    if (!isInitialized.current) {
      isInitialized.current = true;
      
      // Run immediately
      const initialize = async () => {
        const cleanup = setupInterceptors();
        await checkAuth();
        return cleanup;
      };
      
      let cleanup: (() => void) | undefined;
      initialize().then(cleanupFn => {
        cleanup = cleanupFn;
      });
      
      return () => {
        if (cleanup) cleanup();
      };
    }
  }, [setupInterceptors, checkAuth]);
  
  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token, ...userData } = response.data;
      
      setToken(token);
      setUser(userData);
      return userData;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Login failed. Please try again.';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };
  
  const register = async (firstName: string, lastName: string, email: string, password: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.post('/auth/register', { 
        firstName, lastName, email, password 
      });
      
      const { token, ...userData } = response.data;
      
      setToken(token);
      setUser(userData);
      return userData;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Registration failed. Please try again.';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };
  
  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } finally {
      clearAuth();
    }
  };
  
  return {
    token,
    user,
    isAuthenticated,
    isLoading,
    isCheckingAuth,
    error,
    login,
    register,
    logout,
    refreshAuth
  };
}; 