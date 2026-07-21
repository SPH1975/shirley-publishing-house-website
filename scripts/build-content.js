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

const publications = readFolder(path.join(root, 'content', 'publications')).map((item) => {
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

const pages = Object.fromEntries(readFolder(path.join(root, 'content', 'pages')).map((page) => [page.page, page]));
const services = readFolder(path.join(root, 'content', 'services')).sort((a, b) => (Number(a.order) || 999) - (Number(b.order) || 999));
const site = readJson(path.join(root, 'content', 'site-settings.json'));

fs.writeFileSync(path.join(root, 'repository-data.json'), JSON.stringify(publications, null, 2));
fs.writeFileSync(path.join(root, 'repository-data.js'), `window.SHIRLEY_REPOSITORY = ${JSON.stringify(publications, null, 2)};\n`);
fs.writeFileSync(path.join(root, 'journals-data.json'), JSON.stringify(journals, null, 2));
fs.writeFileSync(path.join(root, 'journals-data.js'), `window.SHIRLEY_JOURNALS = ${JSON.stringify(journals, null, 2)};\n`);
fs.writeFileSync(path.join(root, 'cms-data.js'), `window.SHIRLEY_CMS = ${JSON.stringify({ site, pages, services }, null, 2)};\n`);
console.log(`Built ${publications.length} publications, ${journals.length} journals, ${services.length} services, and ${Object.keys(pages).length} page records.`);
