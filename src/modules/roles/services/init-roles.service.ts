// src/modules/roles/services/init-roles.service.ts
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { FindRoleByNameService } from './find-role-by-name.service';
import { CreateRoleService } from './create-role.service';
import { UpdateRoleService } from './update-role.service';
import { PermissionService } from './permission.service';
import { UserRoleService } from './user-role.service';
import { IRole, IPermission } from '../infra/model/interfaces';

@Injectable()
export class InitRolesService implements OnModuleInit {
  private readonly logger = new Logger(InitRolesService.name);

  constructor(
    private readonly findRoleByNameService: FindRoleByNameService,
    private readonly createRoleService: CreateRoleService,
    private readonly updateRoleService: UpdateRoleService,
    private readonly permissionService: PermissionService,
    private readonly userRoleService: UserRoleService,
  ) {}

  /**
   * Se ejecuta automáticamente al iniciar la aplicación
   */
  async onModuleInit() {
    this.logger.log('Inicializando roles y permisos del sistema...');
    
    try {
      // Crear permisos para cada recurso
      await this.createResourcePermissions();
      
      // Crear roles por defecto
      await this.createDefaultRoles();
      
      this.logger.log('Inicialización de roles y permisos completada con éxito');
    } catch (error) {
      this.logger.error(`Error durante la inicialización de roles: ${error.message}`, error.stack);
    }
  }

  /**
   * Crea permisos CRUD para todos los recursos del sistema
   */
  private async createResourcePermissions(): Promise<void> {
    // Lista de recursos para los que crearemos permisos
    const resources = [
      { name: 'users', description: 'Gestión de usuarios' },
      { name: 'roles', description: 'Gestión de roles' },
      { name: 'permissions', description: 'Gestión de permisos' },
      { name: 'user-roles', description: 'Asignación de roles a usuarios' },
      { name: 'people', description: 'Perfiles de personas' },
      { name: 'categories', description: 'Categorías' },
      { name: 'study-goals', description: 'Objetivos de estudio' },
      { name: 'documents', description: 'Documentos' },
      { name: 'quizzes', description: 'Cuestionarios' },
      { name: 'questions', description: 'Preguntas' },
      { name: 'study-sessions', description: 'Sesiones de estudio' },
    ];
    
    for (const resource of resources) {
      try {
        this.logger.log(`Creando permisos para recurso: ${resource.name}`);
        await this.permissionService.createCrudPermissions(resource.name, resource.description);
      } catch (error) {
        this.logger.error(`Error creando permisos para ${resource.name}: ${error.message}`);
      }
    }
    
    // Permisos adicionales específicos
    const additionalPermissions = [
      { name: 'admin:access', description: 'Acceso a funciones de administración', group: 'admin' },
      { name: 'dashboard:view', description: 'Ver dashboard', group: 'dashboard' },
      { name: 'dashboard:analytics', description: 'Ver analíticas en dashboard', group: 'dashboard' },
      { name: 'system:settings', description: 'Configuración del sistema', group: 'system' },
    ];
    
    for (const permission of additionalPermissions) {
      try {
        // Verificar si ya existe
        try {
          await this.permissionService.findByName(permission.name);
          // Si no lanza excepción, ya existe
          continue;
        } catch (error) {
          // No existe, crearlo
          await this.permissionService.create(permission);
          this.logger.log(`Permiso creado: ${permission.name}`);
        }
      } catch (error) {
        this.logger.error(`Error creando permiso ${permission.name}: ${error.message}`);
      }
    }
  }

  /**
   * Crea roles por defecto del sistema
   */
  private async createDefaultRoles(): Promise<void> {
    // Obtener todos los permisos creados
    const allPermissions = await this.permissionService.findAll();
    const permissionNames = allPermissions.map(p => p.name);
    
    // Crear rol de administrador
    try {
      let adminRole: IRole;
      
      try {
        adminRole = await this.findRoleByNameService.execute('admin');
        this.logger.log('Rol de administrador ya existe, actualizando permisos...');
        
        // Actualizar con todos los permisos
        await this.updateRoleService.execute(adminRole._id, {
          permissions: permissionNames,
          description: 'Acceso completo al sistema',
        });
      } catch (error) {
        // Crear rol de administrador con todos los permisos
        adminRole = await this.createRoleService.execute({
          name: 'admin',
          description: 'Acceso completo al sistema',
          permissions: permissionNames,
        });
        
        this.logger.log('Rol de administrador creado con éxito');
      }
    } catch (error) {
      this.logger.error(`Error configurando rol de administrador: ${error.message}`);
    }
    
    // Crear rol de usuario
    try {
      let userRole: IRole;
      
      // Permisos básicos para usuarios normales
      const userPermissions = [
        // Perfil de usuario
        'people:read',
        'people:update',
        // Documentos propios
        'documents:create',
        'documents:read',
        'documents:update',
        'documents:delete',
        'documents:list',
        // Cuestionarios propios
        'quizzes:create',
        'quizzes:read',
        'quizzes:update',
        'quizzes:delete',
        'quizzes:list',
        // Sesiones de estudio
        'study-sessions:create',
        'study-sessions:read',
        'study-sessions:list',
      ];
      
      try {
        userRole = await this.findRoleByNameService.execute('user');
        this.logger.log('Rol de usuario ya existe, actualizando permisos...');
        
        // Actualizar permisos de usuario
        await this.updateRoleService.execute(userRole._id, {
          permissions: userPermissions,
          description: 'Usuario regular del sistema',
        });
      } catch (error) {
        // Crear rol de usuario
        userRole = await this.createRoleService.execute({
          name: 'user',
          description: 'Usuario regular del sistema',
          permissions: userPermissions,
        });
        
        this.logger.log('Rol de usuario creado con éxito');
      }
    } catch (error) {
      this.logger.error(`Error configurando rol de usuario: ${error.message}`);
    }
    
    // Crear rol de profesor/instructor
    try {
      let instructorRole: IRole;
      
      // Permisos para instructores
      const instructorPermissions = [
        // Todos los permisos de usuario normal
        'people:read',
        'people:update',
        'documents:create',
        'documents:read',
        'documents:update',
        'documents:delete',
        'documents:list',
        'quizzes:create',
        'quizzes:read',
        'quizzes:update',
        'quizzes:delete',
        'quizzes:list',
        'study-sessions:create',
        'study-sessions:read',
        'study-sessions:list',
        // Permisos adicionales
        'categories:create',
        'categories:read',
        'categories:update',
        'categories:list',
        'study-goals:create',
        'study-goals:read',
        'study-goals:update',
        'study-goals:list',
        'questions:create',
        'questions:read',
        'questions:update',
        'questions:list',
        'dashboard:view',
      ];
      
      try {
        instructorRole = await this.findRoleByNameService.execute('instructor');
        this.logger.log('Rol de instructor ya existe, actualizando permisos...');
        
        // Actualizar permisos
        await this.updateRoleService.execute(instructorRole._id, {
          permissions: instructorPermissions,
          description: 'Instructor o profesor con acceso a funciones adicionales',
        });
      } catch (error) {
        // Crear rol de instructor
        instructorRole = await this.createRoleService.execute({
          name: 'instructor',
          description: 'Instructor o profesor con acceso a funciones adicionales',
          permissions: instructorPermissions,
        });
        
        this.logger.log('Rol de instructor creado con éxito');
      }
    } catch (error) {
      this.logger.error(`Error configurando rol de instructor: ${error.message}`);
    }
    
    // Opcionalmente: Crear otros roles específicos según necesidades
    try {
      let contentManagerRole: IRole;
      
      // Permisos para gestor de contenido
      const contentManagerPermissions = [
        // Permisos específicos para gestión de contenido
        'categories:create',
        'categories:read',
        'categories:update',
        'categories:delete',
        'categories:list',
        'study-goals:create',
        'study-goals:read',
        'study-goals:update',
        'study-goals:delete',
        'study-goals:list',
        'documents:read',
        'documents:list',
        'quizzes:read',
        'quizzes:list',
        'questions:create',
        'questions:read',
        'questions:update',
        'questions:delete',
        'questions:list',
      ];
      
      try {
        contentManagerRole = await this.findRoleByNameService.execute('content-manager');
        this.logger.log('Rol de gestor de contenido ya existe, actualizando permisos...');
        
        // Actualizar permisos
        await this.updateRoleService.execute(contentManagerRole._id, {
          permissions: contentManagerPermissions,
          description: 'Gestor de contenido educativo',
        });
      } catch (error) {
        // Crear rol de gestor de contenido
        contentManagerRole = await this.createRoleService.execute({
          name: 'content-manager',
          description: 'Gestor de contenido educativo',
          permissions: contentManagerPermissions,
        });
        
        this.logger.log('Rol de gestor de contenido creado con éxito');
      }
    } catch (error) {
      this.logger.error(`Error configurando rol de gestor de contenido: ${error.message}`);
    }
  }

  /**
   * Asigna el rol de admin al primer usuario (opcional)
   * Puede ser útil para crear un admin por defecto
   */
  async assignAdminToFirstUser(userId: string): Promise<boolean> {
    try {
      // Buscar rol de admin
      const adminRole = await this.findRoleByNameService.execute('admin');
      
      // Asignar al usuario
      await this.userRoleService.assignRole({
        userId,
        roleId: adminRole._id,
      });
      
      this.logger.log(`Rol de administrador asignado al usuario ${userId}`);
      return true;
    } catch (error) {
      this.logger.error(`Error asignando rol de administrador: ${error.message}`);
      return false;
    }
  }
}