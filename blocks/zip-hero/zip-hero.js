export default function decorate(block) {
  block.classList.add('zip-hero-block');

  // The block has 3 rows: heading, zip input, moving toggle
  // Row 1: h1 + subtitle
  // Row 2: "Enter your ZIP code" text → build input + submit
  // Row 3: "Moving to a new address? Yes No" → build toggle

  // Find the rows
  const rows = block.querySelectorAll(':scope > div');

  // Build the ZIP input row from row 2
  if (rows.length >= 2) {
    const zipRow = rows[1];
    const zipCell = zipRow.querySelector('div');
    if (zipCell) {
      zipCell.innerHTML = '';
      const wrapper = document.createElement('div');
      wrapper.className = 'zip-input-wrapper';
      const input = document.createElement('input');
      input.type = 'tel';
      input.placeholder = 'Enter your ZIP code';
      input.maxLength = '5';
      input.id = 'zip-code-input';
      input.setAttribute('aria-label', '5-digit ZIP code');
      const submit = document.createElement('button');
      submit.type = 'button';
      submit.className = 'zip-submit';
      submit.textContent = 'View plans';
      wrapper.appendChild(input);
      wrapper.appendChild(submit);
      zipCell.appendChild(wrapper);

      // Error message
      const errorEl = document.createElement('p');
      errorEl.className = 'zip-error';
      errorEl.style.display = 'none';
      errorEl.textContent = 'Invalid ZIP code. Please try again.';
      zipCell.appendChild(errorEl);

      submit.addEventListener('click', (e) => {
        e.preventDefault();
        const zip = input.value.trim();
        if (/^\d{5}$/.test(zip)) {
          errorEl.style.display = 'none';
          window.location.href = `/plans?zip=${zip}`;
        } else {
          errorEl.style.display = 'block';
        }
      });
    }
  }

  // Build the moving toggle from row 3
  if (rows.length >= 3) {
    const movingRow = rows[2];
    const movingCell = movingRow.querySelector('div');
    if (movingCell) {
      const text = movingCell.textContent;
      movingCell.innerHTML = '';
      const wrapper = document.createElement('div');
      wrapper.className = 'zip-moving';
      const label = document.createElement('p');
      label.textContent = 'Moving to a new address?';
      const toggle = document.createElement('p');
      const yes = document.createElement('a');
      yes.href = '#';
      yes.textContent = 'Yes';
      yes.className = 'moving-yes';
      const no = document.createElement('a');
      no.href = '#';
      no.textContent = 'No';
      no.className = 'moving-no';
      toggle.appendChild(yes);
      toggle.appendChild(document.createTextNode('  '));
      toggle.appendChild(no);
      wrapper.appendChild(label);
      wrapper.appendChild(toggle);
      movingCell.appendChild(wrapper);

      yes.addEventListener('click', (e) => {
        e.preventDefault();
        const inp = block.querySelector('#zip-code-input');
        if (inp) inp.placeholder = 'Enter your new ZIP code';
      });
      no.addEventListener('click', (e) => {
        e.preventDefault();
        const inp = block.querySelector('#zip-code-input');
        if (inp) inp.placeholder = 'Enter your ZIP code';
      });
    }
  }
}
