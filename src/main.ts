// main.ts
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { apiReference } from '@scalar/nestjs-api-reference';
import { ZodValidationPipe } from 'nestjs-zod';
import { AppModule } from './app.module';
import { Request, Response } from 'express';
import { config as appConfig } from '@/config/loader';
import { ConsoleLogger } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bodyParser: false, // needed for better-auth
    logger: new ConsoleLogger({
      timestamp: true,
      colors: true,
    })
  });

  // --- Buat OpenAPI utama dari NestJS ---
  const config = new DocumentBuilder()
    .setTitle('Main API')
    .setDescription('NestJS + Better Auth + Scalar')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const swaggerDoc = SwaggerModule.createDocument(app, config);

  // --- Simpan schema ke provider global agar bisa diambil controller ---
  app.setGlobalPrefix(appConfig.appGlobalPrefix);

  // Serve file OpenAPI utama di endpoint JSON
  app.getHttpAdapter().get('/openapi.json', (req: Request, res: Response) => {
    res.json(swaggerDoc);
  });

  // --- Setup Scalar UI dengan multi-source ---
  app.use(
    `/${appConfig.appGlobalPrefix}/reference`,
    apiReference({
      pageTitle: `${appConfig.getConfig().APP_APPLICATION_NAME} - API Reference`,
      theme: 'default',
      sources: [
        { url: '/openapi.json', title: 'Main API' },
      ],
    }),
  );

  // --------------------------------------------------------
  // Global pipes (Zod validation, dll.)
  // --------------------------------------------------------
  app.useGlobalPipes(new ZodValidationPipe());

  await app.listen(appConfig.appPort);
  console.log(`🚀  ${appConfig.getReferenceUrl()}`);
}
void bootstrap();
