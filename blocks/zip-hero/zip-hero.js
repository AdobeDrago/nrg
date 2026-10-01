const ICONS = {
  yes: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 5h11v10H3zM14 9h4l3 3v3h-7zM6.5 18.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zm11 0a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z"/></svg>',
  no: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 11l9-7 9 7v9h-6v-6H9v6H3z"/></svg>',
};

function buildMovingToggle(label, input) {
  const wrapper = document.createElement('fieldset');
  wrapper.className = 'zip-moving';
  const legend = document.createElement('legend');
  legend.textContent = label;
  wrapper.append(legend);
  const options = document.createElement('div');
  options.className = 'zip-moving-options';
  ['yes', 'no'].forEach((value) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = `zip-moving-option moving-${value}`;
    btn.setAttribute('aria-pressed', 'false');
    btn.innerHTML = `${ICONS[value]}<span>${value === 'yes' ? 'Yes' : 'No'}</span>`;
    btn.addEventListener('click', () => {
      options.querySelectorAll('button').forEach((b) => b.setAttribute('aria-pressed', b === btn ? 'true' : 'false'));
      input.placeholder = value === 'yes' ? 'Enter your new ZIP code' : 'Enter your ZIP code';
    });
    options.append(btn);
  });
  wrapper.append(options);
  return wrapper;
}

export default function decorate(block) {
  const [copyRow, zipRow, movingRow] = block.querySelectorAll(':scope > div');
  copyRow?.classList.add('zip-hero-copy');

  const form = document.createElement('form');
  form.className = 'zip-card';
  form.noValidate = true;

  const zipLabel = zipRow?.textContent.trim() || 'Enter your ZIP code';
  const input = document.createElement('input');
  input.type = 'text';
  input.inputMode = 'numeric';
  input.autocomplete = 'postal-code';
  input.maxLength = 5;
  input.pattern = '[0-9]{5}';
  input.placeholder = zipLabel;
  input.id = 'zip-code-input';
  input.setAttribute('aria-label', '5-digit ZIP code');
  form.append(input);

  const error = document.createElement('p');
  error.className = 'zip-error';
  error.hidden = true;
  error.setAttribute('role', 'alert');
  error.textContent = 'Invalid ZIP code. Please try again.';
  form.append(error);

  if (movingRow) {
    const movingLabel = movingRow.textContent.replace(/\s*Yes\s*No\s*$/i, '').trim();
    form.append(buildMovingToggle(movingLabel || 'Moving to a new address?', input));
  }

  const submit = document.createElement('button');
  submit.type = 'submit';
  submit.className = 'zip-submit';
  submit.textContent = 'View plans';
  form.append(submit);

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const zip = input.value.trim();
    if (/^\d{5}$/.test(zip)) {
      error.hidden = true;
      window.location.href = `/plans?zip=${zip}`;
    } else {
      error.hidden = false;
      input.focus();
    }
  });

  const cardRow = document.createElement('div');
  cardRow.className = 'zip-hero-form';
  cardRow.append(form);
  zipRow?.remove();
  movingRow?.remove();
  block.prepend(cardRow);
}
