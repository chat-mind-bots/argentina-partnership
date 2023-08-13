import { forwardRef, Module } from '@nestjs/common';
import { BotService } from './bot.service';
import { BotController } from './bot.controller';
import { TelegrafModule } from 'nestjs-telegraf';
import RedisSession from 'telegraf-session-redis';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from 'src/user/user.module';
import { BotUpdate } from 'src/bot/bot.update';
import { AdminScene } from 'src/bot/scenes/admin.scene';
import { UserScene } from 'src/bot/scenes/user.scene';
import { RightsChangeModule } from 'src/rights-change/rights-change.module';
import { CategoriesModule } from 'src/categories/categories.module';
import { AddCategoryScene } from 'src/bot/scenes/categories.scene';
import { UserCodesModule } from 'src/user-codes/user-codes.module';
import * as process from 'process';
import { session } from 'telegraf';
import { PartnerScene } from 'src/bot/scenes/partner.scene';
import { BusinessModule } from 'src/business/business.module';

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
    forwardRef(() => BusinessModule),
    UserCodesModule,
  ],
  controllers: [BotController],
  providers: [
    BotService,
    BotUpdate,
    AdminScene,
    UserScene,
    AddCategoryScene,
    PartnerScene,
  ],
})
export class BotModule {}
