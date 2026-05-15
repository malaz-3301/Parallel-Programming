import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { User } from 'src/users/entities/user.entity';
export declare class CommentsController {
    private readonly commentsService;
    constructor(commentsService: CommentsService);
    create(createCommentDto: CreateCommentDto, req: {
        user: User;
    }): Promise<import("./entities/comment.entity").Comment>;
    findAll(req: {
        user: User;
    }): Promise<import("./entities/comment.entity").Comment[]>;
    findOne(id: string, req: {
        user: User;
    }): Promise<import("./entities/comment.entity").Comment | null>;
    update(id: string, updateCommentDto: UpdateCommentDto, req: {
        user: User;
    }): Promise<import("typeorm").UpdateResult>;
    remove(id: string, req: {
        user: User;
    }): Promise<import("typeorm").DeleteResult>;
}
