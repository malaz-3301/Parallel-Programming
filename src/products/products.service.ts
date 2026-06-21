import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Brackets,
  DataSource,
  EntityManager,
  IsNull,
  MoreThanOrEqual,
  Repository,
} from 'typeorm';
import { RedisCacheService } from 'src/cache/redis-cache.service';
import { CompaniesService } from 'src/companies/companies.service';
import { OrderStatus } from 'src/confirms/utils/order-status';
import { CreateProductDto } from './dto/create-product.dto';
import { FilterProductDto } from './dto/filter-product-dto';
import { UpdateProductCountPriceDto } from './dto/update-product-count-price.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './entities/product.entity';

export type StockItem = {
  productId: number;
  quantity: number;
};

const CACHE_KEYS = {
  bestSellers: 'products:best-sellers',
  bestRating: 'products:best-rating',
  product: (id: number) => `products:${id}`,
};

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    private readonly dataSource: DataSource,
    private readonly companiesService: CompaniesService,
    private readonly cache: RedisCacheService,
    private readonly configService: ConfigService,
  ) {}

  async create(createProductDto: CreateProductDto, userId: number) {
    const company = await this.companiesService.findOneByUser(userId);

    if (!company) {
      throw new UnauthorizedException();
    }

    const product = this.productRepository.create({
      ...createProductDto,
      company: { id: company.id },
    });
    const savedProduct = await this.productRepository.save(product);

    await this.invalidateCatalogCache();
    return savedProduct;
  }

  findAllWithDeleted() {
    return this.productRepository.find();
  }

  async findBestSellers() {
    const cached = await this.cache.get<Record<string, unknown>[]>(
      CACHE_KEYS.bestSellers,
    );

    if (cached) {
      return cached;
    }

    const products = await this.bestSellersQuery();
    await this.cache.set(
      CACHE_KEYS.bestSellers,
      products,
      this.catalogTtlSeconds(),
    );
    return products;
  }

  async findBestRating() {
    const cached = await this.cache.get<Record<string, unknown>[]>(
      CACHE_KEYS.bestRating,
    );

    if (cached) {
      return cached;
    }

    const products = await this.bestRatingQuery();
    await this.cache.set(
      CACHE_KEYS.bestRating,
      products,
      this.catalogTtlSeconds(),
    );
    return products;
  }

  async findAll(productDto: FilterProductDto | null = null) {
    const queryBuilder = this.productRepository
      .createQueryBuilder('product')
      .where('product.deletedAt IS NULL');

    if (
      productDto?.minPrice !== undefined &&
      productDto?.maxPrice !== undefined
    ) {
      queryBuilder.andWhere('product.price BETWEEN :minPrice AND :maxPrice', {
        minPrice: productDto.minPrice,
        maxPrice: productDto.maxPrice,
      });
    } else if (productDto?.maxPrice !== undefined) {
      queryBuilder.andWhere('product.price <= :maxPrice', {
        maxPrice: productDto.maxPrice,
      });
    } else if (productDto?.minPrice !== undefined) {
      queryBuilder.andWhere('product.price >= :minPrice', {
        minPrice: productDto.minPrice,
      });
    }

    if (productDto?.keywords) {
      const keywords = productDto.keywords
        .split(/\s+/)
        .map((word) => word.trim())
        .filter(Boolean);

      if (keywords.length) {
        let scoreFormula = '';

        queryBuilder.andWhere(
          new Brackets((whereBuilder) => {
            keywords.forEach((word, index) => {
              const parameterName = `word_${index}`;
              const condition = `product.details ILIKE :${parameterName}`;
              const parameters = { [parameterName]: `%${word}%` };

              if (index === 0) {
                whereBuilder.where(condition, parameters);
              } else {
                whereBuilder.orWhere(condition, parameters);
              }

              scoreFormula += `(CASE WHEN ${condition} THEN 1 ELSE 0 END)`;
              if (index < keywords.length - 1) {
                scoreFormula += ' + ';
              }
            });
          }),
        );

        queryBuilder
          .addSelect(scoreFormula, 'match_score')
          .orderBy('match_score', 'DESC');
      }
    }

    return queryBuilder.getMany();
  }

  async findOne(id: number, entityManager?: EntityManager) {
    if (entityManager) {
      return entityManager.findOne(Product, {
        where: { id, deletedAt: IsNull() },
        lock: { mode: 'pessimistic_write' },
      });
    }

    const cached = await this.cache.get<Product>(CACHE_KEYS.product(id));
    if (cached) {
      return cached;
    }

    const product = await this.productRepository.findOne({
      where: { id, deletedAt: IsNull() },
    });

    if (product) {
      await this.cache.set(
        CACHE_KEYS.product(id),
        product,
        this.productTtlSeconds(),
      );
    }

    return product;
  }

  async findAvailableProduct(
    id: number,
    quantity: number,
    entityManager: EntityManager,
  ) {
    this.assertPositiveQuantity(quantity);

    return entityManager.findOne(Product, {
      where: {
        id,
        count: MoreThanOrEqual(quantity),
        deletedAt: IsNull(),
      },
    });
  }

  async decreaseStock(items: StockItem[], entityManager: EntityManager) {
    const normalizedItems = this.normalizeStockItems(items);

    for (const item of normalizedItems) {
      const product = await this.findOne(item.productId, entityManager);

      if (!product || product.count < item.quantity) {
        throw new ConflictException(
          `Insufficient stock for product ${item.productId}`,
        );
      }

      await this.updateStock(
        product.id,
        product.count - item.quantity,
        entityManager,
      );
    }
  }

  async increaseStock(items: StockItem[], entityManager: EntityManager) {
    const normalizedItems = this.normalizeStockItems(items);

    for (const item of normalizedItems) {
      const product = await this.findOne(item.productId, entityManager);

      if (!product) {
        throw new NotFoundException(
          `Product ${item.productId} was not found`,
        );
      }

      await this.updateStock(
        product.id,
        product.count + item.quantity,
        entityManager,
      );
    }
  }

  async update(id: number, updateProductDto: UpdateProductDto, userId: number) {
    const result = await this.dataSource.transaction(async (entityManager) => {
      const company = await this.companiesService.findOneByUser(userId);

      if (!company) {
        throw new UnauthorizedException();
      }

      const product = await this.findOne(id, entityManager);
      if (!product) {
        throw new NotFoundException();
      }

      const updateResult = await entityManager.update(
        Product,
        { id, company: { id: company.id } },
        updateProductDto,
      );

      if (updateResult.affected !== 1) {
        throw new ConflictException(
          'The product was changed by another request',
        );
      }

      return entityManager.findOneByOrFail(Product, { id });
    });

    await this.invalidateProductCache(id);
    await this.invalidateCatalogCache();
    return result;
  }

  async updateCountAndPrice(
    id: number,
    updateProductCountPriceDto: UpdateProductCountPriceDto,
    entityManager: EntityManager,
  ) {
    const result = await entityManager.update(
      Product,
      id,
      updateProductCountPriceDto,
    );

    if (result.affected !== 1) {
      throw new ConflictException('The product was changed by another request');
    }

    await this.invalidateProductCache(id);
    return result;
  }

  async remove(id: number, userId: number) {
    await this.dataSource.transaction(async (entityManager) => {
      const company = await this.companiesService.findOneByUser(userId);

      if (!company) {
        throw new UnauthorizedException();
      }

      const result = await entityManager.update(
        Product,
        { id, company: { id: company.id } },
        { deletedAt: new Date() },
      );

      if (result.affected !== 1) {
        throw new NotFoundException();
      }
    });

    await this.invalidateProductCache(id);
    await this.invalidateCatalogCache();
  }

  async invalidateRatingCache() {
    await this.cache.delete(CACHE_KEYS.bestRating);
  }

  private async updateStock(
    id: number,
    count: number,
    entityManager: EntityManager,
  ) {
    const result = await entityManager.update(Product, { id }, { count });

    if (result.affected !== 1) {
      throw new ConflictException('The stock was changed by another request');
    }

    await this.invalidateProductCache(id);
    await this.cache.delete(CACHE_KEYS.bestSellers);
  }

  private bestSellersQuery() {
    return this.productRepository
      .createQueryBuilder('product')
      .leftJoin('product.userProducts', 'userProduct')
      .leftJoin('userProduct.cart', 'cart')
      .leftJoin('cart.confirm', 'confirm')
      .where('product.deletedAt IS NULL')
      .andWhere('confirm.status = :status', {
        status: OrderStatus.COMPLETED,
      })
      .select([
        'product.id AS id',
        'product.count AS count',
        'product.price AS price',
        'product.photo AS photo',
        'product.details AS details',
      ])
      .addSelect('COALESCE(SUM(userProduct.count), 0)', 'totalSales')
      .groupBy('product.id')
      .orderBy('"totalSales"', 'DESC')
      .limit(10)
      .getRawMany<Record<string, unknown>>();
  }

  private bestRatingQuery() {
    return this.productRepository
      .createQueryBuilder('product')
      .leftJoin('product.comments', 'comment')
      .where('product.deletedAt IS NULL')
      .select([
        'product.id AS id',
        'product.count AS count',
        'product.price AS price',
        'product.photo AS photo',
        'product.details AS details',
      ])
      .addSelect('COALESCE(AVG(comment.rating), 0)', 'averageRating')
      .addSelect('COUNT(comment.id)', 'ratingsCount')
      .groupBy('product.id')
      .orderBy('"averageRating"', 'DESC')
      .addOrderBy('"ratingsCount"', 'DESC')
      .limit(10)
      .getRawMany<Record<string, unknown>>();
  }

  private normalizeStockItems(items: StockItem[]) {
    const quantities = new Map<number, number>();

    for (const item of items) {
      this.assertPositiveQuantity(item.quantity);
      quantities.set(
        item.productId,
        (quantities.get(item.productId) ?? 0) + item.quantity,
      );
    }

    return [...quantities.entries()]
      .map(([productId, quantity]) => ({ productId, quantity }))
      .sort((left, right) => left.productId - right.productId);
  }

  private assertPositiveQuantity(quantity: number) {
    if (!Number.isInteger(quantity) || quantity <= 0) {
      throw new BadRequestException(
        'Product quantity must be a positive integer',
      );
    }
  }

  private async invalidateProductCache(id: number) {
    await this.cache.delete(CACHE_KEYS.product(id));
  }

  private async invalidateCatalogCache() {
    await this.cache.delete(CACHE_KEYS.bestSellers, CACHE_KEYS.bestRating);
  }

  private productTtlSeconds() {
    return Number(
      this.configService.get<string>('CACHE_PRODUCT_TTL') ?? 100000,
    );
  }

  private catalogTtlSeconds() {
    return Number(
      this.configService.get<string>('CACHE_CATALOG_TTL') ?? 10000000,
    );
  }
}
