import { Action, Ctx, InjectBot, On, Scene, SceneEnter } from 'nestjs-telegraf';
import { forwardRef, Inject, UseFilters } from '@nestjs/common';
import { TelegrafExceptionFilter } from 'src/common/filtres/telegraf-exeption.filter';
import { BotService } from 'src/bot/bot.service';
import { RightsChangeService } from 'src/rights-change/rights-change.service';
import { UserService } from 'src/user/user.service';
import { CategoriesService } from 'src/categories/categories.service';
import { FileService } from 'src/file/file.service';
import { Context, Markup, Telegraf } from 'telegraf';
import { SceneContext } from 'telegraf/typings/scenes';
import https from 'https';
import { BusinessService } from 'src/business/business.service';

@Scene('setImageScene')
@UseFilters(TelegrafExceptionFilter)
export class SetImageScene {
  constructor(
    @InjectBot() private readonly bot: Telegraf<Context>,
    @Inject(forwardRef(() => BotService))
    private readonly botService: BotService,
    @Inject(forwardRef(() => RightsChangeService))
    private readonly rightsChangeService: RightsChangeService,
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
    @Inject(forwardRef(() => CategoriesService))
    private readonly categoriesService: CategoriesService,
    @Inject(forwardRef(() => FileService))
    private readonly fileService: FileService,
    @Inject(forwardRef(() => BusinessService))
    private readonly businessService: BusinessService,
  ) {}

  @SceneEnter()
  async sceneEnter(@Ctx() ctx: SceneContext) {
    const markup = Markup.inlineKeyboard([
      Markup.button.callback('Назад', 'leave'),
    ]);
    try {
      await ctx.editMessageText('Загрузите фотографию в чат', markup);
    } catch (error) {
      await ctx.reply('Загрузите фотографию в чат', markup);
    }
  }

  @On('photo')
  async photo(@Ctx() ctx: SceneContext) {
    const businessId = ctx.session['businessId'];
    const file = await this.bot.telegram.getFile(
      ctx.message['photo'][2]['file_id'],
    );
    const fileURL = await this.bot.telegram.getFileLink(
      ctx.message['photo'][2]['file_id'],
    );
    await ctx.reply('123');
    const chunks: any[] = [];
    let download = 0;
    await new Promise((resolve, reject) => {
      const request = https.get(fileURL.href, (response) => {
        response.on('data', async (chunk) => {
          chunks.push(chunk);
          download += chunk.length;
          const message = `Ваш файл загружается:
Прогресс:  ${((download / file.file_size) * 100).toFixed(2)}
        `;
          await ctx.reply(message);
        });

        response.on('end', async () => {
          const fileBuffer = Buffer.concat(chunks);

          await this.fileService.uploadImage(
            fileBuffer,
            `${file.file_unique_id}.jpg`,
            file.file_size,
            ctx.from.id,
            businessId,
          );
          resolve({});
        });

        response.on('error', (error) => {
          reject(error);
        });
      });

      request.on('error', (error) => {
        reject(error);
      });
    });
    await ctx.reply('Загрузка завершена');
    const business = await this.businessService.findBusinessById(businessId);
    await ctx.sendPhoto(business.preview);
    await this.leaveScene(ctx);
  }
  @Action('leave')
  async leaveScene(@Ctx() ctx: SceneContext) {
    ctx.session['fromScene'] = true;
    const businessId = ctx.session['businessId'];
    const markup = Markup.inlineKeyboard([
      Markup.button.callback('Назад', `selectBusiness__${businessId}`),
    ]);
    await ctx.scene.enter('partnerScene');
    await ctx.reply('К бизнесу', markup);
  }
}
