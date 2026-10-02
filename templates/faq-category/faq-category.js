import { toClassName } from '../../scripts/aem.js';
import { localePrefix } from '../../scripts/locale.js';

const BACK_ICON = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 11H7.8l5.6-5.6L12 4l-8 8 8 8 1.4-1.4L7.8 13H20z"/></svg>';
const UP_ICON = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M13 20V7.8l5.6 5.6L20 12l-8-8-8 8 1.4 1.4L11 7.8V20z"/></svg>';
const CHEVRON = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7.4 8.6 12 13.2l4.6-4.6L18 10l-6 6-6-6z"/></svg>';

function pill(a, icon, className) {
  a.className = className;
  a.removeAttribute('title');
  const label = document.createElement('span');
  label.append(...a.childNodes);
  a.innerHTML = icon;
  a.append(label);
  return a;
}

/** h1 + the authored category list (ul right after the h1) -> title with dropdown. */
function buildTitle(h1, list) {
  const head = document.createElement('div');
  head.className = 'faq-category-head';
  h1.replaceWith(head);
  head.append(h1);
  if (!list) return head;
  const id = 'faq-category-menu';
  list.id = id;
  list.className = 'faq-category-menu';
  list.hidden = true;
  const here = window.location.pathname.replace(/\/$/, '');
  list.querySelectorAll('a').forEach((a) => {
    if (new URL(a.href).pathname.replace(/\/$/, '') === here) a.setAttribute('aria-current', 'page');
  });
  const toggle = document.createElement('button');
  toggle.type = 'button';
  toggle.className = 'faq-category-toggle';
  toggle.setAttribute('aria-expanded', 'false');
  toggle.setAttribute('aria-controls', id);
  toggle.setAttribute('aria-label', 'Show all FAQ categories');
  toggle.innerHTML = CHEVRON;
  const setOpen = (open) => {
    toggle.setAttribute('aria-expanded', String(open));
    list.hidden = !open;
  };
  toggle.addEventListener('click', () => setOpen(list.hidden));
  head.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !list.hidden) { setOpen(false); toggle.focus(); }
  });
  document.addEventListener('click', (e) => { if (!head.contains(e.target)) setOpen(false); });
  head.append(toggle, list);
  return head;
}

/** Splits the remaining content into one article per h2 question. */
function buildItems(nodes) {
  const items = [];
  nodes.forEach((node) => {
    if (node.tagName === 'H2') {
      const item = document.createElement('article');
      item.className = 'faq-category-item';
      const used = new Set(items.map((i) => i.id));
      let id = toClassName(node.textContent) || 'faq';
      for (let n = 2; used.has(id); n += 1) id = `${toClassName(node.textContent)}-${n}`;
      item.id = id;
      item.append(node);
      items.push(item);
    } else if (items.length) {
      items[items.length - 1].append(node);
    }
  });
  return items;
}

function buildNav(items) {
  const nav = document.createElement('nav');
  nav.className = 'faq-category-nav';
  nav.setAttribute('aria-label', 'Questions in this category');
  const ul = document.createElement('ul');
  const links = items.map((item) => {
    const a = document.createElement('a');
    a.href = `#${item.id}`;
    a.textContent = item.querySelector('h2').textContent.trim();
    const li = document.createElement('li');
    li.append(a);
    ul.append(li);
    return a;
  });
  nav.append(ul);
  const select = (a) => links.forEach((l) => l.classList.toggle('selected', l === a));
  let ticking = false;
  const update = () => {
    ticking = false;
    const line = window.innerHeight * 0.3;
    let current = 0;
    items.forEach((item, i) => { if (item.getBoundingClientRect().top <= line) current = i; });
    select(links[current]);
  };
  window.addEventListener('scroll', () => {
    if (!ticking) { ticking = true; requestAnimationFrame(update); }
  }, { passive: true });
  update();
  return nav;
}

/**
 * FAQ category layout (everythingenergy.com /faq-category/*): "All FAQs" back pill,
 * category title with a dropdown of all categories, sticky question nav on the left and
 * the full question/answer list on the right, then "Back to top".
 * Authoring: [link-only p "All FAQs"] h1, ul of category links, then h2 + body per question.
 * @param {Element} main decorated main element
 */
export default function decorate(main) {
  const section = main.querySelector('.section');
  const content = section?.querySelector('.default-content-wrapper');
  const h1 = content?.querySelector('h1');
  if (!h1) return;
  section.classList.add('faq-category-article');

  const first = content.firstElementChild;
  let back = first !== h1 && first?.tagName === 'P' && first.children.length === 1 ? first.querySelector(':scope > a') : null;
  if (back && first.textContent.trim() === back.textContent.trim()) {
    first.remove();
  } else {
    back = document.createElement('a');
    back.href = `${localePrefix()}/faqs`;
    back.textContent = 'All FAQs';
  }
  section.prepend(pill(back, BACK_ICON, 'faq-category-back'));

  const list = h1.nextElementSibling?.tagName === 'UL' ? h1.nextElementSibling : null;
  const head = buildTitle(h1, list);
  const rest = [...content.children].filter((el) => el !== head);
  const items = buildItems(rest);

  const body = document.createElement('div');
  body.className = 'faq-category-body';
  const listWrap = document.createElement('div');
  listWrap.className = 'faq-category-list';
  listWrap.append(...items);
  if (items.length) body.append(buildNav(items));
  body.append(listWrap);

  const top = document.createElement('a');
  top.href = '#';
  top.textContent = 'Back to top';
  top.addEventListener('click', (e) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
  const topWrap = document.createElement('p');
  topWrap.className = 'faq-category-top';
  topWrap.append(pill(top, UP_ICON, 'faq-category-back'));
  listWrap.append(topWrap);
  content.append(body);
}
