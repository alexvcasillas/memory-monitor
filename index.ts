import type {
  LogMemoryUsageOptions,
  MonitorAsyncOperationOptions,
  MonitorSyncOperationOptions,
  ForceGarbageCollectionOptions,
  GetMemoryStatusOptions,
  MemoryStatus
} from "./types";

const DEFAULT_MEMORY_WARNING_THRESHOLD = 256 * 1024 * 1024; // 256MB
const DEFAULT_MEMORY_CRITICAL_THRESHOLD = 512 * 1024 * 1024; // 512MB

/**
 * Logs current memory usage with operation context.
 *
 * @param options - Options for logging memory usage
 * @param options.operation - Description of the current operation
 * @param options.additionalData - Additional context data
 * @param options.log - Logger function
 * @param options.warningThreshold - Optional warning threshold (bytes, default: 256MB)
 * @param options.criticalThreshold - Optional critical threshold (bytes, default: 512MB)
 */
export function logMemoryUsage({
  operation,
  additionalData,
  log,
  warningThreshold = DEFAULT_MEMORY_WARNING_THRESHOLD,
  criticalThreshold = DEFAULT_MEMORY_CRITICAL_THRESHOLD,
}: LogMemoryUsageOptions): void {
  const usage = process.memoryUsage();
  const mb = (bytes: number): number =>
    Math.round((bytes / 1024 / 1024) * 100) / 100;

  const memoryData = {
    heapUsed: `${mb(usage.heapUsed)}MB`,
    heapTotal: `${mb(usage.heapTotal)}MB`,
    rss: `${mb(usage.rss)}MB`,
    external: `${mb(usage.external)}MB`,
    ...additionalData,
  };

  log && log(`Memory Usage - ${operation}: `, memoryData);

  // Alert if memory usage is high
  if (usage.heapUsed > criticalThreshold) {
    log && log("Critical memory usage detected: ", { memoryUsage: usage, operation });
  } else if (usage.heapUsed > warningThreshold) {
    log && log("High memory usage detected: ", { memoryUsage: usage, operation });
  }
}

/**
 * Monitors memory usage before and after an async operation.
 *
 * @param options - Options for monitoring the async operation
 * @param options.operation - Description of the operation
 * @param options.fn - Async function to execute and monitor
 * @param options.log - Logger function
 * @param options.warningThreshold - Optional warning threshold (bytes, default: 256MB)
 * @param options.criticalThreshold - Optional critical threshold (bytes, default: 512MB)
 * @returns Result of the function execution
 */
export async function monitorAsyncOperation<T>({
  operation,
  fn,
  log,
  warningThreshold = DEFAULT_MEMORY_WARNING_THRESHOLD,
  criticalThreshold = DEFAULT_MEMORY_CRITICAL_THRESHOLD,
}: MonitorAsyncOperationOptions<T>): Promise<T> {
  const startMemory = process.memoryUsage();
  logMemoryUsage({ operation: `${operation} - Start`, log, warningThreshold, criticalThreshold });

  try {
    const result = await fn();
    const endMemory = process.memoryUsage();

    const memoryDelta = {
      heapUsedDelta: `${Math.round(((endMemory.heapUsed - startMemory.heapUsed) / 1024 / 1024) * 100) / 100}MB`,
      heapTotalDelta: `${Math.round(((endMemory.heapTotal - startMemory.heapTotal) / 1024 / 1024) * 100) / 100}MB`,
    };

    logMemoryUsage({ operation: `${operation} - End`, additionalData: memoryDelta, log, warningThreshold, criticalThreshold });
    return result;
  } catch (error) {
    logMemoryUsage({ operation: `${operation} - Error`, log, warningThreshold, criticalThreshold });
    throw error;
  }
}

/**
 * Monitors memory usage before and after a synchronous operation.
 *
 * @param options - Options for monitoring the sync operation
 * @param options.operation - Description of the operation
 * @param options.fn - Function to execute and monitor
 * @param options.log - Logger function
 * @param options.warningThreshold - Optional warning threshold (bytes, default: 256MB)
 * @param options.criticalThreshold - Optional critical threshold (bytes, default: 512MB)
 * @returns Result of the function execution
 */
export function monitorSyncOperation<T>({
  operation,
  fn,
  log,
  warningThreshold = DEFAULT_MEMORY_WARNING_THRESHOLD,
  criticalThreshold = DEFAULT_MEMORY_CRITICAL_THRESHOLD,
}: MonitorSyncOperationOptions<T>): T {
  const startMemory = process.memoryUsage();
  logMemoryUsage({ operation: `${operation} - Start`, log, warningThreshold, criticalThreshold });

  try {
    const result = fn();
    const endMemory = process.memoryUsage();

    const memoryDelta = {
      heapUsedDelta: `${Math.round(((endMemory.heapUsed - startMemory.heapUsed) / 1024 / 1024) * 100) / 100}MB`,
      heapTotalDelta: `${Math.round(((endMemory.heapTotal - startMemory.heapTotal) / 1024 / 1024) * 100) / 100}MB`,
    };

    logMemoryUsage({ operation: `${operation} - End`, additionalData: memoryDelta, log, warningThreshold, criticalThreshold });
    return result;
  } catch (error) {
    logMemoryUsage({ operation: `${operation} - Error`, log, warningThreshold, criticalThreshold });
    throw error;
  }
}

/**
 * Forces garbage collection if available and logs memory before/after.
 * This should only be used for debugging/development purposes.
 *
 * @param options - Options for the GC operation
 * @param options.context - Context description for the GC operation
 * @param options.log - Logger function
 * @param options.warningThreshold - Optional warning threshold (bytes, default: 256MB)
 * @param options.criticalThreshold - Optional critical threshold (bytes, default: 512MB)
 */
export function forceGarbageCollection({ context, warningThreshold = DEFAULT_MEMORY_WARNING_THRESHOLD, criticalThreshold = DEFAULT_MEMORY_CRITICAL_THRESHOLD, log }: ForceGarbageCollectionOptions): void {
  if (global.gc) {
    const beforeGC = process.memoryUsage();
    global.gc();
    const afterGC = process.memoryUsage();

    const memoryFreed = {
      heapFreed: `${Math.round(((beforeGC.heapUsed - afterGC.heapUsed) / 1024 / 1024) * 100) / 100}MB`,
      context,
    };

    logMemoryUsage({ operation: "Forced Garbage Collection", additionalData: memoryFreed, log, warningThreshold, criticalThreshold });
  }
}

/**
 * Checks if current memory usage exceeds thresholds.
 *
 * @param options - Options for checking memory status
 * @param options.warningThreshold - Optional warning threshold (bytes, default: 256MB)
 * @param options.criticalThreshold - Optional critical threshold (bytes, default: 512MB)
 * @returns Object indicating memory status
 */
export function getMemoryStatus({ warningThreshold = DEFAULT_MEMORY_WARNING_THRESHOLD, criticalThreshold = DEFAULT_MEMORY_CRITICAL_THRESHOLD }: GetMemoryStatusOptions = {}): MemoryStatus {
  const usage = process.memoryUsage();
  return {
    isWarning: usage.heapUsed > warningThreshold,
    isCritical: usage.heapUsed > criticalThreshold,
    heapUsedMB: Math.round((usage.heapUsed / 1024 / 1024) * 100) / 100,
    heapTotalMB: Math.round((usage.heapTotal / 1024 / 1024) * 100) / 100,
  };
}