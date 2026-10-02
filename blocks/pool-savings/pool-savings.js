export default function decorate(block) {
  const [intro, ...tips] = block.querySelectorAll(':scope > div');
  intro?.classList.add('pool-savings-intro');
  tips.forEach((tip) => {
    tip.classList.add('pool-savings-tip');
    const last = tip.querySelector('p:last-of-type');
    if (last && /^save\b/i.test(last.textContent.trim())) last.classList.add('savings-highlight');
  });
}
