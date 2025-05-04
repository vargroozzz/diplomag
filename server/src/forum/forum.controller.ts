import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { ForumService } from './forum.service';
import { CreateForumPostDto } from './dto/create-forum-post.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/user.decorator';
import { UserDocument } from '../users/schemas/user.schema';
import { CreateCommentDto } from './dto/create-comment.dto';
import { Types } from 'mongoose';

@Controller('forum')
export class ForumController {
  constructor(private readonly forumService: ForumService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() createForumPostDto: CreateForumPostDto, @GetUser() user: { userId: string; email: string }) {
    const postData = {
      title: createForumPostDto.title,
      content: createForumPostDto.content,
      author: new Types.ObjectId(user.userId),
    };
    return this.forumService.create(postData);
  }

  @Get()
  findAll() {
    return this.forumService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.forumService.findOne(id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  update(@Param('id') id: string, @Body() updateForumPostDto: CreateForumPostDto) {
    return this.forumService.update(id, updateForumPostDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string) {
    return this.forumService.remove(id);
  }

  @Post(':id/comments')
  @UseGuards(JwtAuthGuard)
  addComment(
    @Param('id') id: string,
    @Body() comment: CreateCommentDto,
    @GetUser() user: UserDocument,
  ) {
    return this.forumService.addComment(id, {
      content: comment.content,
      author: user._id,
    });
  }

  @Post(':id/like')
  @UseGuards(JwtAuthGuard)
  likePost(@Param('id') id: string, @GetUser() user: UserDocument) {
    return this.forumService.likePost(id, user._id);
  }
} 