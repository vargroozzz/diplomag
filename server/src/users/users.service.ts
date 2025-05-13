import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  async create(createUserDto: Partial<User>): Promise<UserDocument> {
    const createdUser = new this.userModel(createUserDto);
    return await createdUser.save();
  }

  async findAll(): Promise<User[]> {
    return await this.userModel.find().lean().exec();
  }

  async findOne(id: string): Promise<User | null> {
    return await this.userModel.findById(id).lean().exec();
  }

  async findByEmailWithDocument(email: string): Promise<UserDocument | null> {
    return await this.userModel.findOne({ email }).exec();
  }

  async findByEmail(email: string): Promise<User | null> {
    return await this.userModel.findOne({ email }).lean().exec();
  }

  async findByEmailVerificationToken(token: string): Promise<UserDocument | null> {
    return await this.userModel.findOne({
      emailVerificationToken: token,
      emailVerificationExpires: { $gt: new Date() },
    }).exec();
  }

  async verifyUserEmail(userId: string): Promise<UserDocument | null> {
    return await this.userModel.findByIdAndUpdate(
      userId,
      {
        isEmailVerified: true,
        emailVerificationToken: undefined,
        emailVerificationExpires: undefined,
      },
      { new: true },
    ).exec();
  }

  async updateEmailVerificationToken(userId: string, token: string, expires: Date): Promise<UserDocument | null> {
    return await this.userModel.findByIdAndUpdate(
      userId,
      {
        emailVerificationToken: token,
        emailVerificationExpires: expires,
        isEmailVerified: false,
      },
      { new: true },
    ).exec();
  }

  async update(id: string, updateUserDto: Partial<User>): Promise<User | null> {
    return await this.userModel
      .findByIdAndUpdate(id, updateUserDto, { new: true })
      .lean()
      .exec();
  }

  async updateUserDocumentFields(userId: string, updates: Partial<UserDocument>): Promise<UserDocument | null> {
    return await this.userModel.findByIdAndUpdate(userId, updates, { new: true }).exec();
  }

  async remove(id: string) {
    return await this.userModel.findByIdAndDelete(id).lean().exec();
  }
} 