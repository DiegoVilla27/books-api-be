import type { StringValue } from 'ms';

interface EnvironmentConfig {
  readonly NODE_ENV: string;
  readonly PORT: number;
  readonly POSTGRES_URI: string;
  readonly MONGO_URI: string;
  readonly JWT_ACCESS_SECRET: string;
  readonly JWT_REFRESH_SECRET: string;
  readonly JWT_EXPIRES_IN: number | StringValue;
  readonly JWT_REFRESH_EXPIRES_IN: StringValue;
}

const parseExpiresIn = (val: string | undefined, fallback: string): number | StringValue => {
  const target = val || fallback;
  if (/^\d+$/.test(target)) {
    return parseInt(target, 10);
  }
  return target as StringValue;
};

const ENVS: EnvironmentConfig = {
  NODE_ENV: process.env.NODE_ENV || "dev",
  PORT: parseInt(process.env.PORT || "3000", 10),
  POSTGRES_URI: process.env.POSTGRES_URI || "postgresql://user:password@localhost:5432/books_db?schema=public",
  MONGO_URI: process.env.MONGO_URI || "mongodb://localhost:27017/books_audits",
  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET || "jwtaccess",
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || "jwtrefresh",
  JWT_EXPIRES_IN: parseExpiresIn(process.env.JWT_EXPIRES_IN, "3600"),
  JWT_REFRESH_EXPIRES_IN: parseExpiresIn(process.env.JWT_REFRESH_EXPIRES_IN, "7d") as StringValue
};

export default ENVS;