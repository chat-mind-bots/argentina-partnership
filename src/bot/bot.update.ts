import {
  Action,
  Ctx,
  InjectBot,
  Message,
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

@Update()
@UseFilters(TelegrafExceptionFilter)
export class BotUpdate {
  constructor(
    @InjectBot() private readonly bot: Telegraf<Context>,
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
  ) {}

  @Start()
  async startCommand(
    @Message('from') from,
    @Message('chat') chat,
    @Ctx() ctx: Context & SceneContext,
  ) {
    if (isPrivate(chat.type)) {
      const isOldUser = await this.userService.findById(from.id);
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
        return;
      }
      if (isOldUser.role.every((item) => item === UserRoleEnum.USER)) {
        await ctx.scene.enter('userScene', { data: 'asd' });
        return;
      }
      const markupButtons = [];
      if (isOldUser.role.includes(UserRoleEnum.USER)) {
        markupButtons.push(
          Markup.button.callback('войти как юзер', 'userScene'),
        );
      }
      if (isOldUser.role.includes(UserRoleEnum.ADMIN)) {
        markupButtons.push(
          Markup.button.callback('войти как админ', 'adminScene'),
        );
      }
      if (isOldUser.role.includes(UserRoleEnum.PARTNER)) {
        markupButtons.push(Markup.button.callback('войти как партнер', 'asd'));
      }
      const markup = Markup.inlineKeyboard(markupButtons);
      const greetingText =
        'Приветствую!\n для продолжения работы выберите под каким профилем хотите войти';
      await ctx.reply(greetingText, markup);
    }
  }

  @Action('adminScene')
  async adminScene(@Ctx() ctx: Context & SceneContext) {
    await ctx.scene.enter('adminScene');
  }

  @Action('userScene')
  async userScene(@Ctx() ctx: Context & SceneContext) {
    await ctx.scene.enter('userScene');
  }
}
