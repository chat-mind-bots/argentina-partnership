import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from 'src/user/user.schema';
import { Model } from 'mongoose';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { UserRoleEnum } from 'src/user/enum/user-role.enum';
import { BalanceService } from 'src/balance/balance.service';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    private readonly balanceService: BalanceService,
  ) {}

  async createUser(dto: Omit<CreateUserDto, 'balance'>) {
    const { _id } = await this.balanceService.createBalance();
    const userDto: CreateUserDto = { ...dto, balance: _id };
    return this.userModel.create(userDto);
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

  async findByTgId(id: number, isShowBalance?: boolean) {
    return isShowBalance
      ? this.userModel.findOne({ tg_id: id })
      : this.userModel.findOne({ tg_id: id }).select('-balance');
  }

  async findById(id: string, isShowBalance?: boolean) {
    return isShowBalance
      ? this.userModel
          .findById(id)
          .populate({ path: 'balance', select: 'amount' })
      : this.userModel.findById(id).select('-balance');
  }

  async findAllByRole(role: UserRoleEnum, isShowBalance?: boolean) {
    return isShowBalance
      ? this.userModel.find({ role })
      : this.userModel.find({ role }).select('-balance');
  }

  async showUserBalance(tgId: number) {
    const { balance } = await this.findByTgId(tgId, true);
    return this.balanceService.showAmountBalance(balance);
  }
}
