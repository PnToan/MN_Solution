/* =========================================================
   MN_SOLUTION - APP STATE
   File: core/app-state.js
   ========================================================= */

/* =========================================================
   01. GLOBAL APP STATE
   ========================================================= */
window.MN_AppState = {
  appName: 'MN_Solution',
  appVersion: '0.1.0',
  appMode: 'offline',

  currentApp: 'MN_Drawing',
  currentTool: 'select',
  currentView: 'top',
  currentLibraryTab: 'library',
  currentLibrary: 'frame',

  zoom: 1,
  showGrid: true,

  panelSettings: {
    thickness: 18
  },

canvas: {
  width: 0,
  height: 0,
  panX: 0,
  panY: 0,

  rulerTopHeight: 28,
  rulerLeftWidth: 42,

  localOriginRatioX: 0.2,
  localOriginRatioY: 0.8,

  localOriginX: 0,
  localOriginY: 0,
  localScale: 0.5,

  localAxisLocked: true
},

  mouse: {
    x: 0,
    y: 0
  },

  objects: [],

  demoObjects: [
    {
      id: 'basic_frame_001',
      type: 'basic_box',
      name: 'Khung cơ bản',
      width: 1200,
      height: 2200,
      depth: 580,
      x: 1000,
      y: 420,
      z: 0,
      dimEnabled: true
    }
  ],

  selection: {
    activeObjectId: null,
    selectedObjectIds: []
  }
};

/* =========================================================
   02. STATE HELPERS
   ========================================================= */
window.MN_setCurrentTool = function(toolName) {
  window.MN_AppState.currentTool = toolName;
}; // def MN_setCurrentTool
//_________
window.MN_setCurrentView = function(viewName) {
  window.MN_AppState.currentView = viewName;
}; // def MN_setCurrentView
//_________
window.MN_setCurrentLibrary = function(libraryName) {
  window.MN_AppState.currentLibrary = libraryName;
}; // def MN_setCurrentLibrary
//_________

window.MN_setZoom = function(zoomValue) {
  window.MN_AppState.zoom = zoomValue;
}; // def MN_setZoom
//_________

window.MN_setMousePosition = function(x, y) {
  window.MN_AppState.mouse.x = x;
  window.MN_AppState.mouse.y = y;
}; // def MN_setMousePosition
//_________