import * as dotenv from 'dotenv';
import { z } from 'zod';
import { EnvSchema } from './env.dto';

// Load environment variables
dotenv.config();

/**
 * Configuration loader that validates and provides typed environment variables
 */
export class ConfigLoader {
  private static instance: ConfigLoader;
  private config: z.infer<typeof EnvSchema>;

  private constructor() {
    this.config = EnvSchema.parse(process.env);
  }

  /**
   * Get singleton instance of ConfigLoader
   */
  public static getInstance(): ConfigLoader {
    if (!ConfigLoader.instance) {
      try {
        ConfigLoader.instance = new ConfigLoader();
      } catch (error) {
        if (error instanceof Error) {
          throw new Error(`Configuration validation failed: ${error.message}`);
        }
        throw new Error('Configuration validation failed');
      }
    }
    return ConfigLoader.instance;
  }

  /**
   * Get all configuration
   */
  public getConfig() {
    return this.config;
  }

  /**
   * Get application port
   */
  public get appPort(): number {
    return this.config.APP_PORT;
  }

  /**
   * Get application global prefix
   */
  public get appGlobalPrefix(): string {
    return this.config.APP_GLOBAL_PREFIX;
  }

  /**
   * Get application name
   */
  public get appName(): string {
    return this.config.APP_APPLICATION_NAME;
  }

  /**
   * Get database configuration
   */
  public get database() {
    return {
      host: this.config.DATABASE_HOST,
      port: this.config.DATABASE_PORT,
      user: this.config.DATABASE_USER,
      password: this.config.DATABASE_PASSWORD,
      database: this.config.DATABASE_NAME,
    };
  }

  /**
   * Get Better Auth configuration
   */
  public get betterAuth() {
    return {
      secret: this.config.BETTER_AUTH_SECRET,
      url: this.config.BETTER_AUTH_URL,
    };
  }

  /**
   * Get email/mail configuration
   */
  public get mail() {
    return {
      host: this.config.MAIL_HOST,
      port: this.config.MAIL_PORT,
      user: this.config.MAIL_USER,
      password: this.config.MAIL_PASSWORD,
      from: this.config.MAIL_FROM,
      fromName: this.config.MAIL_FROM_NAME,
    };
  }

  /**
   * Get reference URL for API documentation
   */
  public getReferenceUrl(): string {
    return `http://localhost:${this.appPort}/${this.appGlobalPrefix}/reference`;
  }

  /**
   * Get frontend URLs
   */
  public getFrontendUrls(): string[] {
    return this.config.APP_FRONTEND_URL;
  }
}

// Export singleton instance
export const config = ConfigLoader.getInstance();

// Export typed configuration for backward compatibility
export const AppConfig = config.getConfig();
