export const configuration = () => ({
    app: {
      port: parseInt(process.env.PORT ?? '3001', 10),
      environment: process.env.NODE_ENV || 'development',
      requestTimeout: parseInt(process.env.REQUEST_TIMEOUT ?? '30000', 10),
    },
    database: {
      uri: process.env.MONGODB_URI || process.env.DATABASE_URL || 'mongodb://localhost:27017/testflow',
    },
    jwt: {
      secret: process.env.JWT_SECRET || 'testflow-secret-key',
      expiresIn: process.env.JWT_EXPIRES_IN || '1d',
      refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
    },
    email: {
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT ?? '587', 10),
      user: process.env.EMAIL_USER,
      password: process.env.EMAIL_PASSWORD,
      from: process.env.EMAIL_FROM,
    },
    cors: {
      allowedOrigins: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
    }
  });