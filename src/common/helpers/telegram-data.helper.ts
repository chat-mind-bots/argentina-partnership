export const telegramDataHelper = (data: string, substr: string) => {
  const index = data.indexOf(substr) + substr.length;
  return data.slice(index);
};
