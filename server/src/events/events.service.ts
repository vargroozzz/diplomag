import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Event, EventDocument } from './schemas/event.schema';
import { CreateEventDto } from './dto/create-event.dto';

@Injectable()
export class EventsService {
  constructor(
    @InjectModel(Event.name)
    private eventModel: Model<EventDocument>,
  ) {}

  async create(createEventDto: CreateEventDto) {
    const createdEvent = new this.eventModel(createEventDto);
    return await createdEvent.save();
  }

  async findAll() {
    return await this.eventModel.find().lean().exec();
  }

  async findOne(id: string) {
    const event = await this.eventModel.findById(id).lean().exec();
    if (!event) {
      throw new NotFoundException(`Event with ID ${id} not found`);
    }
    return event;
  }

  async update(id: string, updateEventDto: Partial<Event>) {
    const updatedEvent = await this.eventModel
      .findByIdAndUpdate(id, updateEventDto, { new: true })
      .exec();
    if (!updatedEvent) {
      throw new NotFoundException(`Event with ID ${id} not found`);
    }
    return updatedEvent;
  }

  async remove(id: string) {
    const result = await this.eventModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Event with ID ${id} not found`);
    }
  }

  async registerForEvent(eventId: string, userId: Types.ObjectId) {
    const event = await this.findOne(eventId);
    
    if (event.attendees.includes(userId)) {
      throw new Error('User is already registered for this event');
    }
    
    if (event.attendees.length >= event.maxAttendees) {
      throw new Error('Event is full');
    }
    
    event.attendees.push(userId);
    return await event.save();
  }

  async cancelRegistration(eventId: string, userId: Types.ObjectId) {
    const event = await this.findOne(eventId);
    
    if (!event.attendees.includes(userId)) {
      throw new Error('User is not registered for this event');
    }
    
    event.attendees = event.attendees.filter(id => id !== userId);
    return await event.save();
  }

  async cancelEvent(id: string) {
    return await this.update(id, { isCancelled: true });
  }
} 