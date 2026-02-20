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
  } catch (error) {
    logger.error(
      'authService',
      `Error in user ${isSignIn ? 'signin' : 'signup'}`,
      error
    );
    return ServerError();
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