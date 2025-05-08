import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Version,
} from '@nestjs/common';
import { KnowledgeBaseService } from './knowledge-base.service';
import { CreateResourceDto } from './dto/create-resource.dto';
import { UpdateResourceDto } from './dto/update-resource.dto';

@Controller('knowledge-base')
export class KnowledgeBaseController {
  constructor(private readonly knowledgeBaseService: KnowledgeBaseService) {}

  @Post()
  @Version('1')
  create(@Body() createResourceDto: CreateResourceDto) {
    return this.knowledgeBaseService.create(createResourceDto);
  }

  @Get()
  @Version('1')
  findAll() {
    return this.knowledgeBaseService.findAll();
  }

  @Get('search')
  @Version('1')
  search(@Query('q') query: string) {
    return this.knowledgeBaseService.search(query);
  }

  @Get('category/:category')
  @Version('1')
  findByCategory(@Param('category') category: string) {
    return this.knowledgeBaseService.findByCategory(category);
  }

  @Get(':id')
  @Version('1')
  findOne(@Param('id') id: string) {
    return this.knowledgeBaseService.findOne(id);
  }

  @Patch(':id')
  @Version('1')
  update(@Param('id') id: string, @Body() updateResourceDto: UpdateResourceDto) {
    return this.knowledgeBaseService.update(id, updateResourceDto);
  }

  @Delete(':id')
  @Version('1')
  remove(@Param('id') id: string) {
    return this.knowledgeBaseService.remove(id);
  }
} 