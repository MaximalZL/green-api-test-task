export class ThemeManager {
  constructor(storageKey, defaultTheme) {
    this.storageKey = storageKey;
    this.defaultTheme = defaultTheme;
  }

  restore() {
    const savedTheme = window.localStorage.getItem(this.storageKey);
    this.apply(savedTheme || this.defaultTheme);
  }

  toggle() {
    const currentTheme = document.documentElement.dataset.theme || this.defaultTheme;
    const nextTheme = currentTheme === "dark" ? "light" : "dark";
    this.apply(nextTheme);
  }

  apply(theme) {
    document.documentElement.dataset.theme = theme;
    window.localStorage.setItem(this.storageKey, theme);
  }
}
