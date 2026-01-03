import { Module, Logger } from '@nestjs/common';
import { APP_FILTER, APP_PIPE } from '@nestjs/core';
import { ZodValidationPipe } from 'nestjs-zod';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ZodValidationExceptionFilter } from './common/filters/global-exception.filter';
import { DatabaseModule } from './common/db/database.module';
import { MailModule } from './common/services/mail.module';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';

@Module({
  imports: [
    // IMPORTANT: Initialize in this order!
    // 1. Database first - other services depend on it
    DatabaseModule,
    // 2. Mail service (Global) - used by auth
    MailModule,
    // 3. Auth module - depends on DB and Mail (creates Better Auth instance)
    AuthModule,
    // 4. Other feature modules
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
export class AppModule {
  private readonly logger = new Logger(AppModule.name);

  constructor() {
    this.logger.log('═══════════════════════════════════════');
    this.logger.log('🚀 Application starting...');
    this.logger.log('═══════════════════════════════════════');
  }
}
