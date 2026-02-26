export interface SignupRequest {
    email: string;
    password: string;
};
  
export interface SignInRequest {
    email: string;
    password: string;
};

export interface AuthUser {
    email: string;
    balance: number;
};

export interface UserProfile {
    id: string;
    email: string;
    balance: number;
};

export type AuthContextType = {
    user: AuthUser | null;
    login: (user: AuthUser, token: string) => void;
    logout: () => void;
    getCurrentUser: () => Promise<void>;
    isLoading: boolean;
};

export const JWT_Token = "jwt_token";