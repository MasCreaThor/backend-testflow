import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
  
  @Get('health')
  healthCheck(): { status: string; timestamp: string; environment: string } {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development'
    };
  }

  @Get('api/health')
  apiHealthCheck(): { status: string; timestamp: string; message: string } {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      message: 'TestFlow API is running on Vercel'
    };
  }
}