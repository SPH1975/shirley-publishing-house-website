(() => {
  const updateNotice = document.createElement('div');
  updateNotice.className = 'site-update-notice';
  updateNotice.setAttribute('role', 'status');
  updateNotice.innerHTML = '<div class="container site-update-notice-inner"><span class="site-update-dot" aria-hidden="true"></span><strong>Website Update in Progress</strong><span>We are currently updating journal information and adding article files. Some content may be temporarily incomplete.</span></div>';
  document.body.insertBefore(updateNotice, document.body.firstChild);

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


  /* Sitewide experience enhancements */
  const progressBar = document.createElement('div');
  progressBar.className = 'scroll-progress';
  progressBar.setAttribute('aria-hidden', 'true');
  document.body.appendChild(progressBar);

  const backToTop = document.createElement('button');
  backToTop.className = 'site-back-to-top';
  backToTop.type = 'button';
  backToTop.setAttribute('aria-label', 'Back to top');
  backToTop.innerHTML = '<span aria-hidden="true">↑</span>';
  document.body.appendChild(backToTop);

  backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  let scrollFramePending = false;
  const updateScrollExperience = () => {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const scrollRange = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    progressBar.style.width = Math.min(100, Math.max(0, (scrollTop / scrollRange) * 100)) + '%';
    document.body.classList.toggle('is-scrolled', scrollTop > 24);
    backToTop.classList.toggle('is-visible', scrollTop > 620);
    scrollFramePending = false;
  };

  window.addEventListener('scroll', () => {
    if (!scrollFramePending) {
      scrollFramePending = true;
      window.requestAnimationFrame(updateScrollExperience);
    }
  }, { passive: true });
  window.addEventListener('resize', updateScrollExperience, { passive: true });
  updateScrollExperience();

  const closeNavigation = () => {
    mainNav?.classList.remove('is-open');
    menuButton?.setAttribute('aria-expanded', 'false');
    menuButton?.setAttribute('aria-label', 'Open navigation menu');
  };

  document.addEventListener('click', (event) => {
    const header = document.querySelector('.site-header');
    if (mainNav?.classList.contains('is-open') && header && !header.contains(event.target)) {
      closeNavigation();
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && mainNav?.classList.contains('is-open')) {
      closeNavigation();
      menuButton?.focus();
    }
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 900) closeNavigation();
  }, { passive: true });

  const serviceExplorer = document.querySelector('[data-service-explorer]');
  if (serviceExplorer) {
    const serviceList = serviceExplorer.querySelector('.service-grid');
    const serviceCards = [...serviceExplorer.querySelectorAll('.service-card')];
    const servicePanel = serviceExplorer.querySelector('[data-service-panel]');
    const serviceNumber = servicePanel?.querySelector('[data-service-number]');
    const servicePosition = servicePanel?.querySelector('[data-service-position]');
    const serviceTitle = servicePanel?.querySelector('[data-service-title]');
    const serviceSummary = servicePanel?.querySelector('[data-service-summary]');
    const serviceItems = servicePanel?.querySelector('[data-service-items]');
    const hoverCapable = window.matchMedia?.('(hover: hover) and (pointer: fine)').matches;

    if (serviceList && servicePanel && serviceCards.length) {
      serviceExplorer.classList.add('is-enhanced');
      serviceList.setAttribute('role', 'tablist');
      serviceList.setAttribute('aria-label', 'Publishing service categories');
      serviceList.setAttribute('aria-orientation', 'vertical');
      servicePanel.id = servicePanel.id || 'service-explorer-panel';
      servicePanel.hidden = false;

      const activateService = (card, shouldFocus = false) => {
        const activeIndex = serviceCards.indexOf(card);
        if (activeIndex < 0) return;

        const title = card.querySelector('h3')?.textContent.trim() || 'Publishing service';
        const summary = card.querySelector('p')?.textContent.trim() || '';
        const number = card.querySelector('.number')?.textContent.trim() || String(activeIndex + 1).padStart(2, '0');
        const items = [...card.querySelectorAll('li')]
          .map((item) => item.textContent.trim())
          .filter(Boolean);

        serviceCards.forEach((serviceCard) => {
          const isActive = serviceCard === card;
          serviceCard.classList.toggle('is-active', isActive);
          serviceCard.setAttribute('aria-selected', String(isActive));
          serviceCard.tabIndex = isActive ? 0 : -1;
        });

        if (serviceNumber) serviceNumber.textContent = number;
        if (servicePosition) servicePosition.textContent = `Service ${activeIndex + 1} of ${serviceCards.length}`;
        if (serviceTitle) serviceTitle.textContent = title;
        if (serviceSummary) serviceSummary.textContent = summary;
        if (serviceItems) {
          const listItems = items.map((itemText) => {
            const listItem = document.createElement('li');
            listItem.textContent = itemText;
            return listItem;
          });
          serviceItems.replaceChildren(...listItems);
        }

        servicePanel.setAttribute('aria-labelledby', card.id);
        servicePanel.classList.remove('is-switching');
        void servicePanel.offsetWidth;
        servicePanel.classList.add('is-switching');

        if (shouldFocus) card.focus({ preventScroll: true });
      };

      serviceCards.forEach((card, index) => {
        const cardTitle = card.querySelector('h3')?.textContent.trim() || `Service ${index + 1}`;
        card.id = `service-explorer-tab-${index + 1}`;
        card.setAttribute('role', 'tab');
        card.setAttribute('aria-controls', servicePanel.id);
        card.setAttribute('aria-label', `Explore ${cardTitle}`);
        card.setAttribute('aria-selected', 'false');
        card.tabIndex = -1;

        card.addEventListener('click', () => activateService(card, true));
        card.addEventListener('focus', () => activateService(card));
        if (hoverCapable) {
          card.addEventListener('mouseenter', () => {
            if (!serviceList.contains(document.activeElement)) activateService(card);
          });
        }

        card.addEventListener('keydown', (event) => {
          let nextIndex = index;
          if (event.key === 'ArrowDown' || event.key === 'ArrowRight') nextIndex = (index + 1) % serviceCards.length;
          if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') nextIndex = (index - 1 + serviceCards.length) % serviceCards.length;
          if (event.key === 'Home') nextIndex = 0;
          if (event.key === 'End') nextIndex = serviceCards.length - 1;

          if (nextIndex !== index || ['Home', 'End'].includes(event.key)) {
            event.preventDefault();
            activateService(serviceCards[nextIndex], true);
          }

          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            activateService(card, true);
          }
        });
      });

      activateService(serviceCards[0]);
    }
  }

  const reducedMotionQuery = window.matchMedia?.('(prefers-reduced-motion: reduce)');
  const reducedMotion = Boolean(reducedMotionQuery?.matches);
  const revealSelector = [
    '.section-heading',
    '.feature-item',
    '.service-card',
    '.service-explorer-panel',
    '.service-detail',
    '.process-step',
    '.preview-card',
    '.content-card',
    '.why-card',
    '.value-card',
    '.about-panel',
    '.contact-card',
    '.web-form',
    '.journal-directory-card',
    '.journal-profile-dynamic',
    '.journal-tab-panel',
    '.journal-issue-group',
    '.journal-article-card',
    '.repository-category-card',
    '.repository-card',
    '.repository-page-stat-card',
    '.repository-disclaimer'
  ].join(',');

  let revealObserver;
  if (!reducedMotion && 'IntersectionObserver' in window) {
    document.documentElement.classList.add('motion-ready');
    revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-revealed');
        revealObserver.unobserve(entry.target);
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -8% 0px' });
  }

  const prepareRevealTargets = (root = document) => {
    const targets = [];
    if (root instanceof Element && root.matches(revealSelector)) targets.push(root);
    root.querySelectorAll?.(revealSelector).forEach((element) => targets.push(element));

    targets
      .filter((element) => !element.classList.contains('reveal-target'))
      .forEach((element, index) => {
        element.classList.add('reveal-target');
        element.style.setProperty('--reveal-delay', ((index % 4) * 65) + 'ms');

        if (revealObserver) revealObserver.observe(element);
        else element.classList.add('is-revealed');
      });
  };

  prepareRevealTargets();

  const dynamicMotionHosts = [
    '#home-repository-preview',
    '#journals-grid',
    '#journal-profile-section',
    '#journal-issue-archive',
    '#repository-category-cards',
    '#repository-grid'
  ];

  if ('MutationObserver' in window) {
    const dynamicMotionObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node instanceof Element) prepareRevealTargets(node);
        });
      });
    });

    dynamicMotionHosts.forEach((selector) => {
      const host = document.querySelector(selector);
      if (host) dynamicMotionObserver.observe(host, { childList: true, subtree: true });
    });
  }

  const finePointer = window.matchMedia?.('(hover: hover) and (pointer: fine)').matches;
  const hero = document.querySelector('.hero');
  const heroVisual = hero?.querySelector('.hero-visual');

  if (!reducedMotion && finePointer && hero && heroVisual) {
    let heroMotionFrame;
    const renderHeroDepth = (x, y) => {
      heroVisual.style.setProperty('--hero-shift-x', `${x * 16}px`);
      heroVisual.style.setProperty('--hero-shift-y', `${y * 12}px`);
      heroVisual.style.setProperty('--hero-rotate-x', `${y * -2.5}deg`);
      heroVisual.style.setProperty('--hero-rotate-y', `${x * 3}deg`);
    };

    hero.addEventListener('pointermove', (event) => {
      const bounds = hero.getBoundingClientRect();
      const x = ((event.clientX - bounds.left) / bounds.width) * 2 - 1;
      const y = ((event.clientY - bounds.top) / bounds.height) * 2 - 1;
      window.cancelAnimationFrame(heroMotionFrame);
      heroMotionFrame = window.requestAnimationFrame(() => renderHeroDepth(x, y));
    }, { passive: true });

    hero.addEventListener('pointerleave', () => {
      window.cancelAnimationFrame(heroMotionFrame);
      heroMotionFrame = window.requestAnimationFrame(() => renderHeroDepth(0, 0));
    });
  }

  const motionCardSelector = [
    '.preview-card',
    '.journal-directory-card',
    '.journal-article-card',
    '.repository-card',
    '.content-card',
    '.why-card',
    '.value-card'
  ].join(',');

  if (!reducedMotion && finePointer) {
    const resetMotionCard = (card) => {
      card.classList.remove('is-tilting');
      card.style.setProperty('--tilt-x', '0deg');
      card.style.setProperty('--tilt-y', '0deg');
      card.style.setProperty('--tilt-glow-x', '50%');
      card.style.setProperty('--tilt-glow-y', '50%');
    };

    document.addEventListener('pointermove', (event) => {
      const card = event.target.closest?.(motionCardSelector);
      if (!card) return;

      const bounds = card.getBoundingClientRect();
      const x = Math.min(1, Math.max(0, (event.clientX - bounds.left) / bounds.width));
      const y = Math.min(1, Math.max(0, (event.clientY - bounds.top) / bounds.height));
      card.classList.add('motion-card', 'is-tilting');
      card.style.setProperty('--tilt-x', `${(0.5 - y) * 4}deg`);
      card.style.setProperty('--tilt-y', `${(x - 0.5) * 5}deg`);
      card.style.setProperty('--tilt-glow-x', `${x * 100}%`);
      card.style.setProperty('--tilt-glow-y', `${y * 100}%`);
    }, { passive: true });

    document.addEventListener('pointerout', (event) => {
      const card = event.target.closest?.(motionCardSelector);
      if (!card || card.contains(event.relatedTarget)) return;
      resetMotionCard(card);
    });
  }

})();
