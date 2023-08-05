import { forwardRef, Module } from '@nestjs/common';
import { BotService } from './bot.service';
import { BotController } from './bot.controller';
import { TelegrafModule } from 'nestjs-telegraf';
import { session } from 'telegraf';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from 'src/user/user.module';
import { BotUpdate } from 'src/bot/bot.update';
import { AdminScene } from 'src/bot/scenes/admin.scene';
import { UserScene } from 'src/bot/scenes/user.scene';
import { RightsChangeModule } from 'src/rights-change/rights-change.module';
import { CategoriesModule } from 'src/categories/categories.module';
import { AddCategoryScene } from 'src/bot/scenes/categories.scene';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TelegrafModule.forRoot({
      token: process.env.TELEGRAM_API_KEY,
      middlewares: [session()],
    }),
    forwardRef(() => UserModule),
    forwardRef(() => RightsChangeModule),
    forwardRef(() => CategoriesModule),
  ],
  controllers: [BotController],
  providers: [BotService, BotUpdate, AdminScene, UserScene, AddCategoryScene],
})
export class BotModule {}
