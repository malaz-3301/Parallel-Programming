import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bullmq';
import { UsersModule } from 'src/users/users.module';
import { Notification } from './entities/notification.entity';
import { NotificationConsumer, StepsConsumer } from './notification.processor';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Notification]),
    UsersModule,
    BullModule.registerFlowProducer({
      name: 'sendNotificationForAllUser',
    }),
    BullModule.registerQueue(
      {
        name: 'notification',
        defaultJobOptions: {
          attempts: 3,
          backoff: { type: 'exponential', delay: 1000 },
          removeOnComplete: 1000,
          removeOnFail: 5000,
        },
      },
      {
        name: 'steps',
        defaultJobOptions: {
          attempts: 3,
          backoff: { type: 'exponential', delay: 1000 },
          removeOnComplete: 1000,
          removeOnFail: 5000,
        },
      },
    ),
  ],
  controllers: [NotificationsController],
  providers: [NotificationsService, NotificationConsumer, StepsConsumer],
  exports: [NotificationsService],
})
export class NotificationsModule {}
