import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { JwtModule } from '@nestjs/jwt';
import { UserModule } from './user/user.module';
import config from '../config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      load: [config],
    }),
    PrismaModule,
    AuthModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      useFactory: (configService: ConfigService) => ({
        secret: process.env.ACCESS_TOKEN_SECRET, // Correctly using the ConfigService to get values
        // Optional sign options
      }),
      global: true,
      inject: [ConfigService],
    }),

    UserModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
