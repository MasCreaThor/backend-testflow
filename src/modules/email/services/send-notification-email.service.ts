// src/modules/email/services/send-notification-email.service.ts
import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';
import { EmailTemplateService } from './email-template.service';
import { LoggerService } from '../../../shared/services/logger.service';

@Injectable()
export class SendNotificationEmailService {
  private readonly appUrl: string;

  constructor(
    private readonly mailerService: MailerService,
    private readonly configService: ConfigService,
    private readonly emailTemplateService: EmailTemplateService,
    private readonly logger: LoggerService
  ) {
    this.appUrl = this.configService.get<string>('app.url') || 'http://localhost:3000';
    this.logger.setContext(SendNotificationEmailService.name);
  }

  /**
   * Envía un correo electrónico de notificación genérica
   * @param email Correo electrónico del destinatario
   * @param subject Asunto del correo
   * @param message Mensaje principal
   * @param actionUrl URL de acción (opcional)
   * @param actionText Texto del botón de acción (opcional)
   * @param name Nombre del destinatario (opcional)
   * @returns true si el correo se envió correctamente, false en caso contrario
   */
  async execute(
    email: string, 
    subject: string, 
    message: string, 
    actionUrl?: string, 
    actionText?: string, 
    name?: string
  ): Promise<boolean> {
    try {
      // Obtener el HTML del email desde el servicio de plantillas
      const htmlContent = this.emailTemplateService.getNotificationTemplate(
        message, 
        name || 'Usuario', 
        actionUrl, 
        actionText
      );
      
      // Enviar el correo
      await this.mailerService.sendMail({
        to: email,
        subject: subject,
        html: htmlContent,
      });
      
      this.logger.log(`Correo de notificación "${subject}" enviado a: ${email}`);
      return true;
    } catch (error) {
      this.logger.error(`Error al enviar correo de notificación a ${email}: ${error.message}`, error.stack);
      return false;
    }
  }
}