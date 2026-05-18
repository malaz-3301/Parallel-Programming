import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { UserProduct } from 'src/user-products/entities/user-product.entity';
import { OrderStatus } from 'src/confirms/utils/order-status';
import { DailySalesSummary } from './entities/daily-sales-summary.entity';

@Injectable()
export class SalesBatchService {
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(DailySalesSummary)
    private readonly dailySalesSummaryRepository: Repository<DailySalesSummary>,
  ) {}

  async runDailySalesBatch(date = this.getYesterdayDate(), chunkSize = 500) {
    const { startDate, endDate } = this.getDateRange(date);
    let offset = 0;
    let processedChunks = 0;
    let processedProducts = 0;

    while (true) {
      const rows = await this.readSalesChunk(startDate, endDate, chunkSize, offset);

      if (!rows.length) {
        break;
      }

      await this.dailySalesSummaryRepository.upsert(
        rows.map((row) => ({
          summaryDate: date,
          productId: Number(row.productId),
          totalQuantity: Number(row.totalQuantity),
          totalRevenue: Number(row.totalRevenue),
        })),
        ['summaryDate', 'productId'],
      );

      processedChunks += 1;
      processedProducts += rows.length;
      offset += chunkSize;
    }

    return {
      date,
      processedChunks,
      processedProducts,
    };
  }

  private readSalesChunk(startDate: Date, endDate: Date, chunkSize: number, offset: number) {
    return this.dataSource
      .createQueryBuilder(UserProduct, 'userProduct')
      .innerJoin('userProduct.product', 'product')
      .innerJoin('userProduct.cart', 'cart')
      .innerJoin('cart.confirm', 'confirm')
      .select('product.id', 'productId')
      .addSelect('SUM(userProduct.count)', 'totalQuantity')
      .addSelect('SUM(userProduct.price)', 'totalRevenue')
      .where('confirm.status = :status', { status: OrderStatus.COMPLETED })
      .andWhere('confirm.createdAt >= :startDate', { startDate })
      .andWhere('confirm.createdAt < :endDate', { endDate })
      .groupBy('product.id')
      .orderBy('product.id', 'ASC')
      .offset(offset)
      .limit(chunkSize)
      .getRawMany<{ productId: string; totalQuantity: string; totalRevenue: string }>();
  }

  private getDateRange(date: string) {
    const startDate = new Date(`${date}T00:00:00.000Z`);
    const endDate = new Date(startDate);
    endDate.setUTCDate(endDate.getUTCDate() + 1);

    return { startDate, endDate };
  }

  private getYesterdayDate() {
    const date = new Date();
    date.setUTCDate(date.getUTCDate() - 1);

    return date.toISOString().slice(0, 10);
  }
}
