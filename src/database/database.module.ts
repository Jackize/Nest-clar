import { Global, Module } from '@nestjs/common';

import { ReplicaCircuitBreakerService } from './circuit-breaker/replica-circuit-breaker.service';

@Global()
@Module({
  providers: [ReplicaCircuitBreakerService],
  exports: [ReplicaCircuitBreakerService],
})
export class DatabaseModule {}
