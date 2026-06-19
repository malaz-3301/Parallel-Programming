import { BadRequestException, Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';

export type PaymentAuthorization = {
  reference: string;
};

@Injectable()
export class PaymentService {
  async authorize(paymentToken: string, amount: number): Promise<PaymentAuthorization> {
    if (!paymentToken || paymentToken.trim().length < 16) {
      throw new BadRequestException('Invalid payment token');
    }

    if (!Number.isFinite(amount) || amount <= 0) {
      throw new BadRequestException('Payment amount must be positive');
    }

    return {
      reference: randomUUID(),
    };
  }
}
