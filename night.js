/**
 * Browse / opening flow, games & apps grid, dropdown, info popup.
 * Data: mages.js (window.MAGES_GAMES), apps.js (window.APPS_ITEMS).
 */
(function () {
  const NAME_OVERRIDES = {
  };

  const CATEGORY_CONFIG = {
    'All Games': { list: () => window.MAGES_GAMES, basePath: 'mages/', emptyMsg: 'No games found.', failMsg: 'Game list failed to load (mages.js).' },
    'All Apps': { list: () => window.APPS_ITEMS, basePath: 'apps/', emptyMsg: 'No apps yet.', failMsg: 'App list failed to load (apps.js).' },
  };

  const STAGGER_CAP_MS = 480;
  const STAGGER_STEP_MS = 10;
  const GRID_FADE_MS = 200;
  const SCROLL_DURATION_MS = 950;

  const util = {
    escapeHtml(s) {
      return String(s).replace(/[&<>"']/g, (c) => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
      }[c]));
    },
    slugFromUrl(item) {
      if (!item?.url) return '';
      return String(item.url).split('/')[0] || '';
    },
    formatDisplayName(item) {
      const slug = this.slugFromUrl(item);
      if (slug && NAME_OVERRIDES[slug]) return NAME_OVERRIDES[slug];

      // Prefer authoritative name from data (mages.js / apps.js). Keep exact
      // provided value for name to preserve dashes, uppercase, and punctuation.
      const source = String(item?.name || slug || '');
      if (item?.name && String(item.name).trim() !== '') return source;

      let s = source
        .replace(/\.[a-z0-9]+$/i, '')
        .replace(/[-_]+/g, ' ')
        .replace(/([a-z])([A-Z])/g, '$1 $2')
        .replace(/(\d+)([a-zA-Z])/g, '$1 $2')
        .replace(/([a-zA-Z])(\d+)/g, '$1 $2')
        .replace(/\s+/g, ' ')
        .trim();

      const phraseFixes = [
        [/(\b)daysinhell(\b)/gi, '$1days in hell$2'],
        [/(\b)on1soccer(\b)/gi, '$1on 1 soccer$2'],
        [/(\b)nightsintheforest(\b)/gi, '$1nights in the forest$2'],
        [/(\b)schooltransfer(\b)/gi, '$1school transfer$2'],
        [/(\b)fivenights(\b)/gi, '$1five nights$2'],
      ];
      phraseFixes.forEach(([pattern, replacement]) => {
        s = s.replace(pattern, replacement);
      });

      const lowerWordMap = new Set(['and', 'of', 'the', 'to', 'in', 'at', 'for', 'vs']);
      const acronymMap = {
        gta: 'GTA',
        io: '.io',
        fps: 'FPS',
        '2d': '2D',
        '3d': '3D',
        gb: 'GB',
      };

      const words = s.split(' ').filter(Boolean).map((w, i) => {
        const key = w.toLowerCase();
        if (acronymMap[key]) return acronymMap[key];
        if (lowerWordMap.has(key) && i > 0) return key;
        if (/^\d+$/.test(w)) return w;
        return key.charAt(0).toUpperCase() + key.slice(1);
      });

      return words
        .join(' ')
        .replace(/\s+\.io\b/i, '.io')
        .replace(/\b([A-Za-z]+)\s+(\d)\b/g, '$1 $2')
        .trim();
    },
    iconPathFor(item) {
      if (item?.image) return item.image;
      const slug = this.slugFromUrl(item);
      return slug ? `icons/${slug}.webp` : '';
    },
    resolveUrl(path) {
      if (!path) return '';
      // Keep absolute URLs (http(s), protocol-relative, data:, about:, etc.) untouched.
      if (path.startsWith('internal:')) return path;
      if (/^(?:[a-zA-Z][a-zA-Z\d+\-.]*:|\/\/)/.test(path)) {
        return path;
      }
      try {
        const shouldIgnoreBase = location.protocol === 'file:';
        const baseElHref = document.querySelector('base')?.href;

        // On local file/runner mode, base is often set to a CDN and will break local relative paths.
        const preferLocalBase = shouldIgnoreBase || (baseElHref && !baseElHref.startsWith(location.origin));

        const baseForResolve = preferLocalBase ? window.location.href : document.baseURI;
        return new URL(path, baseForResolve).href;
      } catch (e) {
        return path;
      }
    },
    itemHref(item, basePath = '') {
      const raw = String(item?.url || '');
      if (!raw) return '';
      if (/^(?:[a-zA-Z][a-zA-Z\d+\-.]*:|\/\/)/.test(raw)) {
        return this.resolveUrl(raw);
      }
      return this.resolveUrl(`${basePath}${raw}`);
    },
    isDisplayable() {
      return true;
    },
  };

  const customGames = {
    storageKey: 'sienna_custom_games',
    items: [],

    load() {
      try {
        const stored = localStorage.getItem(this.storageKey);
        this.items = stored ? JSON.parse(stored) : [];
      } catch (e) {
        this.items = [];
      }
    },

    save() {
      try {
        localStorage.setItem(this.storageKey, JSON.stringify(this.items));
      } catch (e) {}
    },

    add(name, html) {
      const id = 'custom-' + Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 7);
      this.items.unshift({ id, name: String(name).trim(), html: String(html).trim() });
      this.save();
      return this.items[0];
    },

    remove(id) {
      this.items = this.items.filter((g) => g.id !== id);
      this.save();
    },

    getAll() {
      return this.items;
    },

    toGameItems() {
      return this.items.map((g) => {
        // Generate a blob URL from the stored HTML
        let url = g.url || '';
        if (g.html && !url) {
          try {
            let html = g.html;
            // Fix: ensure <base href> works correctly with blob URLs
            html = html.replace(
              /<base\s+href=["']([^"']*)["']\s*\/?>/gi,
              (match, href) => {
                if (/^(https?:)?\/\//i.test(href)) return match;
                const resolved = new URL(href, window.location.origin).href;
                return `<base href="${resolved}">`;
              }
            );
            const blob = new Blob([html], { type: 'text/html' });
            url = URL.createObjectURL(blob);
          } catch (e) {
            url = '';
          }
        }
        return {
          name: g.name,
          image: '',
          url: url,
          section: 'Custom',
          author: 'You',
          _customId: g.id,
        };
      });
    },

    initModal() {
      const modal = document.getElementById('customGameModal');
      const openBtn = document.getElementById('customGameBtn');
      const closeBtn = document.getElementById('customGameModalClose');
      const cancelBtn = document.getElementById('customGameCancel');
      const addBtn = document.getElementById('customGameAdd');
      const nameInput = document.getElementById('customGameName');
      const htmlInput = document.getElementById('customGameHtml');
      const urlInput = document.getElementById('customGameUrl');
      const htmlField = document.getElementById('customGameHtmlField');
      const urlField = document.getElementById('customGameUrlField');
      const typeBtns = modal?.querySelectorAll('.custom-game-type-btn');

      if (!modal || !openBtn) return;

      let activeType = 'html';

      const switchType = (type) => {
        activeType = type;
        typeBtns?.forEach((btn) => {
          btn.classList.toggle('active', btn.dataset.type === type);
        });
        htmlField?.classList.toggle('hidden', type !== 'html');
        urlField?.classList.toggle('hidden', type !== 'url');
      };

      const open = () => {
        modal.classList.add('open');
        nameInput.value = '';
        htmlInput.value = '';
        urlInput.value = '';
        switchType('html');
        nameInput.focus();
      };

      const close = () => {
        modal.classList.remove('open');
      };

      const submit = () => {
        const name = nameInput.value.trim();
        if (!name) return;

        if (activeType === 'html') {
          const html = htmlInput.value.trim();
          if (!html) return;
          this.add(name, html);
        } else {
          let url = urlInput.value.trim();
          if (!url) return;
          // Auto-add https:// if no protocol is present
          if (!/^[a-zA-Z][a-zA-Z\d+\-.]*:/.test(url)) {
            url = 'https://' + url;
          }
          const id = 'custom-' + Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 7);
          this.items.unshift({ id, name, url, _type: 'url' });
          this.save();
        }

        close();
        grid.render(activeCategory);
      };

      typeBtns?.forEach((btn) => {
        btn.addEventListener('click', () => switchType(btn.dataset.type));
      });

      openBtn.addEventListener('click', open);
      closeBtn?.addEventListener('click', close);
      cancelBtn?.addEventListener('click', close);
      addBtn?.addEventListener('click', submit);
      addBtn._submitHandler = submit;
      modal.addEventListener('click', (e) => {
        if (e.target === modal) close();
      });
      nameInput?.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          if (activeType === 'html') htmlInput?.focus();
          else urlInput?.focus();
        }
      });
      htmlInput?.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') submit();
      });
      urlInput?.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') submit();
      });
    },

    openEditModal(id) {
      const game = this.items.find((g) => g.id === id);
      if (!game) return;

      const modal = document.getElementById('customGameModal');
      const nameInput = document.getElementById('customGameName');
      const htmlInput = document.getElementById('customGameHtml');
      const urlInput = document.getElementById('customGameUrl');
      const htmlField = document.getElementById('customGameHtmlField');
      const urlField = document.getElementById('customGameUrlField');
      const typeBtns = modal?.querySelectorAll('.custom-game-type-btn');
      const addBtn = document.getElementById('customGameAdd');
      const titleEl = modal?.querySelector('.custom-game-modal-title');
      const closeBtn = modal?.querySelector('#customGameModalClose');
      const cancelBtn = modal?.querySelector('#customGameCancel');

      if (!modal) return;

      const isUrlType = game._type === 'url';
      const originalTitle = titleEl?.textContent || '';
      const originalBtnText = addBtn?.textContent || '';

      // Set title and button to edit mode
      if (titleEl) titleEl.textContent = 'Edit Custom Game';
      if (addBtn) addBtn.textContent = 'Apply';

      // Populate fields
      nameInput.value = game.name;
      htmlInput.value = game.html || '';
      urlInput.value = game.url || '';

      // Switch to correct type
      const targetType = isUrlType ? 'url' : 'html';
      typeBtns?.forEach((btn) => {
        btn.classList.toggle('active', btn.dataset.type === targetType);
      });
      htmlField?.classList.toggle('hidden', targetType !== 'html');
      urlField?.classList.toggle('hidden', targetType !== 'url');

      modal.classList.add('open');
      nameInput.focus();

      // Store the original submit handler reference so we can restore it
      const submitHandler = addBtn._submitHandler;

      const editHandler = () => {
        const newName = nameInput.value.trim();
        if (!newName) return;

        if (targetType === 'html') {
          const newHtml = htmlInput.value.trim();
          if (!newHtml) return;
          game.name = newName;
          game.html = newHtml;
          delete game.url;
          delete game._type;
        } else {
          let newUrl = urlInput.value.trim();
          if (!newUrl) return;
          if (!/^[a-zA-Z][a-zA-Z\d+\-.]*:/.test(newUrl)) {
            newUrl = 'https://' + newUrl;
          }
          game.name = newName;
          game.url = newUrl;
          game._type = 'url';
          delete game.html;
        }

        this.save();
        restoreAddModal();
        grid.render(activeCategory);
      };

      const restoreAddModal = () => {
        modal.classList.remove('open');
        if (titleEl) titleEl.textContent = originalTitle;
        if (addBtn) addBtn.textContent = originalBtnText;
        addBtn.removeEventListener('click', editHandler);
        if (submitHandler) {
          addBtn.addEventListener('click', submitHandler);
        }
        closeBtn?.removeEventListener('click', restoreAddModal);
        cancelBtn?.removeEventListener('click', restoreAddModal);
      };

      // Remove the submit handler and add the edit handler
      if (submitHandler) {
        addBtn.removeEventListener('click', submitHandler);
      }
      addBtn.addEventListener('click', editHandler);

      // Close/cancel restores the modal to add mode
      closeBtn?.addEventListener('click', restoreAddModal);
      cancelBtn?.addEventListener('click', restoreAddModal);
    },
  };

  const iconLazyLoader = {
    observer: null,
    loaded: new Set(),
    releaseCheckRaf: null,
    listenersBound: false,
    releaseHandler: null,
    loadMargin: 220,
    releaseMargin: 1800,

    init() {
      if (!document.querySelectorAll) return;
      if (!('IntersectionObserver' in window)) {
        document.querySelectorAll('img.browse-card-icon').forEach((img) => {
          if (this.isWithinMargin(img, this.loadMargin)) this.loadImage(img);
        });
        return;
      }
      this.ensureObserver();
      this.observeAll();
      this.scheduleReleaseCheck();
    },

    ensureObserver() {
      if (!('IntersectionObserver' in window)) return;
      if (this.observer) {
        this.observer.disconnect();
      }

      this.observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          const img = entry.target;
          if (entry.isIntersecting || this.isWithinMargin(img, this.loadMargin)) {
            this.loadImage(img);
            return;
          }
          if (this.isOutsideMargin(img, this.releaseMargin)) {
            this.unloadImage(img);
          }
        });
      }, {
        rootMargin: `${this.loadMargin}px 0px`,
        threshold: 0.01,
      });

      if (!this.listenersBound) {
        this.releaseHandler = () => this.scheduleReleaseCheck();
        window.addEventListener('scroll', this.releaseHandler, { passive: true });
        window.addEventListener('resize', this.releaseHandler, { passive: true });
        this.listenersBound = true;
      }
    },

    observeAll() {
      this.loaded.forEach((img) => {
        if (!img.isConnected) this.loaded.delete(img);
      });
      document.querySelectorAll('img.browse-card-icon').forEach((img) => {
        this.observer?.observe(img);
      });
    },

    scheduleReleaseCheck() {
      if (this.releaseCheckRaf) return;
      this.releaseCheckRaf = requestAnimationFrame(() => {
        this.releaseCheckRaf = null;
        this.releaseFarImages();
      });
    },

    releaseFarImages() {
      this.loaded.forEach((img) => {
        if (!img.isConnected || this.isOutsideMargin(img, this.releaseMargin)) {
          this.unloadImage(img);
        }
      });
    },

    isWithinMargin(el, margin) {
      const rect = el.getBoundingClientRect();
      const windowHeight = window.innerHeight || document.documentElement.clientHeight;
      const windowWidth = window.innerWidth || document.documentElement.clientWidth;
      return (
        rect.bottom >= -margin &&
        rect.right >= -margin &&
        rect.top <= windowHeight + margin &&
        rect.left <= windowWidth + margin
      );
    },

    isOutsideMargin(el, margin) {
      const rect = el.getBoundingClientRect();
      const windowHeight = window.innerHeight || document.documentElement.clientHeight;
      const windowWidth = window.innerWidth || document.documentElement.clientWidth;
      return (
        rect.bottom < -margin ||
        rect.right < -margin ||
        rect.top > windowHeight + margin ||
        rect.left > windowWidth + margin
      );
    },

    loadImage(img) {
      const url = img.dataset.src;
      if (!url || img.dataset.broken === 'true' || img.dataset.loaded === 'true') return;
      if (img.dataset.errorBound !== 'true') {
        img.addEventListener('error', () => {
          img.dataset.broken = 'true';
          img.style.display = 'none';
          img.parentElement?.classList.add('icon-missing');
        }, { once: true });
        img.dataset.errorBound = 'true';
      }
      img.src = url;
      img.dataset.loaded = 'true';
      this.loaded.add(img);
      img.style.display = '';
    },

    unloadImage(img) {
      if (img.dataset.loaded !== 'true' || img.dataset.broken === 'true') return;
      img.removeAttribute('src');
      img.dataset.loaded = 'false';
      this.loaded.delete(img);
    },

    teardown() {
      this.observer?.disconnect();
      this.observer = null;
      this.loaded.forEach((img) => this.unloadImage(img));
      this.loaded.clear();
      if (this.listenersBound && this.releaseHandler) {
        window.removeEventListener('scroll', this.releaseHandler);
        window.removeEventListener('resize', this.releaseHandler);
        this.listenersBound = false;
        this.releaseHandler = null;
      }
      if (this.releaseCheckRaf) {
        cancelAnimationFrame(this.releaseCheckRaf);
        this.releaseCheckRaf = null;
      }
    },
  };

  const scroll = {
    ease(t) {
      return t < 0.5 ? 8 * t * t * t * t : 1 - Math.pow(-2 * t + 2, 4) / 2;
    },
    animateTo(targetY, duration, onComplete) {
      const startY = window.scrollY;
      const dist = targetY - startY;
      let start = null;
      const step = (ts) => {
        if (!start) start = ts;
        const progress = Math.min((ts - start) / duration, 1);
        window.scrollTo(0, startY + dist * scroll.ease(progress));
        if (progress < 1) requestAnimationFrame(step);
        else if (onComplete) onComplete();
      };
      requestAnimationFrame(step);
    },
    toBrowseSection() {
      const target = document.getElementById('page-browse');
      if (!target) return;
      const y = target.getBoundingClientRect().top + window.scrollY;
      this.animateTo(y, SCROLL_DURATION_MS, () => opening.revealBrowse());
    },
  };

  const opening = {
    staggerTimers: [],
    clearStaggerTimers() {
      this.staggerTimers.forEach((timerId) => clearTimeout(timerId));
      this.staggerTimers = [];
    },
    revealBrowse() {
      const inner = document.getElementById('browseInner');
      const browseGrid = document.getElementById('browseGrid');
      if (browseGrid && !browseGrid.childElementCount) {
        grid.render(activeCategory);
      }
      if (inner) requestAnimationFrame(() => inner.classList.add('revealed'));
      featured.ensureStarted();
      this.staggerCards(document.querySelectorAll('.browse-card'), 60, 10);
    },
    staggerCards(cards, baseDelay, step) {
      const items = Array.from(cards);
      const staggeredCount = Math.min(items.length, 48);
      this.clearStaggerTimers();

      items.slice(0, staggeredCount).forEach((card, i) => {
        const delay = Math.min(baseDelay + i * step, STAGGER_CAP_MS + baseDelay);
        this.staggerTimers.push(setTimeout(() => card.classList.add('revealed'), delay));
      });

      if (items.length > staggeredCount) {
        const remaining = items.slice(staggeredCount);
        const delay = Math.min(baseDelay + staggeredCount * step, STAGGER_CAP_MS + baseDelay);
        this.staggerTimers.push(setTimeout(() => {
          remaining.forEach((card) => card.classList.add('revealed'));
        }, delay));
      }
    },
    ensureBrowseVisible() {
      const page = document.getElementById('page-browse');
      const inner = document.getElementById('browseInner');
      if (!page || !inner || inner.classList.contains('revealed')) return;
      const rect = page.getBoundingClientRect();
      if (rect.top <= window.innerHeight * 0.6) this.revealBrowse();
    },
    bind() {
      // Scroll button snaps down to the browse section
      document.getElementById('scrollBtn')?.addEventListener('click', () => scroll.toBrowseSection());
      // Throttle scroll event to avoid excessive getBoundingClientRect calls
      let ticking = false;
      const scrollHandler = () => {
        if (!ticking) {
          requestAnimationFrame(() => {
            this.ensureBrowseVisible();
            ticking = false;
          });
          ticking = true;
        }
      };
      window.addEventListener('scroll', scrollHandler, { passive: true });
    },
  };

  const grid = {
    renderTimer: null,
    buildItemsHtml(items, basePath) {
      return items
        .map((g) => {
          if (!g || !g.url || !util.isDisplayable(g)) return '';
          const name = util.escapeHtml(util.formatDisplayName(g));
          const hrefRaw = util.itemHref(g, basePath);
          const href = encodeURI(hrefRaw);
          const icon = util.iconPathFor(g);
          const isFav = favorites.has(href);
          const favClass = isFav ? 'active' : '';
          const gameDataAttr = `data-game-data="${encodeURIComponent(JSON.stringify(g))}"`;
          const isCustom = g._customId;
          const iconHtml = icon
            ? `<img class="browse-card-icon" data-src="${encodeURI(icon)}" data-loaded="false" alt="${name}" loading="lazy" decoding="async" fetchpriority="low">`
            : '';
          const deleteBtn = isCustom
            ? `<button class="custom-game-delete-btn" data-custom-id="${util.escapeHtml(g._customId)}" aria-label="Remove ${name}" title="Remove custom game">&times;</button>`
            : '';
          const editBtn = isCustom
            ? `<button class="custom-game-edit-btn" data-custom-id="${util.escapeHtml(g._customId)}" aria-label="Edit ${name}" title="Edit custom game">&#9998;</button>`
            : '';
          const favBtn = isCustom
            ? ''
            : `<button class="favorite-btn ${favClass}" data-fav-url="${util.escapeHtml(href)}" aria-label="Favorite ${name}"><svg viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg></button>`;
          return `<div class="browse-tile ${isCustom ? 'custom-game-tile' : ''}" data-game-url="${util.escapeHtml(href)}" ${gameDataAttr} title="${name}"><a class="browse-card" href="${util.escapeHtml(href)}" data-game-url="${util.escapeHtml(href)}">${iconHtml}</a><div class="browse-card-name">${name}</div>${editBtn}${deleteBtn}${favBtn}</div>`;
        })
        .join('');
    },
    render(category) {
      const el = document.getElementById('browseGrid');
      if (!el) return;

      el.querySelectorAll('.browse-card').forEach((c) => c.classList.remove('revealed'));
      if (this.renderTimer) {
        clearTimeout(this.renderTimer);
        this.renderTimer = null;
      }

      this.renderTimer = setTimeout(() => {
        this.renderTimer = null;
        const cfg = CATEGORY_CONFIG[category];
        if (!cfg) {
          el.innerHTML = '';
          return;
        }

        const items = cfg.list();
        let visibleCount = 0;
        if (!Array.isArray(items)) {
          el.innerHTML = `<p class="browse-empty">${util.escapeHtml(cfg.failMsg)}</p>`;
        } else {
          const visibleItems = items.filter((item) => util.isDisplayable(item));
          // Prepend custom games at the front
          const customItems = customGames.toGameItems();
          const allItems = [...customItems, ...visibleItems];
          visibleCount = allItems.length;
          if (allItems.length === 0) {
            el.innerHTML = `<p class="browse-empty">${util.escapeHtml(cfg.emptyMsg)}</p>`;
          } else {
            el.innerHTML = this.buildItemsHtml(allItems, cfg.basePath);
          }
        }

        // Update the titles count label
        const titlesLabel = document.getElementById('titlesCount');
        if (titlesLabel) {
          titlesLabel.textContent = `Currently Showing ${visibleCount} Titles`;
        }

        const cards = el.querySelectorAll('.browse-card');
        const inner = document.getElementById('browseInner');
        if (inner?.classList.contains('revealed')) {
          opening.staggerCards(cards, 0, STAGGER_STEP_MS);
        } else {
          opening.ensureBrowseVisible();
        }

        iconLazyLoader.init();
        search.apply();
      }, GRID_FADE_MS);
    },
  };

  const favorites = {
    items: new Set(),
    init() {
      try {
        const stored = localStorage.getItem('sienna_favs');
        if (stored) {
          const saved = JSON.parse(stored);
          this.items = new Set(Array.isArray(saved) ? saved : []);
        }
      } catch (e) { this.items = new Set(); }
      this.render();
    },
    has(url) { return this.items.has(url); },
    toggle(url, btnElement) {
      if (!url) return;
      if (this.items.has(url)) this.items.delete(url);
      else this.items.add(url);
      
      // Immediate visual feedback
      if (btnElement) btnElement.classList.toggle('active', this.items.has(url));
      
      localStorage.setItem('sienna_favs', JSON.stringify(Array.from(this.items)));
      this.render();
      
      // Update state in the main grid if the item exists there
      const mainGridBtn = Array.from(document.querySelectorAll('#browseGrid .favorite-btn'))
        .find((button) => button.dataset.favUrl === url);
      if (mainGridBtn) mainGridBtn.classList.toggle('active', this.items.has(url));
    },
    render() {
      const section = document.getElementById('favoritesSection');
      const el = section?.querySelector('#favoritesGrid');
      if (!section || !el) return;

      if (this.items.size === 0) {
        section.classList.add('hidden');
        return;
      }

      section.classList.remove('hidden');
      
      // Find full data objects for favorited URLs
      const allItems = [
        ...(window.MAGES_GAMES || []).map(i => ({ ...i, base: 'mages/' })),
        ...(window.APPS_ITEMS || []).map(i => ({ ...i, base: 'apps/' }))
      ].filter((item) => util.isDisplayable(item));

      const favData = [];
      this.items.forEach(url => {
        const found = allItems.find(item => {
          const resolved = util.itemHref(item, item.base);
          return encodeURI(resolved) === url;
        });
        if (found) favData.push(found);
      });

      // Build the grid HTML safely
      const html = favData.map(item => grid.buildItemsHtml([item], item.base)).join('');

      el.innerHTML = html;
      iconLazyLoader.init();
      search.apply();
      
      const cards = el.querySelectorAll('.browse-card');
      opening.staggerCards(cards, 0, 10);
    }
  };

  let activeCategory = 'All Games';

  const dropdown = {
    init() {
      const rootEl = document.getElementById('browseDropdown');
      const btn = document.getElementById('browseDropdownBtn');
      const menu = document.getElementById('browseDropdownMenu');
      const label = document.getElementById('browseDropdownLabel');
      if (!rootEl || !btn || !menu || !label) return;

      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        rootEl.classList.toggle('open');
      });

      menu.addEventListener('click', (e) => {
        const item = e.target.closest('.browse-dropdown-item');
        if (!item) return;
        const value = item.dataset.value;
        rootEl.classList.remove('open');
        if (value === activeCategory) return;

        label.style.opacity = '0';
        label.style.transform = 'translateY(-5px)';
        setTimeout(() => {
          label.textContent = value;
          label.style.opacity = '1';
          label.style.transform = 'translateY(0)';
        }, 160);

        menu.querySelectorAll('.browse-dropdown-item').forEach((el) => {
          el.classList.toggle('active', el.dataset.value === value);
        });

        activeCategory = value;
        grid.render(activeCategory);
        featured.reloadForCategory(activeCategory);
      });

      document.addEventListener('click', () => rootEl.classList.remove('open'));
    },
  };

  const infoPopup = {
    popup: null,
    unloadTimer: null,
    show() {
      if (!this.popup) return;
      this.popup.classList.add('visible');
      clearTimeout(this.unloadTimer);
    },
    hide() {
      if (!this.popup) return;
      this.popup.classList.remove('visible');
      clearTimeout(this.unloadTimer);
    },
    init() {
      const btn = document.getElementById('infoBtn');
      const popup = document.getElementById('infoPopup');
      this.popup = popup;
      if (!btn || !popup) return;
      btn.addEventListener('click', (event) => {
        event.stopPropagation();
        this.popup.classList.toggle('visible');
      });
      btn.addEventListener('mouseenter', () => this.show());
      btn.addEventListener('mouseleave', () => this.hide());
      btn.addEventListener('focus', () => this.show());
      btn.addEventListener('blur', () => this.hide());
      popup.addEventListener('mouseenter', () => this.show());
      popup.addEventListener('mouseleave', () => this.hide());
      popup.addEventListener('click', (event) => event.stopPropagation());
      document.addEventListener('click', () => this.hide());
    },
  };

  const search = {
    input: null,
    init() {
      this.input = document.getElementById('browseSearch');
      if (!this.input) return;
      this.input.addEventListener('input', () => this.apply());
    },
    apply() {
      const query = String(this.input?.value || '').trim().toLowerCase();
      document.querySelectorAll('.browse-tile').forEach((tile) => {
        const name = tile.querySelector('.browse-card-name')?.textContent?.toLowerCase() || '';
        const visible = !query || name.includes(query);
        tile.hidden = !visible;
      });
    },
  };

  const featured = {
    el: null,
    inner: null,
    dotsEl: null,
    pool: [],
    idx: 0,
    intervalId: null,
    isHovered: false,
    initialized: false,
    started: false,
    pickPool(category = activeCategory) {
      const cfg = CATEGORY_CONFIG[category];
      if (!cfg) return [];
      const list = (cfg.list?.() || [])
        .filter((item) => item && util.isDisplayable(item))
        .map((it) => ({ it, base: cfg.basePath || '' }));
      if (!list.length) return [];
      const arr = list.slice();
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
      return arr.slice(0, Math.min(6, arr.length));
    },
    renderItem(wrapped) {
      const item = wrapped.it || wrapped;
      const base = wrapped.base || 'mages/';
      const name = util.escapeHtml(util.formatDisplayName(item));
      const iconRaw = util.iconPathFor(item);
      const icon = iconRaw ? encodeURI(iconRaw) : '';
      const href = encodeURI(util.itemHref(item, base)) || '#';
      const imgHtml = icon ? `<img class="featured-icon" src="${icon}" alt="${name}" loading="lazy">` : '';
      const bgStyle = icon ? `style="background-image: url('${icon}');"` : '';
      const section = util.escapeHtml(item.section || 'N/A');
      const author = util.escapeHtml(item.author || 'N/A');
      const gameDataAttr = `data-game-data="${encodeURIComponent(JSON.stringify(item))}"`;
      
      return `
        <div class="featured-slide" ${gameDataAttr}>
          <div class="featured-bg" ${bgStyle}></div>
          <div class="featured-content">
            ${imgHtml}
            <div class="featured-meta">
              <div class="featured-title">${name}</div>
              <div class="featured-info">
                <span class="featured-section">${section}</span>
                <span class="featured-author">By: ${author}</span>
              </div>
              <a class="featured-play" href="${util.escapeHtml(href)}" data-game-url="${util.escapeHtml(href)}">Play</a>
            </div>
          </div>
        </div>`;
    },
    renderDots() {
      if (!this.dotsEl) return;
      this.dotsEl.innerHTML = this.pool
        .map((_, i) => `<button class="featured-dot${i === this.idx ? ' active' : ''}" data-dot-idx="${i}" aria-label="Go to featured item ${i + 1}"></button>`)
        .join('');
      this.dotsEl.querySelectorAll('.featured-dot').forEach((btn) => {
        btn.addEventListener('click', () => {
          const i = Number(btn.getAttribute('data-dot-idx') || 0);
          this.pause();
          this.showIndex(i);
          this.resume();
        });
      });
    },
    updateDots() {
      if (!this.dotsEl) return;
      this.dotsEl.querySelectorAll('.featured-dot').forEach((dot, i) => {
        dot.classList.toggle('active', i === this.idx);
      });
    },
    showIndex(i) {
      if (!this.inner || !this.pool.length) return;
      this.idx = i % this.pool.length;
      
      // Immediately remove all existing slides to prevent stacking/flooding
      this.inner.querySelectorAll('.featured-slide').forEach((prev) => prev.remove());

      const node = document.createElement('div');
      node.innerHTML = this.renderItem(this.pool[this.idx]).trim();
      const slide = node.firstElementChild;

      // If this is the first slide ever, show it immediately without animation
      // to prevent the initial slide-in from flooding into the home section
      if (!this._hasShownFirst) {
        this._hasShownFirst = true;
        slide.classList.add('active', 'no-transition');
      }

      this.inner.appendChild(slide);
      
      // Trigger reflow to ensure initial transform is registered before transition starts
      void slide.offsetHeight; 
      slide.classList.remove('no-transition');
      slide.classList.add('active');

      this.updateDots();
    },


    next() {
      this.idx += 1;
      if (this.idx >= this.pool.length) {
        this.pool = this.pickPool(activeCategory);
        this.idx = 0;
        this.renderDots();
      }
      this.showIndex(this.idx);
    },
    prev() {
      if (!this.pool.length) return;
      this.idx -= 1;
      if (this.idx < 0) this.idx = this.pool.length - 1;
      this.showIndex(this.idx);
    },
    pause() {
      if (this.intervalId) {
        clearInterval(this.intervalId);
        this.intervalId = null;
      }
    },
    resume() {
      if (this.isHovered) return;
      if (!this.intervalId && this.pool.length) {
        this.intervalId = setInterval(() => this.next(), 5000);
      }
    },
    start() {
      if (!this.pool.length) return;
      this.started = true;
      this.showIndex(0);
      this.renderDots();
      this.resume();
    },
    reloadForCategory(category) {
      this.pause();
      this.pool = this.pickPool(category);
      this.idx = 0;
      if (!this.pool.length) {
        if (this.inner) this.inner.innerHTML = '';
        if (this.dotsEl) this.dotsEl.innerHTML = '';
        return;
      }
      if (!this.started) return;
      this.start();
    },
    ensureStarted() {
      if (!this.initialized) this.init();
      if (this.started || !this.pool.length) return;
      this.start();
    },
    init() {
      if (this.initialized) return;
      this.el = document.getElementById('featured');
      this.inner = document.getElementById('featuredInner');
      this.dotsEl = document.getElementById('featuredDots');
      if (!this.el || !this.inner) return;
      this.pool = this.pickPool(activeCategory);
      if (!this.pool.length) return;
      // wire buttons
      const prevBtn = document.getElementById('featuredPrev');
      const nextBtn = document.getElementById('featuredNext');
      prevBtn?.addEventListener('click', (e) => { e.stopPropagation(); this.pause(); this.prev(); this.resume(); });
      nextBtn?.addEventListener('click', (e) => { e.stopPropagation(); this.pause(); this.next(); this.resume(); });
      // pause on hover
      this.el.addEventListener('mouseenter', () => { this.isHovered = true; this.pause(); });
      this.el.addEventListener('mouseleave', () => { this.isHovered = false; this.resume(); });
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
          this.pause();
        } else if (this.started) {
          this.resume();
        }
      });
      this.initialized = true;
      this.start();
    },
  };

  // Expose gameVisor globally so sienna.js can open internal tabs
  window.gameVisor = {
    overlay: null,
    container: null,
    iframe: null,
    titleEl: null,
    titleAreaEl: null,
    titlebar: null,
    closeBtn: null,
    minimizeBtn: null,
    fullscreenBtn: null,
    refreshBtn: null,
    openBlankBtn: null,
    infoBtn: null,
    infoTooltip: null,
    infoModal: null,
    infoModalOverlay: null,
    loader: null,
    progressBar: null,
    progressTimer: null,
    loadTimeout: null,
    progressValue: 0,
    dock: null,
    dockToggle: null,
    dockTabs: null,
    isDragging: false,
    isDragCandidate: false,
    dragStartX: 0,
    dragStartY: 0,
    dragOffsetX: 0,
    dragOffsetY: 0,
    tabs: [],
    activeTabId: null,
    currentGameData: null,
    iframeLoadHandler: null,
    iframeErrorHandler: null,

    init() {
      this.overlay = document.getElementById('gameVisorOverlay');
      this.container = document.getElementById('gameVisor');
      this.iframe = document.getElementById('gameVisorIframe');
      this.titleEl = document.getElementById('gameVisorTitle');
      this.titleAreaEl = document.querySelector('.game-visor-title-area');
      this.titlebar = document.getElementById('gameVisorTitlebar');
      this.closeBtn = document.getElementById('gameVisorClose');
      this.minimizeBtn = document.getElementById('gameVisorMinimize');
      this.fullscreenBtn = document.getElementById('gameVisorFullscreen');
      this.refreshBtn = document.getElementById('gameVisorRefresh');
      this.openBlankBtn = document.getElementById('gameVisorOpenBlank');
      this.dock = document.getElementById('gameVisorDock');
      this.dockToggle = document.getElementById('gameVisorDockToggle');
      this.dockTabs = document.getElementById('gameVisorDockTabs');
      this.loader = document.getElementById('gameVisorLoader');
      this.progressBar = document.getElementById('gameVisorProgressBar');

      if (!this.container || !this.overlay || !this.iframe || !this.dock || !this.dockToggle || !this.dockTabs || !this.loader || !this.progressBar) return;

      this.overlay.addEventListener('click', () => this.minimize(true));
      this.closeBtn.addEventListener('click', () => this.close());
      this.minimizeBtn.addEventListener('click', () => this.minimize(true));
      this.fullscreenBtn.addEventListener('click', () => this.toggleFullscreen());
      this.refreshBtn?.addEventListener('click', () => this.refresh());
      this.openBlankBtn?.addEventListener('click', () => this.openBlank());
      this.dockToggle.addEventListener('click', () => this.toggleDock());
      this.bindIframeEvents();

      this.titlebar.addEventListener('pointerdown', (e) => {
        if (e.target.closest('.mac-btn')) return;
        if (e.target.closest('.game-visor-action-btn')) return;
        if (e.target.closest('.game-visor-info-btn')) return;
        if (this.container.classList.contains('minimized')) return;
        this.isDragCandidate = true;
        this.dragStartX = e.clientX;
        this.dragStartY = e.clientY;
        const rect = this.container.getBoundingClientRect();
        this.dragOffsetX = e.clientX - rect.left;
        this.dragOffsetY = e.clientY - rect.top;
        this.container.setPointerCapture?.(e.pointerId);
      });

      document.addEventListener('pointermove', (e) => {
        if (this.isDragCandidate && !this.isDragging) {
          const dx = e.clientX - this.dragStartX;
          const dy = e.clientY - this.dragStartY;
          if (Math.hypot(dx, dy) > 8) {
            this.isDragging = true;
            this.isDragCandidate = false;
          }
        }
        if (!this.isDragging) return;
        const x = e.clientX - this.dragOffsetX;
        const y = e.clientY - this.dragOffsetY;
        const maxX = window.innerWidth - this.container.offsetWidth - 8;
        const maxY = window.innerHeight - this.container.offsetHeight - 8;
        this.container.style.left = `${Math.max(8, Math.min(maxX, x))}px`;
        this.container.style.top = `${Math.max(8, Math.min(maxY, y))}px`;
        this.container.style.transform = 'none';
      });

      document.addEventListener('pointerup', () => {
        this.isDragging = false;
        this.isDragCandidate = false;
      });

      document.addEventListener('fullscreenchange', () => {
        if (!document.fullscreenElement) {
          this.container.classList.remove('fullscreened');
          this.fullscreenBtn.classList.remove('active');
          return;
        }
        this.container.classList.add('fullscreened');
        this.fullscreenBtn.classList.add('active');
      });

      this.loadTabsFromStorage();
      this.renderDock();
    },

    bindIframeEvents() {
      if (!this.iframe) return;
      this.iframeLoadHandler = () => {
        this.completeLoading();
      };
      this.iframeErrorHandler = () => {
        console.error('gameVisor: iframe reported an error while loading.');
        this.stopLoading();
        this.titleEl.textContent = 'Game failed to load';
      };
      this.iframe.addEventListener('load', this.iframeLoadHandler);
      this.iframe.addEventListener('error', this.iframeErrorHandler);
    },

    replaceIframe(nextSrc = 'about:blank') {
      if (!this.iframe) return null;
      const replacement = this.iframe.cloneNode(false);
      replacement.src = nextSrc;
      this.iframe.replaceWith(replacement);
      this.iframe = replacement;
      this.bindIframeEvents();
      return replacement;
    },

    updateTitleArea(name, gameData) {
      this.titleEl.textContent = name;
      this.currentGameData = gameData;
      if (!this.infoBtn) {
        this.infoBtn = document.createElement('button');
        this.infoBtn.className = 'game-visor-info-btn';
        this.infoBtn.type = 'button';
        this.infoBtn.setAttribute('aria-label', 'Game info');
        this.infoBtn.textContent = 'i';
        this.titleAreaEl.appendChild(this.infoBtn);
        this.infoBtn.addEventListener('click', () => {
          if (this.infoModal && this.infoModal.style.display === 'flex') {
            this.hideInfoModal();
          } else {
            this.showInfoModal();
          }
        });
      }
    },

    makeTabId(url) {
      return `gv-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 7)}`;
    },

    addTab(url, name, gameData = null) {
      // Settings are never added to the persistent tabs array
      if (url === 'internal:settings') return null;

      const existing = this.tabs.find((t) => t.url === url);
      if (existing) {
        this.activeTabId = existing.id;
        this.renderDock();
        return existing;
      }

      const tab = { id: this.makeTabId(url), url, name, loaded: false, gameData };
      this.tabs.push(tab);
      this.activeTabId = tab.id;
      this.saveTabsToStorage();
      this.renderDock();
      return tab;
    },

    getGameHtmlBlobUrl(gameData) {
      if (!gameData || !gameData.html) return null;
      try {
        // Inject a style to force black background so white text doesn't clash
        let html = gameData.html;
        const forcedBg = '<style>html, body { background: #000 !important; }</style>';
        html = html.replace('<head>', '<head>' + forcedBg);

        // Fix: ensure <base href> works correctly with blob URLs
        // When HTML is loaded from a blob URL, relative <base href> paths
        // resolve relative to the blob URL, not the intended CDN.
        // We need to make sure the base href is absolute.
        html = html.replace(
          /<base\s+href=["']([^"']*)["']\s*\/?>/gi,
          (match, href) => {
            // If it's already absolute (http://, https://, //), keep it
            if (/^(https?:)?\/\//i.test(href)) return match;
            // If it's relative, resolve it against the current page origin
            const resolved = new URL(href, window.location.origin).href;
            return `<base href="${resolved}">`;
          }
        );

        const blob = new Blob([html], { type: 'text/html' });
        return URL.createObjectURL(blob);
      } catch (e) {
        console.error('gameVisor: failed to create blob URL from embedded HTML', e);
        return null;
      }
    },

    openSettings() {
      this.open('internal:settings', 'Settings');
    },

    open(url, name = 'Game', gameData = null) {
      // Lazy-init if elements aren't captured yet to prevent race conditions
      if (!this.container || !this.iframe) {
        this.init();
      }
      if (!this.container || !this.iframe) return;
      const isSettings = url === 'internal:settings';

      // Check if game has embedded HTML — use blob URL instead of file path
      const blobUrl = this.getGameHtmlBlobUrl(gameData);
      const resolvedUrl = isSettings ? url : (blobUrl || util.resolveUrl(url));
      const tab = this.addTab(resolvedUrl, name, gameData);


      // If settings, we track the ID manually but don't save to array
      this.activeTabId = isSettings ? 'internal:settings' : (tab ? tab.id : null);

      this.container.classList.remove('minimized');
      this.container.classList.add('open');
      this.overlay.classList.add('visible');
      this.container.style.left = '';
      this.container.style.top = '';
      this.container.style.transform = 'translateX(-50%) translateY(0) scale(1)';

      this.updateTitleArea(name, gameData);

      // Hide refresh/open-blank buttons when settings is open
      if (this.refreshBtn) this.refreshBtn.style.display = isSettings ? 'none' : '';
      if (this.openBlankBtn) this.openBlankBtn.style.display = isSettings ? 'none' : '';

      if (isSettings) {
        this.iframe.style.display = 'none';
        let panel = document.getElementById('settingsPanel');
        if (!panel) {
          panel = document.createElement('div');
          panel.id = 'settingsPanel';
          panel.className = 'settings-panel';
          this.container.appendChild(panel);
        }
        panel.style.display = 'block';
        window.siennaSettings?.renderPanel();
      } else {
        this.iframe.style.display = 'block';
        const panel = document.getElementById('settingsPanel');
        if (panel) panel.style.display = 'none';
        this.startLoading();
        this.replaceIframe('about:blank');
        requestAnimationFrame(() => {
          if (this.iframe) this.iframe.src = resolvedUrl;
        });
      }

      if (tab) {
        tab.loaded = true;
      }
      this.saveTabsToStorage();
      this.renderDock();
      document.body.classList.add('game-visor-open');
      window.siennaSettings?.apply();
    },

    close() {
      if (!this.container || !this.overlay || !this.iframe) return;

      this.hideInfoModal();
      // Exit fullscreen if needed first, then close cleanly.
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      }

      if (this.activeTabId && this.activeTabId !== 'internal:settings') {
        this.tabs = this.tabs.filter((t) => t.id !== this.activeTabId);
      }
      this.activeTabId = null;

      this.overlay.classList.remove('visible');
      this.container.classList.remove('open', 'minimized');
      this.container.classList.remove('fullscreened');
      this.container.style.transform = 'translateX(-50%) translateY(-12px) scale(0.96)';
      this.replaceIframe('about:blank');
      this.iframe.style.display = 'block';
      const panel = document.getElementById('settingsPanel');
      if (panel) panel.style.display = 'none';
      this.titleEl.textContent = 'Game';
      this.stopLoading();

      this.saveTabsToStorage();
      if (this.tabs.length) {
        this.showDock();
      } else {
        this.hideDock();
      }
      this.renderDock();
      document.body.classList.remove('game-visor-open');
      window.siennaSettings?.apply();
    },

    minimize(isViaOverlay = false) {
      if (!this.container || !this.dock) return;
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
        return;
      }
      this.hideInfoModal();
      if (!this.activeTabId) return;

      this.container.classList.remove('open');
      this.container.classList.add('minimized');
      this.overlay.classList.remove('visible');
      this.showDock();
      this.renderDock();
      document.body.classList.remove('game-visor-open');
      window.siennaSettings?.apply();
    },

    restoreTab(tabId) {
      if (tabId === 'internal:settings') return this.openSettings();
      const tab = this.tabs.find((t) => t.id === tabId);
      if (!tab) return;
      this.container.classList.remove('minimized');
      this.container.classList.add('open');
      this.overlay.classList.add('visible');
      this.updateTitleArea(tab.name, tab.gameData);

      const isSettings = tab.url === 'internal:settings';
      if (isSettings) {
        this.iframe.style.display = 'none';
        let panel = document.getElementById('settingsPanel');
        if (!panel) {
          panel = document.createElement('div');
          panel.id = 'settingsPanel';
          panel.className = 'settings-panel';
          this.container.appendChild(panel);
        }
        panel.style.display = 'block';
        window.siennaSettings?.renderPanel();
      } else {
        this.iframe.style.display = 'block';
        const panel = document.getElementById('settingsPanel');
        if (panel) panel.style.display = 'none';
        if (this.iframe.src !== tab.url) {
          this.startLoading();
          this.replaceIframe('about:blank');
          requestAnimationFrame(() => {
            if (this.iframe) this.iframe.src = tab.url;
          });
          tab.loaded = true;
        }
      }

      this.saveTabsToStorage();
      this.hideDock();
      this.renderDock();
      document.body.classList.add('game-visor-open');
      window.siennaSettings?.apply();
    },

    startLoading() {
      if (!this.loader || !this.progressBar) return;
      this.loader.classList.add('visible');
      this.loader.classList.remove('hidden');
      this.progressValue = 0;
      this.progressBar.style.width = '0%';
      clearInterval(this.progressTimer);
      clearTimeout(this.loadTimeout);
      this.progressTimer = setInterval(() => {
        if (this.progressValue < 90) {
          this.progressValue += Math.max(1, Math.random() * 7);
          if (this.progressValue > 90) this.progressValue = 90;
          this.progressBar.style.width = `${Math.floor(this.progressValue)}%`;
        }
      }, 150);

      this.loadTimeout = setTimeout(() => {
        console.warn('gameVisor: iframe load timeout reached, showing fallback.');
        this.completeLoading();
        this.titleEl.textContent = 'Game failed to load';
      }, 20000);
    },

    completeLoading() {
      if (!this.loader || !this.progressBar) return;
      clearInterval(this.progressTimer);
      clearTimeout(this.loadTimeout);
      this.progressValue = 100;
      this.progressBar.style.width = '100%';
      setTimeout(() => {
        this.loader.classList.remove('visible');
        this.loader.classList.add('hidden');
        this.progressBar.style.width = '0%';
      }, 250);
    },

    stopLoading() {
      if (!this.loader || !this.progressBar) return;
      clearInterval(this.progressTimer);
      clearTimeout(this.loadTimeout);
      this.loader.classList.remove('visible');
      this.loader.classList.add('hidden');
      this.progressBar.style.width = '0%';
    },



    toggleFullscreen() {
      if (!this.container) return;
      if (this.container.classList.contains('fullscreened') || document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
        return;
      }
      this.container.requestFullscreen?.().catch(() => {});
    },

    refresh() {
      if (!this.iframe) return;
      
      const currentSrc = this.iframe.src;
      if (!currentSrc) return;
      
      // Start loading indicator
      this.startLoading();
      this.replaceIframe('about:blank');
      requestAnimationFrame(() => {
        if (this.iframe) this.iframe.src = currentSrc;
      });
    },

    openBlank() {
      if (!this.iframe) return;

      let url = this.iframe.src;

      // Fall back to active tab URL if iframe src is empty
      if (!url && this.activeTabId) {
        const activeTab = this.tabs.find((t) => t.id === this.activeTabId);
        if (activeTab) url = activeTab.url;
      }

      if (!url) return;
      window.siennaSettings?.handleCloak?.(url);
    },

    showInfo() {
      if (!this.currentGameData) return;
      const section = this.currentGameData.section || 'N/A';
      const author = this.currentGameData.author || 'N/A';
      alert(`Section: ${section}\nBy: ${author}`);
    },

    showInfoModal() {
      if (!this.currentGameData || !this.infoBtn) return;
      if (!this.infoModalOverlay) {
        this.infoModalOverlay = document.createElement('div');
        this.infoModalOverlay.className = 'game-visor-info-modal-overlay';
        this.infoModal = document.createElement('div');
        this.infoModal.className = 'game-visor-info-modal';
        this.infoModal.innerHTML = `
          <div class="game-visor-info-modal-header">
            <div class="game-visor-info-modal-title">Info</div>
            <button class="game-visor-info-modal-close" type="button" aria-label="Close info">&times;</button>
          </div>
          <div class="game-visor-info-modal-content"></div>
        `;
        this.infoModalOverlay.appendChild(this.infoModal);
        document.body.appendChild(this.infoModalOverlay);
        this.infoModal.querySelector('.game-visor-info-modal-close').addEventListener('click', () => this.hideInfoModal());
        this.infoModalOverlay.addEventListener('click', (e) => {
          if (e.target === this.infoModalOverlay) this.hideInfoModal();
        });
      }
      const section = this.currentGameData.section || 'N/A';
      const author = this.currentGameData.author || 'N/A';
      this.infoModal.querySelector('.game-visor-info-modal-content').innerHTML = `Section: ${util.escapeHtml(section)}<br>Author: ${util.escapeHtml(author)}`;
      this.infoModalOverlay.style.display = 'flex';
    },

    hideInfoModal() {
      if (this.infoModalOverlay) {
        this.infoModalOverlay.style.display = 'none';
      }
    },

    toggleDock() {
      if (!this.dock) return;
      const isCollapsed = this.dock.classList.contains('collapsed');
      this.dock.classList.toggle('collapsed', !isCollapsed);
      const toggleButton = this.dockToggle;
      if (toggleButton) {
        toggleButton.textContent = isCollapsed ? '<<' : '>>';
      }
    },

    showDock() {
      if (!this.dock) return;
      this.dock.classList.remove('collapsed');
      this.dock.classList.add('visible');
      this.dock.classList.remove('hidden');
      if (this.dockToggle) this.dockToggle.textContent = '<<';
    },

    hideDock() {
      if (!this.dock) return;
      this.dock.classList.add('collapsed');
      if (this.dockToggle) this.dockToggle.textContent = '>>';
    },

    saveTabsToStorage() {
      if (!window.siennaSettings?.shouldRememberTabs?.()) return;
      try {
        localStorage.setItem('gameVisorTabs', JSON.stringify(this.tabs.map((t) => ({ id: t.id, url: t.url, name: t.name, loaded: false, gameData: t.gameData }))));
        localStorage.setItem('gameVisorActiveTabId', this.activeTabId ?? '');
      } catch (e) {
        // localStorage may not be available
      }
    },

    loadTabsFromStorage() {
      if (!window.siennaSettings?.shouldRememberTabs?.()) {
        this.tabs = [];
        this.activeTabId = null;
        return;
      }
      try {
        const saved = localStorage.getItem('gameVisorTabs');
        const activeId = localStorage.getItem('gameVisorActiveTabId');
        if (saved) {
          this.tabs = JSON.parse(saved) || [];
          this.activeTabId = activeId || (this.tabs.length ? this.tabs[this.tabs.length - 1].id : null);
          this.tabs = this.tabs.map((t) => ({ ...t, loaded: false }));
        }
      } catch (e) {
        this.tabs = [];
        this.activeTabId = null;
      }
      if (this.tabs.length) {
        this.dock.classList.add('visible');
        this.dock.classList.remove('hidden');
      } else {
        this.dock.classList.remove('visible');
        this.dock.classList.add('hidden');
      }
    },

    renderDock() {
      if (!this.dock || !this.dockTabs) return;
      this.dockTabs.innerHTML = '';
      if (!this.tabs.length) {
        this.dock.classList.remove('visible');
        this.dock.classList.add('hidden');
        return;
      }

      this.tabs.forEach((tab) => {
        const tabBtn = document.createElement('div');
        tabBtn.className = `game-visor-dock-tab${tab.id === this.activeTabId ? ' active' : ''}`;
        tabBtn.setAttribute('data-tab-id', tab.id);
        tabBtn.setAttribute('role', 'button');
        tabBtn.setAttribute('tabindex', '0');

        const titleEl = document.createElement('span');
        titleEl.className = 'game-visor-dock-tab-title';
        titleEl.textContent = tab.name;

        const closeEl = document.createElement('button');
        closeEl.className = 'game-visor-dock-tab-close';
        closeEl.setAttribute('aria-label', `Close ${tab.name}`);
        closeEl.textContent = 'x';
        closeEl.addEventListener('click', (e) => {
          e.stopPropagation();
          const wasActive = this.activeTabId === tab.id;
          this.tabs = this.tabs.filter((t) => t.id !== tab.id);
          if (wasActive) {
            this.activeTabId = null;
            this.overlay.classList.remove('visible');
            this.container.classList.remove('open', 'minimized');
            this.replaceIframe('about:blank');
            this.updateTitleArea('Game', null);
            document.body.classList.remove('game-visor-open');
            window.siennaSettings?.apply();
          }
          this.saveTabsToStorage();
          this.renderDock();
        });

        tabBtn.addEventListener('click', () => {
          this.restoreTab(tab.id);
        });
        tabBtn.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            this.restoreTab(tab.id);
          }
        });

        tabBtn.appendChild(titleEl);
        tabBtn.appendChild(closeEl);
        this.dockTabs.appendChild(tabBtn);
      });

      this.dock.classList.add('visible');
      this.dock.classList.remove('hidden');
    },
  };


  function boot() {
    customGames.load();
    customGames.initModal();
    opening.bind();
    dropdown.init();
    search.init();
    infoPopup.init();
    gameVisor.init();
    favorites.init();

    const browseGridElement = document.getElementById('browseGrid');
    const favoritesGridElement = document.getElementById('favoritesGrid');

    const handleGridClick = (event) => {
        const editBtn = event.target.closest('.custom-game-edit-btn');
        if (editBtn) {
          event.preventDefault();
          event.stopPropagation();
          const id = editBtn.dataset.customId;
          if (id) {
            customGames.openEditModal(id);
          }
          return;
        }
        const deleteBtn = event.target.closest('.custom-game-delete-btn');
        if (deleteBtn) {
          event.preventDefault();
          event.stopPropagation();
          const id = deleteBtn.dataset.customId;
          if (id) {
            customGames.remove(id);
            grid.render(activeCategory);
          }
          return;
        }
        const favBtn = event.target.closest('.favorite-btn');
        if (favBtn) {
          event.preventDefault();
          event.stopPropagation();
          favorites.toggle(favBtn.dataset.favUrl, favBtn);
          return;
        }
        const tile = event.target.closest('.browse-tile');
        if (!tile) return;
        event.preventDefault();
        const url = tile.dataset.gameUrl || tile.querySelector('.browse-card')?.dataset.gameUrl || tile.querySelector('.browse-card')?.href;
        const name = tile.querySelector('.browse-card-name')?.textContent?.trim() || 'Game';
        let gameData = null;
        if (tile.dataset.gameData) {
          try {
            gameData = JSON.parse(decodeURIComponent(tile.dataset.gameData));
          } catch (e) {}
        }
        if (url && url !== '#') {
          gameVisor.open(url, name, gameData);
        }
    };

    if (browseGridElement) browseGridElement.addEventListener('click', handleGridClick);
    if (favoritesGridElement) favoritesGridElement.addEventListener('click', handleGridClick);

    document.body.addEventListener('click', (event) => {
      const featuredPlay = event.target.closest('.featured-play');
      if (!featuredPlay) return;
      event.preventDefault();
      const url = featuredPlay.dataset.gameUrl || featuredPlay.href;
      const slide = featuredPlay.closest('.featured-slide');
      const title = slide?.querySelector('.featured-title')?.textContent?.trim() || 'Game';
      let gameData = null;
      if (slide?.dataset.gameData) {
        try {
          gameData = JSON.parse(decodeURIComponent(slide.dataset.gameData));
        } catch (e) {}
      }
      if (url && url !== '#') {
        gameVisor.open(url, title, gameData);
      }
    });

    const scheduleInitialGridRender = () => {
      const browseGrid = document.getElementById('browseGrid');
      if (!browseGrid || browseGrid.childElementCount) return;
      grid.render(activeCategory);
    };

    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(scheduleInitialGridRender);
    } else {
      setTimeout(scheduleInitialGridRender, 320);
    }

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        opening.ensureBrowseVisible();
      });
    });

    window.addEventListener('pagehide', () => {
      featured.pause();
      opening.clearStaggerTimers();
      iconLazyLoader.teardown();
      if (window.gameVisor?.replaceIframe) {
        window.gameVisor.replaceIframe('about:blank');
      }
    });
  }

  // Ensure data is loaded from server endpoints if available. Falls back to any
  // existing `window.MAGES_GAMES` / `window.APPS_ITEMS` (e.g., static mages.js).
  (async function start() {
    try {
      if (!window.MAGES_GAMES) {
        const r = await fetch('/mages.json');
        if (r.ok) window.MAGES_GAMES = await r.json();
      }
      if (!window.APPS_ITEMS) {
        const r2 = await fetch('/apps.json');
        if (r2.ok) window.APPS_ITEMS = await r2.json();
      }
    } catch (e) {
      // Network or server not present; fall back to embedded globals.
      // (no-op)
    }
    boot();
  }());
})();
