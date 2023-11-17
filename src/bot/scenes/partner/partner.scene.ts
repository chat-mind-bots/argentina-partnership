import { Action, Ctx, InjectBot, Scene, SceneEnter } from 'nestjs-telegraf';
import { forwardRef, Inject, UseFilters } from '@nestjs/common';
import { TelegrafExceptionFilter } from 'src/common/filtres/telegraf-exeption.filter';
import { Context, Markup, Telegraf } from 'telegraf';
import { SceneContext } from 'telegraf/typings/scenes';
import { MessageMode } from 'src/bot/enums/message-mode.enum';
import { BotService } from 'src/bot/bot.service';
import { UserService } from 'src/user/user.service';
import { WebAppRoutes } from 'src/bot/interfaces/webAppRoutes';
import { BusinessService } from 'src/business/business.service';
import { buttonSplitterHelper } from 'src/common/helpers/button-splitter.helper';
import { telegramDataHelper } from 'src/common/helpers/telegram-data.helper';
import { routeReplacer } from 'src/common/helpers/route.helper';
import { LIMITDOCUMENTS } from 'src/bot/constants/limit-documents';
import { createPaginationTGButtons } from 'src/common/helpers/button-pagination';

@Scene('partnerScene')
@UseFilters(TelegrafExceptionFilter)
export class PartnerScene {
  constructor(
    @Inject(forwardRef(() => BotService))
    private readonly botService: BotService,
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
    @Inject(forwardRef(() => BusinessService))
    private readonly businessService: BusinessService,
    @InjectBot('bot') private readonly bot: Telegraf<Context>,
  ) {}
  @SceneEnter()
  async enter(@Ctx() ctx: Context & SceneContext) {
    try {
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
    await ctx.reply('Вы вошли как партнер', keyboardMarkup);
    await this.menu(ctx, MessageMode.REPLY);
  }

  @Action('menu')
  async menu(@Ctx() ctx: Context & SceneContext, mode?: MessageMode) {
    const markup = Markup.inlineKeyboard([
      [Markup.button.callback('Мои бизнесы', 'businessList')],
      [
        this.botService.getMarkupWebApp(
          'Добавить бизнес',
          WebAppRoutes.BUSINESS_CREATE,
        ),
      ],
      [
        this.botService.getMarkupWebApp(
          'Проверка кода пользоватлея',
          WebAppRoutes.QR_CHECK,
        ),
      ],
    ]);

    if (mode === MessageMode.REPLY) {
      await ctx.reply('Можете выбрать интересующие вас функции', markup);
      return;
    }

    await ctx.editMessageText(
      'Можете выбрать интересующие вас функции',
      markup,
    );
  }

  @Action('businessList')
  async businessList(@Ctx() ctx: SceneContext, currentPage = 1) {
    const user = await this.userService.findByTgId(ctx.callbackQuery.from.id);
    const { data: businesses, total } =
      await this.businessService.findAllBusinessesByOwnerId(user._id, {
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

    if (!businesses.length) {
      await ctx.editMessageText(
        'Пока что вы не добавили ни одного бизнеса',
        Markup.inlineKeyboard([
          Markup.button.callback('🔙 Назад', 'menu'),
          this.botService.getMarkupWebApp(
            'Добавить бизнес',
            WebAppRoutes.BUSINESS_CREATE,
          ),
        ]),
      );
      return;
    }

    ctx.session['businessListPagination'] = { ...pages, currentPage };

    const paginationButtonsArray = createPaginationTGButtons(
      currentPage,
      pages,
      'businessListSelectPage__',
      Markup.button.callback,
    );

    const categoriesMas = [];
    businesses.map((business, i) => {
      categoriesMas.push([`${i + 1}. ${business.title}`, business.id]);
    });
    const lines = buttonSplitterHelper(
      categoriesMas.map((business) => business[1]),
      8,
    );
    const actionButtons = lines.map((line, lineId) => {
      return line.map((button, i) => {
        return Markup.button.callback(
          `${i + 1 + lineId * lines[0].length}`,
          `selectBusiness__${button}`,
        );
      });
    });
    const markup = Markup.inlineKeyboard([
      [Markup.button.callback('🔙 Назад', 'menu')],
      ...actionButtons,
      paginationButtonsArray,
    ]);
    await ctx.editMessageText(
      `Список бизнесов` +
        '\n' +
        `Страница: ${currentPage}/${maxPage} 📖` +
        '\n' +
        'Выберете бизнес:' +
        '\n' +
        categoriesMas.map((business) => business[0]).join('\n'),
      markup,
    );
  }

  @Action(/businessListSelectPage/)
  async businessListSelectPage(@Ctx() ctx: SceneContext) {
    const businessListPageType = telegramDataHelper(
      ctx.callbackQuery['data'],
      '__',
    );
    const page = ctx.session['businessListPagination'][businessListPageType];
    if (page) {
      await this.businessList(ctx, page);
    }
  }

  // @Action('mockData')
  // async mockData(@Ctx() ctx: SceneContext) {
  //   await this.businessService.create(
  //     '64ce9d402b43c943b2215f11',
  //     '64d3acf7ab4c5b7a49b0057d',
  //     {
  //       title: 'test',
  //       description: 'test',
  //       address: {
  //         isExist: false,
  //         comment: 'zxc',
  //         addressLine: 'text',
  //         googleMapsLink: 'asd',
  //       },
  //       contacts: [{ type: ContactsTypeEnum.TELEGRAM, value: 'asd' }],
  //       categoryName: 'название',
  //     },
  //   );
  // }

  @Action(/selectBusiness/)
  async selectBusiness(@Ctx() ctx: SceneContext) {
    const businessId = telegramDataHelper(ctx.callbackQuery['data'], '__');
    const business = await this.businessService.findBusinessById(businessId);
    const markup = Markup.inlineKeyboard([
      [
        this.botService.getMarkupWebApp(
          'Открыть в приложении',
          routeReplacer(WebAppRoutes.BUSINESS, [businessId]),
        ),
      ],
      [
        this.botService.getMarkupWebApp(
          'Редактировать бизнес',
          routeReplacer(WebAppRoutes.BUSINESS_UPDATE, [businessId]),
        ),
      ],
      [Markup.button.callback('♻ Обновить', `selectBusiness__${businessId}`)],
      [Markup.button.callback('🔙 Назад', 'businessList')],
    ]);
    await ctx.editMessageText(
      `<b>Ваш бизнес:</b>

<b>Название:</b> ${business.title}

<b>Описание:</b> ${business.description}

<b>Категория:</b> ${business.category.title}

<b>Контакты:</b> ${business.contacts.reduce(
        (acc, contact) => `${acc}${contact.type}: ${contact.value}
        `,
        `
        `,
      )}
<b>Адрес:</b> ${
        business.address.isExist
          ? `
    <b>Полный адрес:</b> ${business.address.addressLine}
    <b>Ссылка на google maps: </b> ${
      business.address.googleMapsLink ?? 'Не указано'
    }
    <b>Комментарий: </b> ${business.address.comment ?? 'Не указано'}`
          : 'Без адреса'
      }

<b>Средний чек:</b> ${'$'.repeat(business.avgCheck + 1)}

<b>Логотип:</b> ${
        business.preview
          ? `
    <b>Ссылка на логотип: </b> https://${business.preview.domain}/${business.preview.bucket}/${business.preview.key}`
          : 'Без логотипа'
      }
    `,
      { ...markup, parse_mode: 'HTML' },
    );
  }
}
