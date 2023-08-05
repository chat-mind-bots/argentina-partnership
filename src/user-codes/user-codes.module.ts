import { Module } from '@nestjs/common';
import { UserCodesService } from './user-codes.service';
import { MongooseModule } from '@nestjs/mongoose';
import { UserCodesSchema, UserCodes } from 'src/user-codes/user-codes.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: UserCodes.name, schema: UserCodesSchema },
    ]),
  ],
  providers: [UserCodesService],
})
export class UserCodesModule {}
