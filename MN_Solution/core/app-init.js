/* =========================================================
   MN_SOLUTION - APP INIT
   File: core/app-init.js
   ========================================================= */

/* =========================================================
   01. INIT APP
   ========================================================= */
window.MN_initApp = function() {
  if (typeof window.MN_applyDefaultCanvasSettings === 'function') {
    window.MN_applyDefaultCanvasSettings();
  }

  if (typeof window.MN_initCanvas === 'function') {
    window.MN_initCanvas();
  }

  if (typeof window.MN_initToolManager === 'function') {
    window.MN_initToolManager();
  }

  if (typeof window.MN_initMouseManager === 'function') {
    window.MN_initMouseManager();
  }

  if (typeof window.MN_initShortcutManager === 'function') {
    window.MN_initShortcutManager();
  }

  window.MN_bindViewportControls();
  window.MN_bindParameterInputs();
  window.MN_bindLibraryBar();

  if (typeof window.MN_updateViewportInfo === 'function') {
    window.MN_updateViewportInfo();
  }

  if (typeof window.MN_updateStatus === 'function') {
    window.MN_updateStatus('Sẵn sàng');
  }
}; // def MN_initApp
//_________

/* =========================================================
   02. BIND VIEWPORT CONTROLS
   ========================================================= */
window.MN_bindViewportControls = function() {
  const btnZoomIn = document.getElementById('btnZoomIn');
  const btnZoomOut = document.getElementById('btnZoomOut');
  const btnFit = document.getElementById('btnFit');
  const btnGrid = document.getElementById('btnGrid');

  if (btnZoomIn && typeof window.MN_zoomIn === 'function') {
    btnZoomIn.addEventListener('click', window.MN_zoomIn);
  }

  if (btnZoomOut && typeof window.MN_zoomOut === 'function') {
    btnZoomOut.addEventListener('click', window.MN_zoomOut);
  }

  if (btnFit && typeof window.MN_fitView === 'function') {
    btnFit.addEventListener('click', window.MN_fitView);
  }

  if (btnGrid && typeof window.MN_toggleGrid === 'function') {
    btnGrid.addEventListener('click', window.MN_toggleGrid);
  }
}; // def MN_bindViewportControls
//_________

/* =========================================================
   03. BIND CANVAS MOUSE
   ========================================================= */
window.MN_bindCanvasMouse = function() {
  const canvas = document.getElementById('drawCanvas');

  if (!canvas) return;

  canvas.addEventListener('mousemove', (event) => {
    const rect = canvas.getBoundingClientRect();
    const x = Math.round(event.clientX - rect.left);
    const y = Math.round(event.clientY - rect.top);

    window.MN_setMousePosition(x, y);

    if (typeof window.MN_updateViewportInfo === 'function') {
      window.MN_updateViewportInfo(x, y);
    }
  });
}; // def MN_bindCanvasMouse
//_________

/* =========================================================
   04. BIND PARAMETER INPUTS
   ========================================================= */
window.MN_bindParameterInputs = function() {
  const inputWidth = document.getElementById('inputWidthBottom');
  const inputHeight = document.getElementById('inputDepthBottom');
  const inputThickness = document.getElementById('inputThicknessBottom');

  if (inputWidth) {
    inputWidth.addEventListener('input', () => {
      if (typeof window.MN_drawScene === 'function') {
        window.MN_drawScene();
      }
    });
  }

  if (inputHeight) {
    inputHeight.addEventListener('input', () => {
      if (typeof window.MN_drawScene === 'function') {
        window.MN_drawScene();
      }
    });
  }
  if (inputThickness) {
    inputThickness.addEventListener('input', () => {
      if (typeof window.MN_drawScene === 'function') {
        window.MN_drawScene();
      }

      if (typeof window.MN_updateStatus === 'function') {
        window.MN_updateStatus(`Dày tấm: ${inputThickness.value}`);
      }
    });
  }
}; // def MN_bindParameterInputs
//_________

/* =========================================================
   05. DOM READY
   ========================================================= */
document.addEventListener('DOMContentLoaded', () => {
  window.MN_initApp();

  window.addEventListener('resize', () => {
    if (typeof window.MN_resizeCanvas === 'function') {
      window.MN_resizeCanvas();
    }
  });
});
/* =========================================================
   05. BIND LIBRARY BAR
   ========================================================= */
window.MN_bindLibraryBar = function() {
  const libraryBar = document.querySelector('.mn-library-bar');
  const mainLibraryBtn = document.querySelector('.mn-library-tab[data-library-main="library"]');
  const categoryButtons = document.querySelectorAll('.mn-library-category');
  const libraryItems = document.querySelectorAll('.mn-library-item');

  if (!libraryBar || !mainLibraryBtn) return;

  mainLibraryBtn.addEventListener('click', () => {
    const isOpen = libraryBar.classList.toggle('library-open');

    mainLibraryBtn.classList.toggle('active', isOpen);

    categoryButtons.forEach((btn) => {
      btn.classList.remove('active');
    });

    libraryItems.forEach((item) => {
      item.classList.remove('active');
      item.classList.remove('show');
    });

    window.MN_setCurrentLibraryTab(isOpen ? 'library' : '');
    window.MN_setCurrentLibrary('');

    if (typeof window.MN_updateStatus === 'function') {
      window.MN_updateStatus(isOpen ? 'Mở thư viện' : 'Đóng thư viện');
    }
  });

  categoryButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const categoryName = btn.dataset.libraryCategory;

      categoryButtons.forEach((item) => item.classList.remove('active'));
      btn.classList.add('active');

      libraryItems.forEach((item) => {
        item.classList.remove('active');

        if (item.dataset.parent === categoryName) {
          item.classList.add('show');
        } else {
          item.classList.remove('show');
        }
      });

      window.MN_setCurrentLibraryTab(categoryName);
      window.MN_setCurrentLibrary('');

      if (typeof window.MN_updateStatus === 'function') {
        window.MN_updateStatus(`Nhóm: ${btn.textContent.trim()}`);
      }
    });
  });

  libraryItems.forEach((item) => {
    item.addEventListener('click', () => {
      libraryItems.forEach((lib) => lib.classList.remove('active'));
      item.classList.add('active');

      const libraryName = item.dataset.library;
      window.MN_setCurrentLibrary(libraryName);

      if (typeof window.MN_updateStatus === 'function') {
        window.MN_updateStatus(`Thư viện: ${item.textContent.trim()}`);
      }
    });
  });
}; // def MN_bindLibraryBar
//_________