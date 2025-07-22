import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useToast } from '@/hooks/use-toast';

interface User {
  _id: string;
  name: string;
  email: string;
  wallet: string;
  role: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string, otp?: string) => Promise<boolean>;
  register: (name: string, email: string, password: string, otp?: string) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const API_BASE = `${import.meta.env.VITE_BACKEND_API_URL}/api/auth`;

  // Load token from localStorage on init
  useEffect(() => {
    const savedToken = localStorage.getItem('auth_token');
    const savedUser = localStorage.getItem('auth_user');
    
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
      validateSession(savedToken);
    } else {
      setLoading(false);
    }
  }, []);

  // Validate session with server
  const validateSession = async (authToken: string) => {
    try {
      const response = await fetch(`${API_BASE}/validate-session`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (data.success) {
        setUser(data.data.user);
        setToken(authToken);
      } else {
        // Session invalid, clear stored data
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
        setUser(null);
        setToken(null);
      }
    } catch (error) {
      console.error('Session validation error:', error);
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
      setUser(null);
      setToken(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string, otp?: string): Promise<boolean> => {
    try {
      const requestBody: any = { email, password };
      if (otp) {
        requestBody.otp = otp;
      }

      const response = await fetch(`${API_BASE}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      if (data.success) {
        const { user: userData, token: userToken } = data.data;
        setUser(userData);
        setToken(userToken);
        
        // Store in localStorage
        localStorage.setItem('auth_token', userToken);
        localStorage.setItem('auth_user', JSON.stringify(userData));
        
        toast({
          title: "Login Successful",
          description: "Welcome back!",
        });
        
        return true;
      } else {
        // Handle error messages
        if (Array.isArray(data.error)) {
          // Validation errors
          data.error.forEach((err: any) => {
            toast({
              title: "Validation Error",
              description: err.message,
              variant: "destructive",
            });
          });
        } else {
          // Simple error message
          toast({
            title: "Login Failed",
            description: data.error,
            variant: "destructive",
          });
        }
        return false;
      }
    } catch (error) {
      toast({
        title: "Connection Error",
        description: "Unable to connect to server. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  };

  const register = async (name: string, email: string, password: string, otp?: string): Promise<boolean> => {
    try {
      const requestBody: any = { name, email, password };
      if (otp) {
        requestBody.otp = otp;
      }

      const response = await fetch(`${API_BASE}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      if (data.success) {
        const { user: userData, token: userToken } = data.data;
        setUser(userData);
        setToken(userToken);
        
        // Store in localStorage
        localStorage.setItem('auth_token', userToken);
        localStorage.setItem('auth_user', JSON.stringify(userData));
        
        toast({
          title: "Registration Successful",
          description: "Welcome to Keylo!",
        });
        
        return true;
      } else {
        // Handle error messages
        if (Array.isArray(data.error)) {
          // Validation errors
          data.error.forEach((err: any) => {
            toast({
              title: "Validation Error",
              description: err.message,
              variant: "destructive",
            });
          });
        } else {
          // Simple error message
          toast({
            title: "Registration Failed",
            description: data.error,
            variant: "destructive",
          });
        }
        return false;
      }
    } catch (error) {
      toast({
        title: "Connection Error",
        description: "Unable to connect to server. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  };

  const logout = async () => {
    try {
      if (token) {
        const response = await fetch(`${API_BASE}/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        const data = await response.json();

        if (data.success) {
          toast({
            title: "Logged Out",
            description: "You have been successfully logged out.",
          });
        } else {
          toast({
            title: "Logout Error",
            description: "There was an issue logging out, but you've been logged out locally.",
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      toast({
        title: "Connection Error",
        description: "Unable to connect to server, but you've been logged out locally.",
        variant: "destructive",
      });
    } finally {
      // Always clear local state and redirect regardless of API response
      setUser(null);
      setToken(null);
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
      window.location.href = '/login';
    }
  };

  const value = {
    user,
    token,
    login,
    register,
    logout,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};