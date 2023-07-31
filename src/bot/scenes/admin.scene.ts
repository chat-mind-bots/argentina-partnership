import { Ctx, On, Scene, SceneEnter } from 'nestjs-telegraf';
import { forwardRef, Inject } from '@nestjs/common';
import { BotService } from 'src/bot/bot.service';
import { Context } from 'telegraf';

@Scene('adminScene')
export class AdminScene {
  constructor(
    @Inject(forwardRef(() => BotService))
    private readonly botService: BotService,
  ) {}

  @SceneEnter()
  async enter(@Ctx() ctx: Context) {
    await ctx.reply('ты админ');
  }
  @On('text')
  async text(@Ctx() ctx: Context) {
    await ctx.reply('ты админ');
  }
}
