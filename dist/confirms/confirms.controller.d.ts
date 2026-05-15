import { ConfirmsService } from './confirms.service';
import { CreateConfirmDto } from './dto/create-confirm.dto';
import { UpdateConfirmDto } from './dto/update-confirm.dto';
import { User } from 'src/users/entities/user.entity';
export declare class ConfirmsController {
    private readonly confirmsService;
    constructor(confirmsService: ConfirmsService);
    create(createconfirmDto: CreateConfirmDto, req: {
        user: User;
    }): Promise<import("./entities/confirm.entity").Confirm>;
    findAll(req: {
        user: User;
    }): Promise<import("./entities/confirm.entity").Confirm[]>;
    findOne(id: string, req: {
        user: User;
    }): Promise<import("./entities/confirm.entity").Confirm | null>;
    update(id: string, updateconfirmDto: UpdateConfirmDto, req: {
        user: User;
    }): Promise<import("typeorm").UpdateResult>;
    remove(id: string, req: {
        user: User;
    }): Promise<import("typeorm").DeleteResult>;
}
