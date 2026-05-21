/* =========================================================
   MN_SOLUTION - TOOL PANEL
   File: scripts/tools/tool-panel.js
   ========================================================= */

/* =========================================================
   01. PANEL TOOL STATE
   ========================================================= */
window.MN_PanelTool = {
  hoverObjectId: null,
  hoverEdge: null,
  hoverHit: null
};

/* =========================================================
   02. RESET PANEL TOOL
   ========================================================= */
window.MN_resetPanelTool = function() {
  if (!window.MN_PanelTool) return;

  window.MN_PanelTool.hoverObjectId = null;
  window.MN_PanelTool.hoverEdge = null;
  window.MN_PanelTool.hoverHit = null;
}; // def MN_resetPanelTool
//_________

/* =========================================================
   03. GET PANEL THICKNESS
   ========================================================= */
window.MN_getPanelThickness = function() {
  const value = window.MN_AppState && window.MN_AppState.panelSettings
    ? Number(window.MN_AppState.panelSettings.thickness)
    : 18;

  return Number.isFinite(value) && value > 0 ? value : 18;
}; // def MN_getPanelThickness
//_________

/* =========================================================
   04. GET PANEL VIEW AXES
   ========================================================= */
window.MN_getPanelViewAxes = function() {
  const currentView = window.MN_AppState.currentView || 'top';

  if (currentView === 'front' || currentView === 'back') {
    return {
      axisA: 'x',
      axisB: 'z',
      sizeA: 'width',
      sizeB: 'height'
    };
  }

  if (currentView === 'left' || currentView === 'right') {
    return {
      axisA: 'y',
      axisB: 'z',
      sizeA: 'depth',
      sizeB: 'height'
    };
  }

  return {
    axisA: 'x',
    axisB: 'y',
    sizeA: 'width',
    sizeB: 'depth'
  };
}; // def MN_getPanelViewAxes
//_________

/* =========================================================
   05. GET PANEL BASE OBJECTS
   ========================================================= */
window.MN_getPanelBaseObjects = function() {
  if (!window.MN_AppState || !Array.isArray(window.MN_AppState.demoObjects)) return [];

  return window.MN_AppState.demoObjects.filter(function(obj) {
    return obj && obj.id && obj.type === 'basic_box';
  });
}; // def MN_getPanelBaseObjects
//_________

/* =========================================================
   06. GET PANEL OBJECT RECT
   ========================================================= */
window.MN_getPanelObjectRect = function(obj) {
  if (!obj || typeof window.MN_localToScreen !== 'function') return null;

  const axes = window.MN_getPanelViewAxes();
  const localA = Number(obj[axes.axisA] || 0);
  const localB = Number(obj[axes.axisB] || 0);
  const sizeA = Number(obj[axes.sizeA] || 0);
  const sizeB = Number(obj[axes.sizeB] || 0);

  if (!Number.isFinite(localA) || !Number.isFinite(localB)) return null;
  if (!Number.isFinite(sizeA) || !Number.isFinite(sizeB)) return null;
  if (sizeA <= 0 || sizeB <= 0) return null;

  const p1 = window.MN_localToScreen(localA, localB);
  const p2 = window.MN_localToScreen(localA + sizeA, localB + sizeB);

  return {
    object: obj,
    axisA: axes.axisA,
    axisB: axes.axisB,
    sizeA: axes.sizeA,
    sizeB: axes.sizeB,
    localA: localA,
    localB: localB,
    sizeAValue: sizeA,
    sizeBValue: sizeB,
    screenX: Math.min(p1.x, p2.x),
    screenY: Math.min(p1.y, p2.y),
    screenW: Math.abs(p2.x - p1.x),
    screenH: Math.abs(p2.y - p1.y)
  };
}; // def MN_getPanelObjectRect
//_________

/* =========================================================
   07. HIT TEST PANEL EDGE
   ========================================================= */
window.MN_getPanelEdgeAt = function(screenX, screenY) {
  const objects = window.MN_getPanelBaseObjects();
  const scale = typeof window.MN_getLocalScale === 'function' ? window.MN_getLocalScale() : 1;
  const snapLocal = 26 / Math.max(0.01, scale);
  const localPoint = window.MN_screenToLocal(screenX, screenY);

  for (let i = objects.length - 1; i >= 0; i--) {
    const obj = objects[i];
    const rect = window.MN_getPanelObjectRect(obj);

    if (!rect) continue;

    const localA = localPoint.x;
    const localB = localPoint.y;
    const minA = rect.localA;
    const maxA = rect.localA + rect.sizeAValue;
    const minB = rect.localB;
    const maxB = rect.localB + rect.sizeBValue;

    const insideExpanded =
      localA >= minA - snapLocal &&
      localA <= maxA + snapLocal &&
      localB >= minB - snapLocal &&
      localB <= maxB + snapLocal;

    if (!insideExpanded) continue;

    const edges = [
      { key: 'left', distance: Math.abs(localA - minA) },
      { key: 'right', distance: Math.abs(maxA - localA) },
      { key: 'bottom', distance: Math.abs(localB - minB) },
      { key: 'top', distance: Math.abs(maxB - localB) }
    ];

    edges.sort(function(a, b) {
      return a.distance - b.distance;
    });

    if (edges[0].distance <= snapLocal) {
      return {
        object: obj,
        rect: rect,
        edge: edges[0].key
      };
    }
  }

  return null;
}; // def MN_getPanelEdgeAt
//_________

/* =========================================================
   08. UPDATE PANEL HOVER
   ========================================================= */
window.MN_updatePanelHover = function(pos) {
  if (!window.MN_PanelTool || !pos) return false;

  const oldObjectId = window.MN_PanelTool.hoverObjectId;
  const oldEdge = window.MN_PanelTool.hoverEdge;

  if (window.MN_AppState.currentTool !== 'panel') {
    if (oldObjectId || oldEdge) {
      window.MN_resetPanelTool();
      return true;
    }

    return false;
  }

  const hit = window.MN_getPanelEdgeAt(pos.x, pos.y);

  window.MN_PanelTool.hoverObjectId = hit ? hit.object.id : null;
  window.MN_PanelTool.hoverEdge = hit ? hit.edge : null;
  window.MN_PanelTool.hoverHit = hit;

  return oldObjectId !== window.MN_PanelTool.hoverObjectId ||
    oldEdge !== window.MN_PanelTool.hoverEdge;
}; // def MN_updatePanelHover
//_________

/* =========================================================
   09. CREATE OR UPDATE PANEL OBJECT
   ========================================================= */
window.MN_createOrUpdatePanelObject = function(baseObject, edge) {
  if (!baseObject || !edge) return null;

  const thickness = window.MN_getPanelThickness();
  const width = Number(baseObject.width || 0);
  const depth = Number(baseObject.depth || 0);
  const height = Number(baseObject.height || 0);
  const x = Number(baseObject.x || 0);
  const y = Number(baseObject.y || 0);
  const z = Number(baseObject.z || 0);

  if (width <= 0 || depth <= 0 || height <= 0) return null;

  const panelMap = {
    left: {
      id: `${baseObject.id}_panel_left`,
      name: 'Hông trái',
      x: x,
      y: y,
      z: z,
      width: thickness,
      depth: depth,
      height: height
    },
    right: {
      id: `${baseObject.id}_panel_right`,
      name: 'Hông phải',
      x: x + width - thickness,
      y: y,
      z: z,
      width: thickness,
      depth: depth,
      height: height
    },
    bottom: {
      id: `${baseObject.id}_panel_bottom`,
      name: 'Tấm đáy',
      x: x,
      y: y,
      z: z,
      width: width,
      depth: depth,
      height: thickness
    },
    top: {
      id: `${baseObject.id}_panel_top`,
      name: 'Tấm nóc',
      x: x,
      y: y,
      z: z + height - thickness,
      width: width,
      depth: depth,
      height: thickness
    }
  };

  const data = panelMap[edge];

  if (!data) return null;

  const objects = window.MN_AppState.demoObjects;
  const existing = objects.find(function(obj) {
    return obj.id === data.id;
  });

  const panelData = Object.assign({}, data, {
    type: 'panel_box',
    linkedFrameId: baseObject.id,
    panelSide: edge,
    panelThickness: thickness,
    dimEnabled: false
  });

  if (existing) {
    Object.assign(existing, panelData);
    return existing;
  }

  objects.push(panelData);
  return panelData;
}; // def MN_createOrUpdatePanelObject
//_________

/* =========================================================
   10. PANEL TOOL CLICK
   ========================================================= */
window.MN_handlePanelClick = function(pos) {
  if (!window.MN_PanelTool || !pos) return false;
  if (window.MN_AppState.currentTool !== 'panel') return false;

  const hit = window.MN_PanelTool.hoverHit || window.MN_getPanelEdgeAt(pos.x, pos.y);

  if (!hit) {
    if (typeof window.MN_updateStatus === 'function') {
      window.MN_updateStatus('Vẽ Tấm: rê chuột gần cạnh khung basic để hiện line preview');
    }
    return true;
  }

  const panel = window.MN_createOrUpdatePanelObject(hit.object, hit.edge);

  if (typeof window.MN_updateStatus === 'function') {
    if (panel) {
      window.MN_updateStatus(`Đã tạo/cập nhật: ${panel.name} | Dày ${window.MN_getPanelThickness()}mm`);
    } else {
      window.MN_updateStatus('Vẽ Tấm: chưa tạo được tấm');
    }
  }

  if (typeof window.MN_drawScene === 'function') {
    window.MN_drawScene();
  }

  if (typeof window.MN_drawMini3DPreview === 'function') {
    window.MN_drawMini3DPreview();
  }

  return true;
}; // def MN_handlePanelClick
//_________

/* =========================================================
   11. DRAW PANEL OVERLAY
   ========================================================= */
window.MN_drawPanelOverlay = function() {
  if (!window.MN_Canvas || !window.MN_Canvas.ctx || !window.MN_PanelTool) return;
  if (window.MN_AppState.currentTool !== 'panel') return;

  const hit = window.MN_PanelTool.hoverHit;
  if (!hit || !hit.rect || !hit.edge) return;

  const ctx = window.MN_Canvas.ctx;
  const thickness = window.MN_getPanelThickness();
  const rect = hit.rect;

  const minA = rect.localA;
  const maxA = rect.localA + rect.sizeAValue;
  const minB = rect.localB;
  const maxB = rect.localB + rect.sizeBValue;

  let a1 = minA;
  let b1 = minB;
  let a2 = maxA;
  let b2 = maxB;

  if (hit.edge === 'left') {
    a1 = minA + thickness;
    a2 = minA + thickness;
  }

  if (hit.edge === 'right') {
    a1 = maxA - thickness;
    a2 = maxA - thickness;
  }

  if (hit.edge === 'bottom') {
    b1 = minB + thickness;
    b2 = minB + thickness;
  }

  if (hit.edge === 'top') {
    b1 = maxB - thickness;
    b2 = maxB - thickness;
  }

  const p1 = window.MN_localToScreen(a1, b1);
  const p2 = window.MN_localToScreen(a2, b2);

  ctx.save();

  ctx.strokeStyle = '#ff6600';
  ctx.lineWidth = 2.5;
  ctx.setLineDash([9, 5]);

  ctx.beginPath();
  ctx.moveTo(p1.x, p1.y);
  ctx.lineTo(p2.x, p2.y);
  ctx.stroke();

  ctx.setLineDash([]);
  ctx.fillStyle = '#ff6600';
  ctx.font = '12px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const labelX = (p1.x + p2.x) / 2;
  const labelY = (p1.y + p2.y) / 2;
  const labels = {
    left: 'Hông trái',
    right: 'Hông phải',
    bottom: 'Tấm đáy',
    top: 'Tấm nóc'
  };

  ctx.fillText(`${labels[hit.edge]} - ${thickness}mm`, labelX, labelY - 14);

  ctx.restore();
}; // def MN_drawPanelOverlay
//_________
