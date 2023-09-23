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
import * as process from 'process';
import { LIMITDOCUMENTS } from 'src/bot/constants/limit-documents';
import { createPaginationTGButtons } from 'src/common/helpers/button-pagination';
import { BusinessService } from 'src/business/business.service';

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
    @Inject(forwardRef(() => BusinessService))
    private readonly businessService: BusinessService,
  ) {}

  @SceneEnter()
  async enter(@Ctx() ctx: Context & SceneContext) {
    try {
      if (ctx.callbackQuery['data'] === 'category') {
        await this.category(ctx);
        return;
      }
      if (ctx.session['fromScene']) {
        delete ctx.session['fromScene'];
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
      [Markup.button.callback('Заявки на пополнение баланса', 'topUp')],
      [Markup.button.callback('Администраторы', 'admin')],
      [Markup.button.callback('Партнеры', 'partner')],
    ]);

    if (mode === MessageMode.REPLY) {
      await ctx.reply('Можешь выбрать интересующие тебя функции', markup);
    }
    if (mode === MessageMode.EDIT) {
      await ctx.editMessageText(
        'Можете выбрать интересующие вас функции',
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
        Markup.button.callback('🔙 Назад', 'callMenu'),
      ],
    ]);
    await ctx.editMessageText(
      'Можете выбрать интересующие вас функции',
      markup,
    );
  }

  @Action('categoryList')
  async categoryList(@Ctx() ctx: SceneContext, currentPage = 1) {
    const { data: categories, total } =
      await this.categoriesService.findAllCategoriesWithTotal({
        limit: LIMITDOCUMENTS,
        offset: (currentPage - 1) * LIMITDOCUMENTS,
      });

    const maxPage =
      Math.ceil(total / LIMITDOCUMENTS) > 0
        ? Math.ceil(total / LIMITDOCUMENTS)
        : 1;

    const pages = {
      first: 1,
      prev: currentPage - 1 < 1 ? 1 : currentPage - 1,
      next: currentPage + 1 > maxPage ? maxPage : currentPage + 1,
      last: maxPage,
    };

    if (!categories.length) {
      await ctx.editMessageText(
        'Пока что вы не добавили ни одну категорию',
        Markup.inlineKeyboard([
          Markup.button.callback('🔙 Назад', 'category'),
          Markup.button.callback('Добавить категорию', 'addCategory'),
        ]),
      );
      return;
    }

    ctx.session['categoriesPagination'] = { ...pages, currentPage };

    const paginationButtonsArray = createPaginationTGButtons(
      currentPage,
      pages,
      'categorySelectPage__',
      Markup.button.callback,
    );
    //

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
      [Markup.button.callback('🔙 Назад', 'category')],
      ...actionButtons,
      paginationButtonsArray,
    ]);
    await ctx.editMessageText(
      `Список категорий` +
        '\n' +
        `Страница: ${currentPage}/${maxPage} 📖` +
        '\n' +
        'Выберете категорию:' +
        '\n' +
        categoriesMas.map((category) => category[0]).join('\n'),
      markup,
    );
  }

  @Action(/categorySelectPage/)
  async selectCategoryPage(@Ctx() ctx: SceneContext) {
    const categoryPageType = telegramDataHelper(
      ctx.callbackQuery['data'],
      '__',
    );
    const page = ctx.session['categoriesPagination'][categoryPageType];
    if (page) {
      await this.categoryList(ctx, page);
    }
  }

  @Action(/selectCategory/)
  async selectCategory(@Ctx() ctx: SceneContext) {
    const categoryId = telegramDataHelper(ctx.callbackQuery['data'], '__');
    const category = await this.categoriesService.findById(categoryId);
    const markup = Markup.inlineKeyboard([
      [
        Markup.button.callback(
          'Изменить категорию',
          `editCategory__${categoryId}`,
        ),
      ],
      [
        Markup.button.callback(
          'Удалить категорию',
          `deleteCategory__${categoryId}`,
        ),
      ],
      [Markup.button.callback('🔙 Назад', 'categorySelectPage__currentPage')],
    ]);

    await ctx.editMessageText(
      `Категория:` + '\n' + `${category.title}\n${category.description}`,
      markup,
    );
  }

  @Action(/editCategory/)
  async editCategory(@Ctx() ctx: SceneContext) {
    const categoryId = telegramDataHelper(ctx.callbackQuery['data'], '__');
    const { title, description, id } = await this.categoriesService.findById(
      categoryId,
    );
    const markup = Markup.inlineKeyboard([
      [
        Markup.button.callback('Изменить название', `changeCategoryTitle`),
        Markup.button.callback('Изменить описание', `editCD`),
      ],
      [Markup.button.callback('🔙 Назад', `selectCategory${id}`)],
    ]);
    await ctx.editMessageText(
      `Категория:` + '\n' + `${title}\n${description}`,
      markup,
    );
    ctx.session['data'] = { title, description, id };
  }

  @Action('changeCategoryTitle')
  async editCategoryTitle(@Ctx() ctx: SceneContext) {
    await ctx.scene.enter('editCategoryTitleScene');
  }

  @Action(/editCD/)
  async editCategoryDescription(@Ctx() ctx: SceneContext) {
    await ctx.scene.enter('editCDScene');
  }

  @Action(/deleteCategory/)
  async deleteCategory(@Ctx() ctx: SceneContext) {
    const categoryId = telegramDataHelper(ctx.callbackQuery['data'], '__');
    const markup = Markup.inlineKeyboard([
      [Markup.button.callback('🔙 Назад', 'categoryList')],
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
    //   [Markup.button.callback('🔙 Назад', 'category')],
    //   [Markup.button.callback('🔙 Назад', 'category')],
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
      [Markup.button.callback('🔙 Назад', 'callMenu')],
    ]);
    await ctx.editMessageText(
      'Можете выбрать интересующие вас функции',
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
      [Markup.button.callback('🔙 Назад', 'callMenu')],
    ]);
    await ctx.editMessageText(
      'Можете выбрать интересующие вас функции',
      markup,
    );
  }

  @Action('partnerList')
  async partnerList(@Ctx() ctx: SceneContext, currentPage = 1) {
    const { data: partners, total } = await this.userService.findAllByRole({
      role: UserRoleEnum.PARTNER,
      limit: LIMITDOCUMENTS,
      offset: (currentPage - 1) * LIMITDOCUMENTS,
    });

    const maxPage =
      Math.ceil(total / LIMITDOCUMENTS) > 0
        ? Math.ceil(total / LIMITDOCUMENTS)
        : 1;

    const pages = {
      first: 1,
      prev: currentPage - 1 < 1 ? 1 : currentPage - 1,
      next: currentPage + 1 > maxPage ? maxPage : currentPage + 1,
      last: maxPage,
    };

    ctx.session['partnerListPagination'] = { ...pages, currentPage };

    const paginationButtonsArray = createPaginationTGButtons(
      currentPage,
      pages,
      'partnerListSelectPage__',
      Markup.button.callback,
    );

    if (!partners) {
      const markup = Markup.inlineKeyboard([
        [Markup.button.callback('🔙 Назад', 'partner')],
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
      [Markup.button.callback('🔙 Назад', 'partner')],
      ...actionButtons,
      paginationButtonsArray,
    ]);
    await ctx.editMessageText(
      `Список партнеров` +
        '\n' +
        `Страница: ${currentPage}/${maxPage} 📖` +
        '\n' +
        'Выберете партнера:' +
        '\n' +
        partnersMas.map((partner) => partner[0]).join('\n'),
      markup,
    );
  }

  @Action(/partnerListSelectPage/)
  async partnerListSelectPage(@Ctx() ctx: SceneContext) {
    const adminListPageType = telegramDataHelper(
      ctx.callbackQuery['data'],
      '__',
    );
    const page = ctx.session['partnerListPagination'][adminListPageType];
    if (page) {
      await this.adminList(ctx, page);
    }
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
          [
            Markup.button.callback(
              '🔙 Назад',
              'partnerListSelectPage__currentPage',
            ),
          ],
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
  async partnerTicket(@Ctx() ctx: SceneContext, currentPage = 1) {
    const { data: tickets, total } =
      await this.rightsChangeService.findTicketsByStatus({
        status: TicketStatus.PENDING,
        role: UserRoleEnum.PARTNER,
        limit: LIMITDOCUMENTS,
        offset: (currentPage - 1) * LIMITDOCUMENTS,
      });

    const maxPage =
      Math.ceil(total / LIMITDOCUMENTS) > 0
        ? Math.ceil(total / LIMITDOCUMENTS)
        : 1;

    const pages = {
      first: 1,
      prev: currentPage - 1 < 1 ? 1 : currentPage - 1,
      next: currentPage + 1 > maxPage ? maxPage : currentPage + 1,
      last: maxPage,
    };

    ctx.session['partnerTicketPagination'] = { ...pages, currentPage };

    const paginationButtonsArray = createPaginationTGButtons(
      currentPage,
      pages,
      'partnerTicketSelectPage__',
      Markup.button.callback,
    );

    if (!tickets.length) {
      const markup = Markup.inlineKeyboard([
        Markup.button.callback('🔙 Назад', 'partner'),
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
      [Markup.button.callback('🔙 Назад', 'partner')],
      ...actionButtons,
      paginationButtonsArray,
    ]);

    await ctx.editMessageText(
      `Список заявок` +
        '\n' +
        `Страница: ${currentPage}/${maxPage} 📖` +
        '\n' +
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
  async adminList(@Ctx() ctx: SceneContext, currentPage = 1) {
    //

    const { data: admins, total } = await this.userService.findAllByRole({
      role: UserRoleEnum.ADMIN,
      limit: LIMITDOCUMENTS,
      offset: (currentPage - 1) * LIMITDOCUMENTS,
    });

    const maxPage =
      Math.ceil(total / LIMITDOCUMENTS) > 0
        ? Math.ceil(total / LIMITDOCUMENTS)
        : 1;

    const pages = {
      first: 1,
      prev: currentPage - 1 < 1 ? 1 : currentPage - 1,
      next: currentPage + 1 > maxPage ? maxPage : currentPage + 1,
      last: maxPage,
    };

    ctx.session['adminListPagination'] = { ...pages, currentPage };

    const paginationButtonsArray = createPaginationTGButtons(
      currentPage,
      pages,
      'adminListSelectPage__',
      Markup.button.callback,
    );

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
      [Markup.button.callback('🔙 Назад', 'admin')],
      ...actionButtons,
      paginationButtonsArray,
    ]);
    await ctx.editMessageText(
      `Список администраторов` +
        '\n' +
        `Страница: ${currentPage}/${maxPage} 📖` +
        '\n' +
        'Выберете администратора:' +
        '\n' +
        adminsMas.map((admin) => admin[0]).join('\n'),
      markup,
    );
  }

  @Action(/adminListSelectPage/)
  async adminListSelectPage(@Ctx() ctx: SceneContext) {
    const adminListPageType = telegramDataHelper(
      ctx.callbackQuery['data'],
      '__',
    );
    const page = ctx.session['adminListPagination'][adminListPageType];
    if (page) {
      await this.adminList(ctx, page);
    }
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
          [
            Markup.button.callback(
              '🔙 Назад',
              'adminListSelectPage__currentPage',
            ),
          ],
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
      [Markup.button.callback('🔙 Назад', `selectPartner__${userId}`)],
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
      [Markup.button.callback('🔙 Назад', `selectAdmin__${userId}`)],
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
      const user = await this.userService.restrictUser(
        userId,
        UserRoleEnum.PARTNER,
      );
      await this.businessService.disableAllOwnerBusinesses(user.id);
      await ctx.editMessageText(`Пользователь был ограничен в правах`, markup);
    } catch (error) {
      await ctx.editMessageText(
        `Что-то пошло не так. Попробуйте снова или обратитесь за помощью`,
        markup,
      );
    }
  }

  @Action('adminTicket')
  async adminTicket(@Ctx() ctx: SceneContext, currentPage = 1) {
    const { data: tickets, total } =
      await this.rightsChangeService.findTicketsByStatus({
        status: TicketStatus.PENDING,
        role: UserRoleEnum.ADMIN,
        limit: LIMITDOCUMENTS,
        offset: (currentPage - 1) * LIMITDOCUMENTS,
      });

    const maxPage =
      Math.ceil(total / LIMITDOCUMENTS) > 0
        ? Math.ceil(total / LIMITDOCUMENTS)
        : 1;

    const pages = {
      first: 1,
      prev: currentPage - 1 < 1 ? 1 : currentPage - 1,
      next: currentPage + 1 > maxPage ? maxPage : currentPage + 1,
      last: maxPage,
    };

    ctx.session['adminTicketPagination'] = { ...pages, currentPage };

    const paginationButtonsArray = createPaginationTGButtons(
      currentPage,
      pages,
      'adminTicketSelectPage__',
      Markup.button.callback,
    );

    if (!tickets.length) {
      const markup = Markup.inlineKeyboard([
        Markup.button.callback('🔙 Назад', 'admin'),
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
      [Markup.button.callback('🔙 Назад', 'admin')],
      ...actionButtons,
      paginationButtonsArray,
    ]);

    await ctx.editMessageText(
      `Список заявок` +
        '\n' +
        `Страница: ${currentPage}/${maxPage} 📖` +
        '\n' +
        'Выберите заявку:' +
        '\n' +
        adminTickets.map((admin) => admin[0]).join('\n'),
      markup,
    );
  }

  @Action(/partnerTicketSelectPage/)
  async partnerTicketSelectPage(@Ctx() ctx: SceneContext) {
    const partnerTicketSelectPageType = telegramDataHelper(
      ctx.callbackQuery['data'],
      '__',
    );
    const page =
      ctx.session['partnerTicketPagination'][partnerTicketSelectPageType];
    if (page) {
      await this.partnerTicket(ctx, page);
    }
  }

  @Action(/adminTicketSelectPage/)
  async adminTicketSelectPage(@Ctx() ctx: SceneContext) {
    const adminTicketSelectPageType = telegramDataHelper(
      ctx.callbackQuery['data'],
      '__',
    );
    const page =
      ctx.session['adminTicketPagination'][adminTicketSelectPageType];
    if (page) {
      await this.adminTicket(ctx, page);
    }
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
      [
        Markup.button.callback(
          '🔙 Назад',
          'partnerTicketSelectPage__currentPage',
        ),
      ],
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
      [
        Markup.button.callback(
          '🔙 Назад',
          'adminTicketSelectPage__currentPage',
        ),
      ],
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
    await this.businessService.enableAllOwnerBusinesses(user.id);
    await this.botService.sendMessage(
      user.tg_id,
      'Вы были повышены до статуса партнера.\nиспользуйте команду: /start чтобы открыть новое меню',
    );

    const markup = Markup.inlineKeyboard([
      [Markup.button.callback('🔙 Назад', `partnerTicket`)],
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
      [Markup.button.callback('🔙 Назад', `adminTicket`)],
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
      [Markup.button.callback('🔙 Назад', `partnerTicket`)],
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
      [Markup.button.callback('🔙 Назад', `adminTicket`)],
    ]);
    await ctx.editMessageText(
      ctx.callbackQuery.message['text'] + '\n' + 'Эта заявка была отменена ⛔',
      markup,
    );
  }

  @Action('topUp')
  async topUp(@Ctx() ctx: SceneContext, currentPage = 1) {
    const { data, total } = await this.botService.getPaymentsForAdmin(
      LIMITDOCUMENTS,
      (currentPage - 1) * LIMITDOCUMENTS,
    );
    const maxPage =
      Math.ceil(total / LIMITDOCUMENTS) > 0
        ? Math.ceil(total / LIMITDOCUMENTS)
        : 1;

    const pages = {
      first: 1,
      prev: currentPage - 1 < 1 ? 1 : currentPage - 1,
      next: currentPage + 1 > maxPage ? maxPage : currentPage + 1,
      last: maxPage,
    };

    ctx.session['topUpPagination'] = { ...pages, currentPage };
    const paginationButtonsArray = createPaginationTGButtons(
      currentPage,
      pages,
      'topUpSelectPage__',
      Markup.button.callback,
    );

    const payments = data.reduce(
      (acc, payment, index) => [
        ...acc,
        {
          id: payment._id,
          index: index + 1,
          tittle: `${index + 1}. @${payment.user?.username}: ${
            payment.amount
          } ${payment.currency}`,
        },
      ],
      [],
    );

    if (!payments.length) {
      const markup = Markup.inlineKeyboard([
        Markup.button.callback('🔙 Назад', 'callMenu'),
      ]);
      await ctx.editMessageText('Сейчас заявок нет', markup);
      return;
    }

    const actions = buttonSplitterHelper(payments, 8).map((row) =>
      row.map((element) =>
        Markup.button.callback(`${element.index}`, `payment__${element.id}`),
      ),
    );

    const markup = Markup.inlineKeyboard([
      [Markup.button.callback('🔙 Назад', 'callMenu')],
      ...actions,
      paginationButtonsArray,
    ]);
    await ctx.editMessageText(
      `Выберите заявку\nСтраница: ${currentPage}/${maxPage} 📖\n${payments.reduce(
        (acc, element) => `${acc}${element.tittle}`,
        '',
      )}`,
      markup,
    );
  }

  @Action(/topUpSelectPage/)
  async topUpSelectPage(@Ctx() ctx: SceneContext) {
    const topUpSelectPageType = telegramDataHelper(
      ctx.callbackQuery['data'],
      '__',
    );
    const page = ctx.session['topUpPagination'][topUpSelectPageType];
    if (page) {
      await this.topUp(ctx, page);
    }
  }

  @Action(/payment/)
  async payment(@Ctx() ctx: SceneContext) {
    const id = telegramDataHelper(ctx.callbackQuery['data'], '__');
    const payment = await this.botService.getPayment(id);

    const markup = Markup.inlineKeyboard([
      [Markup.button.callback('Подвердить платеж', `topUpAccess__${id}`)],
      [Markup.button.callback('Отклонить платеж', `topUpDecline__${id}`)],
      [Markup.button.callback('🔙 Назад', 'topUpSelectPage__currentPage')],
    ]);

    if (payment.data?.photo) {
      payment.data.photo = await this.botService.getPhoto(payment.data?.photo);
    }
    await ctx.editMessageText(
      `
      Пополнение на ${payment.amount} ${payment.currency}
      Сеть: ${payment.method}
      Пользователь: @${payment.user.username}
      Текущий баланс пользователя: ${payment.balance.amount}
      Доказательства оплаты: 
        TxId: ${
          payment.data?.txId ? `${payment.data?.txId}` : 'txId не приложен'
        }
        Скриншот: ${
          payment.data?.photo
            ? `https://${process.env.S3_DOMAIN}/${process.env.S3_IMAGE_BUCKET}/${payment.data?.photo.key}`
            : 'Фото не  приложено'
        }
        
    <b>Если вы подтвеждаете, что средства зачислны, то нажмите на кнопку «Подвердить платеж»</b>`,
      { ...markup, parse_mode: 'HTML' },
    );
  }

  @Action(/topUpAccess__/)
  async topUpAccess(@Ctx() ctx: SceneContext) {
    const id = telegramDataHelper(ctx.callbackQuery['data'], '__');

    const markup = Markup.inlineKeyboard([
      [Markup.button.callback('Да', `topUpAccessSure__${id}`)],
      [Markup.button.callback('🔙 Назад', `payment__${id}`)],
    ]);

    await ctx.editMessageText(
      'Вы уверены, что хотите <b>подвердить</b> платеж?',
      { ...markup, parse_mode: 'HTML' },
    );
  }

  @Action(/topUpDecline__/)
  async topUpDecline(@Ctx() ctx: SceneContext) {
    const id = telegramDataHelper(ctx.callbackQuery['data'], '__');

    const markup = Markup.inlineKeyboard([
      [Markup.button.callback('Да', `topUpDeclineSure__${id}`)],
      [Markup.button.callback('🔙 Назад', `payment__${id}`)],
    ]);

    await ctx.editMessageText(
      'Вы уверены, что хотите <b>отклонить</b> платеж?',
      { ...markup, parse_mode: 'HTML' },
    );
  }

  @Action(/topUpAccessSure__/)
  async topUpAccessSure(@Ctx() ctx: SceneContext) {
    const id = telegramDataHelper(ctx.callbackQuery['data'], '__');

    await this.botService.successPayment(id);

    const markup = Markup.inlineKeyboard([
      [Markup.button.callback('🔙 Назад', 'topUp')],
    ]);

    await ctx.editMessageText(
      'Платеж успешно подтвержден! Средства зачислены на баланс пользователя!',
      markup,
    );
  }

  @Action(/topUpDeclineSure__/)
  async topUpAccessDeclineSure(@Ctx() ctx: SceneContext) {
    const id = telegramDataHelper(ctx.callbackQuery['data'], '__');

    await this.botService.rejectPayment(id);

    const markup = Markup.inlineKeyboard([
      [Markup.button.callback('🔙 Назад', 'topUp')],
    ]);

    await ctx.editMessageText(
      'Запрос на пополнение был успешно отклонен!',
      markup,
    );
  }
}
