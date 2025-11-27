import { useMutation } from '@tanstack/react-query';
import api from '@/lib/axios';

interface SignupData {
  email: string;
  password: string;
  name: string;
}

interface SigninData {
  email: string;
  password: string;
}

export function useSignup() {
  return useMutation({
    mutationFn: async (data: SignupData) => {
      const response = await api.post('/auth/signup', data);
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('userEmail', data.email);
      }
      return response.data;
    },
  });
}

export function useSignin() {
  return useMutation({
    mutationFn: async (data: SigninData) => {
      const response = await api.post('/auth/signin', data);
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('userEmail', data.email);
      }
      return response.data;
    },
  });
}

export function useLogout() {
  return () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userEmail');
    window.location.href = '/auth';
  };
}

export function isAuthenticated() {
  return !!localStorage.getItem('token');
}

export function getUserEmail() {
  return localStorage.getItem('userEmail');
}
