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
import { ForumService } from './forum.service';
import { CreateForumPostDto } from './dto/create-forum-post.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/user.decorator';
import { UserDocument } from '../users/schemas/user.schema';
import { CreateCommentDto } from './dto/create-comment.dto';
import { Types } from 'mongoose';
import { JwtUserPayload } from '../auth/types/jwt-user-payload.type';

@Controller('forum')
export class ForumController {
  constructor(private readonly forumService: ForumService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @Version('1')
  create(@Body() createForumPostDto: CreateForumPostDto, @GetUser() user: JwtUserPayload) {
    const postData = {
      title: createForumPostDto.title,
      content: createForumPostDto.content,
      author: new Types.ObjectId(user.userId),
    };
    return this.forumService.create(postData);
  }

  @Get()
  @Version('1')
  findAll() {
    return this.forumService.findAll();
  }

  @Get(':id')
  @Version('1')
  findOne(@Param('id') id: string) {
    return this.forumService.findOne(id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @Version('1')
  update(@Param('id') id: string, @Body() updateForumPostDto: CreateForumPostDto) {
    return this.forumService.update(id, updateForumPostDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @Version('1')
  remove(@Param('id') id: string) {
    return this.forumService.remove(id);
  }

  @Post(':id/comments')
  @UseGuards(JwtAuthGuard)
  @Version('1')
  addComment(
    @Param('id') id: string,
    @Body() comment: CreateCommentDto,
    @GetUser() user: JwtUserPayload,
  ) {
    return this.forumService.addComment(id, {
      content: comment.content,
      author: new Types.ObjectId(user.userId),
    });
  }

  @Post(':id/like')
  @UseGuards(JwtAuthGuard)
  @Version('1')
  likePost(@Param('id') id: string, @GetUser() user: JwtUserPayload) {
    return this.forumService.likePost(id, new Types.ObjectId(user.userId));
  }

  @Post(':id/unlike')
  @UseGuards(JwtAuthGuard)
  @Version('1')
  unlikePost(@Param('id') id: string, @GetUser() user: JwtUserPayload) {
    return this.forumService.unlikePost(id, new Types.ObjectId(user.userId));
  }
} 