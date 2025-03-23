// src/modules/study-goals/controllers/study-goal.controller.ts
import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Logger, InternalServerErrorException } from '@nestjs/common';
import { JwtAuthGuard } from '../../../common/guards';
import { StudyGoalService } from '../services';
import { CreateStudyGoalDto } from '../model/dto';
import { IStudyGoal } from '../model/interfaces';

@Controller('study-goals')
@UseGuards(JwtAuthGuard)
export class StudyGoalController {
  private readonly logger = new Logger(StudyGoalController.name);
  
  constructor(private readonly studyGoalService: StudyGoalService) {}

  @Get()
  async findAll(@Query('activeOnly') activeOnly: boolean = false): Promise<IStudyGoal[]> {
    this.logger.log(`Obteniendo todos los objetivos de estudio. activeOnly=${activeOnly}`);
    try {
      const goals = await this.studyGoalService.findAll(activeOnly);
      this.logger.log(`Encontrados ${goals.length} objetivos de estudio`);
      return goals;
    } catch (error) {
      this.logger.error(`Error al obtener objetivos de estudio: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Error al obtener objetivos de estudio', {
        cause: error,
        description: 'Ocurrió un error al intentar obtener los objetivos de estudio',
      });
    }
  }

  @Get('category/:categoryId')
  async findByCategory(@Param('categoryId') categoryId: string): Promise<IStudyGoal[]> {
    this.logger.log(`Obteniendo objetivos de estudio por categoría. categoryId=${categoryId}`);
    try {
      const goals = await this.studyGoalService.findByCategory(categoryId);
      this.logger.log(`Encontrados ${goals.length} objetivos de estudio para la categoría ${categoryId}`);
      return goals;
    } catch (error) {
      this.logger.error(`Error al obtener objetivos de estudio por categoría: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Error al obtener objetivos de estudio por categoría', {
        cause: error,
        description: `Ocurrió un error al intentar obtener los objetivos de estudio para la categoría ${categoryId}`,
      });
    }
  }

  @Get(':id')
  async findById(@Param('id') id: string): Promise<IStudyGoal> {
    this.logger.log(`Obteniendo objetivo de estudio por ID. id=${id}`);
    try {
      const goal = await this.studyGoalService.findById(id);
      this.logger.log(`Objetivo de estudio encontrado: ${goal.name}`);
      return goal;
    } catch (error) {
      this.logger.error(`Error al obtener objetivo de estudio por ID: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Error al obtener objetivo de estudio', {
        cause: error,
        description: `Ocurrió un error al intentar obtener el objetivo de estudio con ID ${id}`,
      });
    }
  }

  @Post()
  async create(@Body() createStudyGoalDto: CreateStudyGoalDto): Promise<IStudyGoal> {
    this.logger.log(`Creando nuevo objetivo de estudio: ${JSON.stringify(createStudyGoalDto)}`);
    try {
      const goal = await this.studyGoalService.create(createStudyGoalDto);
      this.logger.log(`Objetivo de estudio creado con ID: ${goal._id}`);
      return goal;
    } catch (error) {
      this.logger.error(`Error al crear objetivo de estudio: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Error al crear objetivo de estudio', {
        cause: error,
        description: 'Ocurrió un error al intentar crear el objetivo de estudio',
      });
    }
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateData: Partial<CreateStudyGoalDto>
  ): Promise<IStudyGoal> {
    this.logger.log(`Actualizando objetivo de estudio. id=${id}, data=${JSON.stringify(updateData)}`);
    try {
      const goal = await this.studyGoalService.update(id, updateData);
      this.logger.log(`Objetivo de estudio actualizado: ${goal.name}`);
      return goal;
    } catch (error) {
      this.logger.error(`Error al actualizar objetivo de estudio: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Error al actualizar objetivo de estudio', {
        cause: error,
        description: `Ocurrió un error al intentar actualizar el objetivo de estudio con ID ${id}`,
      });
    }
  }

  @Delete(':id')
  async delete(@Param('id') id: string): Promise<{ message: string }> {
    this.logger.log(`Eliminando objetivo de estudio. id=${id}`);
    try {
      await this.studyGoalService.delete(id);
      this.logger.log(`Objetivo de estudio eliminado con ID: ${id}`);
      return { message: 'Objetivo de estudio eliminado con éxito' };
    } catch (error) {
      this.logger.error(`Error al eliminar objetivo de estudio: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Error al eliminar objetivo de estudio', {
        cause: error,
        description: `Ocurrió un error al intentar eliminar el objetivo de estudio con ID ${id}`,
      });
    }
  }
}