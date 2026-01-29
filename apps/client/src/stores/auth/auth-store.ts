import { create } from 'zustand';
import { AuthCredentials, AuthUser } from './types';

interface AuthState {
  token: string | null;
  user: AuthUser | null;
  signin: (credentials: AuthCredentials) => void;
  signout: () => void;
}

export const useAuthStore = create<AuthState>(set => ({
  token: null,
  user: null,
  signin: ({ token, user }) => set({ token, user }),
  signout: () => set({ token: null, user: null }),
}));

export const useToken = () => useAuthStore(state => state.token);
export const useUser = () => useAuthStore(state => state.user);
export const useIsAuthenticated = () => useAuthStore(state => !!state.token);
export const useSignin = () => useAuthStore(state => state.signin);
export const useSignout = () => useAuthStore(state => state.signout);
