import { IsOptional, IsString } from 'class-validator';
export class CreateCategoryDto {
  @IsString()
  readonly title: string;

  @IsString()
  @IsOptional()
  readonly description?: string;
}
