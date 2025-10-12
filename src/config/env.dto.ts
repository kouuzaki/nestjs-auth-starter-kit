import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, IsUrl, Min } from 'class-validator';

export class EnvDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  APP_PORT = 3000;

  @IsString()
  DATABASE_HOST: string;

  @Type(() => Number)
  @IsInt()
  DATABASE_PORT = 5432;

  @IsString()
  DATABASE_USER: string;

  @IsOptional()
  @IsString()
  DATABASE_PASSWORD?: string;

  @IsString()
  DATABASE_NAME: string;

  @IsString()
  BETTER_AUTH_SECRET: string;

  @IsUrl({ require_tld: false }) // Allow localhost and non-TLD URLs
  BETTER_AUTH_URL: string;
}
