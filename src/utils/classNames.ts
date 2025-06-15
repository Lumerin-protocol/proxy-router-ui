// HTML HELPERS
// Dynamically set classes for html elements

export const classNames: (...classes: string[]) => string = (...classes) => {
  return classes.filter(Boolean).join(" ");
};
