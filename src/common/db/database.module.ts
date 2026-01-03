import { Module, Logger } from '@nestjs/common';
import { DatabaseService } from './database.service';

@Module({
  providers: [DatabaseService],
  exports: [DatabaseService],
})
export class DatabaseModule {
  private readonly logger = new Logger(DatabaseModule.name);

  constructor() {
    this.logger.log('🗄️ DatabaseModule initialized');
  }
}
