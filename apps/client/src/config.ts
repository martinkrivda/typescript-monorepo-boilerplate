const asBool = (v: string | boolean | undefined) => v === true || v === 'true';

const DEBUG = asBool(import.meta.env.VITE_DEBUG_LOGGING);

export const config = {
  BASE_API_URL: import.meta.env.VITE_BASE_API_URL ?? '',
  DEBUG_LOGGING: DEBUG,
  REQUEST_LOGGING: DEBUG,
  I18N_LOGGING: DEBUG,
} as const;

export default config;
