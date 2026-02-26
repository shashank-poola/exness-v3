import { useRouter, type Href } from 'expo-router';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { getToken, removeToken, storeToken } from '../storage/auth.storage';
import { getUserProfile } from '../services/auth.service';
import { logger } from '../services/logger.service';
import type { AuthUser } from '../types/auth.type';
import { AuthContextType } from '../types/auth.type';

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCurrentUser = async () => {
    try {
      const token = await getToken();
      if (!token) {
        setIsLoading(false);
        return;
      }

      const response = await getUserProfile();
      if (response.success && response.data) {
        setUser(response.data);
      }
    } catch (error) {
      logger.error('fetchCurrentUser', 'Failed to fetch current user:', error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const login = async (user: AuthUser, token: string) => {
    try {
      setUser(user);
      await storeToken(token);
      router.replace('/(tabs)/home' as Href);
    } catch (error) {
      logger.error('login', 'Error logging in auth context', error);
    }
  };

  const logout = async () => {
    try {
      setUser(null);
      await removeToken();
      router.replace('/(auth)/signin');
    } catch (error) {
      logger.error('logout', 'Error logging out auth context', error);
    }
  };

  return (
    <AuthContext.Provider value={{ login, user, logout, getCurrentUser: fetchCurrentUser, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};