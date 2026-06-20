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
} from '@nestjs/common';
import { Queue } from 'bullmq';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { JwtPayload } from 'src/auth/types/jwt-payload.type';
import { Roles } from 'src/auth/utils/roles.decorator';
import { UserType } from 'src/enums/enums';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserJob } from './users.process';
import { UsersService } from './users.service';

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
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.findOne(id);
  }

  @Roles(UserType.ADMIN)
  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
    @CurrentUser() actor: JwtPayload,
  ) {
    const job = await this.userQueue.add('update', {
      ...updateUserDto,
      id,
      actorId: actor.id,
    });
    return { status: 'queued', jobId: job.id };
  }

  @Roles(UserType.ADMIN)
  @Delete(':id')
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() actor: JwtPayload,
  ) {
    const job = await this.userQueue.add('remove', {
      id,
      actorId: actor.id,
    });
    return { status: 'queued', jobId: job.id };
  }
}
