import { Inject, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Brackets, DataSource, EntityManager, FindManyOptions, IsNull, LessThanOrEqual, Like, MoreThanOrEqual, Repository } from 'typeorm';
import { CompaniesService } from 'src/companies/companies.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductCountPriceDto } from './dto/update-product-count-price.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './entities/product.entity';
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';
import { OrderStatus } from 'src/confirms/utils/order-status';
import { ConfigService } from '@nestjs/config';
import { FilterProductDto } from './dto/filter-product-dto';
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
    const catalogTtl = Number(this.configService.get<string>('CACHE_TTL')) || 600;
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
    const catalogTtl = Number(this.configService.get<string>('CACHE_TTL')) || 600;
    await this.cacheManager.set('best_rating', getBestRating, catalogTtl * 1000);
    return getBestRating;
  }
  async findAll(productDto: FilterProductDto | null = null) {
    const queryBuilder = this.productRepository.createQueryBuilder('product')
      .where('product.deletedAt IS NULL');
    if (productDto?.minPrice !== undefined && productDto?.maxPrice !== undefined) {
      queryBuilder.andWhere('product.price BETWEEN :minPrice AND :maxPrice', {
        minPrice: productDto.minPrice,
        maxPrice: productDto.maxPrice,
      });
    }
    else if (productDto?.maxPrice !== undefined) {
      queryBuilder.andWhere('product.price <= :maxPrice', {
        maxPrice: productDto.maxPrice,
      });
    }
    else if (productDto?.minPrice !== undefined) {
      queryBuilder.andWhere('product.price >= :minPrice', {
        minPrice: productDto.minPrice,
      });
    }
    if (productDto?.keywords) {
      const keywords = productDto.keywords.split(' ').filter(word => word.trim() !== '');
      if (keywords.length > 0) {
        let scoreFormula = '';
        queryBuilder.andWhere(new Brackets(qb => {
          keywords.forEach((word, index) => {
            const paramName = `word_${index}`;
            if (index === 0) {
              qb.where(`product.details LIKE :${paramName}`, { [paramName]: `%${word}%` });
            } else {
              qb.orWhere(`product.details LIKE :${paramName}`, { [paramName]: `%${word}%` });
            }
            scoreFormula += `(CASE WHEN product.details LIKE :${paramName} THEN 1 ELSE 0 END)`;
            if (index < keywords.length - 1) {
              scoreFormula += ' + ';
            }
          });
        }));
        queryBuilder
          .addSelect(scoreFormula, 'match_score')
          .orderBy('match_score', 'DESC');
      }
    }
    return await queryBuilder.getMany();
  }
  async findOne(id: number, entityManager: EntityManager | null = null) {
    const where = { where: { id, deletedAt: IsNull() } };
    if (entityManager) {
      return entityManager.findOne(Product, { ...where, lock: { mode: 'pessimistic_write' } });
    }
    const product = await this.cacheManager.get<Product>('product' + id);
    if (product) {
      console.log('from cache');
      return product;
    }
    const getProduct = await this.productRepository.findOne(where);
    const catalogTtl = Number(this.configService.get<string>('CACHE_TTL2')) || 600;
    await this.cacheManager.set('product' + id, getProduct, catalogTtl * 1000);
    return getProduct;
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
    console.log(product, updateProductCountDto.count)
    if (product) {
      console.log(product.count, updateProductCountDto.count)
      await this.updateCountAndPrice(id, { count: product.count - updateProductCountDto.count }, entityManager)
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
      console.log(product)
      if (product) {
        console.log(product.count, products[index].productCount)
        await this.updateCountAndPrice(products[index].productId, { count: product.count + products[index].productCount }, entityManager);
      }
    }
    // entityManager.createQueryBuilder(Product, 'product').update()
    // await entityManager.createQueryBuilder()
    //   .update('product')
    //   .set({
    //     count: () => `"product"."count" + "userProduct"."count"`
    //   })
  }
  async update(id: number, updateProductDto: UpdateProductDto, user_id: number) {
    return this.dataSource.transaction(async (entityManager) => {
      const company = await this.companiesService.findOneByUser(user_id);
      if (!company) {
        throw new UnauthorizedException();
      }
      const product = await this.findOne(id, entityManager)
      if (!product) {
        throw new NotFoundException();
      }
      return entityManager.update(Product, { id, company: { id: company.id } }, { ...updateProductDto });
    });
  }
  async updateCountAndPrice(id: number, updateProductCountPriceDto: UpdateProductCountPriceDto, entityManager: EntityManager) {
    await this.cacheManager.del('product' + id);
    console.log(updateProductCountPriceDto)
    return entityManager.update(Product, id, updateProductCountPriceDto);
  }
  remove(id: number, user_id: number) {
    return this.dataSource.transaction(async (entityManager) => {
      const company = await this.companiesService.findOneByUser(user_id);
      if (!company) {
        throw new UnauthorizedException();
      }
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
      .limit(10)
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
      .limit(10)
      .getRawMany();
  }
}
