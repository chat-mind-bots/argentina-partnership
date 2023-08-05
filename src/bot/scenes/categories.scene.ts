import { Action, Ctx, Message, Wizard, WizardStep } from 'nestjs-telegraf';
import { forwardRef, Inject, UseFilters } from '@nestjs/common';
import { CategoriesService } from 'src/categories/categories.service';
import { UserService } from 'src/user/user.service';
import { WizardContext } from 'telegraf/typings/scenes';
import { Context, Markup } from 'telegraf';
import { TelegrafExceptionFilter } from 'src/common/filtres/telegraf-exeption.filter';

@Wizard('addCategory')
@UseFilters(TelegrafExceptionFilter)
export class AddCategoryScene {
  constructor(
    @Inject(forwardRef(() => CategoriesService))
    private readonly categoriesService: CategoriesService,
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
  ) {}
  @WizardStep(0)
  async step0(
    @Message('text') msg: string,
    @Ctx() ctx: Context & WizardContext,
  ) {
    ctx.wizard.state['data'] = {};
    await ctx.editMessageText('Введите название категории');
    ctx.wizard.next();
  }
  @WizardStep(1)
  async step1(
    @Message('text') msg: string,
    @Ctx() ctx: Context & WizardContext,
  ) {
    ctx.wizard.state['data'] = { ...ctx.wizard.state['data'], title: msg };
    await ctx.reply('Введите описание категории');
    ctx.wizard.next();
  }

  @WizardStep(2)
  async step2(
    @Message('text') msg: string,
    @Message('from') from,
    @Message('chat') chat,
    @Ctx() ctx: Context & WizardContext,
  ) {
    ctx.wizard.state['data'] = {
      ...ctx.wizard.state['data'],
      description: msg,
    };
    await ctx.reply(
      `Ваша категория:\n${ctx.wizard.state['data'].title}\n${ctx.wizard.state['data'].description}`,
      Markup.inlineKeyboard([
        Markup.button.callback('Сохранить', 'saveCategory'),
      ]),
    );
    ctx.wizard.next();
  }

  @WizardStep(3)
  async step3(@Ctx() ctx: Context & WizardContext) {
    const category = await this.categoriesService.createCategory({
      title: ctx.wizard.state['data'].title,
      description: ctx.wizard.state['data'].description,
    });
    await ctx.editMessageText(
      `Ваша категория была успешно сохранена`,
      Markup.inlineKeyboard([Markup.button.callback('Категории', 'category')]),
    );
    ctx.wizard.next();
  }

  @WizardStep(4)
  async step4(@Ctx() ctx: Context & WizardContext) {
    await ctx.scene.enter('adminScene');
  }

  @Action('leave')
  async leaveScene(@Ctx() ctx: Context & WizardContext) {
    await ctx.scene.enter('adminScene');
  }
}
