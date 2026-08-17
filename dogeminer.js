(function () {
    'use strict';
  
    let panelElement = null;
    let isDragging = false;
    let dragOffsetX = 0, dragOffsetY = 0;
    let currentSaveData = null;
    let activeLevel = 'level1';
  
    function waitForSienna() {
      if (!window.SiennaPlugins) {
        setTimeout(waitForSienna, 100);
        return;
      }
      registerPlugin();
    }
    waitForSienna();
  
    // ---------- Encoding/Decoding ----------
    function decodeSave(str) {
      try {
        // Doge Miner uses standard Base64 encoding for its saves
        const binary = atob(str);
        const bytes = Uint8Array.from(binary, c => c.charCodeAt(0));
        const jsonStr = new TextDecoder().decode(bytes);
        return JSON.parse(jsonStr);
      } catch (e) {
        return null;
      }
    }
  
    function encodeSave(obj) {
      try {
        const jsonStr = JSON.stringify(obj);
        const bytes = new TextEncoder().encode(jsonStr);
        let binary = '';
        bytes.forEach(b => binary += String.fromCharCode(b));
        return btoa(binary);
      } catch (e) {
        return null;
      }
    }
  
    // ---------- Toast Notification ----------
    function showToast(message, isSuccess = true) {
      const t = document.createElement('div');
      t.textContent = message;
      Object.assign(t.style, {
        position: 'fixed', bottom: '20px', left: '50%', transform: 'translateX(-50%)',
        background: '#050505',
        border: `1px solid ${isSuccess ? '#1c1c1c' : '#2a1515'}`,
        borderRadius: '20px',
        padding: '7px 16px',
        fontSize: '12px',
        color: isSuccess ? '#4ade80' : '#f87171',
        zIndex: '10001',
        fontFamily: "'Inter', system-ui, sans-serif",
        letterSpacing: '0.02em'
      });
      document.body.appendChild(t);
      setTimeout(() => t.remove(), 2500);
    }
  
    // ---------- UI Rendering ----------
    function createPanel() {
      removePanel();
  
      const panel = document.createElement('div');
      panel.id = 'dm-editor-panel';
      Object.assign(panel.style, {
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        width: '360px',
        maxWidth: 'calc(100vw - 40px)',
        background: '#050505',
        borderRadius: '10px',
        border: '1px solid #1c1c1c',
        boxShadow: '0 20px 60px rgba(0,0,0,0.9), 0 0 0 0.5px rgba(255,255,255,0.04)',
        zIndex: '10000',
        fontFamily: "'Inter', system-ui, sans-serif",
        cursor: 'grab',
        overflow: 'hidden'
      });
  
      // Header
      const header = document.createElement('div');
      Object.assign(header.style, {
        padding: '11px 16px',
        background: '#000000',
        borderBottom: '1px solid #161616',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        cursor: 'grab'
      });
  
      const headerLeft = document.createElement('div');
      headerLeft.className = 'dm-header-left';
      headerLeft.style.display = 'flex';
      headerLeft.style.alignItems = 'center';
      headerLeft.style.gap = '8px';
      headerLeft.innerHTML = `<span style="font-weight: 500; font-size: 13px; letter-spacing: 0.02em; color: #ffffff;">Doge Miner Save Editor</span>`;
  
      const closeBtn = document.createElement('button');
      closeBtn.textContent = '✕';
      Object.assign(closeBtn.style, {
        background: 'transparent', border: 'none', color: '#777777',
        fontSize: '15px', cursor: 'pointer', width: '26px', height: '26px',
        borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center'
      });
  
      header.appendChild(headerLeft);
      header.appendChild(closeBtn);
      panel.appendChild(header);
  
      // Content Area
      const content = document.createElement('div');
      Object.assign(content.style, {
        padding: '16px', cursor: 'auto', maxHeight: '450px', overflowY: 'auto'
      });
  
      panel.appendChild(content);
      document.body.appendChild(panel);
      panelElement = panel;
  
      // Initialize view
      renderImportView(content);
  
      // Event Listeners
      closeBtn.onclick = removePanel;
  
      // Dragging logic
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
      currentSaveData = null;
    }
  
    // ---------- View 1: Import Save ----------
    function renderImportView(container) {
      container.innerHTML = `
        <div style="margin-bottom: 14px; padding: 14px 0; border-bottom: 1px solid #161616;">
          <div style="font-size: 10px; color: #666666; letter-spacing: 0.8px; margin-bottom: 8px; font-weight: 500; text-transform: uppercase;">Instructions</div>
          <div style="font-size: 12px; color: #cccccc; line-height: 1.5;">
            1. Go to Doge Miner Settings.<br>
            2. Click "Export Save".<br>
            3. Paste the encrypted code below.
          </div>
        </div>
        
        <div style="margin-bottom: 10px;">
          <textarea id="dm-import-area" placeholder="Paste save code here..." style="
            width: 100%;
            height: 80px;
            background: #000000;
            border: 1px solid #1c1c1c;
            border-radius: 6px;
            padding: 10px 12px;
            color: #fff;
            font-size: 11px;
            outline: none;
            resize: none;
            box-sizing: border-box;
            font-family: 'SF Mono', 'Fira Code', 'Cascadia Code', ui-monospace, monospace;
          "></textarea>
        </div>
  
        <button id="dm-load-btn" style="
          width: 100%;
          background: #ffffff;
          border: 1px solid #ffffff;
          border-radius: 6px;
          padding: 10px 0;
          color: #000000;
          font-weight: 600;
          font-size: 13px;
          cursor: pointer;
          letter-spacing: 0.02em;
        ">Decode & Edit</button>
      `;
  
      container.querySelector('#dm-load-btn').onclick = () => {
        const code = container.querySelector('#dm-import-area').value.trim();
        if (!code) return showToast('✗ Please paste a save code', false);
        
        const decoded = decodeSave(code);
        if (decoded && decoded.level1) {
          currentSaveData = decoded;
          showToast('✓ Save loaded successfully');
          renderEditView(container);
        } else {
          showToast('✗ Invalid save code', false);
        }
      };
    }
  
    // ---------- View 2: Edit Stats ----------
    function renderEditView(container) {
      container.innerHTML = ''; // Clear import view
  
      // Level Selector
      const levelRow = document.createElement('div');
      Object.assign(levelRow.style, { marginBottom: '14px', display: 'flex', gap: '6px' });
      
      ['level1', 'level2', 'level3'].forEach(lvl => {
        const btn = document.createElement('button');
        btn.textContent = lvl.replace('level', 'Level ');
        btn.dataset.level = lvl;
        Object.assign(btn.style, {
          flex: '1', background: activeLevel === lvl ? '#ffffff' : '#000000',
          border: `1px solid ${activeLevel === lvl ? '#ffffff' : '#1c1c1c'}`,
          borderRadius: '6px', padding: '8px 0',
          color: activeLevel === lvl ? '#000000' : '#cccccc',
          fontSize: '11px', cursor: 'pointer', fontWeight: '500'
        });
        btn.onclick = () => {
          activeLevel = lvl;
          renderEditView(container);
        };
        levelRow.appendChild(btn);
      });
      container.appendChild(levelRow);
  
      // Balance Display
      const currentCoins = currentSaveData[activeLevel].coins || 0;
      const balanceDiv = document.createElement('div');
      Object.assign(balanceDiv.style, {
        marginBottom: '14px', padding: '14px 0', borderBottom: '1px solid #161616'
      });
      balanceDiv.innerHTML = `
        <div style="font-size: 10px; color: #666666; letter-spacing: 0.8px; margin-bottom: 8px; font-weight: 500; text-transform: uppercase;">Balance (${activeLevel})</div>
        <div id="dm-balance" style="font-size: 36px; font-weight: 300; color: #ffffff; line-height: 1; font-family: 'SF Mono', 'Fira Code', 'Cascadia Code', ui-monospace, monospace; letter-spacing: -0.5px;">${currentCoins.toLocaleString()}</div>
      `;
      container.appendChild(balanceDiv);
  
      // Inputs
      const fields = [
        { key: 'coins', label: 'Coins' },
        { key: 'alltimecoins', label: 'All Time Coins' },
        { key: 'clicks', label: 'Clicks' },
        { key: 'shibes', label: 'Shibes (Doge Count)' },
        { key: 'kennels', label: 'Kennels' },
        { key: 'kittens', label: 'Kittens' },
        { key: 'rockets', label: 'Rockets' },
        { key: 'rigs', label: 'Mining Rigs' },
        { key: 'bases', label: 'Moon Bases' }
      ];
  
      fields.forEach(field => {
        const val = currentSaveData[activeLevel][field.key] !== undefined ? currentSaveData[activeLevel][field.key] : 0;
        const inputRow = document.createElement('div');
        Object.assign(inputRow.style, { marginBottom: '10px', display: 'flex', gap: '8px' });
        
        inputRow.innerHTML = `
          <input id="dm-input-${field.key}" type="number" min="0" value="${val}" style="
            flex: 1;
            background: #000000;
            border: 1px solid #1c1c1c;
            border-radius: 6px;
            padding: 10px 12px;
            color: #fff;
            font-size: 14px;
            outline: none;
            font-family: 'SF Mono', 'Fira Code', 'Cascadia Code', ui-monospace, monospace;
          ">
          <button class="dm-set-btn" data-key="${field.key}" style="
            background: #ffffff;
            border: 1px solid #ffffff;
            border-radius: 6px;
            padding: 0 20px;
            color: #000000;
            font-weight: 600;
            font-size: 13px;
            cursor: pointer;
            letter-spacing: 0.02em;
          ">Set</button>
        `;
        
        // Label
        const labelDiv = document.createElement('div');
        labelDiv.style.cssText = 'font-size: 10px; color: #666; margin-bottom: 4px; text-transform: uppercase; letter-spacing: 0.5px;';
        labelDiv.textContent = field.label;
        
        inputRow.insertBefore(labelDiv, inputRow.firstChild);
        container.appendChild(inputRow);
      });
  
      // Quick Buttons
      const quickRow = document.createElement('div');
      Object.assign(quickRow.style, { marginBottom: '14px', display: 'flex', gap: '6px' });
      const increments = [1000, 10000, 100000, 1000000];
      quickRow.innerHTML = increments.map(v => `
        <button class="dm-quick" data-val="${v}" style="
          flex: 1;
          background: #000000;
          border: 1px solid #1c1c1c;
          border-radius: 6px;
          padding: 9px 0;
          color: #cccccc;
          font-size: 11px;
          cursor: pointer;
          font-weight: 500;
          letter-spacing: 0.03em;
        ">+${v >= 1000000 ? (v/1000000)+'M' : (v/1000)+'k'}</button>
      `).join('');
      container.appendChild(quickRow);
  
      // Export Button
      const exportRow = document.createElement('div');
      exportRow.style.marginTop = '14px';
      exportRow.innerHTML = `
        <button id="dm-export-btn" style="
          width: 100%;
          background: transparent;
          border: 1px solid #1c1c1c;
          border-radius: 6px;
          padding: 10px 0;
          color: #ffffff;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          letter-spacing: 0.02em;
          margin-bottom: 10px;
        ">Generate New Save Code</button>
        <textarea id="dm-export-area" readonly placeholder="Your new save code will appear here..." style="
          width: 100%;
          height: 60px;
          background: #000000;
          border: 1px solid #1c1c1c;
          border-radius: 6px;
          padding: 10px 12px;
          color: #4ade80;
          font-size: 11px;
          outline: none;
          resize: none;
          box-sizing: border-box;
          font-family: 'SF Mono', 'Fira Code', 'Cascadia Code', ui-monospace, monospace;
        "></textarea>
        <button id="dm-copy-btn" style="
          width: 100%;
          background: transparent;
          border: 1px solid #2a1515;
          border-radius: 6px;
          padding: 8px 0;
          color: #cc5555;
          font-size: 12px;
          font-weight: 500;
          cursor: pointer;
          margin-top: 8px;
        ">Copy to Clipboard</button>
      `;
      container.appendChild(exportRow);
  
      // --- Attach Listeners for Edit View ---
      
      // Set Buttons
      container.querySelectorAll('.dm-set-btn').forEach(btn => {
        btn.onclick = () => {
          const key = btn.dataset.key;
          const input = container.querySelector(`#dm-input-${key}`);
          let val = parseFloat(input.value);
          if (isNaN(val) || val < 0) val = 0;
          
          currentSaveData[activeLevel][key] = val;
          if (key === 'coins') {
            container.querySelector('#dm-balance').textContent = val.toLocaleString();
          }
          showToast(`✓ ${key.charAt(0).toUpperCase() + key.slice(1)} set to ${val.toLocaleString()}`);
        };
      });
  
      // Quick Add Buttons
      container.querySelectorAll('.dm-quick').forEach(btn => {
        btn.onclick = () => {
          const add = parseInt(btn.dataset.val, 10);
          currentSaveData[activeLevel].coins += add;
          const coinInput = container.querySelector('#dm-input-coins');
          coinInput.value = currentSaveData[activeLevel].coins;
          container.querySelector('#dm-balance').textContent = currentSaveData[activeLevel].coins.toLocaleString();
          showToast(`✓ Added ${add.toLocaleString()} coins`);
        };
      });
  
      // Export Logic
      container.querySelector('#dm-export-btn').onclick = () => {
        const newCode = encodeSave(currentSaveData);
        if (newCode) {
          container.querySelector('#dm-export-area').value = newCode;
          showToast('✓ Save code generated! Copy and import.');
        } else {
          showToast('✗ Failed to generate save', false);
        }
      };
  
      container.querySelector('#dm-copy-btn').onclick = () => {
        const area = container.querySelector('#dm-export-area');
        if (!area.value) return showToast('✗ Generate code first', false);
        navigator.clipboard.writeText(area.value).then(() => {
          showToast('✓ Copied to clipboard!');
        }).catch(() => {
          // Fallback
          area.select();
          document.execCommand('copy');
          showToast('✓ Copied to clipboard!');
        });
      };
    }
  
    // ---------- Plugin Registration ----------
    function registerPlugin() {
      window.SiennaPlugins.register({
        name: 'Doge Miner Save Editor',
        id: 'dogeminer-save-editor',
        description: 'Edit Doge Miner save files. Paste your exported save, modify values, and import it back.',
        version: '1',
        onEnable() { createPanel(); },
        onDisable() { removePanel(); },
        onSettings() { if (!panelElement) createPanel(); }
      });
    }
  })();