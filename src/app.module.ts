import { auth } from '@/lib/auth';
import { Module } from '@nestjs/common';
import { APP_FILTER, APP_PIPE } from '@nestjs/core';
import { AuthModule } from '@thallesp/nestjs-better-auth';
import { ZodValidationPipe } from 'nestjs-zod';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ZodValidationExceptionFilter } from './common/filters/global-exception.filter';
import { UserModule } from './modules/user/user.module';
import { MailModule } from './common/services/mail.module';

@Module({
  imports: [
    MailModule,
    AuthModule.forRoot({
      auth,
    }),
    UserModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_PIPE,
      useClass: ZodValidationPipe,
    },
    {
      provide: APP_FILTER,
      useClass: ZodValidationExceptionFilter,
    },
  ],
})
export class AppModule {}
