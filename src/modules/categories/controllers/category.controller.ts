// src/modules/categories/controllers/category.controller.ts
import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../../common/guards';
import { CategoryService } from '../services/category.service';
import { CreateCategoryDto } from '../model/dto/create-category.dto';
import { ICategory } from '../model/interfaces/category.interface';
import { AdminAccessGuard } from '../../roles/guards/admin-access.guard'; // Import the new guard

@Controller('categories')
@UseGuards(JwtAuthGuard, AdminAccessGuard) // Add AdminAccessGuard to ensure only admins can access
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Get()
  async findAll(@Query('activeOnly') activeOnly: boolean = false): Promise<ICategory[]> {
    return this.categoryService.findAll(activeOnly);
  }

  @Get(':id')
  async findById(@Param('id') id: string): Promise<ICategory> {
    return this.categoryService.findById(id);
  }

  @Post()
  async create(@Body() createCategoryDto: CreateCategoryDto): Promise<ICategory> {
    return this.categoryService.create(createCategoryDto);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateData: Partial<CreateCategoryDto>
  ): Promise<ICategory> {
    return this.categoryService.update(id, updateData);
  }

  @Delete(':id')
  async delete(@Param('id') id: string): Promise<{ message: string }> {
    await this.categoryService.delete(id);
    return { message: 'Categoría eliminada con éxito' };
  }
}