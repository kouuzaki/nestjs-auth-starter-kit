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

  const logger = new ConsoleLogger('Bootstrap', { timestamp: true });

  const config = new DocumentBuilder()
    .setTitle('Main API')
    .setDescription('NestJS + Better Auth + Scalar')
    .setVersion('1.0')
    .addBearerAuth()
    .build();


  const swaggerDoc = SwaggerModule.createDocument(app, config);

  // Set global prefix
  app.setGlobalPrefix(appConfig.appGlobalPrefix);

  // Setup Swagger JSON endpoint
  app.getHttpAdapter().get('/openapi.json', (req: Request, res: Response) => {
    res.json(swaggerDoc);
  });

  // Setup API Reference endpoint
  app.use(
    `/${appConfig.appGlobalPrefix}/reference`,
    apiReference({
      pageTitle: `${appConfig.getConfig().APP_APPLICATION_NAME} - API Reference`,
      theme: 'default',
      sources: [
        { url: '/openapi.json', title: 'Main API' },
        { url: `/${appConfig.appGlobalPrefix}/auth/open-api/generate-schema`, title: 'Auth API' },
      ],
    }),
  );

  // Setup Swagger module
  app.useGlobalPipes(new ZodValidationPipe());
  await app.listen(appConfig.appPort);
  logger.log(`🚀 Application is running on: http://localhost:${appConfig.appPort}/${appConfig.appGlobalPrefix}`);
  logger.log(`📚 API Reference available at: http://localhost:${appConfig.appPort}/${appConfig.appGlobalPrefix}/reference`);
}
void bootstrap();
