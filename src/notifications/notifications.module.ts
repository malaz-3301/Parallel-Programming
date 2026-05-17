import { Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import { Notification } from './entities/notification.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from 'src/users/users.module';
import { NotificationConsumer, StepsConsumer } from './notification.processor';
import { BullModule } from '@nestjs/bullmq';

@Module({
  imports: [TypeOrmModule.forFeature([Notification]), UsersModule,
  BullModule.registerFlowProducer({
    name: 'sendNotificationForAllUser',
  }),],
  controllers: [NotificationsController],
  providers: [NotificationsService, NotificationConsumer, StepsConsumer],
  exports: [NotificationsService]
})
export class NotificationsModule { }
