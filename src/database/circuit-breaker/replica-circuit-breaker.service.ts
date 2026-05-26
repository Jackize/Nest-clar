import { Injectable, Logger } from '@nestjs/common';

import { CircuitState } from './circuit-state.enum';
import { isReplicaConnectionError } from './replica-connection-error';

@Injectable()
export class ReplicaCircuitBreakerService {
    private readonly logger = new Logger(ReplicaCircuitBreakerService.name);

    private state = CircuitState.CLOSED;

    private failureCount = 0;

    private lastFailureTime: number | null = null;

    private readonly FAILURE_THRESHOLD = 5;

    private readonly OPEN_TIMEOUT = 30000;

    canExecute(): boolean {
        if (this.state === CircuitState.CLOSED) {
            return true;
        }

        if (this.state === CircuitState.OPEN) {
            const now = Date.now();

            const shouldRetry = this.lastFailureTime && (now - this.lastFailureTime) > this.OPEN_TIMEOUT;

            if (shouldRetry) {
                this.state = CircuitState.HALF_OPEN;

                this.logger.warn('Circuit moved to HALF_OPEN');

                return true;
            }

            return false;
        }

        return true;
    }

    onSuccess(): void {
        if (this.state === CircuitState.HALF_OPEN) {
            this.logger.log('Circuit closed again');
        }

        this.failureCount = 0;

        this.state = CircuitState.CLOSED;
    }

    onFailure(error: unknown): void {
        this.lastFailureTime = Date.now();

        if (isReplicaConnectionError(error)) {
            this.failureCount = this.FAILURE_THRESHOLD;
            this.state = CircuitState.OPEN;
            this.logger.error(
                'Replica circuit opened after connection failure',
                error instanceof Error ? error.stack : undefined,
            );
            return;
        }

        this.failureCount++;

        this.logger.error(
            `Replica failure count: ${this.failureCount}`,
            error instanceof Error ? error.stack : undefined,
        );

        if (this.failureCount >= this.FAILURE_THRESHOLD) {
            this.state = CircuitState.OPEN;
            this.logger.error('Replica circuit opened');
        }
    }

    getState(): CircuitState {
        return this.state;
    }
}