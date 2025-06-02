export const configuration = () => ({
    app: {
      port: parseInt(process.env.PORT ?? '3001', 10),
      environment: process.env.NODE_ENV || 'development',
      requestTimeout: parseInt(process.env.REQUEST_TIMEOUT ?? '30000', 10),
    },
    database: {
      uri: process.env.DATABASE_URI || process.env.MONGODB_URI || process.env.DATABASE_URL || 'mongodb+srv://yamunozr22:wDnaZL7vOKX3ZiYH@cluster0.zeirl.mongodb.net/test?retryWrites=true&w=majority&appName=Cluster0',
    },
    jwt: {
      secret: process.env.JWT_SECRET || 'testflow-secret-key',
      expiresIn: process.env.JWT_EXPIRES_IN || '1d',
      refreshSecret: process.env.JWT_REFRESH_SECRET || 'testflow-refresh-secret-key',
      refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
    },
    email: {
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.EMAIL_PORT ?? '587', 10),
      secure: process.env.EMAIL_SECURE === 'true',
      user: process.env.EMAIL_USER,
      password: process.env.EMAIL_PASSWORD,
      from: process.env.EMAIL_FROM || 'TestFlow <noreply@testflow.com>',
    },
    cors: {
      allowedOrigins: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
    }
  });