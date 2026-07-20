(() => {
  const menuButton = document.querySelector('.menu-toggle');
  const mainNav = document.querySelector('.main-nav');

  menuButton?.addEventListener('click', () => {
    const isOpen = mainNav?.classList.toggle('is-open');
    menuButton.setAttribute('aria-expanded', String(Boolean(isOpen)));
    menuButton.setAttribute('aria-label', isOpen ? 'Close navigation menu' : 'Open navigation menu');
  });

  mainNav?.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      mainNav.classList.remove('is-open');
      menuButton?.setAttribute('aria-expanded', 'false');
    });
  });

  document.querySelectorAll('[data-current-year]').forEach((element) => {
    element.textContent = new Date().getFullYear();
  });

  const encodeInquiry = (form, type) => {
    const data = new FormData(form);
    const entries = [...data.entries()]
      .filter(([, value]) => String(value).trim())
      .map(([key, value]) => `${key.replaceAll('-', ' ').replace(/\b\w/g, (char) => char.toUpperCase())}: ${String(value).trim()}`);

    const name = String(data.get('name') || data.get('full-name') || 'Website visitor').trim();
    const subject = `${type} – ${name}`;
    const body = [
      'Good day, Shirley Publishing House,',
      '',
      `I am sending a ${type.toLowerCase()} through your website.`,
      '',
      ...entries,
      '',
      'Thank you.'
    ].join('\n');

    return `mailto:shirleypublishinghouse@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  document.querySelectorAll('form[data-mailto-form]').forEach((form) => {
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const status = form.querySelector('.form-status');
      if (!form.checkValidity()) {
        form.reportValidity();
        if (status) status.textContent = 'Please complete the required fields.';
        return;
      }
      const type = form.dataset.mailtoForm || 'Publishing inquiry';
      if (status) status.textContent = 'Your email application is opening. Attach your manuscript or files before sending.';
      window.location.href = encodeInquiry(form, type);
    });
  });

  const previewGrid = document.getElementById('home-repository-preview');
  if (previewGrid && Array.isArray(window.SHIRLEY_REPOSITORY)) {
    const escapeHtml = (value = '') => String(value)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');

    const items = [...window.SHIRLEY_REPOSITORY]
      .sort((a, b) => Number(Boolean(b.featured)) - Number(Boolean(a.featured)) || Number(b.year || 0) - Number(a.year || 0))
      .slice(0, 3);

    previewGrid.innerHTML = items.map((item) => {
      const cover = item.cover
        ? `<div class="preview-card-cover"><img src="${escapeHtml(item.cover)}" alt="Cover of ${escapeHtml(item.title)}" loading="lazy"></div>`
        : `<div class="preview-card-cover fallback">${escapeHtml(String(item.title || 'P').charAt(0))}</div>`;
      return `<article class="preview-card">
        ${cover}
        <div class="preview-card-body">
          <span class="type-badge">${escapeHtml(item.type || 'Publication')}</span>
          <h3>${escapeHtml(item.title)}</h3>
          <p>${escapeHtml(item.author || 'Author not specified')} · ${escapeHtml(item.year || '')}</p>
        </div>
      </article>`;
    }).join('');
  }
})();
