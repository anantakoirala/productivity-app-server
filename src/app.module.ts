import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    PrismaModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: () => ({
        secret: process.env.ACCESS_TOKEN_SECRET, // Correctly using the ConfigService to get values
        // Optional sign options
      }),
      global: true,
      inject: [ConfigService],
    }),
    ConfigModule.forRoot({ isGlobal: true }),
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
