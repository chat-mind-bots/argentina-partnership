import {
  Action,
  Command,
  Ctx,
  InjectBot,
  Message,
  On,
  Start,
  Update,
} from 'nestjs-telegraf';
import { forwardRef, Inject, UseFilters } from '@nestjs/common';
import { TelegrafExceptionFilter } from 'src/common/filtres/telegraf-exeption.filter';
import { Context, Telegraf } from 'telegraf';
import { isPrivate } from 'src/bot/bot.utils';
import { UserService } from 'src/user/user.service';
import { UserRoleEnum } from 'src/user/enum/user-role.enum';
import { SceneContext } from 'telegraf/typings/scenes';
import { Chat } from 'typegram/manage';
import { UserCodesService } from 'src/user-codes/user-codes.service';
import { BotService } from 'src/bot/bot.service';

@Update()
@UseFilters(TelegrafExceptionFilter)
export class BotUpdate {
  constructor(
    @InjectBot() private readonly bot: Telegraf<Context>,
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
    private readonly userCodeService: UserCodesService,
    @Inject(forwardRef(() => BotService))
    private readonly botService: BotService,
  ) {}

  @Start()
  async startCommand(
    @Message('from') from,
    @Message('chat') chat,
    @Ctx() ctx: Context & SceneContext,
  ) {
    if (isPrivate(chat.type)) {
      const isOldUser = await this.userService.findByTgId(from.id);
      if (!isOldUser) {
        const info = (await ctx.getChat()) as Chat.PrivateChat;
        const { id: tg_id, username, first_name } = info;
        await this.userService.createUser({
          tg_id,
          username,
          first_name,
          balance: 0,
          refCode: 'fixitsoon',
          role: [UserRoleEnum.USER],
        });
      }

      await this.menuCommand(ctx, from);
    }
  }

  @Action('adminScene')
  async adminScene(@Ctx() ctx: Context & SceneContext) {
    await ctx.scene.enter('adminScene');
  }
  @Action('reenter')
  async reenter(@Ctx() ctx: Context & SceneContext) {
    await ctx.scene.reenter();
  }

  @Action('userScene')
  async userScene(@Ctx() ctx: Context & SceneContext) {
    await ctx.scene.enter('userScene');
  }

  async menu(@Ctx() ctx: Context & SceneContext, @Message('from') from) {
    await this.botService.menu(ctx, from);
  }

  @Command('menu')
  async menuCommand(@Ctx() ctx: Context & SceneContext, @Message('from') from) {
    await this.menu(ctx, from);
  }
  @Command('change_role')
  async changeRoleCommand(
    @Ctx() ctx: Context & SceneContext,
    @Message('from') from,
  ) {
    await this.menu(ctx, from);
  }

  @Command('help')
  async helpCommand(@Ctx() ctx: Context & SceneContext) {
    await this.botService.helpCommand(ctx);
  }

  @Command('generate_code')
  async generateCode(@Ctx() ctx: Context, @Message('from') from) {
    const user = await this.userService.findByTgId(from.id);

    const { qrCode, codeDocument } =
      await this.userCodeService.generateUniqCode(user._id);

    await ctx.replyWithPhoto({ source: qrCode });
    await ctx.replyWithHTML(`<b>${codeDocument.code}</b>`);
    await ctx.replyWithHTML(
      `Ваш уникальный код: <b>${codeDocument.code}</b>
Покажите Qr-код, или код в текстовом формате во время расчета
Код можно использовать только 1 раз\n
<b>Внимание, код будет действителен в течении одного часа</b>\n
Если вы не успеет активировать его в течении 1-го часа, то просто сгененрируйте новый, при помощи команды: /generate_code`,
    );
  }

  @Command('open_partners')
  async openPartners(@Ctx() ctx: Context, @Message('from') from) {
    await this.botService.sendMessageWithWebApp(from.id);
  }

  @On('text')
  async actionMenu(
    @Ctx() ctx: Context & SceneContext,
    @Message('text') msg: string,
    @Message('from') from,
  ) {
    if (msg === 'Главное меню') {
      await this.reenter(ctx);
    }
    if (msg === 'Помощь') {
      await this.helpCommand(ctx);
    }
    if (msg === 'Выйти') {
      await this.menuCommand(ctx, from);
    }
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    if (msg?.web_app_data?.data) {
      await this.menu(ctx, from);
    }
  }
}
