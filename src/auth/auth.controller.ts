import { Body, Controller, Post, Res } from '@nestjs/common';
import { SignUpDto } from './dto/signup.dto';
import { AuthService } from './auth.service';
import { SignInDto } from './dto/signin.dto';
import { Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @Post('signup')
  async signUp(@Body() signUpData: SignUpDto) {
    return await this.authService.signup(signUpData);
  }
  @Post('signin')
  async signIn(@Body() signInData: SignInDto, @Res() res: Response) {
    const isDevelopment = process.env.NODE_ENV === 'development';
    const result = await this.authService.signIn(signInData);

    const accessTokenExpiry = Number(
      process.env.ACCESS_TOKEN_EXPIRY || '3600', // Default to 3600 seconds (1 hour)
    );
    const refreshTokenExpiry = Number(
      process.env.REFRESH_TOKEN_EXPIRY || '604800', // Default to 7 days in seconds
    );

    // Convert access token expiry to milliseconds
    const accessTokenExpiryMs = accessTokenExpiry * 1000;
    const refreshTokenExpiryMs = refreshTokenExpiry * 1000;
    res.cookie('refresh_token', result.refreshToken, {
      httpOnly: true,
      path: '/',
      domain: isDevelopment ? 'localhost' : undefined, // Domain only for development
      secure: !isDevelopment, // Secure is true in production
      sameSite: isDevelopment ? 'lax' : 'none', // sameSite depends on environment
      expires: new Date(Date.now() + refreshTokenExpiryMs),
    });
    res.cookie('token', result.accessToken, {
      httpOnly: true,
      path: '/',
      domain: isDevelopment ? 'localhost' : undefined, // Domain only for development
      secure: !isDevelopment, // Secure is true in production
      sameSite: isDevelopment ? 'lax' : 'none', // sameSite depends on environment
      expires: new Date(Date.now() + accessTokenExpiryMs),
    });
    return res.status(200).json({
      success: true,
      message: 'Login Successfully',
    });
  }
}
