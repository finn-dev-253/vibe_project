import {
  Controller,
  Get,
  Patch,
  Param,
  Body,
  UseGuards,
  Request,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { RequirePermission } from '../common/decorators/require-permission.decorator';
import { AssetsService } from './assets.service';

@ApiTags('Assets')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
@Controller('assets')
export class AssetsController {
  constructor(private readonly assetsService: AssetsService) {}

  @RequirePermission('customer:assets:read')
  @Get('my')
  @ApiOperation({ summary: 'Get own assets — Customer role' })
  @ApiResponse({ status: 200, description: 'Returns assets owned by the authenticated customer' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden — requires customer:assets:read' })
  getMyAssets(@Request() req: any) {
    return this.assetsService.getMyAssets(req.user.id as string);
  }

  @RequirePermission('customer:assets:update')
  @Patch('my/:id')
  @ApiOperation({ summary: 'Update an own asset — Customer role' })
  @ApiParam({ name: 'id', description: 'Asset ID to update' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', example: 'Updated Vehicle Fleet' },
        value: { type: 'number', example: 180000 },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Asset updated successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden — asset does not belong to user or missing permission' })
  @ApiResponse({ status: 404, description: 'Asset not found' })
  updateMyAsset(
    @Request() req: any,
    @Param('id') id: string,
    @Body() body: { name?: string; value?: number },
  ) {
    const updated = this.assetsService.updateMyAsset(req.user.id as string, id, body);
    if (updated === null) {
      throw new NotFoundException(`Asset ${id} not found or does not belong to you`);
    }
    return updated;
  }

  @RequirePermission('system:admin')
  @Get()
  @ApiOperation({ summary: 'Get all customer assets — Admin only' })
  @ApiResponse({ status: 200, description: 'Returns all assets across all customers' })
  @ApiResponse({ status: 403, description: 'Forbidden — requires system:admin' })
  getAllAssets() {
    return this.assetsService.getAllAssets();
  }
}
