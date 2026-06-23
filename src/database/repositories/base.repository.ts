import { DataSource, ObjectLiteral, Repository } from 'typeorm';

import { PrimaryDbUnavailableException } from '@/common/errors/primary-db-unavailable.error';
import { isDatabaseConnectionError } from '../circuit-breaker/database-connection-error';
import { MasterCircuitBreakerService } from '../circuit-breaker/master-circuit-breaker.service';
import { ReplicaCircuitBreakerService } from '../circuit-breaker/replica-circuit-breaker.service';
import { isReplicaConnectionError } from '../circuit-breaker/replica-connection-error';
import { ReadConsistency } from '../enums/read-consistency.enum';
import { RepositoryOptions } from '../interfaces/repository-options.interface';

export abstract class BaseRepository<T extends ObjectLiteral> {
  private readonly replicateBreaker: ReplicaCircuitBreakerService;
  private readonly masterBreaker: MasterCircuitBreakerService;

  protected constructor(protected readonly dataSource: DataSource) {
    this.replicateBreaker = new ReplicaCircuitBreakerService();
    this.masterBreaker = new MasterCircuitBreakerService();
  }

  protected async withRepository<R>(
    entity: new () => T,
    options: RepositoryOptions | undefined,
    work: (repo: Repository<T>) => Promise<R>,
  ): Promise<R> {
    const mode = this.resolveReplicationMode(options);

    try {
      return await this.executeWithMode(entity, mode, work);
    } catch (error) {
      if (mode === 'slave' && this.shouldFallbackToMaster(error)) {
        this.replicateBreaker.onFailure(error);

        return this.executeWithMode(entity, 'master', work);
      }

      throw error;
    }
  }

  private async executeWithMode<R>(
    entity: new () => T,
    mode: 'master' | 'slave',
    work: (repo: Repository<T>) => Promise<R>,
  ): Promise<R> {
    const queryRunner = this.dataSource.createQueryRunner(mode);

    try {
      if (mode === 'master') {
        this.masterBreaker.assertCanExecute();
      }

      await queryRunner.connect();
      const repository = queryRunner.manager.getRepository(entity);

      const result = await work(repository);

      if (mode === 'slave') {
        this.replicateBreaker.onSuccess();
      } else {
        this.masterBreaker.onSuccess();
      }
      return result;
    } catch (error) {
      if (mode === 'master' && isDatabaseConnectionError(error)) {
        this.masterBreaker.onFailure(error);
        throw new PrimaryDbUnavailableException();
      }

      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  protected async withMasterRepository<R>(entity: new () => T, work: (repo: Repository<T>) => Promise<R>): Promise<R> {
    return this.executeWithMode(entity, 'master', work);
  }

  private resolveReplicationMode(options?: RepositoryOptions): 'master' | 'slave' {
    if (options?.consistency === ReadConsistency.STRONG) {
      return 'master';
    }

    if (!this.replicateBreaker.canExecute()) {
      return 'master';
    }

    return 'slave';
  }

  private shouldFallbackToMaster(error: unknown): boolean {
    if (isReplicaConnectionError(error)) {
      return true;
    }

    const message = error instanceof Error ? error.message : String(error);
    return message.includes('Connection terminated') || message.includes('connection timeout');
  }
}
