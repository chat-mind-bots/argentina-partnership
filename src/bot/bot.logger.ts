import { ConsoleLogger, Injectable } from '@nestjs/common';
import { InjectBot } from 'nestjs-telegraf';
import { Context, Telegraf } from 'telegraf';

@Injectable()
export class BotLogger extends ConsoleLogger {
  constructor(@InjectBot('logger') private readonly bot: Telegraf<Context>) {
    super();
  }

  async sendMessage(chatId: number, message: string) {
    await this.bot?.telegram.sendMessage(chatId, message);
    return;
  }
  async log(message: any, context?: string) {
    super.log(message, context);
    await this.sendMessage(2200516676, message);
  }

  async error(message: any, stack?: string, context?: string) {
    super.error(message, stack, context);
    await this.sendMessage(2200516676, message);
  }

  async warn(message: any, context?: string) {
    super.warn(message, context);
    await this.sendMessage(2200516676, message);
  }

  async debug(message: any, context?: string) {
    super.debug(message, context);
    await this.sendMessage(2200516676, message);
  }
}
