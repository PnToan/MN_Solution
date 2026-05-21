/* =========================================================
   MN_SOLUTION - SHORTCUT MANAGER
   File: scripts/managers/shortcut-manager.js
   ========================================================= */

/* =========================================================
   01. SHORTCUT MANAGER STATE
   ========================================================= */
window.MN_ShortcutManager = {
  initialized: false
};

/* =========================================================
   02. INIT SHORTCUT MANAGER
   ========================================================= */
window.MN_initShortcutManager = function() {
  if (window.MN_ShortcutManager.initialized) return;

  window.MN_ShortcutManager.initialized = true;

  document.addEventListener('keydown', function(event) {
    const tagName = event.target && event.target.tagName
      ? event.target.tagName.toLowerCase()
      : '';

    if (tagName === 'input' || tagName === 'textarea' || tagName === 'select') {
      return;
    }

    if (event.key === 'm' || event.key === 'M') {
      event.preventDefault();
      window.MN_activateToolByName('move');
    }

    if (event.code === 'Space') {
      event.preventDefault();

      if (typeof window.MN_resetMoveTool === 'function') {
        window.MN_resetMoveTool();
      }

      if (typeof window.MN_resetPanelTool === 'function') {
        window.MN_resetPanelTool();
      }

      if (typeof window.MN_activateToolByName === 'function') {
        window.MN_activateToolByName('select');
      }

      if (typeof window.MN_updateStatus === 'function') {
        window.MN_updateStatus('Thoát lệnh - về Select');
      }
    }
  });
}; // def MN_initShortcutManager
//_________

/* =========================================================
   03. ACTIVATE TOOL BY NAME
   ========================================================= */
window.MN_activateToolByName = function(toolName) {
  if (!toolName) return;

  const toolButtons = document.querySelectorAll('.mn-tool-btn[data-tool]');

  toolButtons.forEach(function(button) {
    if (button.dataset.tool === toolName) {
      button.classList.add('active');
    } else {
      button.classList.remove('active');
    }
  });

  if (typeof window.MN_setCurrentTool === 'function') {
    window.MN_setCurrentTool(toolName);
  }

  if (toolName !== 'move' && typeof window.MN_resetMoveTool === 'function') {
    window.MN_resetMoveTool();
  }

  if (toolName !== 'panel' && typeof window.MN_resetPanelTool === 'function') {
    window.MN_resetPanelTool();
  }

  if (typeof window.MN_drawScene === 'function') {
    window.MN_drawScene();
  }

  if (typeof window.MN_updateViewportInfo === 'function') {
    window.MN_updateViewportInfo(
      window.MN_AppState.mouse.x,
      window.MN_AppState.mouse.y
    );
  }

  if (typeof window.MN_updateStatus === 'function') {
    window.MN_updateStatus(`Tool: ${toolName}`);
  }
}; // def MN_activateToolByName
//_________
