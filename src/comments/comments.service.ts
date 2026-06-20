import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductsService } from 'src/products/products.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { Comment } from './entities/comment.entity';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,
    private readonly productsService: ProductsService,
  ) {}

  async create(createCommentDto: CreateCommentDto, userId: number) {
    const { productId, ...commentData } = createCommentDto;
    const product = await this.productsService.findOne(productId);

    if (!product) {
      throw new NotFoundException('Product was not found');
    }

    const comment = this.commentRepository.create({
      ...commentData,
      user: { id: userId },
      product: { id: productId },
    });
    const savedComment = await this.commentRepository.save(comment);

    await this.productsService.invalidateRatingCache();
    return savedComment;
  }

  findAll() {
    return this.commentRepository.find({
      relations: { user: true, product: true },
    });
  }

  findOne(id: number) {
    return this.commentRepository.findOne({
      where: { id },
      relations: { user: true, product: true },
    });
  }

  async update(id: number, updateCommentDto: UpdateCommentDto, userId: number) {
    const result = await this.commentRepository.update(
      { id, user: { id: userId } },
      updateCommentDto,
    );

    if (result.affected !== 1) {
      throw new NotFoundException();
    }

    await this.productsService.invalidateRatingCache();
    return this.findOne(id);
  }

  async remove(id: number, userId: number) {
    const result = await this.commentRepository.delete({
      id,
      user: { id: userId },
    });

    if (result.affected !== 1) {
      throw new NotFoundException();
    }

    await this.productsService.invalidateRatingCache();
    return { id, deleted: true };
  }
}
