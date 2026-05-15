import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './entities/product.entity';
import { DataSource, Repository } from 'typeorm';
import { CompaniesService } from 'src/companies/companies.service';
import { UpdateProductCountDto } from './dto/update-product-count.dto';
export declare class ProductsService {
    private productRepository;
    private dataSource;
    private companiesService;
    constructor(productRepository: Repository<Product>, dataSource: DataSource, companiesService: CompaniesService);
    create(createProductDto: CreateProductDto, user_id: number): Promise<Product>;
    findAll(): Promise<Product[]>;
    findOne(id: number): Promise<Product | null>;
    findOneForBuy(id: number, updateProductCountDto: UpdateProductCountDto): Promise<Product | null>;
    updateForBuy(id: number, updateProductCountDto: UpdateProductCountDto, user_id: number): Promise<Product>;
    update(id: number, updateProductDto: UpdateProductDto, user_id: number): Promise<import("typeorm").UpdateResult>;
    remove(id: number, user_id: number): Promise<import("typeorm").UpdateResult>;
}
