import { Jwt, JwtClaims } from '@okta/jwt-verifier';

interface CKOClaims extends JwtClaims {
  cko_client_id: string;
  cko_user_id: string;
  cko_permissions: string[];
}

export interface JWToken extends Omit<Jwt, 'claims'> {
  claims: CKOClaims;
}
