import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { toast } from 'sonner';

export interface User {
  id: string;
  username: string;
  email: string;
  role: 'user' | 'admin';
  is_active: boolean;
  created_at: string;
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (emailOrUsername: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  checkAuthStatus: () => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<boolean>;
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

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api';

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = user !== null;

  // Check authentication status on app load
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/status`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data.authenticated) {
          setUser(data.data.user);
        } else {
          setUser(null);
        }
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (emailOrUsername: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username: emailOrUsername, password }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setUser(data.data.user);
        toast.success('Inicio de sesión exitoso');
        return true;
      } else {
        toast.error(data.error || 'Error al iniciar sesión');
        return false;
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Error de conexión al intentar iniciar sesión');
      return false;
    }
  };


  const logout = async () => {
    try {
      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      setUser(null);
      toast.success('Sesión cerrada exitosamente');
    } catch (error) {
      console.error('Logout error:', error);
      setUser(null); // Clear user state even if logout request fails
      toast.error('Error al cerrar sesión');
    }
  };

  const changePassword = async (currentPassword: string, newPassword: string): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/change-password`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          current_password: currentPassword, 
          new_password: newPassword 
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success('Contraseña cambiada exitosamente');
        return true;
      } else {
        toast.error(data.error || 'Error al cambiar contraseña');
        return false;
      }
    } catch (error) {
      console.error('Change password error:', error);
      toast.error('Error de conexión al cambiar contraseña');
      return false;
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    checkAuthStatus,
    changePassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};