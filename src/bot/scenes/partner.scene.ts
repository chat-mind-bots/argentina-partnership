import { Action, Ctx, Message, Scene, SceneEnter } from 'nestjs-telegraf';
import { forwardRef, Inject, UseFilters } from '@nestjs/common';
import { TelegrafExceptionFilter } from 'src/common/filtres/telegraf-exeption.filter';
import { Context, Markup } from 'telegraf';
import { SceneContext } from 'telegraf/typings/scenes';
import { MessageMode } from 'src/bot/enums/message-mode.enum';
import { BotService } from 'src/bot/bot.service';
import { UserService } from 'src/user/user.service';
import { WebAppRoutes } from 'src/bot/interfaces/webAppRoutes';
import { BusinessService } from 'src/business/business.service';
import { buttonSplitterHelper } from 'src/common/helpers/button-splitter.helper';

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
  ) {}
  @SceneEnter()
  async enter(@Ctx() ctx: Context & SceneContext) {
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
      [Markup.button.callback('Добавить бизнес', 'addBusiness')],
      [Markup.button.callback('Проверка кода пользоватлея', 'checkCode')],
    ]);

    if (mode === MessageMode.REPLY) {
      await ctx.reply('Можешь выбрать интересующие тебя функции', markup);
      return;
    }

    await ctx.editMessageText(
      'Можешь выбрать интересующие тебя функции',
      markup,
    );
  }

  @Action('businessList')
  async businessList(@Ctx() ctx: SceneContext) {
    const user = await this.userService.findByTgId(ctx.callbackQuery.from.id);
    const businesses = await this.businessService.findAllBusinessesByOwnerId(
      user.id,
    );
    if (!businesses.length) {
      await ctx.editMessageText(
        'Пока что вы не добавили ни одного бизнеса',
        Markup.inlineKeyboard([
          Markup.button.callback('Назад', 'menu'),
          Markup.button.callback('Добавить категорию', 'addBusiness'),
        ]),
      );
      return;
    }
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
      ...actionButtons,
      [Markup.button.callback('Назад', 'category')],
    ]);
    await ctx.editMessageText(
      `Список бизнесов` +
        '\n' +
        'Выберете бизнес:' +
        '\n' +
        categoriesMas.map((business) => business[0]).join('\n'),
      markup,
    );
  }

  @Action('addBusiness')
  async addBusiness(@Ctx() ctx: SceneContext) {
    await this.botService.sendMessageWithWebApp(
      ctx.callbackQuery.from.id,
      WebAppRoutes.ADD_BUSINESS,
      'Добавить бизнес',
      'Добавить бизнес',
    );
  }

  @Action('checkCode')
  async checkCode(@Ctx() ctx: SceneContext) {
    await this.botService.sendMessageWithWebApp(
      ctx.callbackQuery.from.id,
      WebAppRoutes.ADD_BUSINESS,
      'Добавить бизнес',
      'Добавить бизнес',
    );
  }
}
