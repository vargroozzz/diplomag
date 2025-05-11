import { Controller, Post, Body, UseGuards, Version, Get, Req, Res, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { GetUser } from './decorators/user.decorator';
import { JwtUserPayload } from '../auth/types/jwt-user-payload.type';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags, ApiBody, ApiExcludeEndpoint } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { FastifyRequest, FastifyReply } from 'fastify';
import { AuthenticatedUserLoginPayload, GoogleUserProfile } from './types/user-auth.types';

// Define an interface that extends FastifyRequest to include the user property from Passport
interface AuthenticatedFastifyRequest extends FastifyRequest {
  // user can be from GoogleStrategy or LocalStrategy 
  user?: GoogleUserProfile | AuthenticatedUserLoginPayload;
}

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  @Version('1')
  async login(@GetUser() user: AuthenticatedUserLoginPayload) {
    return this.authService.login(user);
  }

  @Post('register')
  @Version('1')
  async register(@Body() createUserDto: CreateUserDto) {
    return this.authService.register(createUserDto);
  }

  @Post('verify-email')
  @Version('1')
  @ApiOperation({ summary: 'Verify user email address' })
  @ApiBody({ schema: { properties: { token: { type: 'string' } } } })
  @ApiResponse({ status: 201, description: 'Email verified successfully.' })
  @ApiResponse({ status: 400, description: 'Invalid or expired token.' })
  async verifyEmail(@Body('token') token: string) {
    return this.authService.verifyEmail(token);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  @Version('1')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user info' })
  @ApiResponse({ status: 200, description: 'Current user info returned.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async getMe(@GetUser() user: JwtUserPayload) {
    return this.authService.getMe(user);
  }

  @Post('refresh')
  @Version('1')
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiBody({ schema: { properties: { refreshToken: { type: 'string' } } } })
  @ApiResponse({ status: 201, description: 'New access token returned.' })
  @ApiResponse({ status: 401, description: 'Invalid or expired refresh token.' })
  async refresh(@Body('refreshToken') refreshToken: string) {
    return this.authService.refresh(refreshToken);
  }

  @Get('google')
  @Version('1')
  @UseGuards(AuthGuard('google'))
  @ApiOperation({ summary: 'Initiate Google OAuth2 login flow' })
  @ApiResponse({ status: 302, description: 'Redirects to Google for authentication.' })
  async googleAuth(@Req() req: AuthenticatedFastifyRequest) {
    // Guard initiates the redirect
  }

  @Get('google/callback')
  @Version('1')
  @UseGuards(AuthGuard('google'))
  @ApiExcludeEndpoint()
  async googleAuthRedirect(@Req() req: AuthenticatedFastifyRequest, @Res({ passthrough: true }) res: FastifyReply) { 
    // req.user here comes from GoogleStrategy's validate method, should match GoogleUserProfile
    const googleUser = req.user as GoogleUserProfile; // Assert type for clarity and safety
    
    if (!googleUser || !googleUser.email) { 
      return res.code(HttpStatus.UNAUTHORIZED).redirect(`${process.env.FRONTEND_URL}/login?error=google-auth-failed`);
    }

    // authService.findOrCreateGoogleUser expects an object with email, firstName, lastName, picture
    const userForLogin = await this.authService.findOrCreateGoogleUser(googleUser);
    const tokens = await this.authService.login(userForLogin);

    const redirectUrl = `${process.env.FRONTEND_URL}/auth/callback?accessToken=${tokens.access_token}&refreshToken=${tokens.refresh_token}`;
    return res.code(HttpStatus.FOUND).redirect(redirectUrl);
  }
} 