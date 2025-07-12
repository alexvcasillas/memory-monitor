// Types for memory-monitor functions

export type LogFunction = (message: string, data?: Record<string, unknown>) => void;

export interface LogMemoryUsageOptions {
  operation: string;
  additionalData?: Record<string, unknown>;
  log?: LogFunction;
  warningThreshold?: number;
  criticalThreshold?: number;
}

export interface MonitorAsyncOperationOptions<T> {
  operation: string;
  fn: () => Promise<T>;
  log?: LogFunction;
  warningThreshold?: number;
  criticalThreshold?: number;
}

export interface MonitorSyncOperationOptions<T> {
  operation: string;
  fn: () => T;
  log?: LogFunction;
  warningThreshold?: number;
  criticalThreshold?: number;
}

export interface ForceGarbageCollectionOptions {
  context: string;
  log?: LogFunction;
  warningThreshold?: number;
  criticalThreshold?: number;
}

export interface GetMemoryStatusOptions {
  warningThreshold?: number;
  criticalThreshold?: number;
}

export interface MemoryStatus {
  isWarning: boolean;
  isCritical: boolean;
  heapUsedMB: number;
  heapTotalMB: number;
} 