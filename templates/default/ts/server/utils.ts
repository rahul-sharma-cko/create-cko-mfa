import { createLogger as createWinstonLogger, transports, format } from 'winston';
import OktaJwtVerifier from '@okta/jwt-verifier';
import { createProxyServer } from 'http-proxy';

export const isDev = process.env.NODE_ENV !== 'production';

function createLogger() {
  return createWinstonLogger({
    transports: [new transports.Console({ format: format.prettyPrint(), level: 'warn' })],
    exitOnError: false,
  });
}

export const logger = createLogger();

export const oktaJwtVerifier = new OktaJwtVerifier({
  issuer: process.env.AccessIssuer__BaseAddress!,
});

export const proxy = createProxyServer();

export const getAccessDelegationConfig = () => {
  // TODO fetch clientId and clientId from secrets manager.
  return {
    url: process.env.AccessApi__BaseAddress,
    clientId: '',
    clientSecret: '',
  };
};
