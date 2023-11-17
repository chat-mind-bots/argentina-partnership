import { ConsoleLogger, Injectable } from '@nestjs/common';
import { InjectBot } from 'nestjs-telegraf';
import { Context, Telegraf } from 'telegraf';
import process from 'process';

@Injectable()
export class BotLogger extends ConsoleLogger {
  constructor(@InjectBot('logger') private readonly bot: Telegraf<Context>) {
    super();
  }

  async sendMessage(message: string) {
    await this.bot?.telegram.sendMessage(
      Number(process.env.SERVICE_CHAT_ID),
      message,
    );
    return;
  }
  async log(message: any, context?: string) {
    super.log(message, context);
    await this.sendMessage(message);
  }

  async error(message: any, stack?: string, context?: string) {
    super.error(message, stack, context);
    await this.sendMessage(message);
  }

  async warn(message: any, context?: string) {
    super.warn(message, context);
    await this.sendMessage(message);
  }

  async debug(message: any, context?: string) {
    super.debug(message, context);
    await this.sendMessage(message);
  }
}
