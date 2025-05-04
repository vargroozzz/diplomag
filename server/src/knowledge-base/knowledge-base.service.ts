import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Resource, ResourceDocument } from './schemas/resource.schema';
import { CreateResourceDto } from './dto/create-resource.dto';
import { UpdateResourceDto } from './dto/update-resource.dto';

@Injectable()
export class KnowledgeBaseService {
  constructor(
    @InjectModel(Resource.name)
    private resourceModel: Model<ResourceDocument>,
  ) {}

  async create(createResourceDto: CreateResourceDto): Promise<ResourceDocument> {
    const createdResource = new this.resourceModel(createResourceDto);
    return await createdResource.save();
  }

  async findAll(): Promise<ResourceDocument[]> {
    return await this.resourceModel.find().exec();
  }

  async findOne(id: string): Promise<ResourceDocument> {
    const resource = await this.resourceModel.findById(id).exec();
    if (!resource) {
      throw new NotFoundException(`Resource with ID ${id} not found`);
    }
    return resource;
  }

  async update(id: string, updateResourceDto: UpdateResourceDto): Promise<ResourceDocument> {
    const updatedResource = await this.resourceModel
      .findByIdAndUpdate(id, updateResourceDto, { new: true })
      .exec();
    if (!updatedResource) {
      throw new NotFoundException(`Resource with ID ${id} not found`);
    }
    return updatedResource;
  }

  async remove(id: string): Promise<void> {
    const result = await this.resourceModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Resource with ID ${id} not found`);
    }
  }

  async search(query: string): Promise<ResourceDocument[]> {
    const searchRegex = new RegExp(query, 'i');
    return await this.resourceModel
      .find({
        $or: [
          { title: searchRegex },
          { description: searchRegex },
          { tags: searchRegex }
        ]
      })
      .exec();
  }

  async findByCategory(category: string): Promise<ResourceDocument[]> {
    return await this.resourceModel.find({ category }).exec();
  }
} 