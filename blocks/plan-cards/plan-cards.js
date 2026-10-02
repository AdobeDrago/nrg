import { localePrefix } from '../../scripts/locale.js';

const RATE = /^\$|\d\s*(cents|¢)|\/\s*kwh/i;
const TERM = /\b\d+[\s-]*(month|mo|year|yr)s?\b|\bterm\b/i;
const DATA_PATH = '/data/plans.json?sheet=zips&sheet=plans';

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
  if (badge) {
    row.classList.add('featured');
    cell.dataset.badge = badge;
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
      cell.dataset.badge = 'Best Value';
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
      cta.append(buttonLink(link.href, link.textContent.trim() || 'Choose this plan'));
      card.append(cta);
    }

    cell.replaceChildren(card);
  });
}

function matchesZip(value, zip) {
  return String(value || '').split(',').map((z) => z.trim()).some((z) => z === '*' || z === zip);
}

function termLabel(plan) {
  const months = parseInt(plan.termMonths, 10);
  if (!months) return 'Month to month';
  const type = (plan.planType || 'fixed').toLowerCase();
  return `${months}-month ${type} term`;
}

function buildDataCard(plan) {
  const card = document.createElement('div');
  card.className = 'plan-card';
  card.append(el('plan-name', plan.planName, 'h3'));
  if (plan.priceKwh) card.append(el('plan-rate', `${plan.priceKwh} cents/kWh`));
  card.append(el('plan-term', termLabel(plan)));
  if (plan.provider) card.append(el('plan-provider', plan.provider));
  if (plan.highlight) card.append(el('plan-desc', plan.highlight));

  const facts = [];
  if (plan.monthlyEst1000) facts.push(`Est. $${plan.monthlyEst1000}/mo at 1,000 kWh`);
  if (parseInt(plan.renewablePct, 10) > 0) facts.push(`${plan.renewablePct}% renewable`);
  if (facts.length) card.append(el('plan-facts', facts.join(' · ')));

  const cta = el('plan-cta', '');
  const enroll = safeHref(plan.enrollUrl);
  if (enroll) cta.append(buttonLink(enroll, 'Choose this plan'));
  const efl = safeHref(plan.eflUrl);
  if (efl) {
    const link = buttonLink(efl, 'Electricity Facts Label', 'plan-efl');
    link.target = '_blank';
    link.rel = 'noopener';
    cta.append(link);
  }
  if (cta.children.length) card.append(cta);
  return card;
}

function renderEmpty(block, zip) {
  const intro = document.createElement('div');
  intro.className = 'plan-cards-intro plan-cards-empty';
  intro.append(el('', 'Sorry we currently do not offer residential electricity products in your area.', 'h2'));
  const p = el('', `We couldn't find plans for ZIP ${zip}. `, 'p');
  const retry = document.createElement('a');
  retry.href = `${localePrefix()}/`;
  retry.textContent = 'Try another ZIP code';
  p.append(retry);
  intro.append(p);
  block.replaceChildren(intro);
}

function renderPlans(block, zip, zipInfo, plans) {
  const intro = block.querySelector(':scope > div');
  const heading = intro?.querySelector('h1, h2, h3');
  const title = zipInfo?.headline || `Electricity Plans for ZIP ${zip}`;
  const introCell = document.createElement('div');
  introCell.className = 'plan-cards-intro';
  introCell.append(el('', title, 'h2'));
  const lead = [...(intro?.querySelectorAll('p') || [])].find((p) => p.textContent.trim() && p !== heading);
  if (lead) introCell.append(el('', lead.textContent.trim(), 'p'));
  const rows = plans.map((plan) => wrapRow(buildDataCard(plan), plan.badge));
  block.replaceChildren(introCell, ...rows);
}

async function loadData() {
  const resp = await fetch(`${localePrefix()}${DATA_PATH}`);
  if (!resp.ok) throw new Error(`plans data ${resp.status}`);
  const json = await resp.json();
  return { zips: json.zips?.data || [], plans: json.plans?.data || [] };
}

export default async function decorate(block) {
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

  const zipInfo = data.zips.find((row) => matchesZip(row.zip, zip));
  const plans = data.plans
    .filter((plan) => plan.planName && matchesZip(plan.zip, zip))
    .sort((a, b) => (parseFloat(a.sort) || 0) - (parseFloat(b.sort) || 0));

  if (!plans.length) renderEmpty(block, zip);
  else renderPlans(block, zip, zipInfo, plans);
}
