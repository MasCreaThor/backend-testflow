// src/modules/roles/controllers/role.controller.ts
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
    Logger 
  } from '@nestjs/common';
  import { JwtAuthGuard } from '../../../common/guards';
  import { RoleService } from '../services';
  import { CreateRoleDto, UpdateRoleDto } from '../infra/model/dto';
  import { IRole } from '../infra/model/interfaces';
  import { RolesGuard } from '../guards/roles.guard';
  import { RequirePermission } from '../decorators/require-permission.decorator';
  
  @Controller('roles')
  @UseGuards(JwtAuthGuard, RolesGuard)
  export class RoleController {
    private readonly logger = new Logger(RoleController.name);
  
    constructor(private readonly roleService: RoleService) {}
  
    @Get()
    @RequirePermission('roles:list')
    async findAll(@Query('activeOnly') activeOnly: boolean = false): Promise<IRole[]> {
      return this.roleService.findAll(activeOnly);
    }
  
    @Get(':id')
    @RequirePermission('roles:read')
    async findById(@Param('id') id: string): Promise<IRole> {
      return this.roleService.findById(id);
    }
  
    @Post()
    @RequirePermission('roles:create')
    async create(@Body() createRoleDto: CreateRoleDto): Promise<IRole> {
      return this.roleService.create(createRoleDto);
    }
  
    @Put(':id')
    @RequirePermission('roles:update')
    async update(
      @Param('id') id: string,
      @Body() updateRoleDto: UpdateRoleDto
    ): Promise<IRole> {
      return this.roleService.update(id, updateRoleDto);
    }
  
    @Delete(':id')
    @RequirePermission('roles:delete')
    async delete(@Param('id') id: string): Promise<{ message: string }> {
      await this.roleService.delete(id);
      return { message: 'Rol eliminado con éxito' };
    }
  
    @Post(':id/permissions/:permissionName')
    @RequirePermission('roles:update')
    async addPermission(
      @Param('id') id: string,
      @Param('permissionName') permissionName: string
    ): Promise<IRole> {
      return this.roleService.addPermission(id, permissionName);
    }
  
    @Delete(':id/permissions/:permissionName')
    @RequirePermission('roles:update')
    async removePermission(
      @Param('id') id: string,
      @Param('permissionName') permissionName: string
    ): Promise<IRole> {
      return this.roleService.removePermission(id, permissionName);
    }
  }