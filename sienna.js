class ParticleBg {
  constructor(canvas, particleCount = 60) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d', { alpha: true });
    this.particles = [];
    this.mouse = { x: -1000, y: -1000, active: false };
    this.rafId = null;
    this.running = false;
    this.lastTimestamp = 0;

    // Aggressive configuration for Chromebooks
    this.config = {
      particleCount,
      connectionDistance: 140,
      connectionDistanceSq: 140 * 140,
      baseSpeed: 0.45,
      maxConnectionsPerFrame: 15,        // only draw up to 15 lines
      size: 2.5                           // fixed size – squares are faster
    };

    // Pre‑calculate alpha values for connection lines (0‑255 steps)
    this.alphaLUT = new Array(256);
    for (let i = 0; i < 256; i++) {
      this.alphaLUT[i] = (1 - i / 255) * 0.22;  // lower max alpha = less overdraw
    }

    this._resize = this._resize.bind(this);
    this._mouseMove = this._mouseMove.bind(this);
    this._mouseLeave = this._mouseLeave.bind(this);
    this._tick = this._tick.bind(this);

    window.addEventListener('resize', this._resize, { passive: true });
    document.addEventListener('mousemove', this._mouseMove, { passive: true });
    document.addEventListener('mouseleave', this._mouseLeave);

    this.canvas.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      will-change: transform;
      display: block;
      z-index: 0;
    `;

    this._resize();
    this._initParticles();
  }

  _resize() {
    const newWidth = window.innerWidth;
    const newHeight = window.innerHeight;
    if (this.canvas.width === newWidth && this.canvas.height === newHeight) return;

    this.canvas.width = newWidth;
    this.canvas.height = newHeight;

    // Clamp mouse out of sight
    this.mouse.x = -1000;
    this.mouse.y = -1000;
    this.mouse.active = false;
  }

  _mouseMove(e) {
    this.mouse.x = e.clientX;
    this.mouse.y = e.clientY;
    this.mouse.active = true;
  }

  _mouseLeave() {
    this.mouse.active = false;
  }

  _initParticles() {
    const { width, height } = this.canvas;
    const { particleCount, baseSpeed, size } = this.config;
    this.particles = new Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      const opacity = Math.random() * 0.4 + 0.35;   // 0.35–0.75
      this.particles[i] = {
        x: Math.random() * width,
        y: Math.random() * height,
        speedY: Math.random() * 0.7 + baseSpeed,
        fillStyle: `rgba(255,255,255,${opacity})`,
        // Pre‑compute half size for rectangle drawing
        hSize: size * 0.5
      };
    }
  }

  _tick(now) {
    if (!this.running) return;

    // Optional: simple frame‑rate capping if things get really bad
    // (comment out if not needed – rAF already syncs to display)
    // if (now - this.lastTimestamp < 16) {
    //   this.rafId = requestAnimationFrame(this._tick);
    //   return;
    // }
    // this.lastTimestamp = now;

    const { ctx, canvas, particles, mouse, config, alphaLUT } = this;
    const { width, height } = canvas;
    const connDistSq = config.connectionDistanceSq;
    const connDist = config.connectionDistance;
    const maxLines = config.maxConnectionsPerFrame;

    // Clear with a single fillRect – sometimes faster than clearRect on some GPUs
    ctx.clearRect(0, 0, width, height);

    // Draw all particles as squares (no path, no arc)
    ctx.fillStyle = '';  // will be set per particle
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];

      p.y += p.speedY;
      if (p.y > height + 10) {
        p.y = -10;
        p.x = Math.random() * width;
      }

      ctx.fillStyle = p.fillStyle;
      ctx.fillRect(p.x - p.hSize, p.y - p.hSize, config.size, config.size);
    }

    // Connection lines – only if mouse is active
    if (mouse.active) {
      ctx.lineWidth = 1.0;

      // Collect distances so we can sort and only draw closest lines
      const distances = [];
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        const dx = p.x - mouse.x;
        const dy = p.y - mouse.y;
        const distSq = dx * dx + dy * dy;
        if (distSq < connDistSq) {
          distances.push({ idx: i, distSq });
        }
      }

      // Sort by distance (closest first) and limit number of lines
      distances.sort((a, b) => a.distSq - b.distSq);
      const linesToDraw = Math.min(distances.length, maxLines);

      for (let i = 0; i < linesToDraw; i++) {
        const item = distances[i];
        const p = particles[item.idx];
        const dist = Math.sqrt(item.distSq);
        const alphaIndex = Math.floor((dist / connDist) * 255);
        const alpha = alphaLUT[alphaIndex];

        ctx.strokeStyle = `rgba(255,255,255,${alpha})`;
        ctx.beginPath();
        ctx.moveTo(mouse.x, mouse.y);
        ctx.lineTo(p.x, p.y);
        ctx.stroke();
      }
    }

    this.rafId = requestAnimationFrame(this._tick);
  }

  start() {
    this.canvas.style.display = 'block';
    if (this.running) return;
    this.running = true;
    this.rafId = requestAnimationFrame(this._tick);
  }

  stop() {
    this.running = false;
    this.canvas.style.display = 'none';
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  isRunning() {
    return this.running;
  }
}

const canvas = document.getElementById('particleCanvas');
if (canvas) window.particleBg = new ParticleBg(canvas, 60);

/**
 * SIENNA SETTINGS SYSTEM
 * Highly organized for easy expansion.
 */
window.siennaSettings = {
  // Internal State
  state: {
    particlesDisabled: false,
    cloakMethod: 'about:blank',
    autoOpen: 'Disabled',
    activeThemeId: 'none',
    themeGridExpanded: false,
    themeCreditsVisible: false,
    themeCreditsText: '',
    gamesProvider: 'Base'
  },

  // Built-in theme registry is authoritative.
  manifestUrl: '',

  themes: [
    { id: 'Astray', label: 'Astray', url: 'backgrounds/astray.jpg' },
    { id: 'Invain', label: 'Invain', url: 'backgrounds/invain.jpg' },
    { id: 'Isolated', label: 'Isolated', url: 'backgrounds/isolated.jpg' },
    { id: 'backrooms', label: 'Backrooms', url: 'backgrounds/backrooms.jpg' },
    { id: 'interstellar', label: 'Interstellar', url: 'backgrounds/interstellar.jpg' },
    { id: 'projecthailmary', label: 'Project Hail Mary', url: 'backgrounds/projecthailmary.jpg' },
    { id: 'meaning', label: 'Meaning', url: 'backgrounds/meaning.jpg' },
    { id: 'underthestarrysky', label: 'Under the Starry Sky', url: 'backgrounds/underthestarrysky.jpg' },
    { id: 'walkbythebeach', label: 'Walk by the Beach', url: 'backgrounds/walkbythebeach.gif' },
    { id: 'yourname', label: 'Your Name', url: 'backgrounds/yourname.gif' },
    { id: 'minecraftforest', label: 'Minecraft Forest', url: 'backgrounds/minecraftforest.gif' },
    { id: 'sakuracherrybiome', label: 'Sakura Biome', url: 'backgrounds/sakuracherrybiome.gif' },
    { id: 'Akaza\'s Fireworks', label: 'Akaza\'s Fireworks', url: 'backgrounds/kny.gif' },
    { id: 'cyberpunk', label: 'Cyberpunk', url: 'backgrounds/cyberpunk.gif' },
    { id: 'かえりみち', label: 'かえりみち', url: 'backgrounds/かえりみち.jpg' },
    { id: '心流', label: '心流', url: 'backgrounds/心流.jpg' },
    { id: 'larp', label: 'larp', url: 'backgrounds/larp.jpg' },
  ],
  // ════════════════════════════════════════════════
  // SETTINGS REGISTRY: Add new settings objects here!
  // ════════════════════════════════════════════════
  registry: [
    {
      id: 'particlesDisabled',
      section: 'Performance',
      label: 'Disable Particles',
      desc: 'Turn off background animations to save battery or improve performance.',
      type: 'toggle',
      // Logic to get current value
      get: () => window.siennaSettings.state.particlesDisabled,
      // Logic to update value
      set: (val) => {
        window.siennaSettings.state.particlesDisabled = val;
        localStorage.setItem('sienna_particles_disabled', val);
        window.siennaSettings.apply();
      }
    },
    {
      id: 'cloakMethod',
      section: 'Tab Cloaking',
      label: 'Cloak Method',
      desc: 'Choose how links and games are opened in a hidden tab.',
      type: 'choice',
      options: ['about:blank', 'blob:null'],
      get: () => window.siennaSettings.state.cloakMethod,
      set: (val) => {
        window.siennaSettings.state.cloakMethod = val;
        localStorage.setItem('sienna_cloak_method', val);
      }
    },
    {
      id: 'autoOpen',
      section: 'Tab Cloaking',
      label: 'Auto Open',
      desc: 'Automatically cloak the site on visit. Requires browser permission for popups.',
      type: 'select',
      options: ['Disabled', 'about:blank', 'blob:null'],
      get: () => window.siennaSettings.state.autoOpen,
      set: (val) => {
        const oldVal = window.siennaSettings.state.autoOpen;
        window.siennaSettings.state.autoOpen = val;
        localStorage.setItem('sienna_auto_open', val);
        
        if (val !== 'Disabled' && oldVal === 'Disabled') {
          window.siennaSettings.notifyAutoOpen();
        }
      }
    },
    {
      id: 'openInCloak',
      section: 'Tab Cloaking',
      label: 'Open in Cloak',
      desc: 'Open the current site in a new cloaked tab.',
      type: 'action',
      buttonLabel: 'Open Now',
      onClick: () => window.siennaSettings.handleCloak(window.location.href)
    },
    {
      id: 'gamesProvider',
      section: 'Games',
      label: 'Games Provider',
      desc: 'Choose the game provider incase one gets blocked, night. is the default',
      type: 'choice',
      options: ['night.', 'Lumin'],
      get: () => window.siennaSettings.state.gamesProvider,
      set: (val) => {
        window.siennaSettings.state.gamesProvider = val;
        localStorage.setItem('sienna_games_provider', val);
        window.siennaSettings.applyGamesProvider(val);
        window.siennaSettings.renderPanel(); // Update active state
      }
    },
    {
      id: 'themePicker',
      section: 'Themes',
      label: 'Selectable themes',
      desc: 'Choose a nice looking theme',
      type: 'theme-grid'
    }
  ],

  async init() {
    // 1. Load saved states
    this.state.particlesDisabled = localStorage.getItem('sienna_particles_disabled') === 'true';
    this.state.cloakMethod = localStorage.getItem('sienna_cloak_method') || 'about:blank';
    this.state.autoOpen = localStorage.getItem('sienna_auto_open') || 'Disabled';
    this.state.activeThemeId = localStorage.getItem('sienna_theme_id') || 'none';
    this.state.gamesProvider = localStorage.getItem('sienna_games_provider') || 'Night';
    this.state.themeGridExpanded = false;
    this.state.themeCreditsVisible = false;
    this.state.themeCreditsText = '';
    await this.loadThemes();
    this.applyTheme(this.state.activeThemeId);
    this.applyGamesProvider(this.state.gamesProvider);

    // 2. Handle Auto Open Trigger (Detects if already cloaked to prevent loops)
    const isFramed = window.self !== window.top;
    const isBlob = window.location.protocol === 'blob:';
    
    if (this.state.autoOpen !== 'Disabled' && !isFramed && !isBlob) {
      this.handleCloak(window.location.href, this.state.autoOpen);
      // Attempt to close original tab.
      window.close();
      // Fallback: Clear body to prevent "naked" site usage
      document.body.innerHTML = `<div style="color:white;text-align:center;padding-top:20vh;font-family:Syne;font-weight:700;">Auto-open active. You can close this tab.</div>`;
      return;
    }

    this.createToolbar();
    this.apply();
  },

  createToolbar() {
    if (document.getElementById('settingsBtn')) return;
    const toolbar = document.createElement('div');
    toolbar.className = 'top-toolbar';
    toolbar.innerHTML = `
      <button class="settings-btn" id="settingsBtn" title="Settings">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
      </button>`;
    document.body.appendChild(toolbar);
    document.getElementById('settingsBtn')?.addEventListener('click', () => window.gameVisor?.openSettings());
  },

  apply() {
    if (!window.particleBg) return;
    const shouldStop = this.state.particlesDisabled || document.body.classList.contains('game-visor-open');
    shouldStop ? window.particleBg.stop() : window.particleBg.start();
    this.applyTheme(this.state.activeThemeId);
  },

  escapeHtml(str) {
    return String(str).replace(/[&<>'"]/g, (char) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[char]));
  },

  applyTheme(themeId) {
    if (themeId === 'none') {
      this.state.activeThemeId = 'none';
      localStorage.setItem('sienna_theme_id', 'none');
      document.documentElement.style.setProperty('--bg-image', 'none');
      return;
    }
    const theme = this.themes.find((t) => t.id === themeId) || this.themes[0];
    this.state.activeThemeId = theme.id;
    localStorage.setItem('sienna_theme_id', theme.id);
    document.documentElement.style.setProperty('--bg-image', theme.url ? `url('${theme.url}') center/cover no-repeat` : 'none');
  },

  applyGamesProvider(provider) {
    const browseGrid = document.getElementById('browseGrid');
    const favoritesGrid = document.getElementById('favoritesGrid');
    const featured = document.getElementById('featured');
    const featuredDots = document.getElementById('featuredDots');
    const gridSectionLabel = document.querySelector('.grid-section-label');
    if (!browseGrid) return;

    // Remove existing lumin if present
    const existingGames = document.getElementById('games');
    if (existingGames) {
      existingGames.remove();
    }
    const existingLuminWrapper = document.getElementById('lumin-section');
    if (existingLuminWrapper) {
      existingLuminWrapper.remove();
    }
    const existingScripts = document.querySelectorAll('script[src*="lumin"]');
    existingScripts.forEach(script => script.remove());

    // Remove existing message
    const existingMessage = document.getElementById('lumin-message');
    if (existingMessage) {
      existingMessage.remove();
    }

    if (provider === 'Lumin') {
      // Hide normal grids and featured
      browseGrid.style.display = 'none';
      if (favoritesGrid) favoritesGrid.style.display = 'none';
      if (featured) featured.style.display = 'none';
      if (featuredDots) featuredDots.style.display = 'none';

      // Add message
      if (gridSectionLabel) {
        const messageDiv = document.createElement('div');
        messageDiv.id = 'lumin-message';
        messageDiv.style.cssText = 'text-align: center; padding: 20px; color: rgba(255, 255, 255, 0.8); font-size: 18px;';
        messageDiv.textContent = "You're using the Lumin SDK provider";
        gridSectionLabel.parentNode.insertBefore(messageDiv, gridSectionLabel);
      }

      // Add Lumin section wrapper
      const luminWrapper = document.createElement('div');
      luminWrapper.id = 'lumin-section';
      luminWrapper.style.cssText = 'width: 100%; margin-bottom: 40px;';
      gridSectionLabel.parentNode.insertBefore(luminWrapper, gridSectionLabel);

      // Add lumin container inside wrapper
      const gamesDiv = document.createElement('div');
      gamesDiv.id = 'games';
      gamesDiv.style.cssText = 'width: 100%; height: 600px;';
      luminWrapper.appendChild(gamesDiv);

      // Add scripts
      const script1 = document.createElement('script');
      script1.src = 'https://cdn.jsdelivr.net/gh/luminsdk/script@latest/lumin.min.js';
      script1.onload = () => {
        const script2 = document.createElement('script');
        script2.textContent = `
          Lumin.init({
            container: '#games',
            theme: 'dark'
          });
        `;
        document.head.appendChild(script2);
      };
      document.head.appendChild(script1);
    } else {
      // Show normal grids and featured
      browseGrid.style.display = '';
      if (favoritesGrid) favoritesGrid.style.display = '';
      if (featured) featured.style.display = '';
      if (featuredDots) featuredDots.style.display = '';
    }
  },

  normalizeThemeLabel(filename) {
    if (!filename) return 'No Theme';
    const name = filename.replace(/\.[^/.]+$/, '')
      .replace(/[-_]+/g, ' ')
      .trim();
    return name.charAt(0).toUpperCase() + name.slice(1);
  },

  async loadThemes() {
    // Load custom themes from localStorage
    const customThemes = JSON.parse(localStorage.getItem('sienna_custom_themes') || '[]');
    this.themes = [...this.themes, ...customThemes];

    const panel = document.getElementById('settingsPanel');
    if (panel) this.renderPanel();
  },

  handleUpload() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.style.display = 'none';
    document.body.appendChild(input);
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        const url = event.target.result;
        const customTheme = {
          id: `custom-${Date.now()}`,
          label: file.name.replace(/\.[^/.]+$/, ''),
          url: url
        };
        this.themes.push(customTheme);
        this.saveCustomThemes();
        this.applyTheme(customTheme.id);
        this.renderPanel();
      };
      reader.readAsDataURL(file);
      document.body.removeChild(input);
    };
    input.click();
  },

  saveCustomThemes() {
    const customThemes = this.themes.filter(t => t.id.startsWith('custom-'));
    localStorage.setItem('sienna_custom_themes', JSON.stringify(customThemes));
  },

  toggleThemeExpansion() {
    this.state.themeGridExpanded = !this.state.themeGridExpanded;
    this.renderPanel();
  },

  loadThemeCredits() {
    if (this.state.themeCreditsVisible) {
      this.state.themeCreditsVisible = false;
      this.renderPanel();
      return;
    }

    const creditsUrl = new URL('backgrounds/credits.txt', window.location.href).href;
    fetch(creditsUrl)
      .then((response) => {
        if (!response.ok) throw new Error('Failed to load credits');
        return response.text();
      })
      .then((text) => {
        this.state.themeCreditsText = text;
        this.state.themeCreditsVisible = true;
        this.renderPanel();
      })
      .catch(() => {
        this.state.themeCreditsText = 'Unable to load background credits.';
        this.state.themeCreditsVisible = true;
        this.renderPanel();
      });
  },

  notifyAutoOpen() {
    // Native browser interaction to explain and request permission
    alert("Auto Open Enabled: To use this feature, you must enable 'Popups and Redirects' for this site in your browser settings.");
    
    // Trigger a probe to let the browser show the native "Allow popups" bar
    const probe = window.open('about:blank', '_blank');
    
    if (probe) {
      probe.close();
      alert("Redirects are allowed! Please refresh the page to apply changes.");
    } else {
      alert("Redirects were blocked. Please allow them in your address bar and then refresh the page.");
    }
  },

  handleCloak(url, preferredMethod = null) {
    const method = preferredMethod || this.state.cloakMethod;
    const title = "New Tab"; // Common decoy title
    
    if (method === 'blob:null') {
      const html = `<!DOCTYPE html><html><head><title>${title}</title><style>body,html{margin:0;padding:0;height:100%;overflow:hidden}iframe{width:100%;height:100%;border:none}</style></head><body><iframe src="${url}"></iframe></body></html>`;
      const blob = new Blob([html], { type: 'text/html' });
      const blobUrl = URL.createObjectURL(blob);
      window.open(blobUrl, '_blank');
    } else {
      const win = window.open('about:blank', '_blank');
      if (!win) return;
      win.document.title = title;
      const frame = win.document.createElement('iframe');
      frame.style.cssText = "position:fixed;top:0;left:0;width:100%;height:100%;border:none;";
      frame.src = url;
      win.document.body.appendChild(frame);
    }
  },

  renderPanel() {
    const panel = document.getElementById('settingsPanel');
    if (!panel) return;

    // Group settings by section
    const sections = {};
    this.registry.forEach(item => {
      if (!sections[item.section]) sections[item.section] = [];
      sections[item.section].push(item);
    });

    panel.innerHTML = Object.entries(sections).map(([title, items]) => `
      <div class="settings-section">
        <div class="settings-section-title">${title}</div>
        ${items.map(item => {
          if (item.type === 'theme-grid') return this.renderThemeSection(item);
          return `
        <div class="settings-item">
          <div class="settings-info">
            <span class="settings-label">${item.label}</span>
            <span class="settings-desc">${item.desc}</span>
          </div>
          ${item.type === 'toggle' ? `
            <label class="toggle-switch">
              <input type="checkbox" data-setting-id="${item.id}" ${item.get() ? 'checked' : ''}>
              <span class="slider"></span>
            </label>
          ` : ''}
          ${item.type === 'choice' ? `
            <div class="choice-grp">
              ${item.options.map(opt => `
                <button class="choice-btn ${item.get() === opt ? 'active' : ''}" data-setting-id="${item.id}" data-value="${opt}">${opt}</button>
              `).join('')}
            </div>
          ` : ''}
          ${item.type === 'select' ? `
            <select class="settings-select" data-setting-id="${item.id}">
              ${item.options.map(opt => `
                <option value="${opt}" ${item.get() === opt ? 'selected' : ''}>${opt}</option>
              `).join('')}
            </select>
          ` : ''}
          ${item.type === 'action' ? `
            <button class="action-btn" data-action-id="${item.id}">${item.buttonLabel}</button>
          ` : ''}
        </div>
        `;
        }).join('')}
      </div>
    `).join('');

    // Bind events
    panel.querySelectorAll('input[data-setting-id]').forEach(input => {
      input.addEventListener('change', (e) => {
        const setting = this.registry.find(s => s.id === input.dataset.settingId);
        if (setting) setting.set(e.target.checked);
      });
    });

    panel.querySelectorAll('select[data-setting-id]').forEach(select => {
      select.addEventListener('change', (e) => {
        const setting = this.registry.find(s => s.id === select.dataset.settingId);
        if (setting) setting.set(e.target.value);
      });
    });

    panel.querySelectorAll('.choice-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const setting = this.registry.find(s => s.id === btn.dataset.settingId);
        if (setting) {
          setting.set(btn.dataset.value);
          this.renderPanel(); // Re-render to update active state
        }
      });
    });

    panel.querySelectorAll('.action-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const setting = this.registry.find(s => s.id === btn.dataset.actionId);
        if (setting?.onClick) setting.onClick();
      });
    });

    panel.querySelectorAll('[data-theme-id]').forEach(btn => {
      btn.addEventListener('click', () => {
        this.applyTheme(btn.dataset.themeId);
        this.state.themeCreditsVisible = false;
        this.renderPanel();
      });
    });

    panel.querySelectorAll('[data-theme-action]').forEach(btn => {
      btn.addEventListener('click', () => {
        const action = btn.dataset.themeAction;
        if (action === 'credits') {
          this.loadThemeCredits();
        } else if (action === 'more') {
          this.toggleThemeExpansion();
        } else if (action === 'clear') {
          this.applyTheme('none');
          this.state.themeCreditsVisible = false;
          this.renderPanel();
        } else if (action === 'upload') {
          this.handleUpload();
        }
      });
    });
  },

  renderThemeSection(item) {
    const selectedTheme = this.state.activeThemeId || 'none';
    const visibleThemes = this.state.themeGridExpanded ? this.themes : this.themes.slice(0, 8);
    const cards = visibleThemes.map((theme) => {
      const hoverTitle = theme.label;
      return `
      <button type="button" class="theme-card ${selectedTheme === theme.id ? 'selected' : ''}" data-theme-id="${theme.id}" title="${this.escapeHtml(hoverTitle)}">
        <div class="theme-preview" style="background-image: ${theme.url ? `url('${theme.url}')` : 'none'};">
          ${theme.url ? `<img src="${theme.url}" alt="${this.escapeHtml(theme.label)} preview" class="theme-preview-img" />` : ''}
          <span class="theme-label">${this.escapeHtml(theme.label)}</span>
        </div>
      </button>
    `;
    }).join('');

    return `
      <div class="settings-item theme-settings-item">
        <div class="settings-info">
          <span class="settings-label">${item.label}</span>
          <span class="settings-desc">${item.desc}</span>
        </div>
        <div class="theme-control-group">
          <button type="button" class="action-btn theme-credits-btn" data-theme-action="credits">Credits</button>
          <button type="button" class="action-btn theme-clear-btn" data-theme-action="clear">Remove theme</button>
        </div>
      </div>
      <div class="settings-theme-grid ${this.state.themeGridExpanded ? 'expanded' : ''}">
        <button type="button" class="theme-card upload-card" data-theme-action="upload" title="Upload custom image">
          <div class="theme-preview">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 32px; height: 32px; color: rgba(255,255,255,0.6);">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14,2 14,8 20,8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
              <polyline points="10,9 9,9 8,9"/>
            </svg>
            <span class="theme-label">Upload</span>
          </div>
        </button>
        ${cards}
      </div>
      ${this.themes.length > 8 ? `<button type="button" class="action-btn theme-more-btn" data-theme-action="more">${this.state.themeGridExpanded ? 'Show less' : 'See more'}</button>` : ''}
      ${this.state.themeCreditsVisible ? `<div class="theme-credits-panel"><pre>${this.escapeHtml(this.state.themeCreditsText)}</pre></div>` : ''}
    `;
  }
};

// Boot settings
window.siennaSettings.init();