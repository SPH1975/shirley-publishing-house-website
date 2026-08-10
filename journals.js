(() => {
  const journals = Array.isArray(window.SHIRLEY_JOURNALS) ? window.SHIRLEY_JOURNALS : [];
  const journalArticles = Array.isArray(window.SHIRLEY_JOURNAL_ARTICLES) ? window.SHIRLEY_JOURNAL_ARTICLES : [];
  const escapeHtml = (value = '') => String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
  const safeUrl = (value, fallback) => {
    const url = String(value || '').trim();
    if (!url) return fallback;
    if (/^(https?:\/\/|mailto:|tel:|[a-z0-9._/-]+(?:\.html)?(?:[?#].*)?$)/i.test(url)) return url;
    return fallback;
  };
  const coverSrc = (journal) => String(journal.cover || 'assets/journal-cover-official.png').replace(/^\//, '');
  const editorialBoardImageSrc = (journal) => String(journal.editorialBoardImage || '').replace(/^\//, '');
  const journalFileSrc = (journal) => String(journal.journalFile || '').replace(/^\//, '');
  const initials = (label = '') => label.split(/\s+/).filter(Boolean).slice(0, 2).map((word) => word[0]).join('').toUpperCase() || 'JW';

  const listGrid = document.querySelector('#journals-grid');
  if (listGrid) {
    const visible = journals.filter((journal) => journal.active !== false);
    if (!visible.length) {
      document.querySelector('#journals-empty')?.removeAttribute('hidden');
    } else {
      listGrid.innerHTML = visible.map((journal) => {
        const profileUrl = `journal-profile.html?journal=${encodeURIComponent(journal.id)}`;
        const facts = [
          journal.issn ? `<span><small>ISSN</small><strong>${escapeHtml(journal.issn)}</strong></span>` : '',
          journal.publicationFrequency ? `<span><small>Frequency</small><strong>${escapeHtml(journal.publicationFrequency)}</strong></span>` : '',
          journal.currentVolumeIssue ? `<span><small>Current Issue</small><strong>${escapeHtml(journal.currentVolumeIssue)}</strong></span>` : '',
        ].filter(Boolean).join('');
        const tags = (journal.disciplines || []).slice(0, 4).map((item) => `<span>${escapeHtml(item)}</span>`).join('');
        return `<article class="journal-directory-card${journal.featured ? ' featured-journal' : ''}">
          <a class="journal-card-cover" href="${profileUrl}" aria-label="View ${escapeHtml(journal.title)}">
            <img src="${escapeHtml(coverSrc(journal))}" alt="${escapeHtml(journal.title)} cover" loading="lazy">
          </a>
          <div class="journal-card-body">
            <div class="journal-card-topline"><span class="journal-status">${journal.featured ? 'Featured journal' : 'Academic journal'}</span>${journal.issn ? `<span class="journal-issn">ISSN ${escapeHtml(journal.issn)}</span>` : ''}</div>
            <h2><a href="${profileUrl}">${escapeHtml(journal.shortTitle || journal.title)}</a></h2>
            ${journal.description ? `<p>${escapeHtml(journal.description)}</p>` : ''}
            ${tags ? `<div class="scope-tags journal-card-tags">${tags}</div>` : ''}
            ${facts ? `<div class="journal-card-facts">${facts}</div>` : ''}
            <div class="journal-card-actions">
              <a class="btn btn-primary" href="${profileUrl}">View Journal</a>
              ${journalFileSrc(journal) ? `<a class="btn btn-secondary journal-download-card" href="${escapeHtml(journalFileSrc(journal))}" download>Download Issue</a>` : ''}
              <a class="btn btn-secondary" href="${escapeHtml(safeUrl(journal.submissionUrl, 'submit.html'))}">Submit an Article</a>
            </div>
          </div>
        </article>`;
      }).join('');
    }
  }

  const profileSection = document.querySelector('#journal-profile-section');
  if (!profileSection) return;

  const params = new URLSearchParams(window.location.search);
  const requestedId = params.get('journal');
  const journal = journals.find((item) => item.id === requestedId) || (journals.length === 1 && !requestedId ? journals[0] : null);

  const hideSectionsForMissing = () => {
    ['journal-profile-section', 'journal-details'].forEach((id) => {
      const element = document.getElementById(id);
      if (element) element.hidden = true;
    });
    document.getElementById('journal-not-found')?.removeAttribute('hidden');
    const title = document.getElementById('journal-hero-title');
    const intro = document.getElementById('journal-hero-intro');
    if (title) title.textContent = 'Journal profile not found';
    if (intro) intro.textContent = 'The requested journal may have been removed or its address may be incorrect.';
    document.title = 'Journal Not Found | Shirley Publishing House';
  };

  if (!journal) {
    hideSectionsForMissing();
    return;
  }

  const setText = (id, value) => {
    const element = document.getElementById(id);
    if (element) element.textContent = value || '';
  };
  setText('journal-breadcrumb', journal.shortTitle || journal.title);
  setText('journal-hero-title', journal.shortTitle || journal.title);
  setText('journal-hero-intro', journal.description || `View the scope and publication information for ${journal.title}.`);
  setText('journal-title', journal.title);
  setText('journal-description', journal.description);
  setText('journal-tab-description-copy', journal.description);
  setText('journal-editor-chief', journal.editorInChief);
  document.title = `${journal.shortTitle || journal.title} | Shirley Publishing House`;
  const descriptionMeta = document.querySelector('meta[name="description"]');
  if (descriptionMeta) descriptionMeta.content = journal.description || `Journal profile for ${journal.title}.`;

  const cover = document.getElementById('journal-cover');
  if (cover) {
    cover.src = coverSrc(journal);
    cover.alt = `${journal.title} cover`;
  }

  const factValues = [
    ['ISSN', journal.issn],
    ['Publisher', 'Shirley Publishing House'],
    ['Scope', journal.scope],
    ['Format', journal.format],
    ['Publication Frequency', journal.publicationFrequency],
    ['Current Volume / Issue', journal.currentVolumeIssue],
    ['Established', journal.establishedYear],
  ].filter(([, value]) => value);
  const facts = document.getElementById('journal-facts');
  if (facts) facts.innerHTML = factValues.map(([label, value]) => `<div class="journal-fact"><span>${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong></div>`).join('');

  const disciplineWrap = document.getElementById('journal-disciplines-wrap');
  const disciplines = document.getElementById('journal-disciplines');
  const disciplinesTab = document.getElementById('journal-disciplines-tab');
  if ((journal.disciplines || []).length && disciplines) {
    disciplines.innerHTML = journal.disciplines.map((item) => `<span>${escapeHtml(item)}</span>`).join('');
    if (disciplinesTab) disciplinesTab.innerHTML = journal.disciplines.map((item) => `<span>${escapeHtml(item)}</span>`).join('');
  } else if (disciplineWrap) {
    disciplineWrap.hidden = true;
    document.getElementById('journal-disciplines-tab-wrap')?.setAttribute('hidden', '');
  }

  const submitUrl = safeUrl(journal.submissionUrl, 'submit.html');
  const publicationsUrl = safeUrl(journal.publicationsUrl, 'repository.html');
  ['journal-submit-link', 'journal-cta-submit'].forEach((id) => {
    const link = document.getElementById(id);
    if (link) link.href = submitUrl;
  });
  const publicationsLink = document.getElementById('journal-publications-link');
  if (publicationsLink) publicationsLink.href = publicationsUrl;

  const articleArchive = document.getElementById('journal-issue-archive');
  const archiveEmpty = document.getElementById('journal-archive-empty');
  const archiveSearch = document.getElementById('journal-article-search');
  const archiveCount = document.getElementById('journal-article-count');
  const articlesForJournal = journalArticles.filter((article) => article.journalId === journal.id && article.active !== false);
  const formatArticleDate = (value) => {
    if (!value) return '';
    const date = new Date(`${value}T00:00:00`);
    return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };
  const renderJournalArticles = (query = '') => {
    if (!articleArchive) return;
    const needle = query.trim().toLowerCase();
    const visible = articlesForJournal.filter((article) => {
      if (!needle) return true;
      return [
        article.title,
        ...(article.authors || []),
        ...(article.keywords || []),
        article.abstract,
        article.volume,
        article.issue,
        article.issueLabel,
        article.articleType,
      ].join(' ').toLowerCase().includes(needle);
    });
    if (archiveCount) archiveCount.textContent = `${visible.length} ${visible.length === 1 ? 'article' : 'articles'}`;
    if (!visible.length) {
      articleArchive.innerHTML = '';
      if (archiveEmpty) {
        archiveEmpty.hidden = false;
        const heading = archiveEmpty.querySelector('h3');
        const copy = archiveEmpty.querySelector('p');
        if (articlesForJournal.length && needle) {
          if (heading) heading.textContent = 'No matching articles';
          if (copy) copy.textContent = 'Try a different article title, author, keyword, volume, or issue.';
        }
      }
      return;
    }
    if (archiveEmpty) archiveEmpty.hidden = true;
    const issueGroups = new Map();
    visible.forEach((article) => {
      const key = `${article.volume || 'Unassigned'}::${article.issue || 'Unassigned'}::${article.issueLabel || ''}`;
      if (!issueGroups.has(key)) issueGroups.set(key, []);
      issueGroups.get(key).push(article);
    });
    const numericArchiveValue = (value) => {
      const match = String(value ?? '').match(/\d+(?:\.\d+)?/);
      return match ? Number(match[0]) : Number.NEGATIVE_INFINITY;
    };
    const orderedIssueGroups = [...issueGroups.entries()].sort(([keyA], [keyB]) => {
      const [volumeA, issueA] = keyA.split('::');
      const [volumeB, issueB] = keyB.split('::');
      return numericArchiveValue(volumeB) - numericArchiveValue(volumeA)
        || numericArchiveValue(issueB) - numericArchiveValue(issueA);
    });
    articleArchive.innerHTML = orderedIssueGroups.map(([key, articles]) => {
      const [volume, issue, issueLabel] = key.split('::');
      const issueTitle = volume === 'Unassigned' && issue === 'Unassigned'
        ? 'Published Articles'
        : journal.id === 'national-research-journal'
          ? `Volume ${escapeHtml(volume)} Issue No. ${escapeHtml(issue)}`
          : `Volume ${escapeHtml(volume)} · Issue ${escapeHtml(issue)}`;
      const articleCards = articles.map((article) => {
        const authors = (article.authors || []).join(', ') || 'Author information forthcoming';
        const meta = [
          article.articleType,
          formatArticleDate(article.publicationDate),
          article.pages ? `Pages ${article.pages}` : '',
          article.doi ? `DOI: ${article.doi}` : '',
        ].filter(Boolean);
        const keywords = (article.keywords || []).map((keyword) => `<span>${escapeHtml(keyword)}</span>`).join('');
        const pdf = String(article.pdfFile || '').replace(/^\//, '');
        return `<article class="journal-article-card${article.featured ? ' is-featured' : ''}">
          <div class="journal-article-main">
            <div class="journal-article-type">${escapeHtml(article.articleType || 'Article')}</div>
            <h4>${escapeHtml(article.title)}</h4>
            <p class="journal-article-authors">${escapeHtml(authors)}</p>
            ${meta.length ? `<div class="journal-article-meta">${meta.map((item) => `<span>${escapeHtml(item)}</span>`).join('')}</div>` : ''}
            ${article.abstract ? `<p class="journal-article-abstract">${escapeHtml(article.abstract)}</p>` : ''}
            ${keywords ? `<div class="journal-article-keywords">${keywords}</div>` : ''}
          </div>
          <div class="journal-article-action">
            ${pdf ? `<a class="btn btn-primary" href="${escapeHtml(pdf)}" target="_blank" rel="noopener">View / Download PDF</a>` : '<span class="article-pdf-pending">PDF pending</span>'}
          </div>
        </article>`;
      }).join('');
      return `<section class="journal-issue-group">
        <header><div><p class="eyebrow">Journal issue</p><h3>${issueTitle}</h3></div>${issueLabel ? `<span>${escapeHtml(issueLabel)}</span>` : ''}</header>
        <div class="journal-article-list">${articleCards}</div>
      </section>`;
    }).join('');
  };
  renderJournalArticles();
  archiveSearch?.addEventListener('input', () => renderJournalArticles(archiveSearch.value));

  const journalFile = journalFileSrc(journal);
  const downloadLabel = journal.downloadLabel || 'Download Full Journal (PDF)';
  const profileDownloadLink = document.getElementById('journal-download-link');
  const downloadSection = document.getElementById('journal-download-section');
  const downloadSectionLink = document.getElementById('journal-download-section-link');
  const downloadTitle = document.getElementById('journal-download-title');
  const downloadNote = document.getElementById('journal-download-note');
  if (journalFile) {
    [profileDownloadLink, downloadSectionLink].forEach((link) => {
      if (!link) return;
      link.href = journalFile;
      link.setAttribute('download', '');
      link.hidden = false;
    });
    if (profileDownloadLink) profileDownloadLink.textContent = downloadLabel;
    if (downloadSectionLink) downloadSectionLink.textContent = downloadLabel;
    if (downloadTitle) downloadTitle.textContent = `Download ${journal.currentVolumeIssue || journal.shortTitle || 'the journal issue'}`;
    if (downloadNote) downloadNote.textContent = `Access the complete digital issue of ${journal.title} as a PDF file.`;
    if (downloadSection) downloadSection.hidden = false;
  } else {
    if (profileDownloadLink) profileDownloadLink.hidden = true;
    if (downloadSection) downloadSection.hidden = true;
  }

  const acceptedSection = document.getElementById('journal-accepted-section');
  const acceptedGrid = document.getElementById('journal-accepted-works');
  if ((journal.acceptedWorks || []).length && acceptedGrid) {
    acceptedGrid.innerHTML = journal.acceptedWorks.map((item) => `<li>${escapeHtml(item)}</li>`).join('');
  } else if (acceptedSection) acceptedSection.hidden = true;

  const fillList = (listId, cardId, values) => {
    const list = document.getElementById(listId);
    const card = document.getElementById(cardId);
    if (values.length && list) list.innerHTML = values.map((item) => `<li>${escapeHtml(item)}</li>`).join('');
    else if (card) card.hidden = true;
  };
  fillList('journal-preparation-list', 'journal-preparation-card', journal.preparationGuidelines || []);
  fillList('journal-assessment-list', 'journal-assessment-card', journal.editorialCriteria || []);
  if (!(journal.preparationGuidelines || []).length && !(journal.editorialCriteria || []).length) {
    document.getElementById('journal-guidelines-section')?.setAttribute('hidden', '');
  }

  const editorialPanel = document.getElementById('journal-editorial-panel');
  const editorialToolbar = document.getElementById('journal-board-toolbar');
  const editorialToggleAll = document.getElementById('journal-board-toggle-all');
  const structuredGroups = Array.isArray(journal.editorialBoardGroups) ? journal.editorialBoardGroups : [];
  const legacyMembers = Array.isArray(journal.editorialBoard) ? journal.editorialBoard : [];
  const editorialGroups = structuredGroups.length ? structuredGroups : [
    ...(journal.editorInChief ? [{ role: 'Editor-in-Chief', members: [{ name: journal.editorInChief }] }] : []),
    ...(legacyMembers.length ? [{ role: 'Editorial Board', members: legacyMembers.map((name) => ({ name })) }] : []),
  ];

  if (editorialGroups.length && editorialPanel) {
    editorialPanel.innerHTML = editorialGroups.map((group, groupIndex) => {
      const members = Array.isArray(group.members) ? group.members : [];
      const panelId = `editorial-role-${groupIndex}`;
      const isOpen = groupIndex === 0;
      return `<section class="editorial-role-card${isOpen ? ' is-open' : ''}">
        <button class="editorial-role-toggle" type="button" aria-expanded="${String(isOpen)}" aria-controls="${panelId}">
          <span><span class="editorial-role-name">${escapeHtml(group.role || 'Editorial Board')}</span><span class="editorial-role-count">${members.length} ${members.length === 1 ? 'member' : 'members'}</span></span>
          <span class="editorial-role-icon" aria-hidden="true">+</span>
        </button>
        <div class="editorial-role-members" id="${panelId}"${isOpen ? '' : ' hidden'}>
          ${members.map((member) => `<article class="editorial-member-card" tabindex="0"><span class="editorial-member-monogram" aria-hidden="true">${escapeHtml(String(member.name || '').trim().charAt(0) || 'E')}</span><span><strong>${escapeHtml(member.name || '')}</strong>${member.credentials ? `<small>${escapeHtml(member.credentials)}</small>` : ''}</span></article>`).join('')}
        </div>
      </section>`;
    }).join('');
    if (editorialToolbar) editorialToolbar.hidden = false;

    const roleToggles = [...editorialPanel.querySelectorAll('.editorial-role-toggle')];
    const setRoleState = (toggle, open) => {
      const members = document.getElementById(toggle.getAttribute('aria-controls'));
      toggle.setAttribute('aria-expanded', String(open));
      toggle.closest('.editorial-role-card')?.classList.toggle('is-open', open);
      if (members) members.hidden = !open;
    };
    roleToggles.forEach((toggle) => toggle.addEventListener('click', () => setRoleState(toggle, toggle.getAttribute('aria-expanded') !== 'true')));
    editorialToggleAll?.addEventListener('click', () => {
      const expand = roleToggles.some((toggle) => toggle.getAttribute('aria-expanded') !== 'true');
      roleToggles.forEach((toggle) => setRoleState(toggle, expand));
      editorialToggleAll.textContent = expand ? 'Collapse all roles' : 'Expand all roles';
    });
  } else {
    if (editorialPanel) editorialPanel.hidden = true;
    document.getElementById('journal-panel-editorial')?.classList.add('is-empty');
  }

  const tabs = [...document.querySelectorAll('[data-journal-tab]')];
  const panels = [...document.querySelectorAll('[data-journal-panel]')];
  const activateTab = (name) => {
    tabs.forEach((tab) => {
      const active = tab.dataset.journalTab === name;
      tab.classList.toggle('is-active', active);
      tab.setAttribute('aria-selected', String(active));
      tab.tabIndex = active ? 0 : -1;
    });
    panels.forEach((panel) => {
      const active = panel.dataset.journalPanel === name;
      panel.classList.toggle('is-active', active);
      panel.hidden = !active;
    });
  };
  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => activateTab(tab.dataset.journalTab));
    tab.addEventListener('keydown', (event) => {
      if (!['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
      event.preventDefault();
      const next = event.key === 'ArrowRight' ? (index + 1) % tabs.length : (index - 1 + tabs.length) % tabs.length;
      tabs[next].focus();
      activateTab(tabs[next].dataset.journalTab);
    });
  });
})();
