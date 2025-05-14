import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Version, Put, ParseUUIDPipe } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';
import { SetUserAdminStatusDto } from './dto/set-user-admin-status.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';

@ApiTags('users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @Version('1')
  @ApiOperation({ summary: 'Create a new user (Placeholder - usually part of auth/register)' })
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get('profile/:id')
  @Version('1')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get user profile by ID' })
  @ApiParam({ name: 'id', description: 'User ID' })
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Patch('profile/:id')
  @Version('1')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Update user profile' })
  @ApiParam({ name: 'id', description: 'User ID' })
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @Get('admin/all')
  @Version('1')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiOperation({ summary: '[ADMIN] Get all users' })
  @ApiResponse({ status: 200, description: 'List of all users for admin.' })
  @ApiResponse({ status: 403, description: 'Forbidden. Admin access required.' })
  findAllAdmin() {
    return this.usersService.findAllAdmin();
  }

  @Patch('admin/:userId/set-admin-status')
  @Version('1')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiOperation({ summary: '[ADMIN] Set admin status for a user' })
  @ApiParam({ name: 'userId', description: "User ID to update" })
  @ApiResponse({ status: 200, description: 'User admin status updated.' })
  @ApiResponse({ status: 403, description: 'Forbidden. Admin access required.' })
  @ApiResponse({ status: 404, description: 'User not found.' })
  setUserAdminStatus(
    @Param('userId') userId: string, 
    @Body() setUserAdminStatusDto: SetUserAdminStatusDto
  ) {
    return this.usersService.updateUserAdminStatus(userId, setUserAdminStatusDto.isAdmin);
  }

  @Delete(':id')
  @Version('1')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Delete a user (Requires Admin or self - TBD)' })
  @ApiParam({ name: 'id', description: 'User ID' })
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
} 