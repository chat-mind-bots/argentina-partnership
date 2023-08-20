import { IsNumber } from 'class-validator';

export class UploadBodyDto {
  @IsNumber()
  userId: number;
}
