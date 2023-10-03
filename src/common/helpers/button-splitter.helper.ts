export const buttonSplitterHelper = <T>(
  array: Array<T>,
  limit: number,
): Array<Array<T>> =>
  array.reduce(
    (acc, element, index) =>
      acc[acc.length - 1].length < limit
        ? [...acc.slice(0, acc.length - 1), [...acc[acc.length - 1], element]]
        : [...acc, [element]],
    [[]],
  );
