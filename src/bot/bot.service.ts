import { forwardRef, Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { Ctx, InjectBot, Message } from 'nestjs-telegraf';
import { Context, Markup, Telegraf } from 'telegraf';
import { SceneContext } from 'telegraf/typings/scenes';
import { UserRoleEnum } from 'src/user/enum/user-role.enum';
import { UserService } from 'src/user/user.service';
import * as process from 'process';
import { WebAppRoutes } from 'src/bot/interfaces/webAppRoutes';
import { UserCodesService } from 'src/user-codes/user-codes.service';
import { PaymentService } from 'src/payment/payment.service';
import { FileService } from 'src/file/file.service';

@Injectable()
export class BotService implements OnModuleInit {
  constructor(
    @InjectBot() private readonly bot: Telegraf<Context>,
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
    private readonly userCodeService: UserCodesService,
    private readonly paymentService: PaymentService,
    private readonly fileService: FileService,
  ) {}
  async onModuleInit() {
    await this.bot.telegram.setMyCommands([
      {
        command: 'start',
        description: 'Начало работы бота/получения последних обновлений',
      },
      { command: 'menu', description: 'Меню' },
      { command: 'help', description: 'Получить подсказку' },
    ]);
  }

  async sendMessage(chatId: number, message: string) {
    await this.bot.telegram.sendMessage(chatId, message);
    return;
  }

  async sendPhoto(chatId: number, image: Buffer) {
    await this.bot.telegram.sendPhoto(chatId, { source: image });
  }

  async menu(@Ctx() ctx: Context & SceneContext, @Message('from') from) {
    const isOldUser = await this.userService.findByTgId(from.id);
    if (isOldUser.role.every((item) => item === UserRoleEnum.USER)) {
      ctx.session['onlyUser'] = true;
      await ctx.scene.enter('userScene');
      return;
    }
    const markupButtons = [];
    if (isOldUser.role.includes(UserRoleEnum.USER)) {
      delete ctx.session['onlyUser'];
      markupButtons.push([
        Markup.button.callback('войти как юзер', 'userScene'),
      ]);
    }
    if (
      isOldUser.role.includes(UserRoleEnum.ADMIN) ||
      isOldUser.role.includes(UserRoleEnum.SUPER_ADMIN)
    ) {
      markupButtons.push([
        Markup.button.callback('войти как администратор', 'adminScene'),
      ]);
    }
    if (isOldUser.role.includes(UserRoleEnum.PARTNER)) {
      markupButtons.push([
        Markup.button.callback('войти как партнер', 'partnerScene'),
      ]);
    }

    const markup = Markup.inlineKeyboard(markupButtons);
    const greetingText =
      'Для продолжения работы выберите под каким профилем хотите войти';

    await ctx.reply(greetingText, markup);
  }
  async helpCommand(@Ctx() ctx: Context & SceneContext) {
    await ctx.reply(
      `Если что-то пошло не так обратитесь за помощью в канал @${process.env.SUPPORT_USERNAME}`,
    );
  }

  async sendMessageWithWebApp(
    chatId: number,
    route: string,
    mainText: string,
    webAppButtonText: string,
  ) {
    await this.bot.telegram.sendMessage(
      chatId,
      mainText,
      Markup.inlineKeyboard([this.getMarkupWebApp(webAppButtonText, route)]),
    );
  }

  getMarkupWebApp(webAppButtonText: string, route: string) {
    return Markup.button.webApp(
      webAppButtonText,
      process.env.TEST
        ? `http://${process.env.BASE_URL}/${route}`
        : `https://${process.env.BASE_URL}/${route}`,
    );
  }

  async editMessageWithWebApp(
    chatId: number,
    messageId: number,
    inlineId: string,
    route: WebAppRoutes,
    mainText: string,
    webAppButtonText: string,
  ) {
    await this.bot.telegram.editMessageText(
      chatId,
      messageId,
      inlineId,
      mainText,
      Markup.inlineKeyboard([this.getMarkupWebApp(webAppButtonText, route)]),
    );
  }

  private getTimeDifference(date1: Date, date2: Date): string {
    const differenceInMilliseconds = Math.abs(
      date2.getTime() - date1.getTime(),
    );

    const hours = Math.floor(differenceInMilliseconds / (1000 * 60 * 60));
    const minutes = Math.floor(
      (differenceInMilliseconds % (1000 * 60 * 60)) / (1000 * 60),
    );
    const seconds = Math.floor((differenceInMilliseconds % (1000 * 60)) / 1000);
    return `${hours} часов, ${minutes} минут, ${seconds} секунд`;
  }

  async generateCode(ctx: Context, userId) {
    const user = await this.userService.findByTgId(userId);

    const { qrCode, codeDocument } =
      await this.userCodeService.generateUniqCode(user._id);

    await ctx.replyWithPhoto({ source: qrCode });
    await ctx.replyWithHTML(`<b>${codeDocument.code}</b>`);
    await ctx.replyWithHTML(
      `Ваш уникальный код: <b>${codeDocument.code}</b>
Код будет активен еще ${this.getTimeDifference(
        codeDocument.createdAt,
        codeDocument.expiresAt,
      )}`,
    );
  }

  async getPaymentsForAdmin(limit?: number, offset?: number) {
    const payments = await this.paymentService.getReviewPayments(limit, offset);
    return payments;
  }

  async getPayment(id) {
    return this.paymentService.getPaymentWithUser(id);
  }

  async getPhoto(id: string) {
    return this.fileService.findFile(id);
  }

  async successPayment(id: string) {
    return this.paymentService.movePaymentToSuccess(id);
  }

  async rejectPayment(id: string) {
    return this.paymentService.movePaymentToReject(id);
  }
}
