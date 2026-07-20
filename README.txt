SHIRLEY PUBLISHING HOUSE WEBSITE — CMS EDITION

This is a public multi-page website with a private Decap CMS content manager at /admin/.
Read ADMIN_SETUP_GUIDE.txt before deployment.

Publications are stored as individual JSON files in content/publications/. During each Netlify build, scripts/build-content.js generates repository-data.js and repository-data.json for the public repository page.

The content manager is intentionally not linked anywhere on the public website.
