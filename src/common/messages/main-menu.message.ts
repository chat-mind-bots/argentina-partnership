import { UserRoleEnum } from 'src/user/enum/user-role.enum';
import { Markup } from 'telegraf';

export const mainMenuMessage = async (userRoles: UserRoleEnum[]) => {
  const markupButtons = [];
  if (userRoles.includes(UserRoleEnum.USER)) {
    markupButtons.push(Markup.button.callback('войти как юзер', 'userScene'));
  }
  if (userRoles.includes(UserRoleEnum.ADMIN)) {
    markupButtons.push(Markup.button.callback('войти как админ', 'adminScene'));
  }
  if (userRoles.includes(UserRoleEnum.PARTNER)) {
    markupButtons.push(Markup.button.callback('войти как партнер', 'asd'));
  }
  const markup = Markup.inlineKeyboard(markupButtons);
  const greetingText =
    'Приветствую!\n для продолжения работы выберите под каким профилем хотите войти';
};
