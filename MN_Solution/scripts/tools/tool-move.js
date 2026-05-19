/* =========================================================
   MN_SOLUTION - TOOL MOVE
   File: scripts/tools/tool-move.js
   ========================================================= */

/* =========================================================
   01. MOVE TOOL STATE
   ========================================================= */
window.MN_MoveTool = {
  hoverObjectId: null,
  hoverCornerKey: null,
  isMoving: false,
  activeObjectId: null,
  activeCornerKey: null,
  startObject: null,
  startAnchor: null,
  currentTarget: null,
  previewDeltaA: 0,
  previewDeltaB: 0,
  targetObjectId: null,
  targetCornerKey: null,
  targetSnapPoint: null
};

/* =========================================================
   02. RESET MOVE TOOL
   ========================================================= */
window.MN_resetMoveTool = function() {
  if (!window.MN_MoveTool) return;

  window.MN_MoveTool.hoverObjectId = null;
  window.MN_MoveTool.hoverCornerKey = null;
  window.MN_MoveTool.isMoving = false;
  window.MN_MoveTool.activeObjectId = null;
  window.MN_MoveTool.activeCornerKey = null;
  window.MN_MoveTool.startObject = null;
  window.MN_MoveTool.startAnchor = null;
  window.MN_MoveTool.currentTarget = null;
  window.MN_MoveTool.previewDeltaA = 0;
  window.MN_MoveTool.previewDeltaB = 0;
  window.MN_MoveTool.targetObjectId = null;
  window.MN_MoveTool.targetCornerKey = null;
  window.MN_MoveTool.targetSnapPoint = null;
}; // def MN_resetMoveTool
//_________

/* =========================================================
   03. GET CURRENT VIEW AXES
   ========================================================= */
window.MN_getMoveViewAxes = function() {
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
}; // def MN_getMoveViewAxes
//_________

/* =========================================================
   04. GET MOVABLE OBJECTS
   ========================================================= */
window.MN_getMoveObjects = function() {
  if (!window.MN_AppState) return [];

  const objects = [];

  if (Array.isArray(window.MN_AppState.objects)) {
    window.MN_AppState.objects.forEach(function(obj) {
      if (obj && obj.id) {
        objects.push(obj);
      }
    });
  }

  if (Array.isArray(window.MN_AppState.demoObjects)) {
    window.MN_AppState.demoObjects.forEach(function(obj) {
      if (obj && obj.id) {
        objects.push(obj);
      }
    });
  }

  return objects;
}; // def MN_getMoveObjects
//_________

/* =========================================================
   05. GET OBJECT MOVE RECT
   ========================================================= */
window.MN_getMoveObjectRect = function(obj, deltaA = 0, deltaB = 0) {
  if (!obj || typeof window.MN_localToScreen !== 'function') return null;

  const axes = window.MN_getMoveViewAxes();
  const localA = Number(obj[axes.axisA] || 0) + deltaA;
  const localB = Number(obj[axes.axisB] || 0) + deltaB;
  const sizeA = Number(obj[axes.sizeA] || 0);
  const sizeB = Number(obj[axes.sizeB] || 0);

  if (!Number.isFinite(localA) || !Number.isFinite(localB)) return null;
  if (!Number.isFinite(sizeA) || !Number.isFinite(sizeB)) return null;
  if (sizeA <= 0 || sizeB <= 0) return null;

  const p1 = window.MN_localToScreen(localA, localB);
  const p2 = window.MN_localToScreen(localA + sizeA, localB + sizeB);

  const x = Math.min(p1.x, p2.x);
  const y = Math.min(p1.y, p2.y);
  const w = Math.abs(p2.x - p1.x);
  const h = Math.abs(p2.y - p1.y);

  return {
    objectId: obj.id,
    axisA: axes.axisA,
    axisB: axes.axisB,
    sizeA: axes.sizeA,
    sizeB: axes.sizeB,
    localA: localA,
    localB: localB,
    widthA: sizeA,
    heightB: sizeB,
    screenX: x,
    screenY: y,
    screenW: w,
    screenH: h,
    corners: [
      {
        key: 'left_bottom',
        localA: localA,
        localB: localB,
        screen: window.MN_localToScreen(localA, localB)
      },
      {
        key: 'right_bottom',
        localA: localA + sizeA,
        localB: localB,
        screen: window.MN_localToScreen(localA + sizeA, localB)
      },
      {
        key: 'right_top',
        localA: localA + sizeA,
        localB: localB + sizeB,
        screen: window.MN_localToScreen(localA + sizeA, localB + sizeB)
      },
      {
        key: 'left_top',
        localA: localA,
        localB: localB + sizeB,
        screen: window.MN_localToScreen(localA, localB + sizeB)
      }
    ]
  };
}; // def MN_getMoveObjectRect
//_________

/* =========================================================
   06. HIT TEST MOVE OBJECT
   ========================================================= */
window.MN_getMoveObjectAt = function(screenX, screenY) {
  const objects = window.MN_getMoveObjects();
  const snapDistance = 24;

  for (let i = objects.length - 1; i >= 0; i--) {
    const rect = window.MN_getMoveObjectRect(objects[i]);
    if (!rect) continue;

    const nearRect =
      screenX >= rect.screenX - snapDistance &&
      screenX <= rect.screenX + rect.screenW + snapDistance &&
      screenY >= rect.screenY - snapDistance &&
      screenY <= rect.screenY + rect.screenH + snapDistance;

    if (nearRect) {
      return {
        object: objects[i],
        rect: rect
      };
    }
  }

  return null;
}; // def MN_getMoveObjectAt
//_________

/* =========================================================
   07. HIT TEST MOVE CORNER
   ========================================================= */
window.MN_getMoveCornerAt = function(screenX, screenY) {
  const objects = window.MN_getMoveObjects();
  const hitRadius = 14;

  for (let i = objects.length - 1; i >= 0; i--) {
    const obj = objects[i];
    const rect = window.MN_getMoveObjectRect(obj);
    if (!rect) continue;

    for (let c = 0; c < rect.corners.length; c++) {
      const corner = rect.corners[c];
      const dx = screenX - corner.screen.x;
      const dy = screenY - corner.screen.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance <= hitRadius) {
        return {
          object: obj,
          rect: rect,
          corner: corner
        };
      }
    }
  }

  return null;
}; // def MN_getMoveCornerAt
//_________
/* =========================================================
   07.1. HIT TEST TARGET SNAP CORNER
   ========================================================= */
window.MN_getMoveTargetSnapAt = function(screenX, screenY) {
  const objects = window.MN_getMoveObjects();
  const hitRadius = 16;
  const activeObjectId = window.MN_MoveTool ? window.MN_MoveTool.activeObjectId : null;

  for (let i = objects.length - 1; i >= 0; i--) {
    const obj = objects[i];

    if (obj.id === activeObjectId) {
      continue;
    }

    const rect = window.MN_getMoveObjectRect(obj);
    if (!rect) continue;

    for (let c = 0; c < rect.corners.length; c++) {
      const corner = rect.corners[c];
      const dx = screenX - corner.screen.x;
      const dy = screenY - corner.screen.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance <= hitRadius) {
        return {
          object: obj,
          rect: rect,
          corner: corner
        };
      }
    }
  }

  return null;
}; // def MN_getMoveTargetSnapAt
//_________
/* =========================================================
   08. UPDATE MOVE HOVER
   ========================================================= */
window.MN_updateMoveHover = function(pos) {
  if (!window.MN_MoveTool || !pos) return false;
  if (window.MN_AppState.currentTool !== 'move') return false;

  const oldObjectId = window.MN_MoveTool.hoverObjectId;
  const oldCornerKey = window.MN_MoveTool.hoverCornerKey;
  const oldTargetObjectId = window.MN_MoveTool.targetObjectId;
  const oldTargetCornerKey = window.MN_MoveTool.targetCornerKey;

  if (window.MN_MoveTool.isMoving) {
    const snapHit = typeof window.MN_getMoveTargetSnapAt === 'function'
      ? window.MN_getMoveTargetSnapAt(pos.x, pos.y)
      : null;

    let targetPoint = window.MN_screenToLocal(pos.x, pos.y);

    if (snapHit && snapHit.corner) {
      targetPoint = {
        x: snapHit.corner.localA,
        y: snapHit.corner.localB
      };

      window.MN_MoveTool.targetObjectId = snapHit.object.id;
      window.MN_MoveTool.targetCornerKey = snapHit.corner.key;
      window.MN_MoveTool.targetSnapPoint = targetPoint;
    } else {
      window.MN_MoveTool.targetObjectId = null;
      window.MN_MoveTool.targetCornerKey = null;
      window.MN_MoveTool.targetSnapPoint = null;
    }

    window.MN_MoveTool.currentTarget = targetPoint;
    window.MN_MoveTool.previewDeltaA = targetPoint.x - window.MN_MoveTool.startAnchor.localA;
    window.MN_MoveTool.previewDeltaB = targetPoint.y - window.MN_MoveTool.startAnchor.localB;
  } else {
    const cornerHit = window.MN_getMoveCornerAt(pos.x, pos.y);
    const objectHit = cornerHit || window.MN_getMoveObjectAt(pos.x, pos.y);

    window.MN_MoveTool.hoverObjectId = objectHit ? objectHit.object.id : null;
    window.MN_MoveTool.hoverCornerKey = cornerHit ? cornerHit.corner.key : null;
    window.MN_MoveTool.targetObjectId = null;
    window.MN_MoveTool.targetCornerKey = null;
    window.MN_MoveTool.targetSnapPoint = null;
  }

  return oldObjectId !== window.MN_MoveTool.hoverObjectId ||
    oldCornerKey !== window.MN_MoveTool.hoverCornerKey ||
    oldTargetObjectId !== window.MN_MoveTool.targetObjectId ||
    oldTargetCornerKey !== window.MN_MoveTool.targetCornerKey ||
    window.MN_MoveTool.isMoving;
}; // def MN_updateMoveHover
//_________

/* =========================================================
   09. MOVE TOOL CLICK
   ========================================================= */
window.MN_handleMoveClick = function(pos) {
  if (!window.MN_MoveTool || !pos) return false;
  if (window.MN_AppState.currentTool !== 'move') return false;

  if (window.MN_MoveTool.isMoving) {
    const tool = window.MN_MoveTool;
    const obj = window.MN_getMoveObjects().find(function(item) {
      return item.id === tool.activeObjectId;
    });

    if (!obj || !tool.startObject || !tool.startAnchor) {
      window.MN_resetMoveTool();
      return true;
    }

    const localPoint = tool.targetSnapPoint || window.MN_screenToLocal(pos.x, pos.y);
    const deltaA = localPoint.x - tool.startAnchor.localA;
    const deltaB = localPoint.y - tool.startAnchor.localB;
    const axes = window.MN_getMoveViewAxes();

    obj[axes.axisA] = Math.round(Number(tool.startObject[axes.axisA] || 0) + deltaA);
    obj[axes.axisB] = Math.round(Number(tool.startObject[axes.axisB] || 0) + deltaB);

    window.MN_resetMoveTool();

    if (typeof window.MN_updateStatus === 'function') {
      window.MN_updateStatus(`Đã Move: ${obj.name || obj.id}`);
    }

    if (typeof window.MN_drawScene === 'function') {
      window.MN_drawScene();
    }

    return true;
  }

  const cornerHit = window.MN_getMoveCornerAt(pos.x, pos.y);

  if (!cornerHit) {
    if (typeof window.MN_updateStatus === 'function') {
      window.MN_updateStatus('Move: rê vào khung và click 1 góc để lấy điểm gốc');
    }
    return true;
  }

  window.MN_MoveTool.isMoving = true;
  window.MN_MoveTool.activeObjectId = cornerHit.object.id;
  window.MN_MoveTool.activeCornerKey = cornerHit.corner.key;
  window.MN_MoveTool.startObject = Object.assign({}, cornerHit.object);
  window.MN_MoveTool.startAnchor = {
    localA: cornerHit.corner.localA,
    localB: cornerHit.corner.localB,
    screenX: cornerHit.corner.screen.x,
    screenY: cornerHit.corner.screen.y
  };
  window.MN_MoveTool.currentTarget = window.MN_screenToLocal(pos.x, pos.y);
  window.MN_MoveTool.previewDeltaA = 0;
  window.MN_MoveTool.previewDeltaB = 0;

  if (typeof window.MN_updateStatus === 'function') {
    window.MN_updateStatus('Move: chọn điểm đích rồi click để đặt khung');
  }

  if (typeof window.MN_drawScene === 'function') {
    window.MN_drawScene();
  }

  return true;
}; // def MN_handleMoveClick
//_________

/* =========================================================
   10. DRAW MOVE OVERLAY
   ========================================================= */
window.MN_drawMoveOverlay = function() {
  if (!window.MN_Canvas || !window.MN_Canvas.ctx || !window.MN_MoveTool) return;
  if (window.MN_AppState.currentTool !== 'move') return;

  const ctx = window.MN_Canvas.ctx;
  const tool = window.MN_MoveTool;
  const objects = window.MN_getMoveObjects();

  let targetObject = null;

  if (tool.isMoving) {
    targetObject = objects.find(function(obj) {
      return obj.id === tool.activeObjectId;
    });
  } else if (tool.hoverObjectId) {
    targetObject = objects.find(function(obj) {
      return obj.id === tool.hoverObjectId;
    });
  }

  ctx.save();

  if (tool.isMoving) {
    objects.forEach(function(obj) {
      if (obj.id === tool.activeObjectId) return;

      const snapRect = window.MN_getMoveObjectRect(obj);
      if (!snapRect) return;

      snapRect.corners.forEach(function(corner) {
        const isTarget =
          obj.id === tool.targetObjectId &&
          corner.key === tool.targetCornerKey;

        ctx.beginPath();
        ctx.fillStyle = isTarget ? '#ff6600' : '#ffffff';
        ctx.strokeStyle = '#ff6600';
        ctx.lineWidth = 2;
        ctx.arc(corner.screen.x, corner.screen.y, isTarget ? 7 : 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      });
    });
  }

  if (!targetObject) {
    ctx.restore();
    return;
  }

  const deltaA = tool.isMoving ? tool.previewDeltaA : 0;
  const deltaB = tool.isMoving ? tool.previewDeltaB : 0;
  const rect = window.MN_getMoveObjectRect(targetObject, deltaA, deltaB);

  if (!rect) {
    ctx.restore();
    return;
  }

  if (tool.isMoving) {
    ctx.setLineDash([8, 5]);
    ctx.strokeStyle = '#ff6600';
    ctx.lineWidth = 2;
    ctx.strokeRect(rect.screenX, rect.screenY, rect.screenW, rect.screenH);
    ctx.setLineDash([]);

    const targetCorner = rect.corners.find(function(corner) {
      return corner.key === tool.activeCornerKey;
    });

    if (targetCorner && tool.startAnchor) {
      ctx.beginPath();
      ctx.strokeStyle = '#ff6600';
      ctx.lineWidth = 1.5;
      ctx.moveTo(tool.startAnchor.screenX, tool.startAnchor.screenY);
      ctx.lineTo(targetCorner.screen.x, targetCorner.screen.y);
      ctx.stroke();
    }
  }

  rect.corners.forEach(function(corner) {
    const isActive = corner.key === tool.activeCornerKey || corner.key === tool.hoverCornerKey;

    ctx.beginPath();
    ctx.fillStyle = isActive ? '#ff6600' : '#ffffff';
    ctx.strokeStyle = '#ff6600';
    ctx.lineWidth = 2;
    ctx.arc(corner.screen.x, corner.screen.y, isActive ? 6 : 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  });

  ctx.restore();
}; // def MN_drawMoveOverlay
//_________
