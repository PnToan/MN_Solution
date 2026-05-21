/* =========================================================
   MN_SOLUTION - MOUSE MANAGER
   File: scripts/managers/mouse-manager.js
   ========================================================= */

/* =========================================================
   01. MOUSE STATE
========================================================= */
  window.MN_MouseManager = {
    isMiddleDown: false,
    lastX: 0,
    lastY: 0
  };

/* =========================================================
   02. INIT MOUSE MANAGER
========================================================= */
  window.MN_initMouseManager = function() {
    const canvas = document.getElementById('drawCanvas');

    if (!canvas) {
      console.warn('MN_initMouseManager: Không tìm thấy #drawCanvas');
      return;
    }

    canvas.addEventListener('mousedown', window.MN_onCanvasMouseDown);
    canvas.addEventListener('mouseup', window.MN_onCanvasMouseUp);
    canvas.addEventListener('mousemove', window.MN_onCanvasMouseMove);
    canvas.addEventListener('wheel', window.MN_onCanvasWheel, { passive: false });
    canvas.addEventListener('contextmenu', window.MN_onCanvasContextMenu);

    window.addEventListener('mouseup', window.MN_onCanvasMouseUp);
  }; // def MN_initMouseManager
  //_________

/* =========================================================
   03. GET CANVAS MOUSE POSITION
========================================================= */
  window.MN_getCanvasMousePosition = function(event) {
    const canvas = document.getElementById('drawCanvas');
    const rect = canvas.getBoundingClientRect();

    return {
      x: Math.round(event.clientX - rect.left),
      y: Math.round(event.clientY - rect.top)
    };
  }; // def MN_getCanvasMousePosition
  //_________

/* =========================================================
   04. MOUSE DOWN
========================================================= */
  window.MN_onCanvasMouseDown = function(event) {
    const pos = window.MN_getCanvasMousePosition(event);

    if (event.button === 0) {
      const dimArea = typeof window.MN_getDimHitAreaAt === 'function'
        ? window.MN_getDimHitAreaAt(pos.x, pos.y)
        : null;

      if (dimArea) {
        event.preventDefault();
        event.stopPropagation();

        if (typeof window.MN_openDimInlineEditor === 'function') {
          window.MN_openDimInlineEditor(dimArea);
        }

        return;
      }

      window.MN_onLeftClick(pos, event);
    }

    if (event.button === 1) {
      event.preventDefault();

      window.MN_MouseManager.isMiddleDown = true;
      window.MN_MouseManager.lastX = pos.x;
      window.MN_MouseManager.lastY = pos.y;

      if (typeof window.MN_startPan === 'function') {
        window.MN_startPan(pos.x, pos.y);
      }

      if (typeof window.MN_updateStatus === 'function') {
        window.MN_updateStatus('Đang pan bằng chuột giữa');
      }
    }

    if (event.button === 2) {
      window.MN_onRightClick(pos, event);
    }
  }; // def MN_onCanvasMouseDown
  //_________
/* =========================================================
   05. MOUSE UP
========================================================= */
  window.MN_onCanvasMouseUp = function(event) {
    if (window.MN_MouseManager.isMiddleDown) {
      window.MN_MouseManager.isMiddleDown = false;

      if (typeof window.MN_endPan === 'function') {
        window.MN_endPan();
      }

      if (typeof window.MN_updateStatus === 'function') {
        window.MN_updateStatus('Kết thúc pan');
      }
    }
  }; // def MN_onCanvasMouseUp
  //_________
/* =========================================================
   06. MOUSE MOVE
========================================================= */
  window.MN_onCanvasMouseMove = function(event) {
    const pos = window.MN_getCanvasMousePosition(event);
    const canvas = document.getElementById('drawCanvas');

    window.MN_setMousePosition(pos.x, pos.y);

    if (window.MN_MouseManager.isMiddleDown) {
      if (canvas) {
        canvas.style.cursor = 'grabbing';
      }

      if (typeof window.MN_updatePan === 'function') {
        window.MN_updatePan(pos.x, pos.y);
      }
    } else {
      const dimArea = typeof window.MN_getDimHitAreaAt === 'function'
        ? window.MN_getDimHitAreaAt(pos.x, pos.y)
        : null;

      const moveChanged = typeof window.MN_updateMoveHover === 'function'
        ? window.MN_updateMoveHover(pos)
        : false;

      const panelChanged = typeof window.MN_updatePanelHover === 'function'
        ? window.MN_updatePanelHover(pos)
        : false;

      if (canvas) {
        if (window.MN_AppState.currentTool === 'move' && window.MN_MoveTool) {
          canvas.style.cursor = window.MN_MoveTool.isMoving || window.MN_MoveTool.hoverCornerKey
            ? 'crosshair'
            : (window.MN_MoveTool.hoverObjectId ? 'pointer' : 'default');
        } else if (window.MN_AppState.currentTool === 'panel' && window.MN_PanelTool) {
          canvas.style.cursor = window.MN_PanelTool.hoverEdge ? 'crosshair' : 'default';
        } else {
          canvas.style.cursor = dimArea ? 'pointer' : 'default';
        }
      }

      if ((moveChanged || panelChanged) && typeof window.MN_drawScene === 'function') {
        window.MN_drawScene();
      }
    }

    if (typeof window.MN_updateViewportInfo === 'function') {
      window.MN_updateViewportInfo(pos.x, pos.y);
    }
  }; // def MN_onCanvasMouseMove
  //_________
/* =========================================================
   07. MOUSE WHEEL ZOOM
========================================================= */
  window.MN_onCanvasWheel = function(event) {
    event.preventDefault();

    if (event.deltaY < 0) {
      if (typeof window.MN_zoomIn === 'function') {
        window.MN_zoomIn();
      }
    } else {
      if (typeof window.MN_zoomOut === 'function') {
        window.MN_zoomOut();
      }
    }
  }; // def MN_onCanvasWheel
  //_________
/* =========================================================
   08. CONTEXT MENU
========================================================= */
  window.MN_onCanvasContextMenu = function(event) {
    event.preventDefault();
  }; // def MN_onCanvasContextMenu
  //_________

/* =========================================================
   09. LEFT CLICK
========================================================= */
  window.MN_onLeftClick = function(pos, event) {
    const dimArea = typeof window.MN_getDimHitAreaAt === 'function'
      ? window.MN_getDimHitAreaAt(pos.x, pos.y)
      : null;

    if (dimArea) {
      if (typeof window.MN_openDimInlineEditor === 'function') {
        window.MN_openDimInlineEditor(dimArea);
      }
      return;
    }

    if (window.MN_AppState.currentTool === 'move') {
      if (typeof window.MN_handleMoveClick === 'function') {
        window.MN_handleMoveClick(pos);
      }
      return;
    }

    if (window.MN_AppState.currentTool === 'panel') {
      if (typeof window.MN_handlePanelClick === 'function') {
        window.MN_handlePanelClick(pos);
      }
      return;
    }

    if (typeof window.MN_updateStatus === 'function') {
      window.MN_updateStatus(`Click trái: X ${pos.x}, Y ${pos.y}`);
    }
  }; // def MN_onLeftClick
  //_________
/* =========================================================
   10. RIGHT CLICK
========================================================= */
  window.MN_onRightClick = function(pos, event) {
    event.preventDefault();

    if (typeof window.MN_updateStatus === 'function') {
      window.MN_updateStatus(`Click phải: X ${pos.x}, Y ${pos.y}`);
    }
  }; // def MN_onRightClick
  //_________