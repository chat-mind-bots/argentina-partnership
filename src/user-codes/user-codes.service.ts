import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, now, Types } from 'mongoose';
import { UserCodes, UserCodesDocument } from 'src/user-codes/user-codes.schema';
import { UserCodeStatusEnum } from 'src/user-codes/enums/user-code-status.enum';

@Injectable()
export class UserCodesService {
  constructor(
    @InjectModel(UserCodes.name)
    private readonly userCodesModel: Model<UserCodesDocument>,
  ) {}

  generateRandomUserCode(length): string {
    const characters = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjmnpqrstuvwxyz123456789';
    let code = '';

    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      code += characters.charAt(randomIndex);
    }

    return code;
  }

  getFutureDate() {
    const now = new Date();
    return new Date(now.getTime() + 60 * 60 * 1000 + 60 * 1000);
  }

  async generateUniqCode(userId: Types.ObjectId) {
    const uniqCode: Partial<UserCodes> = {
      user: userId,
      code: this.generateRandomUserCode(6),
      status: UserCodeStatusEnum.pending,
      expiresAt: this.getFutureDate(),
    };

    const code = await this.userCodesModel.create(uniqCode);
    return code;
  }

  async checkCode(code: string) {
    const codeDB = await this.userCodesModel
      .findOne({
        code: code,
        status: UserCodeStatusEnum.pending,
        expiresAt: { $gt: now() },
      })
      .populate('user');

    return codeDB;
  }

  async updateCodeStatus(codeId: Types.ObjectId, status: UserCodeStatusEnum) {
    await this.userCodesModel.findByIdAndUpdate(codeId, { status });
  }
}
