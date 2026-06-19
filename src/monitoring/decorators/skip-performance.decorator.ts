import { SetMetadata } from '@nestjs/common';

export const SKIP_PERFORMANCE_KEY = 'skip-performance-monitoring';

export const SkipPerformanceMonitoring = () =>
  SetMetadata(SKIP_PERFORMANCE_KEY, true);
