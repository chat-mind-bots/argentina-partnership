export function createPaginationTGButtons<T>(
  currentPage: number,
  data: {
    first: number;
    prev: number;
    next: number;
    last: number;
  },
  prefix: string,
  callback: (title: string, action: string) => T,
) {
  const result = [];
  for (const name in data) {
    console.log(name);
    if (name === 'first') {
      if (data.first !== currentPage) {
        result.push(callback('‹‹  ' + String(data.first), prefix + name));
      }
    }
    if (name === 'prev') {
      if (data.prev !== data.last && data.prev !== data.first) {
        result.push(callback('‹  ' + String(data.prev), prefix + name));
      }
    }
    if (name === 'next') {
      if (data.next !== data.last && data.next !== data.first) {
        result.push(callback(String(data.next) + '  ›', prefix + name));
      }
    }

    if (name === 'last') {
      if (data.last !== data.first && data.last !== currentPage) {
        result.push(callback(String(data.last) + '  ››', prefix + name));
      }
    }
  }

  return result;
}
