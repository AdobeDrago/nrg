/**
 * "How to pick the right plan": optional title row, an illustration row, then one row per
 * step (icon | bold step title + copy).
 */
export default function decorate(block) {
  const steps = document.createElement('div');
  steps.className = 'choice-guide-steps';
  const content = document.createElement('div');
  content.className = 'choice-guide-content';
  let title;

  [...block.children].forEach((row) => {
    const cells = [...row.children];
    const img = row.querySelector('picture, img');
    if (!img && row.querySelector('h1, h2, h3')) {
      title = document.createElement('div');
      title.className = 'choice-guide-title';
      title.append(...row.querySelectorAll(':scope > div > *'));
    } else if (cells.length === 1 && img) {
      const media = document.createElement('div');
      media.className = 'choice-guide-image';
      media.append(img);
      content.append(media);
    } else {
      const step = document.createElement('div');
      step.className = 'choice-guide-step';
      const icon = document.createElement('div');
      icon.className = 'choice-guide-icon';
      if (img) icon.append(img);
      const summary = document.createElement('div');
      summary.className = 'choice-guide-summary';
      cells.forEach((cell) => [...cell.children].forEach((el) => {
        if (el.textContent.trim()) summary.append(el);
      }));
      step.append(icon, summary);
      steps.append(step);
    }
  });
  content.append(steps);
  block.replaceChildren(...(title ? [title] : []), content);
}
