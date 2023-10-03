export const isCommandString = (str: string) => {
  return !!str.match(/^\/.*/);
};
