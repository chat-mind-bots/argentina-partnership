import { Controller, Get, Param } from '@nestjs/common';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get(':userId')
  async getUser(@Param('userId') userId: number) {
    await new Promise((resolve) => {
      setTimeout(resolve, 3000);
    });
    return this.userService.getUserForWebApp(userId);
  }
}
