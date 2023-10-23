import {
  Action,
  Ctx,
  Message,
  On,
  Scene,
  SceneEnter,
  SceneLeave,
} from 'nestjs-telegraf';
import { forwardRef, Inject, UseFilters } from '@nestjs/common';
import { TelegrafExceptionFilter } from 'src/common/filtres/telegraf-exeption.filter';
import { CategoriesService } from 'src/categories/categories.service';
import { SceneContext } from 'telegraf/typings/scenes';
import { valueInEnum } from 'src/common/helpers/enum-value.helper';
import { KeyboardMessageEnum } from 'src/bot/enums/keyboard-message.enum';
import { isCommandString } from 'src/common/helpers/string.helper';
import { Markup } from 'telegraf';

@Scene('editCategoryTitleScene')
@UseFilters(TelegrafExceptionFilter)
export class editCategoryTitleScene {
  constructor(
    @Inject(forwardRef(() => CategoriesService))
    private readonly categoriesService: CategoriesService,
  ) {}

  @SceneEnter()
  async sceneEnter(
    @Ctx()
    ctx: SceneContext,
  ) {
    const { title } = ctx.session['data'];
    const titleText = `Текущее название: ${title}`;
    try {
      await ctx.editMessageText(
        `Введите новое название категории\n${titleText}`,
      );
    } catch (error) {
      await ctx.reply(`Введите новое название категории\n${titleText}`);
    }
  }

  @On('text')
  async onText(
    @Message('text') msg: string,
    @Ctx()
    ctx: SceneContext,
  ) {
    const isAllowedMessage =
      !valueInEnum(msg, KeyboardMessageEnum) && !isCommandString(msg);
    if (isAllowedMessage) {
      ctx.session['tempData'] = msg;
      const markup = Markup.inlineKeyboard([
        [
          Markup.button.callback('Да', 'onSave'),
          Markup.button.callback('Нет', 'onCancel'),
        ],
        [Markup.button.callback('Попробовать снова', 'reenter')],
      ]);
      await ctx.reply(
        msg + '\n\n' + 'Вы действительно хотите сохранить текущее название?',
        markup,
      );
      return;
    }
  }

  @Action('onSave')
  async onSave(
    @Ctx()
    ctx: SceneContext,
  ) {
    const newTitle = ctx.session['tempData'];
    const { id, description } = ctx.session['data'];
    try {
      await this.categoriesService.updateCategory(id, {
        description,
        title: newTitle,
      });
      const titleText = `Текущее название: ${newTitle}`;
      const markup = Markup.inlineKeyboard([
        [
          Markup.button.callback(
            'Вернуться к категории',
            `selectCategory__${id}`,
          ),
        ],
      ]);
      await ctx.reply(titleText + '\n\n' + 'Было успешно сохранено', markup);
      await this.leave(ctx);
    } catch (error) {}
  }

  @Action('onCancel')
  async onCancel(
    @Ctx()
    ctx: SceneContext,
  ) {
    const { id } = ctx.session['data'];
    const markup = Markup.inlineKeyboard([
      [
        Markup.button.callback(
          'Вернуться к категории',
          `selectCategory__${id}`,
        ),
      ],
    ]);
    await ctx.editMessageText('Изменение названия было отменено', markup);
    await this.leave(ctx);
  }

  @Action('reenter')
  async reenter(
    @Ctx()
    ctx: SceneContext,
  ) {
    await this.sceneEnter(ctx);
  }

  @Action('leave')
  async leave(
    @Ctx()
    ctx: SceneContext,
  ) {
    ctx.session['fromScene'] = true;
    await ctx.scene.enter('adminScene');
  }

  @SceneLeave()
  async sceneLeave(
    @Ctx()
    ctx: SceneContext,
  ) {
    delete ctx.session['data'];
    delete ctx.session['tempData'];
  }
}
