import { getLocale, localePrefix } from './locale.js';

const STRINGS = {
  en: {
    allBlogs: 'All Blogs',
    postedOn: 'Posted on',
    by: 'by',
    minute: 'minute',
    minutes: 'minutes',
    second: 'second',
    seconds: 'seconds',
    mostRecent: 'Most recent',
    loadMore: 'Load more',
    zipIntroStrong: 'Enter your location',
    zipIntro: 'to find plans in your area',
    zipPlaceholder: 'Zip Code',
    zipSubmit: 'Fetch plans',
    zipError: 'Invalid zip code. Try again.',
  },
  es: {
    allBlogs: 'Todos los blogs',
    postedOn: 'Publicado el',
    by: 'por',
    minute: 'minuto',
    minutes: 'minutos',
    second: 'segundo',
    seconds: 'segundos',
    mostRecent: 'Más reciente',
    loadMore: 'Cargar más',
    zipIntroStrong: 'Ingresa tu ubicación',
    zipIntro: 'para encontrar planes en tu área',
    zipPlaceholder: 'Código postal',
    zipSubmit: 'Buscar planes',
    zipError: 'Código postal inválido. Inténtalo de nuevo.',
  },
};

/**
 * UI string for the current locale.
 * @param {string} key
 * @returns {string}
 */
export function t(key) {
  return (STRINGS[getLocale()] || STRINGS.en)[key] || STRINGS.en[key] || key;
}

/** Path of the blog landing page for the current locale, e.g. '/en/blogs/'. */
export function blogsPath() {
  return `${localePrefix()}/blogs/`;
}

/**
 * Formats an ISO (YYYY-MM-DD) or Excel serial date like the original: "January 17, 2025".
 * @param {string|number} value
 * @returns {string}
 */
export function formatDate(value) {
  if (!value) return '';
  let date;
  if (/^\d+(\.\d+)?$/.test(String(value))) {
    date = new Date(Math.round((Number(value) - 25569) * 86400 * 1000));
  } else {
    date = new Date(`${String(value).slice(0, 10)}T12:00:00Z`);
  }
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleDateString(getLocale() === 'es' ? 'es-US' : 'en-US', {
    year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC',
  });
}

/**
 * Sortable timestamp for an ISO or Excel serial date.
 * @param {string|number} value
 * @returns {number}
 */
export function dateValue(value) {
  if (!value) return 0;
  if (/^\d+(\.\d+)?$/.test(String(value))) return (Number(value) - 25569) * 86400 * 1000;
  const time = Date.parse(String(value).slice(0, 10));
  return Number.isNaN(time) ? 0 : time;
}
