import { InjectBot, Update } from 'nestjs-telegraf';
import { UseFilters } from '@nestjs/common';
import { TelegrafExceptionFilter } from 'src/common/filtres/telegraf-exeption.filter';
import { Context, Telegraf } from 'telegraf';

@Update()
@UseFilters(TelegrafExceptionFilter)
export class botUpdate {
  constructor(@InjectBot() private readonly bot: Telegraf<Context>) {}
}
