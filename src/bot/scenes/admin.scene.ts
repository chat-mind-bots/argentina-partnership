import { Action, Command, Ctx, Scene, SceneEnter } from 'nestjs-telegraf';
import { forwardRef, Inject, UseFilters } from '@nestjs/common';
import { BotService } from 'src/bot/bot.service';
import { Context, Markup } from 'telegraf';
import { SceneContext } from 'telegraf/typings/scenes';
import { RightsChangeService } from 'src/rights-change/rights-change.service';
import { UserService } from 'src/user/user.service';
import { UserRoleEnum } from 'src/user/enum/user-role.enum';
import { telegramDataHelper } from 'src/common/helpers/telegram-data.helper';
import { TicketStatus } from 'src/rights-change/rights-change.schema';
import { TelegrafExceptionFilter } from 'src/common/filtres/telegraf-exeption.filter';
import { buttonSplitterHelper } from 'src/common/helpers/button-splitter.helper';
import { CategoriesService } from 'src/categories/categories.service';
import { MessageMode } from 'src/bot/enums/message-mode.enum';

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
    @Inject(forwardRef(() => CategoriesService))
    private readonly categoriesService: CategoriesService,
  ) {}

  @SceneEnter()
  async enter(@Ctx() ctx: Context & SceneContext) {
    try {
      if (ctx.callbackQuery['data'] === 'category') {
        await this.category(ctx);
        return;
      }
    } catch (error) {}

    const keyboardMarkup = Markup.keyboard([
      [Markup.button.callback('Главное меню', 'menu')],
      [Markup.button.callback('Помощь', 'help')],
      [Markup.button.callback('Выйти', 'changeRole')],
    ]).resize();
    await ctx.reply('Вы вошли как администратор', keyboardMarkup);

    await this.menu(ctx, MessageMode.REPLY);
  }

  @Command('menu')
  async menuCommand(@Ctx() ctx: Context & SceneContext) {
    await this.menu(ctx, MessageMode.REPLY);
  }

  @Action('reenter')
  async reenter(@Ctx() ctx: Context & SceneContext) {
    await ctx.scene.reenter();
  }

  @Action('menu')
  async menu(@Ctx() ctx: Context & SceneContext, mode: MessageMode) {
    const markup = Markup.inlineKeyboard([
      [Markup.button.callback('Категории', 'category')],
      [Markup.button.callback('Администраторы', 'admin')],
      [Markup.button.callback('Партнеры', 'partner')],
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

  @Action('category')
  async category(@Ctx() ctx: SceneContext) {
    const markup = Markup.inlineKeyboard([
      [Markup.button.callback('Список категорий', 'categoryList')],
      [
        Markup.button.callback('Добавить категорию', 'addCategory'),
        Markup.button.callback('Назад', 'callMenu'),
      ],
    ]);
    await ctx.editMessageText(
      'Можешь выбрать интересующие тебя функции',
      markup,
    );
  }

  @Action('categoryList')
  async categoryList(@Ctx() ctx: SceneContext) {
    const categories = await this.categoriesService.findAllCategories();
    if (!categories.length) {
      await ctx.editMessageText(
        'Пока что вы не добавили ни одну категорию',
        Markup.inlineKeyboard([
          Markup.button.callback('Назад', 'category'),
          Markup.button.callback('Добавить категорию', 'addCategory'),
        ]),
      );
      return;
    }

    const categoriesMas = [];
    categories.map((category, i) => {
      categoriesMas.push([`${i + 1}. ${category.title}`, category.id]);
    });
    const lines = buttonSplitterHelper(
      categoriesMas.map((category) => category[1]),
      8,
    );
    const actionButtons = lines.map((line, lineId) => {
      return line.map((button, i) => {
        return Markup.button.callback(
          `${i + 1 + lineId * lines[0].length}`,
          `selectCategory__${button}`,
        );
      });
    });
    const markup = Markup.inlineKeyboard([
      ...actionButtons,
      [Markup.button.callback('Назад', 'category')],
    ]);
    await ctx.editMessageText(
      `Список категорий` +
        '\n' +
        'Выберете категорию:' +
        '\n' +
        categoriesMas.map((category) => category[0]).join('\n'),
      markup,
    );
  }

  @Action(/selectCategory/)
  async selectCategory(@Ctx() ctx: SceneContext) {
    const categoryId = telegramDataHelper(ctx.callbackQuery['data'], '__');
    const category = await this.categoriesService.findById(categoryId);
    const markup = Markup.inlineKeyboard([
      [
        Markup.button.callback(
          'Удалить категорию',
          `deleteCategory__${categoryId}`,
        ),
      ],
      [Markup.button.callback('Назад', 'categoryList')],
    ]);

    await ctx.editMessageText(
      `Категория:` + '\n' + `${category.title}\n${category.description}`,
      markup,
    );
  }

  @Action(/deleteCategory/)
  async deleteCategory(@Ctx() ctx: SceneContext) {
    const categoryId = telegramDataHelper(ctx.callbackQuery['data'], '__');
    const markup = Markup.inlineKeyboard([
      [Markup.button.callback('Назад', 'categoryList')],
    ]);
    try {
      await this.categoriesService.removeCategory(categoryId);
      await ctx.editMessageText(
        ctx.callbackQuery.message['text'] +
          '\n' +
          'Категория была успешно удалена',
        markup,
      );
    } catch (erorr) {
      await ctx.editMessageText(
        ctx.callbackQuery.message['text'] +
          '\n' +
          'Категория не была удалена, что-то пошло не так. Попробуйте снова',
        markup,
      );
    }
  }

  @Action('addCategory')
  async addCategory(@Ctx() ctx: SceneContext) {
    // const markup = Markup.inlineKeyboard([
    //   [Markup.button.callback('Назад', 'category')],
    //   [Markup.button.callback('Назад', 'category')],
    // ]);
    // await ctx.editMessageText('Категория:\n', markup);
    await ctx.scene.enter('addCategory');
  }

  @Action('leave')
  async leave(@Ctx() ctx: SceneContext) {
    await ctx.scene.leave();
  }

  @Action('callMenu')
  async callMenu(@Ctx() ctx: SceneContext) {
    await this.menu(ctx, MessageMode.EDIT);
  }

  @Action('admin')
  async admin(@Ctx() ctx: SceneContext) {
    const markup = Markup.inlineKeyboard([
      [
        Markup.button.callback('Список администраторов', 'adminList'),
        Markup.button.callback('Заявки', 'adminTicket'),
      ],
      [Markup.button.callback('Назад', 'callMenu')],
    ]);
    await ctx.editMessageText(
      'Можешь выбрать интересующие тебя функции',
      markup,
    );
  }

  @Action('partner')
  async partner(@Ctx() ctx: SceneContext) {
    const markup = Markup.inlineKeyboard([
      [
        Markup.button.callback('Список пратнеров', 'partnerList'),
        Markup.button.callback('Заявки', 'partnerTicket'),
      ],
      [Markup.button.callback('Назад', 'callMenu')],
    ]);
    await ctx.editMessageText(
      'Можешь выбрать интересующие тебя функции',
      markup,
    );
  }

  @Action('partnerList')
  async partnerList(@Ctx() ctx: SceneContext) {
    const partners = await this.userService.findAllByRole(UserRoleEnum.PARTNER);
    if (!partners) {
      const markup = Markup.inlineKeyboard([
        [Markup.button.callback('Назад', 'partner')],
      ]);
      await ctx.editMessageText('Список партнеров пока что пуст 😢', markup);
      return;
    }
    const partnersMas = [];
    partners.map((partner, i) => {
      partnersMas.push([`${i + 1}. @${partner.username}`, partner.id]);
    });
    const lines = buttonSplitterHelper(
      partnersMas.map((partner) => partner[1]),
      8,
    );
    const actionButtons = lines.map((line, lineId) => {
      return line.map((button, i) => {
        return Markup.button.callback(
          `${i + 1 + lineId * lines[0].length}`,
          `selectPartner__${button}`,
        );
      });
    });
    const markup = Markup.inlineKeyboard([
      ...actionButtons,
      [Markup.button.callback('Назад', 'partner')],
    ]);
    await ctx.editMessageText(
      `Список партнеров` +
        '\n' +
        'Выберете партнера:' +
        '\n' +
        partnersMas.map((partner) => partner[0]).join('\n'),
      markup,
    );
  }

  @Action(/selectPartner/)
  async selectPartner(@Ctx() ctx: SceneContext) {
    const userId = telegramDataHelper(ctx.callbackQuery['data'], '__');
    const user = await this.userService.findById(userId);
    const userText = `Партнер
<b>Логин пользователя</b>: ${user.first_name}
<b>Профиль пользователя</b>: @${user.username}
<b>ID пользователя</b>: ${user.tg_id}`;
    await ctx.editMessageText(userText, {
      reply_markup: {
        inline_keyboard: [
          [Markup.button.callback('Назад', 'partnerList')],
          [
            Markup.button.callback(
              'Разжаловать',
              `requestRestrictPartner__${user.id}`,
            ),
          ],
        ],
      },
      parse_mode: 'HTML',
    });
  }

  @Action('partnerTicket')
  async partnerTicket(@Ctx() ctx: SceneContext) {
    const tickets = await this.rightsChangeService.findTicketsByStatus(
      UserRoleEnum.PARTNER,
      TicketStatus.PENDING,
    );
    if (!tickets.length) {
      const markup = Markup.inlineKeyboard([
        Markup.button.callback('Назад', 'partner'),
      ]);
      await ctx.editMessageText('Список заявок пока что пуст 😢', markup);
      return;
    }
    const partnerTickets = [];
    tickets.map((ticket, i) => {
      partnerTickets.push([
        `${i + 1}. @${ticket.user.username} ${ticket.user.first_name}`,
        ticket.id,
      ]);
    });

    const lines = buttonSplitterHelper(
      partnerTickets.map((ticket) => ticket[1]),
      8,
    );

    const actionButtons = lines.map((line, lineId) => {
      return line.map((button, i) => {
        return Markup.button.callback(
          `${i + 1 + lineId * lines[0].length}`,
          `selectPartTicket__${button}`,
        );
      });
    });

    const markup = Markup.inlineKeyboard([
      ...actionButtons,
      [Markup.button.callback('Назад', 'partner')],
    ]);

    await ctx.editMessageText(
      `Список заявок` +
        '\n\n' +
        'Выберите заявку:' +
        '\n' +
        partnerTickets.map((partner) => partner[0]).join('\n'),
      markup,
    );
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
    const actionButtons = lines.map((line, lineId) => {
      return line.map((button, i) => {
        return Markup.button.callback(
          `${i + 1 + lineId * lines[0].length}`,
          `selectAdmin__${button}`,
        );
      });
    });
    const markup = Markup.inlineKeyboard([
      ...actionButtons,
      [Markup.button.callback('Назад', 'admin')],
    ]);
    await ctx.editMessageText(
      `Список администраторов` +
        '\n' +
        'Выберете администратора:' +
        '\n' +
        adminsMas.map((admin) => admin[0]).join('\n'),
      markup,
    );
  }

  @Action(/selectAdmin/)
  async selectAdmin(@Ctx() ctx: SceneContext) {
    const userId = telegramDataHelper(ctx.callbackQuery['data'], '__');
    const user = await this.userService.findById(userId);
    const ownProfile = await this.userService.findByTgId(
      ctx.callbackQuery.from.id,
    );
    const userText = `Администратор
<b>Логин пользователя</b>: ${user.first_name}
<b>Профиль пользователя</b>: @${user.username}
<b>ID пользователя</b>: ${user.tg_id}`;
    const isSuperAdmin = ownProfile.role.includes(UserRoleEnum.SUPER_ADMIN);
    const showRestrictButton = isSuperAdmin && user.tg_id !== ownProfile.tg_id;
    await ctx.editMessageText(userText, {
      reply_markup: {
        inline_keyboard: [
          [Markup.button.callback('Назад', 'adminList')],
          showRestrictButton
            ? [
                Markup.button.callback(
                  'Разжаловать',
                  `requestRestrictAdmin__${user.id}`,
                ),
              ]
            : [],
        ],
      },
      parse_mode: 'HTML',
    });
  }

  @Action(/requestRestrictPartner/)
  async requestRestrictPartner(@Ctx() ctx: SceneContext) {
    const userId = telegramDataHelper(ctx.callbackQuery['data'], '__');
    const markup = Markup.inlineKeyboard([
      [Markup.button.callback('Подтвердить', `restrictPartner__${userId}`)],
      [Markup.button.callback('Назад', `selectPartner__${userId}`)],
    ]);
    const oldText = ctx.callbackQuery.message['text'];
    await ctx.editMessageText(
      oldText + '\n\n' + 'Вы действительно хотите разжаловать партнера?',
      markup,
    );
  }

  @Action(/requestRestrictAdmin/)
  async requestRestrictAdmin(@Ctx() ctx: SceneContext) {
    const userId = telegramDataHelper(ctx.callbackQuery['data'], '__');
    const markup = Markup.inlineKeyboard([
      [Markup.button.callback('Подтвердить', `restrictAdmin__${userId}`)],
      [Markup.button.callback('Назад', `selectAdmin__${userId}`)],
    ]);
    const oldText = ctx.callbackQuery.message['text'];
    await ctx.editMessageText(
      oldText + '\n\n' + 'Вы действительно хотите разжаловать администратора?',
      markup,
    );
  }

  @Action(/restrictAdmin/)
  async restrictAdmin(@Ctx() ctx: SceneContext) {
    const userId = telegramDataHelper(ctx.callbackQuery['data'], '__');
    const markup = Markup.inlineKeyboard([
      [Markup.button.callback('Список Администраторов', `adminList`)],
    ]);
    try {
      await this.userService.restrictUser(userId, UserRoleEnum.ADMIN);
      await ctx.editMessageText(`Пользователь был ограничен в правах`, markup);
    } catch (error) {
      await ctx.editMessageText(
        `Что-то пошло не так. Попробуйте снова или обратитесь за помощью`,
        markup,
      );
    }
  }

  @Action(/restrictPartner/)
  async restrictPartner(@Ctx() ctx: SceneContext) {
    const userId = telegramDataHelper(ctx.callbackQuery['data'], '__');
    const markup = Markup.inlineKeyboard([
      [Markup.button.callback('Список Партнеров', `partnerList`)],
    ]);
    try {
      await this.userService.restrictUser(userId, UserRoleEnum.PARTNER);
      await ctx.editMessageText(`Пользователь был ограничен в правах`, markup);
    } catch (error) {
      await ctx.editMessageText(
        `Что-то пошло не так. Попробуйте снова или обратитесь за помощью`,
        markup,
      );
    }
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
    const adminTickets = [];
    tickets.map((ticket, i) => {
      adminTickets.push([
        `${i + 1}. @${ticket.user.username} ${ticket.user.first_name}`,
        ticket.id,
      ]);
    });

    const lines = buttonSplitterHelper(
      adminTickets.map((ticket) => ticket[1]),
      8,
    );

    const actionButtons = lines.map((line, lineId) => {
      return line.map((button, i) => {
        return Markup.button.callback(
          `${i + 1 + lineId * lines[0].length}`,
          `selectTicket__${button}`,
        );
      });
    });

    const markup = Markup.inlineKeyboard([
      ...actionButtons,
      [Markup.button.callback('Назад', 'admin')],
    ]);

    await ctx.editMessageText(
      `Список заявок` +
        '\n\n' +
        'Выберите заявку:' +
        '\n' +
        adminTickets.map((admin) => admin[0]).join('\n'),
      markup,
    );
  }

  @Action(/selectPartTicket/)
  async selectPartnerTicket(@Ctx() ctx: SceneContext) {
    const ticketId = telegramDataHelper(ctx.callbackQuery['data'], '__');
    const ticket = await this.rightsChangeService.findTicketById(ticketId);

    const markup = [
      [
        Markup.button.callback('Принять', `acceptPartner__${ticket.id}`),
        Markup.button.callback('Отклонить', `rejectPartner__${ticket.id}`),
      ],
      [Markup.button.callback('Назад', `partnerTicket`)],
    ];
    const userText = `Заявка на должность
<b>Название должности</b>: Партнер
<b>Логин пользователя</b>: ${ticket.user.first_name}
<b>Профиль пользователя</b>: @${ticket.user.username}
<b>ID пользователя</b>: ${ticket.user.tg_id}`;

    await ctx.editMessageText(userText, {
      reply_markup: {
        inline_keyboard: markup,
      },
      parse_mode: 'HTML',
    });
  }

  @Action(/selectTicket/)
  async selectTicket(@Ctx() ctx: SceneContext) {
    const ticketId = telegramDataHelper(ctx.callbackQuery['data'], '__');
    const ticket = await this.rightsChangeService.findTicketById(ticketId);

    const markup = [
      [
        Markup.button.callback('Принять', `acceptAdmin__${ticket.id}`),
        Markup.button.callback('Отклонить', `rejectAdmin__${ticket.id}`),
      ],
      [Markup.button.callback('Назад', `adminTicket`)],
    ];

    const userText = `Заявка на должность
<b>Название должности</b>: Администратор
<b>Логин пользователя</b>: ${ticket.user.first_name}
<b>Профиль пользователя</b>: @${ticket.user.username}
<b>ID пользователя</b>: ${ticket.user.tg_id}`;

    await ctx.editMessageText(userText, {
      reply_markup: {
        inline_keyboard: markup,
      },
      parse_mode: 'HTML',
    });
  }

  @Action(/acceptPartner/)
  async acceptPartner(@Ctx() ctx: SceneContext) {
    const id = telegramDataHelper(ctx.callbackQuery['data'], '__');
    const ticket = await this.rightsChangeService.updateStatus(
      id,
      TicketStatus.RESOLVE,
    );
    const user = await this.userService.promoteUser(
      ticket.user.tg_id,
      UserRoleEnum.PARTNER,
    );
    await this.botService.sendMessage(
      user.tg_id,
      'Вы были повышены до статуса партнера.\nиспользуйте команду: /start чтобы открыть новое меню',
    );

    const markup = Markup.inlineKeyboard([
      [Markup.button.callback('Назад', `partnerTicket`)],
    ]);
    await ctx.editMessageText(
      ctx.callbackQuery.message['text'] +
        '\n' +
        'Эта заявка была принята вами ✅',
      markup,
    );
  }

  @Action(/acceptAdmin/)
  async acceptAdmin(@Ctx() ctx: SceneContext) {
    const id = telegramDataHelper(ctx.callbackQuery['data'], '__');
    const ticket = await this.rightsChangeService.updateStatus(
      id,
      TicketStatus.RESOLVE,
    );
    const user = await this.userService.promoteUser(
      ticket.user.tg_id,
      UserRoleEnum.ADMIN,
    );
    await this.botService.sendMessage(
      user.tg_id,
      'Вы были повышены до статуса администратора',
    );

    const markup = Markup.inlineKeyboard([
      [Markup.button.callback('Назад', `adminTicket`)],
    ]);
    await ctx.editMessageText(
      ctx.callbackQuery.message['text'] +
        '\n' +
        'Эта заявка была принята вами ✅',
      markup,
    );
  }

  @Action(/rejectPartner/)
  async rejectPartner(@Ctx() ctx: SceneContext) {
    const id = telegramDataHelper(ctx.callbackQuery['data'], '__');
    const ticket = await this.rightsChangeService.updateStatus(
      id,
      TicketStatus.REJECT,
    );
    await this.botService.sendMessage(
      ticket.user.tg_id,
      'Администратор отклонил вашу заявку на роль партнера',
    );
    const markup = Markup.inlineKeyboard([
      [Markup.button.callback('Назад', `partnerTicket`)],
    ]);
    await ctx.editMessageText(
      ctx.callbackQuery.message['text'] + '\n' + 'Эта заявка была отменена ⛔',
      markup,
    );
  }

  @Action(/rejectAdmin/)
  async rejectAdmin(@Ctx() ctx: SceneContext) {
    const id = telegramDataHelper(ctx.callbackQuery['data'], '__');
    const ticket = await this.rightsChangeService.updateStatus(
      id,
      TicketStatus.REJECT,
    );
    await this.botService.sendMessage(
      ticket.user.tg_id,
      'Администратор отклонил вашу заявку на роль администратора',
    );
    const markup = Markup.inlineKeyboard([
      [Markup.button.callback('Назад', `adminTicket`)],
    ]);
    await ctx.editMessageText(
      ctx.callbackQuery.message['text'] + '\n' + 'Эта заявка была отменена ⛔',
      markup,
    );
  }
}
