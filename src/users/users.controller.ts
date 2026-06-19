import { InjectQueue } from '@nestjs/bullmq';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { Queue } from 'bullmq';
import { Roles } from 'src/auth/utils/roles.decorator';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserJob } from './users.process';
import { UsersService } from './users.service';
import { UserType } from './utils/user-type';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    @InjectQueue('user') private readonly userQueue: Queue<UserJob>,
  ) {}

  @Roles(UserType.ADMIN)
  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    const job = await this.userQueue.add('create', createUserDto);
    return { status: 'queued', jobId: job.id };
  }

  @Roles(UserType.ADMIN)
  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Roles(UserType.ADMIN)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(+id);
  }

  @Roles(UserType.ADMIN)
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    const job = await this.userQueue.add('update', {
      ...updateUserDto,
      id: +id,
    });
    return { status: 'queued', jobId: job.id };
  }

  @Roles(UserType.ADMIN)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    const job = await this.userQueue.add('remove', { id: +id });
    return { status: 'queued', jobId: job.id };
  }
}
