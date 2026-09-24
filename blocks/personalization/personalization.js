export default function decorate(block) {
  block.classList.add('personalization-block');

  // First row = heading + personalized intro
  const rows = block.querySelectorAll(':scope > div');
  if (rows.length > 0) {
    const firstCell = rows[0].querySelector('div');
    if (firstCell) {
      firstCell.classList.add('personalization-header');
    }
  }

  // Second row = ZIP + pool badges
  if (rows.length > 1) {
    const badgeCell = rows[1].querySelector('div');
    if (badgeCell) {
      const badges = document.createElement('div');
      badges.className = 'pzn-badges';

      const text = badgeCell.textContent;
      // Split on commas or "and"
      const parts = text.split(/,| and /).map(s => s.trim()).filter(s => s);

      parts.forEach((part) => {
        const badge = document.createElement('span');
        badge.className = 'pzn-badge';
        badge.textContent = part;
        badges.appendChild(badge);
      });

      badgeCell.innerHTML = '';
      badgeCell.appendChild(badges);
    }
  }

  // Third row = recommendation heading
  if (rows.length > 2) {
    const recCell = rows[2].querySelector('div');
    if (recCell) {
      recCell.classList.add('pzn-recommendation');
    }
  }
}
