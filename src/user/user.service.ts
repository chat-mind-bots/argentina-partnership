import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from 'src/user/user.schema';
import { Model } from 'mongoose';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { UserRoleEnum } from 'src/user/enum/user-role.enum';
import { BalanceService } from 'src/balance/balance.service';
import { Balance } from 'src/balance/balance.schema';
import { GetUserDto } from 'src/user/dto/query/get-user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    private readonly balanceService: BalanceService,
  ) {}

  async createUser(dto: Omit<CreateUserDto, 'balance'>, refUserId?: number) {
    const { _id } = await this.balanceService.createBalance();
    const refUser = await this.findByTgId(refUserId);
    const userDto: CreateUserDto = {
      ...dto,
      balance: _id,
      refId: refUser ? refUser._id : undefined,
    };
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

  async findWithBalanceByTgId(id: number) {
    return this.userModel
      .findOne({ tg_id: id })
      .populate<{ balance: Pick<Balance, 'amount'> & { _id: string } }>({
        path: 'balance',
        select: 'amount _id',
      });
  }

  async findById(id: string, isShowBalance?: boolean) {
    return isShowBalance
      ? this.userModel
          .findById(id)
          .populate({ path: 'balance', select: 'amount' })
      : this.userModel.findById(id).select('-balance');
  }

  async findAllByRole(
    // role: UserRoleEnum,
    // isShowBalance?: boolean,
    params?: GetUserDto,
  ) {
    const { isShowBalance, role, offset, limit } = params;

    const data = isShowBalance
      ? await this.userModel.find({ role }).skip(offset).limit(limit)
      : await this.userModel
          .find({ role })
          .select('-balance')
          .skip(offset)
          .limit(limit);
    const total = await this.userModel.countDocuments({ role });
    return { data, total };
  }

  async showUserBalance(tgId: number) {
    const { balance } = await this.findByTgId(tgId, true);
    return this.balanceService.showAmountBalance(balance);
  }

  async getUserForWebApp(userId: number) {
    const user = this.userModel
      .findOne({ tg_id: userId })
      .select('_id balance username refCode role')
      .populate({ path: 'balance', select: 'amount' });

    if (!user) {
      throw new HttpException(
        'Document (User) not found',
        HttpStatus.NOT_FOUND,
      );
    }
    return user;
  }
}
