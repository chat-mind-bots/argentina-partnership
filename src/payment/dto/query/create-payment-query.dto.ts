import { Types } from 'mongoose';
import { IsMongoId } from 'class-validator';

export class CreatePaymentQueryDto {
  @IsMongoId()
  userId: string;
}
