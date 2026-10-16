(function(){
  'use strict';
  const KEY='buddy_preferences';
  const defaults={mode:'midnight',accent:'#5b6ef5',bodyFont:'system',headingFont:'brand',monoFont:'modern',scale:'100',density:'comfortable',shape:'soft',surface:'glass',width:'wide',sidebar:'roomy',reduceMotion:false,quiet:false,ambient:true,compactNav:false};
  const choices={
    mode:['midnight','soft','light','warm','oled'],
    bodyFont:['system','rounded','serif','mono'],
    headingFont:['brand','clean','editorial','rounded'],
    monoFont:['modern','system'],
    scale:['90','100','112','125'],
    density:['compact','comfortable','spacious'],
    shape:['crisp','soft','rounded'],
    surface:['glass','solid','minimal'],
    width:['focused','wide','full'],
    sidebar:['roomy','compact']
  };
  const themes={
    midnight:{ink:'#080a10',ink2:'#0c0f18',ink3:'#121520',ink4:'#191d2a',ink5:'#202535',bd:'rgba(255,255,255,.075)',bdh:'rgba(255,255,255,.14)',fg1:'#e8ebf8',fg2:'#8590aa',fg3:'#56617b',glass:'rgba(18,21,32,.82)',shadow:'0 18px 48px rgba(0,0,0,.18)'},
    soft:{ink:'#101522',ink2:'#171e2d',ink3:'#202a3c',ink4:'#28344a',ink5:'#34415a',bd:'rgba(220,230,255,.09)',bdh:'rgba(220,230,255,.17)',fg1:'#f0f4ff',fg2:'#a7b5d0',fg3:'#7787a5',glass:'rgba(24,31,47,.82)',shadow:'0 18px 48px rgba(0,0,0,.22)'},
    light:{ink:'#f1f4fa',ink2:'#ffffff',ink3:'#f7f9fd',ink4:'#edf1f8',ink5:'#dfe5ef',bd:'rgba(27,43,72,.12)',bdh:'rgba(27,43,72,.2)',fg1:'#172239',fg2:'#52627b',fg3:'#7c8aa1',glass:'rgba(255,255,255,.86)',shadow:'0 14px 38px rgba(35,53,82,.08)'},
    warm:{ink:'#f3eee5',ink2:'#fffaf2',ink3:'#f8f1e6',ink4:'#eee4d5',ink5:'#e3d5c2',bd:'rgba(61,47,31,.12)',bdh:'rgba(61,47,31,.2)',fg1:'#2c261f',fg2:'#62584b',fg3:'#877a69',glass:'rgba(255,250,242,.88)',shadow:'0 14px 38px rgba(73,55,31,.09)'},
    oled:{ink:'#000000',ink2:'#050505',ink3:'#0b0b0b',ink4:'#111111',ink5:'#191919',bd:'rgba(255,255,255,.1)',bdh:'rgba(255,255,255,.2)',fg1:'#f5f5f5',fg2:'#a6a6a6',fg3:'#777777',glass:'rgba(5,5,5,.94)',shadow:'0 18px 48px rgba(0,0,0,.6)'}
  };
  const bodyFonts={system:'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',rounded:'Trebuchet MS, "Arial Rounded MT Bold", sans-serif',serif:'Georgia, "Times New Roman", serif',mono:'ui-monospace, SFMono-Regular, Menlo, monospace'};
  const headingFonts={brand:'"Bebas Neue", Impact, sans-serif',clean:'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',editorial:'Georgia, "Times New Roman", serif',rounded:'Trebuchet MS, "Arial Rounded MT Bold", sans-serif'};
  const monoFonts={modern:'"JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, monospace',system:'ui-monospace, SFMono-Regular, Menlo, monospace'};
  const swatches=['#5b6ef5','#0f9f8f','#d97706','#a855f7','#e05272','#1684d8'];
  function normalize(raw){
    const p={...defaults,...(raw&&typeof raw==='object'?raw:{})};
    if(raw&&raw.font&&!raw.bodyFont)p.bodyFont=raw.font;
    for(const key of Object.keys(choices))if(!choices[key].includes(p[key]))p[key]=defaults[key];
    if(!/^#[0-9a-f]{6}$/i.test(String(p.accent||'')))p.accent=defaults.accent;
    ['reduceMotion','quiet','ambient','compactNav'].forEach(k=>p[k]=!!p[k]);
    return p;
  }
  function read(){try{return normalize(JSON.parse(localStorage.getItem(KEY)||'{}'))}catch(e){return {...defaults}}}
  function save(p){try{localStorage.setItem(KEY,JSON.stringify(normalize(p)))}catch(e){}}
  function apply(input){
    const p=normalize(input),root=document.documentElement,body=document.body,t=themes[p.mode]||themes.midnight;
    body.dataset.buddyMode=p.mode;body.dataset.buddyDensity=p.density;body.dataset.buddyShape=p.shape;body.dataset.buddySurface=p.surface;body.dataset.buddyWidth=p.width;body.dataset.buddySidebar=p.sidebar;
    body.classList.toggle('buddy-quiet',p.quiet);body.classList.toggle('buddy-no-ambient',!p.ambient);body.classList.toggle('buddy-compact-nav',p.compactNav);body.classList.toggle('buddy-reduce-motion',p.reduceMotion);
    const tokens={'--ink':t.ink,'--ink2':t.ink2,'--ink3':t.ink3,'--ink4':t.ink4,'--ink5':t.ink5,'--bd':t.bd,'--bdh':t.bdh,'--fg1':t.fg1,'--fg2':t.fg2,'--fg3':t.fg3,'--bg-primary':t.ink,'--bg-secondary':t.ink2,'--bg-card':t.glass,'--border-color':t.bd,'--text-primary':t.fg1,'--text-secondary':t.fg2,'--text-muted':t.fg3,'--buddy-card-bg':t.glass,'--buddy-card-shadow':t.shadow};
    Object.entries(tokens).forEach(([k,v])=>root.style.setProperty(k,v));
    const accent=p.accent,bodyFont=bodyFonts[p.bodyFont],headingFont=headingFonts[p.headingFont],monoFont=monoFonts[p.monoFont];
    ['--buddy-accent','--acc','--acc2','--accent','--accent-primary','--accent-secondary','--primary','--primary-color'].forEach(k=>root.style.setProperty(k,accent));
    ['--fb','--font-b','--font-body','--font-family'].forEach(k=>root.style.setProperty(k,bodyFont));
    ['--fd','--font-d','--font-display'].forEach(k=>root.style.setProperty(k,headingFont));
    ['--fm','--font-m','--font-mono'].forEach(k=>root.style.setProperty(k,monoFont));
    const scales={'90':'14.5px','100':'16px','112':'18px','125':'20px'};root.style.fontSize=scales[p.scale];
    const radii=p.shape==='crisp'?['4px','8px','12px','16px']:p.shape==='rounded'?['9px','16px','24px','32px']:['6px','12px','18px','24px'];
    ['--r1','--r2','--r3','--r4'].forEach((k,i)=>root.style.setProperty(k,radii[i]));
    body.style.setProperty('font-family',bodyFont,'important');
    const meta=document.querySelector('meta[name="theme-color"]');if(meta)meta.content=t.ink;
  }
  function moveAccount(){
    const header=document.querySelector('.sidebar-header'),slot=document.getElementById('sidebarUserSlot'),pill=document.getElementById('userMenuPill'),signIn=document.getElementById('localSignInBtn');
    if(!header)return;
    if(slot&&!header.contains(slot))header.appendChild(slot);
    else if(pill&&!header.contains(pill))header.appendChild(pill);
    if(signIn&&!header.contains(signIn))header.appendChild(signIn);
  }
  function inject(){
    if(document.getElementById('buddyAppearanceButton'))return;
    moveAccount();
    const button=document.createElement('button');button.type='button';button.id='buddyAppearanceButton';button.className='buddy-appearance-button';
    button.setAttribute('aria-haspopup','dialog');button.setAttribute('aria-controls','buddyAppearanceDialog');button.innerHTML='<span aria-hidden="true">✦</span><span>Customize Buddy</span>';
    const sidebar=document.querySelector('.sidebar-footer');if(sidebar)sidebar.insertBefore(button,sidebar.firstChild);
    const topbar=document.querySelector('.mob-topbar');
    if(topbar){const mobile=button.cloneNode(true);mobile.id='buddyAppearanceMobileButton';mobile.classList.add('buddy-appearance-mobile');mobile.innerHTML='<span aria-hidden="true">✦</span>';mobile.setAttribute('aria-label','Appearance settings');(document.getElementById('_mRight')||topbar).appendChild(mobile);}
    const footer=document.createElement('footer');footer.className='brand-footer';
    footer.innerHTML='<div class="brand-footer-mark"><span class="brand-footer-dot" aria-hidden="true">B</span><span><strong>Buddy</strong><small>Your JEE study companion</small></span></div><div class="brand-footer-copy"><span>Made by <strong>Gamestatue</strong></span><a href="mailto:gamestatue1@gmail.com">Contact · gamestatue1@gmail.com</a></div><p class="brand-footer-about">Built to make your JEE preparation easier to plan, track and keep moving.</p>';
    const content=document.querySelector('.main-content')||document.querySelector('.app main')||document.querySelector('main');if(content&&!document.querySelector('.brand-footer'))content.appendChild(footer);
    const dialog=document.createElement('div');dialog.className='buddy-settings-backdrop';dialog.id='buddyAppearanceDialog';dialog.hidden=true;
    dialog.innerHTML='<section class="buddy-settings-panel" role="dialog" aria-modal="true" aria-labelledby="buddySettingsTitle"><header class="buddy-settings-head"><div class="buddy-settings-title-wrap"><span class="buddy-settings-mark" aria-hidden="true">✦</span><div><span class="buddy-settings-kicker">YOUR WORKSPACE, YOUR WAY</span><h2 id="buddySettingsTitle">Make Buddy yours</h2><p>Shape the look, reading comfort and layout across every page.</p></div></div><button type="button" class="buddy-settings-surprise">Surprise me</button><button type="button" class="buddy-settings-close" aria-label="Close settings">×</button></header><div class="buddy-settings-preview"><div class="buddy-preview-top"><span class="buddy-preview-app"><b>B</b> Buddy workspace</span><span class="buddy-preview-status">ON TRACK</span></div><div class="buddy-preview-title">A clearer space to focus.</div><div class="buddy-preview-copy">Your choices update the app as you make them.</div><div class="buddy-preview-progress"><span></span></div><div class="buddy-preview-bottom"><span>Today\'s momentum</span><strong>72%</strong></div></div><div class="buddy-settings-grid"><section class="buddy-settings-group"><h3>Color & mood</h3><label class="buddy-setting"><span>Color theme<small>Choose the atmosphere of every screen</small></span><select name="mode"><option value="midnight">Midnight</option><option value="soft">Soft dusk</option><option value="light">Light</option><option value="warm">Warm paper</option><option value="oled">OLED black</option></select></label><div class="buddy-setting buddy-accent-row"><span>Accent palette<small>Pick a signature color</small></span><div class="buddy-accent-options">'+swatches.map((c,i)=>'<button type="button" data-accent="'+c+'" aria-label="Accent color '+(i+1)+'" style="--swatch:'+c+'"></button>').join('')+'</div></div><label class="buddy-custom-accent"><span>Custom accent</span><input type="color" name="accent" value="#5b6ef5" aria-label="Choose a custom accent color"></label></section><section class="buddy-settings-group"><h3>Type & reading</h3><label class="buddy-setting"><span>Interface font<small>Set a comfortable reading voice</small></span><select name="bodyFont"><option value="system">System sans</option><option value="rounded">Rounded</option><option value="serif">Serif</option><option value="mono">Monospace</option></select></label><label class="buddy-setting"><span>Heading style<small>Change titles and display type</small></span><select name="headingFont"><option value="brand">Buddy display</option><option value="clean">Clean sans</option><option value="editorial">Editorial serif</option><option value="rounded">Rounded</option></select></label><label class="buddy-setting"><span>Mono labels<small>Choose the style of data labels</small></span><select name="monoFont"><option value="modern">JetBrains Mono</option><option value="system">System mono</option></select></label><label class="buddy-setting"><span>Text scale<small>Resize text throughout the app</small></span><select name="scale"><option value="90">Compact · 90%</option><option value="100">Standard · 100%</option><option value="112">Large · 112%</option><option value="125">Extra large · 125%</option></select></label></section><section class="buddy-settings-group"><h3>Page layout</h3><label class="buddy-setting"><span>Content width<small>Choose focused, wide or full layouts</small></span><select name="width"><option value="focused">Focused</option><option value="wide">Wide</option><option value="full">Full width</option></select></label><label class="buddy-setting"><span>Page spacing<small>Set the rhythm between sections</small></span><select name="density"><option value="compact">Compact</option><option value="comfortable">Comfortable</option><option value="spacious">Spacious</option></select></label><label class="buddy-setting"><span>Sidebar<small>Show labels or keep a compact rail</small></span><select name="sidebar"><option value="roomy">Roomy labels</option><option value="compact">Compact rail</option></select></label></section><section class="buddy-settings-group"><h3>Surfaces & motion</h3><label class="buddy-setting"><span>Card finish<small>Pick how panels sit on the page</small></span><select name="surface"><option value="glass">Soft glass</option><option value="solid">Solid</option><option value="minimal">Minimal</option></select></label><label class="buddy-setting"><span>Corner style<small>Set how rounded cards and controls feel</small></span><select name="shape"><option value="soft">Soft</option><option value="rounded">Extra rounded</option><option value="crisp">Crisp</option></select></label><label class="buddy-toggle"><span>Ambient background<small>Show the app’s subtle background effects</small></span><input type="checkbox" name="ambient"></label><label class="buddy-toggle"><span>Quiet interface<small>Reduce decorative effects and visual clutter</small></span><input type="checkbox" name="quiet"></label><label class="buddy-toggle"><span>Reduce motion<small>Limit moving effects and transitions</small></span><input type="checkbox" name="reduceMotion"></label><label class="buddy-toggle"><span>Compact mobile bar<small>Keep the bottom navigation to icons</small></span><input type="checkbox" name="compactNav"></label></section></div><section class="buddy-data-tools"><div><strong>Keep your study data safe</strong><small>Download a private backup or restore one on this device.</small></div><div class="buddy-data-actions"><button type="button" class="buddy-export">Download backup</button><label class="buddy-import" tabindex="0">Restore backup<input type="file" accept="application/json,.json" hidden></label></div></section><footer class="buddy-settings-actions"><button type="button" class="buddy-reset">Reset appearance</button><button type="button" class="buddy-settings-done">Done</button></footer><p class="buddy-settings-about">Made by <strong>Gamestatue</strong> · <a href="mailto:gamestatue1@gmail.com">Contact</a></p></section>';
    document.body.appendChild(dialog);
    let lastTrigger=null;
    const close=()=>{dialog.hidden=true;document.body.classList.remove('buddy-settings-open');lastTrigger&&lastTrigger.focus()};
    const open=trigger=>{lastTrigger=trigger||document.activeElement;dialog.hidden=false;document.body.classList.add('buddy-settings-open');dialog.querySelector('.buddy-settings-close').focus()};
    function sync(){
      const p=read();dialog.querySelector('[name=mode]').value=p.mode;dialog.querySelector('[name=bodyFont]').value=p.bodyFont;dialog.querySelector('[name=headingFont]').value=p.headingFont;dialog.querySelector('[name=monoFont]').value=p.monoFont;dialog.querySelector('[name=scale]').value=p.scale;dialog.querySelector('[name=density]').value=p.density;dialog.querySelector('[name=shape]').value=p.shape;dialog.querySelector('[name=surface]').value=p.surface;dialog.querySelector('[name=width]').value=p.width;dialog.querySelector('[name=sidebar]').value=p.sidebar;dialog.querySelector('[name=accent]').value=p.accent;
      ['ambient','quiet','reduceMotion','compactNav'].forEach(k=>dialog.querySelector('[name='+k+']').checked=p[k]);
      dialog.querySelectorAll('[data-accent]').forEach(b=>{const on=b.dataset.accent.toLowerCase()===p.accent.toLowerCase();b.classList.toggle('selected',on);b.setAttribute('aria-pressed',String(on))});
    }
    document.addEventListener('click',e=>{const trigger=e.target.closest('#buddyAppearanceButton,#buddyAppearanceMobileButton');if(trigger){open(trigger);sync()}});
    dialog.querySelector('.buddy-settings-close').addEventListener('click',close);dialog.querySelector('.buddy-settings-done').addEventListener('click',close);
    dialog.querySelector('.buddy-settings-surprise').addEventListener('click',()=>{const p=read();p.mode=['midnight','soft','light','warm','oled'][Math.floor(Math.random()*5)];p.accent=swatches[Math.floor(Math.random()*swatches.length)];p.bodyFont=['system','rounded','serif'][Math.floor(Math.random()*3)];p.headingFont=['brand','clean','editorial'][Math.floor(Math.random()*3)];p.shape=['soft','rounded','crisp'][Math.floor(Math.random()*3)];save(p);apply(p);sync()});
    dialog.addEventListener('click',e=>{if(e.target===dialog)close()});document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!dialog.hidden)close()});
    dialog.addEventListener('change',e=>{const el=e.target;if(!el.name)return;const p=read();p[el.name]=el.type==='checkbox'?el.checked:el.value;const next=normalize(p);save(next);apply(next);sync()});
    dialog.querySelectorAll('[data-accent]').forEach(btn=>btn.addEventListener('click',()=>{const p=read();p.accent=btn.dataset.accent;save(p);apply(p);sync()}));
    dialog.addEventListener('keydown',e=>{if(e.key!=='Tab')return;const items=[...dialog.querySelectorAll('button:not([disabled]),select,input:not([type=file]),a[href],label.buddy-import[tabindex]')].filter(el=>el.offsetParent!==null);if(!items.length)return;const first=items[0],last=items[items.length-1];if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}});
    const backupKeys=['buddy_profile','buddy_syllabus','buddy_tests','buddy_timetable','buddy_schedule','buddy_streak','buddy_tasks','buddy_backlog','test_analysis_data','buddy_test_data','syllabus_progress','syllabus_custom','dpp_q2','dpp_questions','active_test_plan'];
    dialog.querySelector('.buddy-export').addEventListener('click',()=>{const data={};backupKeys.forEach(key=>{const value=localStorage.getItem(key);if(value!==null)data[key]=value});const blob=new Blob([JSON.stringify({format:'buddy-backup',version:1,createdAt:new Date().toISOString(),data},null,2)],{type:'application/json'});const link=document.createElement('a');link.href=URL.createObjectURL(blob);link.download='buddy-study-backup-'+new Date().toISOString().slice(0,10)+'.json';document.body.appendChild(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(link.href),1000)});
    dialog.querySelector('.buddy-import').addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();e.currentTarget.querySelector('input').click()}});
    dialog.querySelector('.buddy-import input').addEventListener('change',async e=>{const file=e.target.files&&e.target.files[0];e.target.value='';if(!file)return;if(file.size>2*1024*1024){alert('This backup is larger than 2 MB.');return}try{const backup=JSON.parse(await file.text());if(backup.format!=='buddy-backup'||backup.version!==1||!backup.data||typeof backup.data!=='object'||Array.isArray(backup.data))throw Error('Unsupported backup file');const entries=Object.entries(backup.data).filter(([key,value])=>{if(!backupKeys.includes(key)||typeof value!=='string')return false;try{JSON.parse(value);return true}catch(e){return false}});if(!entries.length)throw Error('No Buddy study data found');if(!confirm('Restore '+entries.length+' data item(s) on this device? Matching local data will be replaced.'))return;entries.forEach(([key,value])=>localStorage.setItem(key,value));location.reload()}catch(err){alert('Could not restore this backup. Choose a Buddy backup JSON file.')}});
    const topButton=document.createElement('button');topButton.type='button';topButton.className='buddy-top-button';topButton.setAttribute('aria-label','Scroll to top');topButton.title='Back to top';topButton.textContent='↑';topButton.hidden=true;document.body.appendChild(topButton);let scrollQueued=false;
    window.addEventListener('scroll',()=>{if(scrollQueued)return;scrollQueued=true;requestAnimationFrame(()=>{topButton.hidden=window.scrollY<480;scrollQueued=false})},{passive:true});topButton.addEventListener('click',()=>window.scrollTo({top:0,behavior:document.body.classList.contains('buddy-reduce-motion')?'auto':'smooth'}));
    dialog.querySelector('.buddy-reset').addEventListener('click',()=>{save({...defaults});apply({...defaults});sync()});
    document.querySelectorAll('.mob-tab').forEach(tab=>{const label=tab.querySelector('span')&&tab.querySelector('span').textContent.trim();if(label)tab.setAttribute('aria-label',label);if(tab.classList.contains('mob-active'))tab.setAttribute('aria-current','page')});
    window.BuddyPreferences={open,close,apply};
  }
  const p=read();if(document.body)apply(p);else document.addEventListener('DOMContentLoaded',()=>apply(p),{once:true});
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',inject,{once:true});else inject();
})();