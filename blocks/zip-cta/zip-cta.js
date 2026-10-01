export default function decorate(block) {
  const content = block.querySelector(':scope > div > div') || block;
  const cta = content.querySelector('a');
  const label = cta?.textContent.trim() || 'Get started';
  cta?.closest('p')?.remove();

  const form = document.createElement('form');
  form.className = 'zip-cta-form';
  form.noValidate = true;
  form.innerHTML = `<label for="zip-cta-input">Enter your location</label>
    <div class="zip-cta-field">
      <input id="zip-cta-input" type="text" inputmode="numeric" autocomplete="postal-code" maxlength="5" pattern="[0-9]{5}" placeholder="Zip Code">
      <button type="submit" aria-label="${label}"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10 3a7 7 0 0 1 5.6 11.2l5.1 5.1-1.4 1.4-5.1-5.1A7 7 0 1 1 10 3zm0 2a5 5 0 1 0 0 10 5 5 0 0 0 0-10z"/></svg></button>
    </div>
    <p class="zip-cta-error" role="alert" hidden>Invalid ZIP code. Please try again.</p>`;

  const input = form.querySelector('input');
  const error = form.querySelector('.zip-cta-error');
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
  content.append(form);
}
