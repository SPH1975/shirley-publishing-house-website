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
    journal.issn ? `<span><small>ISSN</small><strong>${escapeHtml(journal.issn)}</strong></span>` : '',
    journal.publicationFrequency ? `<span><small>Frequency</small><strong>${escapeHtml(journal.publicationFrequency)}</strong></span>` : '',
    journal.currentVolumeIssue ? `<span><small>Current Issue</small><strong>${escapeHtml(journal.currentVolumeIssue)}</strong></span>` : '',
  ].filter(Boolean).join('');
  return `<article class="journal-directory-card${journal.featured ? ' featured-journal' : ''}">
    <a class="journal-card-cover" href="${journalPageUrl(journal)}" aria-label="View ${escapeHtml(journal.title)}"><img src="${escapeHtml(journal.cover || 'assets/journal-cover-official.png')}" alt="${escapeHtml(journal.title)} cover" loading="lazy"></a>
    <div class="journal-card-body"><div class="journal-card-topline"><span class="journal-status">${journal.featured ? 'Featured journal' : 'Academic journal'}</span>${journal.issn ? `<span class="journal-issn">ISSN ${escapeHtml(journal.issn)}</span>` : ''}</div>
    <h2><a href="${journalPageUrl(journal)}">${escapeHtml(journal.shortTitle || journal.title)}</a></h2><p>${escapeHtml(journal.description)}</p>
    ${tags ? `<div class="scope-tags journal-card-tags">${tags}</div>` : ''}${facts ? `<div class="journal-card-facts">${facts}</div>` : ''}
    <div class="journal-card-actions"><a class="btn btn-primary" href="${journalPageUrl(journal)}">View Journal</a><a class="btn btn-secondary" href="${escapeHtml(journal.submissionUrl || 'submit.html')}">Submit an Article</a></div></div>
  </article>`;
};

const pageShell = ({ title, description, canonical, head = '', body }) => `<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${escapeHtml(title)}</title><meta name="description" content="${escapeHtml(description)}"><link rel="canonical" href="${escapeHtml(canonical)}">
<link href="assets/favicon.png" rel="icon" type="image/png"><link href="styles.css" rel="stylesheet">${head}</head>
<body><a class="skip-link" href="#main-content">Skip to content</a>
<header class="site-header" id="top"><div class="container header-inner"><a class="brand" href="index.html" aria-label="Shirley Publishing House home"><img src="assets/shirley-logo-transparent.png" alt="Shirley Publishing House official logo"></a><nav class="main-nav" aria-label="Main navigation"><a href="index.html">Home</a><a class="nav-active" href="journal.html">Journals</a><a href="repository.html">Archives</a><a href="publication-ethics.html">Publication Ethics</a><a href="contact.html">Contact Us</a></nav></div></header>
<main id="main-content">${body}</main>
<footer class="site-footer"><div class="container footer-main"><div class="footer-brand-wrap"><a class="footer-brand" href="index.html"><img src="assets/shirley-logo-transparent.png" alt="Shirley Publishing House logo"></a><p>Quality publication, academic support, registration assistance, printing, and binding services.</p></div><div><h3>Explore</h3><a href="journal.html">Our Journals</a><a href="repository.html">Archives</a><a href="authors.html">Author Guidelines</a></div><div><h3>Contact</h3><a href="mailto:${escapeHtml(site.email)}">${escapeHtml(site.email)}</a><span>${escapeHtml(site.location)}</span></div></div></footer>
<script src="script.js"></script></body></html>`;

const journalLandingPage = (journal) => {
  const articles = journalArticles.filter((article) => article.journalId === journal.id);
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
  const facts = [['ISSN', journal.issn], ['Publisher', 'Shirley Publishing House'], ['Publication frequency', journal.publicationFrequency], ['Established', journal.establishedYear], ['Effectivity date', journal.effectivityDate], ['ISSN assignment', journal.issnAssignedYear ? `ISSN ${journal.issn} assigned in ${journal.issnAssignedYear}` : '']]
    .filter(([, value]) => value).map(([label, value]) => `<div class="journal-fact"><span>${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong></div>`).join('');
  const schema = { '@context': 'https://schema.org', '@type': 'Periodical', name: journal.title, issn: journal.issn, publisher: { '@type': 'Organization', name: 'Shirley Publishing House' }, url: absoluteUrl(journalPageUrl(journal)), description: journal.description };
  return pageShell({ title: `${journal.shortTitle || journal.title} | Shirley Publishing House`, description: journal.description, canonical: absoluteUrl(journalPageUrl(journal)), head: `<script type="application/ld+json">${jsonLd(schema)}</script>`, body: `<section class="page-hero"><div class="container page-hero-inner"><div class="breadcrumbs"><a href="index.html">Home</a> / <a href="journal.html">Journals</a> / ${escapeHtml(journal.shortTitle || journal.title)}</div><p class="eyebrow">Journal profile</p><h1>${escapeHtml(journal.title)}</h1><p>${escapeHtml(journal.description)}</p></div></section><section class="section"><div class="container"><div class="journal-profile"><div class="journal-profile-cover"><img src="${escapeHtml(journal.cover || 'assets/journal-cover-official.png')}" alt="${escapeHtml(journal.title)} cover"></div><div class="journal-profile-content"><p class="eyebrow">Journal information</p><div class="journal-facts">${facts}</div>${journal.historyNotice ? `<aside class="repository-disclaimer"><span class="repository-disclaimer-icon" aria-hidden="true">i</span><div><h2>Publication History</h2><p>${escapeHtml(journal.historyNotice)}</p></div></aside>` : ''}</div></div></div></section><section class="section section-soft"><div class="container"><div class="journal-panel-heading"><p class="eyebrow">Archive</p><h2>Published articles</h2><p>${articles.length} article${articles.length === 1 ? '' : 's'} listed with crawlable individual landing pages.</p></div>${archive || '<p>No articles are currently listed.</p>'}</div></section>` });
};

const articleLandingPage = (article) => {
  const journal = journals.find((item) => item.id === article.journalId);
  const authors = article.authors || [];
  const period = article.originalPublicationPeriod || article.issueLabel || formatDate(article.publicationDate);
  const pageParts = String(article.pages || '').split(/[–—-]/).map((item) => item.trim());
  const scholarMeta = [`<meta name="citation_title" content="${escapeHtml(article.title)}">`, ...authors.map((author) => `<meta name="citation_author" content="${escapeHtml(author)}">`), `<meta name="citation_journal_title" content="${escapeHtml(journal?.title || '')}">`, journal?.issn ? `<meta name="citation_issn" content="${escapeHtml(journal.issn)}">` : '', article.publicationDate ? `<meta name="citation_publication_date" content="${escapeHtml(article.publicationDate)}">` : '', article.volume ? `<meta name="citation_volume" content="${escapeHtml(article.volume)}">` : '', article.issue ? `<meta name="citation_issue" content="${escapeHtml(article.issue)}">` : '', pageParts[0] ? `<meta name="citation_firstpage" content="${escapeHtml(pageParts[0])}">` : '', pageParts[1] ? `<meta name="citation_lastpage" content="${escapeHtml(pageParts[1])}">` : '', article.pdfFile ? `<meta name="citation_pdf_url" content="${escapeHtml(absoluteUrl(article.pdfFile))}">` : ''].filter(Boolean).join('');
  const schema = { '@context': 'https://schema.org', '@type': 'ScholarlyArticle', headline: article.title, author: authors.map((name) => ({ '@type': 'Person', name })), isPartOf: { '@type': 'Periodical', name: journal?.title, issn: journal?.issn }, datePublished: article.publicationDate || undefined, pagination: article.pages || undefined, keywords: article.keywords || [], abstract: article.abstract || undefined, url: absoluteUrl(articlePageUrl(article)), encoding: article.pdfFile ? { '@type': 'MediaObject', contentUrl: absoluteUrl(article.pdfFile), encodingFormat: 'application/pdf' } : undefined };
  return pageShell({ title: `${article.title} | ${journal?.shortTitle || journal?.title || 'Shirley Publishing House'}`, description: article.abstract || `${article.title}, published in ${journal?.title || 'a Shirley Publishing House journal'}.`, canonical: absoluteUrl(articlePageUrl(article)), head: `${scholarMeta}<script type="application/ld+json">${jsonLd(schema)}</script>`, body: `<section class="page-hero"><div class="container page-hero-inner"><div class="breadcrumbs"><a href="index.html">Home</a> / <a href="journal.html">Journals</a> / <a href="${journal ? journalPageUrl(journal) : 'journal.html'}">${escapeHtml(journal?.shortTitle || journal?.title || 'Journal')}</a> / Article</div><p class="eyebrow">${escapeHtml(article.articleType || 'Scholarly article')}</p><h1>${escapeHtml(article.title)}</h1><p>${escapeHtml(authors.join(', '))}</p></div></section><section class="section"><div class="container"><article class="content-card"><div class="journal-article-meta"><span>${escapeHtml(journal?.title || '')}</span><span>Volume ${escapeHtml(article.volume)}, Issue ${escapeHtml(article.issue)}</span>${article.pages ? `<span>Pages ${escapeHtml(article.pages)}</span>` : ''}</div><h2>Publication record</h2><dl class="journal-facts"><div class="journal-fact"><dt>Original publication period</dt><dd>${escapeHtml(period)}</dd></div>${article.digitizedDate ? `<div class="journal-fact"><dt>Digitized / uploaded online</dt><dd>${escapeHtml(formatDate(article.digitizedDate))}</dd></div>` : ''}${article.doi ? `<div class="journal-fact"><dt>DOI</dt><dd>${escapeHtml(article.doi)}</dd></div>` : ''}</dl>${article.digitizedDate ? '<p class="dialog-repository-note">The digitization/upload date records when this file was added to the website; it is not the article\'s original publication date.</p>' : ''}<h2>Abstract</h2><p>${escapeHtml(article.abstract || 'Abstract not provided.')}</p>${(article.keywords || []).length ? `<div class="scope-tags">${article.keywords.map((keyword) => `<span>${escapeHtml(keyword)}</span>`).join('')}</div>` : ''}${article.pdfFile ? `<div class="hero-actions"><a class="btn btn-primary" href="${escapeHtml(article.pdfFile)}" target="_blank" rel="noopener">View / Download PDF</a></div>` : ''}</article></div></section>` });
};

const directoryPath = path.join(root, 'journal.html');
const directoryHtml = fs.readFileSync(directoryPath, 'utf8');
const directoryStart = '<!-- JOURNAL_DIRECTORY_START -->';
const directoryEnd = '<!-- JOURNAL_DIRECTORY_END -->';
if (!directoryHtml.includes(directoryStart) || !directoryHtml.includes(directoryEnd)) throw new Error('Journal directory render markers are missing.');
fs.writeFileSync(directoryPath, directoryHtml.replace(new RegExp(`${directoryStart}[\\s\\S]*?${directoryEnd}`), `${directoryStart}${journals.map(journalDirectoryCard).join('')}${directoryEnd}`));

journals.forEach((journal) => fs.writeFileSync(path.join(root, journalPageUrl(journal)), journalLandingPage(journal)));
journalArticles.forEach((article) => fs.writeFileSync(path.join(root, articlePageUrl(article)), articleLandingPage(article)));

const staticPages = ['index.html', 'about.html', 'services.html', 'journal.html', 'repository.html', 'publication-ethics.html', 'authors.html', 'submit.html', 'contact.html'];
const sitemapUrls = [...staticPages, ...journals.map(journalPageUrl), ...journalArticles.map(articlePageUrl)];
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
