// src/modules/admin/services/admin.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { UserRepository } from '../../users/infra/repositories';
import { CategoryRepository } from '../../categories/infra/repositories';
import { FindAllRolesService } from '../../roles/services/find-all-roles.service';

@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);

  constructor(
    private readonly userRepository: UserRepository,
    private readonly categoryRepository: CategoryRepository,
    private readonly findAllRolesService: FindAllRolesService,
  ) {}

  async getStats() {
    try {
      // numero de usuarios
      const users = await this.userRepository.findAll();

      // número de roles
      const roles = await this.findAllRolesService.execute();

      const categories = await this.categoryRepository.findAll();
      
      // Por ahora, estos valores son ficticios ya que no tenemos esos modulos implementados todavía
      const documents = 0;
      const quizzes = 0;
      
      return {
        users: users.length,
        roles: roles.length,
        categories: categories.length,
        documents,
        quizzes,
      };
    } catch (error) {
      this.logger.error(`Error al obtener estadísticas: ${error.message}`, error.stack);
      
      // devolver valores predeterminados para evitar que el frontend mande error ya que nos hace falta los modulos correspondientes de algunos
      return {
        users: 0,
        roles: 0,
        categories: 0,
        documents: 0,
        quizzes: 0,
      };
    }
  }
}