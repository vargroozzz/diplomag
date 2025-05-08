import { Controller, Get, Post, Body, Param, Delete, UseGuards, Version, Put, ParseUUIDPipe } from '@nestjs/common';
import { HivesService } from './hives.service';
import { CreateHiveDto } from './dto/create-hive.dto';
import { UpdateHiveDto } from './dto/update-hive.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/user.decorator';
import { JwtUserPayload } from '../auth/types/jwt-user-payload.type';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';

@ApiTags('hives')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('hives')
export class HivesController {
  constructor(private readonly hivesService: HivesService) {}

  @Post()
  @Version('1')
  @ApiOperation({ summary: 'Create a new hive' })
  @ApiResponse({ status: 201, description: 'Hive created successfully.' })
  @ApiResponse({ status: 400, description: 'Invalid input.' })
  create(@Body() createHiveDto: CreateHiveDto, @GetUser() user: JwtUserPayload) {
    return this.hivesService.create(createHiveDto, user.userId);
  }

  @Get()
  @Version('1')
  @ApiOperation({ summary: 'Get all hives for the current user' })
  @ApiResponse({ status: 200, description: 'List of hives.' })
  findAll(@GetUser() user: JwtUserPayload) {
    return this.hivesService.findAllByUser(user.userId);
  }

  @Get(':id')
  @Version('1')
  @ApiOperation({ summary: 'Get a specific hive by ID' })
  @ApiParam({ name: 'id', description: 'Hive ID', type: String })
  @ApiResponse({ status: 200, description: 'Hive details.' })
  @ApiResponse({ status: 404, description: 'Hive not found.' })
  findOne(@Param('id') id: string, @GetUser() user: JwtUserPayload) {
    return this.hivesService.findOne(id, user.userId);
  }

  @Put(':id')
  @Version('1')
  @ApiOperation({ summary: 'Update a hive' })
  @ApiParam({ name: 'id', description: 'Hive ID', type: String })
  @ApiResponse({ status: 200, description: 'Hive updated successfully.' })
  @ApiResponse({ status: 404, description: 'Hive not found.' })
  update(@Param('id') id: string, @Body() updateHiveDto: UpdateHiveDto, @GetUser() user: JwtUserPayload) {
    return this.hivesService.update(id, updateHiveDto, user.userId);
  }

  @Delete(':id')
  @Version('1')
  @ApiOperation({ summary: 'Delete a hive' })
  @ApiParam({ name: 'id', description: 'Hive ID', type: String })
  @ApiResponse({ status: 200, description: 'Hive deleted successfully.' })
  @ApiResponse({ status: 404, description: 'Hive not found.' })
  remove(@Param('id') id: string, @GetUser() user: JwtUserPayload) {
    return this.hivesService.remove(id, user.userId);
  }
} 