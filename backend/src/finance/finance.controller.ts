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

@ApiTags('Finance')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
@Controller('finance')
export class FinanceController {
  @RequirePermission('finance:read')
  @Get()
  @ApiOperation({ summary: 'List finance records — finance_manager / admin' })
  @ApiResponse({ status: 200, description: 'Finance records returned' })
  @ApiResponse({ status: 403, description: 'Forbidden — requires finance:read' })
  findAll() {
    return { message: 'Finance Read Access Granted' };
  }

  @RequirePermission('finance:create')
  @Post()
  @ApiOperation({ summary: 'Create a finance record — finance_manager / admin' })
  @ApiResponse({ status: 201, description: 'Finance record created' })
  @ApiResponse({ status: 403, description: 'Forbidden — requires finance:create' })
  create() {
    return { message: 'Finance Create Access Granted' };
  }

  @RequirePermission('finance:update')
  @Put(':id')
  @ApiOperation({ summary: 'Update a finance record — finance_manager / admin' })
  @ApiParam({ name: 'id', description: 'Finance record ID' })
  @ApiResponse({ status: 200, description: 'Finance record updated' })
  @ApiResponse({ status: 403, description: 'Forbidden — requires finance:update' })
  update(@Param('id') id: string) {
    return { message: `Finance Update Access Granted for id=${id}` };
  }

  @RequirePermission('finance:delete')
  @Delete(':id')
  @ApiOperation({ summary: 'Delete a finance record — finance_manager / admin' })
  @ApiParam({ name: 'id', description: 'Finance record ID' })
  @ApiResponse({ status: 200, description: 'Finance record deleted' })
  @ApiResponse({ status: 403, description: 'Forbidden — requires finance:delete' })
  remove(@Param('id') id: string) {
    return { message: `Finance Delete Access Granted for id=${id}` };
  }
}
