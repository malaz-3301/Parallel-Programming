import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ValidateService } from './validate.service';
import { CreateValidateDto } from './dto/create-validate.dto';
import { UpdateValidateDto } from './dto/update-validate.dto';

@Controller('validate')
export class ValidateController {
  constructor(private readonly validateService: ValidateService) {}

  @Post()
  create(@Body() createValidateDto: CreateValidateDto) {
    return this.validateService.create(createValidateDto);
  }

  @Get()
  findAll() {
    return this.validateService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.validateService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateValidateDto: UpdateValidateDto) {
    return this.validateService.update(+id, updateValidateDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.validateService.remove(+id);
  }
}
