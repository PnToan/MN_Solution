/* =========================================================
   MN_SOLUTION - TOOL MANAGER
   File: scripts/managers/tool-manager.js
   ========================================================= */

/* =========================================================
   01. INIT TOOL MANAGER
   ========================================================= */
window.MN_initToolManager = function() {
  const toolButtons = document.querySelectorAll('.mn-tool-btn[data-tool]');
  const actionButtons = document.querySelectorAll('.mn-tool-btn[data-action]');
  const tooltip = document.getElementById('toolTooltip');

  toolButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      toolButtons.forEach((item) => item.classList.remove('active'));

      btn.classList.add('active');

      const toolName = btn.dataset.tool;
      window.MN_setCurrentTool(toolName);

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
    });

    window.MN_bindTooltip(btn, tooltip);
  });

  actionButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const actionName = btn.dataset.action;

      if (typeof window.MN_updateStatus === 'function') {
        window.MN_updateStatus(`Đã chọn thao tác: ${actionName}`);
      }
    });

    window.MN_bindTooltip(btn, tooltip);
  });
}; // def MN_initToolManager
//_________

/* =========================================================
   02. BIND TOOLTIP
   ========================================================= */
window.MN_bindTooltip = function(element, tooltip) {
  if (!element || !tooltip) return;

  element.addEventListener('mouseenter', (event) => {
    const tooltipText = element.dataset.tooltip || '';
    if (!tooltipText) return;

    tooltip.textContent = tooltipText;
    tooltip.style.display = 'block';
    tooltip.style.left = event.clientX + 14 + 'px';
    tooltip.style.top = event.clientY + 14 + 'px';
  });

  element.addEventListener('mousemove', (event) => {
    tooltip.style.left = event.clientX + 14 + 'px';
    tooltip.style.top = event.clientY + 14 + 'px';
  });

  element.addEventListener('mouseleave', () => {
    tooltip.style.display = 'none';
  });
}; // def MN_bindTooltip
//_________