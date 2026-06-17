import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { RolesGuard } from 'src/auth/utils/roles.guard';
import { Roles } from 'src/auth/utils/roles.decorator';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { JobType } from './users.process';
@UseGuards(RolesGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService, @InjectQueue('user') private userQueue: Queue<JobType>) { }
  @Roles(['admin'])
  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    await this.userQueue.add('create', createUserDto);
  }
  @Roles(['admin'])
  @Get()
  findAll() {
    return this.usersService.findAll();
  }
  @Roles(['admin'])
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(+id);
  }
  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    await this.userQueue.add('update', { ...updateUserDto, id: +id });
  }
  @Roles(['admin'])
  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.userQueue.add('remove', { id: +id });
  }
}
