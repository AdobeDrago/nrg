import { getMetadata } from './aem.js';

export const THEMES = ['light', 'dark'];
const STORAGE_KEY = 'ee-page-theme';
const systemDark = window.matchMedia?.('(prefers-color-scheme: dark)');

/** Parses a Theme value such as `Dark`, `theme-dark` or `dark, other`; first match wins. */
export function parseTheme(value) {
  return String(value || '').split(',')
    .map((name) => name.trim().toLowerCase().replace(/^theme-/, ''))
    .find((name) => THEMES.includes(name)) || '';
}

/** A page Metadata `Theme` pins the page to one theme, e.g. for light-only artwork. */
export function getAuthoredTheme() {
  return parseTheme(getMetadata('theme'));
}

function getStoredTheme() {
  try {
    return parseTheme(localStorage.getItem(STORAGE_KEY));
  } catch {
    return '';
  }
}

/** Authored page theme, then the visitor's saved choice, then the OS preference. */
export function getPageTheme() {
  return getAuthoredTheme() || getStoredTheme() || (systemDark?.matches ? 'dark' : 'light');
}

export function isThemeLocked() {
  return !!getAuthoredTheme();
}

function applyTheme(theme) {
  document.documentElement.dataset.pageTheme = theme;
  document.dispatchEvent(new CustomEvent('ee:page-theme', { detail: { theme } }));
}

/** Saves the visitor's choice and applies it, unless the page pins a theme. */
export function setPageTheme(theme) {
  if (!THEMES.includes(theme) || isThemeLocked()) return;
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    // storage unavailable (e.g. private mode): the choice lasts for this page view
  }
  applyTheme(theme);
}

/** Apply before the first section shows so tokens resolve on the root from the start. */
export default function decoratePageTheme() {
  applyTheme(getPageTheme());
  // follow live OS changes until the visitor picks a theme
  systemDark?.addEventListener('change', () => {
    if (!isThemeLocked() && !getStoredTheme()) applyTheme(getPageTheme());
  });
}
