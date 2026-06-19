import { execFileSync } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
import { performance } from 'node:perf_hooks';

const benchmarkUrl =
  process.env.BENCHMARK_URL ??
  'http://localhost:8080/products/best-sellers';
const iterations = readPositiveInteger('BENCHMARK_ITERATIONS', 20);
const redisDatabase = readPositiveInteger('REDIS_CACHE_DB', 1, true);
const redisService = process.env.BENCHMARK_REDIS_SERVICE ?? 'redis';
const cachePrefix = process.env.CACHE_PREFIX ?? 'parallel-ecommerce';
const cacheKey = `${cachePrefix}:products:best-sellers`;
const composeFile = process.env.BENCHMARK_COMPOSE_FILE;
const outputDirectory = 'benchmark-results';

await verifyApplication();
await warmUpRuntime();

const before = await runPhase({
  name: 'before',
  clearCacheBeforeEachRequest: true,
});
const after = await runPhase({
  name: 'after',
  clearCacheBeforeEachRequest: false,
  warmCacheBeforeMeasurement: true,
});

const improvementPercent = percentageImprovement(before.averageMs, after.averageMs);
const report = {
  generatedAt: new Date().toISOString(),
  scenario: 'Best sellers database aggregation versus warm Redis cache',
  url: benchmarkUrl,
  iterations,
  cacheKey,
  before,
  after,
  improvementPercent,
};

await writeReport(report);
printSummary(report);

async function runPhase({
  name,
  clearCacheBeforeEachRequest,
  warmCacheBeforeMeasurement = false,
}) {
  const durations = [];

  if (warmCacheBeforeMeasurement) {
    clearBestSellersCache();
    await timedRequest(benchmarkUrl);
  }

  for (let index = 0; index < iterations; index += 1) {
    if (clearCacheBeforeEachRequest) {
      clearBestSellersCache();
    }

    durations.push(await timedRequest(benchmarkUrl));
  }

  return summarize(name, durations);
}

async function verifyApplication() {
  const healthUrl = new URL('/health', benchmarkUrl).toString();
  const response = await fetch(healthUrl);

  if (!response.ok) {
    throw new Error(`Application health check failed with HTTP ${response.status}`);
  }
}

async function warmUpRuntime() {
  await timedRequest(benchmarkUrl);
  clearBestSellersCache();
}

async function timedRequest(url) {
  const startedAt = performance.now();
  const response = await fetch(url, {
    headers: { accept: 'application/json' },
  });
  await response.arrayBuffer();
  const durationMs = performance.now() - startedAt;

  if (!response.ok) {
    throw new Error(`Benchmark request failed with HTTP ${response.status}`);
  }

  return durationMs;
}

function clearBestSellersCache() {
  const argumentsList = ['compose'];

  if (composeFile) {
    argumentsList.push('-f', composeFile);
  }

  argumentsList.push(
    'exec',
    '-T',
    redisService,
    'redis-cli',
    '-n',
    String(redisDatabase),
    'DEL',
    cacheKey,
  );

  try {
    execFileSync('docker', argumentsList, { stdio: 'ignore' });
  } catch {
    throw new Error(
      'Could not clear the Redis cache. Start Docker Compose and verify the Redis service name.',
    );
  }
}

function summarize(name, durations) {
  const sorted = [...durations].sort((left, right) => left - right);
  const totalMs = durations.reduce((sum, value) => sum + value, 0);

  return {
    name,
    requests: durations.length,
    averageMs: round(totalMs / durations.length),
    p50Ms: round(percentile(sorted, 50)),
    p95Ms: round(percentile(sorted, 95)),
    minMs: round(sorted[0]),
    maxMs: round(sorted.at(-1)),
    throughputPerSecond: round((durations.length / totalMs) * 1000),
  };
}

function percentile(sortedValues, percentileValue) {
  const index = Math.max(
    0,
    Math.ceil((percentileValue / 100) * sortedValues.length) - 1,
  );
  return sortedValues[index];
}

function percentageImprovement(beforeMs, afterMs) {
  if (beforeMs === 0) {
    return 0;
  }

  return round(((beforeMs - afterMs) / beforeMs) * 100);
}

async function writeReport(report) {
  await mkdir(outputDirectory, { recursive: true });

  const timestamp = report.generatedAt.replaceAll(':', '-');
  const json = `${JSON.stringify(report, null, 2)}\n`;
  const markdown = createMarkdownReport(report);

  await Promise.all([
    writeFile(`${outputDirectory}/cache-${timestamp}.json`, json),
    writeFile(`${outputDirectory}/cache-${timestamp}.md`, markdown),
    writeFile(`${outputDirectory}/latest.json`, json),
    writeFile(`${outputDirectory}/latest.md`, markdown),
  ]);
}

function createMarkdownReport(report) {
  return `# Cache bottleneck benchmark\n\n` +
    `Generated: ${report.generatedAt}\n\n` +
    `Endpoint: \`${report.url}\`\n\n` +
    `Iterations per phase: ${report.iterations}\n\n` +
    `| Phase | Average | P50 | P95 | Min | Max | Throughput |\n` +
    `|---|---:|---:|---:|---:|---:|---:|\n` +
    `| Before: cache cleared before every request | ${report.before.averageMs} ms | ${report.before.p50Ms} ms | ${report.before.p95Ms} ms | ${report.before.minMs} ms | ${report.before.maxMs} ms | ${report.before.throughputPerSecond} req/s |\n` +
    `| After: warm Redis cache | ${report.after.averageMs} ms | ${report.after.p50Ms} ms | ${report.after.p95Ms} ms | ${report.after.minMs} ms | ${report.after.maxMs} ms | ${report.after.throughputPerSecond} req/s |\n\n` +
    `Average response-time improvement: **${report.improvementPercent}%**\n\n` +
    `## Bottleneck\n\n` +
    `The uncached path executes a multi-table aggregate query with joins, grouping, and sorting. ` +
    `The optimized path serves the same result from the shared Redis cache.\n`;
}

function printSummary(report) {
  console.table({
    before: report.before,
    after: report.after,
  });
  console.log(`Average improvement: ${report.improvementPercent}%`);
  console.log(`Report written to ${outputDirectory}/latest.md`);
}

function readPositiveInteger(name, fallback, allowZero = false) {
  const value = Number(process.env[name] ?? fallback);
  const minimum = allowZero ? 0 : 1;

  if (!Number.isInteger(value) || value < minimum) {
    throw new Error(`${name} must be an integer greater than or equal to ${minimum}`);
  }

  return value;
}

function round(value) {
  return Number(value.toFixed(2));
}
