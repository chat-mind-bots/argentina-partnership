import { Action, Ctx, On, Scene, SceneEnter } from 'nestjs-telegraf';
import { forwardRef, Inject } from '@nestjs/common';
import { BotService } from 'src/bot/bot.service';
import { Context, Markup } from 'telegraf';

@Scene('userScene')
export class UserScene {
  constructor(
    @Inject(forwardRef(() => BotService))
    private readonly botService: BotService,
  ) {}

  @SceneEnter()
  async enter(@Ctx() ctx: Context) {
    await ctx.reply('ты user');
    const markup = Markup.inlineKeyboard([
      Markup.button.callback('Сотрудничество', 'partnership'),
    ]);
    console.log(ctx);
    await ctx.reply('Можешь выбрать интересующие тебя функции', markup);
  }
  @On('text')
  async text(@Ctx() ctx: Context) {
    await ctx.reply('ты user');
  }

  @Action('partnership')
  async partnershipAction(@Ctx() ctx: Context) {
    await ctx.reply('ты чо ахуел');
  }
}
