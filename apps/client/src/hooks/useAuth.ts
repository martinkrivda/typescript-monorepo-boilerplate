import {
  useIsAuthenticated,
  useSignin,
  useSignout,
  useToken,
  useUser,
} from '@/stores/auth';
import { useMemo } from 'react';

export const useAuth = () => {
  const token = useToken();
  const user = useUser();
  const isAuthenticated = useIsAuthenticated();
  const signin = useSignin();
  const signout = useSignout();

  return useMemo(
    () => ({
      token,
      user,
      isAuthenticated,
      signin,
      signout,
      hasRole: (role: string) => user?.role === role,
      isAdmin: () => user?.role === 'admin',
    }),
    [token, user, isAuthenticated, signin, signout]
  );
};

export const useAuthForRequest = () => {
  const token = useToken();
  const { signout } = useAuth();
  return {
    token,
    logout: signout,
  };
};

export {
  useAuthStore,
  useIsAuthenticated,
  useSignin,
  useSignout,
  useToken,
  useUser,
} from '@/stores/auth';
