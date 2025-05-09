import { Injectable, UnauthorizedException, Logger, BadRequestException, ForbiddenException, InternalServerErrorException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { User, UserDocument } from '../users/schemas/user.schema';
import * as crypto from 'crypto';
import { JwtUserPayload } from './types/jwt-user-payload.type';
import { EmailService } from '../email/email.service';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
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

  async validateUser(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);
    if (user && (await this.verifyPassword(password, user.password))) {
      if (!user.isEmailVerified) {
        throw new ForbiddenException('Please verify your email address before logging in.');
      }
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any) {
    const payload = { email: user.email, sub: user._id, username: user.username };
    return {
      access_token: this.jwtService.sign(payload),
      refresh_token: this.jwtService.sign(payload, { expiresIn: '7d' }),
      user: {
        id: user._id,
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

    const newUser = {
      ...createUserDto,
      password: hashedPassword,
      isEmailVerified: false,
      emailVerificationToken: verificationToken,
      emailVerificationExpires: verificationExpires,
    }

    let createdUser: User;
    try {
      createdUser = await this.usersService.create(newUser);
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
    const user = await this.userModel.findOne({
      emailVerificationToken: token,
      emailVerificationExpires: { $gt: new Date() },
    });

    if (!user) {
      throw new BadRequestException('Invalid or expired verification token.');
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    return { message: 'Email verified successfully. You can now log in.' };
  }

  async getMe(user: JwtUserPayload) {
    const dbUser = await this.usersService.findOne(user.userId);
    if (!dbUser) throw new UnauthorizedException('User not found');
    const { password, _id, ...result } = dbUser;
    return { id: _id, ...result };
  }

  async refresh(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, { ignoreExpiration: false });
      if (!payload || !payload.sub) throw new UnauthorizedException('Invalid refresh token');
      const accessPayload = { email: payload.email, sub: payload.sub, username: payload.username };
      return {
        access_token: this.jwtService.sign(accessPayload),
      };
    } catch (e) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  // Find existing user or create a new one based on Google profile
  async findOrCreateGoogleUser(googleUser: { email: string; firstName: string; lastName: string; picture?: string; }) {
    const existingUser = await this.usersService.findByEmail(googleUser.email);

    if (existingUser) {
      // Optional: Update user details (name, picture) from Google profile if needed
      // Ensure email is marked verified if they previously registered manually
      if (!existingUser.isEmailVerified) {
          await this.userModel.updateOne({ _id: existingUser._id }, { isEmailVerified: true });
          existingUser.isEmailVerified = true; // Update in-memory object
      }
      const { password, ...user } = existingUser; // Exclude password
      return user;
    }

    // User does not exist, create a new one
    const username = `${googleUser.firstName}${googleUser.lastName}`.toLowerCase() + Math.random().toString(36).substring(2, 6); // Simple username generation
    // Create a secure random password - user won't use it directly
    const randomPassword = crypto.randomBytes(16).toString('hex');
    const hashedPassword = await this.hashPassword(randomPassword);

    const newUserDto = {
      email: googleUser.email,
      username: username, // Consider allowing user to set username later
      password: hashedPassword, // Store hashed random password
      isEmailVerified: true, // Google verified the email
      // You might want to store googleId or link accounts explicitly in a real app
    };

    try {
      const createdUser = await this.usersService.create(newUserDto);
      // The createdUser object saved by Mongoose WILL have an _id.
      // Return the plain object representation for the login method.
      // Note: usersService.create returns Promise<User>, but the saved document will have _id.
      // We might need to adjust usersService.create or fetch the user again if _id is missing.
      // Assuming createdUser has _id after save():
      return createdUser; // Return the user object directly
    } catch (error) {
      this.logger.error(`Failed to create user from Google OAuth: ${error.message}`);
      // If error is due to duplicate username, maybe retry generation or handle differently
      throw new InternalServerErrorException('Could not process Google login.');
    }
  }
} 