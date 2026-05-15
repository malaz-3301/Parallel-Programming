import { CreateCommentDto } from './create-comment.dto';
declare const UpdateCommentDto_base: import("@nestjs/mapped-types").MappedType<Partial<Omit<CreateCommentDto, "product_id">>>;
export declare class UpdateCommentDto extends UpdateCommentDto_base {
}
export {};
