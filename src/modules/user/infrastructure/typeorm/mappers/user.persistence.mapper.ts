import { UserEntity } from '@/modules/user/domain/entities/user.entity';
import { UserOrmEntity } from '@/modules/user/infrastructure/typeorm/entities/user.orm-entity';

export class UserPersistenceMapper {
  static toDomain(orm: UserOrmEntity): UserEntity {
    return new UserEntity(orm.id, orm.email, orm.name);
  }

  static toOrm(domain: UserEntity): UserOrmEntity {
    const orm = new UserOrmEntity();
    orm.id = domain.id;
    orm.email = domain.email;
    orm.name = domain.name;
    return orm;
  }
}
