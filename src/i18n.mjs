import { en } from "./locales/en.mjs";
import { zh } from "./locales/zh.mjs";

const locales = { en, zh };
let currentLocale = "en";

export function setLocale(lang) {
  currentLocale = locales[lang] ? lang : "en";
}

export function getLocale() {
  return currentLocale;
}

export function t(key) {
  return locales[currentLocale]?.[key] ?? locales.en[key] ?? key;
}
