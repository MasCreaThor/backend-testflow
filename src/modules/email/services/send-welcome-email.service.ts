// src/modules/email/services/send-welcome-email.service.ts
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MailerService } from '@nestjs-modules/mailer';
import { LoggerService } from '../../../shared/services/logger.service';
import { EmailTemplateService } from './email-template.service';

@Injectable()
export class SendWelcomeEmailService {
  constructor(
    private readonly mailerService: MailerService,
    private readonly configService: ConfigService,
    private readonly emailTemplateService: EmailTemplateService,
    private readonly logger: LoggerService
  ) {
    this.logger.setContext(SendWelcomeEmailService.name);
  }

  /**
   * Envía un correo de bienvenida al usuario registrado
   * @param email Correo electrónico del destinatario
   * @param fullName Nombre completo del usuario
   * @returns true si el correo se envió correctamente, false en caso contrario
   */
  async execute(
    email: string,
    fullName: string = 'Usuario'
  ): Promise<boolean> {
    try {
      this.logger.log(`Preparando correo de bienvenida para: ${email}`);
      
      // Obtener URL base del frontend desde la configuración
      const frontendUrl = this.configService.get<string>('APP_URL') || 'http://localhost:3000';
      
      // Construir la URL del dashboard
      const dashboardUrl = `${frontendUrl}/dashboard`;
      
      this.logger.debug(`URL del dashboard: ${dashboardUrl}`);

      // Obtener la plantilla HTML del servicio de plantillas
      const htmlContent = this.emailTemplateService.getWelcomeTemplate({
        fullName,
        dashboardUrl,
        appName: 'TestFlow',
        supportEmail: this.configService.get<string>('EMAIL_FROM') || 'soporte@testflow.com',
      });

      // Enviar el correo electrónico con el HTML de la plantilla
      await this.mailerService.sendMail({
        to: email,
        subject: 'Bienvenido a TestFlow',
        html: htmlContent, // Usar HTML directamente en lugar de una referencia a plantilla
      });

      this.logger.log(`Correo de bienvenida enviado a: ${email}`);
      return true;
    } catch (error) {
      this.logger.error(
        `Error al enviar correo de bienvenida a ${email}: ${error.message}`,
        error.stack
      );
      return false;
    }
  }
}