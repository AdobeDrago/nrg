/* Filter the static block catalog; the complete guide also works without JavaScript. */
const filter = document.querySelector('#block-filter');
const entries = [...document.querySelectorAll('.block-entry')];
const count = document.querySelector('#block-count');
const links = [...document.querySelectorAll('.catalog-index a')];

function filterBlocks() {
  const query = filter.value.trim().toLowerCase();
  let shown = 0;
  entries.forEach((entry, index) => {
    const matches = entry.textContent.toLowerCase().includes(query);
    entry.hidden = !matches;
    if (links[index]) links[index].hidden = !matches;
    if (matches) shown += 1;
  });
  count.textContent = `${shown} of ${entries.length} blocks${shown ? '' : ' — try another search'}`;
}

filter.addEventListener('input', filterBlocks);
window.addEventListener('hashchange', () => {
  // Links elsewhere in the guide must still reveal blocks hidden by a filter.
  const entry = entries.find((item) => `#${item.id}` === window.location.hash);
  if (entry?.hidden) {
    filter.value = '';
    filterBlocks();
    entry.scrollIntoView();
  }
});
