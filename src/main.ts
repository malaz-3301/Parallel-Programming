import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { JwtAuthGuard } from './auth/utils/JwtGuard';

async function bootstrap() {
  const app = await NestFactory.create(AppModule,);
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }),
  );
  // app.useGlobalGuards(new JwtAuthGuard)
  await app.listen(process.env.PORT ?? 3000);
}

bootstrap();
