import { CreateUserProductDto } from './dto/create-user-product.dto';
import { UserProduct } from './entities/user-product.entity';
import { DataSource, Repository } from 'typeorm';
import { ProductsService } from 'src/products/products.service';
export declare class UserProductsService {
    private userProductRepository;
    private dataSource;
    private productsService;
    constructor(userProductRepository: Repository<UserProduct>, dataSource: DataSource, productsService: ProductsService);
    create(createuserProductDto: CreateUserProductDto, user_id: number): Promise<UserProduct>;
    findAll(): Promise<UserProduct[]>;
    findOne(productId: number, cartId: number): Promise<UserProduct | null>;
    update(createUserProductDto: CreateUserProductDto): Promise<import("typeorm").UpdateResult>;
    remove(productId: number, cartId: number, user_id: number): Promise<import("typeorm").DeleteResult>;
}
