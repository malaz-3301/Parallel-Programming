import { Controller, Get } from '@nestjs/common';
import { SkipPerformanceMonitoring } from './monitoring/decorators/skip-performance.decorator';
import { Public } from './public.module';
import { AppService } from './app.service';

@SkipPerformanceMonitoring()
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Public()
  @Get('health')
  getHealth() {
    return this.appService.getHealth();
  }

  @Public()
  @Get('instance')
  getInstance() {
    return this.appService.getInstance();
  }
}
