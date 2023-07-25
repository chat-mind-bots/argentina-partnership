import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BotModule } from './bot/bot.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [BotModule, UserModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
