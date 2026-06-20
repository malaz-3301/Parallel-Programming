import { Injectable } from '@nestjs/common';
import * as os from 'os';

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

  async getResources() {
    const cpuBefore = this.getCpuTimes();
    await new Promise((resolve) => setTimeout(resolve, 100));
    const cpuAfter = this.getCpuTimes();

    const totalDifference = cpuAfter.total - cpuBefore.total;
    const idleDifference = cpuAfter.idle - cpuBefore.idle;
    const cpuUsagePercent =
      totalDifference > 0
        ? Number(((1 - idleDifference / totalDifference) * 100).toFixed(2))
        : 0;

    const totalMemory = os.totalmem();
    const freeMemory = os.freemem();
    const usedMemory = totalMemory - freeMemory;
    const processMemory = process.memoryUsage();

    return {
      instanceId: process.env.INSTANCE_ID ?? 'local',
      hostname: os.hostname(),
      platform: os.platform(),
      architecture: os.arch(),
      cpu: {
        model: os.cpus()[0]?.model ?? 'unknown',
        cores: os.cpus().length,
        usagePercent: cpuUsagePercent,
        loadAverage: {
          oneMinute: os.loadavg()[0],
          fiveMinutes: os.loadavg()[1],
          fifteenMinutes: os.loadavg()[2],
        },
      },
      memory: {
        totalMb: this.toMegabytes(totalMemory),
        usedMb: this.toMegabytes(usedMemory),
        freeMb: this.toMegabytes(freeMemory),
        usagePercent: Number(((usedMemory / totalMemory) * 100).toFixed(2)),
      },
      processMemory: {
        rssMb: this.toMegabytes(processMemory.rss),
        heapTotalMb: this.toMegabytes(processMemory.heapTotal),
        heapUsedMb: this.toMegabytes(processMemory.heapUsed),
        externalMb: this.toMegabytes(processMemory.external),
      },
      systemUptimeSeconds: Math.floor(os.uptime()),
      processUptimeSeconds: Math.floor(process.uptime()),
      timestamp: new Date().toISOString(),
    };
  }

  private getCpuTimes() {
    return os.cpus().reduce(
      (result, cpu) => {
        const total = Object.values(cpu.times).reduce(
          (sum, value) => sum + value,
          0,
        );

        return {
          idle: result.idle + cpu.times.idle,
          total: result.total + total,
        };
      },
      { idle: 0, total: 0 },
    );
  }

  private toMegabytes(bytes: number) {
    return Number((bytes / 1024 / 1024).toFixed(2));
  }
}
