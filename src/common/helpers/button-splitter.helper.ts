export const buttonSplitterHelper = (array: Array<string>, limit: number) => {
  const markup = [];
  let line = [];
  array.map((item) => {
    if (line.length === limit) {
      markup.push(line);
      line = [];
    }
    line.push(item);
  });
  markup.push(line);
  return markup;
};
