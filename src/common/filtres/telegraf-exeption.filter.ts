import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { TelegrafArgumentsHost } from 'nestjs-telegraf';
import { Scenes } from 'telegraf';
import * as process from 'process';

export type Context = Scenes.SceneContext;

@Catch()
export class TelegrafExceptionFilter implements ExceptionFilter {
  async catch(exception: Error, host: ArgumentsHost): Promise<void> {
    const telegrafHost = TelegrafArgumentsHost.create(host);
    const ctx = telegrafHost.getContext<Context>();

    await ctx.telegram.sendMessage(
      process.env.SERVICE_CHAT_ID,
      `<b>Error</b>: ${exception.message}\n<b>Chat id</b>: ${ctx.chat.id}`,
      { parse_mode: 'HTML' },
    );
    console.log('Error: ', exception.message);
  }
}
