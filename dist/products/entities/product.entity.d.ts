import { Comment } from "src/comments/entities/comment.entity";
import { Company } from "src/companies/entities/company.entity";
import { UserProduct } from "src/user-products/entities/user-product.entity";
export declare class Product {
    id: number;
    count: number;
    price: number;
    photo: string;
    details: string;
    company: Company;
    comments: Comment[];
    carts: UserProduct[];
    deletedAt: Date;
}
