/* =========================================================
   MN_SOLUTION - CANVAS VIEW
   File: scripts/canvas/canvas-view.js
   ========================================================= */
/* =========================================================
   00. LOCAL AXES SYSTEM
   ========================================================= */
window.MN_getLocalScale = function() {
  const baseScale = window.MN_AppState.canvas.localScale || 0.5;
  const zoom = window.MN_AppState.zoom || 1;

  return baseScale * zoom;
}; // def MN_getLocalScale
//_________

window.MN_localToScreen = function(localX, localY) {
  const canvasState = window.MN_AppState.canvas;
  const scale = window.MN_getLocalScale();

  return {
    x: canvasState.localOriginX + canvasState.panX + localX * scale,
    y: canvasState.localOriginY + canvasState.panY - localY * scale
  };
}; // def MN_localToScreen
//_________

window.MN_screenToLocal = function(screenX, screenY) {
  const canvasState = window.MN_AppState.canvas;
  const scale = window.MN_getLocalScale();

  return {
    x: (screenX - canvasState.localOriginX - canvasState.panX) / scale,
    y: (canvasState.localOriginY + canvasState.panY - screenY) / scale
  };
}; // def MN_screenToLocal
//_________
/* =========================================================
   01. DRAW SCENE
   ========================================================= */
window.MN_drawScene = function() {
  const canvas = window.MN_Canvas.canvas;
  const ctx = window.MN_Canvas.ctx;

  if (!canvas || !ctx) return;

  if (typeof window.MN_syncQuickViewButtons === 'function') {
    window.MN_syncQuickViewButtons();
  }

  if (typeof window.MN_syncAxisWidget === 'function') {
    window.MN_syncAxisWidget();
  }
  if (typeof window.MN_drawMini3DPreview === 'function') {
    window.MN_drawMini3DPreview();
  }
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;

  const panX = window.MN_AppState.canvas.panX || 0;
  const panY = window.MN_AppState.canvas.panY || 0;

  ctx.clearRect(0, 0, width, height);

  ctx.fillStyle = '#f4f4f4';
  ctx.fillRect(0, 0, width, height);

  ctx.save();

  if (window.MN_AppState.showGrid) {
    window.MN_drawGrid(width, height);
  }

  window.MN_drawOrigin(width, height);
  window.MN_drawDemoFrame(width, height);
  window.MN_drawDemoObjects(width, height);

  if (typeof window.MN_drawPanelOverlay === 'function') {
    window.MN_drawPanelOverlay();
  }

  if (typeof window.MN_drawMoveOverlay === 'function') {
    window.MN_drawMoveOverlay();
  }

  ctx.restore();
}; // def MN_drawScene
//_________

/* =========================================================
   02. DEFAULT CANVAS / DEFAULT WALL
   ========================================================= */
window.MN_applyDefaultCanvasSettings = function() {
  const inputWidth = document.getElementById('inputWidthBottom');
  const inputDepth = document.getElementById('inputDepthBottom');
  const inputThickness = document.getElementById('inputThicknessBottom');

  window.MN_AppState.currentView = 'top';

  if (inputWidth) inputWidth.value = 3000;
  if (inputDepth) inputDepth.value = 100;
  if (inputThickness) inputThickness.value = 2650;

  window.MN_AppState.objects = [
    {
      id: 'default-wall-001',
      type: 'wall',
      name: 'Tường mặc định',
      width: 3000,
      depth: 100,
      height: 2650,
      x: 1000,
      y: 1000,
      z: 0
    }
  ];
}; // def MN_applyDefaultCanvasSettings
//_________

window.MN_drawDemoFrame = function(width, height) {
  const ctx = window.MN_Canvas.ctx;

  if (!ctx) return;

  const inputWidth = document.getElementById('inputWidthBottom');
  const inputDepth = document.getElementById('inputDepthBottom');
  const inputThickness = document.getElementById('inputThicknessBottom');

  const sizeX = Number(inputWidth?.value) || 3000;
  const sizeY = Number(inputDepth?.value) || 100;
  const sizeZ = Number(inputThickness?.value) || 2650;

  const currentView = window.MN_AppState.currentView || 'top';

  const wall = Array.isArray(window.MN_AppState.objects)
    ? window.MN_AppState.objects.find(function(obj) {
        return obj.type === 'wall';
      })
    : null;

  const wallX = wall?.x || 0;
  const wallY = wall?.y || 0;
  const wallZ = wall?.z || 0;

  let localX = wallX;
  let localY = wallY;
  let frameWidth = sizeX;
  let frameHeight = sizeY;

  if (currentView === 'front' || currentView === 'back') {
    localX = wallX;
    localY = wallZ;
    frameWidth = sizeX;
    frameHeight = sizeZ;
  }

  if (currentView === 'left' || currentView === 'right') {
    localX = wallY;
    localY = wallZ;
    frameWidth = sizeY;
    frameHeight = sizeZ;
  }

  if (currentView === 'top' || currentView === 'bottom') {
    localX = wallX;
    localY = wallY;
    frameWidth = sizeX;
    frameHeight = sizeY;
  }

  const p1 = window.MN_localToScreen(localX, localY);
  const p2 = window.MN_localToScreen(localX + frameWidth, localY + frameHeight);

  const x = Math.min(p1.x, p2.x);
  const y = Math.min(p1.y, p2.y);
  const w = Math.abs(p2.x - p1.x);
  const h = Math.abs(p2.y - p1.y);

  window.MN_Canvas.dimHitAreas = [];

  ctx.save();

  ctx.beginPath();
  ctx.fillStyle = 'rgba(0, 119, 204, 0.08)';
  ctx.strokeStyle = '#0077cc';
  ctx.lineWidth = 2;
  ctx.rect(x, y, w, h);
  ctx.fill();
  ctx.stroke();

  const drawDim = function(x1, y1, x2, y2, offsetX, offsetY, label, dimKey) {
    const sx1 = x1 + offsetX;
    const sy1 = y1 + offsetY;
    const sx2 = x2 + offsetX;
    const sy2 = y2 + offsetY;

    const labelX = (sx1 + sx2) / 2;
    const labelY = (sy1 + sy2) / 2;

    ctx.save();

    ctx.strokeStyle = '#333333';
    ctx.fillStyle = '#333333';
    ctx.lineWidth = 1;
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const textWidth = ctx.measureText(label).width;
    const textHeight = 16;
    const gap = textWidth / 2 + 10;

    const dx = sx2 - sx1;
    const dy = sy2 - sy1;
    const len = Math.sqrt(dx * dx + dy * dy) || 1;
    const ux = dx / len;
    const uy = dy / len;

    ctx.beginPath();

    ctx.moveTo(sx1, sy1);
    ctx.lineTo(labelX - ux * gap, labelY - uy * gap);

    ctx.moveTo(labelX + ux * gap, labelY + uy * gap);
    ctx.lineTo(sx2, sy2);

    ctx.stroke();

    const extGap = 8;

    ctx.beginPath();

    ctx.moveTo(
      x1 + (offsetX === 0 ? 0 : Math.sign(offsetX) * extGap),
      y1 + (offsetY === 0 ? 0 : Math.sign(offsetY) * extGap)
    );
    ctx.lineTo(sx1, sy1);

    ctx.moveTo(
      x2 + (offsetX === 0 ? 0 : Math.sign(offsetX) * extGap),
      y2 + (offsetY === 0 ? 0 : Math.sign(offsetY) * extGap)
    );
    ctx.lineTo(sx2, sy2);

    ctx.stroke();

    ctx.fillText(label, labelX, labelY);

    window.MN_Canvas.dimHitAreas.push({
      key: dimKey,
      label: label,
      x: labelX - textWidth / 2 - 8,
      y: labelY - textHeight / 2 - 6,
      w: textWidth + 16,
      h: textHeight + 12
    });

    ctx.restore();
  }; // def drawDim
  //_________

  let horizontalDimKey = 'width';
  let verticalDimKey = 'depth';

  if (currentView === 'front' || currentView === 'back') {
    horizontalDimKey = 'width';
    verticalDimKey = 'height';
  }

  if (currentView === 'left' || currentView === 'right') {
    horizontalDimKey = 'depth';
    verticalDimKey = 'height';
  }

  if (currentView === 'top' || currentView === 'bottom') {
    horizontalDimKey = 'width';
    verticalDimKey = 'depth';
  }

  drawDim(x, y, x + w, y, 0, -48, String(Math.round(frameWidth)), horizontalDimKey);
  drawDim(x, y, x, y + h, -48, 0, String(Math.round(frameHeight)), verticalDimKey);

  ctx.restore();
}; // def MN_drawDemoFrame
//_________
window.MN_drawDemoObjects = function(width, height) {
  if (!window.MN_AppState || !Array.isArray(window.MN_AppState.demoObjects)) return;

  const state = window.MN_AppState;
  const currentView = state.currentView || 'top';

  const ctx = window.MN_Canvas.ctx;
  if (!ctx) return;

  const drawDim = function(x1, y1, x2, y2, offsetX, offsetY, label, objectId, dimKey) {
    const sx1 = x1 + offsetX;
    const sy1 = y1 + offsetY;
    const sx2 = x2 + offsetX;
    const sy2 = y2 + offsetY;

    const labelX = (sx1 + sx2) / 2;
    const labelY = (sy1 + sy2) / 2;

    ctx.save();

    ctx.strokeStyle = '#333333';
    ctx.fillStyle = '#333333';
    ctx.lineWidth = 1;
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const textWidth = ctx.measureText(label).width;
    const textHeight = 16;
    const gap = textWidth / 2 + 10;

    const dx = sx2 - sx1;
    const dy = sy2 - sy1;
    const len = Math.sqrt(dx * dx + dy * dy) || 1;
    const ux = dx / len;
    const uy = dy / len;

    ctx.beginPath();

    ctx.moveTo(sx1, sy1);
    ctx.lineTo(labelX - ux * gap, labelY - uy * gap);

    ctx.moveTo(labelX + ux * gap, labelY + uy * gap);
    ctx.lineTo(sx2, sy2);

    ctx.stroke();

    const extGap = 8;

    ctx.beginPath();

    ctx.moveTo(
      x1 + (offsetX === 0 ? 0 : Math.sign(offsetX) * extGap),
      y1 + (offsetY === 0 ? 0 : Math.sign(offsetY) * extGap)
    );
    ctx.lineTo(sx1, sy1);

    ctx.moveTo(
      x2 + (offsetX === 0 ? 0 : Math.sign(offsetX) * extGap),
      y2 + (offsetY === 0 ? 0 : Math.sign(offsetY) * extGap)
    );
    ctx.lineTo(sx2, sy2);

    ctx.stroke();

    ctx.fillText(label, labelX, labelY);

    if (window.MN_Canvas && Array.isArray(window.MN_Canvas.dimHitAreas)) {
      window.MN_Canvas.dimHitAreas.push({
        key: 'demo_object_dim',
        objectId: objectId,
        dimKey: dimKey,
        label: label,
        x: labelX - textWidth / 2 - 8,
        y: labelY - textHeight / 2 - 6,
        w: textWidth + 16,
        h: textHeight + 12
      });
    }

    ctx.restore();
  }; // def drawDim
  //_________

  state.demoObjects.forEach(function(obj) {
    let localX = obj.x || 0;
    let localY = obj.y || 0;

    let drawWidth = obj.width || 0;
    let drawHeight = obj.depth || 0;

    let horizontalDimKey = 'width';
    let verticalDimKey = 'depth';

    if (currentView === 'front' || currentView === 'back') {
      localX = obj.x || 0;
      localY = obj.z || 0;

      drawWidth = obj.width || 0;
      drawHeight = obj.height || 0;

      horizontalDimKey = 'width';
      verticalDimKey = 'height';
    }

    if (currentView === 'left' || currentView === 'right') {
      localX = obj.y || 0;
      localY = obj.z || 0;

      drawWidth = obj.depth || 0;
      drawHeight = obj.height || 0;

      horizontalDimKey = 'depth';
      verticalDimKey = 'height';
    }

    if (currentView === 'top' || currentView === 'bottom') {
      localX = obj.x || 0;
      localY = obj.y || 0;

      drawWidth = obj.width || 0;
      drawHeight = obj.depth || 0;

      horizontalDimKey = 'width';
      verticalDimKey = 'depth';
    }

    const p1 = window.MN_localToScreen(localX, localY);
    const p2 = window.MN_localToScreen(localX + drawWidth, localY + drawHeight);

    const x = Math.min(p1.x, p2.x);
    const y = Math.min(p1.y, p2.y);
    const w = Math.abs(p2.x - p1.x);
    const h = Math.abs(p2.y - p1.y);

    ctx.save();

    if (obj.type === 'panel_box') {
      ctx.fillStyle = 'rgba(0, 119, 204, 0.28)';
      ctx.strokeStyle = '#005f99';
      ctx.lineWidth = 2.4;
    } else {
      ctx.fillStyle = 'rgba(180, 210, 230, 0.35)';
      ctx.strokeStyle = '#0077cc';
      ctx.lineWidth = 2;
    }

    ctx.beginPath();
    ctx.rect(x, y, w, h);
    ctx.fill();
    ctx.stroke();

    ctx.restore();

    if (obj.dimEnabled) {
      drawDim(
        x,
        y,
        x + w,
        y,
        0,
        -48,
        String(Math.round(drawWidth)),
        obj.id,
        horizontalDimKey
      );

      drawDim(
        x,
        y,
        x,
        y + h,
        -48,
        0,
        String(Math.round(drawHeight)),
        obj.id,
        verticalDimKey
      );
    }
  });
}; // def MN_drawDemoObjects
//_________
window.MN_getDimHitAreaAt = function(x, y) {
  if (!window.MN_Canvas || !Array.isArray(window.MN_Canvas.dimHitAreas)) {
    return null;
  }

  for (let i = window.MN_Canvas.dimHitAreas.length - 1; i >= 0; i--) {
    const area = window.MN_Canvas.dimHitAreas[i];

    if (
      x >= area.x &&
      x <= area.x + area.w &&
      y >= area.y &&
      y <= area.y + area.h
    ) {
      return area;
    }
  }

  return null;
}; // def MN_getDimHitAreaAt
//_________
window.MN_openDimInlineEditor = function(area) {
  if (!area) return;

  const canvas = document.getElementById('drawCanvas');
  if (!canvas) return;

  const rect = canvas.getBoundingClientRect();

  let currentValue = null;
  let commitTarget = null;

  if (area.key === 'demo_object_dim') {
    const objects = window.MN_AppState && Array.isArray(window.MN_AppState.demoObjects)
      ? window.MN_AppState.demoObjects
      : [];

    const obj = objects.find(function(item) {
      return item.id === area.objectId;
    });

    if (!obj || !area.dimKey) return;

    currentValue = obj[area.dimKey];

    commitTarget = function(newValue) {
      obj[area.dimKey] = newValue;
    };
  } else {
    let targetInput = null;

    if (area.key === 'width') {
      targetInput = document.getElementById('inputWidthBottom');
    }

    if (area.key === 'depth') {
      targetInput = document.getElementById('inputDepthBottom');
    }

    if (area.key === 'height') {
      targetInput = document.getElementById('inputThicknessBottom');
    }

    if (!targetInput) return;

    currentValue = Number(targetInput.value);

    commitTarget = function(newValue) {
      targetInput.value = String(Math.round(newValue));
      targetInput.dispatchEvent(new Event('input', { bubbles: true }));
      targetInput.dispatchEvent(new Event('change', { bubbles: true }));
    };
  }

  if (!Number.isFinite(Number(currentValue))) return;

  const oldEditor = document.getElementById('mnDimInlineEditor');
  if (oldEditor) {
    oldEditor.remove();
  }

  const editor = document.createElement('input');
  editor.id = 'mnDimInlineEditor';
  editor.type = 'number';
  editor.value = String(Math.round(Number(currentValue)));
  editor.style.position = 'fixed';
  editor.style.left = `${rect.left + area.x}px`;
  editor.style.top = `${rect.top + area.y}px`;
  editor.style.width = `${Math.max(70, area.w + 18)}px`;
  editor.style.height = `${Math.max(24, area.h + 8)}px`;
  editor.style.zIndex = '9999';
  editor.style.boxSizing = 'border-box';
  editor.style.textAlign = 'center';
  editor.style.fontSize = '13px';
  editor.style.border = '1px solid #0077cc';
  editor.style.borderRadius = '4px';
  editor.style.outline = 'none';
  editor.style.background = '#ffffff';
  editor.style.color = '#111111';

  document.body.appendChild(editor);

  editor.focus();
  editor.select();

  const commit = function() {
    const newValue = Number(editor.value);

    if (!Number.isFinite(newValue) || newValue <= 0) {
      editor.remove();
      return;
    }

    commitTarget(newValue);

    if (typeof window.MN_drawScene === 'function') {
      window.MN_drawScene();
    }

    if (typeof window.MN_drawMini3DPreview === 'function') {
      window.MN_drawMini3DPreview();
    }

    editor.remove();
  };

  const cancel = function() {
    editor.remove();
  };

  editor.addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
      event.preventDefault();
      commit();
    }

    if (event.key === 'Escape') {
      event.preventDefault();
      cancel();
    }
  });

  editor.addEventListener('blur', function() {
    commit();
  });
}; // def MN_openDimInlineEditor
//_________
/* =========================================================
   03. UPDATE VIEWPORT INFO
   ========================================================= */
window.MN_updateViewportInfo = function(x = 0, y = 0, z = 0) {
  const viewportInfo = document.getElementById('viewportInfo');

  if (!viewportInfo) return;

  const tool = window.MN_AppState.currentTool;
  const zoomText = Math.round(window.MN_AppState.zoom * 100);
  const currentView = window.MN_AppState.currentView || 'front';

  const localPoint = typeof window.MN_screenToLocal === 'function'
    ? window.MN_screenToLocal(x, y)
    : { x: x, y: y };

  const localA = Math.round(localPoint.x);
  const localB = Math.round(localPoint.y);

  let viewText = 'Trước';
  let axesText = 'X0Z';
  let axisA = 'X';
  let axisB = 'Z';

  if (currentView === 'front') {
    viewText = 'Trước';
    axesText = 'X0Z';
    axisA = 'X';
    axisB = 'Z';
  }

  if (currentView === 'back') {
    viewText = 'Sau';
    axesText = 'X0Z đối diện';
    axisA = 'X';
    axisB = 'Z';
  }

  if (currentView === 'left') {
    viewText = 'Trái';
    axesText = 'Y0Z';
    axisA = 'Y';
    axisB = 'Z';
  }

  if (currentView === 'right') {
    viewText = 'Phải';
    axesText = 'Y0Z đối diện';
    axisA = 'Y';
    axisB = 'Z';
  }

  if (currentView === 'top') {
    viewText = 'Trên';
    axesText = 'X0Y';
    axisA = 'X';
    axisB = 'Y';
  }

  if (currentView === 'bottom') {
    viewText = 'Dưới';
    axesText = 'X0Y đối diện';
    axisA = 'X';
    axisB = 'Y';
  }

  viewportInfo.textContent = `Tool: ${tool} | Mặt: ${viewText} | Hệ: ${axesText} | ${axisA}: ${localA} | ${axisB}: ${localB} | Zoom: ${zoomText}%`;
}; // def MN_updateViewportInfo
//_________
/* =========================================================
   04. UPDATE STATUS
   ========================================================= */
window.MN_updateStatus = function(message) {
const bottomStatus = document.getElementById('bottomStatus');

if (!bottomStatus) return;

bottomStatus.textContent = `${message} | ${window.MN_AppState.appMode} | ${window.MN_AppState.objects.length} đối tượng`;
}; // def MN_updateStatus
//_________
/* =========================================================
   05. SYNC QUICK VIEW BUTTONS
   ========================================================= */
window.MN_syncQuickViewButtons = function() {
  const buttons = document.querySelectorAll('.mn-quick-view-btn');
  const currentView = window.MN_AppState.currentView || 'front';

  buttons.forEach(function(button) {
    const buttonView = button.dataset.view;

    if (buttonView === currentView) {
      button.classList.add('active');
    } else {
      button.classList.remove('active');
    }
  });
}; // def MN_syncQuickViewButtons
//_________
/* =========================================================
   06. INIT QUICK VIEW BUTTONS
   ========================================================= */
window.MN_initQuickViewButtons = function() {
  const buttons = document.querySelectorAll('.mn-quick-view-btn');

  if (!buttons.length) return;

  buttons.forEach(function(button) {
    button.addEventListener('click', function() {
      const viewName = button.dataset.view;

      if (!viewName) return;

      if (typeof window.MN_setCurrentView === 'function') {
        window.MN_setCurrentView(viewName);
      } else {
        window.MN_AppState.currentView = viewName;
      }

      if (typeof window.MN_syncQuickViewButtons === 'function') {
        window.MN_syncQuickViewButtons();
      }

      if (typeof window.MN_drawScene === 'function') {
        window.MN_drawScene();
      }
    });
  });
}; // def MN_initQuickViewButtons
//_________
/* =========================================================
   07. SYNC AXIS WIDGET
   ========================================================= */
window.MN_syncAxisWidget = function() {
  const axisViewLabel = document.getElementById('axisViewLabel');
  const axisButtons = document.querySelectorAll('[data-axis-view]');
  const axisCubeButton = document.getElementById('axisCubeButton');

  if (axisViewLabel) {
    axisViewLabel.textContent = '3D';
  }

  axisButtons.forEach(function(button) {
    button.classList.remove('active');
  });

  if (axisCubeButton) {
    axisCubeButton.classList.add('active');
  }
}; // def MN_syncAxisWidget
//_________
/* =========================================================
   08. INIT AXIS WIDGET
   ========================================================= */
window.MN_initAxisWidget = function() {
  const axisWidget = document.getElementById('axisWidget');
  const joystickInner = axisWidget ? axisWidget.querySelector('.mn-joystick-inner') : null;

  if (!axisWidget || !joystickInner) return;

  if (!window.MN_Canvas.mini3d) {
    window.MN_Canvas.mini3d = {
      rotX: -18,
      rotY: 36,
      isDragging: false,
      lastMouseX: 0,
      lastMouseY: 0,
      joyX: 0,
      joyY: 0
    };
  }

  const setJoystickPosition = function(x, y) {
    const maxRadius = 27;
    const distance = Math.sqrt(x * x + y * y);

    let limitedX = x;
    let limitedY = y;

    if (distance > maxRadius) {
      limitedX = (x / distance) * maxRadius;
      limitedY = (y / distance) * maxRadius;
    }

    window.MN_Canvas.mini3d.joyX = limitedX;
    window.MN_Canvas.mini3d.joyY = limitedY;

    joystickInner.style.transform = `translate(calc(-50% + ${limitedX}px), calc(-50% + ${limitedY}px))`;
  }; // def setJoystickPosition
  //_________

  const resetJoystickPosition = function() {
    window.MN_Canvas.mini3d.joyX = 0;
    window.MN_Canvas.mini3d.joyY = 0;

    joystickInner.style.transform = 'translate(-50%, -50%)';
  }; // def resetJoystickPosition
  //_________

  axisWidget.addEventListener('pointerdown', function(event) {
    event.preventDefault();
    event.stopPropagation();

    window.MN_Canvas.mini3d.isDragging = true;
    window.MN_Canvas.mini3d.lastMouseX = event.clientX;
    window.MN_Canvas.mini3d.lastMouseY = event.clientY;

    axisWidget.classList.add('dragging');
    axisWidget.setPointerCapture(event.pointerId);
  });

  axisWidget.addEventListener('pointermove', function(event) {
    if (!window.MN_Canvas.mini3d.isDragging) return;

    event.preventDefault();
    event.stopPropagation();

    const dx = event.clientX - window.MN_Canvas.mini3d.lastMouseX;
    const dy = event.clientY - window.MN_Canvas.mini3d.lastMouseY;

    window.MN_Canvas.mini3d.rotY += dx * 0.7;
    window.MN_Canvas.mini3d.rotX += dy * 0.7;

    window.MN_Canvas.mini3d.rotX = Math.max(-89, Math.min(89, window.MN_Canvas.mini3d.rotX));

    const joyX = window.MN_Canvas.mini3d.joyX + dx;
    const joyY = window.MN_Canvas.mini3d.joyY + dy;

    setJoystickPosition(joyX, joyY);

    window.MN_Canvas.mini3d.lastMouseX = event.clientX;
    window.MN_Canvas.mini3d.lastMouseY = event.clientY;

    if (typeof window.MN_drawMini3DPreview === 'function') {
      window.MN_drawMini3DPreview();
    }
  });

  axisWidget.addEventListener('pointerup', function(event) {
    event.preventDefault();
    event.stopPropagation();

    window.MN_Canvas.mini3d.isDragging = false;
    axisWidget.classList.remove('dragging');

    resetJoystickPosition();

    try {
      axisWidget.releasePointerCapture(event.pointerId);
    } catch (e) {}
  });

  axisWidget.addEventListener('pointercancel', function() {
    window.MN_Canvas.mini3d.isDragging = false;
    axisWidget.classList.remove('dragging');

    resetJoystickPosition();
  });

  axisWidget.addEventListener('dblclick', function(event) {
    event.preventDefault();
    event.stopPropagation();

    window.MN_Canvas.mini3d.rotX = 0;
    window.MN_Canvas.mini3d.rotY = 0;
    window.MN_Canvas.mini3d.isDragging = false;

    axisWidget.classList.remove('dragging');
    resetJoystickPosition();

    if (typeof window.MN_drawMini3DPreview === 'function') {
      window.MN_drawMini3DPreview();
    }
  });
}; // def MN_initAxisWidget
//_________
/* =========================================================
   09. DRAW MINI 3D PREVIEW
   ========================================================= */
window.MN_drawMini3DPreview = function() {
  const canvas = window.MN_Canvas.mini3dCanvas;
  const ctx = window.MN_Canvas.mini3dCtx;

  if (!canvas || !ctx) return;

  const rect = canvas.getBoundingClientRect();
  const ratio = window.devicePixelRatio || 1;

  canvas.width = rect.width * ratio;
  canvas.height = rect.height * ratio;

  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  ctx.clearRect(0, 0, rect.width, rect.height);

  const previewObject = Array.isArray(window.MN_AppState.demoObjects)
    ? window.MN_AppState.demoObjects.find(function(obj) {
        return obj.type === 'basic_box';
      })
    : null;

  if (!previewObject) return;

  const sizeX = Number(previewObject.width) || 1200;
  const sizeY = Number(previewObject.depth) || 580;
  const sizeZ = Number(previewObject.height) || 2200;

  if (!window.MN_Canvas.mini3d) {
    window.MN_Canvas.mini3d = {
      rotX: -18,
      rotY: 36,
      isDragging: false,
      lastMouseX: 0,
      lastMouseY: 0,
      joyX: 0,
      joyY: 0
    };
  }

  const mini3d = window.MN_Canvas.mini3d;

  const rotX = (mini3d.rotX || 0) * Math.PI / 180;
  const rotY = (mini3d.rotY || 0) * Math.PI / 180;

  const cx3d = sizeX / 2;
  const cy3d = sizeY / 2;
  const cz3d = sizeZ / 2;

  const points3d = {
    p000: [0, 0, 0],
    p100: [sizeX, 0, 0],
    p110: [sizeX, sizeY, 0],
    p010: [0, sizeY, 0],
    p001: [0, 0, sizeZ],
    p101: [sizeX, 0, sizeZ],
    p111: [sizeX, sizeY, sizeZ],
    p011: [0, sizeY, sizeZ]
  };

  const rotateObjectPoint = function(point) {
    let x = point[0] - cx3d;
    let y = point[1] - cy3d;
    let z = point[2] - cz3d;

    const cosY = Math.cos(rotY);
    const sinY = Math.sin(rotY);

    const x1 = x * cosY - y * sinY;
    const y1 = x * sinY + y * cosY;

    x = x1;
    y = y1;

    const cosX = Math.cos(rotX);
    const sinX = Math.sin(rotX);

    const y2 = y * cosX - z * sinX;
    const z2 = y * sinX + z * cosX;

    y = y2;
    z = z2;

    return {
      x: x,
      y: y,
      z: z
    };
  }; // def rotateObjectPoint
  //_________

  const projectByFixedCamera = function(point) {
    const axisX = { x: 1, y: 0 };
    const axisY = { x: -0.62, y: -0.42 };
    const axisZ = { x: 0, y: -1 };

    return {
      x: point.x * axisX.x + point.y * axisY.x + point.z * axisZ.x,
      y: point.x * axisX.y + point.y * axisY.y + point.z * axisZ.y,
      depth: point.y - point.x * 0.08 - point.z * 0.04
    };
  }; // def projectByFixedCamera
  //_________

  const rotated = {};
  const projected = {};

  Object.keys(points3d).forEach(function(key) {
    rotated[key] = rotateObjectPoint(points3d[key]);
    projected[key] = projectByFixedCamera(rotated[key]);
  });

  const allPoints = Object.values(projected);
  const minX = Math.min(...allPoints.map(function(p) { return p.x; }));
  const maxX = Math.max(...allPoints.map(function(p) { return p.x; }));
  const minY = Math.min(...allPoints.map(function(p) { return p.y; }));
  const maxY = Math.max(...allPoints.map(function(p) { return p.y; }));

  const shapeW = Math.max(1, maxX - minX);
  const shapeH = Math.max(1, maxY - minY);

  const padding = 16;
  const textAreaH = 14;
  const availableW = Math.max(20, rect.width - padding * 2);
  const availableH = Math.max(20, rect.height - padding * 2 - textAreaH);

  const scale = Math.min(availableW / shapeW, availableH / shapeH);

  const offsetX = rect.width / 2 - ((minX + maxX) * scale) / 2;
  const offsetY = (rect.height - textAreaH) / 2 - ((minY + maxY) * scale) / 2;

  const sp = {};

  Object.keys(projected).forEach(function(key) {
    sp[key] = {
      x: projected[key].x * scale + offsetX,
      y: projected[key].y * scale + offsetY,
      depth: projected[key].depth
    };
  });

  const drawFace = function(keys, fillStyle) {
    ctx.beginPath();
    ctx.moveTo(sp[keys[0]].x, sp[keys[0]].y);

    for (let i = 1; i < keys.length; i++) {
      ctx.lineTo(sp[keys[i]].x, sp[keys[i]].y);
    }

    ctx.closePath();
    ctx.fillStyle = fillStyle;
    ctx.fill();
  }; // def drawFace
  //_________

  const drawEdge = function(a, b, strokeStyle, lineWidth) {
    ctx.beginPath();
    ctx.moveTo(sp[a].x, sp[a].y);
    ctx.lineTo(sp[b].x, sp[b].y);
    ctx.strokeStyle = strokeStyle;
    ctx.lineWidth = lineWidth;
    ctx.stroke();
  }; // def drawEdge
  //_________

  drawFace(['p000', 'p100', 'p110', 'p010'], 'rgba(0, 119, 204, 0.05)');
  drawFace(['p001', 'p101', 'p111', 'p011'], 'rgba(0, 119, 204, 0.13)');
  drawFace(['p000', 'p100', 'p101', 'p001'], 'rgba(0, 119, 204, 0.07)');
  drawFace(['p010', 'p110', 'p111', 'p011'], 'rgba(0, 119, 204, 0.10)');
  drawFace(['p000', 'p010', 'p011', 'p001'], 'rgba(0, 119, 204, 0.12)');
  drawFace(['p100', 'p110', 'p111', 'p101'], 'rgba(0, 119, 204, 0.10)');

  const edgeColor = '#0077cc';
  const edgeWidth = 1.2;

  drawEdge('p000', 'p100', edgeColor, edgeWidth);
  drawEdge('p100', 'p110', edgeColor, edgeWidth);
  drawEdge('p110', 'p010', edgeColor, edgeWidth);
  drawEdge('p010', 'p000', edgeColor, edgeWidth);

  drawEdge('p001', 'p101', edgeColor, edgeWidth);
  drawEdge('p101', 'p111', edgeColor, edgeWidth);
  drawEdge('p111', 'p011', edgeColor, edgeWidth);
  drawEdge('p011', 'p001', edgeColor, edgeWidth);

  drawEdge('p000', 'p001', edgeColor, edgeWidth);
  drawEdge('p100', 'p101', edgeColor, edgeWidth);
  drawEdge('p110', 'p111', edgeColor, edgeWidth);
  drawEdge('p010', 'p011', edgeColor, edgeWidth);

  ctx.fillStyle = '#333333';
  ctx.font = '10px Arial';
  ctx.fillText(`${sizeX} x ${sizeY} x ${sizeZ}`, 8, rect.height - 8);
}; // def MN_drawMini3DPreview
//_________
window.MN_editWallDimension = function(dimKey) {
  if (!window.MN_AppState || !window.MN_AppState.defaultWall) return;

  const wall = window.MN_AppState.defaultWall;

  let currentValue = 0;
  let label = '';

  if (dimKey === 'width') {
    currentValue = wall.width || 3000;
    label = 'Nhập chiều rộng / dài';
  }

  if (dimKey === 'depth') {
    currentValue = wall.depth || 100;
    label = 'Nhập chiều sâu / dày';
  }

  if (dimKey === 'height') {
    currentValue = wall.height || 2650;
    label = 'Nhập chiều cao';
  }

  const input = prompt(label, String(Math.round(currentValue)));
  if (input === null) return;

  const newValue = Number(input);
  if (!Number.isFinite(newValue) || newValue <= 0) {
    alert('Kích thước không hợp lệ');
    return;
  }

  if (dimKey === 'width') {
    wall.width = newValue;
  }

  if (dimKey === 'depth') {
    wall.depth = newValue;
  }

  if (dimKey === 'height') {
    wall.height = newValue;
  }

  if (typeof window.MN_renderCanvas === 'function') {
    window.MN_renderCanvas();
  }

  if (typeof window.MN_update3DPreview === 'function') {
    window.MN_update3DPreview();
  }
}; // def MN_editWallDimension
//_________