import { Action, Ctx, Scene, SceneEnter } from 'nestjs-telegraf';
import { forwardRef, Inject, UseFilters } from '@nestjs/common';
import { BotService } from 'src/bot/bot.service';
import { Context, Markup } from 'telegraf';
import { SceneContext } from 'telegraf/typings/scenes';
import { RightsChangeService } from 'src/rights-change/rights-change.service';
import { UserService } from 'src/user/user.service';
import { UserRoleEnum } from 'src/user/enum/user-role.enum';
import { telegramDataHelper } from 'src/common/helpers/telegram-data.helper';
import { Types } from 'mongoose';
import { TicketStatus } from 'src/rights-change/rights-change.schema';
import { TelegrafExceptionFilter } from 'src/common/filtres/telegraf-exeption.filter';

enum MessageMode {
  EDIT = 'EDIT',
  REPLY = 'REPLY',
}

@Scene('userScene')
@UseFilters(TelegrafExceptionFilter)
export class UserScene {
  constructor(
    @Inject(forwardRef(() => BotService))
    private readonly botService: BotService,
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
    @Inject(forwardRef(() => RightsChangeService))
    private readonly rightsChangeService: RightsChangeService,
  ) {}

  @SceneEnter()
  async enter(@Ctx() ctx: Context & SceneContext) {
    const keyboardMarkup = Markup.keyboard([
      [Markup.button.callback('Главное меню', 'menu')],
      [Markup.button.callback('Помощь', 'help')],
      [Markup.button.callback('Выйти', 'changeRole')],
    ]).resize();

    await ctx.reply('Вы вошли как юзер', keyboardMarkup);
    await this.menu(ctx, MessageMode.REPLY);
  }

  @Action('menu')
  async menu(@Ctx() ctx: Context & SceneContext, mode: MessageMode) {
    const markup = Markup.inlineKeyboard([
      Markup.button.callback('Сотрудничество', 'partnership'),
    ]);
    if (mode === MessageMode.REPLY) {
      await ctx.reply('Можешь выбрать интересующие тебя функции', markup);
    }
    if (mode === MessageMode.EDIT) {
      await ctx.editMessageText(
        'Можешь выбрать интересующие тебя функции',
        markup,
      );
    }
  }

  @Action('changeRole')
  async changeRole(@Ctx() ctx: Context & SceneContext) {
    await this.leave(ctx);
  }
  @Action('leave')
  async leave(@Ctx() ctx: SceneContext) {
    await ctx.scene.leave();
  }

  @Action('callMenu')
  async enterAction(@Ctx() ctx: SceneContext) {
    await this.menu(ctx, MessageMode.EDIT);
  }

  @Action('partnership')
  async partnershipAction(@Ctx() ctx: SceneContext) {
    const user = await this.userService.findByTgId(ctx.callbackQuery.from.id);
    const isAdmin = user.role.includes(UserRoleEnum.ADMIN);
    const adminButton = isAdmin
      ? Markup.button.callback('✅ Администратор', 'callMenu')
      : Markup.button.callback(
          'Заявка администратора',
          `createAdmin__${user.id}`,
        );
    const markup = Markup.inlineKeyboard([
      [adminButton],
      [Markup.button.callback('Назад', 'callMenu')],
    ]);
    await ctx.editMessageText(
      'Тут вы можете отправить свою заявку на сотрудничество',
      markup,
    );
  }

  @Action('isAdmin')
  async isAdmin(@Ctx() ctx: SceneContext) {
    const markup = Markup.inlineKeyboard([
      Markup.button.callback('Назад', 'partnership'),
    ]);
    await ctx.editMessageText('Вы уже являетесь администратором ✅', markup);
  }

  @Action(/createAdmin/)
  async createPartnerTicket(@Ctx() ctx: SceneContext) {
    const userData = ctx.callbackQuery['data'] as string;
    const userId = telegramDataHelper(userData, '__');
    const userObjectId = new Types.ObjectId(userId);
    const user = await this.userService.findById(userId);
    const markup = Markup.inlineKeyboard([
      Markup.button.callback('Назад', 'partnership'),
    ]);
    try {
      const isTicketExist = await this.rightsChangeService.findTicket(
        userId,
        UserRoleEnum.ADMIN,
        TicketStatus.PENDING,
      );
      if (isTicketExist) {
        await ctx.editMessageText(
          'Ваша заявка сейчас в обработке: 🔄. Ожадайте решения администратора',
          markup,
        );
        return;
      }
    } catch (error) {
      await this.rightsChangeService.create({
        user: userObjectId,
        role: UserRoleEnum.ADMIN,
        status: TicketStatus.PENDING,
      });
      await ctx.editMessageText('Ваша заявка была отправлена', markup);
    }
  }
}
