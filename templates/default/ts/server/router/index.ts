import express from 'express';

import { endpoints } from './endpoints';

import { handleWithDelegatedAuth } from '../middleware';
import { EndpointMethod } from '../types';

function getMethod(method: EndpointMethod): Lowercase<EndpointMethod> {
  return method.toLowerCase() as Lowercase<EndpointMethod>;
}

const router = express.Router();

endpoints.forEach((endpoint) => {
  router[getMethod(endpoint.method)](endpoint.path, handleWithDelegatedAuth(endpoint));
});

export { router };
