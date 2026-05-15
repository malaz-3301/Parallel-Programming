import { ValidateService } from './validate.service';
import { CreateValidateDto } from './dto/create-validate.dto';
import { UpdateValidateDto } from './dto/update-validate.dto';
export declare class ValidateController {
    private readonly validateService;
    constructor(validateService: ValidateService);
    create(createValidateDto: CreateValidateDto): string;
    findAll(): string;
    findOne(id: string): string;
    update(id: string, updateValidateDto: UpdateValidateDto): string;
    remove(id: string): string;
}
