import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './entities/product.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, IsNull, MoreThan, MoreThanOrEqual, Repository, Transaction, } from 'typeorm';
import { UsersService } from 'src/users/users.service';
import { CompaniesService } from 'src/companies/companies.service';
import { UpdateProductCountDto } from './dto/update-product-count.dto';

@Injectable()
export class ProductsService {
  constructor(@InjectRepository(Product) private productRepository: Repository<Product>, private dataSource: DataSource, private companiesService: CompaniesService) { }
  async create(createProductDto: CreateProductDto, user_id: number) {
    const company = await this.companiesService.findOneByUser(user_id)
    if (!company) {
      throw new UnauthorizedException();
    }
    const product = this.productRepository.create({ ...createProductDto, company: { id: company.id }, });
    return this.productRepository.save(product)
  }

  findAll() {
    return this.productRepository.find();
  }

  findOne(id: number) {
    return this.productRepository.findOne({ where: { id, deletedAt: IsNull() } })
  }
  findOneForBuy(id: number, updateProductCountDto: UpdateProductCountDto) {
    return this.productRepository.findOne({ where: { id, count: MoreThanOrEqual(updateProductCountDto.count), deletedAt: IsNull() } })
  }
  async updateForBuy(id: number, updateProductCountDto: UpdateProductCountDto, user_id: number) {
    return this.dataSource.transaction(async (e) => {
      const product = await this.findOneForBuy(id, updateProductCountDto);
      if (!product) {
        throw new NotFoundException();
      }
      await this.productRepository.update(id, { count: product.count - updateProductCountDto.count });
      return product
    })
  }

  async update(id: number, updateProductDto: UpdateProductDto, user_id: number) {
    const product = await this.productRepository.findOne({ where: { id } });
    return this.productRepository.update(id, updateProductDto);
  }

  async remove(id: number, user_id: number) {
    const company = await this.companiesService.findOneByUser(user_id)
    if (!company) {
      throw new UnauthorizedException();
    }
    return this.productRepository.update(id, { deletedAt: Date.now() })
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