import {
  loadHeader, loadFooter, decorateIcons, decorateSections, decorateBlocks,
  decorateTemplateAndTheme, waitForFirstImage, loadSection, loadSections, loadCSS,
  getMetadata, toClassName,
} from './aem.js';
import { getLocale } from './locale.js';

function moveAttributes(from, to, attributes) {
  if (!attributes) attributes = [...from.attributes].map(({ nodeName }) => nodeName);
  attributes.forEach((attr) => {
    const value = from.getAttribute(attr);
    if (value) { to?.setAttribute(attr, value); from.removeAttribute(attr); }
  });
}

function moveInstrumentation(from, to) {
  moveAttributes(from, to, [...from.attributes].map(({ nodeName }) => nodeName).filter((attr) => attr.startsWith('data-aue-') || attr.startsWith('data-richtext-')));
}

async function loadFonts() {
  await loadCSS(`${window.hlx.codeBasePath}/styles/fonts.css`);
  try { if (!window.location.hostname.includes('localhost')) sessionStorage.setItem('fonts-loaded', 'true'); } catch (e) {}
}

function buildAutoBlocks() {}

/**
 * DA drops relative <img> sources on preview, so images kept in the code repo
 * (e.g. /icons/providers/*.png) are authored as a standalone link to the file.
 * Turns such links into images; the link text (if not the path) becomes the alt.
 */
function decorateImageLinks(main) {
  main.querySelectorAll('a[href*="/icons/"]').forEach((a) => {
    const url = new URL(a.href, window.location);
    if (!url.pathname.startsWith('/icons/') || !/\.(png|jpe?g|gif|webp|svg)$/i.test(url.pathname)) return;
    const parent = a.parentElement;
    if (parent.textContent.trim() !== a.textContent.trim()) return;
    const text = a.textContent.trim();
    const img = document.createElement('img');
    img.src = `${window.hlx.codeBasePath}${url.pathname}`;
    img.alt = text.includes('/icons/') ? '' : text;
    img.loading = 'lazy';
    a.replaceWith(img);
  });
}

function decorateButtons(main) {
  main.querySelectorAll('p a[href]').forEach((a) => {
    a.title = a.title || a.textContent;
    const p = a.closest('p');
    const text = a.textContent.trim();
    if (a.querySelector('img') || p.textContent.trim() !== text) return;
    try { if (new URL(a.href).href === new URL(text, window.location).href) return; } catch {}
    const strong = a.closest('strong');
    const em = a.closest('em');
    if (!strong && !em) return;
    p.className = 'button-wrapper';
    a.className = 'button';
    if (strong && em) { a.classList.add('accent'); const outer = strong.contains(em) ? strong : em; outer.replaceWith(a); }
    else if (strong) { a.classList.add('primary'); strong.replaceWith(a); }
    else { a.classList.add('secondary'); em.replaceWith(a); }
  });
}

export function decorateMain(main) {
  decorateIcons(main);
  decorateImageLinks(main);
  buildAutoBlocks(main);
  decorateSections(main);
  decorateBlocks(main);
  decorateButtons(main);
}

const TEMPLATES = ['blog-post'];

/**
 * Loads /templates/{name}/{name}.css|js when the page has a known `template` metadata
 * and lets the template decorate the (already decorated) main element.
 * @param {Element} main
 */
async function loadTemplate(main) {
  const name = toClassName(getMetadata('template'));
  if (!TEMPLATES.includes(name)) return;
  try {
    const base = `${window.hlx.codeBasePath}/templates/${name}/${name}`;
    const [mod] = await Promise.all([import(`${base}.js`), loadCSS(`${base}.css`)]);
    if (mod.default) await mod.default(main);
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(`failed to load template ${name}`, e);
  }
}

async function loadEager(doc) {
  document.documentElement.lang = getLocale() || 'en';
  decorateTemplateAndTheme();
  const main = doc.querySelector('main');
  if (main) {
    decorateMain(main);
    await loadTemplate(main);
    document.body.classList.add('appear');
    await loadSection(main.querySelector('.section'), waitForFirstImage);
  }
  try { if (window.innerWidth >= 900 || sessionStorage.getItem('fonts-loaded')) loadFonts(); } catch (e) {}
}

async function loadLazy(doc) {
  loadHeader(doc.querySelector('header'));
  const main = doc.querySelector('main');
  await loadSections(main);
  const { hash } = window.location;
  const element = hash ? doc.getElementById(hash.substring(1)) : false;
  if (hash && element) element.scrollIntoView();
  loadFooter(doc.querySelector('footer'));
  loadCSS(`${window.hlx.codeBasePath}/styles/lazy-styles.css`);
  loadFonts();
}

function loadDelayed() {
  window.setTimeout(() => import('./delayed.js'), 3000);
}

async function loadPage() {
  await loadEager(document);
  await loadLazy(document);
  loadDelayed();
}

loadPage();
