const RATE = /^\$|\d\s*(cents|¢)|\/\s*kwh/i;
const TERM = /\b\d+[\s-]*(month|mo|year|yr)s?\b|\bterm\b/i;

function el(className, text) {
  const div = document.createElement('div');
  div.className = className;
  div.textContent = text;
  return div;
}

export default function decorate(block) {
  const [intro, ...rows] = block.querySelectorAll(':scope > div');
  intro?.classList.add('plan-cards-intro');

  rows.forEach((row, i) => {
    const cell = row.querySelector(':scope > div');
    if (!cell) return;
    row.classList.add('plan-cards-row');
    if (i === 0) row.classList.add('featured');

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
      const cta = document.createElement('div');
      cta.className = 'plan-cta';
      const a = document.createElement('a');
      a.href = link.href;
      a.className = 'plan-button';
      a.textContent = link.textContent.trim() || 'Choose this plan';
      cta.append(a);
      card.append(cta);
    }

    cell.replaceChildren(card);
  });
}
