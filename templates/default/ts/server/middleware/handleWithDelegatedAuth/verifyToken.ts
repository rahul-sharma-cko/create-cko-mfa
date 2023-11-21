import { logger, oktaJwtVerifier } from '../../utils';
import { JWToken, HTTPError, Request } from '../../types';

const getAccessTokenFromRequest = (request: Request): string => {
  const { authorization } = request.headers;

  if (!authorization || !authorization.includes('Bearer')) {
    throw Error('Invalid authorization header');
  }

  return authorization.replace('Bearer ', '');
};

async function verifyToken(request: Request): Promise<JWToken> {
  try {
    return (await oktaJwtVerifier.verifyAccessToken(
      getAccessTokenFromRequest(request),
      'api://default',
    )) as JWToken;
  } catch (error) {
    if (error instanceof Error) {
      logger.error(error.message);
    }

    throw new HTTPError(401, 'Unable to authenticate request');
  }
}

export default verifyToken;
