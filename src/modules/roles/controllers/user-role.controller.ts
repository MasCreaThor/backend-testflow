// src/modules/roles/controllers/user-role.controller.ts
import { 
    Controller, 
    Get, 
    Post, 
    Delete, 
    Body, 
    Param, 
    UseGuards, 
    Logger, 
    Req 
  } from '@nestjs/common';
  import { JwtAuthGuard } from '../../../shared/guards';
  import { UserRoleService } from '../services';
  import { AssignRoleDto } from '../infra/model/dto';
  import { IUserRole } from '../infra/model/interfaces';
  import { RolesGuard } from '../guards/roles.guard';
  import { RequirePermission } from '../decorators/require-permission.decorator';
  
  @Controller('user-roles')
  @UseGuards(JwtAuthGuard, RolesGuard)
  export class UserRoleController {
    private readonly logger = new Logger(UserRoleController.name);
  
    constructor(private readonly userRoleService: UserRoleService) {}
  
    @Get()
    @RequirePermission('user-roles:list')
    async findAll(): Promise<IUserRole[]> {
      return this.userRoleService.findAll();
    }
  
    @Get(':id')
    @RequirePermission('user-roles:read')
    async findById(@Param('id') id: string): Promise<IUserRole> {
      return this.userRoleService.findById(id);
    }
  
    @Get('user/:userId')
    @RequirePermission('user-roles:read')
    async findByUser(@Param('userId') userId: string): Promise<IUserRole[]> {
      return this.userRoleService.findByUser(userId);
    }
  
    @Post()
    @RequirePermission('user-roles:create')
    async assignRole(@Body() assignRoleDto: AssignRoleDto, @Req() req): Promise<IUserRole> {
      // Crear un nuevo objeto con los datos del DTO y añadir el ID del administrador
      const roleAssignment = {
        ...assignRoleDto,
        grantedBy: assignRoleDto.grantedBy || req.user._id
      };
      
      return this.userRoleService.assignRole(roleAssignment);
    }
  
    @Delete('user/:userId/role/:roleId')
    @RequirePermission('user-roles:delete')
    async removeRole(
      @Param('userId') userId: string,
      @Param('roleId') roleId: string
    ): Promise<{ success: boolean; message: string }> {
      const result = await this.userRoleService.removeRole(userId, roleId);
      return {
        success: result,
        message: result ? 'Rol removido con éxito' : 'No se pudo remover el rol'
      };
    }
  
    @Delete(':id')
    @RequirePermission('user-roles:delete')
    async delete(@Param('id') id: string): Promise<{ message: string }> {
      await this.userRoleService.delete(id);
      return { message: 'Asignación de rol eliminada con éxito' };
    }
  }