import { Controller, Get, Post, Body, Patch, Param, Delete, Request } from '@nestjs/common';
import { ConfirmsService } from './confirms.service';
import { CreateConfirmDto } from './dto/create-confirm.dto';
import { UpdateConfirmDto } from './dto/update-confirm.dto';
import { Request as Req } from 'express';
import { User } from 'src/users/entities/user.entity';

@Controller('confirms')
export class ConfirmsController {
  constructor(private readonly confirmsService: ConfirmsService) { }

  @Post()
  create(@Body() createconfirmDto: CreateConfirmDto, @Request() req: { user: User }) {
    return this.confirmsService.create(createconfirmDto, req.user.id);
  }

  @Get()
  findAll(@Request() req: { user: User }) {
    return this.confirmsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req: { user: User }) {
    return this.confirmsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateconfirmDto: UpdateConfirmDto, @Request() req: { user: User }) {
    return this.confirmsService.update(+id, updateconfirmDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req: { user: User }) {
    return this.confirmsService.remove(+id, req.user.id);
  }
}
