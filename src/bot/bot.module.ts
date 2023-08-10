import { forwardRef, Module } from '@nestjs/common';
import { BotService } from './bot.service';
import { BotController } from './bot.controller';
import { TelegrafModule, TelegrafModuleOptions } from 'nestjs-telegraf';
// import { session } from 'telegraf';
// import { Redis } from '@telegraf/session/redis';
import RedisSession from 'telegraf-session-redis';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UserModule } from 'src/user/user.module';
import { BotUpdate } from 'src/bot/bot.update';
import { AdminScene } from 'src/bot/scenes/admin.scene';
import { UserScene } from 'src/bot/scenes/user.scene';
import { RightsChangeModule } from 'src/rights-change/rights-change.module';
import { CategoriesModule } from 'src/categories/categories.module';
import { AddCategoryScene } from 'src/bot/scenes/category/categories.scene';
import { UserCodesModule } from 'src/user-codes/user-codes.module';
import * as process from 'process';
import { session } from 'telegraf';
import { editCategoryTitleScene } from 'src/bot/scenes/category/category-change-title.scene';
import { editCategoryDescriptionScene } from 'src/bot/scenes/category/category-change-description.scene';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TelegrafModule.forRoot({
      token: process.env.TELEGRAM_API_KEY,
      middlewares: [
        ...(process.env.MODE === 'LOCAL'
          ? [session()]
          : [
              new RedisSession({
                store: {
                  host: process.env.REDIS_HOST,
                  port: process.env.REDIS_PORT,
                  password: process.env.REDIS_PASSWORD,
                },
              }).middleware(),
            ]),
      ],
    }),
    forwardRef(() => UserModule),
    forwardRef(() => RightsChangeModule),
    forwardRef(() => CategoriesModule),
    UserCodesModule,
  ],
  controllers: [BotController],
  providers: [
    BotService,
    BotUpdate,
    AdminScene,
    UserScene,
    AddCategoryScene,
    editCategoryTitleScene,
    editCategoryDescriptionScene,
  ],
})
export class BotModule {}
