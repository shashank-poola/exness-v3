import apiCaller from './api.service';
import { logger } from './logger.service';
import { UserProfile } from '../types/auth.type';
import { ServerError, Ok, type ServiceResult } from '../utils/api-result';

export interface AuthResponse {
  message: string;
  token: string;
  user: {
    email: string;
    balance: number;
  };
}

export async function authService( email: string, password: string, isSignIn: boolean ): Promise<ServiceResult<AuthResponse>> {
  try {
    const route = isSignIn ? 'signin' : 'signup';
    const response = await apiCaller.post<AuthResponse>(`/auth/${route}`, {
      email,
      password,
    });
    return Ok(response);
  } catch (error: unknown) {
    logger.error(
      'authService',
      `Error in user ${isSignIn ? 'signin' : 'signup'}`,
      error
    );
    const axiosError = error as { response?: { data?: { error?: string | string[] | Record<string, string[]> } }; message?: string };
    const apiError = axiosError.response?.data?.error;
    let msg: string | null = null;
    if (typeof apiError === 'string') msg = apiError;
    else if (Array.isArray(apiError)) msg = apiError[0] ?? null;
    else if (apiError && typeof apiError === 'object') {
      const first = Object.values(apiError).flat().find(Boolean);
      msg = typeof first === 'string' ? first : null;
    }
    return { success: false, error: msg ?? axiosError.message ?? 'Something went wrong' };
  }
}

export async function getUserProfile(): Promise<ServiceResult<UserProfile>> {
  try {
    const response = await apiCaller.get<UserProfile>('/auth/me');
    return Ok(response);
  } catch (error) {
    logger.error('authService', 'Error fetching user profile', error);
    return ServerError();
  }
}