# Benchmarking and bottleneck analysis

## Bottleneck

The selected operation is:

```text
GET /products/best-sellers
```

When the cache is empty, this endpoint executes a multi-table aggregate query with joins, grouping, summation, sorting, and limiting. The shared Redis cache is the optimization.

## Method

The benchmark uses the same endpoint in two phases:

- Before: delete the Redis key before every request so every request reaches PostgreSQL.
- After: warm Redis once, then measure requests served from the cache.

Requests are sequential to isolate cache response time. This benchmark is separate from the later 100-user stress test.

## Run

```bash
docker compose up -d --build
npm run benchmark:cache
```

The database should contain products and confirmed sales before running the command.

Default settings:

```text
BENCHMARK_URL=http://localhost:8080/products/best-sellers
BENCHMARK_ITERATIONS=20
BENCHMARK_REDIS_SERVICE=redis
REDIS_CACHE_DB=1
CACHE_PREFIX=parallel-ecommerce
```

## Output

The command writes:

```text
benchmark-results/latest.json
benchmark-results/latest.md
```

The report includes average, P50, P95, minimum, maximum, sequential throughput, and the percentage improvement between the two phases.

Use the generated values in the final project report. The AOP interceptor logs the same endpoint during the run, so the application log can be compared with the benchmark report.
