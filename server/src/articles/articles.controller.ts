import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  UseGuards,
  Version,
} from '@nestjs/common';
import { ArticlesService } from './articles.service';
import { CreateArticleDto } from './dto/create-article.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/user.decorator';
import { JwtUserPayload } from '../auth/types/jwt-user-payload.type';
import { Types } from 'mongoose';

@Controller('articles')
export class ArticlesController {
  constructor(private readonly articlesService: ArticlesService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @Version('1')
  create(@Body() createArticleDto: CreateArticleDto, @GetUser() user: JwtUserPayload) {
    return this.articlesService.create(createArticleDto, new Types.ObjectId(user.userId));
  }

  @Get()
  @Version('1')
  findAll() {
    return this.articlesService.findAll();
  }

  @Get(':id')
  @Version('1')
  async findOne(@Param('id') id: string) {
    const article = await this.articlesService.findOne(id);
    await this.articlesService.incrementViews(id);
    return article;
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @Version('1')
  update(@Param('id') id: string, @Body() updateArticleDto: Partial<CreateArticleDto>) {
    return this.articlesService.update(id, updateArticleDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @Version('1')
  remove(@Param('id') id: string) {
    return this.articlesService.remove(id);
  }

  @Post(':id/publish')
  @UseGuards(JwtAuthGuard)
  @Version('1')
  publish(@Param('id') id: string) {
    return this.articlesService.publish(id);
  }

  @Post(':id/unpublish')
  @UseGuards(JwtAuthGuard)
  @Version('1')
  unpublish(@Param('id') id: string) {
    return this.articlesService.unpublish(id);
  }

  @Post(':id/like')
  @UseGuards(JwtAuthGuard)
  @Version('1')
  like(@Param('id') id: string) {
    return this.articlesService.like(id);
  }

  @Post(':id/unlike')
  @UseGuards(JwtAuthGuard)
  @Version('1')
  unlike(@Param('id') id: string) {
    return this.articlesService.unlike(id);
  }
} 