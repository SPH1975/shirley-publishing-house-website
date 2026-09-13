const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const readJson = (file) => JSON.parse(fs.readFileSync(file, 'utf8'));
const readFolder = (folder, includeFileName = false) => {
  if (!fs.existsSync(folder)) return [];
  return fs.readdirSync(folder)
    .filter((name) => name.endsWith('.json'))
    .map((name) => {
      const item = readJson(path.join(folder, name));
      return includeFileName ? { ...item, __fileSlug: path.basename(name, '.json') } : item;
    });
};
const slugify = (value = '') => String(value).toLowerCase().normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const unique = (values) => [...new Set(values.filter(Boolean))];
const cleanPath = (value = '') => String(value).replace(/^\//, '');
const siteUrl = 'https://shirleypublishinghouse.com';
const escapeHtml = (value = '') => String(value)
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#039;');
const absoluteUrl = (value = '') => {
  const clean = String(value || '').trim();
  if (!clean) return '';
  if (/^https?:\/\//i.test(clean)) return clean;
  return `${siteUrl}/${cleanPath(clean)}`;
};
const formatDate = (value = '') => {
  if (!value) return '';
  if (/^\d{4}$/.test(value)) return value;
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' });
};
const jsonLd = (value) => JSON.stringify(value).replace(/</g, '\\u003c');

const publications = readFolder(path.join(root, 'content', 'publications')).filter((item) => item.active !== false).map((item) => {
  const identifier = String(item.identifier || '').trim();
  const title = String(item.title || 'Untitled Publication').trim();
  const cover = cleanPath(item.cover || '');
  return {
    ...item,
    id: item.id || `${slugify(title)}-${identifier.replace(/[^0-9a-z]+/gi, '') || Date.now()}`,
    title,
    author: String(item.author || '').trim(),
    publisher: item.publisher || 'Shirley Publishing House',
    year: Number(item.year) || new Date().getFullYear(),
    cover,
    abstract: String(item.abstract || '').trim(),
    keywords: Array.isArray(item.keywords) ? unique(item.keywords.map(String)) : [],
    accessUrl: item.accessUrl || 'contact.html',
    accessLabel: item.accessLabel || 'Inquire About This Publication',
    featured: Boolean(item.featured),
  };
}).sort((a, b) => (b.year - a.year) || a.title.localeCompare(b.title));

const journals = readFolder(path.join(root, 'content', 'journals'), true)
  .map((item) => {
    const title = String(item.title || 'Untitled Journal').trim();
    const id = slugify(item.urlSlug || item.__fileSlug || title);
    const { __fileSlug, ...journalData } = item;
    return {
      ...journalData,
      id,
      title,
      shortTitle: String(item.shortTitle || title).trim(),
      issn: String(item.issn || '').trim(),
      onlineIssn: String(item.onlineIssn || '').trim(),
      cover: cleanPath(item.cover || ''),
      editorialBoardImage: cleanPath(item.editorialBoardImage || ''),
      journalFile: cleanPath(item.journalFile || ''),
      downloadLabel: String(item.downloadLabel || 'Download Full Journal (PDF)').trim(),
      description: String(item.description || '').trim(),
      scope: String(item.scope || '').trim(),
      disciplines: Array.isArray(item.disciplines) ? unique(item.disciplines.map(String)) : [],
      publicationFrequency: String(item.publicationFrequency || '').trim(),
      format: String(item.format || '').trim(),
      currentVolumeIssue: String(item.currentVolumeIssue || '').trim(),
      establishedYear: String(item.establishedYear || '').trim(),
      editorInChief: String(item.editorInChief || '').trim(),
      editorialBoard: Array.isArray(item.editorialBoard) ? unique(item.editorialBoard.map(String)) : [],
      acceptedWorks: Array.isArray(item.acceptedWorks) ? unique(item.acceptedWorks.map(String)) : [],
      preparationGuidelines: Array.isArray(item.preparationGuidelines) ? unique(item.preparationGuidelines.map(String)) : [],
      editorialCriteria: Array.isArray(item.editorialCriteria) ? unique(item.editorialCriteria.map(String)) : [],
      submissionUrl: item.submissionUrl || 'submit.html',
      publicationsUrl: item.publicationsUrl || 'repository.html',
      featured: Boolean(item.featured),
      active: item.active !== false,
    };
  })
  .filter((item) => item.active)
  .sort((a, b) => Number(b.featured) - Number(a.featured) || a.title.localeCompare(b.title));

const journalArticles = readFolder(path.join(root, 'content', 'journal-articles'), true).map((item) => {
    const title = String(item.title || 'Untitled Article').trim();
    const { __fileSlug, ...articleData } = item;
    return {
      ...articleData,
      id: slugify(item.id || __fileSlug || title),
      journalId: slugify(item.journalId || ''),
      title,
      authors: Array.isArray(item.authors) ? unique(item.authors.map(String)) : [],
      abstract: String(item.abstract || '').trim(),
      keywords: Array.isArray(item.keywords) ? unique(item.keywords.map(String)) : [],
      volume: String(item.volume || '').trim(),
      issue: String(item.issue || '').trim(),
      issueLabel: String(item.issueLabel || '').trim(),
      publicationDate: String(item.publicationDate || '').trim(),
      originalPublicationPeriod: String(item.originalPublicationPeriod || '').trim(),
      digitizedDate: String(item.digitizedDate || '').trim(),
      pages: String(item.pages || '').trim(),
      doi: String(item.doi || '').trim(),
      articleType: String(item.articleType || 'Research Article').trim(),
      pdfFile: cleanPath(item.pdfFile || ''),
      featured: Boolean(item.featured),
      active: item.active !== false,
    };
  })
  .filter((item) => item.active && item.journalId)
  .sort((a, b) => String(b.publicationDate).localeCompare(String(a.publicationDate)) || a.title.localeCompare(b.title));

const pages = Object.fromEntries(readFolder(path.join(root, 'content', 'pages')).map((page) => [page.page, page]));
const services = readFolder(path.join(root, 'content', 'services')).sort((a, b) => (Number(a.order) || 999) - (Number(b.order) || 999));
const site = readJson(path.join(root, 'content', 'site-settings.json'));

const journalPageUrl = (journal) => `journal-${journal.id}.html`;
const articlePageUrl = (article) => `article-${article.id}.html`;
const journalDirectoryCard = (journal) => {
  const tags = (journal.disciplines || []).slice(0, 4).map((item) => `<span>${escapeHtml(item)}</span>`).join('');
  const facts = [
    journal.issn ? `<span><small>Print ISSN</small><strong>${escapeHtml(journal.issn)}</strong></span>` : '',
    journal.onlineIssn ? `<span><small>Online ISSN</small><strong>${escapeHtml(journal.onlineIssn)}</strong></span>` : '',
    journal.publicationFrequency ? `<span><small>Frequency</small><strong>${escapeHtml(journal.publicationFrequency)}</strong></span>` : '',
    journal.currentVolumeIssue ? `<span><small>Current Issue</small><strong>${escapeHtml(journal.currentVolumeIssue)}</strong></span>` : '',
  ].filter(Boolean).join('');
  return `<article class="journal-directory-card${journal.featured ? ' featured-journal' : ''}">
    <a class="journal-card-cover" href="${journalPageUrl(journal)}" aria-label="View ${escapeHtml(journal.title)}"><img src="${escapeHtml(journal.cover || 'assets/journal-cover-official.png')}" alt="${escapeHtml(journal.title)} cover" loading="lazy"></a>
    <div class="journal-card-body"><div class="journal-card-topline"><span class="journal-status">${journal.featured ? 'Featured journal' : 'Academic journal'}</span>${journal.issn ? `<span class="journal-issn">Print ISSN ${escapeHtml(journal.issn)}</span>` : ''}</div>
    <h2><a href="${journalPageUrl(journal)}">${escapeHtml(journal.shortTitle || journal.title)}</a></h2><p>${escapeHtml(journal.description)}</p>
    ${tags ? `<div class="scope-tags journal-card-tags">${tags}</div>` : ''}${facts ? `<div class="journal-card-facts">${facts}</div>` : ''}
    <div class="journal-card-actions"><a class="btn btn-primary" href="${journalPageUrl(journal)}">View Journal</a><a class="btn btn-secondary" href="${escapeHtml(journal.submissionUrl || 'submit.html')}">Submit an Article</a></div></div>
  </article>`.replace(/[ \t]+$/gm, '');
};

const publicationDirectoryCard = (item) => {
  const meta = [
    item.type,
    item.year,
    item.volume || item.edition,
    item.identifierLabel && item.identifier ? `${item.identifierLabel} ${item.identifier}` : '',
  ].filter(Boolean).join(' · ');
  const initials = String(item.title || 'Publication').split(/\s+/).slice(0, 3)
    .map((word) => word[0] || '').join('').toUpperCase();
  const cover = item.cover
    ? `<div class="repository-cover has-cover"><div class="repository-cover-placeholder" aria-hidden="true"><span>${escapeHtml(initials)}</span><small>Shirley Publishing House</small></div><img src="${escapeHtml(item.cover)}" alt="Cover of ${escapeHtml(item.title)}" loading="lazy"></div>`
    : `<div class="repository-cover repository-cover-fallback"><div class="repository-cover-placeholder" aria-hidden="true"><span>${escapeHtml(initials)}</span><small>Shirley Publishing House</small></div></div>`;
  return `<article class="repository-card" data-publication-id="${escapeHtml(item.id)}">
    ${cover}<div class="repository-card-body">
      <div class="repository-card-topline"><span class="repository-type-badge">${escapeHtml(item.type || 'Publication')}</span>${item.featured ? '<span class="repository-featured">Featured</span>' : ''}</div>
      <h3>${escapeHtml(item.title)}</h3>
      <p class="repository-author">${escapeHtml(item.author || 'Author not specified')}</p>
      <p class="repository-meta">${escapeHtml(meta)}</p>
      ${item.abstract ? `<p class="repository-description">${escapeHtml(item.abstract)}</p>` : ''}
      ${item.accessUrl ? `<div class="repository-card-actions"><a class="repository-access-button" href="${escapeHtml(item.accessUrl)}">${escapeHtml(item.accessLabel || 'Open Publication')}</a></div>` : ''}
    </div>
  </article>`.replace(/[ \t]+$/gm, '');
};

const pageShell = ({ title, description, canonical, head = '', body }) => `<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${escapeHtml(title)}</title><meta name="description" content="${escapeHtml(description)}"><link rel="canonical" href="${escapeHtml(canonical)}">
<link href="assets/favicon.png" rel="icon" type="image/png"><link href="styles.css" rel="stylesheet">${head}</head>
<body><a class="skip-link" href="#main-content">Skip to content</a>
<header class="site-header" id="top"><div class="container header-inner"><a class="brand" href="index.html" aria-label="Shirley Publishing House home"><img src="assets/shirley-logo-transparent.png" alt="Shirley Publishing House official logo"></a><nav class="main-nav" aria-label="Main navigation"><a href="index.html">Home</a><a href="about.html">About Us</a><a class="nav-active" href="journal.html">Journals</a><a href="repository.html">Archives</a><a href="publication-ethics.html">Publication Ethics</a><a href="contact.html">Contact Us</a></nav></div></header>
<main id="main-content">${body}</main>
<footer class="site-footer"><div class="container footer-main"><div class="footer-brand-wrap"><a class="footer-brand" href="index.html"><img src="assets/shirley-logo-transparent.png" alt="Shirley Publishing House logo"></a><p>Quality publication, academic support, registration assistance, printing, and binding services.</p></div><div><h3>Explore</h3><a href="journal.html">Our Journals</a><a href="repository.html">Archives</a><a href="authors.html">Author Guidelines</a></div><div><h3>Journal Policies</h3><a href="/national-research-journal/open-access-policy">Open Access Policy</a><a href="/national-research-journal/digital-preservation">Digital Preservation</a></div><div><h3>Contact</h3><a href="mailto:${escapeHtml(site.email)}">${escapeHtml(site.email)}</a><span>${escapeHtml(site.location)}</span></div></div></footer>
<script src="script.js"></script></body></html>`;

const journalLandingPage = (journal) => {
  const articles = journalArticles.filter((article) => article.journalId === journal.id);
  const editorialGroups = Array.isArray(journal.editorialBoardGroups) ? journal.editorialBoardGroups : [];
  const editorialMembers = editorialGroups.flatMap((group) => (group.members || []).map((member) => ({ ...member, role: group.role })));
  const editorialBoard = editorialGroups.length ? `<section class="section" aria-labelledby="editorial-board-title"><div class="container">
    <div class="journal-panel-heading"><p class="eyebrow">Editorial governance</p><h2 id="editorial-board-title">Editorial Board</h2><p>The following appointments apply to ${escapeHtml(journal.shortTitle || journal.title)}. Editorial roles are distinguished from art, layout, and production responsibilities.</p></div>
    <div class="editorial-board-grid">${editorialGroups.map((group) => `<section class="editorial-board-group"><h3>${escapeHtml(group.role)}</h3><div class="editorial-board-members">${(group.members || []).map((member) => {
      const name = `${member.name || ''}${member.credentials ? `, ${member.credentials}` : ''}`;
      const profileUrl = String(member.profileUrl || member.orcid || '').trim();
      return `<article class="editorial-board-member"><h4>${profileUrl ? `<a href="${escapeHtml(profileUrl)}" target="_blank" rel="noopener">${escapeHtml(name)}</a>` : escapeHtml(name)}</h4>${member.affiliation ? `<p>${escapeHtml(member.affiliation)}</p>` : ''}${member.country ? `<p class="editorial-board-country">${escapeHtml(member.country)}</p>` : ''}${member.orcid ? `<a class="editorial-board-id" href="${escapeHtml(member.orcid)}" target="_blank" rel="noopener">ORCID</a>` : ''}</article>`;
    }).join('')}</div></section>`).join('')}</div>
  </div></section>` : '';
  const groups = new Map();
  articles.forEach((article) => {
    const key = `${article.volume || ''}::${article.issue || ''}::${article.issueLabel || ''}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(article);
  });
  const archive = [...groups.entries()].sort(([a], [b]) => {
    const [av, ai] = a.split('::').map(Number);
    const [bv, bi] = b.split('::').map(Number);
    return bv - av || bi - ai;
  }).map(([key, issueArticles]) => {
    const [volume, issue, issueLabel] = key.split('::');
    const preIssn = journal.id === 'national-research-journal' && ['1', '2'].includes(volume) && journal.preIssnNotice;
    return `<section class="journal-issue-group"><header><div><p class="eyebrow">Journal issue</p><h2>Volume ${escapeHtml(volume)} Issue No. ${escapeHtml(issue)}</h2></div><span>${escapeHtml(issueLabel)}</span></header>
      ${preIssn ? `<p class="dialog-repository-note">${escapeHtml(journal.preIssnNotice)}</p>` : ''}
      <div class="journal-article-list">${issueArticles.map((article) => `<article class="journal-article-card"><div class="journal-article-main"><div class="journal-article-type">${escapeHtml(article.articleType)}</div><h3><a href="${articlePageUrl(article)}">${escapeHtml(article.title)}</a></h3><p class="journal-article-authors">${escapeHtml((article.authors || []).join(', '))}</p><div class="journal-article-meta"><span>Original publication: ${escapeHtml(article.originalPublicationPeriod || article.publicationDate)}</span>${article.pages ? `<span>Pages ${escapeHtml(article.pages)}</span>` : ''}</div></div><div class="journal-article-action"><a class="btn btn-primary" href="${articlePageUrl(article)}">Article details</a></div></article>`).join('')}</div></section>`;
  }).join('');
  const facts = [['Print ISSN', journal.issn], ['Online ISSN', journal.onlineIssn], ['Publisher', 'Shirley Publishing House'], ['Publication frequency', journal.publicationFrequency], ['Established', journal.establishedYear], ['Effectivity date', journal.effectivityDate], ['ISSN assignment', journal.issnAssignedYear ? `ISSN ${journal.issn} assigned in ${journal.issnAssignedYear}` : '']]
    .filter(([, value]) => value).map(([label, value]) => `<div class="journal-fact"><span>${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong></div>`).join('');
  const issnVerification = journal.id === 'national-research-journal' ? `<section class="section journal-issn-verification-section" aria-labelledby="journal-issn-verification-title"><div class="container"><div class="journal-issn-verification-card">
    <div class="journal-issn-verification-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M12 2.75 14.4 5l3.25-.12.8 3.15 2.7 1.8-1.05 3.08 1.05 3.08-2.7 1.8-.8 3.15-3.25-.12L12 23.07l-2.4-2.25-3.25.12-.8-3.15-2.7-1.8 1.05-3.08-1.05-3.08 2.7-1.8.8-3.15L9.6 5 12 2.75Z"/><path class="journal-issn-verification-check" d="m8.15 12.35 2.35 2.35 5.35-5.4"/></svg></div>
    <div class="journal-issn-verification-copy"><p class="eyebrow">ISSN Verification</p><h2 id="journal-issn-verification-title">Verify the Journal’s ISSN</h2><p>National Research Journal is registered under <strong>Print ISSN 2960-3625</strong>. Readers, authors, librarians and indexing services may verify the journal’s registration through the official ISSN International Portal and the National Library of the Philippines.</p>
    <div class="journal-issn-verification-actions"><a class="btn btn-primary journal-external-link" href="https://portal.issn.org/resource/ISSN/2960-3625" target="_blank" rel="noopener noreferrer" aria-label="Verify National Research Journal Print ISSN 2960-3625 on the ISSN International Portal (opens in a new tab)">Verify on ISSN International Portal <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14 5h5v5M19 5l-8 8M18 13v6H5V6h6"/></svg></a><a class="btn btn-secondary journal-external-link" href="https://web.nlp.gov.ph/issn/" target="_blank" rel="noopener noreferrer" aria-label="View the official National Library of the Philippines ISSN page (opens in a new tab)">View NLP ISSN Directory <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14 5h5v5M19 5l-8 8M18 13v6H5V6h6"/></svg></a></div></div>
  </div></div></section>` : '';
  const aboutJournal = journal.id === 'national-research-journal' ? `<section class="section about-journal-section" id="about-the-journal" aria-labelledby="about-journal-title"><div class="container">
    <div class="journal-panel-heading"><p class="eyebrow">National Research Journal</p><h2 id="about-journal-title">About the Journal</h2><p>A complete public profile of the journal’s scope, audience, publication model, identification and history.</p></div>
    <div class="about-journal-grid">
      <section class="about-journal-card about-journal-wide" id="journal-overview"><h3>Journal Overview</h3><p>National Research Journal is a multidisciplinary, English-language scholarly journal published by Shirley Publishing House. It provides an accessible venue for original, evidence-based and ethically conducted research addressing educational, institutional, scientific, technological, social, economic and national-development concerns.</p></section>
      <section class="about-journal-card about-journal-wide" id="aims-and-scope"><h3>Aims and Scope</h3><p>National Research Journal aims to disseminate original and methodologically sound scholarship, promote ethical and transparent research practices, support evidence-informed professional and institutional decision-making, and increase public access to research relevant to Philippine and international communities.</p><p>The journal considers scholarly contributions in the following fields:</p><ul class="check-list"><li>Education, teaching and learning;</li><li>Educational leadership and administration;</li><li>Social sciences and humanities;</li><li>Science, technology and applied research;</li><li>Business, management and entrepreneurship;</li><li>Public administration, governance and policy;</li><li>Community, rural and sustainable development;</li><li>Institutional and organizational development;</li><li>Indigenous knowledge, culture and locally grounded research;</li><li>Health, well-being and social-development studies; and</li><li>Interdisciplinary research addressing regional, national and international concerns.</li></ul><p>A manuscript must present a clear scholarly contribution and fall within the competence of the journal’s editors and independent reviewers. The journal may decline submissions outside its editorial or peer-review capacity.</p></section>
      <section class="about-journal-card" id="primary-audience"><h3>Primary Scholarly Audience</h3><p>National Research Journal primarily serves:</p><ul class="check-list"><li>Researchers and scholars;</li><li>Teachers, professors and educational leaders;</li><li>Graduate students and research advisers;</li><li>Government and institutional researchers;</li><li>Policy professionals and public administrators;</li><li>Community-development practitioners;</li><li>Professionals seeking research applicable to their respective fields;</li><li>Academic and research institutions; and</li><li>Libraries and scholarly information services.</li></ul></section>
      <section class="about-journal-card" id="article-types"><h3>Types of Articles Accepted</h3><p>National Research Journal considers:</p><ul class="check-list"><li>Original Research Articles;</li><li>Systematic Reviews;</li><li>Scoping Reviews;</li><li>Integrative Reviews;</li><li>Critical Reviews;</li><li>Methodological Articles;</li><li>Policy Analyses;</li><li>Evidence-based Case Studies;</li><li>Conceptual Articles presenting an original scholarly framework;</li><li>Research Notes containing a defined scholarly contribution; and</li><li>Invited Scholarly Perspectives.</li></ul><p>Original research and other scholarly articles published from the first issue of 2022 onward are subject to editorial assessment and external peer review by at least two independent reviewers.</p><p>Editorials, announcements, publisher’s notes, corrections, expressions of concern and retraction notices must be clearly identified and must not be represented as peer-reviewed research articles.</p><p>Thesis or dissertation material may be considered only when developed into a complete, independently readable journal article that meets the journal’s authorship, originality, reporting and peer-review requirements.</p></section>
      <section class="about-journal-card" id="language"><h3>Language</h3><p>National Research Journal accepts and publishes manuscripts in English.</p><p>Articles involving Philippine or Indigenous languages may include original-language terms, quotations, research instruments or source materials when accompanied by sufficient English translation or explanation for scholarly evaluation and reader comprehension.</p></section>
      <section class="about-journal-card" id="publication-schedule"><h3>Publication Frequency and Schedule</h3><p>National Research Journal is published semiannually, meaning twice each calendar year:</p><ul class="check-list"><li>Issue No. 1 covers January–June.</li><li>Issue No. 2 covers July–December.</li></ul><p>Each issue must clearly display its volume, issue number, coverage period and actual publication date. Any material delay or change to the publication schedule must be disclosed transparently on the journal website.</p></section>
      <section class="about-journal-card" id="journal-identification"><h3>Journal Identification</h3><dl class="about-journal-facts"><div><dt>Journal title</dt><dd>National Research Journal</dd></div><div><dt>Publisher</dt><dd>Shirley Publishing House</dd></div><div><dt>Publication format identified by the ISSN</dt><dd>Print</dd></div><div><dt>Print ISSN</dt><dd>2960-3625</dd></div><div><dt>ISSN-L</dt><dd>2960-3625</dd></div><div><dt>Country of publication</dt><dd>Philippines</dd></div><div><dt>Primary publication language</dt><dd>English</dd></div><div><dt>Publication frequency</dt><dd>Semiannual</dd></div><div><dt>Issue schedule</dt><dd>January–June and July–December</dd></div></dl><a class="btn btn-primary journal-external-link" href="https://portal.issn.org/resource/ISSN/2960-3625" target="_blank" rel="noopener noreferrer" aria-label="Verify Print ISSN 2960-3625 on the official ISSN Portal in a new tab">Verify ISSN 2960-3625 <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14 5h5v5M19 5l-8 8M18 13v6H5V6h6"/></svg></a></section>
      <section class="about-journal-card" id="publisher-information"><h3>Publisher Information</h3><dl class="about-journal-facts"><div><dt>Legal publisher name</dt><dd>Shirley Publishing House</dd></div><div><dt>Publisher address</dt><dd>Kasibu, Nueva Vizcaya 3703, Philippines</dd></div><div><dt>Country</dt><dd>Philippines</dd></div><div><dt>Official website</dt><dd><a href="https://shirleypublishinghouse.com/" aria-label="Visit the official Shirley Publishing House website">shirleypublishinghouse.com</a></dd></div></dl><p>This information is provided for authors, readers, libraries, indexing services and journal evaluators.</p></section>
      <section class="about-journal-card about-journal-wide" id="publication-history"><h3>Establishment and Publication History</h3><p>National Research Journal was initiated in 2020 as a locally produced pre-ISSN publication of Shirley Publishing House and participating educators.</p><p>Volumes 1 and 2, covering 2020 and 2021, constitute the journal’s pre-ISSN founding period. These issues were produced before Print ISSN 2960-3625 was assigned and before the journal introduced its current formal external peer-review process.</p><p>Print ISSN 2960-3625 was assigned by the Philippine ISSN National Centre in 2022. Formal external peer review began with the first issue published in 2022.</p><p>The early issues were subsequently digitized and made accessible through the journal website. Their original publication periods must be presented separately from their later digitization or online-upload dates.</p></section>
      <section class="about-journal-card about-journal-wide" id="peer-review-history"><h3>Peer-Review History</h3><p>National Research Journal introduced formal external peer review beginning with its first issue of 2022, following the assignment of Print ISSN 2960-3625. From that issue onward, every scholarly research article is required to undergo assessment by at least two independent reviewers before an editorial decision is made.</p><p>Articles published during the 2020–2021 pre-ISSN period did not undergo the formal external peer-review process introduced in 2022. They are retained as clearly labelled legacy content and must not be represented as externally peer-reviewed articles.</p></section>
    </div>
  </div></section>` : '';
  const openAccessPolicy = journal.id === 'national-research-journal' ? `<section class="section journal-open-access-section" id="open-access-policy" aria-labelledby="journal-open-access-title"><div class="container"><div class="journal-open-access-card">
    <div class="journal-open-access-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M7 11V8a5 5 0 0 1 9.65-1.84"/><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M12 15v2"/></svg></div>
    <div class="journal-open-access-copy"><p class="eyebrow">Open Access Policy</p><h2 id="journal-open-access-title">Immediate and Free Reader Access</h2><p>National Research Journal provides immediate open access to all published content. Readers may access, read, download, copy, distribute, print, search and link to articles without registration, subscription or embargo, subject to the applicable Creative Commons licence.</p>
    <ul class="open-access-confirmations"><li>No embargo period</li><li>No reader registration required</li><li>No subscription required</li><li>Full-text articles are freely accessible and downloadable</li><li>Machine crawling, harvesting and indexing are permitted</li><li>Articles may be shared and reused subject to their applicable Creative Commons licence</li></ul>
    <a class="btn btn-primary" href="/national-research-journal/open-access-policy" aria-label="Read the complete National Research Journal open access policy">Read the Complete Open Access Policy</a></div>
  </div></div></section>` : '';
  const journalNavigation = journal.id === 'national-research-journal' ? `<nav class="journal-local-nav" aria-label="National Research Journal page and policy navigation"><div class="container"><a href="#journal-information">Journal Information</a><a href="#issn-verification">ISSN Verification</a><a href="#about-the-journal">About the Journal</a><a href="#open-access-policy">Open Access Policy</a><a href="/national-research-journal/digital-preservation" aria-label="Read the National Research Journal digital preservation policy">Digital Preservation</a><a href="#published-articles">Published Articles</a></div></nav>` : '';
  const schema = { '@context': 'https://schema.org', '@type': 'Periodical', name: journal.title, issn: [journal.issn, journal.onlineIssn].filter(Boolean), inLanguage: 'English', additionalProperty: [{ '@type': 'PropertyValue', name: 'Publication frequency', value: journal.publicationFrequency }], publisher: { '@type': 'Organization', name: 'Shirley Publishing House', address: { '@type': 'PostalAddress', addressLocality: 'Kasibu', addressRegion: 'Nueva Vizcaya', postalCode: '3703', addressCountry: 'PH' } }, editor: editorialMembers.map((member) => ({ '@type': 'Person', name: member.name, honorificSuffix: member.credentials || undefined, affiliation: member.affiliation ? { '@type': 'Organization', name: member.affiliation } : undefined, url: member.profileUrl || member.orcid || undefined })), url: absoluteUrl(journalPageUrl(journal)), description: journal.description };
  const pageTitle = journal.id === 'national-research-journal' ? 'National Research Journal: About, Scope and Policies | Shirley Publishing House' : `${journal.shortTitle || journal.title} | Shirley Publishing House`;
  const pageDescription = journal.id === 'national-research-journal' ? 'Official homepage of National Research Journal, Print ISSN 2960-3625: aims, scope, audience, article types, publication schedule, publisher, peer-review history, policies and archive.' : journal.description;
  return pageShell({ title: pageTitle, description: pageDescription, canonical: absoluteUrl(journalPageUrl(journal)), head: `<script type="application/ld+json">${jsonLd(schema)}</script>`, body: `<section class="page-hero"><div class="container page-hero-inner"><div class="breadcrumbs"><a href="index.html">Home</a> / <a href="journal.html">Journals</a> / ${escapeHtml(journal.shortTitle || journal.title)}</div><p class="eyebrow">Journal profile</p><h1>${escapeHtml(journal.title)}</h1><p>${escapeHtml(journal.description)}</p></div></section>${journalNavigation}<section class="section" id="journal-information"><div class="container"><div class="journal-profile"><div class="journal-profile-cover"><img src="${escapeHtml(journal.cover || 'assets/journal-cover-official.png')}" alt="${escapeHtml(journal.title)} cover"></div><div class="journal-profile-content"><p class="eyebrow">Journal information</p><div class="journal-facts">${facts}</div>${journal.historyNotice && journal.id !== 'national-research-journal' ? `<aside class="repository-disclaimer"><span class="repository-disclaimer-icon" aria-hidden="true">i</span><div><h2>Publication History</h2><p>${escapeHtml(journal.historyNotice)}</p></div></aside>` : ''}</div></div></div></section>${issnVerification.replace('aria-labelledby="journal-issn-verification-title"', 'id="issn-verification" aria-labelledby="journal-issn-verification-title"')}${aboutJournal}${openAccessPolicy}${editorialBoard}<section class="section section-soft" id="published-articles"><div class="container"><div class="journal-panel-heading"><p class="eyebrow">Archive</p><h2>Published articles</h2><p>${articles.length} article${articles.length === 1 ? '' : 's'} listed with crawlable individual landing pages.</p></div>${archive || '<p>No articles are currently listed.</p>'}</div></section>` });
};

const articleLandingPage = (article) => {
  const journal = journals.find((item) => item.id === article.journalId);
  const authors = article.authors || [];
  const period = article.originalPublicationPeriod || article.issueLabel || formatDate(article.publicationDate);
  const pageParts = String(article.pages || '').split(/[–—-]/).map((item) => item.trim());
  const scholarMeta = [`<meta name="citation_title" content="${escapeHtml(article.title)}">`, ...authors.map((author) => `<meta name="citation_author" content="${escapeHtml(author)}">`), `<meta name="citation_journal_title" content="${escapeHtml(journal?.title || '')}">`, journal?.issn ? `<meta name="citation_issn" content="${escapeHtml(journal.issn)}">` : '', article.publicationDate ? `<meta name="citation_publication_date" content="${escapeHtml(article.publicationDate)}">` : '', article.volume ? `<meta name="citation_volume" content="${escapeHtml(article.volume)}">` : '', article.issue ? `<meta name="citation_issue" content="${escapeHtml(article.issue)}">` : '', pageParts[0] ? `<meta name="citation_firstpage" content="${escapeHtml(pageParts[0])}">` : '', pageParts[1] ? `<meta name="citation_lastpage" content="${escapeHtml(pageParts[1])}">` : '', article.pdfFile ? `<meta name="citation_pdf_url" content="${escapeHtml(absoluteUrl(article.pdfFile))}">` : ''].filter(Boolean).join('');
  const schema = { '@context': 'https://schema.org', '@type': 'ScholarlyArticle', headline: article.title, author: authors.map((name) => ({ '@type': 'Person', name })), isPartOf: { '@type': 'Periodical', name: journal?.title, issn: journal?.issn }, datePublished: article.publicationDate || undefined, pagination: article.pages || undefined, keywords: article.keywords || [], abstract: article.abstract || undefined, url: absoluteUrl(articlePageUrl(article)), encoding: article.pdfFile ? { '@type': 'MediaObject', contentUrl: absoluteUrl(article.pdfFile), encodingFormat: 'application/pdf' } : undefined };
  const nrjPolicyLink = journal?.id === 'national-research-journal' ? `<a class="btn btn-secondary" href="/national-research-journal/open-access-policy" aria-label="Read the National Research Journal open access policy">Open Access Policy</a><a class="btn btn-secondary" href="/national-research-journal/digital-preservation" aria-label="Read the National Research Journal digital preservation and persistent access policy">Digital Preservation</a>` : '';
  const legacyNotice = journal?.id === 'national-research-journal' && ['1', '2'].includes(String(article.volume)) && journal.preIssnNotice ? `<aside class="repository-disclaimer legacy-article-notice" aria-label="Legacy pre-ISSN content notice"><span class="repository-disclaimer-icon" aria-hidden="true">i</span><div><h2>Pre-ISSN Notice</h2><p>${escapeHtml(journal.preIssnNotice)}</p></div></aside>` : '';
  return pageShell({ title: `${article.title} | ${journal?.shortTitle || journal?.title || 'Shirley Publishing House'}`, description: article.abstract || `${article.title}, published in ${journal?.title || 'a Shirley Publishing House journal'}.`, canonical: absoluteUrl(articlePageUrl(article)), head: `${scholarMeta}<script type="application/ld+json">${jsonLd(schema)}</script>`, body: `<section class="page-hero"><div class="container page-hero-inner"><div class="breadcrumbs"><a href="index.html">Home</a> / <a href="journal.html">Journals</a> / <a href="${journal ? journalPageUrl(journal) : 'journal.html'}">${escapeHtml(journal?.shortTitle || journal?.title || 'Journal')}</a> / Article</div><p class="eyebrow">${escapeHtml(article.articleType || 'Scholarly article')}</p><h1>${escapeHtml(article.title)}</h1><p>${escapeHtml(authors.join(', '))}</p></div></section><section class="section"><div class="container"><article class="content-card"><div class="journal-article-meta"><span>${escapeHtml(journal?.title || '')}</span><span>Volume ${escapeHtml(article.volume)}, Issue ${escapeHtml(article.issue)}</span>${article.pages ? `<span>Pages ${escapeHtml(article.pages)}</span>` : ''}</div>${legacyNotice}<h2>Publication record</h2><dl class="journal-facts"><div class="journal-fact"><dt>Original publication period</dt><dd>${escapeHtml(period)}</dd></div>${article.digitizedDate ? `<div class="journal-fact"><dt>Digitized / uploaded online</dt><dd>${escapeHtml(formatDate(article.digitizedDate))}</dd></div>` : ''}${article.doi ? `<div class="journal-fact"><dt>DOI</dt><dd>${escapeHtml(article.doi)}</dd></div>` : ''}</dl>${article.digitizedDate ? '<p class="dialog-repository-note">The digitization/upload date records when this file was added to the website; it is not the article\'s original publication date.</p>' : ''}<h2>Abstract</h2><p>${escapeHtml(article.abstract || 'Abstract not provided.')}</p>${(article.keywords || []).length ? `<div class="scope-tags">${article.keywords.map((keyword) => `<span>${escapeHtml(keyword)}</span>`).join('')}</div>` : ''}<div class="hero-actions">${article.pdfFile ? `<a class="btn btn-primary" href="${escapeHtml(article.pdfFile)}" target="_blank" rel="noopener">View / Download PDF</a>` : ''}${nrjPolicyLink}</div></article></div></section>` });
};

const directoryPath = path.join(root, 'journal.html');
const directoryHtml = fs.readFileSync(directoryPath, 'utf8');
const directoryStart = '<!-- JOURNAL_DIRECTORY_START -->';
const directoryEnd = '<!-- JOURNAL_DIRECTORY_END -->';
if (!directoryHtml.includes(directoryStart) || !directoryHtml.includes(directoryEnd)) throw new Error('Journal directory render markers are missing.');
fs.writeFileSync(directoryPath, directoryHtml.replace(new RegExp(`${directoryStart}[\\s\\S]*?${directoryEnd}`), `${directoryStart}${journals.map(journalDirectoryCard).join('')}${directoryEnd}`));

const repositoryPath = path.join(root, 'repository.html');
let repositoryHtml = fs.readFileSync(repositoryPath, 'utf8');
const repositoryGridPattern = /<div aria-live="polite" class="repository-grid" id="repository-grid">(?:<!-- REPOSITORY_STATIC_START -->[\s\S]*?<!-- REPOSITORY_STATIC_END -->)?<\/div>/;
if (!repositoryGridPattern.test(repositoryHtml)) throw new Error('Repository grid render target is missing.');
const staticRepositoryCards = publications.map(publicationDirectoryCard).join('');
repositoryHtml = repositoryHtml
  .replace(repositoryGridPattern, `<div aria-live="polite" class="repository-grid" id="repository-grid"><!-- REPOSITORY_STATIC_START -->${staticRepositoryCards}<!-- REPOSITORY_STATIC_END --></div>`)
  .replace(/<p id="repository-count">[\s\S]*?<\/p>/, `<p id="repository-count">${publications.length} publications available</p>`);
fs.writeFileSync(repositoryPath, repositoryHtml);

journals.forEach((journal) => fs.writeFileSync(path.join(root, journalPageUrl(journal)), journalLandingPage(journal)));
journalArticles.forEach((article) => fs.writeFileSync(path.join(root, articlePageUrl(article)), articleLandingPage(article)));

const primaryNavigationPages = {
  'index.html': 'home',
  'about.html': 'about',
  'services.html': 'services',
  'journal.html': 'journals',
  'repository.html': 'archives',
  'publication-ethics.html': 'ethics',
  'authors.html': '',
  'submit.html': '',
  'contact.html': 'contact',
};
const primaryNavigation = (active = '') => {
  const link = (key, href, label) => `<a${active === key ? ' aria-current="page" class="nav-active"' : ''} href="${href}">${label}</a>`;
  return `<nav aria-label="Main navigation" class="main-nav" id="main-nav">
${link('home', 'index.html', 'Home')}${link('about', 'about.html', 'About Us')}${link('journals', 'journal.html', 'Journals')}${link('services', 'services.html', 'Services')}${link('archives', 'repository.html', 'Archives')}${link('ethics', 'publication-ethics.html', 'Publication Ethics')}${link('contact', 'contact.html', 'Contact Us')}
<a class="nav-cta" href="submit.html">Submit Manuscript</a>
</nav>`;
};
Object.entries(primaryNavigationPages).forEach(([file, active]) => {
  const pagePath = path.join(root, file);
  const html = fs.readFileSync(pagePath, 'utf8');
  const navigationPattern = /<nav(?=[^>]*class="main-nav")[^>]*>[\s\S]*?<\/nav>/;
  if (!navigationPattern.test(html)) throw new Error(`Main navigation is missing from ${file}.`);
  fs.writeFileSync(pagePath, html.replace(navigationPattern, primaryNavigation(active)));
});

const staticPages = ['index.html', 'about.html', 'services.html', 'journal.html', 'repository.html', 'publication-ethics.html', 'authors.html', 'submit.html', 'contact.html'];
const policyPages = ['national-research-journal/open-access-policy', 'national-research-journal/digital-preservation'];
const sitemapUrls = [...staticPages, ...policyPages, ...journals.map(journalPageUrl), ...journalArticles.map(articlePageUrl)];
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${sitemapUrls.map((url) => `  <url><loc>${escapeHtml(absoluteUrl(url))}</loc></url>`).join('\n')}\n</urlset>\n`;
fs.writeFileSync(path.join(root, 'sitemap.xml'), sitemap);

fs.writeFileSync(path.join(root, 'repository-data.json'), `${JSON.stringify(publications, null, 2)}\n`);
fs.writeFileSync(path.join(root, 'repository-data.js'), `window.SHIRLEY_REPOSITORY = ${JSON.stringify(publications, null, 2)};\n`);
fs.writeFileSync(path.join(root, 'journals-data.json'), `${JSON.stringify(journals, null, 2)}\n`);
fs.writeFileSync(path.join(root, 'journals-data.js'), `window.SHIRLEY_JOURNALS = ${JSON.stringify(journals, null, 2)};\n`);
fs.writeFileSync(path.join(root, 'journal-articles-data.json'), `${JSON.stringify(journalArticles, null, 2)}\n`);
fs.writeFileSync(path.join(root, 'journal-articles-data.js'), `window.SHIRLEY_JOURNAL_ARTICLES = ${JSON.stringify(journalArticles, null, 2)};\n`);
fs.writeFileSync(path.join(root, 'cms-data.js'), `window.SHIRLEY_CMS = ${JSON.stringify({ site, pages, services }, null, 2)};\n`);
console.log(`Built ${publications.length} publications, ${journals.length} journals, ${journalArticles.length} journal articles, ${services.length} services, and ${Object.keys(pages).length} page records.`);
