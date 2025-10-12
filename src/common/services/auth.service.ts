import { Injectable } from '@nestjs/common';
import { type Auth } from 'better-auth';

@Injectable()
export class AuthService {
  constructor(private readonly auth: Auth) {}

  /**
   * Get current authenticated user from session
   */
  async getCurrentUser(sessionToken: string) {
    const session = await this.auth.api.getSession({
      headers: {
        authorization: `Bearer ${sessionToken}`,
      },
    });

    return session;
  }

  /**
   * Sign out user
   */
  async signOut(sessionToken: string) {
    await this.auth.api.signOut({
      headers: {
        authorization: `Bearer ${sessionToken}`,
      },
    });

    return { success: true };
  }

  /**
   * Resend verification email
   */
  async resendVerificationEmail(email: string) {
    await this.auth.api.sendVerificationEmail({
      body: { email },
    });

    return { success: true, message: 'Verification email sent' };
  }
}
