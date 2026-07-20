(() => {
  const data = window.SHIRLEY_CMS || {};
  const site = data.site || {};
  const pages = data.pages || {};
  const services = Array.isArray(data.services) ? data.services : [];
  const pageKey = document.body?.dataset?.page;
  const page = pages[pageKey] || {};
  const escapeHtml = (value = '') => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#039;');

  if (pageKey === 'home') {
    const hero = document.querySelector('.hero-copy');
    if (hero) {
      if (page.eyebrow) hero.querySelector('.eyebrow')?.replaceChildren(document.createTextNode(page.eyebrow));
      if (page.title) hero.querySelector('h1')?.replaceChildren(document.createTextNode(page.title));
      if (page.intro) hero.querySelector('.hero-text')?.replaceChildren(document.createTextNode(page.intro));
    }
  } else {
    const hero = document.querySelector('.page-hero-inner');
    if (hero) {
      if (page.eyebrow) hero.querySelector('.eyebrow')?.replaceChildren(document.createTextNode(page.eyebrow));
      if (page.title) hero.querySelector('h1')?.replaceChildren(document.createTextNode(page.title));
      const directParagraphs = [...hero.children].filter((el) => el.tagName === 'P');
      if (page.intro && directParagraphs.length) directParagraphs.at(-1).replaceChildren(document.createTextNode(page.intro));
    }
  }

  if (site.email) {
    document.querySelectorAll('a[href^="mailto:"]').forEach((a) => { a.href = `mailto:${site.email}`; if (!a.closest('form')) a.textContent = site.email; });
  }
  if (site.phoneLink || site.phoneDisplay) {
    document.querySelectorAll('a[href^="tel:"]').forEach((a) => { a.href = `tel:${site.phoneLink || site.phoneDisplay}`; a.textContent = site.phoneDisplay || site.phoneLink; });
  }
  if (site.location) {
    document.querySelectorAll('span,strong').forEach((el) => {
      if (/Kasibu,\s*Nueva Vizcaya/i.test(el.textContent || '')) el.textContent = site.location;
    });
  }
  const contactCard = document.querySelector('.contact-card');
  if (contactCard && pageKey === 'contact') {
    if (site.businessName) contactCard.querySelector('h2')?.replaceChildren(document.createTextNode(site.businessName));
    if (site.tagline) contactCard.querySelector(':scope > p')?.replaceChildren(document.createTextNode(site.tagline));
  }
  if (site.footerDescription) document.querySelectorAll('.footer-brand-wrap > p').forEach((p) => p.textContent = site.footerDescription);

  const serviceListMarkup = (service, detailed) => detailed
    ? `<article class="service-detail"><div class="service-icon">${escapeHtml(service.number || '')}</div><div><h2>${escapeHtml(service.title || '')}</h2><p>${escapeHtml(service.summary || '')}</p><ul>${(service.items || []).map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul></div></article>`
    : `<article class="service-card${service.featured ? ' featured' : ''}"><div class="number">${escapeHtml(service.number || '')}</div><h3>${escapeHtml(service.title || '')}</h3><p>${escapeHtml(service.summary || '')}</p><ul>${(service.items || []).slice(0, 4).map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul></article>`;

  if (services.length) {
    if (pageKey === 'home') {
      const grid = document.querySelector('.service-grid');
      if (grid) grid.innerHTML = services.slice(0, 6).map((s) => serviceListMarkup(s, false)).join('');
    }
    if (pageKey === 'services') {
      const grid = document.querySelector('.service-detail-grid');
      if (grid) grid.innerHTML = services.map((s) => serviceListMarkup(s, true)).join('');
    }
  }
})();
