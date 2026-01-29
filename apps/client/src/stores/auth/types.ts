export interface AuthUser {
  id?: string;
  email?: string;
  name?: string;
  role?: string;
}

export interface AuthCredentials {
  token: string | null;
  user: AuthUser | null;
}
