// src/modules/roles/controllers/permission.controller.ts
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
  import { JwtAuthGuard } from '../../../shared/guards';
  import { PermissionService } from '../services';
  import { CreatePermissionDto, UpdatePermissionDto } from '../infra/model/dto';
  import { IPermission } from '../infra/model/interfaces';
  import { RolesGuard } from '../guards/roles.guard';
  import { RequirePermission } from '../decorators/require-permission.decorator';
  
  @Controller('permissions')
  @UseGuards(JwtAuthGuard, RolesGuard)
  export class PermissionController {
    private readonly logger = new Logger(PermissionController.name);
  
    constructor(private readonly permissionService: PermissionService) {}
  
    @Get()
    @RequirePermission('permissions:list')
    async findAll(@Query('activeOnly') activeOnly: boolean = false): Promise<IPermission[]> {
      return this.permissionService.findAll(activeOnly);
    }
  
    @Get('group/:group')
    @RequirePermission('permissions:list')
    async findByGroup(@Param('group') group: string): Promise<IPermission[]> {
      return this.permissionService.findByGroup(group);
    }
  
    @Get(':id')
    @RequirePermission('permissions:read')
    async findById(@Param('id') id: string): Promise<IPermission> {
      return this.permissionService.findById(id);
    }
  
    @Post()
    @RequirePermission('permissions:create')
    async create(@Body() createPermissionDto: CreatePermissionDto): Promise<IPermission> {
      return this.permissionService.create(createPermissionDto);
    }
  
    @Post('create-crud')
    @RequirePermission('permissions:create')
    async createCrudPermissions(
      @Body() body: { resource: string; description?: string }
    ): Promise<IPermission[]> {
      return this.permissionService.createCrudPermissions(body.resource, body.description);
    }
  
    @Put(':id')
    @RequirePermission('permissions:update')
    async update(
      @Param('id') id: string,
      @Body() updatePermissionDto: UpdatePermissionDto
    ): Promise<IPermission> {
      return this.permissionService.update(id, updatePermissionDto);
    }
  
    @Delete(':id')
    @RequirePermission('permissions:delete')
    async delete(@Param('id') id: string): Promise<{ message: string }> {
      await this.permissionService.delete(id);
      return { message: 'Permiso eliminado con éxito' };
    }
  }