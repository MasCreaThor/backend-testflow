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
    // SOLUCIÓN: NO ejecutar en producción ni en Vercel
    if (process.env.NODE_ENV === 'production' || 
        process.env.VERCEL || 
        process.env.VERCEL_ENV) {
      this.logger.log('Skipping roles initialization in production/Vercel environment');
      return;
    }
    
    // SOLUCIÓN: Agregar timeout para evitar bloqueos
    const timeoutId = setTimeout(() => {
      this.logger.warn('Roles initialization is taking too long, skipping...');
      return;
    }, 10000); // 10 segundos máximo
    
    this.logger.log('Inicializando roles y permisos del sistema...');
    
    try {
      // Crear permisos para cada recurso
      await this.createResourcePermissions();
      
      // Crear roles por defecto
      await this.createDefaultRoles();
      
      clearTimeout(timeoutId);
      this.logger.log('Inicialización de roles y permisos completada con éxito');
    } catch (error) {
      clearTimeout(timeoutId);
      this.logger.error(`Error durante la inicialización de roles: ${error.message}`, error.stack);
    }
  }

  /**
   * Método público para inicializar manualmente (útil para desarrollo)
   */
  async initializeManually(): Promise<void> {
    this.logger.log('Inicialización manual de roles y permisos...');
    
    try {
      await this.createResourcePermissions();
      await this.createDefaultRoles();
      this.logger.log('Inicialización manual completada con éxito');
    } catch (error) {
      this.logger.error(`Error en inicialización manual: ${error.message}`, error.stack);
      throw error;
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
        // Objetivos de estudio
        'study-goals:create',
        'study-goals:read',
        'study-goals:update',
        'study-goals:delete',
        'study-goals:list',
        // Categorías (solo lectura)
        'categories:read',
        'categories:list',
        // Dashboard
        'dashboard:view',
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
  }

  /**
   * Asigna el rol de admin al primer usuario (útil para desarrollo)
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