import { User } from '../../users/schemas/user.schema';
import { Types } from 'mongoose';

// User object structure known to have an _id, typically after DB retrieval (lean or full document)
// and with password potentially omitted.
export type UserWithId = User & { _id: Types.ObjectId };

// Payload used for login method after local strategy validation
export type AuthenticatedUserLoginPayload = Omit<UserWithId, 'password'>;

// Specific response structure for the /me endpoint
export interface MeUserResponse {
  id: string;
  email: string;
  username: string;
  bio?: string;
  location?: string;
  expertise: string[];
  isEmailVerified: boolean;
  isAdmin: boolean;
}

// Structure of the user profile object returned by GoogleStrategy's validate function
// and attached to req.user in the Google OAuth callback controller
export interface GoogleUserProfile {
  email: string;
  firstName: string;
  lastName: string;
  picture?: string;
  accessToken: string;
}
