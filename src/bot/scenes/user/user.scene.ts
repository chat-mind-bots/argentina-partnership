import { Action, Command, Ctx, Scene, SceneEnter } from 'nestjs-telegraf';
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
import { MessageMode } from 'src/bot/enums/message-mode.enum';

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

    await ctx.reply('Вы вошли как пользователь', keyboardMarkup);
    await this.menu(ctx, MessageMode.REPLY);
  }

  @Command('menu')
  async menuCommand(@Ctx() ctx: Context & SceneContext) {
    await this.menu(ctx, MessageMode.REPLY);
  }

  @Action('menu')
  async menu(@Ctx() ctx: Context & SceneContext, mode: MessageMode) {
    const markup = Markup.inlineKeyboard([
      [
        Markup.button.callback('📲 Показать QR-код', 'generate_qr_code'),
        Markup.button.callback('🛒 Магазины - партнеры', 'partners'),
      ],
      [
        Markup.button.callback('💰 баланс', 'show_balance'),
        Markup.button.callback('💲 Тарифы', 'tariffs'),
      ],
      [
        Markup.button.callback('🤝 Сотрудничество', 'partnership'),
        Markup.button.url(
          '🆘 Поддержка',
          `https://t.me/${process.env.SUPPORT_USERNAME}`,
        ),
      ],
      [this.botService.getMarkupWebApp('🧑‍💼 Личный кабинет', 'home')],
    ]);
    if (mode === MessageMode.REPLY) {
      await ctx.reply(
        'Приобретайте товары и услуги в Аргентине со скидками, через Argentina Parrtnership прямо в Telegram!',
        markup,
      );
    }
    if (mode === MessageMode.EDIT) {
      await ctx.editMessageText(
        `Приобретайте товары и услуги в Аргентине со скидками, через Argentina Parrtnership прямо в Telegram!`,
        markup,
      );
    }
  }

  @Action('callMenu')
  async callMenu(@Ctx() ctx: SceneContext) {
    await this.menu(ctx, MessageMode.EDIT);
  }

  @Action('partnership')
  async partnershipAction(@Ctx() ctx: SceneContext) {
    const user = await this.userService.findByTgId(ctx.callbackQuery.from.id);
    const isAdmin = user.role.includes(UserRoleEnum.ADMIN);
    const isPartner = user.role.includes(UserRoleEnum.PARTNER);
    const adminButton = isAdmin
      ? Markup.button.callback('✅ Администратор', 'isAdmin')
      : Markup.button.callback(
          'Заявка администратора',
          `createAdmin__${user.id}`,
        );

    const partnerButton = isPartner
      ? Markup.button.callback('✅ Партнер', 'isPartner')
      : Markup.button.callback('Заявка партнера', `createPartner__${user.id}`);

    const markup = Markup.inlineKeyboard([
      [adminButton],
      [partnerButton],
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

  @Action('isPartner')
  async isPartner(@Ctx() ctx: SceneContext) {
    const markup = Markup.inlineKeyboard([
      Markup.button.callback('Назад', 'partnership'),
    ]);
    await ctx.editMessageText('Вы уже являетесь партнером ✅', markup);
  }

  @Action(/createPartner/)
  async createPartnerTicket(@Ctx() ctx: SceneContext) {
    const userData = ctx.callbackQuery['data'] as string;
    const userId = telegramDataHelper(userData, '__');
    const userObjectId = new Types.ObjectId(userId);
    const markup = Markup.inlineKeyboard([
      Markup.button.callback('Назад', 'partnership'),
    ]);
    try {
      const isTicketExist = await this.rightsChangeService.findTicket(
        userId,
        UserRoleEnum.PARTNER,
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
        role: UserRoleEnum.PARTNER,
        status: TicketStatus.PENDING,
      });
      await ctx.editMessageText('Ваша заявка была отправлена', markup);
    }
  }

  @Action(/createAdmin/)
  async createAdminTicket(@Ctx() ctx: SceneContext) {
    const userData = ctx.callbackQuery['data'] as string;
    const userId = telegramDataHelper(userData, '__');
    const userObjectId = new Types.ObjectId(userId);
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

  @Action('generate_qr_code')
  async generateQqCode(@Ctx() ctx: SceneContext) {
    return this.botService.generateCode(ctx, ctx.from.id);
  }

  @Action('show_balance')
  async showBalance(@Ctx() ctx: SceneContext) {
    const balanceAmount = await this.userService.showUserBalance(
      ctx.callbackQuery.from.id,
    );
    const markup = Markup.inlineKeyboard([
      // [this.botService.getMarkupWebApp('Пополнить баланс', 'balance/top-up')],
      [Markup.button.callback('Назад', 'callMenu')],
    ]);
    await ctx.editMessageText(
      `<b>Ваш актульный баланс: </b> ${balanceAmount} tokens`,
      { ...markup, parse_mode: 'HTML' },
    );
  }
}
