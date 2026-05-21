import { UserEntity } from '@/modules/user/domain/entities/user.entity';
import { IUserRepository } from '@/modules/user/domain/repositories/user.repository.interface';
import { UserOrmEntity } from '@/modules/user/infrastructure/typeorm/entities/user.orm-entity';
import { UserPersistenceMapper } from '@/modules/user/infrastructure/typeorm/mappers/user.persistence.mapper';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class UserRepositoryTypeORMImpl implements IUserRepository {
  constructor(
    @InjectRepository(UserOrmEntity)
    private readonly userRepository: Repository<UserOrmEntity>,
  ) {}

  async save(user: UserEntity): Promise<UserEntity> {
    const orm = UserPersistenceMapper.toOrm(user);
    await this.userRepository.save(orm);
    return user;
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    const orm = await this.userRepository.findOne({ where: { email } });
    return orm ? UserPersistenceMapper.toDomain(orm) : null;
  }

  async findById(id: string): Promise<UserEntity | null> {
    const orm = await this.userRepository.findOne({ where: { id } });
    return orm ? UserPersistenceMapper.toDomain(orm) : null;
  }

  async findAll(
    page: number,
    limit: number,
    sortOrder: 'asc' | 'desc',
  ): Promise<UserEntity[]> {
    const rows = await this.userRepository.find({
      order: { name: sortOrder.toUpperCase() as 'ASC' | 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return rows.map(UserPersistenceMapper.toDomain);
  }

  async update(id: string, user: UserEntity): Promise<UserEntity | null> {
    const orm = await this.userRepository.findOne({ where: { id } });
    if (!orm) {
      return null;
    }
    orm.email = user.email;
    orm.name = user.name;
    await this.userRepository.save(orm);
    return user;
  }

  async patch(
    id: string,
    partial: Partial<UserEntity>,
  ): Promise<UserEntity | null> {
    const orm = await this.userRepository.findOne({ where: { id } });
    if (!orm) {
      return null;
    }
    const domain = UserPersistenceMapper.toDomain(orm);
    if (partial.email !== undefined) {
      domain.changeEmail(partial.email);
    }
    if (partial.name !== undefined) {
      domain.updateName(partial.name);
    }
    await this.userRepository.save(UserPersistenceMapper.toOrm(domain));
    return domain;
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.userRepository.delete({ id });
    return (result.affected ?? 0) > 0;
  }
}
