import { ModuleMetadata, FactoryProvider } from '@nestjs/common';
import { RedisOptions } from 'ioredis';

export interface RedisModuleOptions extends RedisOptions {}

export interface RedisModuleAsyncOptions extends Pick<
  ModuleMetadata,
  'imports'
> {
  inject?: FactoryProvider['inject'];
  useFactory: (
    ...args: any[]
  ) => Promise<RedisModuleOptions> | RedisModuleOptions;
}
