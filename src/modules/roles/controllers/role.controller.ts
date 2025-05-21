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
import { JwtAuthGuard } from '../../../shared/guards';
import { 
  FindAllRolesService,
  FindRoleByIdService,
  CreateRoleService,
  UpdateRoleService,
  DeleteRoleService,
  AddPermissionToRoleService,
  RemovePermissionFromRoleService
} from '../services';
import { CreateRoleDto, UpdateRoleDto } from '../infra/model/dto';
import { IRole } from '../infra/model/interfaces';
import { RolesGuard } from '../guards/roles.guard';
import { RequirePermission } from '../decorators/require-permission.decorator';

@Controller('roles')
@UseGuards(JwtAuthGuard, RolesGuard)
export class RoleController {
  private readonly logger = new Logger(RoleController.name);

  constructor(
    private readonly findAllRolesService: FindAllRolesService,
    private readonly findRoleByIdService: FindRoleByIdService,
    private readonly createRoleService: CreateRoleService,
    private readonly updateRoleService: UpdateRoleService,
    private readonly deleteRoleService: DeleteRoleService,
    private readonly addPermissionToRoleService: AddPermissionToRoleService,
    private readonly removePermissionFromRoleService: RemovePermissionFromRoleService
  ) {}

  @Get()
  @RequirePermission('roles:list')
  async findAll(@Query('activeOnly') activeOnly: boolean = false): Promise<IRole[]> {
    return this.findAllRolesService.execute(activeOnly);
  }

  @Get(':id')
  @RequirePermission('roles:read')
  async findById(@Param('id') id: string): Promise<IRole> {
    return this.findRoleByIdService.execute(id);
  }

  @Post()
  @RequirePermission('roles:create')
  async create(@Body() createRoleDto: CreateRoleDto): Promise<IRole> {
    return this.createRoleService.execute(createRoleDto);
  }

  @Put(':id')
  @RequirePermission('roles:update')
  async update(
    @Param('id') id: string,
    @Body() updateRoleDto: UpdateRoleDto
  ): Promise<IRole> {
    return this.updateRoleService.execute(id, updateRoleDto);
  }

  @Delete(':id')
  @RequirePermission('roles:delete')
  async delete(@Param('id') id: string): Promise<{ message: string }> {
    await this.deleteRoleService.execute(id);
    return { message: 'Rol eliminado con éxito' };
  }

  @Post(':id/permissions/:permissionName')
  @RequirePermission('roles:update')
  async addPermission(
    @Param('id') id: string,
    @Param('permissionName') permissionName: string
  ): Promise<IRole> {
    return this.addPermissionToRoleService.execute(id, permissionName);
  }

  @Delete(':id/permissions/:permissionName')
  @RequirePermission('roles:update')
  async removePermission(
    @Param('id') id: string,
    @Param('permissionName') permissionName: string
  ): Promise<IRole> {
    return this.removePermissionFromRoleService.execute(id, permissionName);
  }
}