import { Controller, Get, Post, Body, Param, Delete, UseGuards, Version, Put } from '@nestjs/common';
import { FieldsService } from './fields.service';
import { CreateFieldDto } from './dto/create-field.dto';
import { UpdateFieldDto } from './dto/update-field.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/user.decorator';
import { JwtUserPayload } from '../auth/types/jwt-user-payload.type';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';

@ApiTags('fields')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('fields')
export class FieldsController {
  constructor(private readonly fieldsService: FieldsService) {}

  @Post()
  @Version('1')
  @ApiOperation({ summary: 'Create a new field' })
  @ApiResponse({ status: 201, description: 'Field created successfully.' })
  @ApiResponse({ status: 400, description: 'Invalid input.' })
  create(@Body() createFieldDto: CreateFieldDto, @GetUser() user: JwtUserPayload) {
    return this.fieldsService.create(createFieldDto, user.userId);
  }

  @Get()
  @Version('1')
  @ApiOperation({ summary: 'Get all fields for the current user' })
  @ApiResponse({ status: 200, description: 'List of fields.' })
  findAll(@GetUser() user: JwtUserPayload) {
    return this.fieldsService.findAllByUser(user.userId);
  }

  @Get(':id')
  @Version('1')
  @ApiOperation({ summary: 'Get a specific field by ID' })
  @ApiParam({ name: 'id', description: 'Field ID', type: String })
  @ApiResponse({ status: 200, description: 'Field details.' })
  @ApiResponse({ status: 404, description: 'Field not found.' })
  findOne(@Param('id') id: string, @GetUser() user: JwtUserPayload) {
    return this.fieldsService.findOne(id, user.userId);
  }

  @Put(':id')
  @Version('1')
  @ApiOperation({ summary: 'Update a field' })
  @ApiParam({ name: 'id', description: 'Field ID', type: String })
  @ApiResponse({ status: 200, description: 'Field updated successfully.' })
  @ApiResponse({ status: 404, description: 'Field not found.' })
  update(@Param('id') id: string, @Body() updateFieldDto: UpdateFieldDto, @GetUser() user: JwtUserPayload) {
    return this.fieldsService.update(id, updateFieldDto, user.userId);
  }

  @Delete(':id')
  @Version('1')
  @ApiOperation({ summary: 'Delete a field' })
  @ApiParam({ name: 'id', description: 'Field ID', type: String })
  @ApiResponse({ status: 200, description: 'Field deleted successfully.' })
  @ApiResponse({ status: 404, description: 'Field not found.' })
  remove(@Param('id') id: string, @GetUser() user: JwtUserPayload) {
    return this.fieldsService.remove(id, user.userId);
  }
  
  // TODO: Add endpoint for filtering fields
} 