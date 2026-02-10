export interface User {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  image: string;
}

export interface LoginRequest {
  username: string;
  password: string;
  expiresInMins?: number;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface AuthContextState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface AuthContextActions {
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => void;
}

export interface AuthContextMeta {
  initialized: boolean;
}

export interface AuthContextValue {
  state: AuthContextState;
  actions: AuthContextActions;
  meta: AuthContextMeta;
}
