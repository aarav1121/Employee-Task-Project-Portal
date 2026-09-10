import { Injectable, UnauthorizedException } from '@nestjs/common';

import { ConfigService } from '@nestjs/config';

import { JwtService } from '@nestjs/jwt';

import * as bcrypt from 'bcrypt';

import { OAuth2Client, TokenPayload } from 'google-auth-library';

import { UserService } from '../user/user.service';

import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  private readonly googleClient: OAuth2Client;

  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {
    this.googleClient = new OAuth2Client();
  }

  // LOGIN

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    // FIND USER

    let user: Awaited<ReturnType<UserService['getUserByEmail']>>;

    try {
      user = await this.userService.getUserByEmail(email);
    } catch {
      throw new UnauthorizedException('Invalid email or password');
    }

    // CHECK PASSWORD

    const passwordMatches = await bcrypt.compare(password, user.passwordHash);

    if (!passwordMatches) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // CREATE JWT

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = await this.jwtService.signAsync(payload);

    // RETURN LOGIN RESPONSE

    return {
      message: 'Login successful',
      accessToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        department: user.department,
        role: user.role,
        authProvider: user.authProvider,
      },
    };
  }

  // GOOGLE LOGIN

  async googleLogin(credential: string) {
    // VALIDATION

    if (!credential) {
      throw new UnauthorizedException('Google credential is required');
    }

    // GET GOOGLE CLIENT ID

    const clientId = this.configService.get<string>('GOOGLE_CLIENT_ID');

    if (!clientId) {
      throw new UnauthorizedException('Google Client ID is not configured');
    }

    // GET ALLOWED GOOGLE EMAIL

    const allowedEmail = this.configService.get<string>('GOOGLE_ALLOWED_EMAIL');

    if (!allowedEmail) {
      throw new UnauthorizedException('Allowed Google email is not configured');
    }

    // VERIFY GOOGLE ID TOKEN

    let payload: TokenPayload | undefined;

    try {
      const ticket = await this.googleClient.verifyIdToken({
        idToken: credential,
        audience: clientId,
      });

      payload = ticket.getPayload();
    } catch {
      throw new UnauthorizedException('Invalid Google credential');
    }

    // VALIDATE GOOGLE ACCOUNT

    if (!payload?.sub || !payload.email) {
      throw new UnauthorizedException('Invalid Google account information');
    }

    if (!payload.email_verified) {
      throw new UnauthorizedException('Google email is not verified');
    }

    // CHECK ALLOWED GOOGLE ACCOUNT

    if (payload.email.toLowerCase() !== allowedEmail.trim().toLowerCase()) {
      throw new UnauthorizedException(
        'This Google account is not authorized to access the application',
      );
    }

    // CREATE JWT

    const jwtPayload = {
      sub: payload.sub,
      email: payload.email,
      role: 'Team Lead',
    };

    const accessToken = await this.jwtService.signAsync(jwtPayload);

    // RETURN GOOGLE LOGIN RESPONSE

    return {
      message: 'Google login successful',
      accessToken,
      user: {
        id: 0,
        name: payload.name ?? payload.email.split('@')[0],
        email: payload.email,
        department: 'Management',
        role: 'Team Lead',
        authProvider: 'google',
      },
    };
  }
}
