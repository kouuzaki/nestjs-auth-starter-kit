import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bodyParser: false, // Required for Better Auth Library
  });
  await app.listen(process.env.APP_PORT ?? 3000);
}
void bootstrap();
