(() => {
  const journals = Array.isArray(window.SHIRLEY_JOURNALS) ? window.SHIRLEY_JOURNALS : [];
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
    ['journal-profile-section', 'journal-accepted-section', 'journal-guidelines-section', 'journal-editorial-section'].forEach((id) => {
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
  ].filter(([, value]) => value);
  const facts = document.getElementById('journal-facts');
  if (facts) facts.innerHTML = factValues.map(([label, value]) => `<div class="journal-fact"><span>${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong></div>`).join('');

  const disciplineWrap = document.getElementById('journal-disciplines-wrap');
  const disciplines = document.getElementById('journal-disciplines');
  if ((journal.disciplines || []).length && disciplines) {
    disciplines.innerHTML = journal.disciplines.map((item) => `<span>${escapeHtml(item)}</span>`).join('');
  } else if (disciplineWrap) {
    disciplineWrap.hidden = true;
  }

  const submitUrl = safeUrl(journal.submissionUrl, 'submit.html');
  const publicationsUrl = safeUrl(journal.publicationsUrl, 'repository.html');
  ['journal-submit-link', 'journal-cta-submit'].forEach((id) => {
    const link = document.getElementById(id);
    if (link) link.href = submitUrl;
  });
  const publicationsLink = document.getElementById('journal-publications-link');
  if (publicationsLink) publicationsLink.href = publicationsUrl;

  const acceptedSection = document.getElementById('journal-accepted-section');
  const acceptedGrid = document.getElementById('journal-accepted-works');
  if ((journal.acceptedWorks || []).length && acceptedGrid) {
    acceptedGrid.innerHTML = journal.acceptedWorks.map((item) => `<article class="value-card"><span>${escapeHtml(initials(item))}</span><h3>${escapeHtml(item)}</h3><p>Submissions are considered in accordance with this journal’s scope, editorial policies, and quality standards.</p></article>`).join('');
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

  const editorialSection = document.getElementById('journal-editorial-section');
  const editorialPanel = document.getElementById('journal-editorial-panel');
  const boardWrap = document.getElementById('journal-board-wrap');
  const board = document.getElementById('journal-editorial-board');
  const boardImageWrap = document.getElementById('journal-board-image-wrap');
  const boardImage = document.getElementById('journal-board-image');
  const boardImageLink = document.getElementById('journal-board-image-link');
  const boardImageSource = editorialBoardImageSrc(journal);

  if (boardImageSource && boardImage && boardImageWrap) {
    boardImage.src = boardImageSource;
    boardImage.alt = `${journal.title} editorial board and journal back page`;
    if (boardImageLink) boardImageLink.href = boardImageSource;
    boardImageWrap.hidden = false;
  } else if (boardImageWrap) {
    boardImageWrap.hidden = true;
  }

  if ((journal.editorialBoard || []).length && board) {
    board.innerHTML = journal.editorialBoard.map((member) => `<li>${escapeHtml(member)}</li>`).join('');
  } else if (boardWrap) boardWrap.hidden = true;

  const hasEditorialText = Boolean(journal.editorInChief || (journal.editorialBoard || []).length);
  if (!hasEditorialText && editorialPanel) editorialPanel.hidden = true;
  if (!hasEditorialText && !boardImageSource && editorialSection) editorialSection.hidden = true;
})();
