import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Article, ArticleDocument } from './schemas/article.schema';
import { CreateArticleDto } from './dto/create-article.dto';

@Injectable()
export class ArticlesService {
  constructor(
    @InjectModel(Article.name)
    private articleModel: Model<ArticleDocument>,
  ) {}

  async create(createArticleDto: CreateArticleDto, author: Types.ObjectId) {
    const createdArticle = new this.articleModel({
      ...createArticleDto,
      author,
    });
    return await createdArticle.save();
  }

  async findAll() {
    return await this.articleModel.find().lean().exec();
  }

  async findOne(id: string) {
    const article = await this.articleModel.findById(id).lean().exec();
    if (!article) {
      throw new NotFoundException(`Article with ID ${id} not found`);
    }
    return article;
  }

  async update(id: string, updateArticleDto: Partial<CreateArticleDto>) {
    const updatedArticle = await this.articleModel
      .findByIdAndUpdate(id, updateArticleDto, { new: true })
      .exec();
    if (!updatedArticle) {
      throw new NotFoundException(`Article with ID ${id} not found`);
    }
    return updatedArticle;
  }

  async remove(id: string) {
    const result = await this.articleModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Article with ID ${id} not found`);
    }
  }

  async publish(id: string) {
    const article = await this.findOne(id);
    article.isPublished = true;
    article.publishedAt = new Date();
    return await article.save();
  }

  async unpublish(id: string) {
    const article = await this.findOne(id);
    article.isPublished = false;
    return await article.save();
  }

  async incrementViews(id: string) {
    return await this.articleModel
      .findByIdAndUpdate(id, { $inc: { views: 1 } }, { new: true })
      .exec();
  }

  async like(id: string) {
    return await this.articleModel
      .findByIdAndUpdate(id, { $inc: { likes: 1 } }, { new: true })
      .exec();
  }

  async unlike(id: string) {
    return await this.articleModel
      .findByIdAndUpdate(id, { $inc: { likes: -1 } }, { new: true })
      .exec();
  }
} 