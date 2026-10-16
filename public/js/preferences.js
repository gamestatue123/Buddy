(function(){
  'use strict';
  const KEY='buddy_preferences';
  const defaults={mode:'midnight',font:'system',scale:'100',accent:'#5b6ef5',reduceMotion:false};
  function read(){try{return {...defaults,...JSON.parse(localStorage.getItem(KEY)||'{}')}}catch(e){return {...defaults}}}
  function save(p){try{localStorage.setItem(KEY,JSON.stringify(p))}catch(e){}}
  function apply(p){
    const root=document.documentElement,body=document.body;
    body.dataset.buddyMode=['midnight','soft','light'].includes(p.mode)?p.mode:'midnight';
    const fonts={system:'system-ui, sans-serif',rounded:'Trebuchet MS, sans-serif',serif:'Georgia, serif'};
    const font=fonts[p.font]||fonts.system;
    root.style.setProperty('--fb',font);root.style.setProperty('--font-b',font);root.style.setProperty('--font-body',font);root.style.setProperty('--font-family',font);
    body.style.setProperty('font-family',font,'important');
    const scale=String(p.scale);root.style.fontSize=({'100':'16px','112':'18px','125':'20px'}[scale]||'16px');
    root.style.setProperty('--buddy-accent',p.accent||defaults.accent);
    root.style.setProperty('--acc',p.accent||defaults.accent);root.style.setProperty('--accent-primary',p.accent||defaults.accent);root.style.setProperty('--accent',p.accent||defaults.accent);root.style.setProperty('--primary',p.accent||defaults.accent);
    body.classList.toggle('buddy-reduce-motion',!!p.reduceMotion);
  }
  function inject(){
    if(document.getElementById('buddyAppearanceButton'))return;
    const button=document.createElement('button');
    button.type='button';button.id='buddyAppearanceButton';button.className='buddy-appearance-button';
    button.setAttribute('aria-haspopup','dialog');button.setAttribute('aria-controls','buddyAppearanceDialog');
    button.innerHTML='<span aria-hidden="true">✦</span> Appearance';
    const sidebar=document.querySelector('.sidebar-footer');
    if(sidebar)sidebar.insertBefore(button,sidebar.firstChild);
    const topbar=document.querySelector('.mob-topbar');
    if(topbar){const mobile=button.cloneNode(true);mobile.id='buddyAppearanceMobileButton';mobile.classList.add('buddy-appearance-mobile');topbar.appendChild(mobile);}
    const footer=document.createElement('footer');footer.className='brand-footer';
    footer.innerHTML='<div class="brand-footer-mark"><span class="brand-footer-dot" aria-hidden="true">B</span><span><strong>Buddy</strong><small>Your JEE study companion</small></span></div><div class="brand-footer-copy"><span>Made by <strong>Gamestatue</strong></span><a href="mailto:gamestatue1@gmail.com">Contact · gamestatue1@gmail.com</a></div><p class="brand-footer-about">Built to make your JEE preparation easier to plan, track and keep moving.</p>';
    const content=document.querySelector('.main-content')||document.querySelector('.app main')||document.querySelector('main');
    if(content&&!document.querySelector('.brand-footer'))content.appendChild(footer);
    const dialog=document.createElement('div');dialog.className='buddy-settings-backdrop';dialog.id='buddyAppearanceDialog';dialog.hidden=true;
    dialog.innerHTML='<section class="buddy-settings-panel" role="dialog" aria-modal="true" aria-labelledby="buddySettingsTitle"><header class="buddy-settings-head"><div><span class="buddy-settings-kicker">MAKE IT YOURS</span><h2 id="buddySettingsTitle">Appearance</h2></div><button type="button" class="buddy-settings-close" aria-label="Close settings">×</button></header><label class="buddy-setting"><span>Color mode<small>Choose a comfortable workspace</small></span><select name="mode"><option value="midnight">Midnight</option><option value="soft">Soft dusk</option><option value="light">Light</option></select></label><label class="buddy-setting"><span>Font style<small>Use the style that feels easiest to read</small></span><select name="font"><option value="system">System sans</option><option value="rounded">Rounded</option><option value="serif">Serif</option></select></label><label class="buddy-setting"><span>Text size<small>Adjust reading size across pages</small></span><select name="scale"><option value="100">Standard</option><option value="112">Large</option><option value="125">Extra large</option></select></label><fieldset class="buddy-accent-setting"><legend>Accent color</legend><div class="buddy-accent-options"><button type="button" data-accent="#5b6ef5" aria-label="Blue accent"></button><button type="button" data-accent="#0f9f8f" aria-label="Teal accent"></button><button type="button" data-accent="#d97706" aria-label="Amber accent"></button><button type="button" data-accent="#a855f7" aria-label="Violet accent"></button></div></fieldset><label class="buddy-setting buddy-motion-setting"><span>Reduce motion<small>Limit decorative animation</small></span><input type="checkbox" name="reduceMotion"></label><footer class="buddy-settings-actions"><button type="button" class="buddy-reset">Reset</button><button type="button" class="buddy-settings-done">Done</button></footer><p class="buddy-settings-about">Buddy is made by <strong>Gamestatue</strong>. <a href="mailto:gamestatue1@gmail.com">Contact us</a></p></section>';
    document.body.appendChild(dialog);
    const close=()=>{dialog.hidden=true;document.body.classList.remove('buddy-settings-open')};
    const open=()=>{dialog.hidden=false;document.body.classList.add('buddy-settings-open');dialog.querySelector('select[name=mode]').focus()};
    const sync=()=>{const p=read();dialog.querySelector('[name=mode]').value=p.mode;dialog.querySelector('[name=font]').value=p.font;dialog.querySelector('[name=scale]').value=String(p.scale);dialog.querySelector('[name=reduceMotion]').checked=!!p.reduceMotion;dialog.querySelectorAll('[data-accent]').forEach(b=>b.classList.toggle('selected',b.dataset.accent.toLowerCase()===(p.accent||defaults.accent).toLowerCase()))};
    document.addEventListener('click',e=>{if(e.target.closest('#buddyAppearanceButton,#buddyAppearanceMobileButton')){open();sync()}});
    dialog.querySelector('.buddy-settings-close').addEventListener('click',close);
    dialog.querySelector('.buddy-settings-done').addEventListener('click',close);
    dialog.addEventListener('click',e=>{if(e.target===dialog)close()});
    document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!dialog.hidden)close()});
    dialog.querySelectorAll('select,input').forEach(el=>el.addEventListener('change',()=>{const p=read();p[el.name]=el.type==='checkbox'?el.checked:el.value;save(p);apply(p);sync()}));
    dialog.querySelectorAll('[data-accent]').forEach(btn=>btn.addEventListener('click',()=>{const p=read();p.accent=btn.dataset.accent;save(p);apply(p);sync()}));
    dialog.querySelector('.buddy-reset').addEventListener('click',()=>{save({...defaults});apply({...defaults});sync()});
    window.BuddyPreferences={open,close,apply};
  }
  const p=read();if(document.body)apply(p);else document.addEventListener('DOMContentLoaded',()=>apply(p),{once:true});
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',inject,{once:true});else inject();
})();