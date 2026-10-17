/* Buddy · Settings, About & Contact
   Injects its own UI (sheet + sidebar buttons + branding) so every page
   only needs a <script> tag.  Made by Gamestatue */
(function () {
  'use strict';
  var VERSION = '1.1.0';
  var AUTHOR = 'Gamestatue';
  var EMAIL = 'gamestatue1@gmail.com';
  var P = window.BuddyPrefs;
  if (!P) return;

  /* ───────────── styles ───────────── */
  var css = '' +
  '.bds-root{--b-bg:#0c0f1c;--b-bg2:#131726;--b-bg3:#1a1f31;--b-bd:rgba(255,255,255,.09);--b-fg:#e8ebf8;--b-fg2:#98a2c0;--b-fg3:#6c7594;--b-scrim:rgba(3,5,12,.72);--b-shadow:0 30px 90px rgba(0,0,0,.65);' +
    'position:fixed;inset:0;z-index:20000;display:none;align-items:center;justify-content:center;padding:16px;font-family:var(--fb,"Outfit",system-ui,sans-serif);color:var(--b-fg);}' +
  'html[data-theme="light"] .bds-root{--b-bg:#ffffff;--b-bg2:#f3f4fa;--b-bg3:#e8ebf5;--b-bd:rgba(25,32,70,.12);--b-fg:#161a33;--b-fg2:#4a5272;--b-fg3:#656e94;--b-scrim:rgba(20,24,50,.45);--b-shadow:0 30px 80px rgba(40,52,110,.25);}' +
  'html[data-theme="amoled"] .bds-root{--b-bg:#050609;--b-bg2:#0d0f15;--b-bg3:#161922;}' +
  '.bds-root.open{display:flex;}' +
  '.bds-scrim{position:absolute;inset:0;background:var(--b-scrim);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);animation:bdsFade .2s ease;}' +
  '.bds-sheet{position:relative;width:560px;max-width:100%;max-height:min(88vh,780px);max-height:min(88dvh,780px);display:flex;flex-direction:column;background:var(--b-bg);border:1px solid var(--b-bd);border-radius:26px;box-shadow:var(--b-shadow);overflow:hidden;animation:bdsPop .24s cubic-bezier(.2,.8,.2,1);}' +
  '.bds-grab{display:none;width:38px;height:4px;border-radius:2px;background:var(--b-bd);margin:9px auto 0;flex-shrink:0;}' +
  '.bds-head{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:18px 20px 6px;}' +
  '.bds-eyebrow{font-family:var(--fm,monospace);font-size:.6rem;letter-spacing:.14em;color:var(--acc,#5b6ef5);text-transform:uppercase;}' +
  '.bds-head h2{font-family:var(--fd,"Bebas Neue",sans-serif);font-size:1.9rem;letter-spacing:.05em;font-weight:400;line-height:1.05;margin:2px 0 0;color:var(--b-fg);}' +
  '.bds-x{width:38px;height:38px;border-radius:50%;border:1px solid var(--b-bd);background:var(--b-bg2);color:var(--b-fg2);cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0;}' +
  '.bds-x:hover{color:var(--b-fg);}' +
  '.bds-tabs{display:flex;gap:4px;margin:10px 20px 4px;padding:4px;background:var(--b-bg2);border:1px solid var(--b-bd);border-radius:50px;flex-shrink:0;}' +
  '.bds-tab{flex:1;padding:9px 6px;border:none;border-radius:50px;background:none;color:var(--b-fg3);font-family:var(--fm,monospace);font-size:.68rem;letter-spacing:.07em;text-transform:uppercase;cursor:pointer;min-height:40px;}' +
  '.bds-tab[aria-selected="true"]{background:var(--acc,#5b6ef5);color:#fff;box-shadow:0 4px 14px rgba(var(--acc-rgb,91,110,245),.35);}' +
  '.bds-body{overflow-y:auto;overscroll-behavior:contain;padding:8px 20px 22px;-webkit-overflow-scrolling:touch;}' +
  '.bds-pane{display:none;}.bds-pane.on{display:block;animation:bdsFade .2s ease;}' +
  '.bds-g{margin-top:18px;}' +
  '.bds-g>h3{font-family:var(--fm,monospace);font-size:.62rem;letter-spacing:.12em;text-transform:uppercase;color:var(--b-fg3);font-weight:500;margin:0 0 9px;}' +
  '.bds-row{display:grid;gap:8px;}' +
  '.bds-themes{grid-template-columns:repeat(4,1fr);}' +
  '.bds-opt{position:relative;border:1.5px solid var(--b-bd);background:var(--b-bg2);color:var(--b-fg);border-radius:14px;cursor:pointer;font-family:inherit;text-align:center;transition:border-color .15s,background .15s,transform .1s;}' +
  '.bds-opt:active{transform:scale(.97);}' +
  '.bds-opt[aria-pressed="true"]{border-color:var(--acc,#5b6ef5);background:rgba(var(--acc-rgb,91,110,245),.12);}' +
  '.bds-theme{padding:8px 6px 9px;font-size:.72rem;display:flex;flex-direction:column;align-items:center;gap:7px;}' +
  '.bds-prev{width:100%;height:38px;border-radius:9px;border:1px solid rgba(128,128,128,.25);position:relative;overflow:hidden;}' +
  '.bds-prev i{position:absolute;left:6px;right:6px;height:5px;border-radius:3px;}' +
  '.bds-prev i:nth-child(1){top:7px;width:46%;}.bds-prev i:nth-child(2){top:17px;right:14px;opacity:.55;}.bds-prev i:nth-child(3){top:27px;width:30%;opacity:.35;}' +
  '.bds-accents{display:flex;gap:10px;flex-wrap:wrap;}' +
  '.bds-dot{width:42px;height:42px;border-radius:50%;border:3px solid transparent;cursor:pointer;padding:0;position:relative;box-shadow:inset 0 0 0 2px rgba(255,255,255,.18);}' +
  '.bds-dot[aria-pressed="true"]{border-color:var(--b-fg);}' +
  '.bds-dot[aria-pressed="true"]::after{content:"";position:absolute;left:50%;top:50%;width:11px;height:6px;border-left:2.5px solid #fff;border-bottom:2.5px solid #fff;transform:translate(-50%,-62%) rotate(-45deg);}' +
  '.bds-fonts{grid-template-columns:1fr 1fr;}' +
  '.bds-font{padding:11px 12px;text-align:left;}' +
  '.bds-font b{display:block;font-size:1.02rem;font-weight:600;line-height:1.2;}' +
  '.bds-font small{display:block;font-size:.66rem;color:var(--b-fg3);margin-top:3px;font-family:var(--fm,monospace);letter-spacing:.03em;}' +
  '.bds-seg{display:flex;padding:3px;background:var(--b-bg2);border:1px solid var(--b-bd);border-radius:14px;gap:3px;}' +
  '.bds-seg .bds-opt{flex:1;border:none;background:none;border-radius:11px;padding:10px 4px;font-size:.78rem;min-height:42px;color:var(--b-fg2);}' +
  '.bds-seg .bds-opt[aria-pressed="true"]{background:var(--acc,#5b6ef5);color:#fff;box-shadow:0 3px 12px rgba(var(--acc-rgb,91,110,245),.35);}' +
  '.bds-sw{display:flex;align-items:center;gap:12px;padding:12px 14px;background:var(--b-bg2);border:1px solid var(--b-bd);border-radius:14px;margin-bottom:8px;cursor:pointer;width:100%;font-family:inherit;color:var(--b-fg);text-align:left;min-height:56px;}' +
  '.bds-sw span.t{flex:1;font-size:.88rem;font-weight:500;line-height:1.3;}' +
  '.bds-sw span.t small{display:block;font-weight:400;font-size:.72rem;color:var(--b-fg3);margin-top:2px;}' +
  '.bds-tg{width:44px;height:26px;border-radius:13px;background:var(--b-bg3);border:1px solid var(--b-bd);position:relative;flex-shrink:0;transition:background .2s;}' +
  '.bds-tg::after{content:"";position:absolute;top:2px;left:2px;width:20px;height:20px;border-radius:50%;background:#fff;box-shadow:0 1px 4px rgba(0,0,0,.35);transition:transform .2s;}' +
  '.bds-sw[aria-checked="true"] .bds-tg{background:var(--acc,#5b6ef5);border-color:transparent;}' +
  '.bds-sw[aria-checked="true"] .bds-tg::after{transform:translateX(18px);}' +
  '.bds-btn{display:flex;align-items:center;justify-content:center;gap:9px;width:100%;padding:13px 16px;min-height:48px;border-radius:14px;border:1px solid var(--b-bd);background:var(--b-bg2);color:var(--b-fg);font-family:inherit;font-size:.9rem;font-weight:500;cursor:pointer;text-decoration:none;margin-bottom:8px;transition:border-color .15s,background .15s;}' +
  '.bds-btn:hover{border-color:rgba(var(--acc-rgb,91,110,245),.55);}' +
  '.bds-btn.pri{background:var(--acc,#5b6ef5);border-color:transparent;color:#fff;box-shadow:0 8px 22px rgba(var(--acc-rgb,91,110,245),.3);}' +
  '.bds-btn.ghost{background:none;color:var(--b-fg2);}' +
  '.bds-note{font-size:.78rem;line-height:1.6;color:var(--b-fg2);padding:12px 14px;background:var(--b-bg2);border:1px solid var(--b-bd);border-radius:14px;margin-bottom:10px;}' +
  '.bds-hero{display:flex;flex-direction:column;align-items:center;text-align:center;padding:22px 10px 8px;}' +
  '.bds-hero img{width:76px;height:76px;border-radius:22px;object-fit:cover;box-shadow:0 12px 34px rgba(var(--acc-rgb,91,110,245),.4);border:1px solid var(--b-bd);}' +
  '.bds-hero h4{font-family:var(--fd,"Bebas Neue",sans-serif);font-size:2.2rem;letter-spacing:.1em;font-weight:400;margin:12px 0 0;line-height:1;color:var(--b-fg);}' +
  '.bds-hero p{margin:6px 0 0;font-size:.85rem;color:var(--b-fg2);}' +
  '.bds-ver{display:inline-block;margin-top:10px;padding:3px 11px;border-radius:50px;border:1px solid var(--b-bd);font-family:var(--fm,monospace);font-size:.62rem;letter-spacing:.08em;color:var(--b-fg3);}' +
  '.bds-made{margin:16px 0 4px;padding:16px;border-radius:18px;text-align:center;background:linear-gradient(135deg,rgba(var(--acc-rgb,91,110,245),.16),rgba(167,139,250,.1));border:1px solid rgba(var(--acc-rgb,91,110,245),.3);}' +
  '.bds-made small{display:block;font-family:var(--fm,monospace);font-size:.6rem;letter-spacing:.14em;text-transform:uppercase;color:var(--b-fg3);}' +
  '.bds-made strong{display:block;font-family:var(--fd,"Bebas Neue",sans-serif);font-weight:400;font-size:1.7rem;letter-spacing:.08em;margin-top:3px;color:var(--b-fg);}' +
  '.bds-made .h{color:#f43f5e;}' +
  '.bds-foot{text-align:center;font-family:var(--fm,monospace);font-size:.6rem;letter-spacing:.06em;color:var(--b-fg3);margin-top:16px;line-height:1.7;}' +
  '.bds-toast{position:fixed;left:50%;bottom:calc(24px + env(safe-area-inset-bottom,0px));transform:translate(-50%,14px);background:var(--b-bg3,#1a1f31);color:var(--b-fg,#fff);border:1px solid var(--b-bd);padding:10px 18px;border-radius:50px;font-size:.8rem;opacity:0;pointer-events:none;transition:all .22s;z-index:20100;box-shadow:0 10px 30px rgba(0,0,0,.4);max-width:90vw;}' +
  '.bds-toast.show{opacity:1;transform:translate(-50%,0);}' +
  '@keyframes bdsFade{from{opacity:0}to{opacity:1}}' +
  '@keyframes bdsPop{from{opacity:0;transform:translateY(14px) scale(.98)}to{opacity:1;transform:none}}' +
  '@keyframes bdsUp{from{transform:translateY(100%)}to{transform:none}}' +
  '@media(max-width:640px){' +
    '.bds-root{padding:0;align-items:flex-end;}' +
    '.bds-sheet{width:100%;max-height:92vh;max-height:92dvh;border-radius:24px 24px 0 0;border-bottom:none;animation:bdsUp .28s cubic-bezier(.2,.8,.2,1);}' +
    '.bds-grab{display:block;}' +
    '.bds-body{padding-bottom:calc(26px + env(safe-area-inset-bottom,0px));}' +
    '.bds-head{padding:12px 16px 4px;}.bds-tabs{margin:8px 16px 2px;}.bds-body{padding-left:16px;padding-right:16px;}' +
    '.bds-themes{grid-template-columns:repeat(2,1fr);}' +
    '.bds-fonts{grid-template-columns:1fr;}' +
  '}' +
  '@media(prefers-reduced-motion:reduce){.bds-sheet,.bds-scrim,.bds-pane.on{animation:none;}}' +
  '';
  var st = document.createElement('style');
  st.id = 'bds-style';
  st.textContent = css;
  document.head.appendChild(st);

  /* ───────────── helpers ───────────── */
  function esc(s) { return String(s).replace(/[&<>"']/g, function (m) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]; }); }
  var toastEl, toastT;
  function toast(msg) {
    if (!toastEl) { toastEl = document.createElement('div'); toastEl.className = 'bds-toast'; toastEl.setAttribute('role', 'status'); document.body.appendChild(toastEl); }
    toastEl.textContent = msg; toastEl.classList.add('show');
    clearTimeout(toastT); toastT = setTimeout(function () { toastEl.classList.remove('show'); }, 2600);
  }

  var THEME_OPTS = [
    { v: 'auto', n: 'Auto', bg: 'linear-gradient(90deg,#f3f4fa 50%,#0b0e17 50%)', fg: '#7c8ff8' },
    { v: 'light', n: 'Light', bg: '#f3f4fa', fg: '#4457d8' },
    { v: 'dark', n: 'Dark', bg: '#0b0e17', fg: '#7c8ff8' },
    { v: 'amoled', n: 'AMOLED', bg: '#000', fg: '#7c8ff8' }
  ];
  var SIZES = [['sm', 'Small'], ['md', 'Default'], ['lg', 'Large'], ['xl', 'XL']];
  var DENS = [['compact', 'Compact'], ['comfortable', 'Cozy'], ['spacious', 'Roomy']];
  var ROUND = [['sharp', 'Sharp'], ['soft', 'Soft'], ['round', 'Round']];

  function seg(key, list) {
    return '<div class="bds-seg" role="group">' + list.map(function (o) {
      return '<button type="button" class="bds-opt" data-k="' + key + '" data-v="' + o[0] + '">' + o[1] + '</button>';
    }).join('') + '</div>';
  }

  /* ───────────── DOM ───────────── */
  var root, lastFocus, built = false, deferredInstall = null;

  function build() {
    if (built) return; built = true;
    root = document.createElement('div');
    root.className = 'bds-root';
    root.id = 'bdsRoot';
    var themes = THEME_OPTS.map(function (t) {
      return '<button type="button" class="bds-opt bds-theme" data-k="theme" data-v="' + t.v + '"><span class="bds-prev" style="background:' + t.bg + '"><i style="background:' + t.fg + '"></i><i style="background:' + t.fg + '"></i><i style="background:' + t.fg + '"></i></span>' + t.n + '</button>';
    }).join('');
    var accents = Object.keys(P.ACCENTS).map(function (k) {
      var a = P.ACCENTS[k];
      return '<button type="button" class="bds-dot" data-k="accent" data-v="' + k + '" style="background:' + a.a + '" aria-label="' + a.name + '" title="' + a.name + '"></button>';
    }).join('');
    var fonts = Object.keys(P.FONTS).map(function (k) {
      var f = P.FONTS[k];
      var ff = { classic: "'Outfit',sans-serif", modern: "'Space Grotesk','Inter',sans-serif", friendly: "'Nunito',sans-serif", editorial: "'Fraunces',Georgia,serif", lexend: "'Lexend',sans-serif", system: 'system-ui,sans-serif' }[k];
      return '<button type="button" class="bds-opt bds-font" data-k="font" data-v="' + k + '"><b style="font-family:' + ff + '">' + f.name + '</b><small>' + f.sample + '</small></button>';
    }).join('');

    root.innerHTML =
      '<div class="bds-scrim" data-bds-close></div>' +
      '<section class="bds-sheet" role="dialog" aria-modal="true" aria-labelledby="bdsTitle">' +
        '<div class="bds-grab"></div>' +
        '<header class="bds-head"><div><div class="bds-eyebrow">Buddy</div><h2 id="bdsTitle">Settings</h2></div>' +
          '<button type="button" class="bds-x" data-bds-close aria-label="Close"><svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg></button></header>' +
        '<nav class="bds-tabs" role="tablist">' +
          '<button type="button" class="bds-tab" role="tab" data-tab="appearance">Appearance</button>' +
          '<button type="button" class="bds-tab" role="tab" data-tab="data">Data</button>' +
          '<button type="button" class="bds-tab" role="tab" data-tab="about">About</button>' +
        '</nav>' +
        '<div class="bds-body">' +
          /* appearance */
          '<div class="bds-pane" data-pane="appearance">' +
            '<div class="bds-g"><h3>Theme</h3><div class="bds-row bds-themes">' + themes + '</div></div>' +
            '<div class="bds-g"><h3>Accent colour</h3><div class="bds-accents">' + accents + '</div></div>' +
            '<div class="bds-g"><h3>Font style</h3><div class="bds-row bds-fonts">' + fonts + '</div></div>' +
            '<div class="bds-g"><h3>Text size</h3>' + seg('size', SIZES) + '</div>' +
            '<div class="bds-g"><h3>Layout density</h3>' + seg('density', DENS) + '</div>' +
            '<div class="bds-g"><h3>Corners</h3>' + seg('round', ROUND) + '</div>' +
            '<div class="bds-g"><h3>Display</h3>' +
              '<button type="button" class="bds-sw" role="switch" data-sw="fx"><span class="t">Animated background<small>Floating particles &amp; glow. Off by default on phones to save battery.</small></span><span class="bds-tg"></span></button>' +
              '<button type="button" class="bds-sw" role="switch" data-sw="motion"><span class="t">Reduce motion<small>Calmer transitions and no looping animations.</small></span><span class="bds-tg"></span></button>' +
              '<button type="button" class="bds-sw" role="switch" data-sw="quote"><span class="t">Daily quote &amp; ticker<small>Show the motivational line on your dashboard.</small></span><span class="bds-tg"></span></button>' +
            '</div>' +
            '<div class="bds-g"><button type="button" class="bds-btn ghost" data-act="reset">Reset appearance to default</button></div>' +
          '</div>' +
          /* data */
          '<div class="bds-pane" data-pane="data">' +
            '<div class="bds-g"><div class="bds-note">Your progress lives on this device. Sign in to enable cloud sync across devices. A backup file is the safest way to move data or keep a copy.</div>' +
              '<button type="button" class="bds-btn pri" data-act="export"><svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M12 3v12m0 0l-4-4m4 4l4-4M4 17v2a2 2 0 002 2h12a2 2 0 002-2v-2" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>Download backup</button>' +
              '<button type="button" class="bds-btn" data-act="import"><svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M12 15V3m0 0L8 7m4-4l4 4M4 17v2a2 2 0 002 2h12a2 2 0 002-2v-2" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>Restore from backup</button>' +
              '<input type="file" id="bdsFile" accept="application/json,.json" hidden>' +
              '<div class="bds-note" id="bdsStats" style="margin-top:4px"></div>' +
            '</div>' +
          '</div>' +
          /* about */
          '<div class="bds-pane" data-pane="about">' +
            '<div class="bds-hero"><img src="/logo.png" alt="Buddy logo" onerror="this.style.display=\'none\'"><h4>BUDDY</h4><p>Your JEE study companion</p><span class="bds-ver">VERSION ' + VERSION + '</span></div>' +
            '<div class="bds-made"><small>Made with <span class="h">&#9829;</span> by</small><strong>' + AUTHOR + '</strong></div>' +
            '<div class="bds-g"><h3>Contact</h3>' +
              '<a class="bds-btn pri" id="bdsMail" href="mailto:' + EMAIL + '"><svg width="16" height="16" viewBox="0 0 24 24" fill="none"><rect x="3" y="5" width="18" height="14" rx="2.5" stroke="currentColor" stroke-width="1.8"/><path d="M3.5 7l8.5 6 8.5-6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>' + EMAIL + '</a>' +
              '<a class="bds-btn" id="bdsFeedback" href="#">Send feedback or an idea</a>' +
              '<a class="bds-btn" id="bdsBug" href="#">Report a problem</a>' +
              '<button type="button" class="bds-btn" data-act="share">Share Buddy with a friend</button>' +
              '<button type="button" class="bds-btn" data-act="install" id="bdsInstall" style="display:none">Install Buddy on this device</button>' +
            '</div>' +
            '<div class="bds-foot">&copy; ' + new Date().getFullYear() + ' ' + AUTHOR + ' &middot; All rights reserved<br>Built for students who put in the work.</div>' +
          '</div>' +
        '</div>' +
      '</section>';
    document.body.appendChild(root);

    // mailto links with context
    var ctx = '\n\n—\nBuddy v' + VERSION + ' · ' + (navigator.userAgent || '').slice(0, 140);
    root.querySelector('#bdsFeedback').href = 'mailto:' + EMAIL + '?subject=' + encodeURIComponent('Buddy feedback') + '&body=' + encodeURIComponent('Hi ' + AUTHOR + ',\n\nI have an idea / feedback:\n\n' + ctx);
    root.querySelector('#bdsBug').href = 'mailto:' + EMAIL + '?subject=' + encodeURIComponent('Buddy problem report') + '&body=' + encodeURIComponent('What happened:\n\nWhat I expected:\n\nPage: ' + location.pathname + ctx);

    root.addEventListener('click', onClick);
    root.querySelector('#bdsFile').addEventListener('change', onImportFile);
    root.addEventListener('keydown', onKey);
  }

  /* ───────────── state sync ───────────── */
  function refresh() {
    var p = P.get();
    var h = document.documentElement;
    root.querySelectorAll('[data-k]').forEach(function (el) {
      el.setAttribute('aria-pressed', String(p[el.dataset.k] === el.dataset.v));
    });
    var fxOn = h.getAttribute('data-fx') === 'on';
    var reduce = h.getAttribute('data-motion') === 'reduce';
    var map = { fx: fxOn, motion: reduce, quote: p.quote !== 'off' };
    root.querySelectorAll('[data-sw]').forEach(function (el) { el.setAttribute('aria-checked', String(!!map[el.dataset.sw])); });
    var n = backupKeys().length;
    var s = root.querySelector('#bdsStats');
    if (s) s.textContent = n ? ('This device currently holds ' + n + ' saved data set' + (n > 1 ? 's' : '') + ' (timetable, DPPs, tests, syllabus & more).') : 'Nothing saved on this device yet.';
  }

  function showTab(name) {
    root.querySelectorAll('.bds-tab').forEach(function (t) { t.setAttribute('aria-selected', String(t.dataset.tab === name)); });
    root.querySelectorAll('.bds-pane').forEach(function (p) { p.classList.toggle('on', p.dataset.pane === name); });
    root.querySelector('#bdsTitle').textContent = { appearance: 'Settings', data: 'Your data', about: 'About' }[name] || 'Settings';
    root.querySelector('.bds-body').scrollTop = 0;
  }

  /* ───────────── events ───────────── */
  function onClick(e) {
    var t = e.target;
    if (t.closest('[data-bds-close]')) return close();
    var tab = t.closest('.bds-tab'); if (tab) return showTab(tab.dataset.tab);
    var opt = t.closest('[data-k]');
    if (opt) { P.set(opt.dataset.k, opt.dataset.v); refresh(); return; }
    var sw = t.closest('[data-sw]');
    if (sw) {
      var on = sw.getAttribute('aria-checked') === 'true';
      var k = sw.dataset.sw;
      if (k === 'fx') P.set('fx', on ? 'off' : 'on');
      if (k === 'motion') P.set('motion', on ? 'full' : 'reduce');
      if (k === 'quote') P.set('quote', on ? 'off' : 'on');
      refresh(); return;
    }
    var act = t.closest('[data-act]');
    if (!act) return;
    var a = act.dataset.act;
    if (a === 'reset') { P.reset(); refresh(); toast('Appearance reset'); }
    if (a === 'export') exportBackup();
    if (a === 'import') root.querySelector('#bdsFile').click();
    if (a === 'share') share();
    if (a === 'install' && deferredInstall) { deferredInstall.prompt(); deferredInstall.userChoice.finally(function () { deferredInstall = null; act.style.display = 'none'; }); }
  }
  function onKey(e) {
    if (e.key === 'Escape') { e.stopPropagation(); close(); return; }
    if (e.key !== 'Tab') return;
    var f = root.querySelectorAll('button:not([hidden]),a[href],input:not([hidden])');
    f = Array.prototype.filter.call(f, function (n) { return n.offsetParent !== null; });
    if (!f.length) return;
    var first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }

  function open(tab) {
    build();
    P.preloadFonts();
    lastFocus = document.activeElement;
    refresh();
    showTab(tab === 'about' || tab === 'data' ? tab : 'appearance');
    root.classList.add('open');
    document.documentElement.style.overflow = 'hidden';
    var x = root.querySelector('.bds-x'); x && x.focus();
  }
  function close() {
    if (!root) return;
    root.classList.remove('open');
    document.documentElement.style.overflow = '';
    if (lastFocus && lastFocus.focus) try { lastFocus.focus(); } catch (e) {}
  }

  /* ───────────── backup / restore ───────────── */
  var KEEP = /^(buddy_(?!auth_redirect|chat_guest|secret|auto_enter|storage_mode|prefs)|test_analysis_data$|syllabus_|dpp_|active_test_plan$|pom_|buddyData$|buddyQuote)/;
  function backupKeys() {
    var out = [];
    try { for (var i = 0; i < localStorage.length; i++) { var k = localStorage.key(i); if (KEEP.test(k)) out.push(k); } } catch (e) {}
    return out;
  }
  function exportBackup() {
    var data = {};
    backupKeys().forEach(function (k) { data[k] = localStorage.getItem(k); });
    data[P.KEY] = localStorage.getItem(P.KEY) || '{}';
    var blob = new Blob([JSON.stringify({ app: 'buddy', version: VERSION, exportedAt: new Date().toISOString(), data: data }, null, 2)], { type: 'application/json' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'buddy-backup-' + new Date().toISOString().slice(0, 10) + '.json';
    document.body.appendChild(a); a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 500);
    toast('Backup downloaded');
  }
  function onImportFile(e) {
    var f = e.target.files && e.target.files[0];
    e.target.value = '';
    if (!f) return;
    var r = new FileReader();
    r.onload = function () {
      try {
        var j = JSON.parse(r.result);
        if (!j || j.app !== 'buddy' || !j.data || typeof j.data !== 'object') throw new Error('bad');
        var keys = Object.keys(j.data).filter(function (k) { return (KEEP.test(k) || k === P.KEY) && typeof j.data[k] === 'string'; });
        if (!keys.length) throw new Error('empty');
        if (!confirm('Restore ' + keys.length + ' data sets from this backup? This replaces matching data on this device.')) return;
        keys.forEach(function (k) { localStorage.setItem(k, j.data[k]); });
        toast('Backup restored — reloading…');
        setTimeout(function () { location.reload(); }, 900);
      } catch (err) { toast('That file is not a valid Buddy backup'); }
    };
    r.readAsText(f);
  }

  function share() {
    var url = location.origin || 'https://buddy.app';
    var text = 'Buddy — a free JEE study planner: timetable, DPP logger, syllabus tracker & test analysis.';
    if (navigator.share) { navigator.share({ title: 'Buddy', text: text, url: url }).catch(function () {}); return; }
    try { navigator.clipboard.writeText(text + ' ' + url).then(function () { toast('Link copied'); }); } catch (e) { toast(url); }
  }

  window.addEventListener('beforeinstallprompt', function (e) {
    e.preventDefault(); deferredInstall = e;
    if (root) { var b = root.querySelector('#bdsInstall'); if (b) b.style.display = ''; }
  });

  /* ───────────── entry points & branding ───────────── */
  document.addEventListener('click', function (e) {
    var t = e.target.closest && e.target.closest('[data-bd-open]');
    if (!t) return;
    e.preventDefault();
    var m = document.querySelector('.sidebar.mob-open');
    if (m) m.classList.remove('mob-open');
    var d = document.getElementById('_mdrw'); if (d) d.classList.remove('mob-open');
    var bd = document.getElementById('_mdbd'); if (bd) bd.classList.remove('on');
    var sb = document.getElementById('_mbd'); if (sb) sb.classList.remove('on');
    open(t.dataset.bdOpen);
  });

  function brandSidebar() {
    var f = document.querySelector('.sidebar-footer');
    if (!f || f.querySelector('.bd-side-actions')) return;
    var row = document.createElement('div');
    row.className = 'bd-side-actions';
    row.innerHTML =
      '<button type="button" class="bd-side-btn" data-bd-open="appearance"><svg width="14" height="14" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="3.2" stroke="currentColor" stroke-width="1.7"/><path d="M19.4 14.5a1.6 1.6 0 00.3 1.8l.1.1a2 2 0 11-2.8 2.8l-.1-.1a1.6 1.6 0 00-1.8-.3 1.6 1.6 0 00-1 1.5V21a2 2 0 01-4 0v-.1a1.6 1.6 0 00-1-1.5 1.6 1.6 0 00-1.8.3l-.1.1a2 2 0 11-2.8-2.8l.1-.1a1.6 1.6 0 00.3-1.8 1.6 1.6 0 00-1.5-1H3a2 2 0 010-4h.1a1.6 1.6 0 001.5-1 1.6 1.6 0 00-.3-1.8l-.1-.1a2 2 0 112.8-2.8l.1.1a1.6 1.6 0 001.8.3h0a1.6 1.6 0 001-1.5V3a2 2 0 014 0v.1a1.6 1.6 0 001 1.5 1.6 1.6 0 001.8-.3l.1-.1a2 2 0 112.8 2.8l-.1.1a1.6 1.6 0 00-.3 1.8v0a1.6 1.6 0 001.5 1H21a2 2 0 010 4h-.1a1.6 1.6 0 00-1.5 1z" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/></svg><span>Settings</span></button>' +
      '<button type="button" class="bd-side-btn" data-bd-open="about"><svg width="14" height="14" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.7"/><path d="M12 11v5M12 8v.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg><span>About</span></button>';
    f.insertBefore(row, f.firstChild);
    var c = document.createElement('button');
    c.type = 'button'; c.className = 'bd-credit'; c.setAttribute('data-bd-open', 'about');
    c.innerHTML = 'Made with <span class="bd-heart">&#9829;</span> by <b>' + AUTHOR + '</b><br>v' + VERSION;
    f.appendChild(c);
  }

  function ready(fn) { if (document.readyState !== 'loading') fn(); else document.addEventListener('DOMContentLoaded', fn); }
  ready(brandSidebar);

  window.BuddySettings = { open: open, close: close, version: VERSION, email: EMAIL, esc: esc };
})();
