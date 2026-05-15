import { Controller, Get, Post, Body, Patch, Param, Delete, Request } from '@nestjs/common';
import { UserProductsService } from './user-products.service';
import { CreateUserProductDto } from './dto/create-user-product.dto';
import { UpdateUserProductDto } from './dto/update-user-product.dto';
import { User } from 'src/users/entities/user.entity';

@Controller('userProducts')
export class UserProductsController {
  constructor(private readonly userProductsService: UserProductsService) { }

  // @Post()
  // create(@Body() createuserProductDto: CreateUserProductDto, @Request() req: { user: User }) {
  //   return this.userProductsService.create(createuserProductDto,req.user.id);
  // }

  // @Get()
  // findAll(@Request() req: { user: User }) {
  //   return this.userProductsService.findAll();
  // }

  // @Get(':id')
  // findOne(@Param('id') id: string, @Request() req: { user: User }) {
  //   return this.userProductsService.findOne(+id);
  // }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateuserProductDto: UpdateUserProductDto, @Request() req: { user: User }) {
  //   return this.userProductsService.update(+id, updateuserProductDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string, @Request() req: { user: User }) {
  //   return this.userProductsService.remove(+id,req.user.id);
  // }
}
