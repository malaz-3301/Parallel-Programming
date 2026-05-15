
// import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Type } from '@nestjs/common';
// import { Observable } from 'rxjs';
// import { tap } from 'rxjs/operators';
// import { Product } from 'src/products/entities/product.entity';
// import { User } from 'src/users/entities/user.entity';
// import { Comment } from 'src/comments/entities/comment.entity';
// import { Company } from 'src/companies/entities/company.entity';
// import { InjectRepository } from '@nestjs/typeorm';
// import { Repository } from 'typeorm';
// type ClassType = Product | User | Comment | Company;
// @Injectable()
// export class LoggingInterceptor implements NestInterceptor {
//     constructor(
//         @InjectRepository(Product) private ProductRepository: Repository<Product>,
//         @InjectRepository(User) private UserRepository: Repository<User>,
//         @InjectRepository(Comment) private CommentRepository: Repository<Comment>,
//         @InjectRepository(Company) private CompanyRepository: Repository<Company>) { }
//     intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
//         const request = context.switchToHttp().getRequest();
//         const method = request.method; // سيرجع لك 'GET' أو 'POST' أو 'PUT' الخ..
//         switch (method) {
//             case "POST": return next.handle()
//             case "GET":
//                 const params: { id: string } = request.params;
//                 const controller = context.getClass();
//                 console.log(controller);
//                 this.validateUser(+params.id, controller)
//                 return next.handle()
//         }
//     }
//     validateUser(user_id: number, classType: Type<ClassType>) {
//         switch
//     }
// }
