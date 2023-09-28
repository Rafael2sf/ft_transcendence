export interface JwtPayload {
  sub: number; // 'subject' claim - to whom the token was issued to?
  intraname: string;
  registered: boolean;
  is_two_factor_enabled: boolean;
  is_two_factor_authenticated: boolean;
  exp?: string; // - when will the token expire?
}
