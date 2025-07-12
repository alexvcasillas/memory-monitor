# memory-monitor

A lightweight, zero-dependency utility for monitoring and logging Node.js process memory usage. Designed to help you identify memory leaks, optimize memory consumption, and gain visibility into your application's memory profile—especially during resource-intensive operations.

---

## Why is this important?

Memory leaks and excessive memory usage are common issues in long-running Node.js applications, batch jobs, and data processing scripts. Unchecked, they can lead to degraded performance, application crashes, or even outages in production.

**memory-monitor** provides simple, composable tools to:

- Track memory usage before and after critical operations
- Log memory deltas and trends
- Set up warnings and critical alerts for high memory usage
- Integrate memory monitoring into both synchronous and asynchronous workflows
- Optionally force garbage collection (for debugging)

---

## Why did I create this?

- **Visibility:** Node.js does not provide built-in, easy-to-use memory monitoring for your business logic. This library fills that gap.
- **Debugging:** When troubleshooting memory leaks, you need to know _when_ and _where_ memory usage spikes.
- **Reliability:** Proactively alerting on high memory usage helps prevent production incidents.
- **Simplicity:** No dependencies, no setup—just import and use.

---

## When do you need this?

- When processing large files (e.g. images, data streams)
- When running long-lived services or batch jobs
- When you suspect a memory leak
- When you want to optimize memory usage in critical code paths
- When you want to add memory usage logging to your application

---

## Installation

Install via your favorite package manager:

```bash
# With npm
npm install @alexvcasillas/memory-monitor

# With yarn
yarn add @alexvcasillas/memory-monitor

# With pnpm
pnpm add @alexvcasillas/memory-monitor

# With bun
bun add @alexvcasillas/memory-monitor
```

Then import in your code:

```ts
import {
  monitorAsyncOperation,
  logMemoryUsage /* ... */,
} from "@alexvcasillas/memory-monitor";
```

---

## Usage

### 1. Logging Memory Usage

```ts
import { logMemoryUsage } from "@alexvcasillas/memory-monitor";

// Basic usage with console logging
logMemoryUsage({
  operation: "Initial Load",
  log: (msg, data) => console.log(msg, data),
});

// With additional context
logMemoryUsage({
  operation: "Processing User Upload",
  additionalData: { userId: "abc123", fileSize: "10MB" },
  log: (msg, data) => console.log(msg, data),
});
```

---

### 2. Monitoring Asynchronous Operations

```ts
import { monitorAsyncOperation } from "@alexvcasillas/memory-monitor";

await monitorAsyncOperation({
  operation: "Generate Report",
  fn: async () => {
    // ... your async code here ...
    await doHeavyWork();
    return "done";
  },
  log: (msg, data) => console.log(msg, data), // Pass your logger here
});
// Logs memory before and after, and on error.
```

---

### 3. Monitoring Synchronous Operations

```ts
import { monitorSyncOperation } from "@alexvcasillas/memory-monitor";

const result = monitorSyncOperation({
  operation: "Parse Large JSON",
  fn: () => {
    // ... your sync code here ...
    return JSON.parse(largeJsonString);
  },
  log: (msg, data) => console.log(msg, data), // Pass your logger here
});
// Logs memory before and after, and on error.
```

---

### 4. Forcing Garbage Collection (for debugging)

> **Note:** Node.js must be run with `--expose-gc` for this to work.

```ts
import { forceGarbageCollection } from "@alexvcasillas/memory-monitor";

forceGarbageCollection({ context: "After batch processing" });
```

---

### 5. Checking Memory Status

```ts
import { getMemoryStatus } from "@alexvcasillas/memory-monitor";

const status = getMemoryStatus();
if (status.isCritical) {
  // Take action, e.g., restart process, alert, etc.
}
console.log(status);
// { isWarning: false, isCritical: false, heapUsedMB: 42.13, heapTotalMB: 64 }
```

---

## API Reference

### logMemoryUsage

```ts
logMemoryUsage({
  operation,
  additionalData,
  log,
  warningThreshold = 256 * 1024 * 1024,
  criticalThreshold = 512 * 1024 * 1024,
});
```

Logs current memory usage with optional context and custom logger.

- `operation` (string): Description of the operation
- `additionalData` (object, optional): Extra context to log
- `log` (function, optional): Custom logger (defaults to none). Signature: `(message: string, data?: object) => void`
- `warningThreshold` (number, optional): Warning threshold in bytes (default: 256MB)
- `criticalThreshold` (number, optional): Critical threshold in bytes (default: 512MB)

### monitorAsyncOperation

```ts
monitorAsyncOperation({
  operation,
  fn,
  log,
  warningThreshold = 256 * 1024 * 1024,
  criticalThreshold = 512 * 1024 * 1024,
});
```

Monitors memory before and after an async function.

- `operation` (string): Description of the operation
- `fn` (function): Async function to execute
- `log` (function, optional): Custom logger for all memory logs
- `warningThreshold` (number, optional): Warning threshold in bytes (default: 256MB)
- `criticalThreshold` (number, optional): Critical threshold in bytes (default: 512MB)

### monitorSyncOperation

```ts
monitorSyncOperation({
  operation,
  fn,
  log,
  warningThreshold = 256 * 1024 * 1024,
  criticalThreshold = 512 * 1024 * 1024,
});
```

Monitors memory before and after a sync function.

- `operation` (string): Description of the operation
- `fn` (function): Sync function to execute
- `log` (function, optional): Custom logger for all memory logs
- `warningThreshold` (number, optional): Warning threshold in bytes (default: 256MB)
- `criticalThreshold` (number, optional): Critical threshold in bytes (default: 512MB)

### forceGarbageCollection

```ts
forceGarbageCollection({
  context,
  log,
  warningThreshold = 256 * 1024 * 1024,
  criticalThreshold = 512 * 1024 * 1024,
});
```

Forces garbage collection (if available) and logs memory before/after.

- `context` (string): Description for the GC operation
- `log` (function, optional): Custom logger
- `warningThreshold` (number, optional): Warning threshold in bytes (default: 256MB)
- `criticalThreshold` (number, optional): Critical threshold in bytes (default: 512MB)

### getMemoryStatus

```ts
getMemoryStatus({
  warningThreshold = 256 * 1024 * 1024,
  criticalThreshold = 512 * 1024 * 1024,
});
```

Returns an object with:

- `isWarning` (boolean): true if heapUsed > warningThreshold
- `isCritical` (boolean): true if heapUsed > criticalThreshold
- `heapUsedMB` (number): Heap used in MB
- `heapTotalMB` (number): Heap total in MB

---

## Example: Custom Logger Integration

```ts
import { monitorAsyncOperation } from "@alexvcasillas/memory-monitor";

function myLogger(message: string, data?: Record<string, unknown>) {
  // Send to external logging service, or format as needed
  console.log(`[MEMORY] ${message}`, data);
}

await monitorAsyncOperation({
  operation: "Import Data",
  fn: async () => {
    // ... your code ...
  },
  log: myLogger,
});

// Use with logMemoryUsage directly
logMemoryUsage({
  operation: "Custom Log",
  log: myLogger,
});
```

---

## Customizing Memory Thresholds

You can customize the warning and critical memory thresholds **per function call** by passing `warningThreshold` and `criticalThreshold` (in bytes) to any of the main functions. If you do not provide these, the defaults are 256MB (warning) and 512MB (critical).

> **Note:** Both `warningThreshold` and `criticalThreshold` are optional. If omitted, they default to 256MB and 512MB respectively.

```ts
import { monitorAsyncOperation } from "@alexvcasillas/memory-monitor";

await monitorAsyncOperation({
  operation: "Heavy Task",
  fn: async () => {
    /* ... */
  },
  log: (msg, data) => console.log(msg, data),
  // Optional:
  warningThreshold: 128 * 1024 * 1024, // 128MB
  criticalThreshold: 300 * 1024 * 1024, // 300MB
});
```

You can do the same for `logMemoryUsage`, `monitorSyncOperation`, `forceGarbageCollection`, and `getMemoryStatus`:

```ts
import { logMemoryUsage } from "@alexvcasillas/memory-monitor";

logMemoryUsage({
  operation: "Custom Thresholds",
  log: (msg, data) => console.log(msg, data),
  // Optional:
  warningThreshold: 100 * 1024 * 1024, // 100MB
  criticalThreshold: 200 * 1024 * 1024, // 200MB
});
```

---

## License

MIT

---

If you have questions or want to contribute, please open an issue or pull request!
