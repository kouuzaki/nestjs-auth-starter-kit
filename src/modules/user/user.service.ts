import { Injectable } from '@nestjs/common';
import { type UserSession } from '@thallesp/nestjs-better-auth';

@Injectable()
export class UserService {
  async getProfile(session: UserSession) {
    return new Promise((resolve) => {
      resolve(session.user);
    });
  }
}
