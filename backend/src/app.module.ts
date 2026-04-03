import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { RedisModule } from './infrastructure/redis/redis.module';
import { UserEntity } from './infrastructure/database/entities/user.entity';
import { RoleEntity } from './infrastructure/database/entities/role.entity';
import { PermissionEntity } from './infrastructure/database/entities/permission.entity';
import { UserPermissionsMVEntity } from './infrastructure/database/entities/user-permission-mv.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'postgres',
      database: 'logistic_system',
      entities: [
        UserEntity,
        RoleEntity,
        PermissionEntity,
        UserPermissionsMVEntity,
      ],
      synchronize: true, // Only for development/demo
    }),
    AuthModule,
    RedisModule.forRoot({
      host: 'localhost',
      port: 6379,
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
