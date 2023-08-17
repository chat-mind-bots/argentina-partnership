export const routeReplacer = (route: string, replacements: string[]) => {
  let currentIndex = 0;
  return route.replace(/:\w+/g, () => {
    const replacement = replacements[currentIndex];
    currentIndex++;
    return replacement;
  });
};
