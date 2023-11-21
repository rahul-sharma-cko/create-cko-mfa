import 'core-js/stable';
import 'regenerator-runtime/runtime';

import '@testing-library/jest-dom';
import '@testing-library/jest-dom/extend-expect';
import 'jest-styled-components';
import 'jest-localstorage-mock';
import 'jest-date-mock';
import * as nodeFetch from 'node-fetch';

if (!Object.prototype.hasOwnProperty.call(global, 'fetch')) {
  Object.defineProperty(global, 'fetch', {
    value: nodeFetch.default,
    writable: true,
  });
  Object.defineProperty(global, 'Headers', {
    value: nodeFetch.Headers,
    writable: true,
  });
  Object.defineProperty(global, 'Request', {
    value: nodeFetch.Request,
    writable: true,
  });
  Object.defineProperty(global, 'Response', {
    value: nodeFetch.Response,
    writable: true,
  });
}

// @ts-ignore
window.__boilerplate_config = {};
// @ts-ignore
window.__app_config = {};
