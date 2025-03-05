// src/modules/auth/auth.module.ts
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

import { UsersModule } from '../users/users.module';
import { 
  LoginController,
  RegisterController,
  RefreshTokenController,
  ResetPasswordController
} from './controllers';
import {
  LoginService,
  RegisterService,
  RefreshTokenService,
  ResetPasswordService
} from './services';
import { JwtStrategy, LocalStrategy } from './strategies';
import { AuthToken, AuthTokenSchema } from './infra/schemas';
import { TokenRepository } from './infra/repositories';

@Module({
  imports: [
    UsersModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('jwt.secret') || 'testflow-secret-key',
        signOptions: {
          expiresIn: configService.get<string>('jwt.expiresIn') || '1d',
        },
      }),
    }),
    MongooseModule.forFeature([
      { name: AuthToken.name, schema: AuthTokenSchema },
    ]),
  ],
  controllers: [
    LoginController,
    RegisterController,
    RefreshTokenController,
    ResetPasswordController,
  ],
  providers: [
    LoginService,
    RegisterService,
    RefreshTokenService,
    ResetPasswordService,
    TokenRepository,
    JwtStrategy,
    LocalStrategy,
  ],
  exports: [
    LoginService,
    RegisterService,
    RefreshTokenService,
    ResetPasswordService,
  ],
})
export class AuthModule {}