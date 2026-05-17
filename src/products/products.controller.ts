import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { User } from 'src/users/entities/user.entity';
import { Roles } from 'src/auth/utils/roles.decorator';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { JobType } from './products.process';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService, @InjectQueue('product') private productQueue: Queue<JobType>) { }

  @Post()
  async create(@Body() createProductDto: CreateProductDto, @Request() req: { user: User },) {
    // return this.productsService.create(createProductDto, req.user.id);
    await this.productQueue.add('create', { ...createProductDto, user_id: req.user.id });
  }
  @Roles(['admin'])
  @Get('all')
  findAllWithDeleted() {
    return this.productsService.findAllWithDeleted();
  }
  @Get('')
  findAllAvailable() {
    return this.productsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(+id);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto, @Request() req: { user: User }) {
    // return this.productsService.update(+id, updateProductDto, req.user.id);
    await this.productQueue.add('create', { ...updateProductDto, user_id: req.user.id, id: +id });
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Request() req: { user: User }) {
    // return this.productsService.remove(+id, req.user.id);
    await this.productQueue.add('create', { id: +id, user_id: req.user.id });
  }
}
