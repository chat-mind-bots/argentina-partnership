import { Module } from '@nestjs/common';
import { BotModule } from './bot/bot.module';
import { UserModule } from './user/user.module';
import { MongooseModule } from '@nestjs/mongoose';
import { RightsChangeModule } from './rights-change/rights-change.module';
import { CategoriesModule } from './categories/categories.module';
import { UserCodesModule } from './user-codes/user-codes.module';

@Module({
  imports: [
    MongooseModule.forRoot(process.env.MONGODB_URI),
    BotModule,
    UserModule,
    RightsChangeModule,
    CategoriesModule,
    UserCodesModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
