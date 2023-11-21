import axios, { AxiosResponse } from 'axios';
import qs from 'query-string';

import { getAccessDelegationConfig, logger } from '../../utils';
import { HTTPError, Request } from '../../types';

export type TokenExchangeResponse = AxiosResponse<{
  access_token: string;
  expires_in: number;
  token_type: string;
  scope: string;
}>;

async function getDelegatedToken(request: Request): Promise<TokenExchangeResponse> {
  try {
    const { url, clientId, clientSecret } = getAccessDelegationConfig();

    if (!url || !clientId || !clientSecret) {
      throw new Error('Access delegation api is not configured');
    }

    if (!request.headers.authorization) {
      throw new Error('No authorization header');
    }

    return await axios.post(
      `${url}/connect/token`,
      qs.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: 'delegation',
      }),
      {
        headers: {
          authorization: request.headers.authorization,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      },
    );
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      logger.error('Access token exchange failed', {
        status: error.response.status,
        headers: error.response.headers,
        response: error.response.data,
      });
    } else if (error instanceof Error) {
      logger.error('Access token exchange failed', {
        message: error.message,
      });
    }

    throw new HTTPError(500, 'Unable to authenticate request');
  }
}

export default getDelegatedToken;
