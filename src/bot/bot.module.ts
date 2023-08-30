import { forwardRef, Module } from '@nestjs/common';
import { BotService } from './bot.service';
import { BotController } from './bot.controller';
import { TelegrafModule } from 'nestjs-telegraf';
import RedisSession from 'telegraf-session-redis';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from 'src/user/user.module';
import { BotUpdate } from 'src/bot/bot.update';
import { AdminScene } from 'src/bot/scenes/admin/admin.scene';
import { UserScene } from 'src/bot/scenes/user/user.scene';
import { RightsChangeModule } from 'src/rights-change/rights-change.module';
import { CategoriesModule } from 'src/categories/categories.module';
import { AddCategoryScene } from 'src/bot/scenes/admin/categories/categories.scene';
import { UserCodesModule } from 'src/user-codes/user-codes.module';
import * as process from 'process';
import { session } from 'telegraf';
import { PartnerScene } from 'src/bot/scenes/partner/partner.scene';
import { BusinessModule } from 'src/business/business.module';
import { FileModule } from 'src/file/file.module';
import { editCategoryTitleScene } from 'src/bot/scenes/admin/categories/edit-title.scene';
import { editCategoryDescriptionScene } from 'src/bot/scenes/admin/categories/edit-description.scene';
import { PaymentModule } from 'src/payment/payment.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TelegrafModule.forRoot({
      ...(process.env.TEST ? { options: { telegram: { testEnv: true } } } : {}),
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
    PaymentModule,
    UserCodesModule,
    FileModule,
  ],
  controllers: [BotController],
  providers: [
    BotService,
    BotUpdate,
    AdminScene,
    UserScene,
    AddCategoryScene,
    PartnerScene,
    editCategoryTitleScene,
    editCategoryDescriptionScene,
  ],
})
export class BotModule {}
