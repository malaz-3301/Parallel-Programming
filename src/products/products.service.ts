import { Inject, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, IsNull, MoreThanOrEqual, Repository } from 'typeorm';
import { CompaniesService } from 'src/companies/companies.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductCountPriceDto } from './dto/update-product-count-price.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './entities/product.entity';
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';
import { OrderStatus } from 'src/confirms/utils/order-status';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product) private readonly productRepository: Repository<Product>,
    private readonly dataSource: DataSource,
    private readonly companiesService: CompaniesService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly configService: ConfigService,
  ) { }
  async create(createProductDto: CreateProductDto, user_id: number) {
    const company = await this.companiesService.findOneByUser(user_id);
    if (!company) {
      throw new UnauthorizedException();
    }
    const product = this.productRepository.create({
      ...createProductDto,
      company: { id: company.id },
    });
    await this.clearProductCaches();
    return this.productRepository.save(product);
  }
  findAllWithDeleted() {
    return this.productRepository.find();
  }
  async findBestSellers() {
    const bestSellers = await this.cacheManager.get<Product[]>('best_sellers');
    if (bestSellers) {
      console.log('from cache');
      return bestSellers;
    }
    const getBestSellers = await this.BestSellers();
    const catalogTtl = Number(this.configService.get<string>('CATALOG_CACHE_TTL')) || 600;
    await this.cacheManager.set('best_sellers', getBestSellers, catalogTtl * 1000);
    return getBestSellers;
  }
  async findBestRating() {
    const bestRating = await this.cacheManager.get<Product[]>('best_rating');
    if (bestRating) {
      console.log('from cache');
      return bestRating;
    }
    const getBestRating = await this.BestRating();
    const catalogTtl = Number(this.configService.get<string>('CATALOG_CACHE_TTL')) || 600;
    await this.cacheManager.set('best_rating', getBestRating, catalogTtl * 1000);
    return getBestRating;
  }
  async findAll() {
    const cacheKey = 'product_list';
    const cached = await this.cacheManager.get<Product[]>(cacheKey);
    if (cached) return cached;
    const result = await this.productRepository.find({ where: { deletedAt: IsNull() } });
    const ttlSeconds = Number(this.configService.get<string>('PRODUCT_CACHE_TTL')) || 300;
    await this.cacheManager.set(cacheKey, result, ttlSeconds * 1000);
    return result;
  }

  private async clearProductCaches() {
    await this.cacheManager.del('product_list');
    await this.cacheManager.del('product_all_deleted');
    await this.cacheManager.del('best_sellers');
    await this.cacheManager.del('best_rating');
  }

  findOne(id: number, entityManager: EntityManager | null = null) {
    const where = { where: { id, deletedAt: IsNull() } };
    if (entityManager) {
      return entityManager.findOne(Product, { ...where, lock: { mode: 'pessimistic_write' } });
    }
    return this.productRepository.findOne(where);
  }
  findOneForBuy(id: number, updateProductCountDto: UpdateProductCountPriceDto, entityManager: EntityManager) {
    if (!updateProductCountDto.count) {
      throw new NotFoundException()
    }
    if (updateProductCountDto.count <= 0) {
      throw new NotFoundException()
    }
    const where = {
      where: {
        id,
        count: MoreThanOrEqual(updateProductCountDto.count),
        deletedAt: IsNull(),
      },
    };
    return entityManager.findOne(Product, { ...where, lock: { mode: 'pessimistic_write' } });
  }
  async updateForBuy(id: number, updateProductCountDto: UpdateProductCountPriceDto, entityManager: EntityManager) {
      if (!updateProductCountDto.count) {
        throw new NotFoundException()
      }
      if (updateProductCountDto.count <= 0) {
        throw new NotFoundException()
      }
      const product = await this.findOneForBuy(id, updateProductCountDto, entityManager);
      if (product) {
        await this.updateCountAndPrice(id, { count: product.count - updateProductCountDto.count }, entityManager)
        await this.clearProductCaches();
        return product;
      }
      else {
        throw new NotFoundException();
      }
  }
  async updateForReturn(products: { productId: number, productCount: number }[], entityManager: EntityManager) {
      for (let index = 0; index < products.length; index++) {
        if (products[index].productCount <= 0) {
          continue;
        }
        const product = await this.findOne(products[index].productId, entityManager);
        if (product) {
          await this.updateCountAndPrice(products[index].productId, { count: product.count + products[index].productCount }, entityManager);
        }
      }
      await this.clearProductCaches();
  }
  async update(id: number, updateProductDto: UpdateProductDto, user_id: number) {
    const company = await this.companiesService.findOneByUser(user_id);
    if (!company) {
      throw new UnauthorizedException();
    }
    await this.clearProductCaches();
        return this.productRepository.update({ id, company: { id: company.id } }, { ...updateProductDto });
  }
  // async updateCountAndPriceForAdmin(id: number, updateProductCountPriceDto: UpdateProductCountPriceDto, user_id: number) {
  //   const company = await this.companiesService.findOneByUser(user_id);
  //   if (!company) {
  //     throw new UnauthorizedException();
  //   }
  //   return this.productRepository.update(id, { ...updateProductCountPriceDto });
  // }
  async updateCountAndPrice(id: number, updateProductCountPriceDto: UpdateProductCountPriceDto, entityManager: EntityManager) {
    return entityManager.update(Product, id, { ...updateProductCountPriceDto });
  }
  remove(id: number, user_id: number) {
    return this.dataSource.transaction(async (entityManager) => {
      const company = await this.companiesService.findOneByUser(user_id);
      if (!company) {
        throw new UnauthorizedException();
      }
      await this.clearProductCaches();
        return entityManager.update(Product, id, { deletedAt: new Date() });
    });
  }
  BestSellers() {
    return this.productRepository.createQueryBuilder('product')
      .leftJoin('product.carts', 'userproduct')
      .leftJoin('userproduct.cart', 'cart')
      .leftJoin('cart.confirm', 'confirm')
      .where('cart.confirmId IS NOT NULL')
      .where('confirm.status = :status', { status: OrderStatus.COMPLETED })
      .select([
        'product.id AS id',
        'product.count AS count',
        'product.price AS price',
        'product.photo AS photo',
        'product.details AS details',
      ])
      .addSelect('SUM(userproduct.count)', 'totalSales')
      .groupBy('product.id')
      .orderBy('"totalSales"', 'DESC')
      .take(10)
      .getRawMany();
  }
  BestRating() {
    return this.productRepository.createQueryBuilder('product')
      .leftJoin('product.comments', 'comment')
      .select([
        'product.id AS id',
        'product.count AS count',
        'product.price AS price',
        'product.photo AS photo',
        'product.details AS details',
      ])
      .addSelect('SUM(comment.rating)', 'totalRate')
      .groupBy('product.id')
      .orderBy('"totalRate"', 'DESC')
      .take(10)
      .getRawMany();
  }
}
