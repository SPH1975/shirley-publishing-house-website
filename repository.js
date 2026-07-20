(() => {
  const items = Array.isArray(window.SHIRLEY_REPOSITORY) ? window.SHIRLEY_REPOSITORY : [];
  const grid = document.getElementById('repository-grid');
  if (!grid) return;

  const searchInput = document.getElementById('repository-search');
  const categorySelect = document.getElementById('repository-category');
  const typeSelect = document.getElementById('repository-type');
  const sortSelect = document.getElementById('repository-sort');
  const countElement = document.getElementById('repository-count');
  const emptyElement = document.getElementById('repository-empty');
  const clearButton = document.getElementById('repository-clear');
  const categoryCards = document.getElementById('repository-category-cards');
  const dialog = document.getElementById('publication-dialog');
  const dialogContent = document.getElementById('publication-dialog-content');
  const dialogClose = document.getElementById('dialog-close');
  const heroCountElement = document.getElementById('repository-hero-count');

  const CATEGORY_DEFINITIONS = [
    {
      name: "Children's Literature & Storybooks",
      code: 'KIDS',
      description: 'Illustrated stories, values-based narratives, local-language stories, and reading materials for young learners.'
    },
    {
      name: 'Language, Reading & Communication',
      code: 'LANG',
      description: 'Filipino, English, reading, literacy, writing, speech, journalism, grammar, and communication resources.'
    },
    {
      name: 'Mathematics & Statistics',
      code: 'MATH',
      description: 'Learning materials in numeracy, fractions, measurement, problem solving, statistics, probability, and calculus.'
    },
    {
      name: 'Science & Health',
      code: 'SCI',
      description: 'Science, biology, physics, health, human body systems, matter, plants, and laboratory-oriented resources.'
    },
    {
      name: 'Social Studies, Culture & Indigenous Knowledge',
      code: 'SOC',
      description: 'Araling Panlipunan, history, culture, heritage, Indigenous Knowledge Systems and Practices, and local studies.'
    },
    {
      name: 'Technology, Livelihood & Vocational Education',
      code: 'TLE',
      description: 'Cookery, food preparation, electrical installation, sewing, bread and pastry, and technical-vocational resources.'
    },
    {
      name: 'Education, Teaching & Research',
      code: 'EDU',
      description: 'Teaching practice, educational research, school improvement, curriculum, and professional learning resources.'
    },
    {
      name: 'Agriculture & Environmental Studies',
      code: 'AGR',
      description: 'Agriculture, animal production, horticulture, medicinal plants, and environmental learning materials.'
    },
    {
      name: 'Business, Entrepreneurship & Management',
      code: 'BUS',
      description: 'Entrepreneurship, income generation, human resource management, and business-oriented learning materials.'
    },
    {
      name: 'Engineering & Applied Sciences',
      code: 'ENG',
      description: 'Engineering mathematics, electrical circuits, and applied technical-science references.'
    },
    {
      name: 'Early Childhood & General Education',
      code: 'GEN',
      description: 'Kindergarten activities, foundational learning resources, and multidisciplinary educational materials.'
    },
    {
      name: 'Academic Journals & Research',
      code: 'JRN',
      description: 'Scholarly journals, theses-derived articles, research papers, and multidisciplinary academic publications.'
    }
  ];

  const categoryDefinitionMap = new Map(CATEGORY_DEFINITIONS.map((entry) => [entry.name, entry]));
  const categoryOrder = new Map(CATEGORY_DEFINITIONS.map((entry, index) => [entry.name, index]));

  const escapeHtml = (value = '') => String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');

  const normalize = (value = '') => String(value)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

  const slugify = (value = '') => normalize(value)
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

  const itemCategory = (item) => item.subjectCategory || item.category || item.type || 'Other Publications';

  const publicationTypes = [...new Set(items.map((item) => item.type).filter(Boolean))]
    .sort((a, b) => a.localeCompare(b));

  const subjectCategories = [...new Set(items.map(itemCategory).filter(Boolean))]
    .sort((a, b) => {
      const aOrder = categoryOrder.has(a) ? categoryOrder.get(a) : 999;
      const bOrder = categoryOrder.has(b) ? categoryOrder.get(b) : 999;
      return aOrder - bOrder || a.localeCompare(b);
    });

  if (heroCountElement) {
    heroCountElement.textContent = `${items.length} publications organized into ${subjectCategories.length} subject categories`;
  }

  subjectCategories.forEach((category) => {
    const option = document.createElement('option');
    option.value = category;
    option.textContent = category;
    categorySelect?.appendChild(option);
  });

  publicationTypes.forEach((type) => {
    const option = document.createElement('option');
    option.value = type;
    option.textContent = type;
    typeSelect?.appendChild(option);
  });

  const searchableText = (item) => normalize([
    item.title,
    item.author,
    item.publisher,
    item.type,
    item.subjectCategory,
    item.category,
    item.year,
    item.volume,
    item.edition,
    item.language,
    item.identifierLabel,
    item.identifier,
    item.abstract,
    ...(Array.isArray(item.keywords) ? item.keywords : [])
  ].filter(Boolean).join(' '));

  const publicationMeta = (item) => [
    item.type,
    item.year,
    item.volume || item.edition,
    item.identifierLabel && item.identifier ? `${item.identifierLabel} ${item.identifier}` : ''
  ].filter(Boolean).join(' · ');

  const coverInitials = (item) => String(item.title || 'Publication')
    .split(/\s+/)
    .slice(0, 3)
    .map((word) => word[0] || '')
    .join('')
    .toUpperCase();

  const coverMarkup = (item) => {
    const fallback = `<div class="repository-cover-placeholder" aria-hidden="true"><span>${escapeHtml(coverInitials(item))}</span><small>Shirley Publishing House</small></div>`;
    const image = item.cover
      ? `<img src="${escapeHtml(item.cover)}" alt="Cover of ${escapeHtml(item.title)}" loading="lazy" onerror="this.remove()">`
      : '';
    return `<div class="repository-cover${item.cover ? ' has-cover' : ' repository-cover-fallback'}">${fallback}${image}</div>`;
  };

  const renderCard = (item) => `
    <article class="repository-card" data-publication-id="${escapeHtml(item.id)}">
      ${coverMarkup(item)}
      <div class="repository-card-body">
        <div class="repository-card-topline">
          <span class="repository-type-badge">${escapeHtml(item.type || 'Publication')}</span>
          ${item.featured ? '<span class="repository-featured">Featured</span>' : ''}
        </div>
        <h3>${escapeHtml(item.title)}</h3>
        <p class="repository-author">${escapeHtml(item.author || 'Author not specified')}</p>
        <p class="repository-meta">${escapeHtml(publicationMeta(item))}</p>
        ${item.abstract ? `<p class="repository-description">${escapeHtml(item.abstract)}</p>` : ''}
        <div class="repository-card-actions">
          <button class="repository-details-button" type="button" data-action="details" data-id="${escapeHtml(item.id)}">View Details</button>
          ${item.accessUrl ? `<a class="repository-access-button" href="${escapeHtml(item.accessUrl)}" ${/^https?:/i.test(item.accessUrl) ? 'target="_blank" rel="noopener"' : ''}>${escapeHtml(item.accessLabel || 'Open Publication')}</a>` : ''}
        </div>
      </div>
    </article>`;

  const categoryMeta = (category) => categoryDefinitionMap.get(category) || {
    name: category,
    code: 'PUB',
    description: 'Publications grouped according to their subject matter and bibliographic information.'
  };

  const renderCategoryNavigation = (activeCategory = 'all') => {
    if (!categoryCards) return;
    const counts = new Map(subjectCategories.map((category) => [
      category,
      items.filter((item) => itemCategory(item) === category).length
    ]));

    const allCard = `
      <button class="repository-category-card${activeCategory === 'all' ? ' is-active' : ''}" type="button" data-category="all">
        <span class="repository-category-code">ALL</span>
        <span class="repository-category-card-copy"><strong>All Publications</strong><small>${items.length} entries</small></span>
      </button>`;

    categoryCards.innerHTML = allCard + subjectCategories.map((category) => {
      const meta = categoryMeta(category);
      return `
        <button class="repository-category-card${activeCategory === category ? ' is-active' : ''}" type="button" data-category="${escapeHtml(category)}">
          <span class="repository-category-code">${escapeHtml(meta.code)}</span>
          <span class="repository-category-card-copy"><strong>${escapeHtml(category)}</strong><small>${counts.get(category) || 0} publication${counts.get(category) === 1 ? '' : 's'}</small></span>
        </button>`;
    }).join('');
  };

  const currentResults = () => {
    const query = normalize(searchInput?.value.trim());
    const selectedCategory = categorySelect?.value || 'all';
    const selectedType = typeSelect?.value || 'all';
    const sortMode = sortSelect?.value || 'newest';

    const filtered = items.filter((item) => {
      const matchesQuery = !query || searchableText(item).includes(query);
      const matchesCategory = selectedCategory === 'all' || itemCategory(item) === selectedCategory;
      const matchesType = selectedType === 'all' || item.type === selectedType;
      return matchesQuery && matchesCategory && matchesType;
    });

    return filtered.sort((a, b) => {
      if (sortMode === 'oldest') return Number(a.year || 0) - Number(b.year || 0) || String(a.title || '').localeCompare(String(b.title || ''));
      if (sortMode === 'title') return String(a.title || '').localeCompare(String(b.title || ''));
      if (sortMode === 'author') return String(a.author || '').localeCompare(String(b.author || ''));
      return Number(b.year || 0) - Number(a.year || 0) || String(a.title || '').localeCompare(String(b.title || ''));
    });
  };

  const renderCategorySection = (category, categoryItems) => {
    const meta = categoryMeta(category);
    return `
      <section class="repository-category-section" id="category-${escapeHtml(slugify(category))}" data-category-section="${escapeHtml(category)}">
        <header class="repository-category-heading">
          <span class="repository-category-heading-code" aria-hidden="true">${escapeHtml(meta.code)}</span>
          <div class="repository-category-heading-copy">
            <p class="repository-category-kicker">Subject classification</p>
            <h3>${escapeHtml(category)}</h3>
            <p>${escapeHtml(meta.description)}</p>
          </div>
          <span class="repository-category-count">${categoryItems.length} publication${categoryItems.length === 1 ? '' : 's'}</span>
        </header>
        <div class="repository-category-grid">
          ${categoryItems.map(renderCard).join('')}
        </div>
      </section>`;
  };

  const render = () => {
    const results = currentResults();
    const selectedCategory = categorySelect?.value || 'all';
    renderCategoryNavigation(selectedCategory);

    const grouped = new Map();
    results.forEach((item) => {
      const category = itemCategory(item);
      if (!grouped.has(category)) grouped.set(category, []);
      grouped.get(category).push(item);
    });

    const orderedCategories = [...grouped.keys()].sort((a, b) => {
      const aOrder = categoryOrder.has(a) ? categoryOrder.get(a) : 999;
      const bOrder = categoryOrder.has(b) ? categoryOrder.get(b) : 999;
      return aOrder - bOrder || a.localeCompare(b);
    });

    grid.innerHTML = orderedCategories.map((category) => renderCategorySection(category, grouped.get(category))).join('');

    if (countElement) {
      countElement.textContent = `${results.length} publication${results.length === 1 ? '' : 's'} found across ${orderedCategories.length} categor${orderedCategories.length === 1 ? 'y' : 'ies'}`;
    }
    if (emptyElement) emptyElement.hidden = results.length !== 0;
  };

  const openDialog = (item) => {
    if (!dialog || !dialogContent) return;
    const keywords = Array.isArray(item.keywords) ? item.keywords : [];
    dialogContent.innerHTML = `
      <div class="dialog-publication-layout">
        <aside class="dialog-cover-panel" aria-label="Publication cover">
          ${coverMarkup(item)}
        </aside>
        <div class="dialog-publication-copy">
          <div class="dialog-scroll-area">
            <header class="dialog-publication-header">
              <span class="repository-type-badge">${escapeHtml(item.type || 'Publication')}</span>
              <h2>${escapeHtml(item.title)}</h2>
              <p class="dialog-author">By <strong>${escapeHtml(item.author || 'Author not specified')}</strong></p>
            </header>

            <dl class="dialog-metadata">
              ${item.subjectCategory ? `<div class="dialog-metadata-wide"><dt>Subject Classification</dt><dd>${escapeHtml(item.subjectCategory)}</dd></div>` : ''}
              ${item.publisher ? `<div><dt>Publisher</dt><dd>${escapeHtml(item.publisher)}</dd></div>` : ''}
              ${item.publicationDate ? `<div><dt>Publication Date</dt><dd>${escapeHtml(item.publicationDate)}</dd></div>` : (item.year ? `<div><dt>Year</dt><dd>${escapeHtml(item.year)}</dd></div>` : '')}
              ${(item.edition || item.volume) ? `<div><dt>Edition / Volume</dt><dd>${escapeHtml(item.edition || item.volume)}</dd></div>` : ''}
              ${item.identifier ? `<div><dt>${escapeHtml(item.identifierLabel || 'Identifier')}</dt><dd>${escapeHtml(item.identifier)}</dd></div>` : ''}
              ${item.language ? `<div><dt>Language</dt><dd>${escapeHtml(item.language)}</dd></div>` : ''}
              ${item.category ? `<div><dt>Publication Category</dt><dd>${escapeHtml(item.category)}</dd></div>` : ''}
              ${item.format ? `<div><dt>Format</dt><dd>${escapeHtml(item.format)}</dd></div>` : ''}
            </dl>

            ${item.abstract ? `<p class="dialog-description">${escapeHtml(item.abstract)}</p>` : ''}
            ${keywords.length ? `<div class="dialog-keywords" aria-label="Publication keywords">${keywords.map((keyword) => `<span>${escapeHtml(keyword)}</span>`).join('')}</div>` : ''}
          </div>

          <div class="dialog-footer">
            <p class="dialog-repository-note">Bibliographic listing only. Availability, sales, inventory ownership, and distribution status may vary.</p>
            ${item.accessUrl ? `<a class="btn btn-primary dialog-access" href="${escapeHtml(item.accessUrl)}" ${/^https?:/i.test(item.accessUrl) ? 'target="_blank" rel="noopener"' : ''}>${escapeHtml(item.accessLabel || 'Open Publication')}</a>` : ''}
          </div>
        </div>
      </div>`;
    dialog.showModal();
    requestAnimationFrame(() => {
      const scrollArea = dialog.querySelector('.dialog-scroll-area');
      if (scrollArea) scrollArea.scrollTop = 0;
    });
  };

  grid.addEventListener('click', (event) => {
    const button = event.target.closest('[data-action="details"]');
    if (!button) return;
    const item = items.find((publication) => String(publication.id) === button.dataset.id);
    if (item) openDialog(item);
  });

  categoryCards?.addEventListener('click', (event) => {
    const button = event.target.closest('[data-category]');
    if (!button || !categorySelect) return;
    categorySelect.value = button.dataset.category || 'all';
    render();
    document.getElementById('repository')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  [searchInput, categorySelect, typeSelect, sortSelect].forEach((control) => {
    control?.addEventListener(control === searchInput ? 'input' : 'change', render);
  });

  clearButton?.addEventListener('click', () => {
    if (searchInput) searchInput.value = '';
    if (categorySelect) categorySelect.value = 'all';
    if (typeSelect) typeSelect.value = 'all';
    if (sortSelect) sortSelect.value = 'newest';
    render();
    searchInput?.focus();
  });

  dialogClose?.addEventListener('click', () => dialog?.close());
  dialog?.addEventListener('click', (event) => {
    if (event.target === dialog) dialog.close();
    const hashLink = event.target.closest('a[href^="#"]');
    if (hashLink) dialog.close();
  });

  render();
})();
