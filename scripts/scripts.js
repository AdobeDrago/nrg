import {
  loadHeader, loadFooter, decorateIcons, decorateSections, decorateBlocks,
  decorateTemplateAndTheme, waitForFirstImage, loadSection, loadSections, loadCSS,
} from './aem.js';

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

function decorateMain(main) {
  decorateIcons(main);
  buildAutoBlocks(main);
  decorateSections(main);
  decorateBlocks(main);
  decorateButtons(main);
}

async function loadEager(doc) {
  document.documentElement.lang = 'en';
  decorateTemplateAndTheme();
  const main = doc.querySelector('main');
  if (main) {
    decorateMain(main);
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
