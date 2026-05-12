(function () {
  const SIENNA_VERSION = "0.9";
  const SIENNA_BUILD = "19";
  const CLASSIC_LOGO = String.raw`           /$$
          |__/
  /$$$$$$$ /$$  /$$$$$$  /$$$$$$$  /$$$$$$$   /$$$$$$
 /$$_____/| $$ /$$__  $$| $$__  $$| $$__  $$ |____  $$
|  $$$$$$ | $$| $$$$$$$$| $$  \ $$| $$  \ $$  /$$$$$$$
 \____  $$| $$| $$_____/| $$  | $$| $$  | $$ /$$__  $$
 /$$$$$$$/| $$|  $$$$$$$| $$  | $$| $$  | $$|  $$$$$$$ /$$
|_______/ |__/ \_______/|__/  |__/|__/  |__/ \_______/|__/`;
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
    tabCloakPresets:[
      { previewTitle:"Default", realTitle:"sienna.", favicon:"favicon.ico" },
      { previewTitle:"Google", realTitle:"Google", favicon:"icons/favicons/google.ico" },
      { previewTitle:"Schoology", realTitle:"Home | Schoology", favicon:"icons/favicons/schoology.ico" },
      { previewTitle:"Canvas", realTitle:"Dashboard", favicon:"icons/favicons/canvas.ico" },
      { previewTitle:"Khan Academy", realTitle:"Dashboard | Khan Academy", favicon:"icons/favicons/khan.ico" },
      { previewTitle:"CodeHS", realTitle:"Sections | CodeHS", favicon:"icons/favicons/codehs.ico" },
      { previewTitle:"CodeHS Sandbox", realTitle:"Sandbox | CodeHS", favicon:"icons/favicons/codehs.ico" },
      { previewTitle:"Classlink", realTitle:"My Apps", favicon:"icons/favicons/classlink.ico" },
      { previewTitle:"Gmail", realTitle:"Inbox", favicon:"icons/favicons/gmail.ico" },
      { previewTitle:"Google Classroom", realTitle:"Home", favicon:"icons/favicons/googleclassroom.ico" },
      { previewTitle:"Google Drive", realTitle:"My Drive", favicon:"icons/favicons/googledrive.ico" },
      { previewTitle:"Google Docs", realTitle:"Google Docs", favicon:"icons/favicons/googledocs.ico" },
      { previewTitle:"Google Forms", realTitle:"Google Forms", favicon:"icons/favicons/googleforms.ico" },
      { previewTitle:"Google Forms Lock Down Mode", realTitle:"Start your quiz", favicon:"icons/favicons/googleforms.ico" },
      { previewTitle:"Google Slides", realTitle:"Google Slides", favicon:"icons/favicons/googleslides.ico" },
      { previewTitle:"Google Sites", realTitle:"Google Sites", favicon:"icons/favicons/googlesites.ico" },
      { previewTitle:"Home Access Center", realTitle:"Home View Summary", favicon:"icons/favicons/hac.ico" },
      { previewTitle:"IXL", realTitle:"IXL | Math, Language Arts, Social Studies, and Spanish", favicon:"icons/favicons/ixl.ico" },
      { previewTitle:"i-Ready Math", realTitle:"Math To Do, i-Ready", favicon:"icons/favicons/iready.ico" },
      { previewTitle:"i-Ready Reading", realTitle:"Reading To Do, i-Ready", favicon:"icons/favicons/iready.ico" },
      { previewTitle:"Eduphoria", realTitle:"Eduphoria! Login", favicon:"icons/favicons/eduphoria.ico" },
      { previewTitle:"McGraw Hill", realTitle:"McGraw Hill Professional | Textbooks | Interactive Learning Solutions", favicon:"icons/favicons/mcgrawhill.ico" },
    ],

    state: {
      reduceMotion: false,
      gridColumns: "5",
      legacyLibrary: false,
      classicLogo: false,
      rememberTabs: true,
      cloakMethod: "about:blank",
      autoOpen: "Disabled",
      gamesProvider: "night.",
      activeThemeId: "none",
      bubblesEnabled: true,
      tabCloakId: "Default",
      tabCloakCustomTitle: "",
      tabCloakCustomFavicon: "",
    },

    // Add or edit update cards here. Change storageKey when you want everyone to
    // see the panel again after a new release.
    updates: {
      storageKey: "sienna_updates_seen_v0_9",
      showOnFirstVisit: true,
      title: "What's new",
      version: "v0.9",
      sections: [
        {
          title: "New Updates Panel",
          description: "You're looking at it right now",
        },
        {
          title: "Website Redesign",
          description: "Looks better ig. Organized settings, added animations. Added classic sienna ASCII logo",
        },
        {
          title: "New games",
          description: "Fixed Geometry Dash. Added: -3 and -b",
        },
        {
          title: "Numerous Bug Fixes",
          description: "Animation fixes, performance improvements, and more.",
        },
        {
          title: "New gn-math design",
          description: "Fixed various issues with the previous gn-math provider (Tip: If a game isn't available or you dislike night., you can use a different provider like gn-math or Lumin)",
        },
        {
          title: "Bubbles on homescreen",
          description: "Cool poppable bubbles (toggleable in settings)",
        },
        {
          title: "Tab Cloaking",
          description: "Cloak your tab with a variety of presets to keep sienna hidden",
        },
        {
          title: "Download and Upload your save data (improved)",
          description: "Improved and added the managing save data options. (Pro tip: Use example.com?savemydata to save your data if you're unable to go on the site & ?clear to reset your data.)",
        },
        {
          title: "File stuff",
          description: "Compressed images (Could cause faster loading times)",
        },
      ],
    },

    themes:[
      { id: 'Astray', label: 'Astray', url: 'backgrounds/astray.jpg' },
      { id: 'Invain', label: 'Invain', url: 'backgrounds/invain.jpg' },
      { id: 'Isolated', label: 'Isolated', url: 'backgrounds/isolated.jpg' },
      { id: 'backrooms', label: 'Backrooms', url: 'backgrounds/backrooms.jpg' },
      { id: 'interstellar', label: 'Interstellar', url: 'backgrounds/interstellar.jpg' },
      { id: 'projecthailmary', label: 'Project Hail Mary', url: 'backgrounds/projecthailmary.jpg' },
      { id: 'terraria', label: 'Terraria', url: 'backgrounds/terraria.png' },
      { id: 'classicroblox', label: 'Classic Roblox', url: 'backgrounds/classicroblox.jpeg' },
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

    registry:[
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
        id: "classicLogo",
        section: "Display",
        label: "Classic logo",
        desc: "Use the original ASCII sienna logo on the home screen.",
        type: "toggle",
        get: () => window.siennaSettings.state.classicLogo,
        set: (value) => {
          window.siennaSettings.state.classicLogo = Boolean(value);
          storage.set("sienna_classic_logo", String(Boolean(value)));
          window.siennaSettings.apply();
        },
      },
      {
        id: "reduceMotion",
        section: "Performance",
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
        id: "bubblesEnabled",
        section: "Performance",
        label: "Background bubbles",
        desc: "Show floating bubbles on the home screen.",
        type: "toggle",
        get: () => window.siennaSettings.state.bubblesEnabled,
        set: (value) => {
          window.siennaSettings.state.bubblesEnabled = Boolean(value);
          storage.set("sienna_bubbles_enabled", String(Boolean(value)));
          window.siennaSettings.apply();
        },
      },
      {
        id: "gamesProvider",
        section: "Games",
        label: "Games provider",
        desc: "Choose your games source: sienna's built-in list, Lumin, or gn-math. (Relays coming soon)",

        type: "choice",
        options: ["night.", "Lumin", "gn-math"],
        get: () => window.siennaSettings.state.gamesProvider,
        set: (value) => {
          const valid = ["night.", "Lumin", "gn-math"];
          window.siennaSettings.state.gamesProvider = valid.includes(value) ? value : "night.";
          storage.set("sienna_games_provider", window.siennaSettings.state.gamesProvider);
          window.siennaSettings.applyGamesProvider(window.siennaSettings.state.gamesProvider);
          window.siennaSettings.renderPanel();
        },

      },
      {
        id: "cloakMethod",
        section: "Cloaking",
        label: "Cloak method",
        desc: "Choose how games open from the external-open button.",
        type: "choice",
        options:["about:blank", "blob:null"],
        get: () => window.siennaSettings.state.cloakMethod,
        set: (value) => {
          window.siennaSettings.state.cloakMethod = value === "blob:null" ? "blob:null" : "about:blank";
          storage.set("sienna_cloak_method", window.siennaSettings.state.cloakMethod);
          window.siennaSettings.renderPanel();
        },
      },
      {
        id: "autoOpen",
        section: "Cloaking",
        label: "Auto open",
        desc: "Automatically open the site in a cloaked tab on load.",
        type: "select",
        options:["Disabled", "about:blank", "blob:null"],
        get: () => window.siennaSettings.state.autoOpen,
        set: (value) => {
          window.siennaSettings.state.autoOpen =["about:blank", "blob:null"].includes(value) ? value : "Disabled";
          storage.set("sienna_auto_open", window.siennaSettings.state.autoOpen);
        },
      },
      {
        id: "openInCloak",
        section: "Cloaking",
        label: "Open site cloaked",
        desc: "Open the current page with the selected cloak method.",
        type: "action",
        buttonLabel: "Open",
        onClick: () => window.siennaSettings.handleCloak(window.location.href),
      },
      {
        id: "tabCloak",
        section: "Cloaking",
        label: "Tab cloak",
        desc: "Change the browser tab's title and favicon to disguise the page.",
        type: "tab-cloak-grid",
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
            window.gameVisor.tabs =[];
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
      {
        id: "dataManagement",
        section: "Account",
        label: "Download / Upload",
        desc: "Save your settings, game progress, and themes to a file, or restore them from a backup.",
        type: "data-actions",
      },
      {
        id: "wipeConfig",
        section: "Account",
        label: "Wipe config",
        desc: "Reset the website to stock settings. This cannot be undone!",
        type: "action",
        buttonLabel: "Wipe config",
        onClick: () => window.siennaSettings.wipeConfig(),
      },
      {
        id: "aboutSection",
        section: "About",
        label: "Version",
        desc: `sienna v${SIENNA_VERSION} (build ${SIENNA_BUILD})`,
        type: "info",
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
      this.state.classicLogo = storage.get("sienna_classic_logo", "false") === "true";
      this.state.rememberTabs = storage.get("sienna_remember_tabs", "true") !== "false";
      this.state.cloakMethod = storage.get("sienna_cloak_method", "about:blank") === "blob:null" ? "blob:null" : "about:blank";
      this.state.autoOpen =["about:blank", "blob:null"].includes(storage.get("sienna_auto_open", "Disabled")) ? storage.get("sienna_auto_open", "Disabled") : "Disabled";
      const savedProvider = storage.get("sienna_games_provider", "night.");
      const validProviders =["night.", "Lumin", "gn-math"];
      this.state.gamesProvider = validProviders.includes(savedProvider) ? savedProvider : "night.";

      this.state.activeThemeId = storage.get("sienna_theme_id", "none");
      this.state.bubblesEnabled = storage.get("sienna_bubbles_enabled", "true") !== "false";
      this.state.tabCloakId = storage.get("sienna_tab_cloak", "Default");
      this.state.tabCloakCustomTitle = storage.get("sienna_tab_cloak_custom_title", "");
      this.state.tabCloakCustomFavicon = storage.get("sienna_tab_cloak_custom_favicon", "");

      this.loadCustomThemes();
      this.createToolbar();
      this.maybeShowUpdatesOnFirstVisit();
      this.apply();
      this.applyTheme(this.state.activeThemeId);
      this.applyGamesProvider(this.state.gamesProvider);
      if (this.state.tabCloakId === "Custom") {
        this.applyTabCloak("Custom", this.state.tabCloakCustomTitle, this.state.tabCloakCustomFavicon);
      } else {
        this.applyTabCloak(this.state.tabCloakId);
      }
      this.maybeAutoOpen();
    },

    apply() {
      if (!this.state.legacyLibrary) {
        document.documentElement.style.setProperty("--grid-cols", this.state.gridColumns);
      }
      document.body.classList.toggle("reduce-motion", this.state.reduceMotion);
      document.body.classList.toggle("legacy-library", this.state.legacyLibrary);
      document.body.classList.toggle("classic-logo-enabled", this.state.classicLogo);
      this.applyClassicLogo();
      // Toggle bubbles
      const canvas = document.getElementById('bubbleCanvas');
      if (canvas) {
        canvas.style.display = this.state.bubblesEnabled ? 'block' : 'none';
      }
    },

    applyClassicLogo() {
      const title = document.querySelector(".title");
      if (!title) return;

      title.textContent = this.state.classicLogo ? CLASSIC_LOGO : "sienna.";
      title.setAttribute("aria-label", "sienna.");
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

      // Convert data URLs to Blob URLs to avoid CSP issues with data: URIs in CSS
      let imageUrl = theme.url;
      if (imageUrl && imageUrl.startsWith("data:")) {
        try {
          const response = fetch(imageUrl);
          response.then(r => r.blob()).then(blob => {
            const blobUrl = URL.createObjectURL(blob);
            document.documentElement.style.setProperty("--theme-image", `url("${blobUrl}")`);
            document.body.classList.toggle("has-theme", true);
          }).catch(() => {
            // Fallback to direct data URL if blob conversion fails
            document.documentElement.style.setProperty("--theme-image", imageUrl ? `url("${imageUrl}")` : "none");
            document.body.classList.toggle("has-theme", Boolean(imageUrl));
          });
          return;
        } catch (e) {
          // Fallback to direct data URL
        }
      }

      document.documentElement.style.setProperty("--theme-image", imageUrl ? `url("${imageUrl}")` : "none");
      document.body.classList.toggle("has-theme", Boolean(imageUrl));
    },

    applyGamesProvider(provider) {
      const browseGrid = document.getElementById("browseGrid");
      const favoritesSection = document.getElementById("favoritesSection");
      const featured = document.getElementById("featured");
      const featuredDots = document.getElementById("featuredDots");
      const labels = document.querySelectorAll(".grid-section-label");
      const browseTop = document.querySelector(".browse-top");
      const host = document.getElementById("page-browse") || document.body;
      let lumin = document.getElementById("lumin-section");
      let gnmath = document.getElementById("gnmath-section");

      // Remove provider-specific sections when switching away
      if (provider !== "Lumin") {
        lumin?.remove();
      }
      if (provider !== "gn-math") {
        gnmath?.remove();
      }

      if (provider === "night.") {
        if (browseGrid) browseGrid.style.display = "";
        if (favoritesSection) favoritesSection.style.display = "";
        if (featured) featured.style.display = "";
        if (featuredDots) featuredDots.style.display = "";
        if (browseTop) browseTop.style.display = "";
        labels.forEach((label) => { label.style.display = ""; });
        return;
      }

      // Hide native sienna elements for all non-default providers
      if (browseGrid) browseGrid.style.display = "none";
      if (favoritesSection) favoritesSection.style.display = "none";
      if (featured) featured.style.display = "none";
      if (featuredDots) featuredDots.style.display = "none";
      if (browseTop) browseTop.style.display = "none";
      labels.forEach((label) => { label.style.display = "none"; });

      if (provider === "gn-math") {
        if (!gnmath) {
          gnmath = document.createElement("section");
          gnmath.id = "gnmath-section";
          gnmath.style.cssText = "position:absolute;inset:0;z-index:10;background:#000;margin:24px;border-radius:18px;overflow:hidden;";
          gnmath.innerHTML = '<iframe src="mages/gnmath/index.html" style="width:100%;height:100%;border:0;background:#000;"></iframe>';
          host.appendChild(gnmath);
        }
        return;
      }

      // Lumin provider
      if (!lumin) {
        lumin = document.createElement("section");
        lumin.id = "lumin-section";
        lumin.style.cssText = "position:absolute;inset:0;z-index:10;background:#000;margin:24px;border-radius:18px;overflow:hidden;";
        lumin.innerHTML = '<div id="games" class="lumin-games" style="width:100%;height:100%;min-height:680px;"></div>';
        host.appendChild(lumin);
      }

      const initLumin = () => {
        if (window.Lumin?.init) {
          window.Lumin.init({ container: "#games", theme: "dark", columns: 12, gamesPerPage: 60 });
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

    applyTabCloak(cloakId, customTitle, customFavicon) {
      // If custom values are provided, use them directly
      if (cloakId === "Custom" && customTitle !== undefined && customFavicon !== undefined) {
        document.title = customTitle;
        let link = document.querySelector("link[rel~='icon']");
        if (!link) {
          link = document.createElement("link");
          link.rel = "icon";
          document.head.appendChild(link);
        }
        link.href = customFavicon;
        this.state.tabCloakId = "Custom";
        this.state.tabCloakCustomTitle = customTitle;
        this.state.tabCloakCustomFavicon = customFavicon;
        storage.set("sienna_tab_cloak", "Custom");
        storage.set("sienna_tab_cloak_custom_title", customTitle);
        storage.set("sienna_tab_cloak_custom_favicon", customFavicon);
        return;
      }

      const preset = this.tabCloakPresets.find((p) => p.previewTitle === cloakId);
      if (!preset || cloakId === "Default") {
        // Reset to original
        document.title = "sienna.";
        let link = document.querySelector("link[rel~='icon']");
        if (!link) {
          link = document.createElement("link");
          link.rel = "icon";
          document.head.appendChild(link);
        }
        link.href = "favicon.ico";
        this.state.tabCloakId = "Default";
        storage.set("sienna_tab_cloak", "Default");
        return;
      }
      document.title = preset.realTitle;
      let link = document.querySelector("link[rel~='icon']");
      if (!link) {
        link = document.createElement("link");
        link.rel = "icon";
        document.head.appendChild(link);
      }
      link.href = preset.favicon;
      this.state.tabCloakId = cloakId;
      storage.set("sienna_tab_cloak", cloakId);
    },

    maybeAutoOpen() {
      if (this.state.autoOpen === "Disabled") return;
      if (window.self !== window.top || window.location.protocol === "blob:") return;
      if (sessionStorage.getItem("sienna_auto_open_attempted") === "true") return;
      sessionStorage.setItem("sienna_auto_open_attempted", "true");

      const method = this.state.autoOpen;
      const safeUrl = window.location.href;

      if (method === "blob:null") {
        // Store the original URL in sessionStorage so the blob page can read it
        sessionStorage.setItem("sienna_auto_open_url", safeUrl);
        const html =[
          "<!doctype html>",
          "<html><head><meta charset=\"utf-8\"><title>New Tab</title>",
          "<style>html,body{margin:0;height:100%;overflow:hidden;background:#000}iframe{width:100%;height:100%;border:0}</style>",
          "</head><body>",
          "<script>",
          "var url = sessionStorage.getItem('sienna_auto_open_url');",
          "if (url) {",
          "  var frame = document.createElement('iframe');",
          "  frame.src = url;",
          "  frame.allow = 'autoplay; picture-in-picture; fullscreen; clipboard-write';",
          "  frame.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;border:0';",
          "  document.body.appendChild(frame);",
          "}",
          "</",
          "script>",
          "</body></html>",
        ].join("");
        const blobUrl = URL.createObjectURL(new Blob([html], { type: "text/html" }));
        window.location.replace(blobUrl);
        return;
      }

      // about:blank - replace current page
      window.location.replace("about:blank");
    },

    handleCloak(url, preferredMethod = null) {
      const method = preferredMethod || this.state.cloakMethod;
      const safeUrl = String(url || window.location.href);

      if (method === "blob:null") {
        const html =[
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
      popup.setAttribute("aria-modal", "true");
      popup.setAttribute("aria-label", "Updates");
      popup.innerHTML = this.renderUpdatesPopupMarkup();

      const backdrop = document.createElement("div");
      backdrop.id = "updatesPopupBackdrop";
      backdrop.className = "updates-popup-backdrop";
      backdrop.setAttribute("aria-hidden", "true");

      document.body.append(toolbar, backdrop, popup);

      document.getElementById("settingsBtn")?.addEventListener("click", () => {
        this.closeUpdatesPopup();
        window.gameVisor?.openSettings?.();
      });

      document.getElementById("updatesBtn")?.addEventListener("click", (event) => {
        event.stopPropagation();
        this.toggleUpdatesPopup();
      });

      backdrop.addEventListener("click", () => this.closeUpdatesPopup());
      popup.addEventListener("click", (event) => event.stopPropagation());
      document.addEventListener("click", () => this.closeUpdatesPopup());
      document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") this.closeUpdatesPopup();
      });
    },

    renderUpdatesPopupMarkup() {
      const sections = Array.isArray(this.updates.sections) ? this.updates.sections : [];
      return `
        <div class="updates-popup-header">
          <div class="updates-popup-heading">
            <div class="updates-popup-sparkle" aria-hidden="true">
              <img src="logo.webp" alt="">
            </div>
            <div>
              <div class="updates-popup-title">${this.escapeHtml(this.updates.title)}</div>
              <div class="updates-popup-version">${this.escapeHtml(this.updates.version)}</div>
            </div>
          </div>
          <button class="updates-popup-close" id="updatesPopupClose" type="button" aria-label="Close updates">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M18 6L6 18M6 6l12 12"></path>
            </svg>
          </button>
        </div>
        <div class="updates-popup-body">
          ${sections.map((section) => `
            <section class="updates-popup-section">
              <strong>${this.escapeHtml(section.title || "Update")}</strong>
              <span>${this.escapeHtml(section.description || "")}</span>
            </section>
          `).join("")}
        </div>
        <div class="updates-popup-footer">
          <button class="updates-popup-confirm" id="updatesPopupConfirm" type="button">Wow really?</button>
        </div>
      `;
    },

    toggleUpdatesPopup(forceState = null) {
      const popup = document.getElementById("updatesPopup");
      const button = document.getElementById("updatesBtn");
      if (!popup || !button) return;

      popup.innerHTML = this.renderUpdatesPopupMarkup();
      popup.querySelector("#updatesPopupClose")?.addEventListener("click", () => this.closeUpdatesPopup());
      popup.querySelector("#updatesPopupConfirm")?.addEventListener("click", () => this.closeUpdatesPopup());

      const shouldOpen = forceState ?? !popup.classList.contains("visible");
      popup.classList.toggle("visible", shouldOpen);
      document.getElementById("updatesPopupBackdrop")?.classList.toggle("visible", shouldOpen);
      button.setAttribute("aria-expanded", shouldOpen ? "true" : "false");
      if (shouldOpen) {
        storage.set(this.updates.storageKey, "true");
        setTimeout(() => popup.querySelector("#updatesPopupConfirm")?.focus(), 0);
      }
    },

    closeUpdatesPopup() {
      document.getElementById("updatesPopup")?.classList.remove("visible");
      document.getElementById("updatesPopupBackdrop")?.classList.remove("visible");
      document.getElementById("updatesBtn")?.setAttribute("aria-expanded", "false");
    },

    maybeShowUpdatesOnFirstVisit() {
      if (!this.updates.showOnFirstVisit) return;
      if (storage.get(this.updates.storageKey, "false") === "true") return;
      window.requestAnimationFrame(() => this.toggleUpdatesPopup(true));
    },

    renderPanel() {
      const panel = document.getElementById("settingsPanel");
      if (!panel) return;

      // Save scroll position before re-render
      const oldMain = document.getElementById("settingsMain");
      const savedScrollTop = oldMain ? oldMain.scrollTop : 0;
      const savedActiveSection = panel.querySelector(".settings-sidebar-btn.active")?.dataset?.section || null;

      const grouped = this.registry.reduce((sections, item) => {
        if (!sections[item.section]) sections[item.section] = [];
        sections[item.section].push(item);
        return sections;
      }, {});

      const sectionIds = Object.keys(grouped);

      panel.innerHTML = `
        <div class="settings-shell">
          <aside class="settings-sidebar" id="settingsSidebar">
            <div class="settings-sidebar-title">sienna.</div>
            ${sectionIds.map((section) => `
              <button class="settings-sidebar-btn" type="button" data-section="${this.escapeHtml(section)}">${this.escapeHtml(section)}</button>
            `).join("")}
          </aside>
          <div class="settings-main" id="settingsMain">
            <header class="settings-header">
              <div>
                <h2 class="settings-title">Settings</h2>
                <p class="settings-subtitle">Layout, themes, providers, and game window behavior.</p>
              </div>
              <div class="settings-status">sienna.</div>
            </header>
            ${sectionIds.map((section, idx) => `
              <section class="settings-section" data-section-name="${this.escapeHtml(section)}" style="--section-index: ${idx}">
                <div class="settings-section-title">${this.escapeHtml(section)}</div>
                <div class="settings-section-body">
                  ${grouped[section].map((item) => this.renderItem(item)).join("")}
                </div>
              </section>
            `).join("")}
          </div>
        </div>
      `;

      // ── Sidebar navigation ──
      let isScrolling = false;
      let scrollTimeout = null;

      panel.querySelectorAll(".settings-sidebar-btn").forEach((btn) => {
        btn.addEventListener("click", () => {
          const sectionName = btn.dataset.section;
          const target = panel.querySelector(`.settings-section[data-section-name="${CSS.escape(sectionName)}"]`);
          if (!target) return;

          // Temporarily disable scroll-based highlighting during smooth scroll
          isScrolling = true;
          clearTimeout(scrollTimeout);
          scrollTimeout = setTimeout(() => { isScrolling = false; }, 600);

          // Highlight clicked button immediately
          panel.querySelectorAll(".settings-sidebar-btn").forEach((b) => b.classList.remove("active"));
          btn.classList.add("active");

          // Scroll the section into view with some offset so it's not flush with the top
          const settingsMain = document.getElementById("settingsMain");
          if (settingsMain) {
            const headerHeight = settingsMain.querySelector(".settings-header")?.offsetHeight || 0;
            const sectionTop = target.getBoundingClientRect().top - settingsMain.getBoundingClientRect().top;
            settingsMain.scrollTo({ top: settingsMain.scrollTop + sectionTop - headerHeight - 20, behavior: "smooth" });
          }
        });
      });

      // Re-query for the new settingsMain element after innerHTML replacement
      const newMain = document.getElementById("settingsMain");

      // Highlight the first sidebar button on render
      const firstBtn = panel.querySelector(".settings-sidebar-btn");
      if (firstBtn) firstBtn.classList.add("active");

      // Restore scroll position after re-render
      if (newMain && savedScrollTop > 0) {
        newMain.scrollTop = savedScrollTop;
      }

      // Restore active sidebar button
      if (savedActiveSection) {
        const savedBtn = panel.querySelector(`.settings-sidebar-btn[data-section="${CSS.escape(savedActiveSection)}"]`);
        if (savedBtn) {
          panel.querySelectorAll(".settings-sidebar-btn").forEach((b) => b.classList.remove("active"));
          savedBtn.classList.add("active");
        }
      }

      // Track scroll position to update active sidebar button
      if (newMain) {
        newMain.addEventListener("scroll", () => {
          if (isScrolling) return;

          const sections = newMain.querySelectorAll(".settings-section");
          const mainRect = newMain.getBoundingClientRect();
          const scrollCenter = mainRect.top + 100; // offset from top of container

          let closestSection = sectionIds[0];
          let closestDist = Infinity;

          for (const sec of sections) {
            const rect = sec.getBoundingClientRect();
            const dist = Math.abs(rect.top - scrollCenter);
            if (dist < closestDist) {
              closestDist = dist;
              closestSection = sec.dataset.sectionName;
            }
          }

          panel.querySelectorAll(".settings-sidebar-btn").forEach((b) => {
            b.classList.toggle("active", b.dataset.section === closestSection);
          });
        });
      }

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

      // Tab cloak: dropdown selection
      const tabCloakSelect = document.getElementById("tabCloakSelect");
      if (tabCloakSelect) {
        tabCloakSelect.addEventListener("change", () => {
          const value = tabCloakSelect.value;
          if (value === "Custom") {
            this.state.tabCloakId = "Custom";
            storage.set("sienna_tab_cloak", "Custom");
            this.renderPanel();
          } else {
            this.applyTabCloak(value);
            this.renderPanel();
          }
        });
      }

      // Tab cloak: apply custom
      const applyCustomBtn = document.getElementById("tabCloakApplyCustom");
      if (applyCustomBtn) {
        applyCustomBtn.addEventListener("click", () => {
          const titleInput = document.getElementById("tabCloakCustomTitle");
          const faviconInput = document.getElementById("tabCloakCustomFavicon");
          if (!titleInput && !faviconInput) return;
          const title = titleInput?.value?.trim() || "";
          const favicon = faviconInput?.value?.trim() || "";
          if (!title && !favicon) return;
          this.applyTabCloak("Custom", title, favicon);
          this.renderPanel();
        });
      }

      // Tab cloak: reset button
      panel.querySelectorAll("[data-action='reset-tab-cloak']").forEach((button) => {
        button.addEventListener("click", () => {
          this.applyTabCloak("Default");
          this.renderPanel();
        });
      });

      // Data management: Download / Upload buttons
      panel.querySelectorAll("[data-action='download-data']").forEach((button) => {
        button.addEventListener("click", () => this.downloadData());
      });
      panel.querySelectorAll("[data-action='upload-data']").forEach((button) => {
        button.addEventListener("click", () => this.uploadData());
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
      if (item.type === "tab-cloak-grid") return this.renderTabCloakGrid(item);

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

      if (item.type === "data-actions") {
        return `
          <div class="data-actions-row">
            <button class="action-btn" type="button" data-action="download-data">Download</button>
            <button class="action-btn" type="button" data-action="upload-data">Upload</button>
          </div>
        `;
      }

      if (item.type === "info") {
        return `<span class="settings-info-text">${this.escapeHtml(item.desc)}</span>`;
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
            <button class="action-btn" type="button" data-action="upload-theme">Upload Theme</button>
          </div>
        </div>
        <div class="settings-theme-grid">
          ${this.themes.map((theme) => `
            <button class="theme-card ${this.state.activeThemeId === theme.id ? "selected" : ""}" type="button" data-theme-id="${this.escapeHtml(theme.id)}">
              <div class="theme-preview" style="background-image: url('${this.escapeHtml(theme.url)}');"></div>
              <div class="theme-label">${this.escapeHtml(theme.label)}</div>
              ${theme.id.startsWith("custom-") ? `<span class="theme-delete" data-action="delete-custom-theme" data-theme-id="${this.escapeHtml(theme.id)}" title="Delete theme">&times;</span>` : ""}
            </button>
          `).join("")}
        </div>
      `;
    },

    renderTabCloakGrid(item) {
      const isCustom = this.state.tabCloakId === "Custom";
      return `
        <div class="settings-item" style="display:flex;flex-direction:column;gap:12px;">
          <div style="display:flex;align-items:center;justify-content:space-between;gap:16px;width:100%;">
            <div class="settings-info">
              <span class="settings-label">${this.escapeHtml(item.label)}</span>
              <span class="settings-desc">${this.escapeHtml(item.desc)}</span>
            </div>
            <div class="settings-control" style="gap:8px;flex-shrink:0;">
              ${this.state.tabCloakId !== "Default" ? `<button class="remove-theme-btn" type="button" data-action="reset-tab-cloak" title="Reset to default">Reset</button>` : ""}
            </div>
          </div>
          <div class="tab-cloak-row">
            <select class="settings-select" id="tabCloakSelect">
              ${this.tabCloakPresets.map((preset) => `
                <option value="${this.escapeHtml(preset.previewTitle)}" ${this.state.tabCloakId === preset.previewTitle ? "selected" : ""}>${this.escapeHtml(preset.previewTitle)}</option>
              `).join("")}
              <option value="Custom" ${isCustom ? "selected" : ""}>Custom</option>
            </select>
            <input class="tab-cloak-input" type="text" id="tabCloakCustomTitle" value="${this.escapeHtml(this.state.tabCloakCustomTitle)}" placeholder="Tab name">
            <input class="tab-cloak-input" type="text" id="tabCloakCustomFavicon" value="${this.escapeHtml(this.state.tabCloakCustomFavicon)}" placeholder="Favicon URL">
            <button class="action-btn" type="button" id="tabCloakApplyCustom">Apply</button>
          </div>
        </div>
      `;
    },

    openUploadTheme() {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = "image/*";
      input.addEventListener("change", (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.addEventListener("load", (ev) => {
          const dataUrl = ev.target?.result;
          if (typeof dataUrl !== "string") return;
          const id = "custom-" + Date.now();
          const label = file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");
          this.themes.push({ id, label, url: dataUrl });
          this.saveCustomThemes();
          this.applyTheme(id);
          this.renderPanel();
        });
        reader.readAsDataURL(file);
      });
      input.click();
    },

    downloadData() {
      // 1. Create Loading UI
      const loader = document.createElement("div");
      loader.id = "sienna-data-loader";
      loader.style.cssText = "position:fixed;inset:0;background:rgba(0,0,0,0.85);z-index:99999;display:flex;flex-direction:column;align-items:center;justify-content:center;color:#fff;font-family:sans-serif;backdrop-filter:blur(4px);";
      const spinner = document.createElement("div");
      spinner.style.cssText = "width:40px;height:40px;border:4px solid rgba(255,255,255,0.3);border-top:4px solid #fff;border-radius:50%;animation:sienna-spin 1s linear infinite;margin-bottom:16px;";
      if (!document.getElementById("sienna-spin-style")) {
        const style = document.createElement("style");
        style.id = "sienna-spin-style";
        style.textContent = "@keyframes sienna-spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }";
        document.head.appendChild(style);
      }
      const text = document.createElement("div");
      text.textContent = "Gathering info, this may take a while...";
      text.style.fontSize = "16px";
      loader.appendChild(spinner);
      loader.appendChild(text);
      document.body.appendChild(loader);

      // We use setTimeout to allow the browser to render the loading screen before processing data
      setTimeout(() => {
        try {
          const data = {
            localStorage: {},
            sessionStorage: {},
            cookies: document.cookie || ""
          };
          
          // Grab ALL localStorage keys (Sienna settings + Game Saves)
          for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            data.localStorage[key] = localStorage.getItem(key);
          }

          // Grab ALL sessionStorage keys
          for (let i = 0; i < sessionStorage.length; i++) {
            const key = sessionStorage.key(i);
            data.sessionStorage[key] = sessionStorage.getItem(key);
          }

          // Include current state values for completeness
          data._state = JSON.parse(JSON.stringify(this.state));

          // Add a magic tag to verify the file is a valid sienna backup
          data._sienna = "sienna-backup-v2";

          // Update loading text to show progress
          text.textContent = "Preparing download...";

          // Trigger the download after another brief pause
          setTimeout(() => {
            const json = JSON.stringify(data, null, 2);
            // Use .data extension with gzip-like compression via Blob
            const blob = new Blob([json], { type: "application/octet-stream" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "your-sienna.data";
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            // Clean up loader and show completion text briefly
            text.textContent = "Download sent!";
            setTimeout(() => {
              if (document.body.contains(loader)) document.body.removeChild(loader);
            }, 800); 

          }, 600);
          
        } catch (e) {
          console.error("Failed to download data:", e);
          text.textContent = "Error gathering data!";
          setTimeout(() => {
            if (document.body.contains(loader)) document.body.removeChild(loader);
          }, 2000);
        }
      }, 600); // Wait 600ms so the user has time to read "Gathering info..."
    },

    uploadData() {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = ".data,.json";
      input.addEventListener("change", (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Show loading screen
        const loader = document.createElement("div");
        loader.id = "sienna-data-loader";
        loader.style.cssText = "position:fixed;inset:0;background:rgba(0,0,0,0.85);z-index:99999;display:flex;flex-direction:column;align-items:center;justify-content:center;color:#fff;font-family:sans-serif;backdrop-filter:blur(4px);";
        const spinner = document.createElement("div");
        spinner.style.cssText = "width:40px;height:40px;border:4px solid rgba(255,255,255,0.3);border-top:4px solid #fff;border-radius:50%;animation:sienna-spin 1s linear infinite;margin-bottom:16px;";
        if (!document.getElementById("sienna-spin-style")) {
          const style = document.createElement("style");
          style.id = "sienna-spin-style";
          style.textContent = "@keyframes sienna-spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }";
          document.head.appendChild(style);
        }
        const text = document.createElement("div");
        text.textContent = "Reading save file...";
        text.style.fontSize = "16px";
        loader.appendChild(spinner);
        loader.appendChild(text);
        document.body.appendChild(loader);

        const reader = new FileReader();
        reader.addEventListener("load", (ev) => {
          text.textContent = "Restoring data...";
          
          setTimeout(() => {
            try {
              const json = ev.target?.result;
              if (typeof json !== "string") throw new Error("Invalid file content");
              const data = JSON.parse(json);

              // 1. Support legacy backup files (V1)
              if (data._sienna === "sienna-backup-v1") {
                for (const key in data) {
                  if (key !== "_sienna" && key !== "_state") {
                    try { localStorage.setItem(key, data[key]); } catch (e) {}
                  }
                }
              } 
              // 2. Support new complete backup files (V2)
              else if (data._sienna === "sienna-backup-v2") {
                
                // Restore LocalStorage
                if (data.localStorage) {
                  for (const key in data.localStorage) {
                    try { localStorage.setItem(key, data.localStorage[key]); } catch (e) {}
                  }
                }
                
                // Restore SessionStorage
                if (data.sessionStorage) {
                  for (const key in data.sessionStorage) {
                    try { sessionStorage.setItem(key, data.sessionStorage[key]); } catch (e) {}
                  }
                }

                // Restore Cookies
                if (data.cookies && typeof data.cookies === 'string') {
                  data.cookies.split(';').forEach(cookie => {
                    if (cookie.trim()) document.cookie = cookie.trim();
                  });
                }
              } 
              // Unknown format
              else {
                alert(
                  "Invalid or corrupted backup file.\n\n" +
                  "This file does not appear to be a sienna data backup. " +
                  "Please use a file downloaded from the 'Download' button in Settings → Data management."
                );
                document.body.removeChild(loader);
                return;
              }

              text.textContent = "Done! Reloading...";
              setTimeout(() => {
                window.location.reload();
              }, 500);

            } catch (err) {
              console.error("Failed to upload data:", err);
              text.textContent = "Failed to restore data!";
              alert(
                "Failed to restore data.\n\n" +
                "The file could not be read. It may be corrupted or not a valid sienna backup file."
              );
              setTimeout(() => {
                if (document.body.contains(loader)) document.body.removeChild(loader);
              }, 1000);
            }
          }, 600); // 600ms artificial delay so the user feels progress happening
        });
        reader.readAsText(file);
      });
      input.click();
    },


    wipeConfig(options = {}) {
      // Show a confirmation dialog
      if (!options.skipConfirm) {
        const confirmed = confirm(
        "⚠️ Wipe all data?\n\nThis will reset ALL settings, custom games, favorites, themes, and saved tabs back to their defaults. This cannot be undone!\n\nAre you sure you want to continue?"
        );
        if (!confirmed) return;

        // Second confirmation for safety
        const reallySure = confirm(
        "Final confirmation:\n\nAll your data will be permanently deleted. There is no undo.\n\nProceed?"
        );
        if (!reallySure) return;
      }

      // List of all sienna-related localStorage keys to remove
      const keys =[
        "sienna_reduce_motion",
        "sienna_grid_columns",
        "sienna_legacy_library",
        "sienna_classic_logo",
        "sienna_remember_tabs",
        "sienna_cloak_method",
        "sienna_auto_open",
        "sienna_games_provider",
        "sienna_theme_id",
        "sienna_bubbles_enabled",
        "sienna_tab_cloak",
        "sienna_tab_cloak_custom_title",
        "sienna_tab_cloak_custom_favicon",
        "sienna_updates_seen_v0_9",
        "sienna_custom_themes",
        "sienna_custom_games",
        "sienna_favs",
        "gameVisorTabs",
        "gameVisorActiveTabId",
      ];

      for (const key of keys) {
        try {
          localStorage.removeItem(key);
        } catch (e) {
          // skip inaccessible keys
        }
      }

      // Reload the page to reset everything
      if (options.cleanUrl) {
        window.location.replace(window.location.origin + window.location.pathname);
      } else {
        window.location.reload();
      }
    },

    escapeHtml(str) {
      const div = document.createElement("div");
      div.textContent = str;
      return div.innerHTML;
    },
  };


  // Expose version and build globally for the info popup
  window.SIENNA_VERSION = SIENNA_VERSION;
  window.SIENNA_BUILD = SIENNA_BUILD;

  // Populate info popup with version and build
  (function populateInfoPopup() {
    const versionEl = document.getElementById("version");
    const buildEl = document.getElementById("build");
    if (versionEl) versionEl.textContent = "v" + SIENNA_VERSION;
    if (buildEl) buildEl.textContent = SIENNA_BUILD;
  })();

  window.siennaSettings.init();

  // ── ?savemydata query param: auto-download user data ──
  // Uses a query parameter so it works with static hosting (no server-side routing needed)
  (function checkSaveMyDataRoute() {
    const params = new URLSearchParams(window.location.search);
    if (params.has("clear")) {
      window.siennaSettings.wipeConfig({ skipConfirm: true, cleanUrl: true });
      return;
    }

    if (params.has("savemydata")) {
      // Wait for settings to be ready, then download
      const tryDownload = () => {
        if (window.siennaSettings?.downloadData) {
          window.siennaSettings.downloadData();
          // After download, clean up the URL by removing the query param
          const cleanUrl = window.location.origin + window.location.pathname;
          window.history.replaceState({}, "", cleanUrl);
        } else {
          setTimeout(tryDownload, 100);
        }
      };
      tryDownload();
    }
  })();

  // ── Floating bubbles on the landing canvas ──
  (function initBubbles() {
    const canvas = document.getElementById('bubbleCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let bubbles = [];
    let animId = null;
    let w, h;

    function resize() {
      const rect = canvas.parentElement.getBoundingClientRect();
      w = canvas.width = rect.width;
      h = canvas.height = rect.height;
    }
    resize();
    window.addEventListener('resize', resize);

    function isEnabled() {
      return window.siennaSettings?.state?.bubblesEnabled !== false;
    }

    const count = Math.min(Math.floor((w * h) / 40000), 30);

    for (let i = 0; i < count; i++) {
      bubbles.push({
        x: Math.random() * w,
        y: Math.random() * h,
        r: 6 + Math.random() * 24,
        speed: 0.12 + Math.random() * 0.28,
        drift: (Math.random() - 0.5) * 0.2,
        opacity: 0.08 + Math.random() * 0.10,
        popped: false,
        popTimer: 0,
        hue: 190 + Math.random() * 40
      });
    }

    function draw() {
      ctx.clearRect(0, 0, w, h);

      if (!isEnabled()) {
        animId = requestAnimationFrame(draw);
        return;
      }

      for (const b of bubbles) {
        if (b.popped) {
          b.popTimer--;
          if (b.popTimer <= 0) {
            b.popped = false;
            b.x = Math.random() * w;
            b.y = h + b.r;
            b.r = 6 + Math.random() * 24;
            b.opacity = 0.08 + Math.random() * 0.10;
            b.hue = 190 + Math.random() * 40;
          }
          continue;
        }

        b.y -= b.speed;
        b.x += b.drift;

        if (b.y + b.r < 0) {
          b.y = h + b.r;
          b.x = Math.random() * w;
        }

        const grad = ctx.createRadialGradient(
          b.x - b.r * 0.3, b.y - b.r * 0.3, b.r * 0.1,
          b.x, b.y, b.r
        );
        grad.addColorStop(0, `rgba(255, 255, 255, ${b.opacity * 0.9})`);
        grad.addColorStop(0.4, `rgba(200, 230, 255, ${b.opacity * 0.3})`);
        grad.addColorStop(0.7, `rgba(180, 220, 255, ${b.opacity * 0.15})`);
        grad.addColorStop(1, `rgba(255, 255, 255, ${b.opacity * 0.05})`);

        ctx.beginPath();
        ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();

        ctx.strokeStyle = `rgba(255, 255, 255, ${b.opacity * 0.6})`;
        ctx.lineWidth = 0.8;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(b.x - b.r * 0.28, b.y - b.r * 0.28, b.r * 0.22, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${b.opacity * 0.7})`;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(b.x - b.r * 0.15, b.y - b.r * 0.45, b.r * 0.08, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${b.opacity * 0.5})`;
        ctx.fill();
      }

      animId = requestAnimationFrame(draw);
    }

    canvas.addEventListener('click', (e) => {
      if (!isEnabled()) return;
      const rect = canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;

      for (const b of bubbles) {
        if (b.popped) continue;
        const dx = mx - b.x;
        const dy = my - b.y;
        if (dx * dx + dy * dy < b.r * b.r) {
          b.popped = true;
          b.popTimer = 30;
          break;
        }
      }
    });

    draw();
  })();
})();