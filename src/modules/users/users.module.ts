// src/modules/users/users.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './infra/schemas';
import {
  CreateUserController,
  FindAllUsersController,
  FindUserByIdController,
  TestConnectionController,
} from './controllers';
import {
  CreateUserService,
  FindAllUsersService,
  FindUserByIdService,
  TestConnectionService,
  UpdateLastLoginService,
} from './services';
import { UserRepository } from './infra/repositories';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  controllers: [
    CreateUserController,
    FindAllUsersController,
    FindUserByIdController,
    TestConnectionController,
  ],
  providers: [
    UserRepository,
    CreateUserService,
    FindAllUsersService,
    FindUserByIdService,
    TestConnectionService,
    UpdateLastLoginService,
  ],
  exports: [
    UserRepository,
    CreateUserService,
    FindAllUsersService,
    FindUserByIdService,
    UpdateLastLoginService,
  ],
})
export class UsersModule {}