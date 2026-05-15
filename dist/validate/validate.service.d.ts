import { CreateValidateDto } from './dto/create-validate.dto';
import { UpdateValidateDto } from './dto/update-validate.dto';
export declare class ValidateService {
    create(createValidateDto: CreateValidateDto): string;
    findAll(): string;
    findOne(id: number): string;
    update(id: number, updateValidateDto: UpdateValidateDto): string;
    remove(id: number): string;
}
