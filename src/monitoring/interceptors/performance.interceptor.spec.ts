import { CallHandler, ExecutionContext, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { lastValueFrom, of } from 'rxjs';
import { PerformanceInterceptor } from './performance.interceptor';

class TestController {
  testHandler() {
    return null;
  }
}

describe('PerformanceInterceptor', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('logs HTTP timing metadata', async () => {
    const reflector = {
      getAllAndOverride: jest.fn().mockReturnValue(false),
    } as unknown as Reflector;
    const configService = {
      get: jest.fn((key: string) => {
        if (key === 'PERFORMANCE_WARN_MS') return '1000';
        if (key === 'PERFORMANCE_LOG_ALL') return 'true';
        return undefined;
      }),
    } as unknown as ConfigService;
    const logSpy = jest.spyOn(Logger.prototype, 'log').mockImplementation();
    const next: CallHandler = { handle: () => of({ ok: true }) };
    const interceptor = new PerformanceInterceptor(reflector, configService);

    await lastValueFrom(interceptor.intercept(createHttpContext(), next));

    expect(logSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        event: 'http.performance',
        method: 'GET',
        route: '/products/best-sellers',
        controller: 'TestController',
        handler: 'testHandler',
        statusCode: 200,
        userId: 7,
      }),
    );
  });

  it('skips handlers marked to skip monitoring', async () => {
    const reflector = {
      getAllAndOverride: jest.fn().mockReturnValue(true),
    } as unknown as Reflector;
    const configService = { get: jest.fn() } as unknown as ConfigService;
    const logSpy = jest.spyOn(Logger.prototype, 'log').mockImplementation();
    const warnSpy = jest.spyOn(Logger.prototype, 'warn').mockImplementation();
    const interceptor = new PerformanceInterceptor(reflector, configService);

    await lastValueFrom(
      interceptor.intercept(createHttpContext(), { handle: () => of('ok') }),
    );

    expect(logSpy).not.toHaveBeenCalled();
    expect(warnSpy).not.toHaveBeenCalled();
  });
});

function createHttpContext() {
  return {
    getType: () => 'http',
    getClass: () => TestController,
    getHandler: () => TestController.prototype.testHandler,
    switchToHttp: () => ({
      getRequest: () => ({
        method: 'GET',
        originalUrl: '/products/best-sellers?unused=true',
        user: { id: 7 },
      }),
      getResponse: () => ({ statusCode: 200 }),
    }),
  } as unknown as ExecutionContext;
}
