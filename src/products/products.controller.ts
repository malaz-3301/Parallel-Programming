import { InjectQueue } from '@nestjs/bullmq';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { Queue } from 'bullmq';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { JwtPayload } from 'src/auth/types/jwt-payload.type';
import { Roles } from 'src/auth/utils/roles.decorator';
import { UserType } from 'src/enums/enums';
import { Public } from 'src/public.module';
import { CreateProductDto } from './dto/create-product.dto';
import { FilterProductDto } from './dto/filter-product-dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductJob } from './products.process';
import { ProductsService } from './products.service';

@Controller('products')
export class ProductsController {
  constructor(
    private readonly productsService: ProductsService,
    @InjectQueue('product') private readonly productQueue: Queue<ProductJob>,
  ) {}

  @Post()
  async create(
    @Body() dto: CreateProductDto,
    @CurrentUser() user: JwtPayload,
  ) {
    const job = await this.productQueue.add('create', {
      ...dto,
      userId: user.id,
    });
    return { status: 'queued', jobId: job.id };
  }

  @Roles(UserType.ADMIN)
  @Get('all')
  findAllWithDeleted() {
    return this.productsService.findAllWithDeleted();
  }

  @Public()
  @Get('filter')
  findAllAvailable(@Query() dto: FilterProductDto) {
    return this.productsService.findAll(dto);
  }

  @Public()
  @Get('best-sellers')
  findAllBestSellers() {
    return this.productsService.findBestSellers();
  }

  @Public()
  @Get('best-rating')
  findAllBestRating() {
    return this.productsService.findBestRating();
  }

  @Public()
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateProductDto,
    @CurrentUser() user: JwtPayload,
  ) {
    const job = await this.productQueue.add('update', {
      ...dto,
      id,
      userId: user.id,
    });
    return { status: 'queued', jobId: job.id };
  }

  @Delete(':id')
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: JwtPayload,
  ) {
    const job = await this.productQueue.add('remove', {
      id,
      userId: user.id,
    });
    return { status: 'queued', jobId: job.id };
  }
}
