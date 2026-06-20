# Cache bottleneck benchmark

Generated: 2026-06-20T03:35:14.738Z

Endpoint: `http://localhost:8080/products/best-sellers`

Iterations per phase: 200

| Phase | Average | P50 | P95 | Min | Max | Throughput |
|---|---:|---:|---:|---:|---:|---:|
| Before: cache cleared before every request | 21.45 ms | 21.17 ms | 23.4 ms | 19.99 ms | 32.42 ms | 46.62 req/s |
| After: warm Redis cache | 2.11 ms | 2.08 ms | 2.73 ms | 1.43 ms | 3.8 ms | 473.28 req/s |

Average response-time improvement: **90.16%**

## Bottleneck

The uncached path executes a multi-table aggregate query with joins, grouping, and sorting. The optimized path serves the same result from the shared Redis cache.
