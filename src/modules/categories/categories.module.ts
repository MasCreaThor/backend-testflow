// src/modules/categories/categories.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Category, CategorySchema } from './infra/schemas/category.schema';
import { CategoryController } from './controllers/category.controller';
import { CategoryService } from './services/category.service';
import { CategoryRepository } from './infra/repositories/category.repository';
import { RolesModule } from '../roles/roles.module';
import { LoggerService } from '../../shared/services/logger.service';

/**
 * Módulo de categorías que gestiona la administración de categorías
 * utilizadas para clasificar contenido educativo
 */
@Module({
  imports: [
    MongooseModule.forFeature([{ name: Category.name, schema: CategorySchema }]),
    RolesModule,
  ],
  controllers: [CategoryController],
  providers: [
    CategoryService, 
    CategoryRepository,
    LoggerService
  ],
  exports: [
    CategoryService, 
    CategoryRepository
  ],
})
export class CategoriesModule {}