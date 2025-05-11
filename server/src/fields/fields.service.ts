import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Field, FieldDocument } from './schemas/field.schema';
import { CreateFieldDto } from './dto/create-field.dto';
import { UpdateFieldDto } from './dto/update-field.dto';

@Injectable()
export class FieldsService {
  constructor(@InjectModel(Field.name) private fieldModel: Model<FieldDocument>) {}

  async create(createFieldDto: CreateFieldDto, userId: string): Promise<Field> {
    // Extract and transform geometry from DTO structure to Schema structure
    const { geometry: dtoGeometry, ...restOfDto } = createFieldDto;
    
    // Map [{ ring: [{lng, lat}] }] to [[[lng, lat]]]
    const schemaCoordinates = dtoGeometry.coordinates.map(linearRing => 
      linearRing.ring.map(point => [point.lng, point.lat])
    );

    const schemaGeometry = {
        type: dtoGeometry.type,
        coordinates: schemaCoordinates
    };

    const createdField = new this.fieldModel({
      ...restOfDto,
      geometry: schemaGeometry, // Use the transformed geometry
      user: new Types.ObjectId(userId),
    });
    
    try {
      return await createdField.save();
    } catch (error) {
      // Log the error for detailed debugging if needed
      console.error("Mongoose save error:", error);
      // Re-throw or handle as appropriate
      throw error; 
    }
  }

  async findAllByUser(userId: string): Promise<Field[]> {
    return await this.fieldModel.find({ user: new Types.ObjectId(userId) }).exec();
  }

  async findOne(id: string, userId: string): Promise<Field> {
    const field = await this.fieldModel.findOne({ _id: id, user: new Types.ObjectId(userId) }).exec();
    if (!field) {
      throw new NotFoundException(`Field with ID "${id}" not found for this user`);
    }
    return field;
  }

  async update(id: string, updateFieldDto: UpdateFieldDto, userId: string): Promise<Field> {
    // TODO: Add geometry transformation logic here if geometry can be updated
    const existingField = await this.fieldModel.findOneAndUpdate(
      { _id: id, user: new Types.ObjectId(userId) },
      updateFieldDto, // Pass the raw DTO for now, needs transformation if geometry is included
      { new: true },
    ).exec();
    if (!existingField) {
      throw new NotFoundException(`Field with ID "${id}" not found for this user`);
    }
    return existingField;
  }

  async remove(id: string, userId: string): Promise<any> {
    const result = await this.fieldModel.deleteOne({ _id: id, user: new Types.ObjectId(userId) });
    if (result.deletedCount === 0) {
      throw new NotFoundException(`Field with ID "${id}" not found for this user`);
    }
    return { message: `Field with ID "${id}" deleted successfully` };
  }
  
  // TODO: Implement filtering methods (by crop, date ranges, proximity)
} 