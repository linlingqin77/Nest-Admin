export * from './circuit-breaker.service';
export * from './resilience.module';
// Export only the decorator and metadata key from circuit-breaker.decorator
// The error classes are already exported from circuit-breaker.service
export {
  CircuitBreaker,
  CircuitBreakerMeta,
  CIRCUIT_BREAKER_KEY,
  CircuitBreakerDecoratorOptions,
} from '../../core/decorators/circuit-breaker.decorator';
