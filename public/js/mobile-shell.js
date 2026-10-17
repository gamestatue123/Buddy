/* Buddy · mobile shell (menu, profile sheet, gestures)
   Shared by every page. Made by Gamestatue */
(function () {
  'use strict';
  var $ = function (id) { return document.getElementById(id); };
  var bd = $('_mbd'), menu = $('_mMenu'), mdr = $('_mdrw'), mdbd = $('_mdbd'), mrt = $('_mRight'), mdc = $('_mdc');
  var sb = $('buddySidebar') || document.querySelector('.sidebar');

  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (m) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]; }); }

  /* ── side menu ── */
  function openSb() { if (sb) sb.classList.add('mob-open'); if (bd) bd.classList.add('on'); }
  function closeSb() { if (sb) sb.classList.remove('mob-open'); if (bd) bd.classList.remove('on'); }
  if (menu) menu.addEventListener('click', openSb);
  if (bd) bd.addEventListener('click', closeSb);
  document.querySelectorAll('.sidebar a').forEach(function (a) { a.addEventListener('click', closeSb); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') { closeSb(); closeDr(); } });

  /* swipe: drag left to close the menu, drag in from the left edge to open it */
  var tx = 0, ty = 0;
  document.addEventListener('touchstart', function (e) { tx = e.touches[0].clientX; ty = e.touches[0].clientY; }, { passive: true });
  document.addEventListener('touchend', function (e) {
    if (window.innerWidth > 768) return;
    var dx = e.changedTouches[0].clientX - tx, dy = Math.abs(e.changedTouches[0].clientY - ty);
    if (dy > 60) return;
    if (dx < -60 && sb && sb.classList.contains('mob-open')) closeSb();
    else if (dx > 80 && tx < 22 && sb && !document.querySelector('.bds-root.open')) openSb();
  }, { passive: true });

  /* ── profile bottom sheet ── */
  function openDr() { if (mdr) mdr.classList.add('mob-open'); if (mdbd) mdbd.classList.add('on'); }
  function closeDr() { if (mdr) mdr.classList.remove('mob-open'); if (mdbd) mdbd.classList.remove('on'); }
  window.closeDr = closeDr; // kept for inline handlers
  if (mdbd) mdbd.addEventListener('click', closeDr);
  var dy0 = 0;
  if (mdr) {
    mdr.addEventListener('touchstart', function (e) { dy0 = e.touches[0].clientY; }, { passive: true });
    mdr.addEventListener('touchend', function (e) { if (e.changedTouches[0].clientY - dy0 > 70) closeDr(); }, { passive: true });
  }

  var ICON_SYNC = '<svg width="17" height="17" viewBox="0 0 24 24" fill="none"><path d="M1 4V10H7M23 20V14H17M20.49 9A9 9 0 005.64 5.64L1 10M23 14l-4.64 4.36A9 9 0 013.51 15" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>';
  var ICON_GEAR = '<svg width="17" height="17" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="3.2" stroke="currentColor" stroke-width="1.6"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1L7 17M17 7l2.1-2.1" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>';
  var ICON_INFO = '<svg width="17" height="17" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.6"/><path d="M12 11v5M12 8v.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';
  var ICON_OUT = '<svg width="17" height="17" viewBox="0 0 24 24" fill="none"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>';

  function setUser(user) {
    if (!mrt) return;
    if (user) {
      var name = user.displayName || (user.email ? user.email.split('@')[0] : 'Student');
      var av = esc(name.charAt(0).toUpperCase());
      mrt.innerHTML = '<button class="_mav" id="_mavBtn" aria-label="Account">' + av + '</button>';
      $('_mavBtn').addEventListener('click', function () {
        if (!mdc) return;
        mdc.innerHTML =
          '<div class="_mduser"><div class="_mdav2">' + av + '</div><div style="min-width:0"><div class="_mdname">' + esc(name) + '</div><div class="_mdmail">' + esc(user.email || '') + '</div></div></div>' +
          '<button class="_mdbtn blu" data-a="sync">' + ICON_SYNC + 'Sync now</button>' +
          '<button class="_mdbtn" data-bd-open="appearance">' + ICON_GEAR + 'Settings</button>' +
          '<button class="_mdbtn" data-bd-open="about">' + ICON_INFO + 'About &amp; contact</button>' +
          '<button class="_mdbtn red" data-a="out">' + ICON_OUT + 'Sign out</button>' +
          '<div class="_mdcredit">Made with <span style="color:#f43f5e">&#9829;</span> by <b>Gamestatue</b></div>';
        mdc.querySelector('[data-a="sync"]').addEventListener('click', function () { if (typeof syncToCloud === 'function') syncToCloud(); closeDr(); });
        mdc.querySelector('[data-a="out"]').addEventListener('click', function () {
          firebase.auth().signOut().then(function () { localStorage.removeItem('buddy_storage_mode'); location.reload(); });
        });
        openDr();
      });
    } else {
      mrt.innerHTML = '<button type="button" id="_msign">SIGN IN</button>';
      $('_msign').addEventListener('click', function () {
        if (typeof openOverlay === 'function') { openOverlay(); if (typeof showScreen === 'function') showScreen('screenStorage'); }
        else location.href = '/';
      });
    }
  }

  try {
    if (typeof firebase !== 'undefined' && firebase.apps && firebase.apps.length) firebase.auth().onAuthStateChanged(setUser);
    else setUser(null);
  } catch (e) { setUser(null); }
})();
