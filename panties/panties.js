/*
 * panties — sienna game-loading kernel (test build)
 *
 * A standalone, self-contained kernel that loads sienna games into a host page
 * through one chokepoint. The game list is read from window.MAGES_GAMES
 * (populated by the sibling ../mages.js), so it stays in sync with the real
 * site automatically — no separate list to maintain.
 *
 * The host page is empty on purpose. Open the dev console and type:
 *     run("fnaf")
 * to load a game.
 *
 * Built to mirror the launch path already in js/night.js (gameVisor.open +
 * the <base href> rewrite), so behaviour matches the real site.
 *
 * Console commands:
 *   run("fnaf")      launch a game (slug / name / fuzzy match)
 *   close()          stop the current game
 *   list()           show all available games
 *   Panties.setRelay(user, repo, branch?)   switch the CDN relay
 *   Panties.getRelay()                      show the current relay
 *   Panties.addGame({...})                  add a one-off game (this session)
 *   Panties.find("query")                   preview what a query resolves to
 */

(function () {
  'use strict';

  // ─────────────────────────────────────────────────────────────────────────
  //  RELAY
  //
  //  The "relay" is the CDN account/repo that every game's <base href> points
  //  at. Swapping it mirrors the whole library to a different GitHub repo.
  //  Default matches what's baked into mages/*/index.html today:
  //      https://cdn.jsdelivr.net/gh/skibbsz/jsdelivr-cdns@main/<slug>/
  // ─────────────────────────────────────────────────────────────────────────
  const DEFAULT_RELAY = { user: 'skibbsz', repo: 'jsdelivr-cdns', branch: 'main' };

  // ─────────────────────────────────────────────────────────────────────────
  //  ONE-OFF / HAND-ADDED GAMES
  //
  //  Anything here is merged ON TOP of the mages.js list at runtime, so games
  //  you add here don't clobber the real list and don't require editing mages.js.
  //  Shape matches a mages.js entry: { name, image?, url, section?, author? }.
  //  For a fully external game, use an absolute url and it loads as-is.
  // ─────────────────────────────────────────────────────────────────────────
  const CUSTOM_GAMES = [
    { name: 'Baby Sniper in Vietnam', url: 'babysniperinvietnam/index.html', section: 'Custom', author: 'you' },
  ];

  // ─────────────────────────────────────────────────────────────────────────
  //  CONFIG
  // ─────────────────────────────────────────────────────────────────────────
  const CONFIG = {
    // Local path to each game's index.html. These are the real sienna game
    // shells — their <base href> pulls assets from the relay CDN.
    gamesRoot: '../mages/',
    iconsRoot: '../icons/',
    relay: { ...DEFAULT_RELAY },
    // When true, panties rewrites each game's <base href> to the current relay.
    // Disable to load the game's own baked-in CDN target verbatim.
    rewriteBaseHref: true,
    // Sections in mages.js that are not playable games (pointers to sub-sites).
    skipSections: new Set(['website']),
  };

  // ─────────────────────────────────────────────────────────────────────────
  //  STATE
  // ─────────────────────────────────────────────────────────────────────────
  const state = {
    current: null,   // { slug, name, el }
    container: null, // host element the game renders into
    games: [],       // normalised list, rebuilt via buildGames()
  };

  // ─────────────────────────────────────────────────────────────────────────
  //  LIST BUILDING — turn mages.js entries into a uniform game descriptor
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Derive the folder slug from a mages.js `url` field.
   *   "fnaf/index.html"          -> "fnaf"
   *   "ovo/index.html"           -> "ovo"
   *   absolute http(s) URL       -> ""  (not a local slug; loaded as-is)
   */
  function slugFromUrl(url) {
    const u = String(url || '');
    if (!u || /^(?:[a-z][a-z0-9+.-]*:|\/\/)/i.test(u)) return '';
    // Take the first path segment. Works for "slug/index.html" and "slug/".
    return u.split('/')[0] || '';
  }

  /**
   * Build the normalised game list from window.MAGES_GAMES + CUSTOM_GAMES.
   *
   * - Skips entries whose `url` isn't a local `*/index.html` (covers the
   *   "website" pointers like link/, gnmath/, ugsfiles/).
   * - Skips the skipSections set.
   * - Keeps the authoritative mages.js `name` so dashes/case survive.
   * - De-dupes by slug (CUSTOM_GAMES first, so hand-added entries win).
   */
  function buildGames() {
    const source = Array.isArray(window.MAGES_GAMES) ? window.MAGES_GAMES : [];
    const seen = new Set();
    const out = [];

    const push = (entry) => {
      if (!entry || !entry.url) return;
      const slug = slugFromUrl(entry.url);
      if (!slug) return;                       // external URL or unparseable
      if (seen.has(slug)) return;              // de-dupe by slug
      if (CONFIG.skipSections.has(entry.section)) return;
      seen.add(slug);
      out.push({
        slug,
        name: String(entry.name || slug),
        section: entry.section || '',
        author: entry.author || '',
        icon: entry.image || `icons/${slug}.webp`,
        url: entry.url,
      });
    };

    // CUSTOM_GAMES first so hand-added entries win the de-dupe, then mages.js.
    CUSTOM_GAMES.forEach(push);
    source.forEach(push);
    return out;
  }

  function refreshGames() {
    state.games = buildGames();
    return state.games;
  }

  // ─────────────────────────────────────────────────────────────────────────
  //  RELAY HELPERS
  // ─────────────────────────────────────────────────────────────────────────

  /** Build the CDN root a game's relative URLs resolve against. */
  function relayBaseHref(slug) {
    const { user, repo, branch } = CONFIG.relay;
    return `https://cdn.jsdelivr.net/gh/${user}/${repo}@${branch}/${slug}/`;
  }

  /**
   * Rewrite a game's <base href> so relative asset URLs hit the current relay.
   * Lifted from the same logic in js/night.js (gameVisor.getGameHtmlBlobUrl).
   *
   * - Absolute http(s) / protocol-relative hrefs are left untouched (external
   *   CDNs like jszip on cloudflare must not be rewritten).
   * - Relative hrefs are rebuilt against the configured relay.
   */
  function applyRelay(html, slug) {
    if (!CONFIG.rewriteBaseHref) return html;
    return html.replace(
      /<base\s+href=["']([^"']*)["']\s*\/?>/gi,
      (match, href) => {
        if (/^(https?:)?\/\//i.test(href)) return match;
        return `<base href="${relayBaseHref(slug)}">`;
      }
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  //  LOOKUP
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Resolve a query to a single game. Matches on slug (exact), then slug
   * substring, then name substring — so run("fnaf"), run("Freddy"), and
   * run("five nights") all work.
   */
  function resolve(query) {
    const games = state.games.length ? state.games : refreshGames();
    const q = String(query || '').trim().toLowerCase();
    if (!q) return null;

    const exact = games.find((g) => g.slug.toLowerCase() === q);
    if (exact) return exact;

    const slugMatch = games.find((g) => g.slug.toLowerCase().includes(q));
    if (slugMatch) return slugMatch;

    const nameMatch = games.find((g) => g.name.toLowerCase().includes(q));
    if (nameMatch) return nameMatch;

    return null;
  }

  // ─────────────────────────────────────────────────────────────────────────
  //  HOST PAGE WIRING
  // ─────────────────────────────────────────────────────────────────────────

  /** Ensure a single full-bleed container exists in the host page. */
  function ensureContainer() {
    if (state.container && state.container.isConnected) return state.container;
    document.body.style.cssText = 'margin:0;padding:0;background:#000;overflow:hidden;';
    const el = document.createElement('div');
    el.id = 'panties-host';
    el.style.cssText = 'position:fixed;inset:0;background:#000;';
    document.body.appendChild(el);
    state.container = el;
    return el;
  }

  // ─────────────────────────────────────────────────────────────────────────
  //  LAUNCH (the chokepoint — every game runs through this)
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Load a game by slug/name into the host page.
   *
   * Fetches the local mages/<slug>/index.html, applies the current relay to its
   * <base href>, then injects the result into a same-origin iframe so the game
   * runs in isolation (its own scripts, canvas, audio — exactly like night.js).
   *
   * @param {string} query  slug or name, e.g. "fnaf"
   * @returns {object|null} the launched game descriptor, or null on failure
   */
  async function launch(query) {
    const game = resolve(query);
    if (!game) {
      console.warn(`[panties] no game matched "${query}". Try: list()`);
      return null;
    }

    const container = ensureContainer();
    // Tear down any game already mounted.
    if (state.current?.el) state.current.el.remove();

    const gameUrl = CONFIG.gamesRoot + game.slug + '/index.html';

    let html;
    try {
      const res = await fetch(gameUrl);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      html = await res.text();
    } catch (err) {
      console.error(`[panties] failed to fetch ${gameUrl}`, err);
      console.error(`[panties] (open this page via a local server, not file:// — fetch is blocked on file:)`);
      return null;
    }

    html = applyRelay(html, game.slug);

    // Build the game as a blob so relative URLs resolve against the rewritten
    // <base href>, and so the game is fully isolated from the host page.
    const blobUrl = URL.createObjectURL(new Blob([html], { type: 'text/html' }));

    const iframe = document.createElement('iframe');
    iframe.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;border:0;background:#000;';
    iframe.allow = 'autoplay; picture-in-picture; fullscreen; clipboard-write; gamepad';
    iframe.src = blobUrl;
    container.appendChild(iframe);

    state.current = { slug: game.slug, name: game.name, el: iframe };
    console.log(`[panties] launched "${game.name}" (${game.slug}) via relay ${relayBaseHref(game.slug)}`);
    return state.current;
  }

  /** Unload the current game, if any. */
  function close() {
    if (!state.current?.el) return false;
    state.current.el.remove();
    state.current = null;
    console.log('[panties] closed');
    return true;
  }

  /** List all known games. */
  function list() {
    const games = state.games.length ? state.games : refreshGames();
    console.log(`[panties] ${games.length} games available (relay: ${CONFIG.relay.user}/${CONFIG.relay.repo}@${CONFIG.relay.branch})`);
    console.table(games.map((g) => ({ slug: g.slug, name: g.name, section: g.section })));
    return games;
  }

  /** Preview what a query resolves to without launching. */
  function find(query) {
    const game = resolve(query);
    if (!game) {
      console.log(`[panties] "${query}" -> no match`);
      return null;
    }
    console.log(`[panties] "${query}" -> ${game.slug} (${game.name})`);
    return game;
  }

  /** Add a one-off game for this session (merged on top of mages.js). */
  function addGame(entry) {
    if (!entry || !entry.url) {
      console.warn('[panties] addGame needs at least { url }');
      return null;
    }
    CUSTOM_GAMES.push(entry);
    refreshGames();
    console.log(`[panties] added game, list now ${state.games.length}`);
    return entry;
  }

  /** Switch the CDN relay on the fly. Affects subsequently launched games. */
  function setRelay(user, repo, branch = 'main') {
    CONFIG.relay = { user, repo, branch };
    console.log(`[panties] relay set to ${user}/${repo}@${branch}`);
    return CONFIG.relay;
  }

  /** What relay are we currently using? */
  function getRelay() {
    return { ...CONFIG.relay };
  }

  // ─────────────────────────────────────────────────────────────────────────
  //  BOOT
  // ─────────────────────────────────────────────────────────────────────────
  refreshGames();

  // ─────────────────────────────────────────────────────────────────────────
  //  PUBLIC API
  // ─────────────────────────────────────────────────────────────────────────
  const Panties = {
    launch, close, list, find, resolve,
    setRelay, getRelay,
    addGame,
    get games() { return state.games; },
    get current() { return state.current; },
    CONFIG,
  };

  // Expose both the formal namespace and the short console helpers.
  window.Panties = Panties;
  window.run = launch;   // run("fnaf")
  window.close = close;  // close()
  window.list = list;    // list()

  // ─────────────────────────────────────────────────────────────────────────
  //  CONSOLE BANNER
  // ─────────────────────────────────────────────────────────────────────────
  const relayStr = `${CONFIG.relay.user}/${CONFIG.relay.repo}@${CONFIG.relay.branch}`;
  console.log(
    '%c panties ',
    'background:#111;color:#7fd1b9;font-weight:bold;padding:2px 8px;border-radius:3px;',
    `\n\n${state.games.length} games loaded from mages.js (relay: ${relayStr}).\n\nTry:\n` +
    `  run("fnaf")      launch a game\n` +
    `  close()          stop it\n` +
    `  list()           see all ${state.games.length} games\n` +
    `  Panties.find("...")            preview a match\n` +
    `  Panties.setRelay("yellowdevelopment","jsdelivr-cdns")   mirror the CDN\n`
  );
})();
