import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, IsNull, MoreThanOrEqual, Repository } from 'typeorm';
import { CompaniesService } from 'src/companies/companies.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductCountDto } from './dto/update-product-count.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './entities/product.entity';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product) private readonly productRepository: Repository<Product>,
    private readonly dataSource: DataSource,
    private readonly companiesService: CompaniesService,
  ) {}

  create(createProductDto: CreateProductDto, user_id: number) {
    return this.dataSource.transaction(async (entityManager) => {
      const company = await this.companiesService.findOneByUser(user_id, entityManager);

      if (!company) {
        throw new UnauthorizedException();
      }

      const product = entityManager.create(Product, {
        ...createProductDto,
        company: { id: company.id },
      });

      return entityManager.save(Product, product);
    });
  }

  findAllWithDeleted() {
    return this.productRepository.find();
  }

  findAll() {
    return this.productRepository.find({ where: { deletedAt: IsNull() } });
  }

  findOne(id: number, entityManager: EntityManager | null = null) {
    const where = { where: { id, deletedAt: IsNull() } };

    if (entityManager) {
      return entityManager.findOne(Product, { ...where, lock: { mode: 'pessimistic_write' } });
    }

    return this.productRepository.findOne(where);
  }

  findOneForBuy(id: number, updateProductCountDto: UpdateProductCountDto, entityManager: EntityManager | null = null) {
    const where = {
      where: {
        id,
        count: MoreThanOrEqual(updateProductCountDto.count),
        deletedAt: IsNull(),
      },
    };

    if (entityManager) {
      return entityManager.findOne(Product, { ...where, lock: { mode: 'pessimistic_write' } });
    }

    return this.productRepository.findOne(where);
  }

  async updateForBuy(id: number, updateProductCountDto: UpdateProductCountDto, entityManager: EntityManager) {
    const product = await this.findOneForBuy(id, updateProductCountDto, entityManager);

    if (!product) {
      throw new NotFoundException();
    }

    const result = await entityManager
      .createQueryBuilder()
      .update(Product)
      .set({ count: () => `count - ${updateProductCountDto.count}` })
      .where('id = :id', { id })
      .andWhere('count >= :count', { count: updateProductCountDto.count })
      .andWhere('"deletedAt" IS NULL')
      .execute();

    if (!result.affected) {
      throw new NotFoundException();
    }

    product.count -= updateProductCountDto.count;
    return product;
  }

  async updateForReturn(id: number, updateProductCountDto: UpdateProductCountDto, entityManager: EntityManager) {
    const product = await this.findOne(id, entityManager);

    if (!product) {
      throw new NotFoundException();
    }

    await entityManager
      .createQueryBuilder()
      .update(Product)
      .set({ count: () => `count + ${updateProductCountDto.count}` })
      .where('id = :id', { id })
      .andWhere('"deletedAt" IS NULL')
      .execute();

    product.count += updateProductCountDto.count;
    return product;
  }

  update(id: number, updateProductDto: UpdateProductDto, user_id: number) {
    return this.dataSource.transaction(async (entityManager) => {
      const company = await this.companiesService.findOneByUser(user_id, entityManager);

      if (!company) {
        throw new UnauthorizedException();
      }

      return entityManager.update(Product, { id, company: { id: company.id } }, updateProductDto);
    });
  }

  remove(id: number, user_id: number) {
    return this.dataSource.transaction(async (entityManager) => {
      const company = await this.companiesService.findOneByUser(user_id, entityManager);

      if (!company) {
        throw new UnauthorizedException();
      }

      return entityManager.update(Product, id, { deletedAt: new Date() });
    });
  }
}
