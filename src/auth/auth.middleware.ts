import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import process from 'process';
import crypto from 'crypto';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const token = req.headers.authorization;

    if (validateTelegramData(token)) {
      next();
    } else {
      res.status(401).json({ message: 'Unauthorized' }); // Возвращаем ошибку "Unauthorized"
    }
  }
}

function validateTelegramData(telegramInitData: string) {
  const botToken = process.env.TELEGRAM_API_KEY;
  const encoded = decodeURIComponent(telegramInitData);

  const secret = crypto.createHmac('sha256', 'WebAppData').update(botToken);

  const arr = encoded.split('&');
  const hashIndex = arr.findIndex((str) => str.startsWith('hash='));
  const hash = arr.splice(hashIndex)[0].split('=')[1];
  arr.sort((a, b) => a.localeCompare(b));
  const dataCheckString = arr.join('\n');

  const _hash = crypto
    .createHmac('sha256', secret.digest())
    .update(dataCheckString)
    .digest('hex');

  return _hash === hash;
}
