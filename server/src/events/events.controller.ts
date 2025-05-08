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
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/user.decorator';
import { UserDocument } from '../users/schemas/user.schema';
import { Types } from 'mongoose';
import { JwtUserPayload } from '../auth/types/jwt-user-payload.type';
@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @Version('1')
  create(@Body() createEventDto: CreateEventDto, @GetUser() user: JwtUserPayload) {
    return this.eventsService.create({
      ...createEventDto,
      organizerId: new Types.ObjectId(user.userId),
    });
  }

  @Get()
  @Version('1')
  findAll() {
    return this.eventsService.findAll();
  }

  @Get(':id')
  @Version('1')
  findOne(@Param('id') id: string) {
    return this.eventsService.findOne(id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @Version('1')
  update(@Param('id') id: string, @Body() updateEventDto: Partial<CreateEventDto>) {
    return this.eventsService.update(id, updateEventDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @Version('1')
  remove(@Param('id') id: string) {
    return this.eventsService.remove(id);
  }

  @Post(':id/register')
  @UseGuards(JwtAuthGuard)
  @Version('1')
  register(@Param('id') id: string, @GetUser() user: JwtUserPayload) {
    return this.eventsService.registerForEvent(id, new Types.ObjectId(user.userId));
  }

  @Post(':id/cancel-registration')
  @UseGuards(JwtAuthGuard)
  @Version('1')
  cancelRegistration(@Param('id') id: string, @GetUser() user: JwtUserPayload) {
    return this.eventsService.cancelRegistration(id, new Types.ObjectId(user.userId));
  }

  @Post(':id/cancel')
  @UseGuards(JwtAuthGuard)
  @Version('1')
  cancelEvent(@Param('id') id: string) {
    return this.eventsService.cancelEvent(id);
  }
} 