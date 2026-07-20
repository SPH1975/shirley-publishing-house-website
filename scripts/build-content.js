const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const readJson = (file) => JSON.parse(fs.readFileSync(file, 'utf8'));
const readFolder = (folder) => fs.existsSync(folder)
  ? fs.readdirSync(folder).filter((name) => name.endsWith('.json')).map((name) => readJson(path.join(folder, name)))
  : [];
const slugify = (value = '') => String(value).toLowerCase().normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const unique = (values) => [...new Set(values.filter(Boolean))];

const publications = readFolder(path.join(root, 'content', 'publications')).map((item) => {
  const identifier = String(item.identifier || '').trim();
  const title = String(item.title || 'Untitled Publication').trim();
  const cover = String(item.cover || '').replace(/^\//, '');
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

const pages = Object.fromEntries(readFolder(path.join(root, 'content', 'pages')).map((page) => [page.page, page]));
const services = readFolder(path.join(root, 'content', 'services')).sort((a, b) => (Number(a.order) || 999) - (Number(b.order) || 999));
const site = readJson(path.join(root, 'content', 'site-settings.json'));

fs.writeFileSync(path.join(root, 'repository-data.json'), JSON.stringify(publications, null, 2));
fs.writeFileSync(path.join(root, 'repository-data.js'), `window.SHIRLEY_REPOSITORY = ${JSON.stringify(publications, null, 2)};\n`);
fs.writeFileSync(path.join(root, 'cms-data.js'), `window.SHIRLEY_CMS = ${JSON.stringify({ site, pages, services }, null, 2)};\n`);
console.log(`Built ${publications.length} publications, ${services.length} services, and ${Object.keys(pages).length} page records.`);
