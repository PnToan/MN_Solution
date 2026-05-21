/* =========================================================
   MN_SOLUTION - TOOL PANEL
   File: scripts/tools/tool-panel.js
   Zone-based Panel System
   ========================================================= */

/* =========================================================
   01. PANEL TOOL STATE
   ========================================================= */
window.MN_PanelTool = {
  hoverObjectId: null,
  hoverEdge: null,
  hoverHit: null,
  hoverZone: null,
  inputBuffer: ''
};

/* =========================================================
   02. RESET PANEL TOOL
   ========================================================= */
window.MN_resetPanelTool = function() {
  if (!window.MN_PanelTool) return;

  window.MN_PanelTool.hoverObjectId = null;
  window.MN_PanelTool.hoverEdge = null;
  window.MN_PanelTool.hoverHit = null;
  window.MN_PanelTool.hoverZone = null;
  window.MN_PanelTool.inputBuffer = '';
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
   04. GET CURRENT VIEW AXES
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
    minA: localA,
    maxA: localA + sizeA,
    minB: localB,
    maxB: localB + sizeB,
    screenX: Math.min(p1.x, p2.x),
    screenY: Math.min(p1.y, p2.y),
    screenW: Math.abs(p2.x - p1.x),
    screenH: Math.abs(p2.y - p1.y)
  };
}; // def MN_getPanelObjectRect
//_________

/* =========================================================
   07. GET PANELS IN SAME FRAME
   ========================================================= */
window.MN_getPanelsInFrame = function(baseObject) {
  if (!baseObject || !window.MN_AppState || !Array.isArray(window.MN_AppState.demoObjects)) {
    return [];
  }

  return window.MN_AppState.demoObjects.filter(function(obj) {
    return obj &&
      obj.type === 'panel_box' &&
      obj.linkedFrameId === baseObject.id;
  });
}; // def MN_getPanelsInFrame
//_________

/* =========================================================
   08. COLLECT CUT POSITIONS FOR ZONES
   ========================================================= */
window.MN_collectZoneCuts = function(baseObject) {
  const x = Number(baseObject.x || 0);
  const y = Number(baseObject.y || 0);
  const z = Number(baseObject.z || 0);
  const width = Number(baseObject.width || 0);
  const depth = Number(baseObject.depth || 0);
  const height = Number(baseObject.height || 0);

  const cutsX = [x, x + width];
  const cutsZ = [z, z + height];

  const panels = window.MN_getPanelsInFrame(baseObject);

  panels.forEach(function(panel) {
    const px = Number(panel.x || 0);
    const pz = Number(panel.z || 0);
    const pw = Number(panel.width || 0);
    const ph = Number(panel.height || 0);

    if (panel.panelSide === 'left' || panel.panelSide === 'right' || panel.panelKind === 'vertical') {
      cutsX.push(px);
      cutsX.push(px + pw);
    }

    if (panel.panelSide === 'bottom' || panel.panelSide === 'top' || panel.panelKind === 'horizontal') {
      cutsZ.push(pz);
      cutsZ.push(pz + ph);
    }
  });

  const clean = function(values) {
    return Array.from(new Set(values.map(function(v) {
      return Math.round(Number(v) * 1000) / 1000;
    }))).sort(function(a, b) {
      return a - b;
    });
  };

  return {
    cutsX: clean(cutsX),
    cutsZ: clean(cutsZ),
    y: y,
    depth: depth
  };
}; // def MN_collectZoneCuts
//_________

/* =========================================================
   09. CHECK RECT BLOCKED BY PANEL
   ========================================================= */
window.MN_isZoneCellBlocked = function(baseObject, minX, maxX, minZ, maxZ) {
  const panels = window.MN_getPanelsInFrame(baseObject);
  const eps = 0.001;

  for (let i = 0; i < panels.length; i++) {
    const panel = panels[i];

    const px1 = Number(panel.x || 0);
    const px2 = px1 + Number(panel.width || 0);
    const pz1 = Number(panel.z || 0);
    const pz2 = pz1 + Number(panel.height || 0);

    const overlapX = maxX > px1 + eps && minX < px2 - eps;
    const overlapZ = maxZ > pz1 + eps && minZ < pz2 - eps;

    if (overlapX && overlapZ) {
      return true;
    }
  }

  return false;
}; // def MN_isZoneCellBlocked
//_________

/* =========================================================
   10. COMPUTE RECTANGULAR ZONES
   ========================================================= */
window.MN_computePanelZones = function(baseObject) {
  if (!baseObject) return [];

  const cuts = window.MN_collectZoneCuts(baseObject);
  const cells = [];
  const cellMap = {};
  const visited = {};
  const zones = [];

  for (let xi = 0; xi < cuts.cutsX.length - 1; xi++) {
    for (let zi = 0; zi < cuts.cutsZ.length - 1; zi++) {
      const minX = cuts.cutsX[xi];
      const maxX = cuts.cutsX[xi + 1];
      const minZ = cuts.cutsZ[zi];
      const maxZ = cuts.cutsZ[zi + 1];

      if (maxX <= minX || maxZ <= minZ) continue;

      const blocked = window.MN_isZoneCellBlocked(baseObject, minX, maxX, minZ, maxZ);
      const key = `${xi}_${zi}`;

      const cell = {
        key: key,
        xi: xi,
        zi: zi,
        minX: minX,
        maxX: maxX,
        minZ: minZ,
        maxZ: maxZ,
        blocked: blocked
      };

      cells.push(cell);
      cellMap[key] = cell;
    }
  }

  const getCell = function(xi, zi) {
    return cellMap[`${xi}_${zi}`] || null;
  };

  const getOpenNeighbors = function(cell) {
    const result = [];
    const candidates = [
      getCell(cell.xi - 1, cell.zi),
      getCell(cell.xi + 1, cell.zi),
      getCell(cell.xi, cell.zi - 1),
      getCell(cell.xi, cell.zi + 1)
    ];

    candidates.forEach(function(nextCell) {
      if (!nextCell) return;
      if (nextCell.blocked) return;

      result.push(nextCell);
    });

    return result;
  };

  let zoneIndex = 1;

  cells.forEach(function(startCell) {
    if (startCell.blocked) return;
    if (visited[startCell.key]) return;

    const stack = [startCell];
    const group = [];

    visited[startCell.key] = true;

    while (stack.length > 0) {
      const cell = stack.pop();

      group.push(cell);

      const neighbors = getOpenNeighbors(cell);

      neighbors.forEach(function(nextCell) {
        if (visited[nextCell.key]) return;

        visited[nextCell.key] = true;
        stack.push(nextCell);
      });
    }

    if (group.length === 0) return;

    let minX = group[0].minX;
    let maxX = group[0].maxX;
    let minZ = group[0].minZ;
    let maxZ = group[0].maxZ;

    group.forEach(function(cell) {
      minX = Math.min(minX, cell.minX);
      maxX = Math.max(maxX, cell.maxX);
      minZ = Math.min(minZ, cell.minZ);
      maxZ = Math.max(maxZ, cell.maxZ);
    });

    if (maxX <= minX || maxZ <= minZ) return;

    zones.push({
      id: `${baseObject.id}_zone_${zoneIndex}`,
      baseObject: baseObject,
      minX: minX,
      maxX: maxX,
      minZ: minZ,
      maxZ: maxZ,
      y: cuts.y,
      depth: cuts.depth,
      width: maxX - minX,
      height: maxZ - minZ,
      cells: group
    });

    zoneIndex += 1;
  });

  return zones;
}; // def MN_computePanelZones
//_________

/* =========================================================
   11. GET ZONE SCREEN RECT
   ========================================================= */
window.MN_getZoneScreenRect = function(zone) {
  if (!zone || typeof window.MN_localToScreen !== 'function') return null;

  const currentView = window.MN_AppState.currentView || 'front';

  let a1 = zone.minX;
  let b1 = zone.minZ;
  let a2 = zone.maxX;
  let b2 = zone.maxZ;

  if (currentView === 'top' || currentView === 'bottom') {
    a1 = zone.minX;
    b1 = zone.y;
    a2 = zone.maxX;
    b2 = zone.y + zone.depth;
  }

  if (currentView === 'left' || currentView === 'right') {
    a1 = zone.y;
    b1 = zone.minZ;
    a2 = zone.y + zone.depth;
    b2 = zone.maxZ;
  }

  const p1 = window.MN_localToScreen(a1, b1);
  const p2 = window.MN_localToScreen(a2, b2);

  return {
    zone: zone,
    localA1: Math.min(a1, a2),
    localA2: Math.max(a1, a2),
    localB1: Math.min(b1, b2),
    localB2: Math.max(b1, b2),
    x: Math.min(p1.x, p2.x),
    y: Math.min(p1.y, p2.y),
    w: Math.abs(p2.x - p1.x),
    h: Math.abs(p2.y - p1.y)
  };
}; // def MN_getZoneScreenRect
//_________

/* =========================================================
   12. GET ZONE AT SCREEN POINT
   ========================================================= */
window.MN_getPanelZoneAt = function(screenX, screenY) {
  const objects = window.MN_getPanelBaseObjects();
  const localPoint = window.MN_screenToLocal(screenX, screenY);

  for (let i = objects.length - 1; i >= 0; i--) {
    const baseObject = objects[i];
    const zones = window.MN_computePanelZones(baseObject);

    for (let zIndex = 0; zIndex < zones.length; zIndex++) {
      const zone = zones[zIndex];
      const rect = window.MN_getZoneScreenRect(zone);

      if (!rect) continue;

      if (
        screenX >= rect.x &&
        screenX <= rect.x + rect.w &&
        screenY >= rect.y &&
        screenY <= rect.y + rect.h
      ) {
        return {
          object: baseObject,
          zone: zone,
          rect: rect,
          localPoint: localPoint
        };
      }
    }
  }

  return null;
}; // def MN_getPanelZoneAt
//_________

/* =========================================================
   13. HIT TEST ZONE EDGE
   ========================================================= */
window.MN_getPanelEdgeAt = function(screenX, screenY) {
  const hitZone = window.MN_getPanelZoneAt(screenX, screenY);

  if (!hitZone) return null;

  const rect = hitZone.rect;
  const scale = typeof window.MN_getLocalScale === 'function' ? window.MN_getLocalScale() : 1;
  const snapLocal = 26 / Math.max(0.01, scale);

  const axes = window.MN_getPanelViewAxes();
  const localPoint = window.MN_screenToLocal(screenX, screenY);

  const localA = localPoint.x;
  const localB = localPoint.y;

  const minA = rect.localA1;
  const maxA = rect.localA2;
  const minB = rect.localB1;
  const maxB = rect.localB2;

  const edges = [
    { key: 'left', distance: Math.abs(localA - minA) },
    { key: 'right', distance: Math.abs(maxA - localA) },
    { key: 'bottom', distance: Math.abs(localB - minB) },
    { key: 'top', distance: Math.abs(maxB - localB) }
  ];

  edges.sort(function(a, b) {
    return a.distance - b.distance;
  });

  return {
    object: hitZone.object,
    zone: hitZone.zone,
    rect: rect,
    edge: edges[0].distance <= snapLocal ? edges[0].key : null,
    axes: axes
  };
}; // def MN_getPanelEdgeAt
//_________

/* =========================================================
   14. UPDATE PANEL HOVER
   ========================================================= */
window.MN_updatePanelHover = function(pos) {
  if (!window.MN_PanelTool || !pos) return false;

  const oldObjectId = window.MN_PanelTool.hoverObjectId;
  const oldEdge = window.MN_PanelTool.hoverEdge;
  const oldZoneId = window.MN_PanelTool.hoverZone ? window.MN_PanelTool.hoverZone.id : null;

  if (window.MN_AppState.currentTool !== 'panel') {
    if (oldObjectId || oldEdge || oldZoneId) {
      window.MN_resetPanelTool();
      return true;
    }

    return false;
  }

  const hit = window.MN_getPanelEdgeAt(pos.x, pos.y);

  window.MN_PanelTool.hoverObjectId = hit ? hit.object.id : null;
  window.MN_PanelTool.hoverEdge = hit ? hit.edge : null;
  window.MN_PanelTool.hoverHit = hit;
  window.MN_PanelTool.hoverZone = hit ? hit.zone : null;

  return oldObjectId !== window.MN_PanelTool.hoverObjectId ||
    oldEdge !== window.MN_PanelTool.hoverEdge ||
    oldZoneId !== (window.MN_PanelTool.hoverZone ? window.MN_PanelTool.hoverZone.id : null);
}; // def MN_updatePanelHover
//_________

/* =========================================================
   15. GET PANEL PREVIEW VALUE
   ========================================================= */
window.MN_getPanelPreviewInput = function() {
  if (!window.MN_PanelTool) {
    return {
      mode: 'offset',
      value: 0
    };
  }

  const buffer = String(window.MN_PanelTool.inputBuffer || '').trim();

  if (buffer === '') {
    return {
      mode: 'offset',
      value: 0
    };
  }

  if (buffer[0] === '/') {
    const parts = buffer.slice(1);
    const value = Number(parts);

    return {
      mode: 'divide',
      value: Number.isInteger(value) && value >= 2 ? value : null
    };
  }

  const value = Number(buffer);

  return {
    mode: 'offset',
    value: Number.isFinite(value) && value >= 0 ? value : 0
  };
}; // def MN_getPanelPreviewInput
//_________

/* =========================================================
   16. CREATE PANEL ID
   ========================================================= */
window.MN_createPanelId = function(baseObject, edge) {
  const stamp = Date.now();
  const random = Math.floor(Math.random() * 100000);

  return `${baseObject.id}_panel_${edge}_${stamp}_${random}`;
}; // def MN_createPanelId
//_________

/* =========================================================
   17. COMPUTE SINGLE PANEL DATA FROM ZONE
   ========================================================= */
window.MN_computePanelDataFromZone = function(zone, edge, offsetValue = 0) {
  if (!zone || !edge) return null;

  const baseObject = zone.baseObject;
  const thickness = window.MN_getPanelThickness();
  let offset = Number(offsetValue || 0);

  if (!Number.isFinite(offset) || offset < 0) offset = 0;

  let data = null;

  if (edge === 'bottom') {
    const maxOffset = Math.max(0, zone.height - thickness);
    offset = Math.min(offset, maxOffset);

    data = {
      id: window.MN_createPanelId(baseObject, edge),
      name: 'Tấm đáy',
      x: zone.minX,
      y: zone.y,
      z: zone.minZ + offset,
      width: zone.width,
      depth: zone.depth,
      height: thickness,
      panelKind: 'horizontal',
      panelOffset: offset,
      panelOffsetFrom: 'bottom',
      panelBaseZone: zone.id
    };
  }

  if (edge === 'top') {
    const maxOffset = Math.max(0, zone.height - thickness);
    offset = Math.min(offset, maxOffset);

    data = {
      id: window.MN_createPanelId(baseObject, edge),
      name: 'Tấm nóc',
      x: zone.minX,
      y: zone.y,
      z: zone.maxZ - thickness - offset,
      width: zone.width,
      depth: zone.depth,
      height: thickness,
      panelKind: 'horizontal',
      panelOffset: offset,
      panelOffsetFrom: 'top',
      panelBaseZone: zone.id
    };
  }

  if (edge === 'left') {
    const maxOffset = Math.max(0, zone.width - thickness);
    offset = Math.min(offset, maxOffset);

    data = {
      id: window.MN_createPanelId(baseObject, edge),
      name: 'Hông trái',
      x: zone.minX + offset,
      y: zone.y,
      z: zone.minZ,
      width: thickness,
      depth: zone.depth,
      height: zone.height,
      panelKind: 'vertical',
      panelOffset: offset,
      panelOffsetFrom: 'left',
      panelBaseZone: zone.id
    };
  }

  if (edge === 'right') {
    const maxOffset = Math.max(0, zone.width - thickness);
    offset = Math.min(offset, maxOffset);

    data = {
      id: window.MN_createPanelId(baseObject, edge),
      name: 'Hông phải',
      x: zone.maxX - thickness - offset,
      y: zone.y,
      z: zone.minZ,
      width: thickness,
      depth: zone.depth,
      height: zone.height,
      panelKind: 'vertical',
      panelOffset: offset,
      panelOffsetFrom: 'right',
      panelBaseZone: zone.id
    };
  }

  if (!data) return null;

  data.type = 'panel_box';
  data.linkedFrameId = baseObject.id;
  data.panelSide = edge;
  data.panelThickness = thickness;
  data.dimEnabled = false;

  return data;
}; // def MN_computePanelDataFromZone
//_________

/* =========================================================
   18. CREATE SINGLE PANEL FROM ZONE
   ========================================================= */
window.MN_createPanelFromZone = function(zone, edge, offsetValue = 0) {
  if (!zone || !edge) return null;

  const data = window.MN_computePanelDataFromZone(zone, edge, offsetValue);

  if (!data) return null;

  window.MN_AppState.demoObjects.push(data);

  return data;
}; // def MN_createPanelFromZone
//_________

/* =========================================================
   19. CREATE DIVIDED PANELS FROM ZONE
   ========================================================= */
window.MN_createDividedPanelsFromZone = function(zone, edge, partCount) {
  if (!zone || !edge) return [];
  if (!Number.isInteger(partCount) || partCount < 2) return [];

  const thickness = window.MN_getPanelThickness();
  const created = [];

  if (edge === 'bottom' || edge === 'top') {
    const clearEach = (zone.height - (partCount - 1) * thickness) / partCount;

    if (!Number.isFinite(clearEach) || clearEach <= 0) return [];

    for (let i = 1; i <= partCount - 1; i++) {
      const offset = clearEach * i + thickness * (i - 1);
      const panel = window.MN_createPanelFromZone(zone, 'bottom', offset);

      if (panel) {
        panel.name = 'Tấm chia ngang';
        panel.panelDivideCount = partCount;
        created.push(panel);
      }
    }
  }

  if (edge === 'left' || edge === 'right') {
    const clearEach = (zone.width - (partCount - 1) * thickness) / partCount;

    if (!Number.isFinite(clearEach) || clearEach <= 0) return [];

    for (let i = 1; i <= partCount - 1; i++) {
      const offset = clearEach * i + thickness * (i - 1);
      const panel = window.MN_createPanelFromZone(zone, 'left', offset);

      if (panel) {
        panel.name = 'Tấm chia đứng';
        panel.panelDivideCount = partCount;
        created.push(panel);
      }
    }
  }

  return created;
}; // def MN_createDividedPanelsFromZone
//_________

/* =========================================================
   20. PANEL TOOL CLICK
   ========================================================= */
window.MN_handlePanelClick = function(pos) {
  if (!window.MN_PanelTool || !pos) return false;
  if (window.MN_AppState.currentTool !== 'panel') return false;

  const hit = window.MN_PanelTool.hoverHit || window.MN_getPanelEdgeAt(pos.x, pos.y);

  if (!hit || !hit.zone || !hit.edge) {
    if (typeof window.MN_updateStatus === 'function') {
      window.MN_updateStatus('Vẽ Tấm: rê vào zone và gần cạnh zone để tạo tấm');
    }

    return true;
  }

  window.MN_PanelTool.inputBuffer = '';

  const panel = window.MN_createPanelFromZone(hit.zone, hit.edge, 0);

  if (typeof window.MN_updateStatus === 'function') {
    if (panel) {
      window.MN_updateStatus(`Đã tạo: ${panel.name} | Theo zone | Offset 0mm`);
    } else {
      window.MN_updateStatus('Vẽ Tấm: chưa tạo được tấm trong zone');
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
   21. PANEL TOOL KEY DOWN
   ========================================================= */
window.MN_handlePanelKeyDown = function(event) {
  if (!event || !window.MN_PanelTool) return false;
  if (!window.MN_AppState || window.MN_AppState.currentTool !== 'panel') return false;

  const hit = window.MN_PanelTool.hoverHit;

  if (!hit || !hit.zone || !hit.edge) return false;

  if (/^[0-9]$/.test(event.key)) {
    event.preventDefault();
    window.MN_PanelTool.inputBuffer += event.key;

    if (typeof window.MN_drawScene === 'function') {
      window.MN_drawScene();
    }

    return true;
  }

  if (event.key === '/') {
    event.preventDefault();

    if (window.MN_PanelTool.inputBuffer === '') {
      window.MN_PanelTool.inputBuffer = '/';
    }

    if (typeof window.MN_drawScene === 'function') {
      window.MN_drawScene();
    }

    return true;
  }

  if (event.key === '.') {
    event.preventDefault();

    if (
      window.MN_PanelTool.inputBuffer !== '' &&
      window.MN_PanelTool.inputBuffer[0] !== '/' &&
      !window.MN_PanelTool.inputBuffer.includes('.')
    ) {
      window.MN_PanelTool.inputBuffer += '.';
    }

    if (typeof window.MN_drawScene === 'function') {
      window.MN_drawScene();
    }

    return true;
  }

  if (event.key === 'Backspace') {
    event.preventDefault();
    window.MN_PanelTool.inputBuffer = window.MN_PanelTool.inputBuffer.slice(0, -1);

    if (typeof window.MN_drawScene === 'function') {
      window.MN_drawScene();
    }

    return true;
  }

  if (event.key === 'Escape') {
    event.preventDefault();
    window.MN_PanelTool.inputBuffer = '';

    if (typeof window.MN_drawScene === 'function') {
      window.MN_drawScene();
    }

    return true;
  }

  if (event.key === 'Enter') {
    event.preventDefault();

    const input = window.MN_getPanelPreviewInput();

    if (input.mode === 'divide') {
      const created = window.MN_createDividedPanelsFromZone(hit.zone, hit.edge, input.value);

      if (typeof window.MN_updateStatus === 'function') {
        window.MN_updateStatus(`Vẽ Tấm: chia zone /${input.value} | Tạo ${created.length} tấm`);
      }
    } else {
      const panel = window.MN_createPanelFromZone(hit.zone, hit.edge, input.value);

      if (typeof window.MN_updateStatus === 'function') {
        if (panel) {
          window.MN_updateStatus(`Đã tạo: ${panel.name} | Offset lọt lòng ${Math.round(input.value)}mm`);
        } else {
          window.MN_updateStatus('Vẽ Tấm: chưa tạo được tấm theo offset');
        }
      }
    }

    window.MN_PanelTool.inputBuffer = '';

    if (typeof window.MN_drawScene === 'function') {
      window.MN_drawScene();
    }

    if (typeof window.MN_drawMini3DPreview === 'function') {
      window.MN_drawMini3DPreview();
    }

    return true;
  }

  return false;
}; // def MN_handlePanelKeyDown
//_________

/* =========================================================
   22. DRAW ZONE HOVER
   ========================================================= */
window.MN_drawPanelZoneHover = function(hit) {
  if (!hit || !hit.rect) return;
  if (!window.MN_Canvas || !window.MN_Canvas.ctx) return;

  const ctx = window.MN_Canvas.ctx;
  const rect = hit.rect;

  ctx.save();

  ctx.fillStyle = 'rgba(255, 120, 180, 0.18)';
  ctx.strokeStyle = 'rgba(255, 80, 150, 0.65)';
  ctx.lineWidth = 1.5;

  ctx.beginPath();
  ctx.rect(rect.x, rect.y, rect.w, rect.h);
  ctx.fill();
  ctx.stroke();

  ctx.restore();
}; // def MN_drawPanelZoneHover
//_________

/* =========================================================
   23. DRAW PANEL PREVIEW LINE
   ========================================================= */
window.MN_drawPanelPreviewLine = function(hit) {
  if (!hit || !hit.zone || !hit.edge) return;
  if (!window.MN_Canvas || !window.MN_Canvas.ctx) return;

  const input = window.MN_getPanelPreviewInput();
  const ctx = window.MN_Canvas.ctx;
  const thickness = window.MN_getPanelThickness();

  let panelData = null;

  if (input.mode === 'divide') {
    panelData = null;
  } else {
    panelData = window.MN_computePanelDataFromZone(hit.zone, hit.edge, input.value);
  }

  const currentView = window.MN_AppState.currentView || 'front';
  let lines = [];

  if (input.mode === 'divide' && input.value) {
    const n = input.value;

    if (hit.edge === 'bottom' || hit.edge === 'top') {
      const clearEach = (hit.zone.height - (n - 1) * thickness) / n;

      if (clearEach > 0) {
        for (let i = 1; i <= n - 1; i++) {
          const z = hit.zone.minZ + clearEach * i + thickness * (i - 1);
          lines.push({
            x1: hit.zone.minX,
            y1: z,
            x2: hit.zone.maxX,
            y2: z
          });
        }
      }
    }

    if (hit.edge === 'left' || hit.edge === 'right') {
      const clearEach = (hit.zone.width - (n - 1) * thickness) / n;

      if (clearEach > 0) {
        for (let i = 1; i <= n - 1; i++) {
          const x = hit.zone.minX + clearEach * i + thickness * (i - 1);
          lines.push({
            x1: x,
            y1: hit.zone.minZ,
            x2: x,
            y2: hit.zone.maxZ
          });
        }
      }
    }
  }

  if (panelData) {
    if (hit.edge === 'bottom') {
      lines.push({
        x1: panelData.x,
        y1: panelData.z + panelData.height,
        x2: panelData.x + panelData.width,
        y2: panelData.z + panelData.height
      });
    }

    if (hit.edge === 'top') {
      lines.push({
        x1: panelData.x,
        y1: panelData.z,
        x2: panelData.x + panelData.width,
        y2: panelData.z
      });
    }

    if (hit.edge === 'left') {
      lines.push({
        x1: panelData.x + panelData.width,
        y1: panelData.z,
        x2: panelData.x + panelData.width,
        y2: panelData.z + panelData.height
      });
    }

    if (hit.edge === 'right') {
      lines.push({
        x1: panelData.x,
        y1: panelData.z,
        x2: panelData.x,
        y2: panelData.z + panelData.height
      });
    }
  }

  ctx.save();

  ctx.strokeStyle = '#ff6600';
  ctx.fillStyle = '#ff6600';
  ctx.lineWidth = 2.5;
  ctx.setLineDash([9, 5]);
  ctx.font = '12px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  lines.forEach(function(line) {
    let p1 = null;
    let p2 = null;

    if (currentView === 'front' || currentView === 'back') {
      p1 = window.MN_localToScreen(line.x1, line.y1);
      p2 = window.MN_localToScreen(line.x2, line.y2);
    }

    if (currentView === 'top' || currentView === 'bottom') {
      p1 = window.MN_localToScreen(line.x1, hit.zone.y);
      p2 = window.MN_localToScreen(line.x2, hit.zone.y + hit.zone.depth);
    }

    if (currentView === 'left' || currentView === 'right') {
      p1 = window.MN_localToScreen(hit.zone.y, line.y1);
      p2 = window.MN_localToScreen(hit.zone.y + hit.zone.depth, line.y2);
    }

    if (!p1 || !p2) return;

    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.stroke();
  });

  ctx.setLineDash([]);

  const label = input.mode === 'divide'
    ? `Chia zone ${window.MN_PanelTool.inputBuffer}`
    : `Offset lọt lòng ${Math.round(input.value || 0)}mm`;

  ctx.fillText(label, hit.rect.x + hit.rect.w / 2, hit.rect.y + hit.rect.h / 2);

  ctx.restore();
}; // def MN_drawPanelPreviewLine
//_________

/* =========================================================
   24. DRAW PANEL OVERLAY
   ========================================================= */
window.MN_drawPanelOverlay = function() {
  if (!window.MN_Canvas || !window.MN_Canvas.ctx || !window.MN_PanelTool) return;
  if (window.MN_AppState.currentTool !== 'panel') return;

  const hit = window.MN_PanelTool.hoverHit;

  if (!hit || !hit.zone) return;

  window.MN_drawPanelZoneHover(hit);
  window.MN_drawPanelPreviewLine(hit);
}; // def MN_drawPanelOverlay
//_________