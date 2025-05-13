import { Injectable, UnauthorizedException, Logger, BadRequestException, ForbiddenException, InternalServerErrorException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { User, UserDocument } from '../users/schemas/user.schema';
import * as crypto from 'crypto';
import { JwtUserPayload } from './types/jwt-user-payload.type';
import { EmailService } from '../email/email.service';
import { UserWithId, AuthenticatedUserLoginPayload, MeUserResponse } from './types/user-auth.types';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private emailService: EmailService,
  ) {}

  private async hashPassword(password: string): Promise<string> {
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
    return `${salt}:${hash}`;
  }

  private async verifyPassword(password: string, storedHash: string): Promise<boolean> {
    const [salt, hash] = storedHash.split(':');
    const verifyHash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
    return hash === verifyHash;
  }

  async validateUser(email: string, password: string): Promise<AuthenticatedUserLoginPayload | null> {
    const user = await this.usersService.findByEmail(email);
    if (user && user.password && (await this.verifyPassword(password, user.password))) {
      if (!user.isEmailVerified) {
        throw new ForbiddenException('Please verify your email address before logging in.');
      }
      const { password: _p, ...result } = user as UserWithId;
      return result;
    }
    return null;
  }

  async login(user: AuthenticatedUserLoginPayload) {
    const payload = { email: user.email, sub: user._id.toString(), username: user.username };
    return {
      access_token: this.jwtService.sign(payload),
      refresh_token: this.jwtService.sign(payload, { expiresIn: '7d' }),
      user: {
        id: user._id.toString(),
        email: user.email,
        username: user.username,
        isEmailVerified: user.isEmailVerified,
      },
    };
  }

  async register(createUserDto: any): Promise<{ message: string }> {
    const hashedPassword = await this.hashPassword(createUserDto.password);
    
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationExpires = new Date();
    verificationExpires.setHours(verificationExpires.getHours() + 1);

    const newUserInput: Partial<User> = {
      ...createUserDto,
      password: hashedPassword,
      isEmailVerified: false,
      emailVerificationToken: verificationToken,
      emailVerificationExpires: verificationExpires,
    }

    let createdUser: UserDocument;
    try {
      createdUser = await this.usersService.create(newUserInput);
    } catch (error) {
        this.logger.error(`Registration failed: ${error.message}`);
        throw new BadRequestException(error.message || 'Registration failed');
    }

    try {
      await this.emailService.sendVerificationEmail(
        createdUser.email,
        createdUser.username,
        verificationToken,
      );
    } catch (emailError) {
      this.logger.error(`Failed to send verification email to ${createdUser.email}: ${emailError.message}`);
    }

    return { message: 'Registration successful. Please check your email for verification link.' };
  }

  async verifyEmail(token: string): Promise<{ message: string }> {
    const user = await this.usersService.findByEmailVerificationToken(token);

    console.log('user', user);

    if (!user) {
      throw new BadRequestException('Invalid or expired verification token.');
    }

    await this.usersService.verifyUserEmail(user.id);

    console.log('user verified', user.id);

    return { message: 'Email verified successfully. You can now log in.' };
  }

  async getMe(userPayload: JwtUserPayload): Promise<MeUserResponse> {
    const dbUser = await this.usersService.findOne(userPayload.userId) as UserWithId | null;
    if (!dbUser) {
        throw new UnauthorizedException('User not found');
    }
    return {
        id: dbUser._id.toString(),
        email: dbUser.email,
        username: dbUser.username,
        bio: dbUser.bio,
        location: dbUser.location,
        expertise: dbUser.expertise,
        isEmailVerified: dbUser.isEmailVerified,
        isAdmin: dbUser.isAdmin,
    };
  }

  async refresh(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, { ignoreExpiration: false });
      if (!payload || !payload.sub) {
          throw new UnauthorizedException('Invalid refresh token payload');
      }
      
      const user = await this.usersService.findOne(payload.sub) as UserWithId | null;
      if (!user || !user.isEmailVerified) {
        throw new UnauthorizedException('Invalid user or email not verified for refresh token.');
      }
      const accessPayload = { email: user.email, sub: user._id.toString(), username: user.username };
      return {
        access_token: this.jwtService.sign(accessPayload),
      };
    } catch (e) {
      this.logger.error(`Token refresh error: ${e.message}`);
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  async findOrCreateGoogleUser(googleUser: { email: string; firstName: string; lastName: string; picture?: string; }): Promise<AuthenticatedUserLoginPayload> {
    let userDoc = await this.usersService.findByEmailWithDocument(googleUser.email);
    let userToReturn: AuthenticatedUserLoginPayload;

    if (userDoc) {
      if (!userDoc.isEmailVerified) {
        userDoc = await this.usersService.updateUserDocumentFields(userDoc._id.toString(), { isEmailVerified: true });
        if(!userDoc) throw new InternalServerErrorException('Failed to update user verification status.');
      }
      userToReturn = {
        _id: userDoc._id,
        email: userDoc.email,
        username: userDoc.username,
        bio: userDoc.bio,
        location: userDoc.location,
        expertise: userDoc.expertise,
        isEmailVerified: userDoc.isEmailVerified,
        isAdmin: userDoc.isAdmin,
      };
    } else {
      const username = `${googleUser.firstName}${googleUser.lastName}`.toLowerCase() + Math.random().toString(36).substring(2, 6);
      const randomPassword = crypto.randomBytes(16).toString('hex');
      const hashedPassword = await this.hashPassword(randomPassword);
      const newUserDto: Partial<User> = {
        email: googleUser.email,
        username: username,
        password: hashedPassword,
        isEmailVerified: true, 
      };
      try {
        const createdUserDoc = await this.usersService.create(newUserDto);
        userToReturn = {
          _id: createdUserDoc._id,
          email: createdUserDoc.email,
          username: createdUserDoc.username,
          bio: createdUserDoc.bio,
          location: createdUserDoc.location,
          expertise: createdUserDoc.expertise,
          isEmailVerified: createdUserDoc.isEmailVerified,
          isAdmin: createdUserDoc.isAdmin,
        };
      } catch (error) {
        this.logger.error(`Failed to create user from Google OAuth: ${error.message}`);
        throw new InternalServerErrorException('Could not process Google login.');
      }
    }
    return userToReturn;
  }
} 