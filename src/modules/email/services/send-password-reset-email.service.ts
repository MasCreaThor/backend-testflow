// src/modules/email/services/send-password-reset-email.service.ts
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MailerService } from '@nestjs-modules/mailer';
import { LoggerService } from '../../../shared/services/logger.service';
import { EmailTemplateService } from './email-template.service';

@Injectable()
export class SendPasswordResetEmailService {
  constructor(
    private readonly mailerService: MailerService,
    private readonly configService: ConfigService,
    private readonly emailTemplateService: EmailTemplateService,
    private readonly logger: LoggerService
  ) {
    this.logger.setContext(SendPasswordResetEmailService.name);
  }

  /**
   * Envía un correo de restablecimiento de contraseña
   * @param email Correo electrónico del destinatario
   * @param token Token de restablecimiento
   * @param fullName Nombre completo del usuario (opcional)
   * @returns true si el correo se envió correctamente, false en caso contrario
   */
  async execute(
    email: string,
    token: string,
    fullName: string = 'Usuario'
  ): Promise<boolean> {
    try {
      this.logger.log(`Preparando correo de restablecimiento para: ${email}`);
      
      // Obtener URL base del frontend desde la configuración
      const frontendUrl = this.configService.get<string>('APP_URL') || 'http://localhost:3000';
      
      // Construir la URL de restablecimiento correcta
      const resetUrl = `${frontendUrl}/auth/reset-password?token=${token}`;
      
      this.logger.debug(`URL de restablecimiento generada: ${resetUrl}`);

      // Obtener la plantilla HTML del servicio de plantillas
      const htmlContent = this.emailTemplateService.getPasswordResetTemplate({
        fullName,
        resetUrl,
        expiresIn: '1 hora',
        appName: 'TestFlow',
        supportEmail: this.configService.get<string>('EMAIL_FROM') || 'soporte@testflow.com',
      });

      // Enviar el correo electrónico con el HTML de la plantilla
      await this.mailerService.sendMail({
        to: email,
        subject: 'Restablecer contraseña - TestFlow',
        html: htmlContent, // Usar HTML directamente en lugar de una referencia a plantilla
      });

      this.logger.log(`Correo de restablecimiento enviado a: ${email}`);
      return true;
    } catch (error) {
      this.logger.error(
        `Error al enviar correo de restablecimiento a ${email}: ${error.message}`,
        error.stack
      );
      return false;
    }
  }
}