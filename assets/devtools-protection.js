(() => {
  const overlay = document.getElementById('protection-overlay');
  const messageEl = document.getElementById('protection-message');
  const blockMessage = '請關閉開發者模式後才可以繼續閱覽網頁。';
  let hideTimer = 0;
  let scrubTimer = 0;
  let lockedByDevTools = false;

  if (!overlay || !messageEl) {
    return;
  }

  function setOverlayVisible(visible, message = blockMessage) {
    window.clearTimeout(hideTimer);
    messageEl.textContent = message;
    overlay.classList.toggle('is-visible', visible);
    overlay.setAttribute('aria-hidden', visible ? 'false' : 'true');
  }

  function hideNotice() {
    if (lockedByDevTools) {
      return;
    }

    setOverlayVisible(false);
  }

  function showNotice(message, duration = 1800) {
    if (lockedByDevTools) {
      setOverlayVisible(true, blockMessage);
      return;
    }

    setOverlayVisible(true, message);
    hideTimer = window.setTimeout(hideNotice, duration);
  }

  function lockForDevTools() {
    if (!lockedByDevTools) {
      lockedByDevTools = true;
      document.documentElement.classList.add('protection-locked');
    }

    setOverlayVisible(true, blockMessage);
  }

  function unlockForDevTools() {
    if (!lockedByDevTools) {
      return;
    }

    lockedByDevTools = false;
    document.documentElement.classList.remove('protection-locked');
    setOverlayVisible(false);
  }

  function scrubScreen(message = '畫面暫時遮蔽。') {
    window.clearTimeout(scrubTimer);
    document.documentElement.classList.add('protection-scrub');
    showNotice(message, 1800);
    scrubTimer = window.setTimeout(() => {
      document.documentElement.classList.remove('protection-scrub');
    }, 1800);
  }

  function isBlockedShortcut(event) {
    const key = String(event.key || '').toLowerCase();
    const code = String(event.code || '').toLowerCase();
    const hasPrimary = event.ctrlKey || event.metaKey;
    const isPrintScreen = key === 'printscreen' || code === 'printscreen';
    const isF12 = key === 'f12' || code === 'f12';
    const isDeveloperChord = hasPrimary && event.shiftKey && ['i', 'j', 'c'].includes(key);
    const isMacDeveloperChord = event.metaKey && event.altKey && ['i', 'j', 'c'].includes(key);
    const isSourceView = hasPrimary && key === 'u';

    if (isPrintScreen) {
      return 'printscreen';
    }

    return isF12 || isDeveloperChord || isMacDeveloperChord || isSourceView;
  }

  function areDevToolsLikelyOpen() {
    if (window.outerWidth <= 640 || window.outerHeight <= 480) {
      return false;
    }

    const widthGap = Math.max(0, window.outerWidth - window.innerWidth);
    const heightGap = Math.max(0, window.outerHeight - window.innerHeight);
    return widthGap > 170 || heightGap > 170;
  }

  function refreshDevToolsState() {
    if (areDevToolsLikelyOpen()) {
      lockForDevTools();
      return;
    }

    unlockForDevTools();
  }

  document.addEventListener('contextmenu', event => {
    event.preventDefault();
    showNotice('此頁已關閉右鍵選單。', 1300);
  }, true);

  document.addEventListener('keydown', event => {
    const blocked = isBlockedShortcut(event);
    if (!blocked) {
      return;
    }

    event.preventDefault();
    event.stopImmediatePropagation();

    if (blocked === 'printscreen') {
      scrubScreen();
      return;
    }

    showNotice(blockMessage, 2200);
    window.setTimeout(refreshDevToolsState, 80);
  }, true);

  document.addEventListener('keyup', event => {
    const key = String(event.key || '').toLowerCase();
    const code = String(event.code || '').toLowerCase();
    if (key === 'printscreen' || code === 'printscreen') {
      scrubScreen();
    }
  }, true);

  window.addEventListener('resize', refreshDevToolsState);
  document.addEventListener('visibilitychange', refreshDevToolsState);
  overlay.addEventListener('click', () => {
    if (!lockedByDevTools) {
      hideNotice();
    }
  });

  refreshDevToolsState();
  window.setInterval(refreshDevToolsState, 700);
})();