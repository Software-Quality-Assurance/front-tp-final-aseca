type ThemeColors = {
  backgroundElement: string;
  text: string;
  backgroundSelected: string;
};

export function themedInput(theme: ThemeColors) {
  return {
    backgroundColor: theme.backgroundElement,
    color: theme.text,
    borderColor: theme.backgroundSelected,
  };
}
