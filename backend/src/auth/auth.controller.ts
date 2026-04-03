import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RequirePermission } from '../common/decorators/require-permission.decorator';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { AuthGuard } from '@nestjs/passport';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() body: { email: string }) {
    return this.authService.login(body.email);
  }

  @UseGuards(AuthGuard('jwt'), PermissionsGuard)
  @RequirePermission('admin:roles:view')
  @Get('protected-roles')
  getRoles(@Request() req: any) {
    return {
      message: 'You have access to this protected admin roles endpoint.',
      user: req.user,
    };
  }
}
