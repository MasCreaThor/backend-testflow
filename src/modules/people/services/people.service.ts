// src/modules/people/services/people.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { PeopleRepository } from '../infra/repositories';
import { StudyGoalRepository } from '../../study-goals/infra/repositories';
import { CreatePeopleDto, UpdatePeopleDto } from '../model/dto';
import { IPeople } from '../model/interfaces';
import { 
  NotFoundException,
  BadRequestException,
  InternalServerErrorException 
} from '../../../common/exceptions/app-exception';
import { Helper } from '../../../common/utils';

@Injectable()
export class PeopleService {
  private readonly logger = new Logger(PeopleService.name);

  constructor(
    private readonly peopleRepository: PeopleRepository,
    private readonly studyGoalRepository: StudyGoalRepository,
  ) {}

  async findAll(): Promise<IPeople[]> {
    try {
      this.logger.debug('Finding all people profiles');
      const people = await this.peopleRepository.findAll();
      this.logger.debug(`Found ${people.length} people profiles`);
      return people;
    } catch (error) {
      this.logger.error(`Error finding all people: ${error.message}`, error.stack);
      throw new InternalServerErrorException(
        'Error interno al obtener los perfiles de personas',
        'FIND_ALL_PEOPLE_ERROR',
        { originalError: error.message }
      );
    }
  }

  async findById(id: string): Promise<IPeople> {
    try {
      this.logger.debug(`Finding person by ID: ${id}`);
      
      // Validate ID format
      if (!Helper.isValidObjectId(id)) {
        this.logger.warn(`Invalid person ID format: ${id}`);
        throw new BadRequestException(
          'ID de persona inválido',
          'INVALID_PERSON_ID'
        );
      }
      
      const person = await this.peopleRepository.findById(id);
      if (!person) {
        this.logger.warn(`Person with ID ${id} not found`);
        throw new NotFoundException(
          `Persona con ID ${id} no encontrada`,
          'PERSON_NOT_FOUND',
          { personId: id }
        );
      }
      
      this.logger.debug(`Person found with ID: ${id}`);
      return person;
    } catch (error) {
      // Re-throw AppExceptions
      if (error.name === 'AppException' || 
          error instanceof NotFoundException || 
          error instanceof BadRequestException) {
        throw error;
      }
      
      this.logger.error(`Error finding person by ID: ${error.message}`, error.stack);
      throw new InternalServerErrorException(
        'Error interno al buscar el perfil de persona',
        'FIND_PERSON_ERROR',
        { originalError: error.message, personId: id }
      );
    }
  }

  async findByUserId(userId: string): Promise<IPeople> {
    try {
      this.logger.debug(`Finding person by user ID: ${userId}`);
      
      // Validate ID format
      if (!Helper.isValidObjectId(userId)) {
        this.logger.warn(`Invalid user ID format: ${userId}`);
        throw new BadRequestException(
          'ID de usuario inválido',
          'INVALID_USER_ID'
        );
      }
      
      const person = await this.peopleRepository.findByUserId(userId);
      if (!person) {
        this.logger.warn(`Person with user ID ${userId} not found`);
        throw new NotFoundException(
          `Persona con ID de usuario ${userId} no encontrada`,
          'PERSON_NOT_FOUND_FOR_USER',
          { userId }
        );
      }
      
      this.logger.debug(`Person found for user ID: ${userId}`);
      return person;
    } catch (error) {
      // Re-throw AppExceptions
      if (error.name === 'AppException' || 
          error instanceof NotFoundException || 
          error instanceof BadRequestException) {
        throw error;
      }
      
      this.logger.error(`Error finding person by user ID: ${error.message}`, error.stack);
      throw new InternalServerErrorException(
        'Error interno al buscar el perfil de persona por usuario',
        'FIND_PERSON_BY_USER_ERROR',
        { originalError: error.message, userId }
      );
    }
  }

  async create(createPeopleDto: CreatePeopleDto): Promise<IPeople> {
    try {
      this.logger.log(`Creating person profile for user: ${createPeopleDto.userId}`);
      
      // Validate ID format
      if (!Helper.isValidObjectId(createPeopleDto.userId)) {
        this.logger.warn(`Invalid user ID format: ${createPeopleDto.userId}`);
        throw new BadRequestException(
          'ID de usuario inválido',
          'INVALID_USER_ID'
        );
      }
      
      // Validar objetivos de estudio si se proporcionan
      if (createPeopleDto.studyGoals && createPeopleDto.studyGoals.length > 0) {
        this.logger.debug(`Validating ${createPeopleDto.studyGoals.length} study goals`);
        
        // Check if all IDs are valid ObjectIds
        const invalidIds = createPeopleDto.studyGoals.filter(id => !Helper.isValidObjectId(id));
        if (invalidIds.length > 0) {
          this.logger.warn(`Invalid study goal IDs: ${invalidIds.join(', ')}`);
          throw new BadRequestException(
            'IDs de objetivos de estudio inválidos',
            'INVALID_STUDY_GOAL_IDS',
            { invalidIds }
          );
        }
        
        const validGoals = await this.studyGoalRepository.findByIds(createPeopleDto.studyGoals);
        
        if (validGoals.length !== createPeopleDto.studyGoals.length) {
          const foundIds = validGoals.map(goal => goal._id);
          const notFoundIds = createPeopleDto.studyGoals.filter(id => !foundIds.includes(id));
          
          this.logger.warn(`Some study goals not found: ${notFoundIds.join(', ')}`);
          throw new BadRequestException(
            'Algunos objetivos de estudio no son válidos',
            'INVALID_STUDY_GOALS',
            { notFoundIds }
          );
        }
      }
      
      const newPerson = await this.peopleRepository.create(createPeopleDto);
      this.logger.log(`Person profile created with ID: ${newPerson._id}`);
      return newPerson;
    } catch (error) {
      // Re-throw AppExceptions
      if (error.name === 'AppException' || 
          error instanceof BadRequestException) {
        throw error;
      }
      
      this.logger.error(`Error creating person: ${error.message}`, error.stack);
      throw new InternalServerErrorException(
        'Error interno al crear el perfil de persona',
        'CREATE_PERSON_ERROR',
        { originalError: error.message }
      );
    }
  }

  async update(id: string, updatePeopleDto: UpdatePeopleDto): Promise<IPeople> {
    try {
      this.logger.log(`Updating person profile with ID: ${id}`);
      
      // Validate ID format
      if (!Helper.isValidObjectId(id)) {
        this.logger.warn(`Invalid person ID format: ${id}`);
        throw new BadRequestException(
          'ID de persona inválido',
          'INVALID_PERSON_ID'
        );
      }
      
      // Validar objetivos de estudio si se proporcionan
      if (updatePeopleDto.studyGoals && updatePeopleDto.studyGoals.length > 0) {
        this.logger.debug(`Validating ${updatePeopleDto.studyGoals.length} study goals for update`);
        
        // Check if all IDs are valid ObjectIds
        const invalidIds = updatePeopleDto.studyGoals.filter(id => !Helper.isValidObjectId(id));
        if (invalidIds.length > 0) {
          this.logger.warn(`Invalid study goal IDs: ${invalidIds.join(', ')}`);
          throw new BadRequestException(
            'IDs de objetivos de estudio inválidos',
            'INVALID_STUDY_GOAL_IDS',
            { invalidIds }
          );
        }
        
        const validGoals = await this.studyGoalRepository.findByIds(updatePeopleDto.studyGoals);
        
        if (validGoals.length !== updatePeopleDto.studyGoals.length) {
          const foundIds = validGoals.map(goal => goal._id);
          const notFoundIds = updatePeopleDto.studyGoals.filter(id => !foundIds.includes(id));
          
          this.logger.warn(`Some study goals not found: ${notFoundIds.join(', ')}`);
          throw new BadRequestException(
            'Algunos objetivos de estudio no son válidos',
            'INVALID_STUDY_GOALS',
            { notFoundIds }
          );
        }
      }
      
      const updatedPerson = await this.peopleRepository.update(id, updatePeopleDto);
      if (!updatedPerson) {
        this.logger.warn(`Person with ID ${id} not found for update`);
        throw new NotFoundException(
          `Persona con ID ${id} no encontrada`,
          'PERSON_NOT_FOUND',
          { personId: id }
        );
      }
      
      this.logger.log(`Person profile updated successfully: ${id}`);
      return updatedPerson;
    } catch (error) {
      // Re-throw AppExceptions
      if (error.name === 'AppException' || 
          error instanceof NotFoundException || 
          error instanceof BadRequestException) {
        throw error;
      }
      
      this.logger.error(`Error updating person: ${error.message}`, error.stack);
      throw new InternalServerErrorException(
        'Error interno al actualizar el perfil de persona',
        'UPDATE_PERSON_ERROR',
        { originalError: error.message, personId: id }
      );
    }
  }

  async delete(id: string): Promise<void> {
    try {
      this.logger.log(`Deleting person profile with ID: ${id}`);
      
      // Validate ID format
      if (!Helper.isValidObjectId(id)) {
        this.logger.warn(`Invalid person ID format: ${id}`);
        throw new BadRequestException(
          'ID de persona inválido',
          'INVALID_PERSON_ID'
        );
      }
      
      const deletedPerson = await this.peopleRepository.delete(id);
      if (!deletedPerson) {
        this.logger.warn(`Person with ID ${id} not found for deletion`);
        throw new NotFoundException(
          `Persona con ID ${id} no encontrada`,
          'PERSON_NOT_FOUND',
          { personId: id }
        );
      }
      
      this.logger.log(`Person profile deleted successfully: ${id}`);
    } catch (error) {
      // Re-throw AppExceptions
      if (error.name === 'AppException' || 
          error instanceof NotFoundException || 
          error instanceof BadRequestException) {
        throw error;
      }
      
      this.logger.error(`Error deleting person: ${error.message}`, error.stack);
      throw new InternalServerErrorException(
        'Error interno al eliminar el perfil de persona',
        'DELETE_PERSON_ERROR',
        { originalError: error.message, personId: id }
      );
    }
  }
}