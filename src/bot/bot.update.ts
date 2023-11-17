import {
  Action,
  Command,
  Ctx,
  InjectBot,
  Message,
  On,
  Start,
  Update,
} from 'nestjs-telegraf';
import { forwardRef, Inject, UseFilters } from '@nestjs/common';
import { TelegrafExceptionFilter } from 'src/common/filtres/telegraf-exeption.filter';
import { Context, Telegraf } from 'telegraf';
import { isPrivate } from 'src/bot/bot.utils';
import { UserService } from 'src/user/user.service';
import { UserRoleEnum } from 'src/user/enum/user-role.enum';
import { SceneContext } from 'telegraf/typings/scenes';
import { Chat } from 'typegram/manage';
import { BotService } from 'src/bot/bot.service';
import { WebAppRoutes } from 'src/bot/interfaces/webAppRoutes';
import { FileService } from 'src/file/file.service';
import { telegramDataHelper } from 'src/common/helpers/telegram-data.helper';

@Update()
@UseFilters(TelegrafExceptionFilter)
export class BotUpdate {
  constructor(
    @InjectBot('bot') private readonly bot: Telegraf<Context>,
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
    @Inject(forwardRef(() => BotService))
    private readonly botService: BotService,
    @Inject(forwardRef(() => FileService))
    private readonly fileService: FileService,
  ) {}

  @Start()
  async startCommand(
    @Message('from') from,
    @Message('chat') chat,
    @Ctx() ctx: Context & SceneContext,
  ) {
    if (isPrivate(chat.type)) {
      const isOldUser = await this.userService.findByTgId(from.id);
      if (!isOldUser) {
        const info = (await ctx.getChat()) as Chat.PrivateChat;
        const { id: tg_id, username, first_name } = info;
        const refId = telegramDataHelper(ctx['startPayload'], 'refId=');
        await this.userService.createUser(
          {
            tg_id,
            username,
            first_name,
            role: [UserRoleEnum.USER],
          },
          +refId,
        );
      }
      await this.menuCommand(ctx, from);
    }
  }

  @Action('adminScene')
  async adminScene(@Ctx() ctx: Context & SceneContext) {
    await ctx.scene.enter('adminScene');
  }

  @Action('reenter')
  async reenter(@Ctx() ctx: Context & SceneContext) {
    await ctx.scene.reenter();
  }

  @Action('partnerScene')
  async partnerScene(@Ctx() ctx: Context & SceneContext) {
    await ctx.scene.enter('partnerScene');
  }

  @Action('userScene')
  async userScene(@Ctx() ctx: Context & SceneContext) {
    await ctx.scene.enter('userScene');
  }

  private async menu(
    @Ctx() ctx: Context & SceneContext,
    @Message('from') from,
  ) {
    await this.botService.menu(ctx, from);
  }

  @Command('menu')
  async menuCommand(@Ctx() ctx: Context & SceneContext, @Message('from') from) {
    await this.menu(ctx, from);
  }

  @Command('change_role')
  async changeRoleCommand(
    @Ctx() ctx: Context & SceneContext,
    @Message('from') from,
  ) {
    await this.menu(ctx, from);
  }

  @Command('help')
  async helpCommand(@Ctx() ctx: Context & SceneContext) {
    await this.botService.helpCommand(ctx);
  }

  @Command('generate_code')
  generateCode(@Ctx() ctx: Context, @Message('from') from) {
    return this.botService.generateCode(ctx, from.id);
  }

  @Command('add_business')
  async openAddBusiness(@Ctx() ctx: Context, @Message('from') from) {
    await this.botService.sendMessageWithWebApp(
      from.id,
      WebAppRoutes.BUSINESS_CREATE,
      'Добавить бизнес',
      'Добавить бизнес',
    );
  }

  @Command('test')
  async testWeb(@Ctx() ctx: Context, @Message('from') from) {
    await this.botService.sendMessageWithWebApp(
      from.id,
      WebAppRoutes.TEST,
      'Добавить бизнес',
      'Добавить бизнес',
    );
  }

  @On('text')
  async actionMenu(
    @Ctx() ctx: Context & SceneContext,
    @Message('text') msg: string,
    @Message('from') from,
  ) {
    if (msg === 'Главное меню') {
      await this.reenter(ctx);
    }
    if (msg === 'Помощь') {
      await this.helpCommand(ctx);
    }
    if (msg === 'Выйти') {
      await this.menuCommand(ctx, from);
    }
  }
}
