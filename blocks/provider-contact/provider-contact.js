/**
 * Provider contact band: eyebrow heading, copy and a "Call us at" line.
 */
export default function decorate(block) {
  const content = block.querySelector(':scope > div > div');
  if (content) block.replaceChildren(...content.children);
}
