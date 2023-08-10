import { Controller } from '@nestjs/common';
import { BusinessService } from 'src/business/business.service';

@Controller('partner')
export class BusinessController {
  constructor(private readonly partnerService: BusinessService) {}
}
