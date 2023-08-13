import { Scene } from 'nestjs-telegraf';
import { UseFilters } from '@nestjs/common';
import { TelegrafExceptionFilter } from 'src/common/filtres/telegraf-exeption.filter';

@Scene('partnerScene')
@UseFilters(TelegrafExceptionFilter)
export class PartnerScene {}
