import { Module, Global } from '@nestjs/common';
import { MailService } from './mail.service';
import { TemplateService } from './template.service';

@Global()
@Module({
  providers: [MailService, TemplateService],
  exports: [MailService, TemplateService],
})
export class MailModule {}
