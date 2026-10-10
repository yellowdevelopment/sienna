/**
 * 404.js — "Page not found" popup
 *
 * Shown once after 404.html redirects an unknown URL to the main page.
 * 404.html stores the requested path slug in sessionStorage['sienna_not_found']
 * and forwards it as '?notfound=<slug>' (a fallback for browsers that block storage).
 *
 * This script consumes either signal, opens #notFoundOverlay in index.html,
 * looks the slug up in the night. catalog, and offers the match as a clickable
 * tile. The query param is stripped so a refresh or a Back/Forward navigation
 * doesn't pop the notice again.
 *
 * Dependencies: #notFoundOverlay markup in index.html (fails safe without it)
 * and window.siennaProviders.findNightGames for the lookup.
 */

(function () {
  'use strict';

  var FLAG = 'sienna_not_found';

  // ── Did this page load come from a 404 redirect? ──────────────────────────
  // Reads both signals, clears them, and returns the requested slug ('' when
  // the URL carried none). null means this load wasn't a 404 bounce at all.
  function consumeFlag() {
    var flagged = false;
    var term = '';

    try {
      var value = new URLSearchParams(location.search).get('notfound');
      if (value !== null) {
        flagged = true;
        term = value;
      }
    } catch (e) { /* URLSearchParams unsupported — rely on storage */ }

    try {
      if (sessionStorage.getItem(FLAG) !== null) {
        flagged = true;
        if (!term) term = sessionStorage.getItem(FLAG) || '';
        sessionStorage.removeItem(FLAG);
      }
    } catch (e) { /* storage blocked — the query param already covers this */ }

    if (!flagged) return null;
    return term;
  }

  // ── Strip '?notfound=<slug>' from the address bar ─────────────────────────
  function stripParam() {
    try {
      var url = new URL(location.href);
      if (!url.searchParams.has('notfound')) return;
      url.searchParams.delete('notfound');
      history.replaceState(null, '', url.pathname + url.search + url.hash);
    } catch (e) { /* ignore */ }
  }

  // ── "Could you be looking for?" ───────────────────────────────────────────
  // The slug from the old URL is matched against the night. catalog. Anything
  // else — no slug, no match, a failed or slow catalog fetch — leaves the popup
  // as the plain "Uh oh…" notice, so a suggestion only appears when it's right.
  var MATCH_TIMEOUT = 6000;

  function renderSuggestion(term, close) {
    var section = document.getElementById('notFoundSuggest');
    var grid = document.getElementById('notFoundSuggestGrid');
    if (!section || !grid || !term) return;

    var lookup = window.siennaProviders && window.siennaProviders.findNightGames;
    if (typeof lookup !== 'function') return;

    // Never let a hanging request keep the popup from settling.
    var timeout = new Promise(function (resolve) {
      setTimeout(function () { resolve([]); }, MATCH_TIMEOUT);
    });

    Promise.race([lookup(term), timeout])
      .then(function (games) {
        if (!Array.isArray(games) || !games.length) return;

        grid.innerHTML = '';
        games.forEach(function (game) {
          var tile = buildTile(game, close);
          if (tile) grid.appendChild(tile);
        });

        if (grid.children.length) section.hidden = false;
      })
      .catch(function (error) {
        console.warn('404: could not look up "' + term + '"', error);
      });
  }

  // One tile per match, reusing the look of the browse grid.
  function buildTile(game, close) {
    if (!game || !game.url) return null;

    var tile = document.createElement('button');
    tile.type = 'button';
    tile.className = 'notfound-tile';
    tile.title = 'Play ' + (game.name || 'this game');

    if (game.image) {
      var icon = document.createElement('img');
      icon.className = 'notfound-tile-icon';
      icon.src = encodeURI(game.image);
      icon.alt = '';
      icon.loading = 'lazy';
      icon.addEventListener('error', function () { icon.remove(); });
      tile.appendChild(icon);
    }

    var name = document.createElement('span');
    name.className = 'notfound-tile-name';
    name.textContent = game.name || 'Untitled';
    tile.appendChild(name);

    tile.addEventListener('click', function () {
      close();
      // Same entry point the browse grid uses: handing over the whole game
      // object is what makes the visor fetch the game's HTML and run it from a
      // blob URL (the CDN serves .html as text/plain).
      if (window.gameVisor && typeof window.gameVisor.open === 'function') {
        window.gameVisor.open(game.url, game.name || 'Game', game);
      }
    });

    return tile;
  }

  function init() {
    var term = consumeFlag();
    if (term === null) return;

    var overlay = document.getElementById('notFoundOverlay');
    // Fail safe: never leave a stray param in the URL if the markup is missing.
    if (!overlay) {
      stripParam();
      return;
    }

    var okBtn = document.getElementById('notFoundOk');

    function close() {
      overlay.classList.remove('open');
      overlay.setAttribute('aria-hidden', 'true');
      document.removeEventListener('keydown', onKey);
    }

    function onKey(e) {
      if (e.key === 'Escape') close();
    }

    if (okBtn) okBtn.addEventListener('click', close);
    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) close();
    });
    document.addEventListener('keydown', onKey);

    renderSuggestion(term, close);

    stripParam();
    overlay.classList.add('open');
    overlay.setAttribute('aria-hidden', 'false');
    setTimeout(function () { if (okBtn) okBtn.focus(); }, 80);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
