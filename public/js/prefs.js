/* Buddy · preferences engine
   Loaded in <head> (blocking, tiny) so the saved look is applied before first paint.
   Made by Gamestatue */
(function () {
  'use strict';
  var KEY = 'buddy_prefs_v1';
  var root = document.documentElement;

  var DEFAULTS = {
    theme: 'auto',        // auto | light | dark | amoled
    accent: 'indigo',
    font: 'classic',      // classic | modern | friendly | editorial | lexend | system
    size: 'md',           // sm | md | lg | xl
    density: 'comfortable', // compact | comfortable | spacious
    round: 'soft',        // sharp | soft | round
    fx: 'auto',           // auto | on | off  (animated background)
    motion: 'auto',       // auto | reduce | full
    quote: 'on'           // on | off  (daily quote + ticker)
  };

  // a = base accent, d = lighter accent (dark UI), l = deeper accent (light UI)
  var ACCENTS = {
    indigo:  { name: 'Indigo',  a: '#5b6ef5', d: '#7c8ff8', l: '#4457d8', rgb: '91,110,245' },
    emerald: { name: 'Emerald', a: '#10b981', d: '#34d399', l: '#047857', rgb: '16,185,129' },
    rose:    { name: 'Rose',    a: '#f43f5e', d: '#fb7185', l: '#be123c', rgb: '244,63,94' },
    amber:   { name: 'Amber',   a: '#f59e0b', d: '#fbbf24', l: '#b45309', rgb: '245,158,11' },
    sky:     { name: 'Sky',     a: '#0ea5e9', d: '#38bdf8', l: '#0369a1', rgb: '14,165,233' },
    violet:  { name: 'Violet',  a: '#8b5cf6', d: '#a78bfa', l: '#6d28d9', rgb: '139,92,246' }
  };

  var FONTS = {
    classic:   { name: 'Classic',   sample: 'Bebas + Outfit',        css: null },
    modern:    { name: 'Modern',    sample: 'Space Grotesk + Inter', css: 'family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@500;600;700' },
    friendly:  { name: 'Friendly',  sample: 'Nunito',                css: 'family=Nunito:wght@400;600;700;800' },
    editorial: { name: 'Editorial', sample: 'Fraunces + Lora',       css: 'family=Fraunces:wght@600;700&family=Lora:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500' },
    lexend:    { name: 'Easy read', sample: 'Lexend',                css: 'family=Lexend:wght@300;400;500;600;700' },
    system:    { name: 'System',    sample: 'Your device font',      css: null }
  };

  function read() {
    try {
      var raw = JSON.parse(localStorage.getItem(KEY) || '{}') || {};
      var out = {};
      for (var k in DEFAULTS) out[k] = (raw[k] != null && raw[k] !== '') ? raw[k] : DEFAULTS[k];
      return out;
    } catch (e) { var d = {}; for (var k2 in DEFAULTS) d[k2] = DEFAULTS[k2]; return d; }
  }
  function write(p) { try { localStorage.setItem(KEY, JSON.stringify(p)); } catch (e) {} }

  var mqLight = window.matchMedia ? window.matchMedia('(prefers-color-scheme: light)') : null;
  var mqReduce = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;
  var mqFine = window.matchMedia ? window.matchMedia('(hover: hover) and (pointer: fine)') : null;

  function resolveTheme(p) {
    if (p.theme === 'auto') return (mqLight && mqLight.matches) ? 'light' : 'dark';
    return p.theme;
  }

  var loadedFonts = {};
  function loadFont(name) {
    var f = FONTS[name];
    if (!f || !f.css || loadedFonts[name]) return;
    loadedFonts[name] = true;
    var l = document.createElement('link');
    l.rel = 'stylesheet';
    l.href = 'https://fonts.googleapis.com/css2?' + f.css + '&display=swap';
    document.head.appendChild(l);
  }

  function setStatusBar(theme) {
    try {
      var sb = window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.StatusBar;
      if (sb) {
        sb.setStyle({ style: theme === 'light' ? 'LIGHT' : 'DARK' });
        sb.setBackgroundColor && sb.setBackgroundColor({ color: theme === 'light' ? '#f3f4fa' : (theme === 'amoled' ? '#000000' : '#080a10') });
      }
    } catch (e) {}
  }

  function apply(p) {
    p = p || read();
    var theme = resolveTheme(p);
    root.setAttribute('data-theme', theme);
    root.setAttribute('data-theme-pref', p.theme);
    root.setAttribute('data-font', p.font);
    root.setAttribute('data-size', p.size);
    root.setAttribute('data-density', p.density);
    root.setAttribute('data-round', p.round);
    root.setAttribute('data-quote', p.quote);

    var fx = p.fx === 'auto'
      ? ((mqFine && mqFine.matches && !(mqReduce && mqReduce.matches)) ? 'on' : 'off')
      : p.fx;
    root.setAttribute('data-fx', fx);
    root.setAttribute('data-motion', (p.motion === 'reduce' || (p.motion === 'auto' && mqReduce && mqReduce.matches)) ? 'reduce' : 'full');

    var ac = ACCENTS[p.accent] || ACCENTS.indigo;
    var light = theme === 'light';
    var s = root.style;
    s.setProperty('--acc', light ? ac.l : ac.a);
    s.setProperty('--acc2', light ? ac.l : ac.d);
    s.setProperty('--acc-rgb', ac.rgb);
    s.setProperty('--accent', light ? ac.l : ac.a);
    s.setProperty('--accent-primary', ac.a);
    s.setProperty('--accent-secondary', light ? ac.l : ac.d);
    s.setProperty('--accent-glow', 'rgba(' + ac.rgb + ',0.28)');

    loadFont(p.font);

    var bg = theme === 'light' ? '#f3f4fa' : (theme === 'amoled' ? '#000000' : '#080a10');
    var m = document.querySelector('meta[name="theme-color"]');
    if (!m && document.head) { m = document.createElement('meta'); m.name = 'theme-color'; document.head.appendChild(m); }
    if (m) m.setAttribute('content', bg);
    setStatusBar(theme);
    try { window.dispatchEvent(new CustomEvent('buddy:prefs', { detail: p })); } catch (e) {}
  }

  var api = {
    KEY: KEY, DEFAULTS: DEFAULTS, ACCENTS: ACCENTS, FONTS: FONTS,
    get: read,
    set: function (k, v) { var p = read(); p[k] = v; write(p); apply(p); return p; },
    reset: function () { try { localStorage.removeItem(KEY); } catch (e) {} apply(read()); },
    apply: apply,
    preloadFonts: function () { for (var n in FONTS) loadFont(n); }
  };
  window.BuddyPrefs = api;

  apply(read());

  function onSys() { if (read().theme === 'auto' || read().fx === 'auto' || read().motion === 'auto') apply(read()); }
  if (mqLight && mqLight.addEventListener) { mqLight.addEventListener('change', onSys); }
  if (mqReduce && mqReduce.addEventListener) { mqReduce.addEventListener('change', onSys); }
  // keep several open tabs in sync
  window.addEventListener('storage', function (e) { if (e.key === KEY) apply(read()); });
})();
