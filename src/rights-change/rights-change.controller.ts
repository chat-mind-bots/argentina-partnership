import { Controller } from '@nestjs/common';
import { RightsChangeService } from './rights-change.service';

@Controller('rights-change')
export class RightsChangeController {
  constructor(private readonly rightsChangeService: RightsChangeService) {}
}
