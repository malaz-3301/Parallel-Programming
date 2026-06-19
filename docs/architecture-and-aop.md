# Architecture and AOP performance monitoring

## System architecture

```text
Client
  -> Nginx load balancer
      -> api1 / api2 / api3
          -> PostgreSQL
          -> Redis cache
          -> BullMQ queues and workers
```

The application is split into NestJS feature modules. Infrastructure setup is grouped under `src/modules-set`, while each domain keeps its controller, service, entities, DTOs, and queue worker together.

## Synchronization points

- Checkout locks the active cart and affected product rows before changing inventory.
- Inventory update, payment authorization, order creation, and cart confirmation run in one database transaction.
- Cart and cart-item versions are checked during updates to detect concurrent changes.
- Unique indexes prevent more than one open cart per user and duplicate products inside one cart.
- Worker concurrency and the PostgreSQL connection pool limit resource consumption.

## AOP implementation

NestJS interceptors provide an Aspect-Oriented Programming interception point around controller methods. `PerformanceInterceptor` is registered globally through `APP_INTERCEPTOR` in `MonitoringModule`.

For every monitored HTTP handler, the interceptor records the start time, executes the handler, captures success or failure, calculates the duration, and emits one structured log event.

The event includes:

- HTTP method and route
- controller and handler names
- status code
- duration in milliseconds
- authenticated user ID when available
- application instance ID
- error class when the request fails
- timestamp

Request bodies, passwords, access tokens, and payment tokens are never logged.

## Configuration

```env
PERFORMANCE_LOG_ALL=true
PERFORMANCE_WARN_MS=500
```

When `PERFORMANCE_LOG_ALL` is true, every monitored request is logged. Slow requests and failed requests are logged at warning level.

Health and instance endpoints use `@SkipPerformanceMonitoring()` because load-balancer probes would otherwise create noisy measurements.

## Scope

The interceptor measures HTTP controller execution. BullMQ jobs and scheduled batch jobs run outside the HTTP request path, so they are observed separately through their job states and worker logs.
