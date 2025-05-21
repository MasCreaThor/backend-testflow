// src/config/email.config.ts
import { registerAs } from '@nestjs/config';

export default registerAs('email', () => ({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT || '587', 10),
  secure: process.env.EMAIL_SECURE === 'true',
  user: process.env.EMAIL_USER || 'test@gmail.com',
  password: process.env.EMAIL_PASSWORD || 'app-password',
  from: process.env.EMAIL_FROM || 'TestFlow <noreply@testflow.com>',
}));