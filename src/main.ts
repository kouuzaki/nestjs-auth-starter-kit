// main.ts
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { apiReference } from '@scalar/nestjs-api-reference';
import { ZodValidationPipe } from 'nestjs-zod';
import { AppModule } from './app.module';
import { auth } from '@/lib/auth';
import { Request, Response } from 'express';
import { config as appConfig } from '@/config/loader';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bodyParser: false, // diperlukan oleh Better Auth
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

  // --------------------------------------------------------
  // 2️⃣  Serve Better Auth OpenAPI schema sebagai endpoint JSON
  // --------------------------------------------------------
  app
    .getHttpAdapter()
    .get('/auth/openapi.json', async (req: Request, res: Response) => {
      const authSchema = await auth.api.generateOpenAPISchema();
      res.json(authSchema);
    });

  // --- Setup Scalar UI dengan multi-source ---
  app.use(
    `/${appConfig.appGlobalPrefix}/reference`,
    apiReference({
      pageTitle: 'API Reference',
      theme: 'default',
      sources: [
        { url: '/openapi.json', title: 'Main API' },
        {
          url: '/auth/openapi.json',
          title: 'Auth API',
        },
      ],
    }),
  );

  // --------------------------------------------------------
  // 4️⃣  Global pipes (Zod validation, dll.)
  // --------------------------------------------------------
  app.useGlobalPipes(new ZodValidationPipe());

  await app.listen(appConfig.appPort);
  console.log(`🚀  ${appConfig.getReferenceUrl()}`);
}
void bootstrap();
