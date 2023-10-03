import { PurchaseItem } from 'src/purchase/purchase.schema';
import { IsArray, ValidateNested } from 'class-validator';

export class CreatePurchaseDto {
  @IsArray()
  @ValidateNested()
  readonly items: Array<PurchaseItem>;
}
