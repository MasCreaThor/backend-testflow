// src/modules/email/email.module.ts
import { Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { SendPasswordResetEmailService } from './services/send-password-reset-email.service';
import { SendWelcomeEmailService } from './services/send-welcome-email.service';
import { SendNotificationEmailService } from './services/send-notification-email.service';
import { EmailTemplateService } from './services/email-template.service';
import { LoggerService } from '../../shared/services/logger.service';

/**
 * Módulo para el envío de correos electrónicos
 */
@Module({
  imports: [
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        transport: {
          host: configService.get<string>('email.host'),
          port: configService.get<number>('email.port'),
          secure: configService.get<boolean>('email.secure'),
          auth: {
            user: configService.get<string>('email.user'),
            pass: configService.get<string>('email.password'),
          },
        },
        defaults: {
          from: configService.get<string>('email.from'),
        },
        // Eliminamos la configuración de template para evitar problemas con Handlebars
      }),
    }),
  ],
  providers: [
    LoggerService,
    EmailTemplateService,
    SendPasswordResetEmailService,
    SendWelcomeEmailService,
    SendNotificationEmailService,
  ],
  exports: [
    SendPasswordResetEmailService,
    SendWelcomeEmailService,
    SendNotificationEmailService,
  ],
})
export class EmailModule {}