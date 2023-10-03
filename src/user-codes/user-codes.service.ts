import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, now, Types } from 'mongoose';
import { UserCodes, UserCodesDocument } from 'src/user-codes/user-codes.schema';
import { UserCodeStatusEnum } from 'src/user-codes/enums/user-code-status.enum';
import { QrcodeService } from 'src/qrcode/qrcode.service';
import { UserService } from 'src/user/user.service';
import { CreateCodeQueryDto } from 'src/user-codes/dto/create-code-query.dto';
import { SubscriptionService } from 'src/subscription/subscription.service';

@Injectable()
export class UserCodesService {
  constructor(
    @InjectModel(UserCodes.name)
    private readonly userCodesModel: Model<UserCodesDocument>,
    private readonly userService: UserService,
    private readonly qrCodeService: QrcodeService,
    private readonly subscriptionService: SubscriptionService,
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
    return new Date(now.getTime() + 60 * 60 * 1000);
  }

  async getUserCodeForWeb(query: CreateCodeQueryDto) {
    const { _id } = await this.userService.findByTgId(query.userId);
    const data = !!(
      await this.subscriptionService.findSubscription(query.userId, true)
    ).length;

    if (!_id) {
      throw new HttpException(
        'Document (User) not found',
        HttpStatus.NOT_FOUND,
      );
    }
    if (!data) {
      throw new HttpException(
        'Document (Subscription) not found',
        HttpStatus.NOT_FOUND,
      );
    }

    return this.generateUniqCode(_id, { light: query.light, dark: query.dark });
  }

  private async codeToData(
    code: UserCodesDocument,
    colorSchema?: { dark: string; light: string },
  ): Promise<{
    codeDocument: UserCodesDocument;
    qrCode: Buffer;
  }> {
    const qrCode = await this.qrCodeService.getQrCodeByParam(
      `user-code-${code.code}`,
      colorSchema,
    );

    return { codeDocument: code, qrCode: qrCode };
  }

  async generateUniqCode(
    userId: Types.ObjectId,
    colorSchema?: { dark: string; light: string },
  ): Promise<{ codeDocument: UserCodesDocument; qrCode: Buffer }> {
    const codeDB = await this.userCodesModel.findOne({
      status: UserCodeStatusEnum.pending,
      expiresAt: { $gt: new Date() },
      user: userId,
    });

    if (codeDB) {
      return this.codeToData(codeDB, colorSchema);
    }

    const uniqCode: Partial<UserCodes> = {
      user: userId,
      code: this.generateRandomUserCode(6),
      status: UserCodeStatusEnum.pending,
      expiresAt: this.getFutureDate(),
    };

    const code = await this.userCodesModel.create(uniqCode);

    return this.codeToData(code, colorSchema);
  }

  async checkCode(
    code: string,
    userId: number,
  ): Promise<'authorized' | 'reject'> {
    const { _id } = await this.userService.findByTgId(userId);
    const codeDB = await this.userCodesModel
      .findOne({
        code: code,
        status: UserCodeStatusEnum.pending,
        expiresAt: { $gt: Date.now },
      })
      .populate('user');

    if (codeDB) {
      await codeDB.updateOne({
        status: UserCodeStatusEnum.activated,
        activatedBy: _id,
      });
    }
    return codeDB ? 'authorized' : 'reject';
  }

  async updateCodeStatus(codeId: Types.ObjectId, status: UserCodeStatusEnum) {
    await this.userCodesModel.findByIdAndUpdate(codeId, { status });
  }
}
