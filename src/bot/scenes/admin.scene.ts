import { Action, Ctx, Scene, SceneEnter } from 'nestjs-telegraf';
import { forwardRef, Inject, UseFilters } from '@nestjs/common';
import { BotService } from 'src/bot/bot.service';
import { Markup } from 'telegraf';
import { SceneContext } from 'telegraf/typings/scenes';
import { RightsChangeService } from 'src/rights-change/rights-change.service';
import { UserService } from 'src/user/user.service';
import { UserRoleEnum } from 'src/user/enum/user-role.enum';
import { telegramDataHelper } from 'src/common/helpers/telegram-data.helper';
import { TicketStatus } from 'src/rights-change/rights-change.schema';
import { TelegrafExceptionFilter } from 'src/common/filtres/telegraf-exeption.filter';
import { buttonSplitterHelper } from 'src/common/helpers/button-splitter.helper';

@Scene('adminScene')
@UseFilters(TelegrafExceptionFilter)
export class AdminScene {
  constructor(
    @Inject(forwardRef(() => BotService))
    private readonly botService: BotService,
    @Inject(forwardRef(() => RightsChangeService))
    private readonly rightsChangeService: RightsChangeService,
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
  ) {}

  @SceneEnter()
  async enter(@Ctx() ctx: SceneContext) {
    const markup = Markup.inlineKeyboard([
      Markup.button.callback('Категории', 'category'),
      Markup.button.callback('Админы', 'admin'),
      Markup.button.callback('Партнеры', 'partner'),
      Markup.button.callback('Назад', 'leave'),
    ]);
    await ctx.editMessageText(
      'Можешь выбрать интересующие тебя функции',
      markup,
    );
  }

  @Action('leave')
  async leave(@Ctx() ctx: SceneContext) {
    await ctx.scene.leave();
  }

  @Action('admin')
  async admin(@Ctx() ctx: SceneContext) {
    const markup = Markup.inlineKeyboard([
      Markup.button.callback('Список админов', 'adminList'),
      Markup.button.callback('Заявки', 'adminTicket'),
      Markup.button.callback('Назад', 'enter'),
    ]);
    await ctx.editMessageText(
      'Можешь выбрать интересующие тебя функции',
      markup,
    );
  }

  @Action('partner')
  async partner(@Ctx() ctx: SceneContext) {
    const markup = Markup.inlineKeyboard([
      Markup.button.callback('Список пратнеров', 'partnerList'),
      Markup.button.callback('Заявки', 'partnerTicket'),
      Markup.button.callback('Назад', 'enter'),
    ]);
    await ctx.editMessageText('Эта функция в разработке', markup);
  }

  @Action('enter')
  async enterAction(@Ctx() ctx: SceneContext) {
    await this.enter(ctx);
  }

  @Action('adminList')
  async adminList(@Ctx() ctx: SceneContext) {
    const admins = await this.userService.findAllByRole(UserRoleEnum.ADMIN);
    const adminsMas = [];
    admins.map((admin, i) => {
      adminsMas.push([`${i + 1}. @${admin.username}`, admin.id]);
    });
    const lines = buttonSplitterHelper(
      adminsMas.map((admin) => admin[1]),
      8,
    );
    const actionButtons = lines.map((line) => {
      return line.map((button, i) => {
        return Markup.button.callback(`${i + 1}`, `selectAdmin__${button}`);
      });
    });
    const markup = Markup.inlineKeyboard([
      [Markup.button.callback('Назад', 'admin')],
      ...actionButtons,
    ]);
    await ctx.editMessageText(
      `Список админов` +
        '\n' +
        'Выберете админа:' +
        '\n' +
        adminsMas.map((admin) => admin[0]).join('\n'),
      markup,
    );
  }

  @Action(/selectAdmin/)
  async selectAdmin(@Ctx() ctx: SceneContext) {
    const userId = telegramDataHelper(ctx.callbackQuery['data'], '__');
    const user = await this.userService.findById(userId);
    const userText = `Пользователь \nТелеграм ID: ${
      user.tg_id
    }\nДолжность: ${user.role.join(' ')}\nЮзернэйм: @${user.username}`;
    const markup = Markup.inlineKeyboard([
      Markup.button.callback('Назад', 'adminList'),
    ]);
    await ctx.editMessageText(userText, markup);
  }

  @Action('adminTicket')
  async adminTicket(@Ctx() ctx: SceneContext) {
    const tickets = await this.rightsChangeService.findTicketsByStatus(
      UserRoleEnum.ADMIN,
      TicketStatus.PENDING,
    );
    if (!tickets.length) {
      const markup = Markup.inlineKeyboard([
        Markup.button.callback('Назад', 'admin'),
      ]);
      await ctx.editMessageText('Сейчас заявок нет', markup);
      return;
    }
    tickets.map((ticket) => {
      const markup = Markup.inlineKeyboard([
        Markup.button.callback('Принять', `acceptAdmin__${ticket.id}`),
        Markup.button.callback('Отклонить', `rejectAdmin__${ticket.id}`),
      ]);
      ctx.reply(
        `Заявка:` + '\n' + ticket.role + '\n' + ticket.user.username,
        markup,
      );
    });
  }

  @Action(/acceptAdmin/)
  async acceptAdmin(@Ctx() ctx: SceneContext) {
    const id = telegramDataHelper(ctx.callbackQuery['data'], '__');
    const ticket = await this.rightsChangeService.updateStatus(
      id,
      TicketStatus.RESOLVE,
    );
    await this.userService.promoteUser(ticket.user.tg_id, ticket.role);
  }

  @Action(/rejectAdmin/)
  async rejectAdmin(@Ctx() ctx: SceneContext) {
    const id = telegramDataHelper(ctx.callbackQuery['data'], '__');
    await this.rightsChangeService.updateStatus(id, TicketStatus.REJECT);
  }
}
