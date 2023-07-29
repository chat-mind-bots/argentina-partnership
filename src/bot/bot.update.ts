import { Ctx, InjectBot, Message, On, Start, Update } from 'nestjs-telegraf';
import { forwardRef, Inject, UseFilters } from '@nestjs/common';
import { TelegrafExceptionFilter } from 'src/common/filtres/telegraf-exeption.filter';
import { Context, Telegraf } from 'telegraf';
import { isPrivate } from 'src/bot/bot.utils';
import { UserService } from 'src/user/user.service';
import { UserRoleEnum } from 'src/user/enum/user-role.enum';
import { SceneContext } from 'telegraf/typings/scenes';

@Update()
@UseFilters(TelegrafExceptionFilter)
export class BotUpdate {
  constructor(
    @InjectBot() private readonly bot: Telegraf<Context>,
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
  ) {}

  @Start()
  async startCommand(
    @Message('from') from,
    @Message('chat') chat,
    @Ctx() ctx: Context & SceneContext,
  ) {
    console.log(ctx);
    if (isPrivate(chat.type)) {
      const isOldUser = await this.userService.findById(from.id);
      console.log(from.id);
      if (!isOldUser) {
        await this.userService.createUser({
          tg_id: from.id,
          balance: 0,
          refCode: 'fixitsoon',
          role: [UserRoleEnum.USER],
        });
        return;
      }

      console.log(isOldUser.role);
      if (isOldUser.role.includes(UserRoleEnum.ADMIN)) {
        await ctx.scene.enter('admin');
      }
    }
  }

  @On('message')
  async hear(@Ctx() ctx: Context) {
    await ctx.reply('Сука');
  }
}
