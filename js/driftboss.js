/**
 * Drift Boss Hack Plugin
 * - Every change saves immediately to localStorage
 * - ON/OFF buttons for tutorial flags
 * - No staging, no Apply All, no Refresh badge
 */

(function () {
  'use strict';

  const STORAGE_KEY = 'mjs-drift-boss-game-v1.0.1-dailyreward';

  let panelElement = null;
  let isDragging = false;
  let dragOffsetX = 0, dragOffsetY = 0;

  const CAR_NAMES = {
    0: 'Green Car',
    1: 'Yellow Pickup',
    2: 'Yellow Taxi',
    3: 'Police Car',
    4: 'Blue Van',
    5: 'Ice Cream Truck',
    6: 'Ambulance',
    7: 'Fire Truck'
  };

  const DEFAULT_DATA = {
    sound: 0.7,
    music: 0.3,
    score: 0,
    hasShownTutorial: true,
    collectedCoin: 0,
    cars: [0],
    currentCar: 0,
    currentTip: 1,
    booster1: 1,
    booster2: 1,
    booster3: 1,
    ko: 0,
    hasShownBoosterTutorial: false
  };

  // Single source of truth — no pending/staged state
  let currentData = {};

  // ========== DATA HELPERS ==========
  function loadGameData() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return { ...DEFAULT_DATA };
      return JSON.parse(raw);
    } catch (e) {
      console.error('[DriftBoss] Load error:', e);
      return { ...DEFAULT_DATA };
    }
  }

  function saveGameData(data) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      return true;
    } catch (e) {
      console.error('[DriftBoss] Save error:', e);
      return false;
    }
  }

  // Apply a single key/value change immediately
  function applyChange(key, value) {
    currentData[key] = value;
    if (!saveGameData(currentData)) {
      showToast('Failed to save', true);
    }
    if (key === 'currentCar') updateCarHighlights();
    if (key === 'hasShownTutorial' || key === 'hasShownBoosterTutorial') updateTutorialButtons();
  }

  function resetToDefault() {
    localStorage.removeItem(STORAGE_KEY);
    currentData = { ...DEFAULT_DATA };
    updateAllUI();
    showToast('Reset to default.', false);
  }

  // ========== UI UPDATERS ==========
  function updateCarHighlights() {
    const btns = document.querySelectorAll('#db-hack-panel [data-car]');
    btns.forEach(btn => {
      const val = parseInt(btn.dataset.car);
      if (val === currentData.currentCar) {
        btn.style.background = '#111111';
        btn.style.borderColor = '#ffffff';
        btn.style.color = '#ffffff';
      } else {
        btn.style.background = '#000000';
        btn.style.borderColor = '#1c1c1c';
        btn.style.color = '#cccccc';
      }
    });
  }

  function updateTutorialButtons() {
    const tutBtn = document.getElementById('db-tut-btn');
    const btutBtn = document.getElementById('db-btut-btn');

    function styleBtn(btn, isOn) {
      if (!btn) return;
      btn.textContent = isOn ? 'ON' : 'OFF';
      btn.style.background = isOn ? '#ffffff' : '#000000';
      btn.style.color = isOn ? '#000000' : '#555555';
      btn.style.borderColor = isOn ? '#ffffff' : '#1c1c1c';
    }

    styleBtn(tutBtn, !currentData.hasShownTutorial);
    styleBtn(btutBtn, !currentData.hasShownBoosterTutorial);
  }

  function updateAllUI() {
    updateCarHighlights();
    updateTutorialButtons();
    const coinsInput = document.querySelector('#db-coins');
    if (coinsInput) coinsInput.value = currentData.collectedCoin;
    const scoreInput = document.querySelector('#db-score');
    if (scoreInput) scoreInput.value = currentData.score;
    const b1 = document.querySelector('#db-b1');
    if (b1) b1.value = currentData.booster1;
    const b2 = document.querySelector('#db-b2');
    if (b2) b2.value = currentData.booster2;
    const b3 = document.querySelector('#db-b3');
    if (b3) b3.value = currentData.booster3;
  }

  function showToast(msg, isError = false) {
    const toast = document.createElement('div');
    toast.textContent = msg;
    Object.assign(toast.style, {
      position: 'fixed', bottom: '20px', left: '50%', transform: 'translateX(-50%)',
      background: '#050505',
      border: `1px solid ${isError ? '#2a1515' : '#1c1c1c'}`,
      borderRadius: '20px', padding: '7px 16px',
      fontSize: '12px',
      color: isError ? '#f87171' : '#4ade80',
      zIndex: '10001',
      fontFamily: "'Inter', system-ui, sans-serif",
      letterSpacing: '0.02em'
    });
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 1800);
  }

  // ========== CREATE PANEL ==========
  function createPanel() {
    removePanel();
    currentData = loadGameData();

    const panel = document.createElement('div');
    panel.id = 'db-hack-panel';
    Object.assign(panel.style, {
      position: 'fixed', bottom: '20px', right: '20px', width: '380px',
      maxWidth: 'calc(100vw - 40px)',
      background: '#050505',
      borderRadius: '10px',
      border: '1px solid #1c1c1c',
      boxShadow: '0 20px 60px rgba(0,0,0,0.9), 0 0 0 0.5px rgba(255,255,255,0.04)',
      zIndex: '10000',
      fontFamily: "'Inter', system-ui, sans-serif",
      overflow: 'hidden'
    });

    // Header
    const header = document.createElement('div');
    Object.assign(header.style, {
      padding: '11px 16px',
      background: '#000000',
      borderBottom: '1px solid #161616',
      display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'grab'
    });

    const titleSpan = document.createElement('span');
    titleSpan.style.fontWeight = '500';
    titleSpan.style.fontSize = '13px';
    titleSpan.style.letterSpacing = '0.02em';
    titleSpan.style.color = '#ffffff';
    titleSpan.textContent = 'Drift Boss Hacks';

    const closeBtn = document.createElement('button');
    closeBtn.textContent = '✕';
    Object.assign(closeBtn.style, {
      background: 'transparent', border: 'none',
      color: '#777777', fontSize: '15px', cursor: 'pointer',
      width: '26px', height: '26px', borderRadius: '4px',
      display: 'flex', alignItems: 'center', justifyContent: 'center'
    });
    closeBtn.onclick = removePanel;

    header.appendChild(titleSpan);
    header.appendChild(closeBtn);
    panel.appendChild(header);

    // Content
    const content = document.createElement('div');
    Object.assign(content.style, { padding: '16px', cursor: 'auto' });

    // ----- Car selection -----
    const carSection = document.createElement('div');
    carSection.style.marginBottom = '18px';
    carSection.innerHTML = `<div style="font-size: 10px; color: #666666; margin-bottom: 8px; letter-spacing: 0.6px; font-weight: 500; text-transform: uppercase;">Select Car</div>`;
    const carGrid = document.createElement('div');
    Object.assign(carGrid.style, { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '6px' });

    for (let i = 0; i <= 7; i++) {
      const btn = document.createElement('button');
      btn.textContent = CAR_NAMES[i];
      btn.dataset.car = i;
      Object.assign(btn.style, {
        background: '#000000', border: '1px solid #1c1c1c',
        borderRadius: '6px', padding: '7px 0',
        color: '#cccccc', fontSize: '12px', cursor: 'pointer',
        letterSpacing: '0.02em'
      });
      btn.onclick = (function(carId) {
        return function() {
          applyChange('currentCar', carId);
          showToast(`${CAR_NAMES[carId]} selected`);
        };
      })(i);
      carGrid.appendChild(btn);
    }
    carSection.appendChild(carGrid);
    content.appendChild(carSection);

    // Coins
    const coinsDiv = document.createElement('div');
    coinsDiv.style.marginBottom = '12px';
    coinsDiv.innerHTML = `
      <div style="font-size: 10px; color: #666666; margin-bottom: 5px; letter-spacing: 0.6px; font-weight: 500; text-transform: uppercase;">Coins</div>
      <input id="db-coins" type="number" value="${currentData.collectedCoin || 0}" style="width:100%; background:#000000; border:1px solid #1c1c1c; border-radius:6px; padding:9px 12px; color:#fff; font-size:13px; box-sizing:border-box; font-family:'SF Mono','Fira Code','Cascadia Code',ui-monospace,monospace; outline:none;">
    `;
    content.appendChild(coinsDiv);

    // Score
    const scoreDiv = document.createElement('div');
    scoreDiv.style.marginBottom = '18px';
    scoreDiv.innerHTML = `
      <div style="font-size: 10px; color: #666666; margin-bottom: 5px; letter-spacing: 0.6px; font-weight: 500; text-transform: uppercase;">Score</div>
      <input id="db-score" type="number" value="${currentData.score || 0}" style="width:100%; background:#000000; border:1px solid #1c1c1c; border-radius:6px; padding:9px 12px; color:#fff; font-size:13px; box-sizing:border-box; font-family:'SF Mono','Fira Code','Cascadia Code',ui-monospace,monospace; outline:none;">
    `;
    content.appendChild(scoreDiv);

    // Boosters
    const boosterSection = document.createElement('div');
    boosterSection.style.marginBottom = '18px';
    boosterSection.innerHTML = `<div style="font-size: 10px; color: #666666; margin-bottom: 8px; letter-spacing: 0.6px; font-weight: 500; text-transform: uppercase;">Boosters</div>`;
    const boosterGrid = document.createElement('div');
    Object.assign(boosterGrid.style, { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' });

    const boosters = [
      { key: 'booster1', label: 'Double Score', val: currentData.booster1 || 1 },
      { key: 'booster2', label: 'Car Insurance', val: currentData.booster2 || 1 },
      { key: 'booster3', label: 'Coin Rush', val: currentData.booster3 || 1 }
    ];
    boosters.forEach((b, idx) => {
      const card = document.createElement('div');
      card.style.background = '#000000';
      card.style.border = '1px solid #1c1c1c';
      card.style.borderRadius = '8px';
      card.style.padding = '9px 8px';
      card.innerHTML = `
        <div style="font-size: 10px; font-weight: 500; color: #888888; margin-bottom: 7px; letter-spacing: 0.02em;">${b.label}</div>
        <input id="db-b${idx+1}" type="number" value="${b.val}" style="width:100%; background:#000000; border:1px solid #1c1c1c; border-radius:5px; padding:5px 7px; color:#fff; font-size:12px; box-sizing:border-box; font-family:'SF Mono','Fira Code','Cascadia Code',ui-monospace,monospace; outline:none;">
      `;
      boosterGrid.appendChild(card);
    });
    boosterSection.appendChild(boosterGrid);
    content.appendChild(boosterSection);

    // Tutorial flags — ON/OFF buttons
    const tutorialDiv = document.createElement('div');
    tutorialDiv.style.marginBottom = '18px';
    tutorialDiv.style.borderTop = '1px solid #161616';
    tutorialDiv.style.paddingTop = '16px';

    const tutLabel = document.createElement('div');
    tutLabel.style.cssText = 'font-size:10px; color:#666666; margin-bottom:12px; letter-spacing:0.6px; font-weight:500; text-transform:uppercase;';
    tutLabel.textContent = 'Tutorial Flags';
    tutorialDiv.appendChild(tutLabel);

    function makeTutorialRow(labelText, btnId, isOn) {
      const row = document.createElement('div');
      row.style.cssText = 'display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;';

      const label = document.createElement('span');
      label.style.cssText = 'font-size:12px; color:#cccccc;';
      label.textContent = labelText;

      const btn = document.createElement('button');
      btn.id = btnId;
      btn.textContent = isOn ? 'ON' : 'OFF';
      Object.assign(btn.style, {
        background: isOn ? '#ffffff' : '#000000',
        color: isOn ? '#000000' : '#555555',
        border: `1px solid ${isOn ? '#ffffff' : '#1c1c1c'}`,
        borderRadius: '5px',
        padding: '3px 12px',
        fontSize: '11px',
        fontWeight: '600',
        letterSpacing: '0.05em',
        cursor: 'pointer',
        minWidth: '44px'
      });

      row.appendChild(label);
      row.appendChild(btn);
      return row;
    }

    tutorialDiv.appendChild(makeTutorialRow('Show Tutorial', 'db-tut-btn', !currentData.hasShownTutorial));
    tutorialDiv.appendChild(makeTutorialRow('Booster Tutorial', 'db-btut-btn', !currentData.hasShownBoosterTutorial));
    content.appendChild(tutorialDiv);

    // Reset button
    const resetBtn = document.createElement('button');
    resetBtn.textContent = 'Reset All to Default';
    Object.assign(resetBtn.style, {
      width: '100%', marginTop: '4px', marginBottom: '6px',
      background: 'transparent',
      border: '1px solid #3d2020',
      borderRadius: '6px',
      padding: '9px 0',
      color: '#cc5555',
      fontWeight: '500',
      fontSize: '12px', cursor: 'pointer',
      letterSpacing: '0.03em'
    });
    resetBtn.onclick = resetToDefault;
    content.appendChild(resetBtn);

    // Footer
    const footer = document.createElement('div');
    Object.assign(footer.style, {
      padding: '10px 16px',
      fontSize: '9px',
      color: '#555555',
      borderTop: '1px solid #161616',
      textAlign: 'center',
      letterSpacing: '0.4px'
    });
    footer.textContent = 'Drift Boss Hacks | provided by yellowdevelopment';

    panel.appendChild(content);
    panel.appendChild(footer);
    document.body.appendChild(panel);
    panelElement = panel;

    // ========== BIND EVENT HANDLERS ==========
    const coinsInput = document.querySelector('#db-coins');
    coinsInput?.addEventListener('input', () => {
      let val = parseInt(coinsInput.value, 10);
      if (isNaN(val)) val = 0;
      applyChange('collectedCoin', val);
    });

    const scoreInput = document.querySelector('#db-score');
    scoreInput?.addEventListener('input', () => {
      let val = parseInt(scoreInput.value, 10);
      if (isNaN(val)) val = 0;
      applyChange('score', val);
    });

    for (let i = 1; i <= 3; i++) {
      const inp = document.querySelector(`#db-b${i}`);
      const key = `booster${i}`;
      inp?.addEventListener('input', () => {
        let val = parseInt(inp.value, 10);
        if (isNaN(val)) val = 1;
        if (val < 0) val = 0;
        applyChange(key, val);
      });
    }

    const tutBtn = document.getElementById('db-tut-btn');
    const btutBtn = document.getElementById('db-btut-btn');
    tutBtn?.addEventListener('click', () => {
      applyChange('hasShownTutorial', !currentData.hasShownTutorial);
    });
    btutBtn?.addEventListener('click', () => {
      applyChange('hasShownBoosterTutorial', !currentData.hasShownBoosterTutorial);
    });

    // Initial UI sync
    updateCarHighlights();
    updateTutorialButtons();

    // ========== DRAG FUNCTIONALITY ==========
    header.addEventListener('mousedown', (e) => {
      if (e.target === closeBtn) return;
      isDragging = true;
      const rect = panel.getBoundingClientRect();
      dragOffsetX = e.clientX - rect.left;
      dragOffsetY = e.clientY - rect.top;
      panel.style.cursor = 'grabbing';
      e.preventDefault();
    });
    window.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      let left = e.clientX - dragOffsetX;
      let top = e.clientY - dragOffsetY;
      left = Math.min(window.innerWidth - panel.offsetWidth - 10, Math.max(10, left));
      top = Math.min(window.innerHeight - panel.offsetHeight - 10, Math.max(10, top));
      panel.style.left = left + 'px';
      panel.style.top = top + 'px';
      panel.style.bottom = 'auto';
      panel.style.right = 'auto';
    });
    window.addEventListener('mouseup', () => {
      if (isDragging) {
        isDragging = false;
        panel.style.cursor = 'grab';
      }
    });
  }

  function removePanel() {
    if (panelElement) {
      panelElement.remove();
      panelElement = null;
    }
  }

  // ========== SIENNA PLUGIN REGISTRATION ==========
  function waitForSienna() {
    if (!window.SiennaPlugins) {
      setTimeout(waitForSienna, 100);
      return;
    }
    window.SiennaPlugins.register({
      name: 'Drift Boss Hack',
      id: 'drift-boss-hack',
      description: 'Drift Boss hack menu for coins, score, cars, and boosts',
      version: '1',
      onEnable() { createPanel(); },
      onDisable() { removePanel(); },
      onSettings() { if (!panelElement) createPanel(); }
    });
  }
  waitForSienna();
})();