// src/modules/categories/controllers/category.controller.ts
import { 
  Controller, 
  Get, 
  Post, 
  Put, 
  Delete, 
  Body, 
  Param, 
  Query, 
  UseGuards,
  HttpCode,
  HttpStatus 
} from '@nestjs/common';
import { JwtAuthGuard } from '../../../shared/guards/jwt-auth.guard';
import { AdminAccessGuard } from '../../roles/guards/admin-access.guard';
import { CategoryService } from '../services/category.service';
import { CreateCategoryDto } from '../model/dto/create-category.dto';
import { UpdateCategoryDto } from '../model/dto/update-category.dto';
import { ICategory } from '../model/interfaces/category.interface';
import { LoggerService } from '../../../shared/services/logger.service';

/**
 * Controlador para la gestión de categorías
 * 
 * Los endpoints GET son accesibles para todos los usuarios autenticados
 * Los endpoints POST, PUT, DELETE requieren rol de administrador
 */
@Controller('categories')
@UseGuards(JwtAuthGuard) // Solo requiere autenticación a nivel de controlador
export class CategoryController {
  constructor(
    private readonly categoryService: CategoryService,
    private readonly logger: LoggerService
  ) {
    this.logger.setContext(CategoryController.name);
  }

  /**
   * Obtiene todas las categorías
   * @param activeOnly Filtrar solo categorías activas
   * @returns Lista de categorías
   */
  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll(@Query('activeOnly') activeOnly: boolean = true): Promise<ICategory[]> {
    // Por defecto, los estudiantes ven solo categorías activas
    this.logger.log(`Obteniendo todas las categorías. activeOnly=${activeOnly}`);
    return this.categoryService.findAll(activeOnly);
  }

  /**
   * Obtiene una categoría por su ID
   * @param id ID de la categoría
   * @returns Categoría encontrada
   */
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async findById(@Param('id') id: string): Promise<ICategory> {
    this.logger.log(`Obteniendo categoría con ID: ${id}`);
    return this.categoryService.findById(id);
  }

  /**
   * Crea una nueva categoría
   * @param createCategoryDto Datos para crear la categoría
   * @returns Categoría creada
   */
  @Post()
  @UseGuards(AdminAccessGuard) // Solo administradores pueden crear categorías
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createCategoryDto: CreateCategoryDto): Promise<ICategory> {
    this.logger.log(`Creando nueva categoría: ${createCategoryDto.name}`);
    return this.categoryService.create(createCategoryDto);
  }

  /**
   * Actualiza una categoría existente
   * @param id ID de la categoría a actualizar
   * @param updateData Datos para actualizar la categoría
   * @returns Categoría actualizada
   */
  @Put(':id')
  @UseGuards(AdminAccessGuard) // Solo administradores pueden actualizar categorías
  @HttpCode(HttpStatus.OK)
  async update(
    @Param('id') id: string,
    @Body() updateData: UpdateCategoryDto
  ): Promise<ICategory> {
    this.logger.log(`Actualizando categoría ${id}: ${JSON.stringify(updateData)}`);
    return this.categoryService.update(id, updateData);
  }

  /**
   * Elimina una categoría
   * @param id ID de la categoría a eliminar
   * @returns Mensaje de confirmación
   */
  @Delete(':id')
  @UseGuards(AdminAccessGuard) // Solo administradores pueden eliminar categorías
  @HttpCode(HttpStatus.OK)
  async delete(@Param('id') id: string): Promise<{ message: string }> {
    this.logger.log(`Eliminando categoría con ID: ${id}`);
    await this.categoryService.delete(id);
    return { message: 'Categoría eliminada con éxito' };
  }
}