import { Action, Ctx, Message, Wizard, WizardStep } from 'nestjs-telegraf';
import { Update } from 'telegraf/typings/core/types/typegram';
import { forwardRef, Inject, UseFilters } from '@nestjs/common';
import { CategoriesService } from 'src/categories/categories.service';
import { UserService } from 'src/user/user.service';
import { WizardContext } from 'telegraf/typings/scenes';
import { Context, Markup } from 'telegraf';
import { TelegrafExceptionFilter } from 'src/common/filtres/telegraf-exeption.filter';
import { isCommandString } from 'src/common/helpers/string.helper';
import { KeyboardMessageEnum } from 'src/bot/enums/keyboard-message.enum';
import { valueInEnum } from 'src/common/helpers/enum-value.helper';
import { BotService } from 'src/bot/bot.service';

@Wizard('addCategory')
@UseFilters(TelegrafExceptionFilter)
export class AddCategoryScene {
  constructor(
    @Inject(forwardRef(() => CategoriesService))
    private readonly categoriesService: CategoriesService,
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
    @Inject(forwardRef(() => BotService))
    private readonly botService: BotService,
  ) {}
  @WizardStep(0)
  async step0(
    @Message('text') msg: string,
    @Ctx()
    ctx: Context & WizardContext,
  ) {
    ctx.wizard.state['data'] = {};
    try {
      await ctx.editMessageText('Введите название категории');
    } catch (error) {
      await ctx.reply('Введите название категории');
    }
    ctx.wizard.next();
  }
  @WizardStep(1)
  async step1(
    @Message('text') msg: string,
    @Ctx()
    ctx: Context & WizardContext & { update: Update.CallbackQueryUpdate },
    @Message('from') from,
  ) {
    ctx.wizard.state['data'] = { ...ctx.wizard.state['data'], title: msg };
    const isAllowedMessage =
      !valueInEnum(msg, KeyboardMessageEnum) && !isCommandString(msg);

    await this.commandAction(ctx, from, msg);

    if (!isAllowedMessage) {
      await ctx.reply('Попробуйте еще раз.');
    }
    if (isAllowedMessage) {
      await ctx.reply('Введите описание категории');
      ctx.wizard.next();
    }
  }

  @WizardStep(2)
  async step2(
    @Message('text') msg: string,
    @Message('from') from,
    @Message('chat') chat,
    @Ctx()
    ctx: Context & WizardContext & { update: Update.CallbackQueryUpdate },
  ) {
    ctx.wizard.state['data'] = {
      ...ctx.wizard.state['data'],
      description: msg,
    };

    await this.commandAction(ctx, from, msg);

    const isAllowedMessage =
      !isCommandString(msg) && !valueInEnum(msg, KeyboardMessageEnum);

    const markup = Markup.inlineKeyboard([
      [Markup.button.callback('Сохранить', 'saveCategory')],
      [Markup.button.callback('Начать заново', 'reenter')],
      [Markup.button.callback('Отменить', 'category')],
    ]);
    if (!isAllowedMessage) {
      await ctx.reply('Попробуйте еще раз.');
    }

    if (isAllowedMessage) {
      await ctx.reply(
        `Ваша категория:\n${ctx.wizard.state['data'].title}\n${ctx.wizard.state['data'].description}`,
        markup,
      );
      ctx.wizard.next();
    }
  }

  @WizardStep(3)
  async step3(
    @Ctx()
    ctx: Context & WizardContext & { update: Update.CallbackQueryUpdate },
    @Message('text') msg: string,
    @Message('from') from,
  ) {
    await this.commandAction(ctx, from, msg);

    const markup = Markup.inlineKeyboard([
      [Markup.button.callback('Категории', 'category')],
      [Markup.button.callback('Добавить категорию', 'reenter')],
    ]);
    const cbQuery = ctx?.update.callback_query;
    if (cbQuery) {
      const userAnswer = 'data' in cbQuery ? cbQuery.data : null;
      if (userAnswer === 'category') {
        await ctx.scene.enter('adminScene');
        return;
      }
      if (userAnswer === 'reenter') {
        await ctx.scene.reenter();
        return;
      }
    }
    try {
      const category = await this.categoriesService.createCategory({
        title: ctx.wizard.state['data'].title,
        description: ctx.wizard.state['data'].description,
      });
      await ctx.editMessageText(
        `Ваша категория была успешно сохранена`,
        markup,
      );
    } catch (error) {
      await ctx.editMessageText(
        `Категория с таким названием уже создана`,
        markup,
      );
    }
    ctx.wizard.next();
  }

  async commandAction(
    ctx: Context & WizardContext & { update: Update.CallbackQueryUpdate },
    @Message('from') from,
    msg: string,
  ) {
    if (msg) {
      if (isCommandString(msg)) {
        if (msg === '/menu') {
          await ctx.scene.leave();
          await ctx.scene.enter('adminScene');
          return;
        }
        if (msg === '/start') {
          await ctx.scene.leave();
          await this.botService.menu(ctx, from);
          return;
        }
        if (msg === '/change_role') {
          await ctx.scene.leave();
          await this.botService.menu(ctx, from);
          return;
        }
        if (msg === '/help') {
          await ctx.scene.leave();
          await this.botService.helpCommand(ctx);
          return;
        }
      }
    }
  }

  @WizardStep(4)
  async step4(
    @Ctx()
    ctx: Context & WizardContext & { update: Update.CallbackQueryUpdate },
    @Message('text') msg: string,
    @Message('from') from,
  ) {
    await this.commandAction(ctx, from, msg);

    const cbQuery = ctx?.update.callback_query;
    if (cbQuery) {
      const userAnswer = 'data' in cbQuery ? cbQuery.data : null;
      if (userAnswer === 'reenter') {
        await ctx.scene.reenter();
        return;
      }
      await ctx.scene.enter('adminScene');
    }
  }

  @Action('leave')
  async leaveScene(@Ctx() ctx: Context & WizardContext) {
    await ctx.scene.enter('adminScene');
  }

  // @Action('reenter')
  // async reenterScene(
  //   @Ctx() ctx: Context & WizardContext,
  //   @Message('text') msg: string,
  // ) {
  //   ctx.wizard.selectStep(0);
  // }

  // @On('text')
  // async text(
  //   @Ctx() ctx: Context & WizardContext,
  //   @Message('text') msg: string,
  // ) {
  //   if (isCommandString(msg)) {
  //     await ctx.reply('Сейчас вы не можете использовать данную команду.');
  //   }
  // }
}
