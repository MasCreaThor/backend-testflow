// src/modules/email/services/email-template.service.ts
import { Injectable } from '@nestjs/common';

/**
 * Servicio que proporciona plantillas HTML para correos electrónicos
 */
@Injectable()
export class EmailTemplateService {
  /**
   * Obtiene la plantilla HTML para correos de bienvenida
   * @param params Parámetros para la plantilla
   * @returns HTML de la plantilla
   */
  getWelcomeTemplate(params: {
    fullName: string;
    dashboardUrl: string;
    appName: string;
    supportEmail: string;
  }): string {
    const { fullName, dashboardUrl, appName, supportEmail } = params;
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
        <title>Bienvenido a ${appName}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f6f6f6;
            margin: 0;
            padding: 0;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            background-color: #0ea5e9;
            color: white;
            padding: 20px;
            text-align: center;
          }
          .content {
            background-color: white;
            padding: 20px;
            border-radius: 5px;
          }
          .button {
            display: inline-block;
            background-color: #0ea5e9;
            color: white;
            text-decoration: none;
            padding: 10px 20px;
            border-radius: 5px;
            margin: 20px 0;
          }
          .footer {
            text-align: center;
            margin-top: 20px;
            font-size: 12px;
            color: #666;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${appName}</h1>
          </div>
          <div class="content">
            <p>Hola ${fullName},</p>
            <p>¡Bienvenido a ${appName}! Estamos emocionados de tenerte como parte de nuestra comunidad.</p>
            <p>Con ${appName}, podrás gestionar tus objetivos de aprendizaje y seguir tu progreso de manera efectiva.</p>
            <div style="text-align: center;">
              <a href="${dashboardUrl}" class="button">Ir a mi Dashboard</a>
            </div>
            <p>Si tienes alguna pregunta o necesitas ayuda, no dudes en contactarnos.</p>
            <p>¡Esperamos que disfrutes de tu experiencia con ${appName}!</p>
          </div>
          <div class="footer">
            <p>${appName} - Plataforma de Gestión de Aprendizaje</p>
            <p>¿Necesitas ayuda? Contacta a <a href="mailto:${supportEmail}">soporte</a>.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Obtiene la plantilla HTML para correos de restablecimiento de contraseña
   * @param params Parámetros para la plantilla
   * @returns HTML de la plantilla
   */
  getPasswordResetTemplate(params: {
    fullName: string;
    resetUrl: string;
    expiresIn: string;
    appName: string;
    supportEmail: string;
  }): string {
    const { fullName, resetUrl, expiresIn, appName, supportEmail } = params;
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
        <title>Restablecer contraseña</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f6f6f6;
            margin: 0;
            padding: 0;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            background-color: #0ea5e9;
            color: white;
            padding: 20px;
            text-align: center;
          }
          .content {
            background-color: white;
            padding: 20px;
            border-radius: 5px;
          }
          .button {
            display: inline-block;
            background-color: #0ea5e9;
            color: white;
            text-decoration: none;
            padding: 10px 20px;
            border-radius: 5px;
            margin: 20px 0;
          }
          .footer {
            text-align: center;
            margin-top: 20px;
            font-size: 12px;
            color: #666;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${appName}</h1>
          </div>
          <div class="content">
            <p>Hola ${fullName},</p>
            <p>Has solicitado restablecer tu contraseña. Haz clic en el siguiente botón para crear una nueva contraseña:</p>
            <div style="text-align: center;">
              <a href="${resetUrl}" class="button">Restablecer Contraseña</a>
            </div>
            <p>Si no solicitaste este restablecimiento, puedes ignorar este correo y tu contraseña no cambiará.</p>
            <p>Este enlace expirará en ${expiresIn}.</p>
            <p>Si el botón no funciona, puedes copiar y pegar la siguiente URL en tu navegador:</p>
            <p style="word-break: break-all;"><a href="${resetUrl}">${resetUrl}</a></p>
          </div>
          <div class="footer">
            <p>${appName} - Plataforma de Gestión de Aprendizaje</p>
            <p>¿Necesitas ayuda? Contacta a <a href="mailto:${supportEmail}">soporte</a>.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Obtiene la plantilla HTML para correos de notificación genérica
   * @param message Mensaje principal de la notificación
   * @param name Nombre del destinatario
   * @param actionUrl URL de acción (opcional)
   * @param actionText Texto del botón de acción (opcional)
   * @returns HTML de la plantilla
   */
  getNotificationTemplate(
    message: string, 
    name: string = 'Usuario', 
    actionUrl?: string, 
    actionText?: string
  ): string {
    // Configuración por defecto
    const appName = 'TestFlow';
    const supportEmail = 'soporte@testflow.com';
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
        <title>Notificación de ${appName}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f6f6f6;
            margin: 0;
            padding: 0;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            background-color: #0ea5e9;
            color: white;
            padding: 20px;
            text-align: center;
          }
          .content {
            background-color: white;
            padding: 20px;
            border-radius: 5px;
          }
          .button {
            display: inline-block;
            background-color: #0ea5e9;
            color: white;
            text-decoration: none;
            padding: 10px 20px;
            border-radius: 5px;
            margin: 20px 0;
          }
          .footer {
            text-align: center;
            margin-top: 20px;
            font-size: 12px;
            color: #666;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${appName}</h1>
          </div>
          <div class="content">
            <p>Hola ${name},</p>
            <p>${message}</p>
            ${actionUrl && actionText ? `
            <div style="text-align: center;">
              <a href="${actionUrl}" class="button">${actionText}</a>
            </div>
            ` : ''}
          </div>
          <div class="footer">
            <p>${appName} - Plataforma de Gestión de Aprendizaje</p>
            <p>¿Necesitas ayuda? Contacta a <a href="mailto:${supportEmail}">soporte</a>.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }
}