import { Controller, Get } from '@nestjs/common';
import { UserService } from './user.service';
import { Session, type UserSession } from '@thallesp/nestjs-better-auth';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('me')
  async getProfile(@Session() session: UserSession) {
    await this.userService.getProfile(session);
  }
}
