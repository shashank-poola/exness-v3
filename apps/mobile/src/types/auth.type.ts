export interface SignupRequest {
    email: string;
    password: string;
}
  
export interface SignInRequest {
    email: string;
    password: string;
}

export interface AuthUser {
    email: string;
    balance: number;
}

export interface UserProfile {
    id: string;
    email: string;
    balance: number;
}

export const JWT_Token = "jwt_token";