export const PATHNAMES = {
  home: () => ({ to: '/', params: {} as const }),
  components: () => ({ to: '/components', params: {} as const }),
  docs: () => ({ to: '/docs', params: {} as const }),
  signIn: () => ({ to: '/auth/signin', params: {} as const }),
  signUp: () => ({ to: '/auth/signup', params: {} as const }),
  forgotPassword: () => ({ to: '/auth/forgot-password', params: {} as const }),
  resetPassword: (token: string) => ({
    to: '/auth/reset-password/$token',
    params: { token } as const,
  }),
  notAuthorized: () => ({ to: '/not-authorized', params: {} as const }),
} as const;

export default PATHNAMES;
