export enum KeyboardMessageEnum {
  EXIT = 'Выйти',
  MENU = 'Главное меню',
  HELP = 'Помощь',
}

export type KeyboardMessage = keyof typeof KeyboardMessageEnum;
export type KeyboardMessages = (typeof KeyboardMessageEnum)[KeyboardMessage];
