import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { createSignService } from 'src/cryptomus/services/create-sign.service';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const obj = { ...req.body };
    delete obj.sign;
    const payloadSign = createSignService(JSON.stringify(obj));
    if (payloadSign === req.body.sign) {
      next();
    } else {
      res.status(401).json({ message: 'Unauthorized' }); // Возвращаем ошибку "Unauthorized"
    }
  }
}
