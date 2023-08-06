export const valueInEnum = <T>(value: string, enumObject: T) => {
  return Object.values(enumObject).includes(value);
};
