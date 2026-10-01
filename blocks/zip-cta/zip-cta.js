import buildZipForm from '../../scripts/zip-form.js';

export default async function decorate(block) {
  const content = block.querySelector(':scope > div > div') || block;
  // the authored CTA link is replaced by the ZIP card's "View plans" submit
  content.querySelector('a')?.closest('p')?.remove();
  content.classList.add('zip-cta-content');
  content.append(await buildZipForm());
}
