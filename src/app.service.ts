import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHealth() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }

  getInstance() {
    return {
      instanceId: process.env.INSTANCE_ID ?? 'local',
      appName: process.env.APP_NAME ?? 'local',
      nodeEnv: process.env.NODE_ENV ?? 'development',
    };
  }
}
