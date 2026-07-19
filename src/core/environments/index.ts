const ENVS = {
  NODE_ENV: process.env.NODE_ENV || "dev",
  PORT: process.env.PORT || 3000,
  POSTGRES_URI: process.env.POSTGRES_URI || "postgresql://user:password@localhost:5432/books_db?schema=public",
  MONGO_URI: process.env.MONGO_URI || "mongodb://localhost:27017/books_audits",
  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET || "jwtaccess",
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || "jwtrefresh",
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "3600",
} as const;

export default ENVS;