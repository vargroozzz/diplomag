export interface JwtUserPayload {
  userId: string;
  email: string;
  username?: string;
  isAdmin: boolean;
} 