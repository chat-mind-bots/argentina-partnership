import { IsNumber, IsString } from 'class-validator';

export class CreateCodeQueryDto {
  @IsString()
  readonly light: string;

  @IsString()
  readonly dark: string;

  @IsNumber()
  readonly userId: number;
}
