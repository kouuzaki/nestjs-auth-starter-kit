import { Module, Global, Logger } from '@nestjs/common';
import { MailService } from './mail.service';
import { TemplateService } from './template.service';

@Global()
@Module({
  providers: [
    {
      provide: MailService,
      useClass: MailService,
    },
    {
      provide: TemplateService,
      useClass: TemplateService,
    },
  ],
  exports: [MailService, TemplateService],
})
export class MailModule {
  private readonly logger = new Logger(MailModule.name);

  constructor() {
    this.logger.log('📧 MailModule initialized (Global)');
  }
}
