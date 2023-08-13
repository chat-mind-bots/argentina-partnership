import { IsOptional, IsString } from 'class-validator';

export class CreateBusinessDto {
  @IsString()
  readonly categoryName: string;

  @IsString()
  readonly title: string;

  @IsString()
  readonly contacts: string;

  @IsString()
  @IsOptional()
  readonly description?: string;

  @IsString()
  @IsOptional()
  readonly address?: string;

  @IsString()
  @IsOptional()
  readonly preview?: string;
}
