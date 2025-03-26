import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './global-filters/all-exceptions.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  app.enableCors({
    origin: process.env.CLIENT_URL,
    credentials: true,
    exposedHeaders: ['set-cookie'],
  });
  app.useGlobalFilters(new AllExceptionsFilter());
  await app.listen(process.env.PORT ?? 7000);
}
bootstrap();
