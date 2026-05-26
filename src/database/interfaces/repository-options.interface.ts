import { ReadConsistency } from '../enums/read-consistency.enum';

export interface RepositoryOptions {
  consistency?: ReadConsistency;
}
