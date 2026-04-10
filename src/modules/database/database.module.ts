import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ormConfig } from './ormconfig';

@Module({
  imports: [TypeOrmModule.forRootAsync(ormConfig)],
})
export class DatabaseModule {}
