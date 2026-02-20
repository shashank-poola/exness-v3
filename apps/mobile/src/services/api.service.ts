import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { getToken } from '../storage/auth.storage';
import { env } from '../config/env';
import { logger } from './logger.service';

const API_BASE_URL = env.EXPO_PUBLIC_BACKEND_URL;

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
  validateStatus: (status) => status >= 200 && status < 300,
});

api.interceptors.request.use(
  async (config) => {
    try {
      const token = await getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      logger.error('Axios interceptor', 'Failed to get token', error);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const msg = error.response?.data?.message ?? error.response?.data?.error ?? error.message;
    logger.error('API Error', msg, error.response?.data);
    return Promise.reject(error);
  }
);

async function get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
  const response: AxiosResponse<T> = await api.get(url, config);
  return response.data;
}

async function post<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
  const response: AxiosResponse<T> = await api.post(url, data, config);
  return response.data;
}

export const apiCaller = { get, post };
export default apiCaller;