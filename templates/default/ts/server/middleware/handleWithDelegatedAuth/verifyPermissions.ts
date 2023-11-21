import { logger } from '../../utils';
import { HTTPError, JWToken } from '../../types';

function verifyPermissions(permission: string, token: JWToken) {
  if (token.claims.cko_permissions.includes(permission)) {
    return true;
  }

  logger.error("Access token doesn't have necessary permissions to call target API", {
    userId: token.claims.cko_user_id,
    tokenPermissions: token.claims.cko_permissions,
    requiredPermission: permission,
  });

  throw new HTTPError(403, 'Invalid permissions');
}

export default verifyPermissions;
