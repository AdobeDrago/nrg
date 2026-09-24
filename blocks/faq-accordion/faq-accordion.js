export default function decorate(block) {
  block.classList.add('faq-accordion-block');
  const items = block.querySelectorAll(':scope > div > div');
  items.forEach((item) => {
    const heading = item.querySelector('h3');
    const content = item.querySelector('p');
    if (heading && content) {
      const wrapper = document.createElement('details');
      const summary = document.createElement('summary');
      summary.textContent = heading.textContent;
      wrapper.append(summary);
      content.remove();
      // Move any remaining content
      item.querySelectorAll('p, ul, ol').forEach((el) => wrapper.append(el));
      item.innerHTML = '';
      item.append(wrapper);
    }
  });
}
