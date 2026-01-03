## Service Implementation Guide

Berikut adalah pattern untuk membuat service baru yang sesuai dengan struktur NestJS yang telah ditetapkan.

### 1. **Global Services** (Digunakan di multiple modules)

Untuk service yang bersifat global (seperti Mail, Database), buat dalam module tersendiri:

```typescript
// src/common/services/your-service.service.ts
import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';

@Injectable()
export class YourService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(YourService.name, { timestamp: true });
  private isConnected = false;

  constructor() {
    this.logger.debug('YourService constructor called');
  }

  async onModuleInit() {
    try {
      this.logger.log('Initializing YourService...');
      // Initialize your service
      this.isConnected = true;
      this.logger.log('✓ YourService initialized successfully');
    } catch (error) {
      this.logger.error(`✗ Failed to initialize YourService: ${error.message}`, error.stack);
      throw error;
    }
  }

  async onModuleDestroy() {
    try {
      this.logger.log('Closing YourService...');
      // Cleanup resources
      this.isConnected = false;
      this.logger.log('✓ YourService closed successfully');
    } catch (error) {
      this.logger.error(`Error closing YourService: ${error.message}`, error.stack);
    }
  }

  isServiceConnected(): boolean {
    return this.isConnected;
  }

  private checkConnection(): void {
    if (!this.isConnected) {
      this.logger.warn('YourService is not connected. Operation may fail.');
    }
  }

  // Your service methods here
  async yourMethod() {
    this.checkConnection();
    try {
      this.logger.debug('Executing yourMethod...');
      // Your implementation
      this.logger.log('✓ yourMethod executed successfully');
    } catch (error) {
      this.logger.error(`Failed to execute yourMethod: ${error.message}`, error.stack);
      throw error;
    }
  }
}
```

```typescript
// src/common/services/your-service.module.ts
import { Module, Global, Logger } from '@nestjs/common';
import { YourService } from './your-service.service';

@Global()
@Module({
  providers: [
    {
      provide: YourService,
      useClass: YourService,
    },
  ],
  exports: [YourService],
})
export class YourServiceModule {
  private readonly logger = new Logger(YourServiceModule.name);

  constructor() {
    this.logger.log('🔧 YourServiceModule initialized (Global)');
  }
}
```

### 2. **Feature-Specific Services** (Digunakan di specific module)

Untuk service yang spesifik untuk satu module (seperti UserService di UserModule):

```typescript
// src/modules/user/services/user.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { DatabaseService } from '@/common/db';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name, { timestamp: true });

  constructor(private readonly databaseService: DatabaseService) {
    this.logger.debug('UserService initialized');
  }

  async getUser(userId: string) {
    try {
      this.logger.debug(`Fetching user with ID: ${userId}`);
      // Your implementation
      this.logger.log(`User ${userId} fetched successfully`);
      return user;
    } catch (error) {
      this.logger.error(`Failed to fetch user ${userId}: ${error.message}`, error.stack);
      throw error;
    }
  }

  async createUser(data: any) {
    try {
      this.logger.log(`Creating new user...`);
      // Your implementation
      this.logger.log(`✓ User created successfully with ID: ${user.id}`);
      return user;
    } catch (error) {
      this.logger.error(`Failed to create user: ${error.message}`, error.stack);
      throw error;
    }
  }

  async updateUser(userId: string, data: any) {
    try {
      this.logger.log(`Updating user ${userId}...`);
      // Your implementation
      this.logger.log(`✓ User ${userId} updated successfully`);
      return user;
    } catch (error) {
      this.logger.error(`Failed to update user ${userId}: ${error.message}`, error.stack);
      throw error;
    }
  }

  async deleteUser(userId: string) {
    try {
      this.logger.log(`Deleting user ${userId}...`);
      // Your implementation
      this.logger.log(`✓ User ${userId} deleted successfully`);
      return { success: true };
    } catch (error) {
      this.logger.error(`Failed to delete user ${userId}: ${error.message}`, error.stack);
      throw error;
    }
  }
}
```

```typescript
// src/modules/user/user.module.ts
import { Module, Logger } from '@nestjs/common';
import { UserService } from './services/user.service';
import { UserController } from './user.controller';
import { DatabaseModule } from '@/common/db/database.module';

@Module({
  imports: [DatabaseModule],
  providers: [UserService],
  controllers: [UserController],
  exports: [UserService],
})
export class UserModule {
  private readonly logger = new Logger(UserModule.name);

  constructor() {
    this.logger.log('👥 UserModule initialized');
  }
}
```

### 3. **Logging Best Practices**

- **`logger.log()`** - Untuk informasi penting (init, success, user actions)
- **`logger.debug()`** - Untuk debugging details (method calls, internal flow)
- **`logger.warn()`** - Untuk peringatan (connection issues, deprecated usage)
- **`logger.error()`** - Untuk error dengan stack trace

### 4. **Structure Summary**

```
src/
├── common/
│   ├── db/
│   │   ├── database.service.ts        (DatabaseService)
│   │   ├── database.module.ts         (DatabaseModule)
│   │   └── schema/
│   └── services/
│       ├── mail/
│       │   ├── mail.service.ts        (MailService)
│       │   ├── mail.module.ts         (MailModule - Global)
│       │   └── template.service.ts
│       └── auth.service.ts
├── lib/
│   ├── better-auth.service.ts         (BetterAuthService)
│   └── auth-hooks.ts
└── modules/
    ├── auth/
    │   └── auth.module.ts             (AuthModule)
    └── user/
        ├── user.module.ts             (UserModule)
        ├── user.service.ts
        ├── user.controller.ts
        └── dto/
```

### 5. **Module Initialization Flow**

Ketika aplikasi startup:
1. ✓ DatabaseModule initializes → DatabaseService onModuleInit
2. ✓ MailModule initializes (Global) → MailService onModuleInit
3. ✓ AuthModule initializes → BetterAuthService onModuleInit
4. ✓ UserModule initializes → UserService ready
5. Semua services siap digunakan

**Catatan Penting**: Module hanya di-initialize SATU KALI, semua service yang mengimport module tersebut akan mendapatkan instance yang sama (singleton pattern).

### 6. **Contoh Penggunaan di Controller**

```typescript
// src/modules/user/user.controller.ts
import { Controller, Get, Post, Body, Logger } from '@nestjs/common';
import { UserService } from './services/user.service';

@Controller('users')
export class UserController {
  private readonly logger = new Logger(UserController.name);

  constructor(private readonly userService: UserService) {
    this.logger.debug('UserController initialized');
  }

  @Get(':id')
  async getUser(@Param('id') id: string) {
    this.logger.debug(`GET /users/${id}`);
    return this.userService.getUser(id);
  }

  @Post()
  async createUser(@Body() data: CreateUserDto) {
    this.logger.log(`POST /users - Creating new user`);
    return this.userService.createUser(data);
  }
}
```

### 7. **App Module Integration**

```typescript
// src/app.module.ts
import { Module } from '@nestjs/common';
import { MailModule } from '@/common/services/mail.module';
import { DatabaseModule } from '@/common/db/database.module';
import { AuthModule } from '@/modules/auth/auth.module';
import { UserModule } from '@/modules/user/user.module';

@Module({
  imports: [
    DatabaseModule,      // Database first
    MailModule,          // Mail second (Global)
    AuthModule,          // Auth third (depends on DB & Mail)
    UserModule,          // User features
    // Add other modules here
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
```
