(function(){
  var root=document.documentElement;
  var EMAIL='sachinramachandran5@gmail.com';
  var LINKEDIN='https://www.linkedin.com/in/sachin-ramachandran-51233b163/';
  var mq=function(q){return window.matchMedia?window.matchMedia(q):{matches:false};};
  var REDUCED=mq('(prefers-reduced-motion: reduce)');

  // ---- theme: manual choice wins; otherwise follow the device
  var tbtn=document.getElementById('themebtn'),tmeta=document.querySelector('meta[name="theme-color"]');
  function pref(){try{return localStorage.getItem('theme');}catch(e){return null;}}
  function setDark(d){
    root.classList.toggle('dark',d);
    if(tmeta){tmeta.setAttribute('content',d?'#111111':'#FFFFFF');}
    tbtn.setAttribute('aria-label',d?'Switch to light mode':'Switch to dark mode');
    tbtn.setAttribute('data-tip',d?'Light mode (T)':'Dark mode (T)');
  }
  function toggleTheme(x,y){
    var next=!root.classList.contains('dark');
    var applied=false;
    function apply(){applied=true;setDark(next);try{localStorage.setItem('theme',next?'dark':'light');}catch(e){}}
    if(!document.startViewTransition||REDUCED.matches||document.hidden){apply();return;}
    if(x==null){var b=tbtn.getBoundingClientRect();x=b.left+b.width/2;y=b.top+b.height/2;}
    var r=Math.hypot(Math.max(x,innerWidth-x),Math.max(y,innerHeight-y));
    root.style.setProperty('--vt-x',x+'px');root.style.setProperty('--vt-y',y+'px');root.style.setProperty('--vt-r',r+'px');
    root.setAttribute('data-vt','');
    var vt=document.startViewTransition(apply);
    vt.finished.finally(function(){root.removeAttribute('data-vt');});
    // if the browser never paints the transition (e.g. a throttled tab), switch anyway
    setTimeout(function(){if(!applied){if(vt.skipTransition){vt.skipTransition();}apply();}},400);
  }
  setDark(root.classList.contains('dark'));
  tbtn.addEventListener('click',function(e){toggleTheme(e.clientX||null,e.clientY||null);});
  mq('(prefers-color-scheme: dark)').addEventListener&&mq('(prefers-color-scheme: dark)').addEventListener('change',function(e){
    if(!pref()){setDark(e.matches);}
  });

  // ---- accordions
  var past=document.querySelector('.past'),tog=past.querySelector('.tog');
  tog.addEventListener('click',function(){
    var open=past.getAttribute('data-open')!=='true';
    past.setAttribute('data-open',String(open));
    tog.setAttribute('aria-expanded',String(open));
  });
  Array.prototype.forEach.call(document.querySelectorAll('.role-h'),function(btn){
    btn.addEventListener('click',function(){
      var role=btn.closest('.role'),open=role.getAttribute('data-open')!=='true';
      role.setAttribute('data-open',String(open));
      btn.setAttribute('aria-expanded',String(open));
    });
  });

  // ---- toast + copy email
  var toastEl=document.getElementById('toast'),toastT;
  function toast(msg){
    toastEl.textContent=msg;toastEl.classList.add('show');
    clearTimeout(toastT);toastT=setTimeout(function(){toastEl.classList.remove('show');},1800);
  }
  function copyEmail(){
    function done(){toast('Email copied');}
    if(navigator.clipboard&&window.isSecureContext){navigator.clipboard.writeText(EMAIL).then(done,fallback);}
    else{fallback();}
    function fallback(){
      var ta=document.createElement('textarea');ta.value=EMAIL;ta.setAttribute('readonly','');
      ta.style.position='fixed';ta.style.opacity='0';document.body.appendChild(ta);ta.select();
      try{document.execCommand('copy');done();}catch(e){toast(EMAIL);}
      document.body.removeChild(ta);
    }
  }
  Array.prototype.forEach.call(document.querySelectorAll('[data-copy]'),function(b){b.addEventListener('click',copyEmail);});

  // ---- pill nav: a highlight glides between items and rests on the section in view
  var pill=document.querySelector('.pill'),hl=pill.querySelector('.pill-hl');
  var links=Array.prototype.slice.call(pill.querySelectorAll('.pl'));
  var active=null;
  function moveHl(el){
    if(!el){hl.style.opacity='0';return;}
    hl.style.setProperty('--x',el.offsetLeft+'px');hl.style.setProperty('--w',el.offsetWidth+'px');hl.style.opacity='1';
  }
  links.forEach(function(l){
    l.addEventListener('mouseenter',function(){moveHl(l);});
    l.addEventListener('focus',function(){moveHl(l);});
  });
  pill.addEventListener('mouseleave',function(){moveHl(active);});
  pill.addEventListener('focusout',function(e){if(!pill.contains(e.relatedTarget)){moveHl(active);}});

  var spyLinks=links.filter(function(l){return l.hasAttribute('data-spy');});
  function setActive(id){
    active=null;
    spyLinks.forEach(function(l){var on=l.getAttribute('data-spy')===id;l.classList.toggle('on',on);if(on){active=l;}});
    if(!pill.matches(':hover')){moveHl(active);}
  }
  if('IntersectionObserver' in window){
    var seen={};
    var io=new IntersectionObserver(function(entries){
      entries.forEach(function(en){seen[en.target.id]=en.isIntersecting;});
      var cur=null;
      spyLinks.forEach(function(l){var id=l.getAttribute('data-spy');if(seen[id]&&!cur){cur=id;}});
      setActive(cur);
    },{rootMargin:'-30% 0px -55% 0px'});
    spyLinks.forEach(function(l){var s=document.getElementById(l.getAttribute('data-spy'));if(s){io.observe(s);}});
  }
  window.addEventListener('resize',function(){moveHl(active);});

  // ---- command menu (⌘K / Ctrl+K)
  var kbg=document.getElementById('kbg'),kin=document.getElementById('kin'),
      klist=document.getElementById('klist'),kempty=document.getElementById('kempty'),kbtn=document.getElementById('kbtn');
  function go(id){return function(){var el=document.getElementById(id);if(el){el.scrollIntoView({behavior:REDUCED.matches?'auto':'smooth'});}};}
  var items=[
    {label:'Work',group:'Jump to',run:go('work')},
    {label:'Highlights',group:'Jump to',run:go('highlights')},
    {label:'Skills',group:'Jump to',run:go('skills')},
    {label:'Education',group:'Jump to',run:go('education')},
    {label:'Email Sachin',group:'Contact',run:function(){location.href='mailto:'+EMAIL;}},
    {label:'Copy email address',group:'Contact',run:copyEmail},
    {label:'Open LinkedIn',group:'Contact',run:function(){window.open(LINKEDIN,'_blank','noopener');}},
    {label:'Toggle theme',group:'Settings',run:function(){toggleTheme();}}
  ];
  var shown=[],sel=0,lastFocus=null;
  function render(){
    var q=kin.value.trim().toLowerCase();
    shown=items.filter(function(it){return !q||(it.label+' '+it.group).toLowerCase().indexOf(q)>-1;});
    if(sel>=shown.length){sel=Math.max(0,shown.length-1);}
    klist.innerHTML='';
    shown.forEach(function(it,i){
      var li=document.createElement('li');li.setAttribute('role','option');li.id='k-'+i;
      li.setAttribute('aria-selected',String(i===sel));
      var a=document.createElement('span');a.textContent=it.label;
      var g=document.createElement('span');g.className='g';g.textContent=it.group;
      li.appendChild(a);li.appendChild(g);
      li.addEventListener('mousemove',function(){if(sel!==i){sel=i;mark();}});
      li.addEventListener('click',function(){pick(i);});
      klist.appendChild(li);
    });
    kempty.hidden=shown.length>0;
    if(shown.length){kin.setAttribute('aria-activedescendant','k-'+sel);}else{kin.removeAttribute('aria-activedescendant');}
  }
  function mark(){
    Array.prototype.forEach.call(klist.children,function(li,i){li.setAttribute('aria-selected',String(i===sel));});
    var cur=klist.children[sel];if(cur){cur.scrollIntoView({block:'nearest'});kin.setAttribute('aria-activedescendant',cur.id);}
  }
  function openK(){
    if(!kbg.hidden){return;}
    lastFocus=document.activeElement;kin.value='';sel=0;render();
    kbg.hidden=false;requestAnimationFrame(function(){kbg.classList.add('open');});
    kin.focus();
  }
  function closeK(){
    if(kbg.hidden){return;}
    kbg.classList.remove('open');
    setTimeout(function(){kbg.hidden=true;},150);
    if(lastFocus&&lastFocus.focus){lastFocus.focus();}
  }
  function pick(i){var it=shown[i];if(!it){return;}closeK();setTimeout(it.run,10);}
  kbtn.addEventListener('click',openK);
  kbg.addEventListener('mousedown',function(e){if(e.target===kbg){closeK();}});
  kin.addEventListener('input',function(){sel=0;render();});
  kin.addEventListener('keydown',function(e){
    if(e.key==='ArrowDown'){e.preventDefault();if(shown.length){sel=(sel+1)%shown.length;mark();}}
    else if(e.key==='ArrowUp'){e.preventDefault();if(shown.length){sel=(sel-1+shown.length)%shown.length;mark();}}
    else if(e.key==='Enter'){e.preventDefault();pick(sel);}
    else if(e.key==='Tab'){e.preventDefault();}
  });

  document.addEventListener('keydown',function(e){
    if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==='k'){e.preventDefault();kbg.hidden?openK():closeK();return;}
    if(e.key==='Escape'){closeK();return;}
    var t=e.target,typing=t&&(t.tagName==='INPUT'||t.tagName==='TEXTAREA'||t.isContentEditable);
    if(!typing&&!e.metaKey&&!e.ctrlKey&&!e.altKey&&e.key.toLowerCase()==='t'&&kbg.hidden){toggleTheme();}
  });

  // show Ctrl+K instead of ⌘K off Apple platforms
  if(!/Mac|iPhone|iPad|iPod/.test(navigator.platform||navigator.userAgent)){kbtn.querySelector('kbd').textContent='Ctrl K';}

  // ---- local time in Kerala (IST) on the tooltip
  var tz=document.querySelector('[data-tz]');
  function tick(){
    try{
      var t=new Date().toLocaleTimeString('en-US',{timeZone:'Asia/Kolkata',hour:'numeric',minute:'2-digit'});
      tz.setAttribute('data-tip',t+' in Kerala, India');
    }catch(e){}
  }
  if(tz){tick();setInterval(tick,30000);}

  // ---- rotating headline word
  var rot=document.querySelector('.rot');
  if(rot){
    var words=Array.prototype.slice.call(rot.querySelectorAll('.rot-w')),wi=0;
    // sub-pixel widths + negative tracking: round up and leave a hair of room so the last letter never clips
    var fit=function(){rot.style.width=Math.ceil(words[wi].getBoundingClientRect().width+2)+'px';};
    fit();
    if(document.fonts&&document.fonts.ready){document.fonts.ready.then(fit);}
    // the web font can swap in after first paint and change every word's width
    if(window.ResizeObserver){var ro=new ResizeObserver(fit);words.forEach(function(w){ro.observe(w);});}
    window.addEventListener('resize',fit);
    if(!REDUCED.matches&&words.length>1){
      setInterval(function(){
        if(document.hidden){return;}
        var cur=words[wi];wi=(wi+1)%words.length;var nxt=words[wi];
        cur.classList.remove('on');cur.classList.add('out');
        nxt.classList.remove('out');
        // restart the incoming word from below
        nxt.style.transition='none';nxt.getBoundingClientRect();nxt.style.transition='';
        nxt.classList.add('on');fit();
        setTimeout(function(){cur.classList.remove('out');},600);
      },2400);
    }
  }

  // ---- count-ups: numbers climb to their value the first time they're seen
  function countUp(el,delay,dur){
    if(el.dataset.done){return;}el.dataset.done='1';
    var to=parseFloat(el.dataset.count),pre=el.dataset.pre||'',suf=el.dataset.suf||'';
    if(REDUCED.matches||!window.requestAnimationFrame){return;}
    // the final value stays in place until a frame actually paints, so a throttled tab never shows 0
    setTimeout(function(){
      var t0=null;
      setTimeout(function(){el.textContent=pre+to+suf;},dur+400);
      function step(t){
        if(t0===null){t0=t;}
        var p=Math.min(1,(t-t0)/dur),e=p===1?1:1-Math.pow(2,-10*p);
        el.textContent=pre+Math.round(to*e)+suf;
        if(p<1){requestAnimationFrame(step);}
      }
      requestAnimationFrame(step);
    },delay);
  }
  Array.prototype.forEach.call(document.querySelectorAll('.traj [data-count]'),function(el){countUp(el,550,1600);});

  // ---- scroll reveals (sections below the hero fade up once)
  var rvs=Array.prototype.slice.call(document.querySelectorAll('.rv'));
  function reveal(sec){
    sec.classList.add('in');
    Array.prototype.forEach.call(sec.querySelectorAll('[data-count]'),function(el,i){countUp(el,150+i*70,1200);});
  }
  if('IntersectionObserver' in window){
    var rio=new IntersectionObserver(function(entries){
      entries.forEach(function(en){if(en.isIntersecting){reveal(en.target);rio.unobserve(en.target);}});
    },{rootMargin:'0px 0px -8% 0px',threshold:.08});
    rvs.forEach(function(s){rio.observe(s);});
  }else{rvs.forEach(reveal);}
  // backup: never leave a section hidden if the observer is throttled or late
  function sweep(){
    var h=window.innerHeight;
    rvs=rvs.filter(function(s){if(s.classList.contains('in')){return false;}if(s.getBoundingClientRect().top<h){reveal(s);return false;}return true;});
    if(!rvs.length){window.removeEventListener('scroll',sweep);window.removeEventListener('resize',sweep);}
  }
  window.addEventListener('scroll',sweep,{passive:true});window.addEventListener('resize',sweep);
  setTimeout(sweep,1200);

  // ---- stat tiles: a soft ember spotlight follows the cursor
  Array.prototype.forEach.call(document.querySelectorAll('.stats li'),function(li){
    li.addEventListener('pointermove',function(e){
      var r=li.getBoundingClientRect();
      li.style.setProperty('--mx',(e.clientX-r.left)+'px');li.style.setProperty('--my',(e.clientY-r.top)+'px');
    });
  });

  // ---- footer year
  var yr=document.getElementById('yr');if(yr){yr.textContent=new Date().getFullYear();}
})();
