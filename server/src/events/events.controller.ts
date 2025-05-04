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
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/user.decorator';
import { UserDocument } from '../users/schemas/user.schema';

@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() createEventDto: CreateEventDto, @GetUser() user: UserDocument) {
    return this.eventsService.create({
      ...createEventDto,
      organizerId: user.id,
    });
  }

  @Get()
  findAll() {
    return this.eventsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.eventsService.findOne(id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  update(@Param('id') id: string, @Body() updateEventDto: Partial<CreateEventDto>) {
    return this.eventsService.update(id, updateEventDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string) {
    return this.eventsService.remove(id);
  }

  @Post(':id/register')
  @UseGuards(JwtAuthGuard)
  register(@Param('id') id: string, @GetUser() user: UserDocument) {
    return this.eventsService.registerForEvent(id, user.id);
  }

  @Post(':id/cancel-registration')
  @UseGuards(JwtAuthGuard)
  cancelRegistration(@Param('id') id: string, @GetUser() user: UserDocument) {
    return this.eventsService.cancelRegistration(id, user.id);
  }

  @Post(':id/cancel')
  @UseGuards(JwtAuthGuard)
  cancelEvent(@Param('id') id: string) {
    return this.eventsService.cancelEvent(id);
  }
} 