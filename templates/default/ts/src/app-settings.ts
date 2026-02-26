import { VARIABLES } from './config';

// Config is injected onto window by the dashboard shell app at runtime.
// @ts-ignore
const appConfig = typeof window === 'undefined' ? {} : window.__compass_config;

const api = appConfig?.APP_API_BASE_URL ?? VARIABLES.APP_API_BASE_URL;

const settings = {
  api,
};

export default settings;
