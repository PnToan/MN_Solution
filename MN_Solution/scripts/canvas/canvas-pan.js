/* =========================================================
   MN_SOLUTION - CANVAS PAN
   File: scripts/canvas/canvas-pan.js
   ========================================================= */

/* =========================================================
   01. PAN STATE
   ========================================================= */
window.MN_PanState = {
  isPanning: false,
  startX: 0,
  startY: 0,
  startPanX: 0,
  startPanY: 0
};

/* =========================================================
   02. START PAN
   ========================================================= */
window.MN_startPan = function(x, y) {
  window.MN_PanState.isPanning = true;
  window.MN_PanState.startX = x;
  window.MN_PanState.startY = y;
  window.MN_PanState.startPanX = window.MN_AppState.canvas.panX;
  window.MN_PanState.startPanY = window.MN_AppState.canvas.panY;
}; // def MN_startPan
//_________

/* =========================================================
   03. UPDATE PAN
   ========================================================= */
window.MN_updatePan = function(x, y) {
  if (!window.MN_PanState.isPanning) return;

  const dx = x - window.MN_PanState.startX;
  const dy = y - window.MN_PanState.startY;

  window.MN_AppState.canvas.panX = window.MN_PanState.startPanX + dx;
  window.MN_AppState.canvas.panY = window.MN_PanState.startPanY + dy;

  if (typeof window.MN_drawScene === 'function') {
    window.MN_drawScene();
  }
}; // def MN_updatePan
//_________

/* =========================================================
   04. END PAN
   ========================================================= */
window.MN_endPan = function() {
  window.MN_PanState.isPanning = false;
}; // def MN_endPan
//_________