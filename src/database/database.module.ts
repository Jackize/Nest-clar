import { Global, Module } from '@nestjs/common';

import { MasterCircuitBreakerService } from './circuit-breaker/master-circuit-breaker.service';
import { ReplicaCircuitBreakerService } from './circuit-breaker/replica-circuit-breaker.service';

@Global()
@Module({
  providers: [ReplicaCircuitBreakerService, MasterCircuitBreakerService],
  exports: [ReplicaCircuitBreakerService, MasterCircuitBreakerService],
})
export class DatabaseModule {}
