import { Action, Ctx, Scene, SceneEnter } from 'nestjs-telegraf';
import { forwardRef, Inject } from '@nestjs/common';
import { BotService } from 'src/bot/bot.service';
import { Markup } from 'telegraf';
import { SceneContext } from 'telegraf/typings/scenes';
import { RightsChangeService } from 'src/rights-change/rights-change.service';
import { UserService } from 'src/user/user.service';
import { UserRoleEnum } from 'src/user/enum/user-role.enum';
import { telegramDataHelper } from 'src/common/helpers/telegram-data.helper';
import { TicketStatus } from 'src/rights-change/rights-change.schema';

@Scene('adminScene')
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
    await ctx.deleteMessage(ctx.callbackQuery.message.message_id);

    const markup = Markup.inlineKeyboard([
      Markup.button.callback('Категории', 'category'),
      Markup.button.callback('Админы', 'admin'),
      Markup.button.callback('Партнеры', 'partner'),
      Markup.button.callback('Назад', 'leave'),
    ]);
    await ctx.reply('Можешь выбрать интересующие тебя функции', markup);
  }

  @Action('leave')
  async leave(@Ctx() ctx: SceneContext) {
    await ctx.scene.leave();
  }

  @Action('admin')
  async admin(@Ctx() ctx: SceneContext) {
    await ctx.deleteMessage(ctx.callbackQuery.message.message_id);

    const markup = Markup.inlineKeyboard([
      Markup.button.callback('Список админов', 'adminList'),
      Markup.button.callback('Заявки', 'adminTicket'),
      Markup.button.callback('Назад', 'enter'),
    ]);
    await ctx.reply('Можешь выбрать интересующие тебя функции', markup);
  }

  @Action('partner')
  async partner(@Ctx() ctx: SceneContext) {
    await ctx.deleteMessage(ctx.callbackQuery.message.message_id);

    const markup = Markup.inlineKeyboard([
      Markup.button.callback('Список пратнеров', 'partnerList'),
      Markup.button.callback('Заявки', 'partnerTicket'),
      Markup.button.callback('Назад', 'enter'),
    ]);
    await ctx.reply('Эта функция в разработке', markup);
  }

  @Action('enter')
  async enterAction(@Ctx() ctx: SceneContext) {
    await ctx.deleteMessage(ctx.callbackQuery.message.message_id);
    await this.enter(ctx);
  }

  @Action('adminList')
  async adminList(@Ctx() ctx: SceneContext) {
    const admins = await this.userService.findAllByRole(UserRoleEnum.ADMIN);
    admins.map((admin) => {
      ctx.reply(`Админ:` + '\n' + admin.username + '\n' + admin.tg_id);
    });
  }

  @Action('adminTicket')
  async adminTicket(@Ctx() ctx: SceneContext) {
    const tickets = await this.rightsChangeService.findTicketsByStatus(
      UserRoleEnum.ADMIN,
      TicketStatus.PENDING,
    );
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
