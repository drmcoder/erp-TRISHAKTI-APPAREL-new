// Shared authentication types

export interface User {
  id: string;
  username: string;
  name: string;
  role: 'operator' | 'supervisor' | 'management' | 'admin';
  email?: string;
  permissions: string[];
  department?: string;
  machineType?: string;
  skills?: string[];
  active: boolean;
  lastLogin?: Date;
  createdAt: Date;
}

export interface LoginCredentials {
  username: string;
  password: string;
  rememberMe?: boolean;
}

export interface AuthResponse {
  success: boolean;
  data?: User;
  error?: string;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}