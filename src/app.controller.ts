import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { Public as AllowAnonymous } from './public.module';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @AllowAnonymous()
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @AllowAnonymous()
  @Get('health')
  getHealth() {
    return this.appService.getHealth();
  }

  @AllowAnonymous()
  @Get('instance')
  getInstance() {
    return this.appService.getInstance();
  }
}
