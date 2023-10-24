export const isCommandString = (str: string) => {
  if (str === '/start') {
    return false;
  }
  return !!str.match(/^\/.*/);
};
