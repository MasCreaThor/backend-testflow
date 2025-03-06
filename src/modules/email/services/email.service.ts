// src/modules/email/services/email.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly appUrl: string;

  constructor(
    private readonly mailerService: MailerService,
    private readonly configService: ConfigService,
  ) {
    this.appUrl = this.configService.get<string>('app.url') || 'http://localhost:3000';
  }

  async sendPasswordResetEmail(email: string, token: string, name: string): Promise<boolean> {
    try {
      // Cambiamos la estructura de la URL para coincidir con nuestras rutas de Next.js
      const resetUrl = `${this.appUrl}/password-reset/${token}`;
      
      await this.mailerService.sendMail({
        to: email,
        subject: 'TestFlow - Restablecimiento de Contraseña',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
            <h2 style="color: #333; text-align: center;">TestFlow</h2>
            <div style="padding: 20px; background-color: #f9f9f9; border-radius: 5px;">
              <h3 style="margin-top: 0;">Hola ${name},</h3>
              <p>Recibimos una solicitud para restablecer la contraseña de tu cuenta.</p>
              <p>Haz clic en el siguiente botón para crear una nueva contraseña:</p>
              <div style="text-align: center; margin: 25px 0;">
                <a href="${resetUrl}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; font-weight: bold;">
                  Restablecer Contraseña
                </a>
              </div>
              <p>Este enlace expirará en 1 hora por seguridad.</p>
              <p>Si no solicitaste este cambio, puedes ignorar este correo.</p>
              <p>Saludos,<br>El equipo de TestFlow</p>
            </div>
            <div style="text-align: center; padding-top: 20px; color: #777; font-size: 12px;">
              <p>Este es un correo automático, por favor no respondas a este mensaje.</p>
            </div>
          </div>
        `,
      });
      
      this.logger.log(`Correo de restablecimiento enviado a: ${email}`);
      return true;
    } catch (error) {
      this.logger.error(`Error al enviar correo a ${email}: ${error.message}`, error.stack);
      return false;
    }
  }
}