import { PrimaryDbUnavailableException } from '@/common/errors/primary-db-unavailable.error';
import { DataSource, Repository } from 'typeorm';
import { BaseRepository } from './base.repository';

class TestEntity {
  id!: string;
}

class TestRepository extends BaseRepository<TestEntity> {
  constructor(dataSource: DataSource) {
    super(dataSource);
  }

  runOnMaster<R>(work: (repository: Repository<TestEntity>) => Promise<R>): Promise<R> {
    return this.withMasterRepository(TestEntity, work);
  }
}

function createQueryRunner(connect: jest.Mock = jest.fn().mockResolvedValue(undefined)) {
  const typeOrmRepository = {} as Repository<TestEntity>;

  return {
    typeOrmRepository,
    queryRunner: {
      connect,
      release: jest.fn().mockResolvedValue(undefined),
      manager: { getRepository: jest.fn().mockReturnValue(typeOrmRepository) },
    },
  };
}

describe('BaseRepository - master', () => {
  it('executes work on master and returns its result', async () => {
    const { queryRunner, typeOrmRepository } = createQueryRunner();
    // Mock a data source
    const dataSource = {
      createQueryRunner: jest.fn().mockReturnValue(queryRunner),
    } as unknown as DataSource;

    // Create a repository
    const repository = new TestRepository(dataSource);

    // Mock a work function
    const work = jest.fn().mockResolvedValue('saved');

    await expect(repository.runOnMaster(work)).resolves.toBe('saved');

    expect(dataSource.createQueryRunner).toHaveBeenCalledWith('master');
    expect(queryRunner.manager.getRepository).toHaveBeenCalledWith(TestEntity);
    expect(work).toHaveBeenCalledWith(typeOrmRepository);
    expect(queryRunner.release).toHaveBeenCalledTimes(1);
  });

  it('maps a master connection failure to HTTP 503 immediately', async () => {
    const connectionError = Object.assign(new Error('connect ECONNREFUSED 127.0.0.1:5432'), {
      code: 'ECONNREFUSED',
    });
    // Mock a query runner
    const { queryRunner } = createQueryRunner(jest.fn().mockRejectedValue(connectionError));
    // Mock a data source
    const dataSource = {
      createQueryRunner: jest.fn().mockReturnValue(queryRunner),
    } as unknown as DataSource;

    // Create a repository
    const repository = new TestRepository(dataSource);

    await expect(repository.runOnMaster(async () => undefined)).rejects.toBeInstanceOf(PrimaryDbUnavailableException);
    expect(queryRunner.release).toHaveBeenCalledTimes(1);
  });

  it('opens after three connection failures and skips the next connection attempt', async () => {
    // Mock a connection error
    const connectionError = Object.assign(new Error('Connection terminated unexpectedly'), {
      code: 'ECONNRESET',
    });
    const { queryRunner } = createQueryRunner(jest.fn().mockRejectedValue(connectionError));
    // Mock a data source
    const dataSource = {
      createQueryRunner: jest.fn().mockReturnValue(queryRunner),
    } as unknown as DataSource;

    // Create a repository
    const repository = new TestRepository(dataSource);

    for (let attempt = 0; attempt < 4; attempt++) {
      await expect(repository.runOnMaster(async () => undefined)).rejects.toBeInstanceOf(PrimaryDbUnavailableException);
    }

    expect(queryRunner.connect).toHaveBeenCalledTimes(3);
    expect(queryRunner.release).toHaveBeenCalledTimes(4);
  });

  it('transitions from CLOSED to OPEN, HALF_OPEN, then CLOSED after a successful probe', async () => {
    jest.useFakeTimers({ now: new Date('2026-01-01T00:00:00.000Z') });

    try {
      // Mock a connection error
      const connectionError = Object.assign(new Error('Connection terminated unexpectedly'), {
        code: 'ECONNRESET',
      });
      // Mock a query runner
      const connect = jest
        .fn()
        .mockRejectedValueOnce(connectionError)
        .mockRejectedValueOnce(connectionError)
        .mockRejectedValueOnce(connectionError)
        .mockResolvedValue(undefined);
      // Mock a data source
      const { queryRunner } = createQueryRunner(connect);
      // Create a repository
      const dataSource = {
        createQueryRunner: jest.fn().mockReturnValue(queryRunner),
      } as unknown as DataSource;
      const repository = new TestRepository(dataSource);
      const work = jest.fn().mockResolvedValue('master available');

      // CLOSED: requests reach master. Three connection failures open the circuit.
      for (let attempt = 0; attempt < 3; attempt++) {
        await expect(repository.runOnMaster(work)).rejects.toBeInstanceOf(PrimaryDbUnavailableException);
      }

      // OPEN: fail fast without attempting another database connection.
      await expect(repository.runOnMaster(work)).rejects.toBeInstanceOf(PrimaryDbUnavailableException);
      expect(connect).toHaveBeenCalledTimes(3);

      // HALF_OPEN: after the timeout, one successful probe is allowed through.
      jest.advanceTimersByTime(30_000);
      await expect(repository.runOnMaster(work)).resolves.toBe('master available');
      expect(connect).toHaveBeenCalledTimes(4);

      // CLOSED again: the following request reaches master normally.
      await expect(repository.runOnMaster(work)).resolves.toBe('master available');
      expect(connect).toHaveBeenCalledTimes(5);
      expect(work).toHaveBeenCalledTimes(2);
    } finally {
      jest.useRealTimers();
    }
  });
});
