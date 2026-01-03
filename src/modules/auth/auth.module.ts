import { Module, Global } from '@nestjs/common';
import { AuthModule as NestJSBetterAuthModule } from '@thallesp/nestjs-better-auth';
import { createBetterAuth } from '@/lib/better-auth';
import { MailModule } from '@/common/services/mail.module';
import { DatabaseModule } from '@/common/db/database.module';
import { DatabaseService } from '@/common/db';
import { MailService } from '@/common/services/mail.service';

/**
 * Auth module that:
 * 1. Initializes Better Auth using DatabaseService and MailService
 * 2. Integrates with @thallesp/nestjs-better-auth for automatic routing and guards
 */
@Global()
@Module({
  imports: [
    NestJSBetterAuthModule.forRootAsync({
      imports: [DatabaseModule, MailModule],
      inject: [DatabaseService, MailService],
      useFactory: (databaseService: DatabaseService, mailService: MailService) => {
        const auth = createBetterAuth(databaseService, mailService);
        return {
          auth,
        };
      },
    }),
  ],
  exports: [NestJSBetterAuthModule],
})
export class AuthModule {}
