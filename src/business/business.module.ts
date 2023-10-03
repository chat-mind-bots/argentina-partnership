import { forwardRef, Module } from '@nestjs/common';
import { BusinessService } from 'src/business/business.service';
import { BusinessController } from 'src/business/business.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Business, BusinessSchema } from 'src/business/business.schema';
import { UserModule } from 'src/user/user.module';
import { CategoriesModule } from 'src/categories/categories.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Business.name, schema: BusinessSchema },
    ]),
    forwardRef(() => UserModule),
    forwardRef(() => CategoriesModule),
  ],
  controllers: [BusinessController],
  providers: [BusinessService],
  exports: [BusinessService],
})
export class BusinessModule {}
