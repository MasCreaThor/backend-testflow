import { Controller, Post, Body, UseGuards, HttpCode, HttpStatus, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../../../shared/guards/jwt-auth.guard';
import { CreateStudyGoalService } from '../services';
import { CreateStudyGoalDto } from '../model/dto';
import { IStudyGoal } from '../model/interfaces';
import { LoggerService } from '../../../shared/services/logger.service';

@Controller('study-goals')
@UseGuards(JwtAuthGuard)
export class CreateStudyGoalController {
  constructor(
    private readonly createStudyGoalService: CreateStudyGoalService,
    private readonly logger: LoggerService
  ) {
    this.logger.setContext(CreateStudyGoalController.name);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async handle(
    @Body() createStudyGoalDto: CreateStudyGoalDto,
    @Request() req // Añadir el objeto request para obtener el usuario
  ): Promise<IStudyGoal> {
    this.logger.log(`Creando nuevo objetivo de estudio: ${createStudyGoalDto.name}`);
    const userId = req.user._id; // Obtener el ID del usuario del token
    return this.createStudyGoalService.execute(createStudyGoalDto, userId);
  }
}