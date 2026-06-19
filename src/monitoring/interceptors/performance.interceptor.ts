import {
  CallHandler,
  ExecutionContext,
  HttpException,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { performance } from 'node:perf_hooks';
import { Observable, catchError, finalize, throwError } from 'rxjs';
import { SKIP_PERFORMANCE_KEY } from '../decorators/skip-performance.decorator';

type MonitoredRequest = {
  method?: string;
  originalUrl?: string;
  url?: string;
  user?: { id?: number };
};

type MonitoredResponse = {
  statusCode?: number;
};

@Injectable()
export class PerformanceInterceptor implements NestInterceptor {
  private readonly logger = new Logger('Performance');
  private readonly warningThresholdMs: number;
  private readonly logAllRequests: boolean;

  constructor(
    private readonly reflector: Reflector,
    private readonly configService: ConfigService,
  ) {
    this.warningThresholdMs = Number(
      this.configService.get<string>('PERFORMANCE_WARN_MS') ?? 500,
    );
    this.logAllRequests =
      (this.configService.get<string>('PERFORMANCE_LOG_ALL') ?? 'true') ===
      'true';
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    if (context.getType() !== 'http' || this.shouldSkip(context)) {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest<MonitoredRequest>();
    const response = context.switchToHttp().getResponse<MonitoredResponse>();
    const startedAt = performance.now();
    let statusCode = response.statusCode ?? 200;
    let errorName: string | undefined;

    return next.handle().pipe(
      catchError((error: unknown) => {
        statusCode = error instanceof HttpException ? error.getStatus() : 500;
        errorName = error instanceof Error ? error.name : 'UnknownError';
        return throwError(() => error);
      }),
      finalize(() => {
        const durationMs = Number((performance.now() - startedAt).toFixed(2));

        if (!this.logAllRequests && durationMs < this.warningThresholdMs) {
          return;
        }

        if (!errorName) {
          statusCode = response.statusCode ?? statusCode;
        }

        const event = {
          event: 'http.performance',
          method: request.method ?? 'UNKNOWN',
          route: this.getRoute(request),
          controller: context.getClass().name,
          handler: context.getHandler().name,
          statusCode,
          durationMs,
          userId: request.user?.id,
          instanceId: process.env.INSTANCE_ID ?? 'local',
          error: errorName,
          timestamp: new Date().toISOString(),
        };

        if (durationMs >= this.warningThresholdMs || errorName) {
          this.logger.warn(event);
          return;
        }

        this.logger.log(event);
      }),
    );
  }

  private shouldSkip(context: ExecutionContext) {
    return (
      this.reflector.getAllAndOverride<boolean>(SKIP_PERFORMANCE_KEY, [
        context.getHandler(),
        context.getClass(),
      ]) ?? false
    );
  }

  private getRoute(request: MonitoredRequest) {
    const rawUrl = request.originalUrl ?? request.url ?? 'unknown';
    return rawUrl.split('?')[0];
  }
}
