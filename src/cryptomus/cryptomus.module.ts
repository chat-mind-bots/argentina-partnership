import { Module } from '@nestjs/common';
import { CryptomusService } from './cryptomus.service';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    HttpModule.register({
      timeout: 5000,
      maxRedirects: 5,
    }),
    ConfigModule.forRoot(),
  ],
  providers: [CryptomusService],
})
export class CryptomusModule {}
