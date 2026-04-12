/**
 * Browse / opening flow, games & apps grid, dropdown, info popup, analytics placeholder.
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
  };

  const iconLazyLoader = {
    observer: null,
    preloaded: new Set(),

    init() {
      if (!('IntersectionObserver' in window) || !document.querySelectorAll) return;
      if (this.observer) {
        this.observer.disconnect();
      }

      this.observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const img = entry.target;
          this.observer.unobserve(img);
          this.loadImage(img);
        });
      }, {
        rootMargin: '400px',
        threshold: 0.01,
      });

      this.observeAll();
    },

    observeAll() {
      if (!this.observer) return;
      document.querySelectorAll('img.browse-card-icon[data-src]').forEach((img) => {
        if (img.dataset.src) this.observer.observe(img);
      });
      this.loadVisible();
    },

    loadVisible() {
      document.querySelectorAll('img.browse-card-icon[data-src]').forEach((img) => {
        if (this.isElementInViewport(img)) {
          this.loadImage(img);
        }
      });
    },

    isElementInViewport(el) {
      const rect = el.getBoundingClientRect();
      const windowHeight = window.innerHeight || document.documentElement.clientHeight;
      const windowWidth = window.innerWidth || document.documentElement.clientWidth;
      return (
        rect.top >= -400 && // accounting for rootMargin
        rect.left >= -400 &&
        rect.bottom <= windowHeight + 400 &&
        rect.right <= windowWidth + 400
      );
    },

    loadImage(img) {
      const url = img.dataset.src;
      if (!url) return;
      img.src = url;
      img.removeAttribute('data-src');
      img.addEventListener('load', () => this.prefetchNext(img), { once: true });
      img.addEventListener('error', () => this.prefetchNext(img), { once: true });
    },

    prefetchNext(currentImg) {
      const allIcons = Array.from(document.querySelectorAll('img.browse-card-icon'));
      const currentIdx = allIcons.indexOf(currentImg);
      if (currentIdx === -1) return;

      const preloadCount = 12;
      for (let i = currentIdx + 1; i < Math.min(allIcons.length, currentIdx + 1 + preloadCount); i++) {
        const img = allIcons[i];
        const dataSrc = img.dataset.src;
        if (dataSrc && !this.preloaded.has(dataSrc)) {
          this.preloaded.add(dataSrc);
          const p = new Image();
          p.src = dataSrc;
        }
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
    revealBrowse() {
      const inner = document.getElementById('browseInner');
      if (inner) requestAnimationFrame(() => inner.classList.add('revealed'));
      this.staggerCards(document.querySelectorAll('.browse-card'), 60, 10);
    },
    staggerCards(cards, baseDelay, step) {
      cards.forEach((card, i) => {
        const delay = Math.min(baseDelay + i * step, STAGGER_CAP_MS + baseDelay);
        setTimeout(() => card.classList.add('revealed'), delay);
      });
    },
    ensureBrowseVisible() {
      const page = document.getElementById('page-browse');
      const inner = document.getElementById('browseInner');
      if (!page || !inner || inner.classList.contains('revealed')) return;
      const rect = page.getBoundingClientRect();
      if (rect.top <= window.innerHeight * 0.6) this.revealBrowse();
    },
    bind() {
      document.getElementById('scrollBtn')?.addEventListener('click', () => scroll.toBrowseSection());
      window.addEventListener('scroll', () => this.ensureBrowseVisible(), { passive: true });
    },
  };

  const grid = {
    buildItemsHtml(items, basePath) {
      return items
        .map((g) => {
          if (!g || !g.url) return '';
          const name = util.escapeHtml(util.formatDisplayName(g));
          const hrefRaw = util.resolveUrl(`${basePath}${g.url}`);
          const href = encodeURI(hrefRaw);
          const icon = util.iconPathFor(g);
          const isFav = favorites.has(href);
          const favClass = isFav ? 'active' : '';
          const iconHtml = icon
            ? `<img class="browse-card-icon" data-src="${encodeURI(icon)}" alt="${name}" loading="lazy" decoding="async" onerror="this.style.display='none'; this.parentElement.classList.add('icon-missing');">`
            : '';
          return `<div class="browse-tile" data-game-url="${href}" title="Play ${name}"><a class="browse-card" href="${href}" data-game-url="${href}">${iconHtml}</a><div class="browse-card-name">${name}</div><button class="favorite-btn ${favClass}" data-fav-url="${href}" aria-label="Favorite ${name}"><svg viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg></button></div>`;
        })
        .join('');
    },
    render(category) {
      const el = document.getElementById('browseGrid');
      if (!el) return;

      el.querySelectorAll('.browse-card').forEach((c) => c.classList.remove('revealed'));

      setTimeout(() => {
        const cfg = CATEGORY_CONFIG[category];
        if (!cfg) {
          el.innerHTML = '';
          return;
        }

        const items = cfg.list();
        if (!Array.isArray(items)) {
          el.innerHTML = `<p class="browse-empty">${util.escapeHtml(cfg.failMsg)}</p>`;
        } else if (items.length === 0) {
          el.innerHTML = `<p class="browse-empty">${util.escapeHtml(cfg.emptyMsg)}</p>`;
        } else {
          el.innerHTML = this.buildItemsHtml(items, cfg.basePath);
        }

        const cards = el.querySelectorAll('.browse-card');
        const inner = document.getElementById('browseInner');
        if (inner?.classList.contains('revealed')) {
          opening.staggerCards(cards, 0, STAGGER_STEP_MS);
        } else {
          opening.ensureBrowseVisible();
        }

        iconLazyLoader.init();
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
      const mainGridBtn = document.querySelector(`#browseGrid .favorite-btn[data-fav-url="${url}"]`);
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
      ];

      const favData = [];
      this.items.forEach(url => {
        const found = allItems.find(item => {
          const resolved = util.resolveUrl(`${item.base}${item.url}`);
          return encodeURI(resolved) === url;
        });
        if (found) favData.push(found);
      });

      // Build the grid HTML safely
      const html = favData.map(item => grid.buildItemsHtml([item], item.base)).join('');

      el.innerHTML = html;
      iconLazyLoader.init();
      
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
    init() {
      const btn = document.getElementById('infoBtn');
      const popup = document.getElementById('infoPopup');
      if (!btn || !popup) return;
      btn.addEventListener('mouseenter', () => popup.classList.add('visible'));
      btn.addEventListener('mouseleave', () => popup.classList.remove('visible'));
    },
  };

  const analyticsGraph = {
    init() {
      const gc = document.getElementById('graphCanvas');
      if (!gc) return;
      const ctx = gc.getContext('2d');

      const resize = () => {
        gc.width = gc.offsetWidth || 212;
        gc.height = gc.offsetHeight || 90;
      };

      const generatePlaceholderData = (points) => {
        const data = [];
        let v = 40;
        for (let i = 0; i < points; i += 1) {
          v = Math.max(10, Math.min(90, v + (Math.random() - 0.48) * 22));
          data.push(v);
        }
        return data;
      };

      const drawGraph = (data) => {
        const { width: w, height: h } = gc;
        ctx.clearRect(0, 0, w, h);
        const pad = 8;
        const min = Math.min(...data);
        const max = Math.max(...data);
        const range = max - min || 1;
        const stepX = (w - pad * 2) / (data.length - 1);
        const pts = data.map((v, i) => ({
          x: pad + i * stepX,
          y: pad + (1 - (v - min) / range) * (h - pad * 2),
        }));
        const grad = ctx.createLinearGradient(0, 0, 0, h);
        grad.addColorStop(0, 'rgba(255,255,255,0.12)');
        grad.addColorStop(1, 'rgba(255,255,255,0)');
        const drawCurve = () => {
          ctx.moveTo(pts[0].x, pts[0].y);
          for (let i = 1; i < pts.length; i += 1) {
            const cx = (pts[i - 1].x + pts[i].x) / 2;
            ctx.bezierCurveTo(cx, pts[i - 1].y, cx, pts[i].y, pts[i].x, pts[i].y);
          }
        };
        ctx.beginPath();
        drawCurve();
        ctx.lineTo(pts[pts.length - 1].x, h);
        ctx.lineTo(pts[0].x, h);
        ctx.closePath();
        ctx.fillStyle = grad;
        ctx.fill();
        ctx.beginPath();
        drawCurve();
        ctx.strokeStyle = 'rgba(255,255,255,0.5)';
        ctx.lineWidth = 1.5;
        ctx.lineJoin = 'round';
        ctx.stroke();
      };

      resize();
      drawGraph(generatePlaceholderData(14));
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
    pickPool(category = activeCategory) {
      const cfg = CATEGORY_CONFIG[category];
      if (!cfg) return [];
      const list = (cfg.list?.() || []).filter(Boolean).map((it) => ({ it, base: cfg.basePath || '' }));
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
      const href = encodeURI(`${base}${item.url}`) || '#';
      const imgHtml = icon ? `<img class="featured-icon" src="${icon}" alt="${name}" loading="lazy">` : '';
      const bgStyle = icon ? `style="background-image: url('${icon}');"` : '';
      
      return `
        <div class="featured-slide">
          <div class="featured-bg" ${bgStyle}></div>
          <div class="featured-content">
            ${imgHtml}
            <div class="featured-meta">
              <div class="featured-title">${name}</div>
              <a class="featured-play" href="${href}" data-game-url="${href}">Play Now</a>
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
      
      const node = document.createElement('div');
      node.innerHTML = this.renderItem(this.pool[this.idx]).trim();
      const slide = node.firstElementChild;

      // Clean up existing slides to prevent stacking during fast navigation
      const existing = Array.from(this.inner.querySelectorAll('.featured-slide'));
      existing.forEach((prev) => {
        prev.classList.remove('active');
        prev.classList.add('exit');
        setTimeout(() => { if (prev.parentElement) prev.remove(); }, 850);
      });

      this.inner.appendChild(slide);
      
      // Trigger reflow to ensure initial transform is registered before transition starts
      void slide.offsetHeight; 
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
      this.showIndex(0);
      this.renderDots();
      this.intervalId = setInterval(() => this.next(), 5000);
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
      this.start();
    },
    init() {
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
      this.start();
    },
  };

  const gameVisor = {
    overlay: null,
    container: null,
    iframe: null,
    titleEl: null,
    titlebar: null,
    closeBtn: null,
    minimizeBtn: null,
    fullscreenBtn: null,
    refreshBtn: null,
    openBlankBtn: null,
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

    init() {
      this.overlay = document.getElementById('gameVisorOverlay');
      this.container = document.getElementById('gameVisor');
      this.iframe = document.getElementById('gameVisorIframe');
      this.titleEl = document.getElementById('gameVisorTitle');
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

      this.iframe.addEventListener('load', () => {
        this.completeLoading();
      });

      this.iframe.addEventListener('error', () => {
        console.error('gameVisor: iframe reported an error while loading.');
        this.stopLoading();
        this.titleEl.textContent = 'Game failed to load';
      });

      this.titlebar.addEventListener('pointerdown', (e) => {
        if (e.target.closest('.mac-btn')) return;
        if (e.target.closest('.game-visor-action-btn')) return;
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

    makeTabId(url) {
      return `gv-${btoa(url).replace(/=/g, '')}`;
    },

    addTab(url, name) {
      const existing = this.tabs.find((t) => t.url === url);
      if (existing) {
        this.activeTabId = existing.id;
        this.renderDock();
        return existing;
      }

      const tab = { id: this.makeTabId(url), url, name, loaded: false };
      this.tabs.push(tab);
      this.activeTabId = tab.id;
      this.saveTabsToStorage();
      this.renderDock();
      return tab;
    },

    open(url, name = 'Game') {
      if (!this.container || !this.iframe) return;
      const resolvedUrl = util.resolveUrl(url);
      const tab = this.addTab(resolvedUrl, name);
      this.container.classList.remove('minimized');
      this.container.classList.add('open');
      this.overlay.classList.add('visible');
      this.container.style.left = '';
      this.container.style.top = '';
      this.container.style.transform = 'translateX(-50%) translateY(0) scale(1)';
      this.titleEl.textContent = tab.name;
      this.startLoading();
      this.iframe.src = resolvedUrl;
      tab.loaded = true;
      this.saveTabsToStorage();
      this.renderDock();
      // Stop background animations to give the iframe full GPU budget
      document.body.classList.add('game-visor-open');
      window.particleBg?.stop();
    },

    close() {
      if (!this.container || !this.overlay || !this.iframe) return;
      if (!this.activeTabId) return;

      // Exit fullscreen if needed first, then close cleanly.
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      }

      this.tabs = this.tabs.filter((t) => t.id !== this.activeTabId);
      this.activeTabId = null;

      this.overlay.classList.remove('visible');
      this.container.classList.remove('open', 'minimized');
      this.container.classList.remove('fullscreened');
      this.container.style.transform = 'translateX(-50%) translateY(-12px) scale(0.96)';
      this.iframe.src = 'about:blank';
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
      window.particleBg?.start();
    },

    minimize(isViaOverlay = false) {
      if (!this.container || !this.dock) return;
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
        return;
      }
      if (!this.activeTabId) return;

      this.container.classList.remove('open');
      this.container.classList.add('minimized');
      this.overlay.classList.remove('visible');
      this.showDock();
      this.renderDock();
      document.body.classList.remove('game-visor-open');
      window.particleBg?.start();
    },

    restoreTab(tabId) {
      const tab = this.tabs.find((t) => t.id === tabId);
      if (!tab) return;
      this.activeTabId = tab.id;
      this.container.classList.remove('minimized');
      this.container.classList.add('open');
      this.overlay.classList.add('visible');
      this.titleEl.textContent = tab.name;

      if (this.iframe.src !== tab.url) {
        this.startLoading();
        this.iframe.src = tab.url;
        tab.loaded = true;
      }

      this.saveTabsToStorage();
      this.hideDock();
      this.renderDock();
      document.body.classList.add('game-visor-open');
      window.particleBg?.stop();
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
      
      try {
        // Try to reload from within the iframe first (same-origin)
        if (this.iframe.contentWindow && this.iframe.contentWindow.location) {
          this.iframe.contentWindow.location.reload();
          return;
        }
      } catch (e) {
        // Cross-origin: fall back to src reload
      }
      
      // Fallback: re-set the src to force reload the iframe
      this.iframe.src = '';
      setTimeout(() => {
        this.iframe.src = currentSrc;
      }, 50);
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

      // Open a blank popup then set srcdoc on a child iframe — avoids document.write
      const newWin = window.open('', '_blank');
      if (!newWin) return;

      const frame = newWin.document.createElement('iframe');
      frame.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;border:none;';
      frame.allow = 'autoplay; fullscreen; clipboard-write';
      frame.src = url;
      newWin.document.body.style.margin = '0';
      newWin.document.body.appendChild(frame);
    },

    toggleDock() {
      if (!this.dock) return;
      const isCollapsed = this.dock.classList.contains('collapsed');
      this.dock.classList.toggle('collapsed', !isCollapsed);
      const toggleButton = this.dockToggle;
      if (toggleButton) {
        toggleButton.textContent = isCollapsed ? '«' : '»';
      }
    },

    showDock() {
      if (!this.dock) return;
      this.dock.classList.remove('collapsed');
      this.dock.classList.add('visible');
      this.dock.classList.remove('hidden');
      if (this.dockToggle) this.dockToggle.textContent = '«';
    },

    hideDock() {
      if (!this.dock) return;
      this.dock.classList.add('collapsed');
      if (this.dockToggle) this.dockToggle.textContent = '»';
    },

    saveTabsToStorage() {
      try {
        localStorage.setItem('gameVisorTabs', JSON.stringify(this.tabs.map((t) => ({ id: t.id, url: t.url, name: t.name, loaded: false }))));
        localStorage.setItem('gameVisorActiveTabId', this.activeTabId ?? '');
      } catch (e) {
        // localStorage may not be available
      }
    },

    loadTabsFromStorage() {
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
        closeEl.textContent = '×';
        closeEl.addEventListener('click', (e) => {
          e.stopPropagation();
          const wasActive = this.activeTabId === tab.id;
          this.tabs = this.tabs.filter((t) => t.id !== tab.id);
          if (wasActive) {
            this.activeTabId = null;
            this.overlay.classList.remove('visible');
            this.container.classList.remove('open', 'minimized');
            this.iframe.src = 'about:blank';
            this.titleEl.textContent = 'Game';
            document.body.classList.remove('game-visor-open');
            window.particleBg?.start();
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
    opening.bind();
    dropdown.init();
    infoPopup.init();
    analyticsGraph.init();
    featured.init();
    gameVisor.init();
    favorites.init();

    const browseGridElement = document.getElementById('browseGrid');
    const favoritesGridElement = document.getElementById('favoritesGrid');

    const handleGridClick = (event) => {
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
        if (url && url !== '#') {
          gameVisor.open(url, name);
        }
    };

    if (browseGridElement) browseGridElement.addEventListener('click', handleGridClick);
    if (favoritesGridElement) favoritesGridElement.addEventListener('click', handleGridClick);

    document.body.addEventListener('click', (event) => {
      const featuredPlay = event.target.closest('.featured-play');
      if (!featuredPlay) return;
      event.preventDefault();
      const url = featuredPlay.dataset.gameUrl || featuredPlay.href;
      const title = featuredPlay.closest('.featured-slide')?.querySelector('.featured-title')?.textContent?.trim() || 'Game';
      if (url && url !== '#') {
        gameVisor.open(url, title);
      }
    });

    grid.render(activeCategory);
    opening.ensureBrowseVisible();
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
      // network or server not present — fall back to embedded globals
      // (no-op)
    }
    boot();
  }());
})();