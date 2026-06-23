import { DataSource, Repository } from 'typeorm';
import { ReadConsistency } from '../enums/read-consistency.enum';
import { BaseRepository } from './base.repository';

class TestEntity {
  id!: string;
}

class TestRepository extends BaseRepository<TestEntity> {
  constructor(dataSource: DataSource) {
    super(dataSource);
  }

  runOnReplica<R>(work: (repository: Repository<TestEntity>) => Promise<R>): Promise<R> {
    return this.withRepository(TestEntity, { consistency: ReadConsistency.EVENTUAL }, work);
  }
}

function createSuccessfulQueryRunner(repository: Repository<TestEntity> = {} as Repository<TestEntity>) {
  return {
    connect: jest.fn().mockResolvedValue(undefined),
    release: jest.fn().mockResolvedValue(undefined),
    manager: { getRepository: jest.fn().mockReturnValue(repository) },
  };
}

describe('BaseRepository - replica', () => {
  it('executes an eventual-consistency read on replica', async () => {
    const typeOrmRepository = {} as Repository<TestEntity>;
    const replicaQueryRunner = createSuccessfulQueryRunner(typeOrmRepository);
    const dataSource = {
      createQueryRunner: jest.fn().mockReturnValue(replicaQueryRunner),
    } as unknown as DataSource;
    const repository = new TestRepository(dataSource);
    const work = jest.fn().mockResolvedValue('replica result');

    await expect(repository.runOnReplica(work)).resolves.toBe('replica result');

    expect(dataSource.createQueryRunner).toHaveBeenCalledWith('slave');
    expect(work).toHaveBeenCalledWith(typeOrmRepository);
    expect(replicaQueryRunner.release).toHaveBeenCalledTimes(1);
  });

  it('falls back to master when replica connection fails and master is available', async () => {
    // Mock a connection error
    const connectionError = Object.assign(new Error('connect ECONNREFUSED 127.0.0.1:5433'), {
      code: 'ECONNREFUSED',
    });
    // Mock a replica query runner
    const replicaQueryRunner = {
      connect: jest.fn().mockRejectedValue(connectionError),
      release: jest.fn().mockResolvedValue(undefined),
      manager: { getRepository: jest.fn() },
    };
    // Mock a master repository
    const masterRepository = {} as Repository<TestEntity>;
    // Mock a master query runner
    const masterQueryRunner = createSuccessfulQueryRunner(masterRepository);
    // Mock a data source
    const dataSource = {
      createQueryRunner: jest.fn((mode: 'master' | 'slave') =>
        mode === 'slave' ? replicaQueryRunner : masterQueryRunner,
      ),
    } as unknown as DataSource;
    // Create a repository
    const repository = new TestRepository(dataSource);
    // Mock a work function
    const work = jest.fn().mockResolvedValue('master result');

    await expect(repository.runOnReplica(work)).resolves.toBe('master result');

    expect(dataSource.createQueryRunner).toHaveBeenNthCalledWith(1, 'slave');
    expect(dataSource.createQueryRunner).toHaveBeenNthCalledWith(2, 'master');
    expect(replicaQueryRunner.release).toHaveBeenCalledTimes(1);
    expect(work).toHaveBeenCalledWith(masterRepository);
    expect(masterQueryRunner.release).toHaveBeenCalledTimes(1);
  });

  it('routes the next read directly to master after the replica circuit opens', async () => {
    // Mock a replica error
    const replicaError = Object.assign(new Error('connection timeout'), { code: 'ETIMEDOUT' });
    // Mock a replica query runner
    const replicaQueryRunner = {
      connect: jest.fn().mockRejectedValue(replicaError),
      release: jest.fn().mockResolvedValue(undefined),
      manager: { getRepository: jest.fn() },
    };
    // Mock a master query runner
    const masterQueryRunner = createSuccessfulQueryRunner();
    // Mock a data source
    const dataSource = {
      createQueryRunner: jest.fn((mode: 'master' | 'slave') =>
        mode === 'slave' ? replicaQueryRunner : masterQueryRunner,
      ),
    } as unknown as DataSource;
    // Create a repository
    const repository = new TestRepository(dataSource);

    // Mock a work function
    await repository.runOnReplica(async () => 'first');
    await repository.runOnReplica(async () => 'second');

    expect(dataSource.createQueryRunner).toHaveBeenNthCalledWith(1, 'slave');
    expect(dataSource.createQueryRunner).toHaveBeenNthCalledWith(2, 'master');
    expect(dataSource.createQueryRunner).toHaveBeenNthCalledWith(3, 'master');
    expect(replicaQueryRunner.connect).toHaveBeenCalledTimes(1);
  });

  it('transitions from CLOSED to OPEN, HALF_OPEN, then CLOSED after a successful replica probe', async () => {
    jest.useFakeTimers({ now: new Date('2026-01-01T00:00:00.000Z') });

    try {
      // Mock a connection error
      const connectionError = Object.assign(new Error('connect ECONNREFUSED 127.0.0.1:5433'), {
        code: 'ECONNREFUSED',
      });
      // Mock a replica query runner
      const replicaConnect = jest.fn().mockRejectedValueOnce(connectionError).mockResolvedValue(undefined);
      const replicaQueryRunner = {
        connect: replicaConnect,
        release: jest.fn().mockResolvedValue(undefined),
        manager: { getRepository: jest.fn().mockReturnValue({} as Repository<TestEntity>) },
      };
      // Mock a master query runner
      const masterQueryRunner = createSuccessfulQueryRunner();
      // Mock a data source
      const dataSource = {
        createQueryRunner: jest.fn((mode: 'master' | 'slave') =>
          mode === 'slave' ? replicaQueryRunner : masterQueryRunner,
        ),
      } as unknown as DataSource;
      // Create a repository
      const repository = new TestRepository(dataSource);
      // Mock a work function
      const work = jest.fn().mockResolvedValue('user');

      // CLOSED: the replica is used. Its connection failure opens the circuit,
      // and the current request falls back to master.
      await expect(repository.runOnReplica(work)).resolves.toBe('user');
      expect(dataSource.createQueryRunner).toHaveBeenNthCalledWith(1, 'slave');
      expect(dataSource.createQueryRunner).toHaveBeenNthCalledWith(2, 'master');

      // OPEN: the next request skips replica and goes directly to master.
      await expect(repository.runOnReplica(work)).resolves.toBe('user');
      expect(dataSource.createQueryRunner).toHaveBeenNthCalledWith(3, 'master');
      expect(replicaConnect).toHaveBeenCalledTimes(1);

      // HALF_OPEN: after the timeout, a successful replica probe is allowed.
      // The implementation checks `elapsed > OPEN_TIMEOUT`, hence 30_001 ms.
      jest.advanceTimersByTime(30_001);
      await expect(repository.runOnReplica(work)).resolves.toBe('user');
      expect(dataSource.createQueryRunner).toHaveBeenNthCalledWith(4, 'slave');
      expect(replicaConnect).toHaveBeenCalledTimes(2);

      // CLOSED again: subsequent reads continue to use the replica.
      await expect(repository.runOnReplica(work)).resolves.toBe('user');
      expect(dataSource.createQueryRunner).toHaveBeenNthCalledWith(5, 'slave');
      expect(replicaConnect).toHaveBeenCalledTimes(3);
      expect(masterQueryRunner.connect).toHaveBeenCalledTimes(2);
    } finally {
      jest.useRealTimers();
    }
  });
});
