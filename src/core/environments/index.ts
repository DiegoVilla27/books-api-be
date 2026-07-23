import type { StringValue } from 'ms';

interface EnvironmentConfig {
  readonly NODE_ENV: string;
  readonly PORT: number;
  // PostgreSQL
  readonly POSTGRES_USER: string;
  readonly POSTGRES_PASSWORD: string;
  readonly POSTGRES_DB: string;
  readonly POSTGRES_URI: string;
  // JWT
  readonly JWT_ACCESS_SECRET: string;
  readonly JWT_REFRESH_SECRET: string;
  readonly JWT_EXPIRES_IN: number | StringValue;
  readonly JWT_REFRESH_EXPIRES_IN: StringValue;
  // Redis(Caché local)
  readonly REDIS_HOST: string;
  readonly REDIS_PORT: number;
  // RabbitMQ (Cola de mensajes para Express -> Spring Boot)
  readonly RABBITMQ_USER: string;
  readonly RABBITMQ_PASS: string;
  readonly RABBITMQ_URL: string;
  // Kafka (Event Stream)
  readonly KAFKA_BROKERS: string;
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
  POSTGRES_USER: process.env.POSTGRES_USER || "user",
  POSTGRES_PASSWORD: process.env.POSTGRES_PASSWORD || "password",
  POSTGRES_DB: process.env.POSTGRES_DB || "books_db",
  POSTGRES_URI: process.env.POSTGRES_URI || "postgresql://user:password@localhost:5432/books_db?schema=public",
  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET || "jwtaccess",
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || "jwtrefresh",
  JWT_EXPIRES_IN: parseExpiresIn(process.env.JWT_EXPIRES_IN, "3600"),
  JWT_REFRESH_EXPIRES_IN: parseExpiresIn(process.env.JWT_REFRESH_EXPIRES_IN, "7d") as StringValue,
  REDIS_HOST: process.env.REDIS_HOST || "localhost",
  REDIS_PORT: parseInt(process.env.REDIS_PORT || "6379", 10),
  RABBITMQ_USER: process.env.RABBITMQ_USER || "guest",
  RABBITMQ_PASS: process.env.RABBITMQ_PASS || "guest",
  RABBITMQ_URL: process.env.RABBITMQ_URL || "amqp://guest:guest@localhost:5672",
  KAFKA_BROKERS: process.env.KAFKA_BROKERS || "localhost:9092"
};

export default ENVS;