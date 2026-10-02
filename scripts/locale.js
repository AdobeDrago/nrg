export const LOCALES = ['en', 'es'];

/**
 * Locale from the first path segment ('en' | 'es'), or '' for the root site.
 * @param {string} [pathname]
 * @returns {string}
 */
export function getLocale(pathname = window.location.pathname) {
  const seg = pathname.split('/')[1];
  return LOCALES.includes(seg) ? seg : '';
}

/**
 * Path prefix for locale-relative links: '/en', '/es' or '' for root.
 * @returns {string}
 */
export function localePrefix() {
  const locale = getLocale();
  return locale ? `/${locale}` : '';
}

/**
 * Same page in another locale, keeping query and hash.
 * @param {string} target locale code
 * @returns {string}
 */
export function localizedHref(target) {
  const { pathname, search, hash } = window.location;
  const locale = getLocale(pathname);
  let rest = locale ? pathname.slice(locale.length + 1) : pathname;
  rest = rest.replace(/\/index$/, '/') || '/';
  return `/${target}${rest}${search}${hash}`;
}

/**
 * True when a URL points at a locale root ('/', '/en/', '/es/').
 * @param {string} href
 * @returns {boolean}
 */
export function isHomePath(href) {
  const { pathname } = new URL(href, window.location);
  return /^\/((en|es)\/?)?(index)?$/.test(pathname);
}
