import { PartialType } from '@nestjs/mapped-types';
import { CreateValidateDto } from './create-validate.dto';

export class UpdateValidateDto extends PartialType(CreateValidateDto) {}
