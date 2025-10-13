import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { Transporter } from 'nodemailer';
import { config } from '@/config/loader';
import { TemplateService } from './template.service';

@Injectable()
export class MailService {
  private transporter: Transporter;
  private templateService: TemplateService;

  constructor() {
    this.templateService = new TemplateService();
    this.transporter = nodemailer.createTransport({
      host: config.mail.host,
      port: config.mail.port,
      secure: config.mail.port === 465, // true for 465, false for other ports
      auth: {
        user: config.mail.user,
        pass: config.mail.password,
      },
    });
  }

  async sendVerificationOTP(email: string, otp: string, type: string) {
    const subject = this.getSubject(type);

    // Use template with variables
    const html = this.templateService.render('otp-email', {
      TITLE: subject,
      ICON: this.getEmailIcon(type),
      HEADER_TITLE: this.getEmailTitle(type),
      MESSAGE: this.getEmailMessage(type),
      OTP_CODE: otp,
      EXPIRY_TIME: '10 minutes',
      CURRENT_YEAR: new Date().getFullYear(),
      APP_NAME: config.mail.fromName,
    });

    try {
      await this.transporter.sendMail({
        from: `"${config.mail.fromName}" <${config.mail.from}>`,
        to: email,
        subject,
        html,
      });
      console.log(`✅ OTP email sent to ${email}`);
    } catch (error) {
      console.error('❌ Failed to send OTP email:', error);
      throw new Error('Failed to send verification email');
    }
  }

  async sendVerificationEmail(
    email: string,
    verificationUrl: string,
    userName?: string,
  ) {
    // Use template with variables
    const html = this.templateService.render('verification-email', {
      GREETING: userName ? `Hi ${userName},` : 'Hello,',
      VERIFICATION_URL: verificationUrl,
      EXPIRY_TIME: '24 hours',
      CURRENT_YEAR: new Date().getFullYear(),
      APP_NAME: config.mail.fromName,
    });

    try {
      await this.transporter.sendMail({
        from: `"${config.mail.fromName}" <${config.mail.from}>`,
        to: email,
        subject: 'Verify Your Email Address',
        html,
      });
      console.log(`✅ Verification email sent to ${email}`);
    } catch (error) {
      console.error('❌ Failed to send verification email:', error);
      throw new Error('Failed to send verification email');
    }
  }

  async sendTwoFactorOTP(email: string, otp: string) {
    const subject = 'Your Two-Factor Authentication Code';

    // Use template with variables
    const html = this.templateService.render('otp-email', {
      TITLE: subject,
      ICON: '🔐',
      HEADER_TITLE: 'Two-Factor Authentication',
      MESSAGE: 'Your two-factor authentication code is:',
      OTP_CODE: otp,
      EXPIRY_TIME: '5 minutes',
      CURRENT_YEAR: new Date().getFullYear(),
      APP_NAME: config.mail.fromName,
    });

    try {
      await this.transporter.sendMail({
        from: `"${config.mail.fromName}" <${config.mail.from}>`,
        to: email,
        subject,
        html,
      });
      console.log(`✅ 2FA OTP email sent to ${email}`);
    } catch (error) {
      console.error('❌ Failed to send 2FA OTP email:', error);
      throw new Error('Failed to send two-factor authentication email');
    }
  }

  async sendPasswordResetEmail(
    email: string,
    resetUrl: string,
    userName?: string,
  ) {
    const subject = 'Reset Your Password';

    // Use password reset template with variables
    const html = this.templateService.render('password-reset-email', {
      TITLE: subject,
      ICON: '🔑',
      HEADER_TITLE: 'Password Reset',
      MESSAGE: userName
        ? `Hi ${userName}, you requested to reset your password. Click the button below to reset your password:`
        : 'You requested to reset your password. Click the button below to reset your password:',
      EXPIRY_TIME: '1 hour',
      CURRENT_YEAR: new Date().getFullYear(),
      APP_NAME: config.mail.fromName,
      RESET_URL: resetUrl,
    });

    try {
      await this.transporter.sendMail({
        from: `"${config.mail.fromName}" <${config.mail.from}>`,
        to: email,
        subject,
        html,
      });
      console.log(`✅ Password reset email sent to ${email}`);
    } catch (error) {
      console.error('❌ Failed to send password reset email:', error);
      throw new Error('Failed to send password reset email');
    }
  }

  async sendPasswordChangeSuccessEmail(email: string, userName?: string) {
    const subject = 'Your Password Has Been Changed Successfully';

    // Use template with variables
    const html = this.templateService.render('password-change-success', {
      GREETING: userName ? `Hi ${userName},` : 'Hello,',
      CURRENT_YEAR: new Date().getFullYear(),
      APP_NAME: config.mail.fromName,
    });

    try {
      await this.transporter.sendMail({
        from: `"${config.mail.fromName}" <${config.mail.from}>`,
        to: email,
        subject,
        html,
      });
      console.log(`✅ Password change success email sent to ${email}`);
    } catch (error) {
      console.error('❌ Failed to send password change success email:', error);
      throw new Error('Failed to send password change notification');
    }
  }

  private getSubject(type: string): string {
    switch (type) {
      case 'sign-in':
        return 'Your Sign In OTP Code';
      case 'email-verification':
        return 'Verify Your Email Address';
      case 'forget-password':
        return 'Reset Your Password';
      default:
        return 'Your Verification Code';
    }
  }

  private getEmailTitle(type: string): string {
    switch (type) {
      case 'sign-in':
        return 'Sign In Verification';
      case 'email-verification':
        return 'Email Verification';
      case 'forget-password':
        return 'Password Reset';
      default:
        return 'Verification Code';
    }
  }

  private getEmailIcon(type: string): string {
    switch (type) {
      case 'sign-in':
        return '🔐';
      case 'email-verification':
        return '✉️';
      case 'forget-password':
        return '🔑';
      default:
        return '🔒';
    }
  }

  private getEmailMessage(type: string): string {
    switch (type) {
      case 'sign-in':
        return 'You requested to sign in to your account. Please use the code below to complete your sign in:';
      case 'email-verification':
        return 'Thank you for signing up! Please verify your email address using the code below:';
      case 'forget-password':
        return 'You requested to reset your password. Please use the code below to proceed:';
      default:
        return 'Please use the verification code below:';
    }
  }
}
