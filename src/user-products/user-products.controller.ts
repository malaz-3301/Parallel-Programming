import { Controller, Get, Post, Body, Patch, Param, Delete, Request } from '@nestjs/common';
import { UserProductsService } from './user-products.service';
import { CreateUserProductDto } from './dto/create-user-product.dto';
import { UpdateUserProductDto } from './dto/update-user-product.dto';
import { User } from 'src/users/entities/user.entity';

@Controller('userProducts')
export class UserProductsController {
  constructor(private readonly userProductsService: UserProductsService) { }
}
