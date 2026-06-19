import { InjectQueue } from '@nestjs/bullmq';
import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Request, UseGuards } from '@nestjs/common';
import { Queue } from 'bullmq';
import { Roles } from 'src/auth/utils/roles.decorator';
import { RolesGuard } from 'src/auth/utils/roles.guard';
import { Public } from 'src/public.module';
import { User } from 'src/users/entities/user.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { FilterProductDto } from './dto/filter-product-dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { JobType } from './products.process';
import { ProductsService } from './products.service';

@UseGuards(RolesGuard)
@Controller('products')
export class ProductsController {
  constructor(
    private readonly productsService: ProductsService,
    @InjectQueue('product') private readonly productQueue: Queue<JobType>,
  ) {}

  @Post()
  async create(@Body() dto: CreateProductDto, @Request() req: { user: User }) {
    const job = await this.productQueue.add('create', { ...dto, user_id: req.user.id });
    return { status: 'queued', jobId: job.id };
  }

  @Roles(['admin'])
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
    @Request() req: { user: User },
  ) {
    const job = await this.productQueue.add('update', { ...dto, id: +id, user_id: req.user.id });
    return { status: 'queued', jobId: job.id };
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Request() req: { user: User }) {
    const job = await this.productQueue.add('remove', { id: +id, user_id: req.user.id });
    return { status: 'queued', jobId: job.id };
  }
}
