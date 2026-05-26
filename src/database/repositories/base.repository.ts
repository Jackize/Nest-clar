import { DataSource, ObjectLiteral, Repository } from 'typeorm';
import { ReadConsistency } from '../enums/read-consistency.enum';
import { RepositoryOptions } from '../interfaces/repository-options.interface';

export abstract class BaseRepository<T extends ObjectLiteral> {
    protected constructor(
        protected readonly dataSource: DataSource,
    ) { }

    protected async withRepository<R>(
        entity: new () => T,
        options: RepositoryOptions | undefined,
        work: (repo: Repository<T>) => Promise<R>,
    ): Promise<R> {
        const mode = this.resolveReplicationMode(options);

        const queryRunner = this.dataSource.createQueryRunner(mode);

        await queryRunner.connect();

        try {
            const repository = queryRunner.manager.getRepository(entity);

            return await work(repository);
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
        if (
            options?.consistency === ReadConsistency.STRONG
        ) {
            return 'master';
        }

        return 'slave';
    }
}