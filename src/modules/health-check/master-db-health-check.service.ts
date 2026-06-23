import { MasterCircuitBreakerService } from '@/database/circuit-breaker/master-circuit-breaker.service';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class MasterDbHealthCheckService implements OnModuleInit {
  private readonly logger = new Logger(MasterDbHealthCheckService.name);

  constructor(
    private readonly dataSource: DataSource,
    private readonly breaker: MasterCircuitBreakerService,
  ) {}
  onModuleInit(): void {
    setInterval(() => this.checkMasterDbHealth(), 10000);
  }

  private async checkMasterDbHealth(): Promise<void> {
    const qr = this.dataSource.createQueryRunner('master');

    try {
      await qr.connect();

      await qr.query('SELECT 1');

      this.breaker.onSuccess();
    } catch (error) {
      this.breaker.onFailure(error);

      this.logger.error('Failed to check master database health', error instanceof Error ? error.stack : undefined);
    } finally {
      await qr.release();
    }
  }
}
