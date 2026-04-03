import { DynamicModule, Module, Provider, Global } from '@nestjs/common';
import Redis from 'ioredis';
import { REDIS_CLIENT, REDIS_MODULE_OPTIONS } from './redis.constants';
import { RedisModuleAsyncOptions, RedisModuleOptions } from './redis.interfaces';
import { RedisService } from './redis.service';

@Global()
@Module({})
export class RedisModule {
  static forRoot(options: RedisModuleOptions): DynamicModule {
    const optionsProvider: Provider = {
      provide: REDIS_MODULE_OPTIONS,
      useValue: options,
    };

    const redisProvider: Provider = {
      provide: REDIS_CLIENT,
      useFactory: (opts: RedisModuleOptions) => {
        return new Redis(opts);
      },
      inject: [REDIS_MODULE_OPTIONS],
    };

    return {
      module: RedisModule,
      providers: [optionsProvider, redisProvider, RedisService],
      exports: [RedisService],
    };
  }

  static forRootAsync(options: RedisModuleAsyncOptions): DynamicModule {
    const asyncOptionsProvider: Provider = {
      provide: REDIS_MODULE_OPTIONS,
      useFactory: options.useFactory,
      inject: options.inject || [],
    };

    const redisProvider: Provider = {
      provide: REDIS_CLIENT,
      useFactory: (opts: RedisModuleOptions) => {
        return new Redis(opts);
      },
      inject: [REDIS_MODULE_OPTIONS],
    };

    return {
      module: RedisModule,
      imports: options.imports || [],
      providers: [asyncOptionsProvider, redisProvider, RedisService],
      exports: [RedisService],
    };
  }
}
