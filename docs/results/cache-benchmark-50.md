# Cache bottleneck benchmark

Generated: 2026-06-20T03:32:20.742Z

Endpoint: `http://localhost:8080/products/best-sellers`

Iterations per phase: 50

| Phase | Average | P50 | P95 | Min | Max | Throughput |
|---|---:|---:|---:|---:|---:|---:|
| Before: cache cleared before every request | 21.74 ms | 20.8 ms | 30.75 ms | 19.45 ms | 31.45 ms | 46 req/s |
| After: warm Redis cache | 1.82 ms | 1.8 ms | 2.44 ms | 1.32 ms | 2.65 ms | 549.6 req/s |

Average response-time improvement: **91.63%**

## Bottleneck

The uncached path executes a multi-table aggregate query with joins, grouping, and sorting. The optimized path serves the same result from the shared Redis cache.
