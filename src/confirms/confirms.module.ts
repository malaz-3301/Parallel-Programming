import { BullModule } from '@nestjs/bullmq';
import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CartsModule } from 'src/carts/carts.module';
import { PaymentsModule } from 'src/payments/payments.module';
import { ProductsModule } from 'src/products/products.module';
import { ConfirmsController } from './confirms.controller';
import { ConfirmConsumer } from './confirms.process';
import { ConfirmsService } from './confirms.service';
import { Confirm } from './entities/confirm.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Confirm]),
    forwardRef(() => CartsModule),
    ProductsModule,
    PaymentsModule,
    BullModule.registerQueue({
      name: 'confirm',
      defaultJobOptions: {
        attempts: 3,
        backoff: { type: 'exponential', delay: 1000 },
        removeOnComplete: 1000,
        removeOnFail: 5000,
      },
    }),
  ],
  controllers: [ConfirmsController],
  providers: [ConfirmsService, ConfirmConsumer],
  exports: [ConfirmsService],
})
export class ConfirmsModule {}
