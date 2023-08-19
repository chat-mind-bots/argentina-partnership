import { Module } from '@nestjs/common';
import { UserCodesService } from './user-codes.service';
import { MongooseModule } from '@nestjs/mongoose';
import { UserCodesSchema, UserCodes } from 'src/user-codes/user-codes.schema';
import { QrcodeModule } from 'src/qrcode/qrcode.module';
import { UserCodesController } from './user-codes.controller';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: UserCodes.name, schema: UserCodesSchema },
    ]),
    UserModule,
    QrcodeModule,
  ],
  providers: [UserCodesService],
  exports: [UserCodesService],
  controllers: [UserCodesController],
})
export class UserCodesModule {}
