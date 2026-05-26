import { Logger } from '@nestjs/common';
import { DataSource, ObjectLiteral, Repository } from 'typeorm';

import { ReplicaCircuitBreakerService } from '../circuit-breaker/replica-circuit-breaker.service';
import { isReplicaConnectionError } from '../circuit-breaker/replica-connection-error';
import { ReadConsistency } from '../enums/read-consistency.enum';
import { RepositoryOptions } from '../interfaces/repository-options.interface';

export abstract class BaseRepository<T extends ObjectLiteral> {
    private readonly logger = new Logger(BaseRepository.name);

    protected constructor(
        protected readonly dataSource: DataSource,
        protected readonly circuitBreaker: ReplicaCircuitBreakerService,
    ) { }

    protected async withRepository<R>(
        entity: new () => T,
        options: RepositoryOptions | undefined,
        work: (repo: Repository<T>) => Promise<R>,
    ): Promise<R> {
        const mode = this.resolveReplicationMode(options);

        try {
            return await this.executeWithMode(
                entity,
                mode,
                work,
            );
        } catch (error) {
            if (mode === 'slave' && this.shouldFallbackToMaster(error)) {
                this.circuitBreaker.onFailure(error);
                this.logger.warn(
                    'Replica read failed, falling back to primary',
                    error instanceof Error ? error.message : undefined,
                );

                return this.executeWithMode(entity, 'master', work);
            }

            throw error;
        }
    }

    private async executeWithMode<R>(entity: new () => T, mode: 'master' | 'slave', work: (repo: Repository<T>) => Promise<R>): Promise<R> {
        const queryRunner = this.dataSource.createQueryRunner(mode);
        await queryRunner.connect();

        try {
            const repository = queryRunner.manager.getRepository(entity);

            const result = await work(repository);

            if (mode === 'slave') {
                this.circuitBreaker.onSuccess();
            }
            return result;
        } finally {
            await queryRunner.release();
        }
    }

    protected async withMasterRepository<R>(
        entity: new () => T,
        work: (repo: Repository<T>) => Promise<R>,
    ): Promise<R> {
        const queryRunner = this.dataSource.createQueryRunner('master');

        await queryRunner.connect();

        try {
            const repository = queryRunner.manager.getRepository(entity);

            return await work(repository);
        } finally {
            await queryRunner.release();
        }
    }

    private resolveReplicationMode(
        options?: RepositoryOptions,
    ): 'master' | 'slave' {
        if (options?.consistency === ReadConsistency.STRONG) {
            return 'master';
        }

        if (!this.circuitBreaker.canExecute()) {
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