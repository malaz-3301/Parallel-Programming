import { Injectable } from '@nestjs/common';
import { CreateValidateDto } from './dto/create-validate.dto';
import { UpdateValidateDto } from './dto/update-validate.dto';

@Injectable()
export class ValidateService {
  create(createValidateDto: CreateValidateDto) {
    return 'This action adds a new validate';
  }

  findAll() {
    return `This action returns all validate`;
  }

  findOne(id: number) {
    return `This action returns a #${id} validate`;
  }

  update(id: number, updateValidateDto: UpdateValidateDto) {
    return `This action updates a #${id} validate`;
  }

  remove(id: number) {
    return `This action removes a #${id} validate`;
  }
}
