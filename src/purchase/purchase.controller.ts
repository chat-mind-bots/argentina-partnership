import { Controller, Post, Body, Req } from '@nestjs/common';
import { PurchaseService } from './purchase.service';
import { CreatePurchaseDto } from './dto/create-purchase.dto';
import { getIdByToken } from 'src/auth/auth.service';

@Controller('purchase')
export class PurchaseController {
  constructor(private readonly purchaseService: PurchaseService) {}

  @Post()
  create(@Body() body: CreatePurchaseDto, @Req() req) {
    const token = req.headers.authorization;
    const userId = +getIdByToken(token);
    return this.purchaseService.create(userId, body);
  }
}
