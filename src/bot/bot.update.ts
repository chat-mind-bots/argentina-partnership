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
import { Context, Markup, Telegraf } from 'telegraf';
import { isPrivate } from 'src/bot/bot.utils';
import { UserService } from 'src/user/user.service';
import { UserRoleEnum } from 'src/user/enum/user-role.enum';
import { SceneContext } from 'telegraf/typings/scenes';
import { Chat } from 'typegram/manage';
import { UserCodesService } from 'src/user-codes/user-codes.service';

@Update()
@UseFilters(TelegrafExceptionFilter)
export class BotUpdate {
  constructor(
    @InjectBot() private readonly bot: Telegraf<Context>,
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
    private readonly userCodeService: UserCodesService,
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
    const isOldUser = await this.userService.findByTgId(from.id);
    if (isOldUser.role.every((item) => item === UserRoleEnum.USER)) {
      await ctx.scene.enter('userScene');
      return;
    }
    const markupButtons = [];
    if (isOldUser.role.includes(UserRoleEnum.USER)) {
      markupButtons.push([
        Markup.button.callback('войти как юзер', 'userScene'),
      ]);
    }
    if (
      isOldUser.role.includes(UserRoleEnum.ADMIN) ||
      isOldUser.role.includes(UserRoleEnum.SUPER_ADMIN)
    ) {
      markupButtons.push([
        Markup.button.callback('войти как админ', 'adminScene'),
      ]);
    }
    if (isOldUser.role.includes(UserRoleEnum.PARTNER)) {
      markupButtons.push(Markup.button.callback('войти как партнер', 'asd'));
    }

    const markup = Markup.inlineKeyboard(markupButtons);
    const greetingText =
      'Для продолжения работы выберите под каким профилем хотите войти';

    await ctx.reply(greetingText, markup);
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
    await ctx.reply(
      'Если что-то пошло не так обратитесь за помощью в канал @canal_name',
    );
  }


  @Command('generate_code')
  async generateCode(@Ctx() ctx: Context, @Message('from') from) {
    const user = await this.userService.findByTgId(from.id);
    const { qrCode, codeDocument } =
      await this.userCodeService.generateUniqCode(user._id);
    await ctx.replyWithPhoto({ source: qrCode });
    await ctx.reply(
      `Ваш уникальный код - <s>${codeDocument.code}</s>\r<s>Внимание, код будет действителен в течении одного часа</s>`,
    );
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
  }
}
