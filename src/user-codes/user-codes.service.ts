import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, now, Types } from 'mongoose';
import { UserCodes, UserCodesDocument } from 'src/user-codes/user-codes.schema';
import { UserCodeStatusEnum } from 'src/user-codes/enums/user-code-status.enum';
import { QrcodeService } from 'src/qrcode/qrcode.service';

@Injectable()
export class UserCodesService {
  constructor(
    @InjectModel(UserCodes.name)
    private readonly userCodesModel: Model<UserCodesDocument>,
    private readonly qrCodeService: QrcodeService,
  ) {}

  private generateRandomUserCode(length): string {
    const characters = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjmnpqrstuvwxyz123456789';
    let code = '';

    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      code += characters.charAt(randomIndex);
    }

    return code;
  }

  private getFutureDate() {
    const now = new Date();
    return new Date(now.getTime() + 60 * 60 * 1000 + 60 * 1000);
  }

  async generateUniqCode(
    userId: Types.ObjectId,
  ): Promise<{ codeDocument: UserCodesDocument; qrCode: Buffer }> {
    const uniqCode: Partial<UserCodes> = {
      user: userId,
      code: this.generateRandomUserCode(6),
      status: UserCodeStatusEnum.pending,
      expiresAt: this.getFutureDate(),
    };

    const code = await this.userCodesModel.create(uniqCode);

    const qrCode = await this.qrCodeService.getQrCodeByParam(
      `user-code-${uniqCode.code}`,
    );

    return { codeDocument: code, qrCode: qrCode };
  }

  async checkCode(code: string): Promise<'authorized' | 'reject'> {
    const codeDB = await this.userCodesModel
      .findOne({
        code: code,
        status: UserCodeStatusEnum.pending,
        expiresAt: { $gt: now() },
      })
      .populate('user');

    if (codeDB) {
      await codeDB.updateOne({ status: UserCodeStatusEnum.activated });
    }
    return codeDB ? 'authorized' : 'reject';
  }

  async updateCodeStatus(codeId: Types.ObjectId, status: UserCodeStatusEnum) {
    await this.userCodesModel.findByIdAndUpdate(codeId, { status });
  }
}
