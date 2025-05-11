import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Hive, HiveDocument } from './schemas/hive.schema';
import { CreateHiveDto } from './dto/create-hive.dto';
import { UpdateHiveDto } from './dto/update-hive.dto';

@Injectable()
export class HivesService {
  constructor(@InjectModel(Hive.name) private hiveModel: Model<HiveDocument>) {}

  async create(createHiveDto: CreateHiveDto, userId: string): Promise<Hive> {
    const createdHive = new this.hiveModel({
      ...createHiveDto,
      user: new Types.ObjectId(userId),
    });
    return await createdHive.save();
  }

  async findAllByUser(userId: string): Promise<Hive[]> {
    return await this.hiveModel.find({ user: new Types.ObjectId(userId) }).exec();
  }

  async findOne(id: string, userId: string): Promise<Hive> {
    const hive = await this.hiveModel.findOne({ _id: id, user: new Types.ObjectId(userId) }).exec();
    if (!hive) {
      throw new NotFoundException(`Hive with ID "${id}" not found for this user`);
    }
    return hive;
  }

  async update(id: string, updateHiveDto: UpdateHiveDto, userId: string): Promise<Hive> {
    const existingHive = await this.hiveModel.findOneAndUpdate(
      { _id: id, user: new Types.ObjectId(userId) },
      updateHiveDto,
      { new: true },
    ).exec();
    if (!existingHive) {
      throw new NotFoundException(`Hive with ID "${id}" not found for this user`);
    }
    return existingHive;
  }

  async remove(id: string, userId: string): Promise<any> {
    const result = await this.hiveModel.deleteOne({ _id: id, user: new Types.ObjectId(userId) });
    if (result.deletedCount === 0) {
      throw new NotFoundException(`Hive with ID "${id}" not found for this user`);
    }
    return { message: `Hive with ID "${id}" deleted successfully` };
  }
} 