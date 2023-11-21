import { Response } from 'express';
import { ParsedQs, stringify } from 'qs';
import verifyToken from './verifyToken';
import verifyPermissions from './verifyPermissions';
import getDelegatedToken from './getDelegatedToken';

import { proxy } from '../../utils';
import { EndpointConfig, HTTPError, Request } from '../../types';

function getTargetURL(target: string, params: Record<string, string>, query: ParsedQs) {
  return Object.keys(params).length
    ? Object.keys(params).reduce((targetURL, paramKey) => {
        return `${targetURL.replace(`:${paramKey}`, params[paramKey])}?${stringify(query)}`;
      }, target)
    : `${target}?${stringify(query)}`;
}

export function handleWithDelegatedAuth(endpoint: EndpointConfig) {
  return async (request: Request, response: Response) => {
    try {
      const token = await verifyToken(request);

      if (verifyPermissions(endpoint.permission, token)) {
        const delegatedAuth = await getDelegatedToken(request);

        proxy.web(request, response, {
          changeOrigin: true,
          ignorePath: true,
          target: getTargetURL(endpoint.target, request.params, request.query),
          headers: {
            authorization: `${delegatedAuth.data.token_type} ${delegatedAuth.data.access_token}`,
          },
        });
      }
    } catch (error) {
      if (error instanceof HTTPError) {
        response.statusCode = error.code;
        response.json({ status: error.code, message: error.message });
        response.end();
        return;
      }

      if (error instanceof Error) {
        response.statusCode = 500;
        response.json({ status: 500, message: error.message });
        response.end();
        return;
      }

      response.statusCode = 500;
      response.end();
    }
  };
}
