import { Controller, Get, Post, Put, Delete, Param, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { RequirePermission } from '../common/decorators/require-permission.decorator';

@ApiTags('Warehouse')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
@Controller('warehouse')
export class WarehouseController {
  @RequirePermission('warehouse:read')
  @Get()
  @ApiOperation({ summary: 'List warehouse records — warehouse_manager / admin' })
  @ApiResponse({ status: 200, description: 'Warehouse records returned' })
  @ApiResponse({ status: 403, description: 'Forbidden — requires warehouse:read' })
  findAll() {
    return { message: 'Warehouse Read Access Granted' };
  }

  @RequirePermission('warehouse:create')
  @Post()
  @ApiOperation({ summary: 'Create a warehouse record — warehouse_manager / admin' })
  @ApiResponse({ status: 201, description: 'Warehouse record created' })
  @ApiResponse({ status: 403, description: 'Forbidden — requires warehouse:create' })
  create() {
    return { message: 'Warehouse Create Access Granted' };
  }

  @RequirePermission('warehouse:update')
  @Put(':id')
  @ApiOperation({ summary: 'Update a warehouse record — warehouse_manager / admin' })
  @ApiParam({ name: 'id', description: 'Warehouse record ID' })
  @ApiResponse({ status: 200, description: 'Warehouse record updated' })
  @ApiResponse({ status: 403, description: 'Forbidden — requires warehouse:update' })
  update(@Param('id') id: string) {
    return { message: `Warehouse Update Access Granted for id=${id}` };
  }

  @RequirePermission('warehouse:delete')
  @Delete(':id')
  @ApiOperation({ summary: 'Delete a warehouse record — warehouse_manager / admin' })
  @ApiParam({ name: 'id', description: 'Warehouse record ID' })
  @ApiResponse({ status: 200, description: 'Warehouse record deleted' })
  @ApiResponse({ status: 403, description: 'Forbidden — requires warehouse:delete' })
  remove(@Param('id') id: string) {
    return { message: `Warehouse Delete Access Granted for id=${id}` };
  }
}
