import { InjectQueue } from '@nestjs/bullmq';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { Queue } from 'bullmq';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { JwtPayload } from 'src/auth/types/jwt-payload.type';
import { Roles } from 'src/auth/utils/roles.decorator';
import { Public } from 'src/public.module';
import { UserType } from 'src/users/utils/user-type';
import { CreateProductDto } from './dto/create-product.dto';
import { FilterProductDto } from './dto/filter-product-dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { JobType } from './products.process';
import { ProductsService } from './products.service';

@Controller('products')
export class ProductsController {
  constructor(
    private readonly productsService: ProductsService,
    @InjectQueue('product') private readonly productQueue: Queue<JobType>,
  ) {}

  @Post()
  async create(
    @Body() dto: CreateProductDto,
    @CurrentUser() user: JwtPayload,
  ) {
    const job = await this.productQueue.add('create', {
      ...dto,
      user_id: user.id,
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
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(+id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateProductDto,
    @CurrentUser() user: JwtPayload,
  ) {
    const job = await this.productQueue.add('update', {
      ...dto,
      id: +id,
      user_id: user.id,
    });
    return { status: 'queued', jobId: job.id };
  }

  @Delete(':id')
  async remove(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    const job = await this.productQueue.add('remove', {
      id: +id,
      user_id: user.id,
    });
    return { status: 'queued', jobId: job.id };
  }
}
