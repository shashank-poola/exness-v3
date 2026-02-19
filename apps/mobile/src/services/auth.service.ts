import apiCaller from './api.service';
import type { SignupRequest, SignInRequest } from '../types/auth.type';
import type { AuthUser } from '../types/auth.type';
import { logger } from './logger.service';

export interface AuthSuccessResponse {
  message: string;
  token: string;
  user: AuthUser;
}

export async function signupService(input: SignupRequest): Promise<AuthSuccessResponse> {
  return apiCaller.post<AuthSuccessResponse>('/auth/signup', input);
}

export async function signInService(input: SignInRequest): Promise<AuthSuccessResponse> {
  return apiCaller.post<AuthSuccessResponse>('/auth/signin', input);
}