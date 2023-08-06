import { Module } from '@nestjs/common';
import { UserCodesService } from './user-codes.service';
import { MongooseModule } from '@nestjs/mongoose';
import { UserCodesSchema, UserCodes } from 'src/user-codes/user-codes.schema';
import { QrcodeModule } from 'src/qrcode/qrcode.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: UserCodes.name, schema: UserCodesSchema },
    ]),
    QrcodeModule,
  ],
  providers: [UserCodesService],
  exports: [UserCodesService],
})
export class UserCodesModule {}
