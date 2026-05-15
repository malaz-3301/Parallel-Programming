import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { User } from 'src/users/entities/user.entity';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) { }

  @Post()
  create(@Body() createProductDto: CreateProductDto, @Request() req: { user: User }) {
    return this.productsService.create(createProductDto, req.user.id);
  }
  
  @Get()
  findAll() {
    return this.productsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto, @Request() req: { user: User }) {
    return this.productsService.update(+id, updateProductDto, req.user.id);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req: { user: User }) {
    return this.productsService.remove(+id, req.user.id);
  }
}
