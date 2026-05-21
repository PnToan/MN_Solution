/* =========================================================
   MN_SOLUTION - CANVAS ZOOM
   File: scripts/canvas/canvas-zoom.js
   ========================================================= */

/* =========================================================
   01. ZOOM IN
   ========================================================= */
window.MN_zoomIn = function() {
  const currentZoom = window.MN_AppState.zoom || 1;
  const newZoom = Math.min(Number((currentZoom + 0.1).toFixed(2)), 3);

  window.MN_setZoom(newZoom);

  if (typeof window.MN_drawScene === 'function') {
    window.MN_drawScene();
  }

  if (typeof window.MN_updateViewportInfo === 'function') {
    window.MN_updateViewportInfo(
      window.MN_AppState.mouse.x,
      window.MN_AppState.mouse.y
    );
  }
}; // def MN_zoomIn
//_________

/* =========================================================
   02. ZOOM OUT
   ========================================================= */
window.MN_zoomOut = function() {
  const currentZoom = window.MN_AppState.zoom || 1;
  const newZoom = Math.max(Number((currentZoom - 0.1).toFixed(2)), 0.3);

  window.MN_setZoom(newZoom);

  if (typeof window.MN_drawScene === 'function') {
    window.MN_drawScene();
  }

  if (typeof window.MN_updateViewportInfo === 'function') {
    window.MN_updateViewportInfo(
      window.MN_AppState.mouse.x,
      window.MN_AppState.mouse.y
    );
  }
}; // def MN_zoomOut
//_________

/* =========================================================
   03. FIT VIEW
   ========================================================= */
window.MN_fitView = function() {
  window.MN_setZoom(1);

  window.MN_AppState.canvas.panX = 0;
  window.MN_AppState.canvas.panY = 0;

  if (typeof window.MN_drawScene === 'function') {
    window.MN_drawScene();
  }

  if (typeof window.MN_updateViewportInfo === 'function') {
    window.MN_updateViewportInfo(
      window.MN_AppState.mouse.x,
      window.MN_AppState.mouse.y
    );
  }
}; // def MN_fitView
//_________

/* =========================================================
   04. TOGGLE GRID
   ========================================================= */
window.MN_toggleGrid = function() {
  window.MN_AppState.showGrid = !window.MN_AppState.showGrid;

  if (typeof window.MN_drawScene === 'function') {
    window.MN_drawScene();
  }

  if (typeof window.MN_updateStatus === 'function') {
    window.MN_updateStatus(
      window.MN_AppState.showGrid ? 'Đã bật lưới' : 'Đã tắt lưới'
    );
  }
}; // def MN_toggleGrid
//_________