import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

const ICONS = {
  phone: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6.6 10.8a15.1 15.1 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.25 11.4 11.4 0 0 0 3.6.57 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.45.57 3.57a1 1 0 0 1-.25 1z"/><path d="M15 3.5a6 6 0 0 1 5.5 5.5M14.6 6.4a3 3 0 0 1 3 3" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
  menu: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>',
  close: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>',
};

const normalizePath = (path) => path.replace(/\/(index)?$/, '') || '/';

function buildBrand(section) {
  const link = section?.querySelector('a');
  const label = link?.textContent.trim() || 'Everything Energy';
  const brand = document.createElement('a');
  brand.className = 'header-logo';
  brand.href = link?.getAttribute('href') || '/';
  const base = window.hlx.codeBasePath;
  brand.innerHTML = `<img class="logo-color" src="${base}/icons/logo.svg" alt="${label}" width="292" height="33">
    <img class="logo-white" src="${base}/icons/logo-white.svg" alt="${label}" width="292" height="33">`;
  return brand;
}

function buildTools(section) {
  const tools = document.createElement('div');
  tools.className = 'header-tools';
  if (!section) return tools;

  const tel = section.querySelector('a[href^="tel:"]');
  if (tel) {
    const phone = document.createElement('a');
    phone.className = 'header-phone';
    phone.href = tel.getAttribute('href');
    phone.setAttribute('aria-label', `Call ${tel.textContent.trim()}`);
    phone.innerHTML = `${ICONS.phone}<span>${tel.textContent.trim()}</span>`;
    tools.append(phone);
  }

  // list items: first paragraph is the button label, the rest is the popover
  section.querySelectorAll('li').forEach((li, i) => {
    const [label, ...rest] = li.children;
    if (!label || !rest.length) return;
    const wrapper = document.createElement('div');
    wrapper.className = 'header-lang';
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'header-lang-toggle';
    btn.textContent = label.textContent.trim();
    btn.setAttribute('aria-expanded', 'false');
    btn.setAttribute('aria-controls', `header-popover-${i}`);
    const pop = document.createElement('div');
    pop.className = 'header-popover';
    pop.id = `header-popover-${i}`;
    pop.hidden = true;
    pop.append(...rest);
    pop.querySelectorAll('.button').forEach((a) => { a.className = ''; });
    btn.addEventListener('click', () => {
      const open = btn.getAttribute('aria-expanded') !== 'true';
      btn.setAttribute('aria-expanded', open);
      pop.hidden = !open;
    });
    wrapper.addEventListener('focusout', (e) => {
      if (!wrapper.contains(e.relatedTarget)) {
        btn.setAttribute('aria-expanded', 'false');
        pop.hidden = true;
      }
    });
    wrapper.append(btn, pop);
    tools.append(wrapper);
  });
  return tools;
}

function buildMenu(section, header, planLink) {
  const pill = document.createElement('div');
  pill.className = 'header-menu-pill';
  if (planLink) {
    const plan = document.createElement('a');
    plan.className = 'header-plan-link';
    plan.href = planLink.getAttribute('href');
    plan.textContent = planLink.textContent.trim();
    pill.append(plan);
  }
  const toggle = document.createElement('button');
  toggle.type = 'button';
  toggle.className = 'header-menu-toggle';
  toggle.setAttribute('aria-expanded', 'false');
  toggle.setAttribute('aria-controls', 'header-menu');
  toggle.setAttribute('aria-label', 'Open menu');
  toggle.innerHTML = `${ICONS.menu}<span>Menu</span>`;

  const overlay = document.createElement('div');
  overlay.className = 'header-overlay-mask';
  overlay.hidden = true;

  const menu = document.createElement('nav');
  menu.id = 'header-menu';
  menu.className = 'header-menu';
  menu.setAttribute('aria-label', 'Main menu');
  menu.hidden = true;

  const close = document.createElement('button');
  close.type = 'button';
  close.className = 'header-menu-close';
  close.innerHTML = `<span>Close</span>${ICONS.close}`;
  close.setAttribute('aria-label', 'Close menu');
  menu.append(close);

  const list = section?.querySelector('ul');
  if (list) {
    const current = normalizePath(window.location.pathname);
    list.querySelectorAll('a').forEach((a) => {
      a.className = '';
      a.removeAttribute('title');
      if (normalizePath(new URL(a.href, window.location).pathname) === current) {
        a.setAttribute('aria-current', 'page');
      }
    });
    menu.append(list);
  }

  const focusables = () => [...menu.querySelectorAll('a[href], button')];

  const onKeydown = (e) => {
    if (e.key === 'Escape') {
      // eslint-disable-next-line no-use-before-define
      setOpen(false);
    } else if (e.key === 'Tab') {
      const items = focusables();
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  };

  function setOpen(open) {
    toggle.setAttribute('aria-expanded', open);
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    menu.hidden = !open;
    overlay.hidden = !open;
    header.classList.toggle('menu-open', open);
    document.body.style.overflowY = open ? 'hidden' : '';
    if (open) {
      document.addEventListener('keydown', onKeydown);
      (menu.querySelector('ul a') || close).focus();
    } else {
      document.removeEventListener('keydown', onKeydown);
      toggle.focus();
    }
  }

  toggle.addEventListener('click', () => setOpen(toggle.getAttribute('aria-expanded') !== 'true'));
  close.addEventListener('click', () => setOpen(false));
  overlay.addEventListener('click', () => setOpen(false));

  const wrapper = document.createElement('div');
  wrapper.className = 'header-menu-wrapper';
  pill.append(toggle);
  wrapper.append(pill, overlay, menu);
  return wrapper;
}

export default async function decorate(block) {
  const navMeta = getMetadata('nav');
  const navPath = navMeta ? new URL(navMeta, window.location).pathname : '/nav';
  const fragment = await loadFragment(navPath);
  const [brandSection, menuSection, toolsSection] = fragment
    ? fragment.querySelectorAll(':scope > .section') : [];

  const bar = document.createElement('div');
  bar.className = 'header-bar';
  const actions = document.createElement('div');
  actions.className = 'header-actions';
  const planLink = [...(toolsSection?.querySelectorAll('p > a:not([href^="tel:"])') || [])]
    .find((a) => !a.closest('li'));
  planLink?.closest('p').remove();
  actions.append(buildTools(toolsSection), buildMenu(menuSection, block, planLink));
  bar.append(buildBrand(brandSection), actions);

  // header sits on top of the hero gradient on small screens, like the original
  if (document.querySelector('main > .section:first-child .zip-hero')) document.body.classList.add('header-over-hero');

  block.textContent = '';
  block.append(bar);
}
