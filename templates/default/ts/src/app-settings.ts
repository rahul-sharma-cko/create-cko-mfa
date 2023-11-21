// We set the config object on window in _document
// @ts-ignore
const appConfig = typeof window === 'undefined' ? {} : window.__boilerplate_config;

const api = appConfig.WEBUI_MF_BOILERPLATE_API!;

const settings = {
  api,
};

export default settings;
