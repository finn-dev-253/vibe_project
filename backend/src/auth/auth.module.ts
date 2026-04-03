import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtStrategy } from './infrastructure/strategies/jwt.strategy';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserEntity } from '../infrastructure/database/entities/user.entity';
import { UserPermissionsMVEntity } from '../infrastructure/database/entities/user-permission-mv.entity';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: 'super-secret-key-for-now',
      signOptions: { expiresIn: '60m' },
    }),
    TypeOrmModule.forFeature([UserEntity, UserPermissionsMVEntity]),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
