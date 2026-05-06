(function () {
  const storage = {
    get(key, fallback) {
      try {
        const value = localStorage.getItem(key);
        return value === null ? fallback : value;
      } catch (error) {
        return fallback;
      }
    },
    set(key, value) {
      try {
        localStorage.setItem(key, value);
      } catch (error) {
        // Storage can be unavailable in private or embedded contexts.
      }
    },
    remove(key) {
      try {
        localStorage.removeItem(key);
      } catch (error) {
        // Storage can be unavailable in private or embedded contexts.
      }
    },
  };

  window.siennaSettings = {
    state: {
      reduceMotion: false,
      gridColumns: "5",
      legacyLibrary: false,
      rememberTabs: true,
      cloakMethod: "about:blank",
      autoOpen: "Disabled",
      gamesProvider: "night.",
      activeThemeId: "none",
    },

    updates: {
      title: "v0.8",
      description: "Design overhaul. New features like custom games, more accessibility options. Legacy card view. Numerous bug fixes and performance optimizations targeted for lower end devices. Removed some games but added a few.",
    },

    themes: [
      { id: 'Astray', label: 'Astray', url: 'backgrounds/astray.jpg' },
      { id: 'Invain', label: 'Invain', url: 'backgrounds/invain.jpg' },
      { id: 'Isolated', label: 'Isolated', url: 'backgrounds/isolated.jpg' },
      { id: 'backrooms', label: 'Backrooms', url: 'backgrounds/backrooms.jpg' },
      { id: 'interstellar', label: 'Interstellar', url: 'backgrounds/interstellar.jpg' },
      { id: 'projecthailmary', label: 'Project Hail Mary', url: 'backgrounds/projecthailmary.jpg' },
      { id: 'terraria', label: 'Terraria', url: 'backgrounds/terraria.png' },
      { id: 'hollowknight', label: 'Hollow Knight', url: 'backgrounds/hollowknight.jpg' },
      { id: 'hollowknightsilksong', label: 'Hollow Knight: Silksong', url: 'backgrounds/hollowknightsilksong.jpg' },
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
      { id: 'waifumommy', label: 'Waifu Mommy', url: 'backgrounds/waifumommy.jpg' },
    ],

    registry: [
      {
        id: "gridColumns",
        section: "Display",
        label: "Cards per row",
        desc: "Default is 5. Choose a calmer or denser game grid.",
        type: "choice",
        options: ["3", "4", "5", "6", "7"],
        get: () => window.siennaSettings.state.gridColumns,
        set: (value) => {
          const next = ["3", "4", "5", "6", "7"].includes(value) ? value : "5";
          window.siennaSettings.state.gridColumns = next;
          storage.set("sienna_grid_columns", next);
          window.siennaSettings.apply();
          window.siennaSettings.renderPanel();
        },
      },
      {
        id: "legacyLibrary",
        section: "Display",
        label: "Legacy cards view",
        desc: "Show the site as a full-screen game card library.",
        type: "toggle",
        get: () => window.siennaSettings.state.legacyLibrary,
        set: (value) => {
          window.siennaSettings.state.legacyLibrary = Boolean(value);
          storage.set("sienna_legacy_library", String(Boolean(value)));
          window.siennaSettings.apply();
          window.siennaSettings.renderPanel();
        },
      },
      {
        id: "reduceMotion",
        section: "Display",
        label: "Reduce motion",
        desc: "Limit transitions across the site.",
        type: "toggle",
        get: () => window.siennaSettings.state.reduceMotion,
        set: (value) => {
          window.siennaSettings.state.reduceMotion = Boolean(value);
          storage.set("sienna_reduce_motion", String(Boolean(value)));
          window.siennaSettings.apply();
        },
      },
      {
        id: "gamesProvider",
        section: "Games",
        label: "Games provider",
        desc: "Use the built-in sienna list or switch to the Lumin provider.",
        type: "choice",
        options: ["night.", "Lumin"],
        get: () => window.siennaSettings.state.gamesProvider,
        set: (value) => {
          window.siennaSettings.state.gamesProvider = value === "Lumin" ? "Lumin" : "night.";
          storage.set("sienna_games_provider", window.siennaSettings.state.gamesProvider);
          window.siennaSettings.applyGamesProvider(window.siennaSettings.state.gamesProvider);
          window.siennaSettings.renderPanel();
        },
      },
      {
        id: "cloakMethod",
        section: "Tab cloaking",
        label: "Cloak method",
        desc: "Choose how games open from the external-open button.",
        type: "choice",
        options: ["about:blank", "blob:null"],
        get: () => window.siennaSettings.state.cloakMethod,
        set: (value) => {
          window.siennaSettings.state.cloakMethod = value === "blob:null" ? "blob:null" : "about:blank";
          storage.set("sienna_cloak_method", window.siennaSettings.state.cloakMethod);
          window.siennaSettings.renderPanel();
        },
      },
      {
        id: "autoOpen",
        section: "Tab cloaking",
        label: "Auto open",
        desc: "Automatically open the site in a cloaked tab on load.",
        type: "select",
        options: ["Disabled", "about:blank", "blob:null"],
        get: () => window.siennaSettings.state.autoOpen,
        set: (value) => {
          window.siennaSettings.state.autoOpen = ["about:blank", "blob:null"].includes(value) ? value : "Disabled";
          storage.set("sienna_auto_open", window.siennaSettings.state.autoOpen);
        },
      },
      {
        id: "openInCloak",
        section: "Tab cloaking",
        label: "Open site cloaked",
        desc: "Open the current page with the selected cloak method.",
        type: "action",
        buttonLabel: "Open",
        onClick: () => window.siennaSettings.handleCloak(window.location.href),
      },
      {
        id: "rememberTabs",
        section: "Game window",
        label: "Remember tabs",
        desc: "Keep minimized game tabs available after refresh.",
        type: "toggle",
        get: () => window.siennaSettings.state.rememberTabs,
        set: (value) => {
          window.siennaSettings.state.rememberTabs = Boolean(value);
          storage.set("sienna_remember_tabs", String(Boolean(value)));
          if (!value) {
            storage.remove("gameVisorTabs");
            storage.remove("gameVisorActiveTabId");
          }
          window.siennaSettings.apply();
        },
      },
      {
        id: "clearTabs",
        section: "Game window",
        label: "Clear saved tabs",
        desc: "Remove remembered game window tabs.",
        type: "action",
        buttonLabel: "Clear",
        onClick: () => {
          storage.remove("gameVisorTabs");
          storage.remove("gameVisorActiveTabId");
          if (window.gameVisor) {
            window.gameVisor.tabs = [];
            window.gameVisor.activeTabId = null;
            window.gameVisor.renderDock?.();
            // If settings is open, close the game visor entirely
            if (window.gameVisor.container?.classList.contains('open')) {
              window.gameVisor.close();
            }
          }
        },
      },
      {
        id: "themePicker",
        section: "Themes",
        label: "Background theme",
        desc: "Keep the black grid or use one of the original background themes.",
        type: "theme-grid",
      },
    ],

    loadCustomThemes() {
      try {
        const saved = localStorage.getItem("sienna_custom_themes");
        if (saved) {
          const customThemes = JSON.parse(saved);
          if (Array.isArray(customThemes)) {
            // Remove any previously loaded custom themes from the array
            this.themes = this.themes.filter((t) => !t.id.startsWith("custom-"));
            // Add saved custom themes
            customThemes.forEach((t) => this.themes.push(t));
          }
        }
      } catch (e) {
        // Ignore parse errors
      }
    },

    saveCustomThemes() {
      try {
        const customThemes = this.themes.filter((t) => t.id.startsWith("custom-"));
        localStorage.setItem("sienna_custom_themes", JSON.stringify(customThemes));
      } catch (e) {
        // Storage may be full or unavailable
      }
    },

    init() {
      this.state.reduceMotion = storage.get("sienna_reduce_motion", "false") === "true";
      this.state.gridColumns = ["3", "4", "5", "6", "7"].includes(storage.get("sienna_grid_columns", "5")) ? storage.get("sienna_grid_columns", "5") : "5";
      this.state.legacyLibrary = storage.get("sienna_legacy_library", "false") === "true";
      this.state.rememberTabs = storage.get("sienna_remember_tabs", "true") !== "false";
      this.state.cloakMethod = storage.get("sienna_cloak_method", "about:blank") === "blob:null" ? "blob:null" : "about:blank";
      this.state.autoOpen = ["about:blank", "blob:null"].includes(storage.get("sienna_auto_open", "Disabled")) ? storage.get("sienna_auto_open", "Disabled") : "Disabled";
      this.state.gamesProvider = storage.get("sienna_games_provider", "night.") === "Lumin" ? "Lumin" : "night.";
      this.state.activeThemeId = storage.get("sienna_theme_id", "none");

      this.loadCustomThemes();
      this.createToolbar();
      this.apply();
      this.applyTheme(this.state.activeThemeId);
      this.applyGamesProvider(this.state.gamesProvider);
      this.maybeAutoOpen();
    },

    apply() {
      if (!this.state.legacyLibrary) {
        document.documentElement.style.setProperty("--grid-cols", this.state.gridColumns);
      }
      document.body.classList.toggle("reduce-motion", this.state.reduceMotion);
      document.body.classList.toggle("legacy-library", this.state.legacyLibrary);
    },

    applyTheme(themeId) {
      const theme = this.themes.find((item) => item.id === themeId);
      if (!theme) {
        // Reset to black background (no theme)
        this.state.activeThemeId = "none";
        storage.set("sienna_theme_id", "none");
        document.documentElement.style.setProperty("--theme-image", "none");
        document.body.classList.remove("has-theme");
        return;
      }
      this.state.activeThemeId = theme.id;
      storage.set("sienna_theme_id", theme.id);
      document.documentElement.style.setProperty("--theme-image", theme.url ? `url("${theme.url}")` : "none");
      document.body.classList.toggle("has-theme", Boolean(theme.url));
    },

    applyGamesProvider(provider) {
      const browseGrid = document.getElementById("browseGrid");
      const favoritesSection = document.getElementById("favoritesSection");
      const featured = document.getElementById("featured");
      const featuredDots = document.getElementById("featuredDots");
      const labels = document.querySelectorAll(".grid-section-label");
      const host = document.getElementById("page-browse") || document.body;
      let lumin = document.getElementById("lumin-section");

      if (provider !== "Lumin") {
        if (browseGrid) browseGrid.style.display = "";
        if (favoritesSection) favoritesSection.style.display = "";
        if (featured) featured.style.display = "";
        if (featuredDots) featuredDots.style.display = "";
        labels.forEach((label) => { label.style.display = ""; });
        lumin?.remove();
        return;
      }

      if (browseGrid) browseGrid.style.display = "none";
      if (favoritesSection) favoritesSection.style.display = "none";
      if (featured) featured.style.display = "none";
      if (featuredDots) featuredDots.style.display = "none";
      labels.forEach((label) => { label.style.display = "none"; });

      if (!lumin) {
        lumin = document.createElement("section");
        lumin.id = "lumin-section";
        lumin.className = "lumin-section";
        lumin.innerHTML = '<div id="games" class="lumin-games"></div>';
        host.appendChild(lumin);
      }

      const initLumin = () => {
        if (window.Lumin?.init) {
          window.Lumin.init({ container: "#games", theme: "dark" });
        }
      };

      if (window.Lumin) {
        initLumin();
        return;
      }

      if (!document.querySelector('script[data-sienna-provider="lumin"]')) {
        const script = document.createElement("script");
        script.src = "https://cdn.jsdelivr.net/gh/luminsdk/script@latest/lumin.min.js";
        script.async = true;
        script.dataset.siennaProvider = "lumin";
        script.addEventListener("load", initLumin);
        document.head.appendChild(script);
      }
    },

    maybeAutoOpen() {
      if (this.state.autoOpen === "Disabled") return;
      if (window.self !== window.top || window.location.protocol === "blob:") return;
      if (sessionStorage.getItem("sienna_auto_open_attempted") === "true") return;
      sessionStorage.setItem("sienna_auto_open_attempted", "true");
      this.handleCloak(window.location.href, this.state.autoOpen);
    },

    handleCloak(url, preferredMethod = null) {
      const method = preferredMethod || this.state.cloakMethod;
      const safeUrl = String(url || window.location.href);

      if (method === "blob:null") {
        const html = [
          "<!doctype html>",
          "<html><head><meta charset=\"utf-8\"><title>New Tab</title>",
          "<style>html,body{margin:0;height:100%;overflow:hidden;background:#000}iframe{width:100%;height:100%;border:0}</style>",
          "</head><body></body></html>",
        ].join("");
        const blobUrl = URL.createObjectURL(new Blob([html], { type: "text/html" }));
        const win = window.open(blobUrl, "_blank");
        if (win) {
          const attach = () => {
            const frame = win.document.createElement("iframe");
            frame.src = safeUrl;
            frame.allow = "autoplay; picture-in-picture; fullscreen; clipboard-write";
            win.document.body.appendChild(frame);
          };
          setTimeout(attach, 80);
          setTimeout(() => URL.revokeObjectURL(blobUrl), 60000);
        } else {
          URL.revokeObjectURL(blobUrl);
        }
        return;
      }

      const win = window.open("about:blank", "_blank");
      if (!win) return;
      win.document.title = "New Tab";
      win.document.body.style.margin = "0";
      win.document.body.style.height = "100vh";
      win.document.body.style.overflow = "hidden";
      win.document.body.style.background = "#000";
      const frame = win.document.createElement("iframe");
      frame.src = safeUrl;
      frame.allow = "autoplay; picture-in-picture; fullscreen; clipboard-write";
      frame.style.cssText = "position:fixed;inset:0;width:100%;height:100%;border:0";
      win.document.body.appendChild(frame);
    },

    createToolbar() {
      if (document.getElementById("settingsBtn")) return;

      const toolbar = document.createElement("div");
      toolbar.className = "top-toolbar";
      toolbar.innerHTML = `
        <button class="settings-btn" id="settingsBtn" type="button" aria-label="Settings">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="3"></circle>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 8.92 4a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09A1.65 1.65 0 0 0 15 4.6a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9c.14.31.46.51.8.51H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1.49z"></path>
          </svg>
        </button>
        <button class="updates-btn" id="updatesBtn" type="button" aria-label="Updates" aria-haspopup="dialog" aria-expanded="false">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <!-- Colored squares (rotated) -->
              <rect x="3" y="3" width="3" height="3" rx="0.5" fill="#e74c3c" transform="rotate(-15 4.5 4.5)"/>
              <rect x="10" y="2" width="2.5" height="2.5" rx="0.4" fill="#3498db" transform="rotate(20 11.25 3.25)"/>
              <rect x="18" y="5" width="2.5" height="2.5" rx="0.4" fill="#2ecc71" transform="rotate(-10 19.25 6.25)"/>
              <rect x="15" y="13" width="2.5" height="2.5" rx="0.4" fill="#e67e22" transform="rotate(30 16.25 14.25)"/>
              <rect x="5" y="14" width="2" height="2" rx="0.3" fill="#9b59b6" transform="rotate(-25 6 15)"/>
              <rect x="12" y="17" width="2" height="2" rx="0.3" fill="#e74c3c" transform="rotate(15 13 18)"/>
              <!-- Dots -->
              <circle cx="19" cy="3" r="1.2" fill="#f1c40f"/>
              <circle cx="7" cy="10" r="1" fill="#3498db"/>
              <circle cx="20" cy="14" r="1" fill="#e74c3c"/>
              <circle cx="3" cy="19" r="1.1" fill="#2ecc71"/>
              <!-- Streamers / curls -->
              <path d="M6 6 Q8 4 7 7" stroke="#f1c40f" stroke-width="1.5" stroke-linecap="round"/>
              <path d="M14 9 Q17 7 16 11" stroke="#9b59b6" stroke-width="1.5" stroke-linecap="round"/>
              <path d="M9 18 Q11 16 10 20" stroke="#e67e22" stroke-width="1.5" stroke-linecap="round"/>
              <path d="M18 18 Q20 17 19 20" stroke="#3498db" stroke-width="1.5" stroke-linecap="round"/>
            </svg>
        </button>
      `;

      const popup = document.createElement("div");
      popup.id = "updatesPopup";
      popup.className = "updates-popup";
      popup.setAttribute("role", "dialog");
      popup.setAttribute("aria-label", "Updates");
      popup.innerHTML = this.renderUpdatesPopupMarkup();

      document.body.append(toolbar, popup);

      document.getElementById("settingsBtn")?.addEventListener("click", () => {
        this.closeUpdatesPopup();
        window.gameVisor?.openSettings?.();
      });

      document.getElementById("updatesBtn")?.addEventListener("click", (event) => {
        event.stopPropagation();
        this.toggleUpdatesPopup();
      });

      popup.addEventListener("click", (event) => event.stopPropagation());
      document.addEventListener("click", () => this.closeUpdatesPopup());
      document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") this.closeUpdatesPopup();
      });
    },

    renderUpdatesPopupMarkup() {
      return `
        <div class="updates-popup-header">
          <div>
            <div class="updates-popup-kicker">Updates</div>
            <div class="updates-popup-title">${this.escapeHtml(this.updates.title)}</div>
          </div>
          <button class="updates-popup-close" id="updatesPopupClose" type="button" aria-label="Close updates">x</button>
        </div>
        <div class="updates-popup-body">
          <p class="updates-popup-desc">${this.escapeHtml(this.updates.description)}</p>
        </div>
      `;
    },

    toggleUpdatesPopup(forceState = null) {
      const popup = document.getElementById("updatesPopup");
      const button = document.getElementById("updatesBtn");
      if (!popup || !button) return;

      popup.innerHTML = this.renderUpdatesPopupMarkup();
      popup.querySelector("#updatesPopupClose")?.addEventListener("click", () => this.closeUpdatesPopup());

      const shouldOpen = forceState ?? !popup.classList.contains("visible");
      popup.classList.toggle("visible", shouldOpen);
      button.setAttribute("aria-expanded", shouldOpen ? "true" : "false");
    },

    closeUpdatesPopup() {
      document.getElementById("updatesPopup")?.classList.remove("visible");
      document.getElementById("updatesBtn")?.setAttribute("aria-expanded", "false");
    },

    renderPanel() {
      const panel = document.getElementById("settingsPanel");
      if (!panel) return;

      const grouped = this.registry.reduce((sections, item) => {
        if (!sections[item.section]) sections[item.section] = [];
        sections[item.section].push(item);
        return sections;
      }, {});

      panel.innerHTML = `
        <div class="settings-shell">
          <header class="settings-header">
            <div>
              <h2 class="settings-title">Settings</h2>
              <p class="settings-subtitle">Layout, themes, providers, and game window behavior.</p>
            </div>
            <div class="settings-status">sienna.</div>
          </header>
          ${Object.entries(grouped).map(([section, items]) => this.renderSection(section, items)).join("")}
        </div>
      `;

      panel.querySelectorAll("input[data-setting-id]").forEach((input) => {
        input.addEventListener("change", () => {
          const setting = this.registry.find((item) => item.id === input.dataset.settingId);
          setting?.set(Boolean(input.checked));
        });
      });

      panel.querySelectorAll("select[data-setting-id]").forEach((select) => {
        select.addEventListener("change", () => {
          const setting = this.registry.find((item) => item.id === select.dataset.settingId);
          setting?.set(select.value);
        });
      });

      panel.querySelectorAll(".choice-btn").forEach((button) => {
        button.addEventListener("click", () => {
          const setting = this.registry.find((item) => item.id === button.dataset.settingId);
          setting?.set(button.dataset.value);
        });
      });

      panel.querySelectorAll(".action-btn[data-action-id]").forEach((button) => {
        button.addEventListener("click", () => {
          const setting = this.registry.find((item) => item.id === button.dataset.actionId);
          setting?.onClick?.();
        });
      });

      panel.querySelectorAll("[data-theme-id]").forEach((button) => {
        button.addEventListener("click", () => {
          this.applyTheme(button.dataset.themeId);
          this.renderPanel();
        });
      });

      panel.querySelectorAll("[data-action='remove-theme']").forEach((button) => {
        button.addEventListener("click", () => {
          this.applyTheme("none");
          this.renderPanel();
        });
      });

      panel.querySelectorAll("[data-action='upload-theme']").forEach((button) => {
        button.addEventListener("click", () => {
          this.openUploadTheme();
        });
      });

      panel.querySelectorAll("[data-action='delete-custom-theme']").forEach((button) => {
        button.addEventListener("click", (e) => {
          e.stopPropagation();
          const themeId = button.dataset.themeId;
          // Remove from themes array
          this.themes = this.themes.filter((t) => t.id !== themeId);
          // If the deleted theme was active, reset to black
          if (this.state.activeThemeId === themeId) {
            this.applyTheme("none");
          }
          // Save and re-render
          this.saveCustomThemes();
          this.renderPanel();
        });
      });
    },

    renderSection(section, items) {
      return `
        <section class="settings-section">
          <div class="settings-section-title">${this.escapeHtml(section)}</div>
          <div class="settings-section-body">
            ${items.map((item) => this.renderItem(item)).join("")}
          </div>
        </section>
      `;
    },

    renderItem(item) {
      if (item.type === "theme-grid") return this.renderThemeGrid(item);

      const isDisabled = item.id === "gridColumns" && this.state.legacyLibrary;

      return `
        <div class="settings-item settings-item--${this.escapeHtml(item.type)} ${isDisabled ? "settings-item--disabled" : ""}">
          <div class="settings-info">
            <span class="settings-label">${this.escapeHtml(item.label)}</span>
            <span class="settings-desc">${isDisabled ? "Disabled in legacy cards view." : this.escapeHtml(item.desc)}</span>
          </div>
          <div class="settings-control">
            ${this.renderControl(item, isDisabled)}
          </div>
        </div>
      `;
    },

    renderControl(item, isDisabled = false) {
      if (item.type === "toggle") {
        return `
          <label class="toggle-switch">
            <input type="checkbox" data-setting-id="${this.escapeHtml(item.id)}" ${item.get() ? "checked" : ""} ${isDisabled ? "disabled" : ""}>
            <span class="slider"></span>
          </label>
        `;
      }

      if (item.type === "choice") {
        return `
          <div class="choice-grp">
            ${item.options.map((option) => `
              <button class="choice-btn ${item.get() === option ? "active" : ""}" type="button" data-setting-id="${this.escapeHtml(item.id)}" data-value="${this.escapeHtml(option)}" ${isDisabled ? "disabled" : ""}>${this.escapeHtml(option)}</button>
            `).join("")}
          </div>
        `;
      }

      if (item.type === "select") {
        return `
          <select class="settings-select" data-setting-id="${this.escapeHtml(item.id)}" ${isDisabled ? "disabled" : ""}>
            ${item.options.map((option) => `<option value="${this.escapeHtml(option)}" ${item.get() === option ? "selected" : ""}>${this.escapeHtml(option)}</option>`).join("")}
          </select>
        `;
      }

      if (item.type === "action") {
        return `<button class="action-btn" type="button" data-action-id="${this.escapeHtml(item.id)}" ${isDisabled ? "disabled" : ""}>${this.escapeHtml(item.buttonLabel)}</button>`;
      }

      return "";
    },

    renderThemeGrid(item) {
      const hasTheme = this.state.activeThemeId !== "none";
      return `
        <div class="settings-item theme-settings-item">
          <div class="settings-info">
            <span class="settings-label">${this.escapeHtml(item.label)}</span>
            <span class="settings-desc">${this.escapeHtml(item.desc)}</span>
          </div>
          <div class="settings-control" style="gap: 8px;">
            ${hasTheme ? `<button class="remove-theme-btn" type="button" data-action="remove-theme" title="Remove theme">Remove Theme</button>` : ""}
            <button class="action-btn" type="button" data-action="upload-theme" title="Upload custom theme">Upload Image</button>
          </div>
        </div>
        <div class="settings-theme-grid">
          ${this.themes.map((theme) => `
            <button class="theme-card ${this.state.activeThemeId === theme.id ? "selected" : ""}" type="button" data-theme-id="${this.escapeHtml(theme.id)}" title="${this.escapeHtml(theme.label)}">
              <span class="theme-preview" style="background-image: ${theme.url ? `url('${theme.url}')` : "none"}"></span>
              <span class="theme-label">${this.escapeHtml(theme.label)}</span>
              ${theme.id.startsWith("custom-") ? `<span class="theme-delete" data-action="delete-custom-theme" data-theme-id="${this.escapeHtml(theme.id)}" title="Delete custom theme">&times;</span>` : ""}
            </button>
          `).join("")}
        </div>
      `;
    },

    shouldRememberTabs() {
      return this.state.rememberTabs;
    },

    escapeHtml(value) {
      return String(value).replace(/[&<>"']/g, (char) => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "\"": "&quot;",
        "'": "&#39;",
      }[char]));
    },

    openUploadTheme() {
      // Create a hidden file input
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.style.display = 'none';

      input.addEventListener('change', () => {
        const file = input.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
          const dataUrl = e.target?.result;
          if (!dataUrl) return;

          // Generate a unique ID and label from the file name
          const baseName = file.name.replace(/\.[^.]+$/, '') || 'Custom Theme';
          const id = 'custom-' + Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 7);

          // Add to themes array
          this.themes.push({ id, label: baseName, url: dataUrl });

          // Save custom themes to localStorage
          this.saveCustomThemes();

          // Apply it immediately
          this.applyTheme(id);
          this.renderPanel();
        };
        reader.readAsDataURL(file);
      });

      document.body.appendChild(input);
      input.click();
      document.body.removeChild(input);
    },
  };

  window.siennaSettings.init();
}());
