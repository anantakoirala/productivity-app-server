import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { JwtModule } from '@nestjs/jwt';
import { UserModule } from './user/user.module';
import { WorkspaceModule } from './workspace/workspace.module';
import config from '../config';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { join } from 'path';
import { PublicModule } from './public/public.module';
import { SubscriptionModule } from './subscription/subscription.module';
import { TagModule } from './tag/tag.module';
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

    MailerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        transport: {
          host: configService.get<string>('smtp.SMTP_HOST'),
          port: +configService.get<string>('smtp.SMTP_PORT'),
          auth: {
            user: configService.get<string>('smtp.SMTP_USER'),
            pass: configService.get<string>('smtp.SMTP_PASSWORD'),
          },
        },
        defaults: {
          from: `"No Reply" <${configService.get<string>('smtp.SMTP_USER')}>`,
        },
        // Optional if you use handlebars templates
        template: {
          dir: join(__dirname, '..', 'templates'),
          adapter: new HandlebarsAdapter(),
          options: {
            strict: true,
          },
        },
      }),
    }),

    UserModule,

    WorkspaceModule,

    PublicModule,

    SubscriptionModule,

    TagModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
