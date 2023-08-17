import { forwardRef, Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { Ctx, InjectBot, Message } from 'nestjs-telegraf';
import { Context, Markup, Telegraf } from 'telegraf';
import { SceneContext } from 'telegraf/typings/scenes';
import { UserRoleEnum } from 'src/user/enum/user-role.enum';
import { UserService } from 'src/user/user.service';
import * as process from 'process';
import { WebAppRoutes } from 'src/bot/interfaces/webAppRoutes';

@Injectable()
export class BotService implements OnModuleInit {
  constructor(
    @InjectBot() private readonly bot: Telegraf<Context>,
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
  ) {}
  async onModuleInit() {
    await this.bot.telegram.setMyCommands([
      {
        command: 'start',
        description: 'Начало работы бота/получения последних обновлений',
      },
      { command: 'menu', description: 'Меню' },
      { command: 'change_role', description: 'Сменить роль' },
      { command: 'help', description: 'Получить подсказку' },
      { command: 'open_partners', description: 'Получить список партнеров' },
      { command: 'add_business', description: 'Добавить бизнес' },
    ]);
  }

  async sendMessage(chatId: number, message: string) {
    await this.bot.telegram.sendMessage(chatId, message);
    return;
  }

  async sendPhoto(chatId: number, image: Buffer) {
    await this.bot.telegram.sendPhoto(chatId, { source: image });
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
        Markup.button.callback('войти как администратор', 'adminScene'),
      ]);
    }
    if (isOldUser.role.includes(UserRoleEnum.PARTNER)) {
      markupButtons.push([
        Markup.button.callback('войти как партнер', 'partnerScene'),
      ]);
    }

    const markup = Markup.inlineKeyboard(markupButtons);
    const greetingText =
      'Для продолжения работы выберите под каким профилем хотите войти';

    await ctx.reply(greetingText, markup);
  }
  async helpCommand(@Ctx() ctx: Context & SceneContext) {
    await ctx.reply(
      'Если что-то пошло не так обратитесь за помощью в канал @canal_name',
    );
  }

  async sendMessageWithWebApp(
    chatId: number,
    route: string,
    mainText: string,
    webAppButtonText: string,
  ) {
    await this.bot.telegram.sendMessage(
      chatId,
      mainText,
      Markup.inlineKeyboard([
        Markup.button.webApp(
          webAppButtonText,
          `https://${process.env.BASE_URL}/${route}`,
        ),
      ]),
    );
  }

  async editMessageWithWebApp(
    chatId: number,
    messageId: number,
    inlineId: string,
    route: WebAppRoutes,
    mainText: string,
    webAppButtonText: string,
  ) {
    await this.bot.telegram.editMessageText(
      chatId,
      messageId,
      inlineId,
      mainText,
      Markup.inlineKeyboard([
        Markup.button.webApp(
          webAppButtonText,
          `https://${process.env.BASE_URL}/${route}`,
        ),
      ]),
    );
  }
}
