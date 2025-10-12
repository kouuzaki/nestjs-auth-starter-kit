import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AuthModule } from '@thallesp/nestjs-better-auth';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { validate } from './config/env.validation';
import { auth } from '@/lib/auth';

@Module({
  imports: [
    AuthModule.forRoot({
      auth,
    }),
    ConfigModule.forRoot({
      envFilePath: '.env.development.local',
      validate,
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
