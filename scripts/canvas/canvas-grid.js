/* =========================================================
   MN_SOLUTION - CANVAS GRID
   File: scripts/canvas/canvas-grid.js
   ========================================================= */

/* =========================================================
   01. DRAW GRID
   ========================================================= */
window.MN_drawGrid = function(width, height) {
  const ctx = window.MN_Canvas.ctx;

  if (!ctx) return;

  const canvasState = window.MN_AppState.canvas;
  const scale = window.MN_getLocalScale();

  const originX = canvasState.localOriginX + canvasState.panX;
  const originY = canvasState.localOriginY + canvasState.panY;

  const gridStepLocal = 100;
  const gridStepScreen = gridStepLocal * scale;

  if (gridStepScreen < 8) return;

  const startLocalX = Math.floor((0 - originX) / scale / gridStepLocal) * gridStepLocal;
  const endLocalX = Math.ceil((width - originX) / scale / gridStepLocal) * gridStepLocal;

  const startLocalY = Math.floor((0 - originY) / scale / gridStepLocal) * gridStepLocal;
  const endLocalY = Math.ceil((height - originY) / scale / gridStepLocal) * gridStepLocal;

  ctx.save();

  ctx.beginPath();
  ctx.strokeStyle = '#e1e1e1';
  ctx.lineWidth = 1;

  for (let x = startLocalX; x <= endLocalX; x += gridStepLocal) {
    const screenX = window.MN_localToScreen(x, 0).x;

    ctx.moveTo(screenX, 0);
    ctx.lineTo(screenX, height);
  }

  for (let y = startLocalY; y <= endLocalY; y += gridStepLocal) {
    const screenY = window.MN_localToScreen(0, y).y;

    ctx.moveTo(0, screenY);
    ctx.lineTo(width, screenY);
  }

  ctx.stroke();

  ctx.restore();
}; // def MN_drawGrid
//_________
/* =========================================================
   02. DRAW ORIGIN
   ========================================================= */
window.MN_drawOrigin = function(width, height) {
  const ctx = window.MN_Canvas.ctx;

  if (!ctx) return;

  const canvasState = window.MN_AppState.canvas;

  const rulerTopHeight = canvasState.rulerTopHeight || 28;
  const rulerLeftWidth = canvasState.rulerLeftWidth || 42;

  const originX = canvasState.localOriginX + canvasState.panX;
  const originY = canvasState.localOriginY + canvasState.panY;

  const scale = window.MN_getLocalScale();
  const tickStepLocal = 100;
  const tickStepScreen = tickStepLocal * scale;

  ctx.save();

  ctx.fillStyle = '#eeeeee';
  ctx.fillRect(0, 0, width, rulerTopHeight);
  ctx.fillRect(0, 0, rulerLeftWidth, height);

  ctx.strokeStyle = '#9a9a9a';
  ctx.lineWidth = 1;

  ctx.beginPath();
  ctx.moveTo(0, rulerTopHeight);
  ctx.lineTo(width, rulerTopHeight);
  ctx.moveTo(rulerLeftWidth, 0);
  ctx.lineTo(rulerLeftWidth, height);
  ctx.stroke();

  if (tickStepScreen >= 12) {
    const startLocalX = Math.floor((0 - originX) / scale / tickStepLocal) * tickStepLocal;
    const endLocalX = Math.ceil((width - originX) / scale / tickStepLocal) * tickStepLocal;

    const startScreenY = 0;
    const endScreenY = height;

    const startLocalY = Math.floor((originY - endScreenY) / scale / tickStepLocal) * tickStepLocal;
    const endLocalY = Math.ceil((originY - startScreenY) / scale / tickStepLocal) * tickStepLocal;

    ctx.font = '11px Arial';
    ctx.fillStyle = '#333333';
    ctx.strokeStyle = '#666666';
    ctx.lineWidth = 1;

    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';

    for (let x = startLocalX; x <= endLocalX; x += tickStepLocal) {
      const screenX = window.MN_localToScreen(x, 0).x;

      ctx.beginPath();
      ctx.moveTo(screenX, rulerTopHeight - 6);
      ctx.lineTo(screenX, rulerTopHeight);
      ctx.stroke();

      ctx.fillText(String(Math.round(x)), screenX, 4);
    }

    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';

    for (let y = startLocalY; y <= endLocalY; y += tickStepLocal) {
      const screenY = window.MN_localToScreen(0, y).y;

      if (screenY < 0 || screenY > height) continue;

      ctx.beginPath();
      ctx.moveTo(rulerLeftWidth - 6, screenY);
      ctx.lineTo(rulerLeftWidth, screenY);
      ctx.stroke();

      ctx.fillText(String(Math.round(y)), rulerLeftWidth - 9, screenY);
    }
  }

  const currentView = window.MN_AppState.currentView || 'top';

  let horizontalAxisColor = 'rgba(255, 0, 0, 0.32)';
  let verticalAxisColor = 'rgba(0, 160, 0, 0.32)';

  if (currentView === 'front' || currentView === 'back') {
    horizontalAxisColor = 'rgba(255, 0, 0, 0.32)';
    verticalAxisColor = 'rgba(0, 102, 255, 0.32)';
  }

  if (currentView === 'top' || currentView === 'bottom') {
    horizontalAxisColor = 'rgba(255, 0, 0, 0.32)';
    verticalAxisColor = 'rgba(0, 160, 0, 0.32)';
  }

  if (currentView === 'left' || currentView === 'right') {
    horizontalAxisColor = 'rgba(0, 160, 0, 0.32)';
    verticalAxisColor = 'rgba(0, 102, 255, 0.32)';
  }

  ctx.strokeStyle = horizontalAxisColor;
  ctx.lineWidth = 1;

  ctx.beginPath();
  ctx.moveTo(0, originY);
  ctx.lineTo(width, originY);
  ctx.stroke();

  ctx.strokeStyle = verticalAxisColor;

  ctx.beginPath();
  ctx.moveTo(originX, 0);
  ctx.lineTo(originX, height);
  ctx.stroke();

  ctx.fillStyle = '#111111';

  ctx.beginPath();
  ctx.arc(originX, originY, 2.5, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#ff0000';
  ctx.font = '18px Arial';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'bottom';
  ctx.fillText('0.0', originX + 8, originY - 8);

  ctx.restore();
}; // def MN_drawOrigin
//_________