import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { User } from 'src/users/entities/user.entity';
export declare class ProductsController {
    private readonly productsService;
    constructor(productsService: ProductsService);
    create(createProductDto: CreateProductDto, req: {
        user: User;
    }): Promise<import("./entities/product.entity").Product>;
    findAll(): Promise<import("./entities/product.entity").Product[]>;
    findOne(id: string): Promise<import("./entities/product.entity").Product | null>;
    update(id: string, updateProductDto: UpdateProductDto, req: {
        user: User;
    }): Promise<import("typeorm").UpdateResult>;
    remove(id: string, req: {
        user: User;
    }): Promise<import("typeorm").UpdateResult>;
}
