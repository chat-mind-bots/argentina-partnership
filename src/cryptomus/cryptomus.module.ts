import { Module } from '@nestjs/common';
import { CryptomusService } from './cryptomus.service';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { Cryptomus, CryptomusSchema } from 'src/cryptomus/cryptomus.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Cryptomus.name, schema: CryptomusSchema },
    ]),
    HttpModule.register({
      timeout: 5000,
      maxRedirects: 5,
    }),
    ConfigModule.forRoot(),
  ],
  providers: [CryptomusService],
})
export class CryptomusModule {}
