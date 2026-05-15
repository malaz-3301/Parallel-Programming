import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './entities/product.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, IsNull, LessThanOrEqual, MoreThan, MoreThanOrEqual, Repository, Transaction, } from 'typeorm';
import { UsersService } from 'src/users/users.service';
import { CompaniesService } from 'src/companies/companies.service';
import { UpdateProductCountDto } from './dto/update-product-count.dto';

@Injectable()
export class ProductsService {
  constructor(@InjectRepository(Product) private productRepository: Repository<Product>, private dataSource: DataSource, private companiesService: CompaniesService) { }
  create(createProductDto: CreateProductDto, user_id: number) {
    return this.dataSource.transaction(async (entityManager) => {
      const company = await this.companiesService.findOneByUser(user_id, entityManager)
      if (!company) {
        throw new UnauthorizedException();
      }
      const product = entityManager.create(Product, { ...createProductDto, company: { id: company.id }, });
      return entityManager.save(Product, product)
    })
  }

  findAll() {
    return this.productRepository.find();
  }

  findOne(id: number, entityManager: EntityManager | null = null) {
    const where = { where: { id, deletedAt: IsNull() } }
    if (entityManager) {
      entityManager.findOne(Product, where)
    }
    return this.productRepository.findOne(where)
  }
  findOneForBuy(id: number, updateProductCountDto: UpdateProductCountDto, entityManager: EntityManager | null = null) {
    const where = { where: { id, count: MoreThanOrEqual(updateProductCountDto.count), deletedAt: IsNull() } }
    if (entityManager) {
      entityManager.findOne(Product, where)
    }
    return this.productRepository.findOne(where)
  }
  async updateForBuy(id: number, updateProductCountDto: UpdateProductCountDto, entityManager: EntityManager ) {
      const product = await this.findOneForBuy(id, updateProductCountDto, entityManager);
      if (!product) {
        throw new NotFoundException();
      }
      await entityManager.update(Product, id, { count: product.count - updateProductCountDto.count });
      return product
  }
  async updateForReturn(id: number, updateProductCountDto: UpdateProductCountDto, entityManager: EntityManager ) {

      const product = await this.findOne(id, entityManager);
      if (!product) {
        throw new NotFoundException();
      }
      await entityManager.update(Product, id, { count: product.count + updateProductCountDto.count });
      return product
  }


  update(id: number, updateProductDto: UpdateProductDto, user_id: number) {
    return this.dataSource.transaction(async (entityManager) => {
      const product = await this.findOne(id, entityManager);
      return entityManager.update(Product, id, updateProductDto);
    })
  }

  remove(id: number, user_id: number) {
    return this.dataSource.transaction(async (entityManager) => {
      const company = await this.companiesService.findOneByUser(user_id, entityManager)
      if (!company) {
        throw new UnauthorizedException();
      }
      return entityManager.update(Product, id, { deletedAt: Date.now() })
    })
  }
}

// this.dataSource.transaction( async (e) => {
//   let temp = await e.findOne(Product, { where: { id } , lock : {mode : 'pessimistic_write'}})
//   console.log('adl');
//   await new Promise(resolve => setTimeout(resolve, 10000));
//   console.log('mohammed');
//   if(temp)
//   await e.save(Product,{ ...temp, price : temp?.price - 100  })
// })