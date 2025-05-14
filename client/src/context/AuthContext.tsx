import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { 
  useGetMeQuery, 
  useRefreshMutation, 
  useLoginMutation, 
  useRegisterMutation 
} from '../store/api/authApi';

interface User {
  id: string;
  username: string;
  email: string;
  isEmailVerified?: boolean;
  isAdmin?: boolean;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<User | null>;
  register: (username: string, email: string, password: string) => Promise<{ message: string } | null>;
  logout: () => void;
  loading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [loginMutation, { isLoading: isLoginLoading }] = useLoginMutation();
  const [registerMutation, { isLoading: isRegisterLoading }] = useRegisterMutation();
  const [refresh, { isLoading: isRefreshing }] = useRefreshMutation();
  const {
    data: meData,
    error: getMeError,
    isLoading: isGetMeLoading,
    refetch: refetchMe,
  } = useGetMeQuery(undefined, {
    skip: !localStorage.getItem('token'),
  });

  const setAuthData = (accessToken: string, refreshToken: string, userData: User) => {
    localStorage.setItem('token', accessToken);
    localStorage.setItem('refresh_token', refreshToken);
    setUser(userData);
  };

  const login = useCallback(async (email: string, password: string): Promise<User | null> => {
    setError(null);
    try {
      const response = await loginMutation({ email, password }).unwrap();
      setAuthData(response.access_token, response.refresh_token, response.user);
      return response.user;
    } catch (err: any) {
      const errorMessage = err?.data?.message || 'An error occurred during login';
      setError(errorMessage);
      console.error('Login error:', err);
      throw new Error(errorMessage);
    }
  }, [loginMutation]);

  const register = useCallback(async (username: string, email: string, password: string): Promise<{ message: string } | null> => {
    setError(null);
    try {
      const response = await registerMutation({ username, email, password }).unwrap();
      return response;
    } catch (err: any) {
      const errorMessage = err?.data?.message || 'An error occurred during registration';
      setError(errorMessage);
      console.error('Register error:', err);
      throw new Error(errorMessage);
    }
  }, [registerMutation]);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('refresh_token');
    setUser(null);
  }, []);

  useEffect(() => {
    if (meData) {
      setUser(meData);
    } else if (localStorage.getItem('token')) {
      refetchMe();
    }
  }, [meData, refetchMe]);

  useEffect(() => {
    const tryRefresh = async () => {
      if (getMeError && 'status' in getMeError && getMeError.status === 401) {
        const refresh_token = localStorage.getItem('refresh_token');
        if (refresh_token) {
          try {
            const result = await refresh({ refreshToken: refresh_token }).unwrap();
            localStorage.setItem('token', result.access_token);
            await refetchMe();
          } catch (refreshErr) {
            console.error('Token refresh failed:', refreshErr);
            logout();
          }
        } else {
          logout();
        }
      } else if (getMeError) {
        console.error('GetMe error:', getMeError);
        setError((getMeError as any)?.data?.message || 'Failed to load user profile');
      }
    };
    if(getMeError) tryRefresh();
  }, [getMeError, refresh, logout, refetchMe]);

  const value = {
    user,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    loading: isLoginLoading || isRegisterLoading || isGetMeLoading || isRefreshing,
    error: error,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext; 