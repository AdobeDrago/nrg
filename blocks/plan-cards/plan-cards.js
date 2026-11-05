import { createOptimizedPicture } from '../../scripts/aem.js';
import { localePrefix } from '../../scripts/locale.js';

const RATE = /^\$|\d\s*(cents|¢)|\/\s*kwh/i;
const TERM = /\b\d+[\s-]*(month|mo|year|yr)s?\b|\bterm\b/i;
const DATA_PATH = '/data/plans.json?sheet=zips&sheet=plans';

// UI text by locale; the root site uses English
const LABELS = {
  en: {
    bestValue: 'Best Value',
    choose: 'Choose this plan',
    efl: 'Electricity Facts Label',
    filter: 'Filter plans',
    allPlans: 'All plans',
    count: (n) => `${n} plan${n === 1 ? '' : 's'}`,
    rate: (price) => `${price} cents/kWh`,
    monthToMonth: 'Month to month',
    term: (months, type) => `${months}-month ${type} term`,
    types: { fixed: 'fixed', variable: 'variable', indexed: 'indexed' },
    estimate: (amount) => `Est. $${amount}/mo at 1,000 kWh`,
    renewable: (pct) => `${pct}% renewable`,
    title: (zip) => `Electricity Plans for ZIP ${zip}`,
    home: 'Home',
    sorry: 'Sorry we currently do not offer residential electricity products in your area.',
    areas: ['Go to our ', 'Areas of Service', ' page to see which areas are covered.'],
  },
  es: {
    bestValue: 'Mejor relación calidad-precio',
    choose: 'Elegir este plan',
    efl: 'Etiqueta de datos de electricidad',
    filter: 'Filtrar planes',
    allPlans: 'Todos los planes',
    count: (n) => `${n} ${n === 1 ? 'plan' : 'planes'}`,
    rate: (price) => `${price} centavos/kWh`,
    monthToMonth: 'Mes a mes',
    term: (months, type) => `Tarifa ${type} por ${months} meses`,
    types: { fixed: 'fija', variable: 'variable', indexed: 'indexada' },
    estimate: (amount) => `Aprox. $${amount}/mes con 1,000 kWh`,
    renewable: (pct) => `${pct}% renovable`,
    title: (zip) => `Planes de electricidad para el código postal ${zip}`,
    home: 'Inicio',
    sorry: 'Lo sentimos, actualmente no ofrecemos productos de electricidad residencial en tu área.',
    areas: ['Visita nuestra página de ', 'Áreas de servicio', ' para ver qué áreas cubrimos.'],
  },
};
const LANG = LABELS[localePrefix().slice(1)] ? localePrefix().slice(1) : 'en';
const T = LABELS[LANG];

// brand details from everythingenergy.com's embedded plansData
const BRANDS = {
  RE: {
    name: 'Reliant',
    hours: { en: 'Available 24 hours everyday', es: 'Disponible las 24 horas, todos los días' },
    match: /reliant/i,
  },
  CE: {
    name: 'Cirro Energy',
    hours: { en: 'Daily 7 a.m. - 10 p.m. CST', es: 'Todos los días, de 7 a. m. a 10 p. m. CST' },
    match: /cirro/i,
  },
  PW: {
    name: 'Discount Power',
    hours: { en: 'Weekdays, 8 a.m. - 5 p.m. CST', es: 'Días laborables, de 8 a. m. a 5 p. m. CST' },
    match: /discount/i,
  },
  GM: {
    name: 'Green Mountain Energy',
    hours: { en: 'Weekdays 7 a.m. – 10 p.m. CT', es: 'Días laborables, de 7 a. m. a 10 p. m. CT' },
    match: /green mountain/i,
  },
  DE: {
    name: 'Direct Energy',
    hours: {
      en: 'Monday – Saturday, 7:30 a.m. – 8:00 p.m. CT',
      es: 'Lunes a sábado, de 7:30 a. m. a 8:00 p. m. CT',
    },
    match: /direct/i,
  },
};
const BRAND_PHONE = '877-241-9360';
const LOGO_WIDTH = '260'; // shown at up to 130px wide; 2x for high-density screens

/**
 * Takes the authored provider logos out of the block: any row holding only images.
 * Each image's alt text names its provider (e.g. "Reliant"), matched like plan.provider.
 * @returns {Map<object, string>} brand -> logo image URL
 */
function takeLogos(block) {
  const logos = new Map();
  [...block.querySelectorAll(':scope > div')]
    .filter((row) => row.querySelector('img') && !row.textContent.trim())
    .forEach((row) => {
      row.querySelectorAll('img').forEach((img) => {
        const brand = Object.values(BRANDS).find((b) => b.match.test(img.alt));
        if (brand && !logos.has(brand)) logos.set(brand, img.getAttribute('src'));
      });
      row.remove();
    });
  return logos;
}

function el(className, text, tag = 'div') {
  const node = document.createElement(tag);
  if (className) node.className = className;
  node.textContent = text;
  return node;
}

function safeHref(url) {
  if (!url) return '';
  try {
    const parsed = new URL(url, window.location.href);
    return ['http:', 'https:'].includes(parsed.protocol) ? parsed.href : '';
  } catch {
    return '';
  }
}

function buttonLink(href, text, className = 'plan-button') {
  const a = document.createElement('a');
  a.href = href;
  a.className = className;
  a.textContent = text;
  return a;
}

function wrapRow(card, badge) {
  const row = document.createElement('div');
  row.className = 'plan-cards-row';
  const cell = document.createElement('div');
  if (badge?.trim()) {
    row.classList.add('featured');
    cell.dataset.badge = badge.trim();
  }
  cell.append(card);
  row.append(cell);
  return row;
}

/** Turns an authored card cell into structured card markup. */
function decorateAuthored(block) {
  const [intro, ...rows] = block.querySelectorAll(':scope > div');
  intro?.classList.add('plan-cards-intro');

  rows.forEach((row, i) => {
    const cell = row.querySelector(':scope > div');
    if (!cell) return;
    row.classList.add('plan-cards-row');
    if (i === 0) {
      row.classList.add('featured');
      cell.dataset.badge = T.bestValue;
    }

    const card = document.createElement('div');
    card.className = 'plan-card';
    const heading = cell.querySelector('h2, h3, h4');
    if (heading) card.append(el('plan-name', heading.textContent.trim()));

    const link = cell.querySelector('a');
    const extras = [];
    cell.querySelectorAll('p').forEach((p) => {
      const text = p.textContent.trim();
      if (!text || p.querySelector('a')) return;
      if (!card.querySelector('.plan-rate') && RATE.test(text)) card.append(el('plan-rate', text));
      else if (!card.querySelector('.plan-term') && TERM.test(text)) card.append(el('plan-term', text));
      else extras.push(text);
    });

    // first remaining line is the provider, the rest describe the plan
    const [provider, ...desc] = extras;
    if (provider) card.append(el('plan-provider', provider));
    desc.forEach((text) => card.append(el('plan-desc', text)));

    if (link) {
      const cta = el('plan-cta', '');
      cta.append(buttonLink(link.href, link.textContent.trim() || T.choose));
      card.append(cta);
    }

    cell.replaceChildren(card);
  });
}

function tokens(value) {
  return String(value || '').split(',').map((v) => v.trim().toLowerCase()).filter(Boolean);
}

/**
 * A plan's zip column lists `*`, ZIPs, or region keys (the ZIP row's state or utility),
 * so one row can cover every TX ZIP or one TDSP territory.
 */
function matchesZip(value, zip, zipInfo) {
  const keys = [zip, zipInfo?.state, zipInfo?.utility]
    .filter(Boolean)
    .map((k) => k.trim().toLowerCase());
  return tokens(value).some((v) => v === '*' || keys.includes(v));
}

function brandOf(plan) {
  return BRANDS[String(plan.brand || '').trim().toUpperCase()]
    || Object.values(BRANDS).find((b) => b.match.test(plan.provider || ''));
}

function focusTags(plan) {
  return String(plan.searchFocus || '').split(',').map((t) => t.trim()).filter(Boolean);
}

function termLabel(plan) {
  const months = parseInt(plan.termMonths, 10);
  if (!months) return T.monthToMonth;
  // the sheets name plan types in either language ("fixed", "fijado")
  const raw = String(plan.planType || 'fixed').trim().toLowerCase();
  let key = raw;
  if (raw.startsWith('fix') || raw.startsWith('fij')) key = 'fixed';
  else if (raw.startsWith('variab')) key = 'variable';
  else if (raw.startsWith('index')) key = 'indexed';
  return T.term(months, T.types[key] || raw);
}

function buildDataCard(plan, logos) {
  const card = document.createElement('div');
  card.className = 'plan-card';
  const brand = brandOf(plan);
  if (brand && logos.has(brand)) {
    const breakpoints = [{ width: LOGO_WIDTH }];
    const picture = createOptimizedPicture(logos.get(brand), brand.name, false, breakpoints);
    const logo = picture.querySelector('img');
    logo.className = 'plan-logo';
    logo.width = 130;
    logo.height = 64;
    card.append(picture);
  }
  card.append(el('plan-name', plan.planName, 'h3'));
  if (plan.priceKwh) card.append(el('plan-rate', T.rate(String(plan.priceKwh).trim())));
  card.append(el('plan-term', termLabel(plan)));
  if (plan.provider) card.append(el('plan-provider', plan.provider));
  if (plan.highlight) card.append(el('plan-desc', plan.highlight));

  const facts = [];
  const estimate = String(plan.monthlyEst1000 || '').trim();
  if (estimate) facts.push(T.estimate(estimate));
  const renewable = String(plan.renewablePct || '').trim();
  if (parseInt(renewable, 10) > 0) facts.push(T.renewable(renewable));
  if (facts.length) card.append(el('plan-facts', facts.join(' · ')));
  const tags = focusTags(plan);
  if (tags.length) {
    const ul = document.createElement('ul');
    ul.className = 'plan-tags';
    tags.forEach((tag) => ul.append(el('', tag, 'li')));
    card.append(ul);
  }

  const cta = el('plan-cta', '');
  const enroll = safeHref(plan.enrollUrl);
  if (enroll) cta.append(buttonLink(enroll, T.choose));
  const efl = safeHref(plan.eflUrl);
  if (efl) {
    const link = buttonLink(efl, T.efl, 'plan-efl');
    link.target = '_blank';
    link.rel = 'noopener';
    cta.append(link);
  }
  if (cta.children.length) card.append(cta);
  if (brand) {
    const contact = el('plan-contact', '');
    const tel = document.createElement('a');
    tel.href = `tel:1-${BRAND_PHONE}`;
    tel.textContent = BRAND_PHONE;
    contact.append(tel, el('', brand.hours[LANG] || brand.hours.en, 'span'));
    card.append(contact);
  }
  return card;
}

/** searchFocus chips: single-select filter over the rendered cards. */
function buildFilters(rows, plans) {
  const all = [...new Set(plans.flatMap(focusTags))].sort();
  if (all.length < 2) return null;
  const bar = document.createElement('div');
  bar.className = 'plan-cards-filters';
  bar.setAttribute('role', 'group');
  bar.setAttribute('aria-label', T.filter);
  const status = el('plan-cards-count', '');
  status.setAttribute('aria-live', 'polite');
  const apply = (tag) => {
    let shown = 0;
    rows.forEach((row, i) => {
      const hit = !tag || focusTags(plans[i]).includes(tag);
      row.hidden = !hit;
      if (hit) shown += 1;
    });
    status.textContent = T.count(shown);
    bar.querySelectorAll('button').forEach((b) => b.setAttribute('aria-pressed', String((b.dataset.tag || '') === (tag || ''))));
  };
  ['', ...all].forEach((tag) => {
    const btn = el('', tag || T.allPlans, 'button');
    btn.type = 'button';
    if (tag) btn.dataset.tag = tag;
    btn.addEventListener('click', () => apply(btn.getAttribute('aria-pressed') === 'true' ? '' : tag));
    bar.append(btn);
  });
  bar.append(status);
  apply('');
  return bar;
}

/** No plans for the ZIP: the original's hero-pending-results (back home, apology, areas link). */
function renderEmpty(block) {
  block.classList.add('no-results');
  const hero = document.createElement('div');
  hero.className = 'plan-cards-pending';

  const back = document.createElement('a');
  back.className = 'plan-cards-back';
  back.href = `${localePrefix()}/`;
  back.innerHTML = '<i class="ico-back-top" aria-hidden="true"></i>';
  back.append(T.home);

  const text = el('plan-cards-pending-text', '');
  text.append(el('', T.sorry, 'h1'));
  const intro = el('plan-cards-pending-intro', '');
  const [lead, linkText, tail] = T.areas;
  const p = el('', lead, 'p');
  const areas = document.createElement('a');
  areas.href = `${localePrefix()}/areas-of-service/`;
  areas.textContent = linkText;
  p.append(areas, tail);
  intro.append(p);
  text.append(intro);

  hero.append(back, text);
  block.replaceChildren(hero);
}

function renderPlans(block, zip, zipInfo, plans, logos) {
  const intro = block.querySelector(':scope > div');
  const heading = intro?.querySelector('h1, h2, h3');
  const title = zipInfo?.headline || T.title(zip);
  const introCell = document.createElement('div');
  introCell.className = 'plan-cards-intro';
  introCell.append(el('', title, 'h2'));
  const lead = [...(intro?.querySelectorAll('p') || [])].find((p) => p.textContent.trim() && p !== heading);
  if (lead) introCell.append(el('', lead.textContent.trim(), 'p'));
  const rows = plans.map((plan) => wrapRow(buildDataCard(plan, logos), plan.badge));
  const filters = buildFilters(rows, plans);
  block.replaceChildren(introCell, ...(filters ? [filters] : []), ...rows);
}

async function loadData() {
  const resp = await fetch(`${localePrefix()}${DATA_PATH}`);
  if (!resp.ok) throw new Error(`plans data ${resp.status}`);
  const json = await resp.json();
  return { zips: json.zips?.data || [], plans: json.plans?.data || [] };
}

export default async function decorate(block) {
  const logos = takeLogos(block);
  const zip = new URLSearchParams(window.location.search).get('zip')?.trim();
  if (!zip || !/^\d{5}$/.test(zip)) {
    decorateAuthored(block);
    return;
  }

  let data;
  try {
    data = await loadData();
  } catch {
    // data source unavailable: keep the authored plans
    decorateAuthored(block);
    return;
  }

  const zipInfo = data.zips.find((row) => tokens(row.zip).includes(zip));
  const plans = data.plans
    .filter((plan) => plan.planName && matchesZip(plan.zip, zip, zipInfo))
    .sort((a, b) => (parseFloat(a.sort) || 0) - (parseFloat(b.sort) || 0));

  if (!plans.length) renderEmpty(block);
  else renderPlans(block, zip, zipInfo, plans, logos);
}
