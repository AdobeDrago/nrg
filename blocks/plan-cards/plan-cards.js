export default function decorate(block) {
  block.classList.add('plan-cards-block');

  // Find all plan rows (every row after the first which is the heading)
  const rows = block.querySelectorAll(':scope > div:not(:first-child)');
  rows.forEach((row) => {
    const cell = row.querySelector('div');
    if (cell) {
      // Find the plan name (h3) and details
      const h3 = cell.querySelector('h3');
      const details = cell.querySelectorAll('p');

      // Build a structured card
      const card = document.createElement('div');
      card.className = 'plan-card';

      if (h3) {
        const name = document.createElement('div');
        name.className = 'plan-name';
        name.textContent = h3.textContent;
        card.appendChild(name);
      }

      // Extract rate, term, details from paragraphs
      details.forEach((p) => {
        const text = p.textContent.trim();
        if (!text) return;

        if (text.match(/^\$|cents|¢|kWh|rate|price/i)) {
          const rate = document.createElement('div');
          rate.className = 'plan-rate';
          rate.textContent = text;
          card.appendChild(rate);
        } else if (text.match(/month|year|term|fixed|variable/i)) {
          const term = document.createElement('div');
          term.className = 'plan-term';
          term.textContent = text;
          card.appendChild(term);
        } else if (text.match(/pool|renewable|green|free|night|weekend/i)) {
          const tag = document.createElement('div');
          tag.className = 'plan-tag';
          tag.textContent = text;
          card.appendChild(tag);
        } else {
          const desc = document.createElement('div');
          desc.className = 'plan-desc';
          desc.textContent = text;
          card.appendChild(desc);
        }
      });

      // Find any links and make them CTA buttons
      const links = cell.querySelectorAll('a');
      if (links.length > 0) {
        const cta = document.createElement('div');
        cta.className = 'plan-cta';
        const link = document.createElement('a');
        link.href = links[0].href;
        link.textContent = 'Choose this plan';
        link.className = 'plan-button';
        cta.appendChild(link);
        card.appendChild(cta);
      }

      cell.innerHTML = '';
      cell.appendChild(card);
    }
  });
}
