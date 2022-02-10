import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schema/user.schema';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}
  // create a user
  async createUser(data: UserDocument): Promise<UserDocument> {
    const { password, email } = data;
    if (!password || !email)
      throw new BadRequestException('Email and password is required');
    try {
      const user = await this.userModel.create(data);
      return user;
    } catch (error) {
      throw error;
    }
  }
  // get all users
  async getUsers(): Promise<UserDocument[]> {
    try {
      const users = await this.userModel.find();
      return users;
    } catch (error) {
      throw error;
    }
  }
  // get a user
  async getUser(id: string): Promise<UserDocument> {
    try {
      const user = await this.userModel.findById(id);
      return user;
    } catch (error) {
      throw error;
    }
  }

  // update a user
  async updateUser(data: UserDocument): Promise<UserDocument> {
    try {
      const user = await this.userModel.findByIdAndUpdate(data.id, data, {
        new: true,
      });
      return user;
    } catch (error) {
      throw error;
    }
  }
  // delete a user
  async deleteUser(id: string): Promise<UserDocument> {
    try {
      const user = await this.userModel.findById(id);
      if (!user) throw new NotFoundException('No record found');
      user.remove();
      return user;
    } catch (error) {
      throw error;
    }
  }

  async deleteAllUsers(): Promise<UserDocument[]> {
    try {
      const users = await this.userModel.find();
      if (users) {
        users.forEach((user) => user.remove());
      }
      return users;
    } catch (error) {
      throw error;
    }
  }
}
