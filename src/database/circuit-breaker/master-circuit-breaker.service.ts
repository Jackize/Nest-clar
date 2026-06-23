import { Injectable, Logger } from '@nestjs/common';

import { PrimaryDbUnavailableException } from '@/common/errors/primary-db-unavailable.error';
import { CircuitState } from './circuit-state.enum';

@Injectable()
export class MasterCircuitBreakerService {
  private readonly logger = new Logger(MasterCircuitBreakerService.name);

  private state = CircuitState.CLOSED;

  private failureCount = 0;

  private lastFailureTime: number | null = null;

  private halfOpenProbeInProgress = false;

  private readonly FAILURE_THRESHOLD = 3;

  private readonly OPEN_TIMEOUT = 30_000;

  public assertCanExecute(): void {
    const state = this.getState();

    switch (state) {
      case CircuitState.CLOSED:
        return;

      case CircuitState.OPEN:
        throw new PrimaryDbUnavailableException();

      case CircuitState.HALF_OPEN:
        if (this.halfOpenProbeInProgress) {
          throw new PrimaryDbUnavailableException();
        }

        this.halfOpenProbeInProgress = true;
    }
  }

  public onSuccess(): void {
    if (this.state !== CircuitState.CLOSED) {
      this.logger.log(`Circuit master state changed: ${this.state} -> CLOSED`);
    }

    this.state = CircuitState.CLOSED;
    this.failureCount = 0;
    this.halfOpenProbeInProgress = false;
    this.lastFailureTime = null;
  }

  public onFailure(error?: unknown): void {
    this.failureCount++;
    this.lastFailureTime = Date.now();

    this.logger.error(`Primary DB failure: ${error instanceof Error ? error.message : undefined}`);

    if (this.failureCount >= this.FAILURE_THRESHOLD) {
      this.openCircuit();
    }

    this.halfOpenProbeInProgress = false;
  }

  public getState(): CircuitState {
    if (this.state === CircuitState.OPEN && this.lastFailureTime) {
      const elapsed = Date.now() - this.lastFailureTime;

      if (elapsed >= this.OPEN_TIMEOUT) {
        this.state = CircuitState.HALF_OPEN;

        this.logger.warn('Circuit master moved to HALF_OPEN');
      }
    }

    return this.state;
  }

  private openCircuit(): void {
    if (this.state === CircuitState.OPEN) {
      return;
    }

    this.state = CircuitState.OPEN;

    this.logger.error('Primary DB circuit opened');
  }
}
