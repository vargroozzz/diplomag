import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ForumPost } from './schemas/forum-post.schema';
import { CreateForumPostDto } from './dto/create-forum-post.dto';

@Injectable()
export class ForumService {
  constructor(
    @InjectModel(ForumPost.name) private forumPostModel: Model<ForumPost>,
  ) {}

  async create(createForumPostDto: CreateForumPostDto & { author: Types.ObjectId }): Promise<ForumPost> {
    const createdPost = new this.forumPostModel(createForumPostDto);
    return createdPost.save();
  }

  async findAll() {
    return await this.forumPostModel
      .find()
      .populate('author', 'username')
      .sort({ createdAt: -1 })
      .exec();
  }

  async findOne(id: string) {
    return await this.forumPostModel
      .findById(id)
      .populate('author', 'username')
      .populate('comments.author', 'username')
      .exec();
  }

  async update(id: string, updateForumPostDto: any) {
    return await this.forumPostModel
      .findByIdAndUpdate(id, updateForumPostDto, { new: true })
      .exec();
  }

  async remove(id: string) {
    return await this.forumPostModel.findByIdAndDelete(id).exec();
  }

  async addComment(postId: string, comment: any) {
    return await this.forumPostModel
      .findByIdAndUpdate(
        postId,
        { $push: { comments: comment } },
        { new: true },
      )
      .exec();
  }

  async likePost(postId: string, userId: Types.ObjectId) {
    return await this.forumPostModel
      .findByIdAndUpdate(
        postId,
        { $addToSet: { likes: userId } },
        { new: true },
      )
      .exec();
  }
} 