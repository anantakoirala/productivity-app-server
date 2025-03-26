import { BadRequestException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma/prisma.service';
import { SignUpDto } from './dto/signup.dto';
import * as bcrypt from 'bcrypt';
import { SignInDto } from './dto/signin.dto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}
  async signup(dto: SignUpDto) {
    try {
      const saltOrRounds = 10;
      const password = dto.password;
      const hashedPassword = await bcrypt.hash(password, saltOrRounds);

      const emailInUse = await this.prisma.user.findFirst({
        where: { email: dto.email },
      });
      if (emailInUse) {
        console.log('email in use');
        throw new BadRequestException('Email already in use');
      }
      await this.prisma.user.create({
        data: {
          username: dto.username,
          email: dto.email,
          password: hashedPassword,
        },
      });

      return { success: true, message: 'Registered successfully' };
    } catch (error) {
      throw error;
    }
  }

  async signIn(dto: SignInDto) {
    try {
      const user = await this.prisma.user.findFirst({
        where: { email: dto.email },
      });
      if (!user) {
        throw new BadRequestException('Wrong credentials');
      }
      const matchPassword = await bcrypt.compare(dto.password, user.password);
      if (!matchPassword) {
        throw new BadRequestException('Wrong Credentials');
      }

      // Generate Tokens
      const token = this.generateUserTokens(user.id);
      await this.storeRefreshToken(user.id, token.refreshToken);
      return {
        success: true,
        accessToken: token.accessToken,
        refreshToken: token.refreshToken,
      };
    } catch (error) {
      throw error;
    }
  }
  generateUserTokens(userId: number) {
    // Retrieve expiry times from config and convert to numbers
    const accessTokenExpiry = Number(
      this.configService.get<string>('jwt.access_token_expiry') || '3600', // Default to 3600 seconds (1 hour)
    );
    const refreshTokenExpiry = Number(
      this.configService.get<string>('jwt.refresh_token_expiry') || '604800', // Default to 7 days in seconds
    );

    // Ensure that expiry values are valid numbers
    if (isNaN(accessTokenExpiry) || isNaN(refreshTokenExpiry)) {
      throw new Error('Invalid token expiry value');
    }

    // Generate Access Token with access token secret
    const accessToken = this.jwtService.sign(
      { userId },
      {
        expiresIn: accessTokenExpiry,
      },
    );

    // Generate Refresh Token with refresh token secret
    const refreshToken = this.jwtService.sign(
      { userId },
      {
        expiresIn: refreshTokenExpiry,
      },
    );

    // Store refresh token in database (or any other required storage)
    //await this.storeRefreshToken(userId, refreshToken);

    return { accessToken, refreshToken };
  }
  async storeRefreshToken(userId: number, token: string) {
    const expirySeconds = Number(process.env.REFRESH_TOKEN_EXPIRY) || 604800; // Default to 7 days in seconds
    const expiryDate = new Date(Date.now() + expirySeconds * 1000); // Convert seconds to milliseconds

    await this.prisma.refreshToken.create({
      data: {
        userId,
        token,
        expiresAt: expiryDate,
      },
    });
    return;
  }
}
