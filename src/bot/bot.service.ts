import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectBot } from 'nestjs-telegraf';
import { Context, Telegraf } from 'telegraf';

@Injectable()
export class BotService implements OnModuleInit {
  constructor(@InjectBot() private readonly bot: Telegraf<Context>) {}
  async onModuleInit() {
    await this.bot.telegram.setMyCommands([
      {
        command: 'start',
        description: 'Начало работы бота/получения последних обновлений',
      },
      { command: 'menu', description: 'Меню' },
      { command: 'change_role', description: 'Сменить роль' },
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
}
