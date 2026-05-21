/* =========================================================
   MN_SOLUTION - CANVAS INIT
   File: scripts/canvas/canvas-init.js
   ========================================================= */

/* =========================================================
   01. CANVAS GLOBAL REFERENCES
   ========================================================= */
window.MN_Canvas = {
  canvas: null,
  ctx: null,
  ratio: 1,
  mini3dCanvas: null,
  mini3dCtx: null,
  mini3d: {
    rotX: 0,
    rotY: 0,
    isDragging: false,
    lastMouseX: 0,
    lastMouseY: 0
  }
};

/* =========================================================
   02. INIT CANVAS
   ========================================================= */
window.MN_initCanvas = function() {
  const canvas = document.getElementById('drawCanvas');
  const mini3dCanvas = document.getElementById('mini3dCanvas');

  if (!canvas) {
    console.warn('MN_initCanvas: Không tìm thấy #drawCanvas');
    return;
  }

  window.MN_Canvas.canvas = canvas;
  window.MN_Canvas.ctx = canvas.getContext('2d');
  window.MN_Canvas.ratio = window.devicePixelRatio || 1;

  if (mini3dCanvas) {
    window.MN_Canvas.mini3dCanvas = mini3dCanvas;
    window.MN_Canvas.mini3dCtx = mini3dCanvas.getContext('2d');
  }

  if (typeof window.MN_initQuickViewButtons === 'function') {
    window.MN_initQuickViewButtons();
  }

  if (typeof window.MN_initAxisWidget === 'function') {
    window.MN_initAxisWidget();
  }

  window.MN_resizeCanvas();

  if (typeof window.MN_drawScene === 'function') {
    window.MN_drawScene();
  }
}; // def MN_initCanvas
//_________

/* =========================================================
   03. RESIZE CANVAS
   ========================================================= */
window.MN_resizeCanvas = function() {
  const canvas = window.MN_Canvas.canvas;
  const ctx = window.MN_Canvas.ctx;

  if (!canvas || !ctx) return;

  const rect = canvas.parentElement.getBoundingClientRect();
  const ratio = window.devicePixelRatio || 1;

  canvas.width = rect.width * ratio;
  canvas.height = rect.height * ratio;
  canvas.style.width = rect.width + 'px';
  canvas.style.height = rect.height + 'px';

  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);

  window.MN_AppState.canvas.width = rect.width;
  window.MN_AppState.canvas.height = rect.height;

  window.MN_AppState.canvas.localOriginX = Math.round(rect.width * (window.MN_AppState.canvas.localOriginRatioX || 0.3));
  window.MN_AppState.canvas.localOriginY = Math.round(rect.height * (window.MN_AppState.canvas.localOriginRatioY || 0.3));

  window.MN_Canvas.ratio = ratio;

  if (typeof window.MN_drawScene === 'function') {
    window.MN_drawScene();
  }
}; // def MN_resizeCanvas
//_________