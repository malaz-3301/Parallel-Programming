# High-Performance E-Commerce Backend

NestJS backend project for the Parallel Programming course. The project focuses on concurrency safety, controlled parallelism, asynchronous queues, batch processing, load distribution, distributed caching, transaction integrity, and performance measurement.

## Main stack

- NestJS and TypeScript
- PostgreSQL and TypeORM
- Redis and BullMQ
- Nginx load balancing
- Docker Compose

## Run with Docker

```bash
docker compose up -d --build
```

The load balancer listens on:

```text
http://localhost:8080
```

Useful endpoints:

```text
GET /health
GET /instance
GET /resources
GET /products/best-sellers
```

## Development

```bash
npm install
npm run start:dev
```

## Build and tests

```bash
npm run build
npm test -- --runInBand
```

## Performance monitoring

HTTP controller execution is measured by a global NestJS interceptor. Configure it with:

```env
PERFORMANCE_LOG_ALL=true
PERFORMANCE_WARN_MS=500
```

Architecture and AOP details:

```text
docs/architecture.txt
docs/aop.txt
```

## Benchmarking

The implemented benchmark compares the uncached best-sellers database query with the warm Redis path:

```bash
npm run benchmark:cache
```

The numeric report is written under `benchmark-results`.

Benchmark method and interpretation:

```text
docs/benchmarking.md
```
