/**
 * siennadb.js — Account / Login System (cloud backend removed)
 *
 * Extracted from night.js and sienna.js for better organization.
 * Provides the account object (window.siennaAccount) and the login modal logic.
 *
 * NOTE: The cloud-sync backend (auth + /data/backup API calls, request
 * timeouts, and login rate-limiting) has been removed. Login/register and
 * cloud save/restore are now silent no-op stubs, so the UI stays functional
 * without ever contacting a server.
 */

(function () {
  'use strict';

  // NOTE: The cloud backend is gone, so there is no API request to time out
  // and no login/register endpoint to rate-limit client-side. The constants
  // that used to live here (FETCH_TIMEOUT_MS / MAX_FREE_ATTEMPTS /
  // BASE_COOLDOWN_MS) were removed along with the networking code.

  const account = {
    token: null,
    username: null,
    activeLoginTab: 'login',
    _lastSyncAt: 0,

    // ── Sync status ──

    _updateSyncStatus() {
      return window.siennaSave.updateSyncStatus();
    },

    _formatSyncStatus() {
      return window.siennaSave.formatSyncStatus();
    },

    _stopAutoSync() {
      return window.siennaSave.stopAutoSync();
    },

    // ── Networking helpers removed (the cloud API is gone) ──

    // ── Session management ──

    /** Load saved session from localStorage */
    loadSession() {
      try {
        this.token = localStorage.getItem(window.siennaSave.TOKEN_KEY);
        this.username = localStorage.getItem(window.siennaSave.USERNAME_KEY);
        this._lastSyncAt = Number(localStorage.getItem(window.siennaSave.LAST_SYNC_KEY) || 0) || 0;
      } catch (e) {
        this.token = null;
        this.username = null;
        this._lastSyncAt = 0;
      }
    },

    /** Save session to localStorage */
    saveSession(token, username) {
      this.token = token;
      this.username = username;
      try {
        localStorage.setItem(window.siennaSave.USERNAME_KEY, username);
        localStorage.setItem(window.siennaSave.TOKEN_KEY, token);
      } catch (e) { /* ignore */ }
    },

    /** Clear session */
    clearSession() {
      this.token = null;
      this.username = null;
      try {
        localStorage.removeItem(window.siennaSave.TOKEN_KEY);
        localStorage.removeItem(window.siennaSave.USERNAME_KEY);
        localStorage.removeItem(window.siennaSave.LAST_SYNC_KEY);
        localStorage.removeItem(window.siennaSave.LAST_SYNC_HASH_KEY);
      } catch (e) { /* ignore */ }
      this._lastSyncAt = 0;
    },

    /** Check if user is logged in */
    isLoggedIn() {
      return !!this.token && !!this.username;
    },

    // ── Avatar ──

    _avatarPalette: [
      '#ef4444', '#f97316', '#f59e0b', '#84cc16', '#22c55e',
      '#10b981', '#14b8a6', '#06b6d4', '#3b82f6', '#6366f1',
      '#8b5cf6', '#a855f7', '#d946ef', '#ec4899', '#f43f5e',
    ],

    /** Deterministic color for a given username — same user always gets the same color */
    _avatarColor(name) {
      const str = String(name || '');
      let hash = 0;
      for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
        hash |= 0;
      }
      const idx = Math.abs(hash) % this._avatarPalette.length;
      return this._avatarPalette[idx];
    },

    // ── UI updates ──

    /** Update the account button UI (avatar-based) */
    updateUI() {
      const avatarImg = document.getElementById('accountAvatarImg');
      const avatarLetter = document.getElementById('accountAvatarLetter');
      const dropdown = document.getElementById('accountDropdown');
      if (!avatarImg || !avatarLetter) return;

      if (this.isLoggedIn()) {
        // Show generated avatar (first letter + pastel color)
        const initial = (this.username || '?').charAt(0).toUpperCase();
        const color = this._avatarColor(this.username || '');
        avatarImg.style.display = 'none';
        avatarLetter.style.display = 'flex';
        avatarLetter.textContent = initial;
        avatarLetter.style.background = color;
        if (dropdown) dropdown.classList.remove('open');
      } else {
        // Show logo.webp
        avatarImg.style.display = 'block';
        avatarImg.src = 'logo.webp';
        avatarLetter.style.display = 'none';
        if (dropdown) dropdown.classList.remove('open');
      }
      this._updateSyncStatus();
    },

    // ── Login modal ──

    _bindCloudSaveNotice() {
      if (this._cloudSaveNoticeBound) return;
      const overlay = document.getElementById('cloudSaveNoticeOverlay');
      if (!overlay) return;
      const close = () => this.hideLoginModal();
      document.getElementById('cloudSaveNoticeOk')?.addEventListener('click', close);
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) close();
      });
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && overlay.classList.contains('open')) close();
      });
      this._cloudSaveNoticeBound = true;
    },

    _showCloudSaveNotice() {
      const overlay = document.getElementById('cloudSaveNoticeOverlay');
      if (!overlay) return;
      this._bindCloudSaveNotice();
      overlay.classList.add('open');
      overlay.setAttribute('aria-hidden', 'false');
      setTimeout(() => document.getElementById('cloudSaveNoticeOk')?.focus(), 80);
    },

    _hideCloudSaveNotice() {
      const overlay = document.getElementById('cloudSaveNoticeOverlay');
      if (!overlay) return;
      overlay.classList.remove('open');
      overlay.setAttribute('aria-hidden', 'true');
    },

    /** Show the login modal */
    showLoginModal() {
      const overlay = document.getElementById('loginModalOverlay');
      if (!overlay) return;
      overlay.classList.add('open');
      document.getElementById('loginModalUsername').value = '';
      document.getElementById('loginModalPassword').value = '';
      document.getElementById('loginModalError').classList.remove('visible');
      document.getElementById('loginModalError').textContent = '';
      this.activeLoginTab = 'login';
      this._switchTab('login');
      document.getElementById('loginModalUsername').focus();
      this._showCloudSaveNotice();
    },

    /** Hide the login modal */
    hideLoginModal() {
      const overlay = document.getElementById('loginModalOverlay');
      if (overlay) overlay.classList.remove('open');
      this._hideCloudSaveNotice();
    },

    /** Switch between login/register tabs */
    _switchTab(tab) {
      const title = document.getElementById('loginModalTitle');
      const submit = document.getElementById('loginModalSubmit');
      const switchText = document.getElementById('loginModalSwitchText');
      const switchBtn = document.getElementById('loginModalSwitchBtn');
      const usernameCriteria = document.getElementById('loginModalUsernameCriteria');
      const passwordCriteria = document.getElementById('loginModalPasswordCriteria');
      if (tab === 'login') {
        title.textContent = 'Log In';
        submit.textContent = 'Log In';
        if (switchText) switchText.textContent = "Don't have an account?";
        if (usernameCriteria) usernameCriteria.classList.add('hidden');
        if (passwordCriteria) passwordCriteria.classList.add('hidden');
        if (switchBtn) {
          switchBtn.textContent = 'Sign up';
          switchBtn.dataset.loginTab = 'register';
        }
        const usernameInput = document.getElementById('loginModalUsername');
        const passwordInput = document.getElementById('loginModalPassword');
        if (usernameInput) usernameInput.placeholder = 'enter username';
        if (passwordInput) passwordInput.placeholder = 'enter password';
      } else {
        title.textContent = 'Sign up';
        submit.textContent = 'Sign up';
        if (switchText) switchText.textContent = 'Already have an account?';
        if (usernameCriteria) usernameCriteria.classList.remove('hidden');
        if (passwordCriteria) passwordCriteria.classList.remove('hidden');
        if (switchBtn) {
          switchBtn.textContent = 'Log in!';
          switchBtn.dataset.loginTab = 'login';
        }
        const usernameInput = document.getElementById('loginModalUsername');
        const passwordInput = document.getElementById('loginModalPassword');
        if (usernameInput) usernameInput.placeholder = 'create username';
        if (passwordInput) passwordInput.placeholder = 'create password';
      }
      this.activeLoginTab = tab;
      this._updateRegisterCriteria();
    },

    /** Get the active login mode ('login' or 'register') */
    _getActiveTab() {
      return this.activeLoginTab || 'login';
    },

    /** Update register criteria display and submit state */
    _updateRegisterCriteria() {
      const username = document.getElementById('loginModalUsername')?.value.trim() || '';
      const password = document.getElementById('loginModalPassword')?.value || '';
      const criteria = {
        usernameLength: username.length >= 3 && username.length <= 20,
        usernamePattern: /^[a-zA-Z0-9]+$/.test(username),
        passwordLength: password.length >= 8,
      };

      Object.entries(criteria).forEach(([key, valid]) => {
        const item = document.querySelector(`[data-criteria-key="${key}"]`);
        if (!item) return;
        item.classList.toggle('valid', valid);
        item.classList.toggle('invalid', !valid);
      });

      const submitBtn = document.getElementById('loginModalSubmit');
      if (!submitBtn) return;
      if (this._getActiveTab() === 'register') {
        submitBtn.disabled = !Object.values(criteria).every(Boolean);
      } else {
        submitBtn.disabled = !username || !password;
      }
    },

    /** Show error in login modal */
    _shakeModal() {
      const modal = document.querySelector('.login-modal');
      if (!modal) return;
      modal.classList.add('shake');
      setTimeout(() => modal.classList.remove('shake'), 500);
    },

    _showError(msg) {
      const el = document.getElementById('loginModalError');
      if (!el) return;
      el.textContent = msg;
      el.classList.add('visible');
      this._shakeModal();
    },

    /** Attempt login or register — no-op (cloud backend removed). */
    async submit() {
      // The auth API has been removed, so there is nothing to submit to.
      // Kept as a silent stub so the login modal's listeners stay valid.
    },

    /** Log out */
    logout() {
      this.clearSession();
      this.updateUI();
      const dropdown = document.getElementById('accountDropdown');
      if (dropdown) dropdown.classList.remove('open');
    },

    // ── Cloud save / restore (backend removed — no-op stubs in siennaSave) ──

    async saveToCloud() {
      return window.siennaSave.saveToCloud();
    },

    async restoreFromCloud(options) {
      return window.siennaSave.restoreFromCloud(options);
    },

    async _autoRestore(options) {
      return window.siennaSave.autoRestore(options);
    },

    // ── Initialization ──

    /** Initialize the account system */
    init() {
      this.loadSession();
      this.updateUI();

      // Cloud restore on login has been removed along with the backend.

      // Account button and dropdown are now handled by sienna.js's _setupAccountDropdown()

      // Login modal
      const modalOverlay = document.getElementById('loginModalOverlay');
      const cancelBtn = document.getElementById('loginModalCancel');
      const submitBtn = document.getElementById('loginModalSubmit');
      const usernameInput = document.getElementById('loginModalUsername');
      const passwordInput = document.getElementById('loginModalPassword');
      const switchBtn = document.getElementById('loginModalSwitchBtn');

      cancelBtn?.addEventListener('click', () => this.hideLoginModal());
      submitBtn?.addEventListener('click', () => this.submit());
      modalOverlay?.addEventListener('click', (e) => {
        if (e.target === modalOverlay) this.hideLoginModal();
      });

      switchBtn?.addEventListener('click', () => {
        const target = switchBtn.dataset.loginTab || 'register';
        this._switchTab(target);
      });

      usernameInput?.addEventListener('input', () => this._updateRegisterCriteria());
      passwordInput?.addEventListener('input', () => this._updateRegisterCriteria());

      usernameInput?.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') passwordInput?.focus();
      });
      passwordInput?.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') this.submit();
      });
    },
  };

  // Expose globally
  window.siennaAccount = account;
})();
