import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MasterDbHealthCheckService } from './master-db-health-check.service';

@Module({
  imports: [TypeOrmModule.forFeature([MasterDbHealthCheckService])],
  providers: [MasterDbHealthCheckService],
  exports: [MasterDbHealthCheckService],
})
export class HealthCheckModule {}
