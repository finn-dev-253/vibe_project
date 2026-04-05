import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RequirePermission } from '../common/decorators/require-permission.decorator';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { AuthGuard } from '@nestjs/passport';
import { LoginDto } from './dto/login.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Login — returns a signed JWT',
    description:
      'Authenticate with email + password. Use the returned `access_token` as a Bearer token on protected endpoints.',
  })
  @ApiResponse({
    status: 200,
    description: 'JWT access token issued',
    schema: {
      example: {
        access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Validation error (invalid email / missing fields)' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(@Body() body: LoginDto) {
    return this.authService.login(body.email, body.password);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), PermissionsGuard)
  @RequirePermission('admin:roles:view')
  @Get('protected-roles')
  @ApiOperation({
    summary: 'List roles — Admin only',
    description: 'Requires the `admin:roles:view` permission (admin role).',
  })
  @ApiResponse({ status: 200, description: 'Returns the authenticated user object with roles & permissions' })
  @ApiResponse({ status: 401, description: 'Missing or invalid token' })
  @ApiResponse({ status: 403, description: 'Forbidden — requires admin:roles:view' })
  getRoles(@Request() req: any) {
    return {
      message: 'You have access to this protected admin roles endpoint.',
      user: req.user,
    };
  }
}
