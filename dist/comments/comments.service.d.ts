import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { Comment } from './entities/comment.entity';
import { Repository } from 'typeorm';
export declare class CommentsService {
    private commentRepository;
    constructor(commentRepository: Repository<Comment>);
    create(createCommentDto: CreateCommentDto, user_id: number): Promise<Comment>;
    findAll(): Promise<Comment[]>;
    findOne(id: number, user_id: number): Promise<Comment | null>;
    update(id: number, updateCommentDto: UpdateCommentDto, user_id: number): Promise<import("typeorm").UpdateResult>;
    remove(id: number, user_id: number): Promise<import("typeorm").DeleteResult>;
}
