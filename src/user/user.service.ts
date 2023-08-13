import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from 'src/user/user.schema';
import { Model } from 'mongoose';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { UserRoleEnum } from 'src/user/enum/user-role.enum';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

  async createUser(dto: CreateUserDto) {
    const user = await this.userModel.create(dto);
    return user;
  }

  async promoteUser(id: number, role: UserRoleEnum) {
    const user = await this.findByTgId(id);
    await user.updateOne({ $addToSet: { role: role } }, { new: true });
    return await this.findByTgId(id);
  }

  async restrictUser(id: string, role: UserRoleEnum) {
    const user = await this.findById(id);

    await user.updateOne({ $pull: { role: role } }, { new: true });
    return await this.findById(id);
  }

  async findByTgId(id: number) {
    return this.userModel.findOne({ tg_id: id });
  }

  async findById(id: string) {
    return this.userModel.findOne({ _id: id });
  }

  async findAllByRole(role: UserRoleEnum) {
    return this.userModel.find({ role });
  }
}
