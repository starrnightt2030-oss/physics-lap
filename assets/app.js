'use strict';
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const f=(x,n=2)=>+(+x).toFixed(n);
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const rnd=(a,b)=>a+Math.floor(Math.random()*(b-a+1));
const pickR=a=>a[Math.floor(Math.random()*a.length)];
const shuffle=a=>{a=[...a];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
const TEACHER='مستر محمد محمود';
const LV=['مبتدئ فضولي','باحث صغير','مُجرِّب نشيط','عالم تجريبي','فيزيائي محترف','عبقري الفيزياء'];
const AR_DIG=n=>String(n);

/* ---------------- storage: several students on one device ---------------- */
const KEY='mm_physics_lab_v3';
let DB;
const blankP=name=>({name,xp:0,done:{},got:{},seen:{},bestPct:null,cert:null,created:Date.now(),last:Date.now()});
function loadDB(){try{DB=JSON.parse(localStorage.getItem(KEY))}catch(e){DB=null}
  if(!DB||!DB.profiles)DB={profiles:{},current:null,prefs:{sound:true,voice:true,dark:false,vname:'auto'}};
  // migrate the single-student save of the previous version
  try{const old=JSON.parse(localStorage.getItem('mm_physics_lab_v2'));if(old&&old.name&&!DB.migrated){const id='p'+Date.now();DB.profiles[id]=Object.assign(blankP(old.name),{xp:old.xp||0,done:old.done||{},got:old.got||{},seen:old.seen||{},bestPct:old.bestPct??null,cert:old.cert||null});DB.migrated=1;saveDB()}}catch(e){}
  DB.prefs=Object.assign({sound:true,voice:true,dark:false,vname:'auto'},DB.prefs)}
function saveDB(){try{localStorage.setItem(KEY,JSON.stringify(DB))}catch(e){}}
let S=null;const P=()=>DB.prefs;
const save=()=>{if(S)S.last=Date.now();saveDB()};
loadDB();

/* ---------------- sound effects ---------------- */
let AC;
function actx(){try{AC=AC||new(window.AudioContext||window.webkitAudioContext)();if(AC.state==='suspended')AC.resume()}catch(e){}return AC}
function sfx(t){if(!P().sound)return;const ac=actx();if(!ac)return;try{const q={ok:[[660,0],[990,.08]],no:[[220,0],[165,.11]],click:[[520,0]],win:[[523,0],[659,.09],[784,.18],[1046,.3]],tick:[[1500,0]],drop:[[300,0],[140,.07]],pop:[[880,0]]}[t]||[[440,0]];const n=ac.currentTime;
q.forEach(([fr,d])=>{const o=ac.createOscillator(),g=ac.createGain();o.type=t=='no'?'triangle':t=='drop'?'sine':'square';o.frequency.value=fr;const pk=t=='tick'?.03:t=='click'?.035:.06;g.gain.setValueAtTime(.0001,n+d);g.gain.exponentialRampToValueAtTime(pk,n+d+.012);g.gain.exponentialRampToValueAtTime(.0001,n+d+(t=='win'?.32:.18));o.connect(g).connect(ac.destination);o.start(n+d);o.stop(n+d+.35)})}catch(e){}}

/* ---------------- icons (stroke svg) ---------------- */
const I={
home:'<path d="M3 11l9-7 9 7"/><path d="M5 10v10h14V10"/><path d="M10 20v-6h4v6"/>',
wave:'<path d="M2 12c2.5-4 5-4 7.5 0s5 4 7.5 0 3.5-3 5-2"/><path d="M2 18c2.5-3 5-3 7.5 0s5 3 7.5 0"/><circle cx="7" cy="5" r="2"/>',
cards:'<rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="9" cy="10" r="2"/><path d="M21 16l-5-5-8 8"/>',
ruler:'<path d="M3 17L17 3l4 4L7 21z"/><path d="M7 13l2 2M10 10l2 2M13 7l2 2"/>',
compass:'<circle cx="12" cy="12" r="9"/><path d="M15.5 8.5l-2 5-5 2 2-5z"/>',
gauge:'<path d="M4 18a8 8 0 1 1 16 0"/><path d="M12 18l4-6"/><path d="M4 18h16"/>',
fall:'<circle cx="12" cy="6" r="3"/><path d="M12 11v8M8 15l4 4 4-4"/><path d="M4 22h16"/>',
pend:'<path d="M4 3h16"/><path d="M12 3l-5 13"/><circle cx="6.5" cy="18" r="3"/><path d="M12 3v14" stroke-dasharray="2 2"/>',
dim:'<path d="M8 4H5v16h3M16 4h3v16h-3"/><path d="M10 9l4 6M14 9l-4 6"/>',
steps:'<path d="M9 6h11M9 12h11M9 18h11"/><path d="M4 6l1 1 2-2M4 12l1 1 2-2M4 18l1 1 2-2"/>',
trophy:'<path d="M8 21h8M12 17v4"/><path d="M7 4h10v5a5 5 0 0 1-10 0z"/><path d="M7 6H4a3 3 0 0 0 3 4M17 6h3a3 3 0 0 1-3 4"/>',
check:'<path d="M5 12l5 5L20 7"/>',
sound:'<path d="M4 9h4l5-4v14l-5-4H4z"/><path class="on" d="M16 9a4 4 0 0 1 0 6M18.5 6.5a8 8 0 0 1 0 11"/><path class="offp" d="M16 9l6 6M22 9l-6 6"/>',
voice:'<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/><path class="offp" d="M3 3l18 18"/>',
moon:'<path d="M20 14A8 8 0 1 1 10 4a6 6 0 0 0 10 10z"/>',
full:'<path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/>',
replay:'<path d="M4 12a8 8 0 1 0 3-6.2"/><path d="M4 4v5h5"/>',
close:'<path d="M6 6l12 12M18 6L6 18"/>',
user:'<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
play:'<path d="M7 4l13 8-13 8z"/>',pause:'<path d="M7 4h4v16H7zM13 4h4v16h-4z"/>',reset:'<path d="M4 12a8 8 0 1 0 3-6.2"/><path d="M4 4v5h5"/>',
undo:'<path d="M9 14L4 9l5-5"/><path d="M4 9h11a5 5 0 0 1 0 10h-3"/>',trash:'<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>',
dice:'<rect x="4" y="4" width="16" height="16" rx="3"/><circle cx="9" cy="9" r="1.2"/><circle cx="15" cy="15" r="1.2"/><circle cx="15" cy="9" r="1.2"/><circle cx="9" cy="15" r="1.2"/>',
bulb:'<path d="M9 18h6M10 21h4"/><path d="M12 3a6 6 0 0 0-4 10.5c.8.8 1 1.5 1 2.5h6c0-1 .2-1.7 1-2.5A6 6 0 0 0 12 3z"/>',
print:'<path d="M7 8V3h10v5"/><rect x="3" y="8" width="18" height="9" rx="2"/><path d="M7 14h10v7H7z"/>',
flask:'<path d="M9 3h6M10 3v6L4 19a2 2 0 0 0 2 3h12a2 2 0 0 0 2-3l-6-10V3"/><path d="M7 15h10"/>',
target:'<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5"/>',
table:'<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 10h18M9 4v16"/>',
swap:'<path d="M4 8h14l-4-4M20 16H6l4 4"/>',
book:'<path d="M4 4h6a3 3 0 0 1 3 3v13a2 2 0 0 0-2-2H4zM20 4h-6a3 3 0 0 0-3 3"/><path d="M20 4v14h-7"/>',
download:'<path d="M12 4v12M7 11l5 5 5-5M5 20h14"/>',
};
const ic=(k,cls='')=>`<svg class="${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${I[k]||''}</svg>`;

/* ---------------- teacher voice: recorded clips in voice/<pack>/<key>.mp3 ---------------- */
window.VPACKS=window.VPACKS||{};VPACKS.kareem=VPACKS.kareem||{name:'كريم',note:'فصحى واضحة'};
const VNAMES=()=>Object.keys(VPACKS);
const vname=()=>VPACKS[P().vname]?P().vname:(VPACKS.shakir?'shakir':'kareem');
const hasClip=k=>!!(k&&VLINES[k]);
const IS_FILE=location.protocol==='file:';
const Teacher=(()=>{const au=new Audio();au.preload='auto';let an=null,src=null,queue=[],lastKeys=[],lastText='',typeT=0,raf=0;
const bars=()=>$$('#wave i');
function analyser(){if(IS_FILE)return null;if(an)return an;const ac=actx();if(!ac)return null;try{src=ac.createMediaElementSource(au);an=ac.createAnalyser();an.fftSize=256;src.connect(an);an.connect(ac.destination)}catch(e){an=null}return an}
function animate(){cancelAnimationFrame(raf);const b=bars(),d=new Uint8Array(64);const st=()=>{if(au.paused||au.ended){b.forEach(x=>x.style.height='4px');$('#dock').classList.remove('talk');return}
  if(an){an.getByteFrequencyData(d);b.forEach((x,i)=>{const v=d[2+i*3]/255;x.style.height=(4+v*18)+'px'})}else b.forEach(x=>x.style.height=(4+Math.random()*16)+'px');raf=requestAnimationFrame(st)};st()}
function playNext(){if(!queue.length)return;const k=queue.shift();if(!P().voice||!hasClip(k)){playNext();return}
  analyser();au.src='voice/'+vname()+'/'+k+'.mp3';au.currentTime=0;const p=au.play();$('#dock').classList.add('talk');if(p&&p.catch)p.catch(()=>{$('#dock').classList.remove('talk');autoMin(9000)});animate()}
let minT=0;const autoMin=ms=>{clearTimeout(minT);minT=setTimeout(()=>{if(au.paused||au.ended)$('#dock').classList.add('min')},ms)};
au.onerror=()=>{$('#dock').classList.remove('talk');if(queue.length)playNext();else autoMin(9000)};
au.onended=()=>{if(queue.length)setTimeout(playNext,180);else autoMin(innerWidth<1000?4000:7000)};
function stop(){queue=[];try{au.pause()}catch(e){}$('#dock')&&$('#dock').classList.remove('talk')}
function show(text){const box=$('#say');$('#dock').classList.remove('min');clearInterval(typeT);let i=0;const plain=text.replace(/<[^>]+>/g,'');
  if(matchMedia('(prefers-reduced-motion: reduce)').matches){box.innerHTML=LTX(text);return}
  typeT=setInterval(()=>{i+=3;box.textContent=plain.slice(0,i);if(i>=plain.length){clearInterval(typeT);box.innerHTML=LTX(text)}},16)}
// say(keys, text?) : keys = clip key | array | null.  text overrides the caption.
function say(keys,text){keys=keys==null?[]:[].concat(keys);const cap=text!=null?text:keys.map(k=>LINES[k]||'').join(' ');lastKeys=keys;lastText=cap;stop();clearTimeout(minT);show(cap);queue=keys.slice();if(!P().voice||!keys.some(hasClip))autoMin(Math.max(6000,cap.length*90));playNext()}
return{say,stop,replay:()=>say(lastKeys,lastText)}})();
/* every static explanation has a recorded clip keyed by a hash of its text */
const normT=t=>String(t).replace(/<[^>]+>/g,'').replace(/\s+/g,' ').trim();
const clipKey=t=>{const s=normT(t);let h=5381;for(let i=0;i<s.length;i++)h=((h*33)^s.charCodeAt(i))>>>0;return 'x'+h.toString(36)};
const clipFor=t=>{if(!t)return null;const k=clipKey(t);return VLINES[k]?k:null};
const SPK='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 9h4l5-4v14l-5-4H4z"/><path d="M16 9a4 4 0 0 1 0 6M18.5 6.5a8 8 0 0 1 0 11"/></svg>';
function listenTargets(root){const out=[];root.querySelectorAll('.sthead .stt p, .facts>div, .mission>p, .panel>.note, .labcol>.note:not([id]), .ctl>.note').forEach(el=>{if(el.id)return;let t;if(el.matches('.facts>div')){const h=el.querySelector('h4'),p=el.querySelector('p');t=(h?h.textContent.trim()+'. ':'')+(p?p.textContent:'')}else t=el.textContent;out.push({el,text:normT(t)})});return out}
function addListen(root){listenTargets(root).forEach(({el,text})=>{const k=clipFor(text);if(!k||el.querySelector(':scope>.lis'))return;const b=document.createElement('button');b.className='lis';b.type='button';b.setAttribute('aria-label','اسمع الشرح');b.title='اسمع الشرح';b.innerHTML=SPK;b.onclick=e=>{e.stopPropagation();actx();Teacher.say(k,text)};el.appendChild(b)})}
const praiseK=()=>'praise'+rnd(0,4),wrongK=()=>'wrong'+rnd(0,2);

/* text helper: isolate latin/formula runs inside arabic text */
const LINES=Object.fromEntries(Object.entries(VLINES).map(([k,v])=>[k,v.text]));
const LTX=t=>String(t).replace(/((?:(?:\([^()؀-ۿ]*\)|[A-Za-z0-9θπΩΔ½⁰¹²³⁴⁵⁶⁷⁸⁹⁻₀₁₂₃√.,=+×÷\-−/°≈\[\]])+ ?)+)/g,m=>/[A-Za-zθπΩΔ√]/.test(m)?`<bdi dir="ltr">${m.trim()}</bdi> `:m);

/* ---------------- rewards ---------------- */
function toast(m){const d=document.createElement('div');d.className='toast';d.textContent=m;$('#toasts').appendChild(d);setTimeout(()=>d.remove(),2700)}
function confetti(){if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;const c=$('#confetti'),x=c.getContext('2d');c.width=innerWidth;c.height=innerHeight;const cols=['#FFC727','#3D5AFE','#2ED3A0','#FF6B5A','#14204A','#ffffff'];const Pp=Array.from({length:170},()=>({x:innerWidth/2+(Math.random()-.5)*200,y:innerHeight*.45,vx:(Math.random()-.5)*16,vy:-6-Math.random()*12,r:Math.random()*6.28,vr:(Math.random()-.5)*.4,s:7+Math.random()*8,c:pickR(cols)}));let t=0;
const st=()=>{x.clearRect(0,0,c.width,c.height);Pp.forEach(p=>{p.x+=p.vx;p.y+=p.vy;p.vy+=.32;p.vx*=.985;p.r+=p.vr;x.save();x.translate(p.x,p.y);x.rotate(p.r);x.fillStyle=p.c;x.fillRect(-p.s/2,-p.s/4,p.s,p.s/2);x.restore()});if(++t<200)requestAnimationFrame(st);else x.clearRect(0,0,c.width,c.height)};st()}
function award(key,xp,msg){if(S.got[key])return false;S.got[key]=1;S.xp+=xp;save();toast(`+${xp} نقطة — ${msg||''}`);updTop();return true}
function badgeModal(L){const m=document.createElement('div');m.className='modal';m.innerHTML=`<div class="box" role="dialog" aria-label="شارة جديدة"><div class="mtag">شارة جديدة</div><div class="medal">${medal3d(L.icon)}</div><h2>${esc(L.bd)}</h2><p style="margin:0 auto 14px">محطة ${LABS.indexOf(L)}: «${esc(L.t)}»</p><div class="row" style="justify-content:center;margin-bottom:18px"><span class="chip3 g">+50 نقطة</span><span class="chip3">${Object.keys(S.done).length} من ${LABS.length-1} شارات</span></div><button class="btn">تابع</button></div>`;document.body.appendChild(m);const cl=()=>m.remove();m.querySelector('.btn').onclick=cl;m.onclick=e=>{if(e.target===m)cl()};m.querySelector('.btn').focus()}
function complete(id,key,text){const L=LABS.find(l=>l.id==id);if(!S.done[id]){S.done[id]=1;S.xp+=50;save();confetti();sfx('win');updTop();updNav();setTimeout(()=>badgeModal(L),350)}const m=$('#ms');if(m){m.classList.add('done');const t=m.querySelector('.mt');if(t)t.textContent='مكتملة ✓'}Teacher.say(key,text)}
const mission=(id,txt,body='')=>`<section class="mission ${S.done[id]?'done':''}" id="ms"><div class="mh">${ic('target')}<h3>مهمة المحطة</h3><span class="mt">${S.done[id]?'مكتملة ✓':'+50 نقطة وشارة'}</span></div><p>${txt}</p>${body}</section>`;
const plate=(L,lead)=>{const n=LABS.indexOf(L);return `<header class="sthead go"><button class="ib back" data-back aria-label="رجوع لخريطة المحطات"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 6l6 6-6 6"/></svg></button><div class="num3">${String(n).padStart(2,'0')}</div><div class="stt"><div class="tag">المحطة ${n} من ${LABS.length-1}</div><h1>${L.t}</h1><p>${lead}</p></div><span class="sti">${icon3d(L.icon,110)}</span></header>`};
const panelH=(icon,t)=>`<div class="ph"><span class="ic">${ic(icon)}</span><h3>${t}</h3></div>`;

/* ---------------- ui helpers ---------------- */
let SLC=0;const SLCOL=[['#3D5AFE','#3D5AFE'],['#FF6B5A','#E0473A'],['#FFC727','#B07E00'],['#2ED3A0','#13906B']];
const slPct=(e)=>((+e.value-+e.min)/((+e.max-+e.min)||1)*100).toFixed(1)+'%';
const sl=(id,l,a,b,v,s=1,u='')=>{const k=SLCOL[SLC++%SLCOL.length],p=((v-a)/((b-a)||1)*100).toFixed(1)+'%';return `<label class="sl" style="--c:${k[0]};--ct:${k[1]}"><span>${l}<b id="o_${id}">${v}${u?' '+u:''}</b></span><input type="range" id="${id}" min="${a}" max="${b}" value="${v}" step="${s}" data-u="${u}" style="--p:${p}"></label>`};
const V=id=>{const e=$('#'+id);return e?+e.value:0};
const setSl=(id,v)=>{const e=$('#'+id);e.value=v;e.style.setProperty('--p',slPct(e));$('#o_'+id).textContent=e.value+(e.dataset.u?' '+e.dataset.u:'')};
const onSl=(ids,fn)=>ids.forEach(i=>$('#'+i).addEventListener('input',()=>{setSl(i,V(i));fn(i)}));
const rd=(items)=>`<div class="rd">${items.map(([id,l,c])=>`<div class="${c||''}">${l}<b id="${id}">—</b></div>`).join('')}</div>`;
const setRd=(id,v)=>{const e=$('#'+id);if(e)e.textContent=v};

/* ---------------- canvas kit (instrument screen) ---------------- */
const C={bg:'#14204A',bg2:'#1C2C66',grid:'rgba(123,147,255,.10)',grid2:'rgba(123,147,255,.2)',txt:'#D7DEFF',mut:'#93A0D6',y:'#FFC727',g:'#2ED3A0',c:'#5CD3F5',r:'#FF6B5A',w:'#FFFFFF',o:'#FF9F43'};
function CV(sel,W,H){const c=$(sel),d=Math.min(2,window.devicePixelRatio||1);c.width=W*d;c.height=H*d;const x=c.getContext('2d');x.setTransform(d,0,0,d,0,0);x.W=W;x.H=H;x.c=c;return x}
const ptr=(x,e)=>{const r=x.c.getBoundingClientRect();return[(e.clientX-r.left)/r.width*x.W,(e.clientY-r.top)/r.height*x.H]};
const FONT=(z,w=800,fam='Tajawal')=>`${w} ${z}px ${fam},Alexandria,Tahoma,Arial`;
function TX(x,s,a,b,c=C.txt,z=15,al='center',fam){x.save();x.fillStyle=c;const ar=/[؀-ۿ]/.test(s);x.font=FONT(z,800,fam||(ar?'Tajawal':'Alexandria'));x.textAlign=al;x.direction=ar?'rtl':'ltr';x.fillText(s,a,b);x.restore()}
function bgScreen(x,minor=20,major=100){const g=x.createLinearGradient(0,0,0,x.H);g.addColorStop(0,'#14204A');g.addColorStop(1,'#1C2C66');x.fillStyle=g;x.fillRect(0,0,x.W,x.H);x.lineWidth=1;for(let i=0;i<=x.W;i+=minor){x.strokeStyle=i%major?C.grid:C.grid2;x.beginPath();x.moveTo(i+.5,0);x.lineTo(i+.5,x.H);x.stroke()}for(let j=0;j<=x.H;j+=minor){x.strokeStyle=j%major?C.grid:C.grid2;x.beginPath();x.moveTo(0,j+.5);x.lineTo(x.W,j+.5);x.stroke()}}
function arrow(x,a,b,c,d,col,w=3,dash){const L=Math.hypot(c-a,d-b);if(L<2)return;const t=Math.atan2(d-b,c-a),h=Math.min(9+w*2,L*.6);x.save();x.strokeStyle=x.fillStyle=col;x.lineWidth=w;x.lineCap='round';if(dash)x.setLineDash(dash);x.beginPath();x.moveTo(a,b);x.lineTo(c-h*.7*Math.cos(t),d-h*.7*Math.sin(t));x.stroke();x.setLineDash([]);x.beginPath();x.moveTo(c,d);x.lineTo(c-h*Math.cos(t-.42),d-h*Math.sin(t-.42));x.lineTo(c-h*Math.cos(t+.42),d-h*Math.sin(t+.42));x.closePath();x.fill();x.restore()}
function circ(x,a,b,r,col){x.fillStyle=col;x.beginPath();x.arc(a,b,r,0,7);x.fill()}
function ring(x,a,b,r,col,w=2){x.strokeStyle=col;x.lineWidth=w;x.beginPath();x.arc(a,b,r,0,7);x.stroke()}
function rr(x,a,b,w,h,r,col){x.fillStyle=col;x.beginPath();if(x.roundRect)x.roundRect(a,b,w,h,r);else x.rect(a,b,w,h);x.fill()}
function glow(x,col,blur,fn){x.save();x.shadowColor=col;x.shadowBlur=blur;fn();x.restore()}
function ball(x,a,b,r,c1,c2){const g=x.createRadialGradient(a-r*.35,b-r*.4,r*.1,a,b,r);g.addColorStop(0,c1);g.addColorStop(1,c2);x.fillStyle=g;x.beginPath();x.arc(a,b,r,0,7);x.fill()}
function pill(x,s,a,b,bg,fg,z=13){x.save();x.font=FONT(z);const w=x.measureText(s).width+16;rr(x,a-w/2,b-z-4,w,z+10,(z+10)/2,bg);x.restore();TX(x,s,a,b,fg,z)}
/* side-view car (faces right, wheels on y) */
const SHADE={'#FF6B5A':['#FFA79B','#FF6B5A','#C93C31','#86211B'],'#FFC727':['#FFE48A','#FFC727','#D99A00','#9A6B00'],'#2ED3A0':['#8FF2D2','#2ED3A0','#169E77','#0E6E52'],'#3D5AFE':['#8EA2FF','#3D5AFE','#2337B8','#16247A']};
function car(x,a,y,w=96,body='#FF6B5A'){const k=SHADE[body]||SHADE['#FF6B5A'],s=w/200;x.save();x.translate(a-14*s,y-2*s);x.scale(s,s);
  x.fillStyle='rgba(0,0,0,.35)';x.beginPath();x.ellipse(110,24,118,11,0,0,7);x.fill();
  const P=new Path2D('M14 -6 L14 -34 Q14 -50 32 -52 L66 -56 L88 -88 Q94 -96 106 -96 L150 -96 Q162 -96 168 -86 L186 -56 Q204 -52 204 -36 L204 -6 Z');
  x.save();x.translate(-8,8);let g=x.createLinearGradient(0,-96,0,0);g.addColorStop(0,k[2]);g.addColorStop(1,k[3]);x.fillStyle=g;x.fill(P);x.restore();
  g=x.createLinearGradient(0,-96,0,0);g.addColorStop(0,k[0]);g.addColorStop(.5,k[1]);g.addColorStop(1,k[2]);x.fillStyle=g;x.fill(P);
  x.fillStyle='#BFE8FF';x.fill(new Path2D('M92 -60 L104 -86 L128 -86 L128 -60 Z'));x.fill(new Path2D('M136 -60 L136 -86 L152 -86 Q158 -86 162 -78 L172 -60 Z'));
  x.strokeStyle='rgba(255,255,255,.45)';x.lineWidth=4;x.lineCap='round';x.beginPath();x.moveTo(30,-48);x.lineTo(180,-48);x.stroke();
  rr(x,196,-44,10,12,4,'#FFF3B0');
  [56,164].forEach(cx=>{circ(x,cx,2,24,'#0A1230');circ(x,cx,2,11,'#C7CEDF')});x.restore()}

/* ---------------- drag & drop sorting (mouse + touch) ---------------- */
function dragSort(root,onDrop){root.querySelectorAll('.dchip:not(.placed)').forEach(ch=>{ch.onpointerdown=e=>{e.preventDefault();actx();const r=ch.getBoundingClientRect(),g=ch.cloneNode(true);g.classList.add('ghost');Object.assign(g.style,{left:r.left+'px',top:r.top+'px',width:r.width+'px'});document.body.appendChild(g);document.body.classList.add('dragging');ch.classList.add('lift');const ox=e.clientX-r.left,oy=e.clientY-r.top;let over=null;sfx('click');
const mv=ev=>{g.style.left=ev.clientX-ox+'px';g.style.top=ev.clientY-oy+'px';g.style.display='none';const el=document.elementFromPoint(ev.clientX,ev.clientY);g.style.display='';const b=el&&el.closest('.bin');if(over&&over!==b)over.classList.remove('hov');over=b&&root.contains(b)?b:null;if(over)over.classList.add('hov')};
const up=()=>{removeEventListener('pointermove',mv);removeEventListener('pointerup',up);removeEventListener('pointercancel',up);g.remove();document.body.classList.remove('dragging');ch.classList.remove('lift');if(over){over.classList.remove('hov');onDrop(ch,over)}};
addEventListener('pointermove',mv);addEventListener('pointerup',up);addEventListener('pointercancel',up)};
// keyboard: Enter picks the chip, then numbers 1..n drop it into a bin
ch.tabIndex=0;ch.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();const bins=[...root.querySelectorAll('.bin')];const n=prompt('رقم الصندوق (1 إلى '+bins.length+'):\n'+bins.map((b,i)=>(i+1)+' — '+b.querySelector('h4').textContent).join('\n'));const b=bins[(+n||0)-1];if(b)onDrop(ch,b)}}})}
// items: {label:[key,voiceKey]} ; correct => voice explanation; wrong => hint
function sortGame(root,voice,onAll){dragSort(root,(ch,bin)=>{const lab=ch.textContent;if(ch.dataset.k===bin.dataset.k){bin.querySelector('.slot').appendChild(ch);ch.classList.add('placed');ch.onpointerdown=null;ch.onkeydown=null;ch.tabIndex=-1;sfx('ok');const v=voice&&voice[lab];Teacher.say(v||praiseK());if(!root.querySelector('.dchip:not(.placed)'))onAll()}else{sfx('no');bin.classList.add('shake');setTimeout(()=>bin.classList.remove('shake'),400);Teacher.say(root.dataset.wrong||'sort_wrong',`فكّر تاني في «${lab}».`+(LINES[root.dataset.wrong||'sort_wrong']?' '+LINES[root.dataset.wrong||'sort_wrong']:''))}})}

/* ---------------- multiple choice ---------------- */
function mcq(el,qs,onDone,quiet){let i=0,sc=0,stk=0;const rec=[];const K=['أ','ب','ج','د'];const draw=()=>{if(i>=qs.length){onDone&&onDone(sc,qs.length,rec);return}const q=qs[i],op=shuffle(q[1].map((o,j)=>[o,j===0]));
el.innerHTML=`<div class="qh"><span class="qn">سؤال ${i+1} من ${qs.length}</span>${q[3]&&typeof TOPN=="function"?`<span class="tchip">${TOPN(q[3])}</span>`:''}${stk>=2?`<span class="streak"><svg width="18" height="22" viewBox="0 0 30 36" aria-hidden="true"><path d="M15 2 C20 10 28 14 26 24 C24 32 18 34 15 34 C10 34 4 31 4 23 C4 17 9 14 10 8 C13 12 14 14 15 2 Z" fill="#FF6B5A"/><path d="M15 16 C18 21 21 23 20 28 C19 31 17 32 15 32 C12 32 10 30 10 27 C10 23 13 22 15 16 Z" fill="#FFC727"/></svg>${stk} متتالية</span>`:''}<span class="qs">الدرجة ${sc}</span></div><div class="segs" style="grid-template-columns:repeat(${qs.length},minmax(0,1fr))">${qs.map((_,k)=>`<i class="${k<rec.length?(rec[k].ok?'ok':'no'):k==i?'now':''}"></i>`).join('')}</div><div class="qt">${LTX(q[0])}</div><div class="opts">${op.map((o,j)=>`<button class="opt" data-c="${o[1]?1:0}" data-t="${esc(o[0])}"><span class="k">${K[j]}</span><span>${LTX(o[0])}</span></button>`).join('')}</div><div class="qx" aria-live="polite"></div>`;
el.querySelectorAll('.opt').forEach(b=>b.onclick=()=>{const ok=b.dataset.c=='1';rec.push({q,ok,ch:b.dataset.t});el.querySelectorAll('.opt').forEach(o=>{o.disabled=true;if(o.dataset.c=='1')o.classList.add('right')});if(ok){sc++;stk++}else{stk=0;b.classList.add('wrong')}const sg=el.querySelectorAll('.segs i')[i];if(sg)sg.className=ok?'ok':'no';sfx(ok?'ok':'no');
if(!quiet){const vk=ok?praiseK():wrongK(),xk=clipFor(q[2]);Teacher.say(xk?[vk,xk]:vk,ok?(LINES[vk]+(q[2]?' '+q[2]:'')):`الإجابة الصحيحة: «${q[1][0]}». ${q[2]||''}`)}
el.querySelector('.qx').innerHTML=`<div class="qexp ${ok?'good':'bad'}"><img src="${IMG_T}" alt=""><p>${ok?'برافو!':'الإجابة الصحيحة: «'+LTX(q[1][0])+'».'} ${q[2]?LTX(q[2]):''}</p>${clipFor(q[2])?`<button class="lis" type="button" aria-label="اسمع التوضيح" title="اسمع التوضيح">${SPK}</button>`:''}<button class="btn">${i<qs.length-1?'السؤال التالي':'عرض النتيجة'}</button></div>`;const lb=el.querySelector('.qexp .lis');if(lb)lb.onclick=()=>{actx();Teacher.say(clipFor(q[2]),q[2])};const nb=el.querySelector('.qx .btn');nb.focus({preventScroll:true});nb.onclick=()=>{i++;draw()}})};draw()}

/* ---------------- loop & keyboard ---------------- */
let raf=0,timers=[],keyH=null;
function loop(fn){cancelAnimationFrame(raf);const t0=performance.now();let last=t0;const l=n=>{const dt=Math.min(.05,Math.max(0,(n-last)/1000));last=n;fn((n-t0)/1000,dt);raf=requestAnimationFrame(l)};raf=requestAnimationFrame(l)}
addEventListener('keydown',e=>{if(keyH&&!/INPUT|SELECT|TEXTAREA/.test(document.activeElement.tagName))keyH(e)});

/* ---------------- 3D station icons (ported from the Claude Design board) ---------------- */
let _iu=0;
function icon3d(kind,size=96){const u='i'+(++_iu);const g=(id,a)=>`<linearGradient id="${u}${id}" x1="0" y1="0" x2="0" y2="1">${a.map((c,i)=>`<stop offset="${i/(a.length-1)}" stop-color="${c}"/>`).join('')}</linearGradient>`;
const r=(id,a,cx='35%',cy='30%')=>`<radialGradient id="${u}${id}" cx="${cx}" cy="${cy}" r="78%">${a.map((c,i)=>`<stop offset="${[0,.33,.75,1][i]??i/(a.length-1)}" stop-color="${c}"/>`).join('')}</radialGradient>`;
const F=id=>`url(#${u}${id})`;
const defs=g('Y',['#FFE48A','#FFC727','#D99A00'])+g('Yd',['#D99A00','#9A6B00'])+g('B',['#8EA2FF','#3D5AFE','#2337B8'])+g('Bd',['#2337B8','#16247A'])+g('C',['#FFA79B','#FF6B5A','#D0443A'])+g('Cd',['#C23B31','#86211B'])+g('M',['#8FF2D2','#2ED3A0','#169E77'])+g('N',['#4A5C9A','#14204A'])+r('S',['#FFFFFF','#DCE3F2','#7C8BAA','#2B3557'])+r('Bs',['#C9D4FF','#6F86FF','#3D5AFE','#16247A'])+r('Cs',['#FFD3CC','#FF8B7C','#E0574A','#B8322A']);
const B={
home:`<path d="M84 56 L104 46 L104 92 L84 102 Z" fill="${F('Cd')}"/><rect x="22" y="56" width="62" height="46" rx="4" fill="${F('C')}"/><path d="M14 60 L53 26 L92 60 Z" fill="${F('Y')}"/><path d="M53 26 L74 16 L110 48 L92 60 Z" fill="${F('Yd')}"/><rect x="44" y="72" width="18" height="30" rx="4" fill="#14204A"/><rect x="28" y="66" width="11" height="11" rx="2" fill="#BFE8FF"/>`,
wave:`<circle cx="60" cy="58" r="40" fill="${F('Bs')}"/><path d="M26 60 Q38 48 50 60 T74 60 T96 58" stroke="#FFFFFF" stroke-width="7" fill="none" stroke-linecap="round"/><path d="M32 76 Q42 68 52 76 T72 76 T90 74" stroke="#2ED3A0" stroke-width="6" fill="none" stroke-linecap="round"/><ellipse cx="44" cy="34" rx="12" ry="7" fill="rgba(255,255,255,0.7)"/>`,
cards:`<g transform="rotate(-12 60 60)"><rect x="24" y="22" width="62" height="76" rx="10" fill="#169E77"/><rect x="24" y="18" width="62" height="76" rx="10" fill="${F('M')}"/></g><rect x="38" y="30" width="62" height="76" rx="10" fill="#D99A00"/><rect x="38" y="24" width="62" height="76" rx="10" fill="${F('Y')}"/><circle cx="56" cy="46" r="7" fill="#FFFFFF"/><path d="M44 86 L60 66 L72 78 L80 70 L94 86 Z" fill="#3D5AFE"/>`,
ruler:`<g transform="rotate(-30 60 60)"><rect x="6" y="56" width="108" height="30" rx="6" fill="${F('Yd')}"/><rect x="6" y="44" width="108" height="30" rx="6" fill="${F('Y')}"/><g stroke="#14204A" stroke-width="3" stroke-linecap="round"><path d="M18 48 V60"/><path d="M30 48 V55"/><path d="M42 48 V55"/><path d="M54 48 V64"/><path d="M66 48 V55"/><path d="M78 48 V55"/><path d="M90 48 V60"/><path d="M102 48 V55"/></g></g>`,
compass:`<ellipse cx="60" cy="66" rx="44" ry="38" fill="${F('N')}"/><ellipse cx="60" cy="58" rx="44" ry="38" fill="${F('B')}"/><ellipse cx="60" cy="58" rx="34" ry="29" fill="#F3F6FF"/><path d="M60 34 L68 58 L60 58 Z" fill="#FF6B5A"/><path d="M60 34 L52 58 L60 58 Z" fill="#D0443A"/><path d="M60 82 L52 58 L60 58 Z" fill="#7C8BAA"/><path d="M60 82 L68 58 L60 58 Z" fill="#B8C3DA"/><circle cx="60" cy="58" r="5" fill="#FFC727"/>`,
gauge:`<path d="M16 82 L16 64 Q16 54 28 52 L42 50 L54 32 Q57 28 63 28 L84 28 Q90 28 93 34 L102 50 Q110 52 110 62 L110 82 Z" fill="${F('Cd')}" transform="translate(-4 6)"/><path d="M16 82 L16 64 Q16 54 28 52 L42 50 L54 32 Q57 28 63 28 L84 28 Q90 28 93 34 L102 50 Q110 52 110 62 L110 82 Z" fill="${F('C')}"/><path d="M50 50 L58 34 L72 34 L72 50 Z" fill="#BFE8FF"/><path d="M77 50 L77 34 L86 34 Q89 34 91 38 L96 50 Z" fill="#BFE8FF"/><rect x="104" y="58" width="6" height="7" rx="2" fill="#FFF3B0"/><circle cx="36" cy="84" r="14" fill="#14204A"/><circle cx="36" cy="84" r="6" fill="#C7CEDF"/><circle cx="92" cy="84" r="14" fill="#14204A"/><circle cx="92" cy="84" r="6" fill="#C7CEDF"/>`,
fall:`<circle cx="60" cy="18" r="9" fill="rgba(124,139,170,0.25)"/><circle cx="60" cy="38" r="13" fill="rgba(124,139,170,0.4)"/><circle cx="60" cy="70" r="30" fill="${F('S')}"/><ellipse cx="50" cy="56" rx="10" ry="6" fill="rgba(255,255,255,0.9)"/><path d="M98 40 V82 M88 72 L98 84 L108 72" stroke="#FF6B5A" stroke-width="6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`,
pend:`<rect x="18" y="16" width="84" height="14" rx="6" fill="${F('Y')}"/><rect x="18" y="26" width="84" height="6" rx="3" fill="#D99A00"/><line x1="60" y1="30" x2="40" y2="78" stroke="#4A5C9A" stroke-width="4" stroke-linecap="round"/><circle cx="38" cy="84" r="18" fill="${F('Cs')}"/><ellipse cx="32" cy="77" rx="6" ry="4" fill="rgba(255,255,255,0.7)"/><path d="M88 84 A44 44 0 0 1 40 98" stroke="rgba(61,90,254,0.5)" stroke-width="3" fill="none" stroke-dasharray="4 5"/>`,
dim:`<path d="M60 14 L100 34 L60 54 L20 34 Z" fill="${F('Y')}"/><path d="M20 34 L60 54 L60 102 L20 82 Z" fill="${F('B')}"/><path d="M100 34 L60 54 L60 102 L100 82 Z" fill="${F('Bd')}"/><text x="39" y="77" text-anchor="middle" font-family="Alexandria,sans-serif" font-weight="900" font-size="22" fill="#FFFFFF">L</text><text x="81" y="77" text-anchor="middle" font-family="Alexandria,sans-serif" font-weight="900" font-size="22" fill="#FFC727">T</text><text x="60" y="40" text-anchor="middle" font-family="Alexandria,sans-serif" font-weight="900" font-size="16" fill="#14204A">M</text>`,
steps:`<rect x="26" y="20" width="70" height="86" rx="10" fill="${F('N')}"/><rect x="22" y="14" width="70" height="86" rx="10" fill="#FFFFFF"/><rect x="44" y="8" width="26" height="12" rx="5" fill="${F('Y')}"/><circle cx="36" cy="40" r="7" fill="${F('M')}"/><rect x="48" y="36" width="34" height="8" rx="4" fill="#C9D2FF"/><circle cx="36" cy="60" r="7" fill="${F('M')}"/><rect x="48" y="56" width="30" height="8" rx="4" fill="#C9D2FF"/><circle cx="36" cy="80" r="7" fill="${F('Y')}"/><rect x="48" y="76" width="26" height="8" rx="4" fill="#C9D2FF"/>`,
trophy:`<path d="M30 30 Q12 30 14 48 Q16 62 38 64" stroke="${F('Yd')}" stroke-width="8" fill="none"/><path d="M90 30 Q108 30 106 48 Q104 62 82 64" stroke="${F('Yd')}" stroke-width="8" fill="none"/><path d="M30 20 H90 V46 Q90 74 60 76 Q30 74 30 46 Z" fill="${F('Y')}"/><path d="M40 26 V44 Q40 58 52 64" stroke="rgba(255,255,255,0.65)" stroke-width="6" fill="none" stroke-linecap="round"/><rect x="52" y="74" width="16" height="14" fill="#D99A00"/><rect x="36" y="94" width="48" height="10" rx="3" fill="${F('N')}"/><rect x="40" y="86" width="40" height="12" rx="3" fill="${F('B')}"/>`};
return `<svg class="i3" width="${size}" height="${size}" viewBox="0 0 120 120" aria-hidden="true"><defs>${defs}</defs><ellipse cx="60" cy="108" rx="38" ry="7" fill="rgba(20,32,74,0.22)"/>${B[kind]||B.home}</svg>`}
function medal3d(kind){const u='m'+(++_iu);return `<svg viewBox="0 0 230 270" width="190" height="223" aria-hidden="true"><defs><linearGradient id="${u}a" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7B93FF"/><stop offset="1" stop-color="#2337B8"/></linearGradient><linearGradient id="${u}b" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FF8B7C"/><stop offset="1" stop-color="#B8322A"/></linearGradient><radialGradient id="${u}g" cx="38%" cy="32%" r="75%"><stop offset="0" stop-color="#FFF6CF"/><stop offset=".35" stop-color="#FFD54F"/><stop offset=".8" stop-color="#E0A300"/><stop offset="1" stop-color="#9A6B00"/></radialGradient></defs><path d="M60 0 L100 0 L130 100 L95 112 Z" fill="url(#${u}a)"/><path d="M170 0 L130 0 L100 100 L135 112 Z" fill="url(#${u}b)"/><ellipse cx="115" cy="256" rx="70" ry="10" fill="rgba(0,0,0,.3)"/><circle cx="115" cy="170" r="84" fill="#9A6B00"/><circle cx="115" cy="162" r="84" fill="url(#${u}g)"/><circle cx="115" cy="162" r="62" fill="#FFF3C4" stroke="#C08A00" stroke-width="4"/><g transform="translate(70 117) scale(.75)">${icon3d(kind,120).replace(/^<svg[^>]*>/,'').replace(/<\/svg>$/,'')}</g><ellipse cx="86" cy="124" rx="18" ry="10" fill="rgba(255,255,255,.55)" transform="rotate(-30 86 124)"/></svg>`}

const SCENE3D=`<svg role="img" aria-label="منصة معمل ثلاثية الأبعاد عليها كرة حديد وسيارة وبندول وكواكب" class="scene" viewBox="0 0 640 788">
<defs>
<radialGradient id="wsteel" cx="35%" cy="30%" r="75%"><stop offset="0" stop-color="#FFFFFF"/><stop offset="0.25" stop-color="#DCE3F2"/><stop offset="0.7" stop-color="#7C8BAA"/><stop offset="1" stop-color="#2B3557"/></radialGradient>
<radialGradient id="wcoralS" cx="35%" cy="30%" r="75%"><stop offset="0" stop-color="#FFD3CC"/><stop offset="0.35" stop-color="#FF8B7C"/><stop offset="1" stop-color="#B8322A"/></radialGradient>
<radialGradient id="wearth" cx="35%" cy="30%" r="80%"><stop offset="0" stop-color="#B9C8FF"/><stop offset="0.45" stop-color="#3D5AFE"/><stop offset="1" stop-color="#16247A"/></radialGradient>
<radialGradient id="wmoon" cx="35%" cy="30%" r="80%"><stop offset="0" stop-color="#FFFFFF"/><stop offset="0.5" stop-color="#C7CEDF"/><stop offset="1" stop-color="#6E7896"/></radialGradient>
<linearGradient id="wplatTop" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5F79FF"/><stop offset="1" stop-color="#3048D8"/></linearGradient>
<linearGradient id="wplatSide" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFC727"/><stop offset="1" stop-color="#C08A00"/></linearGradient>
<linearGradient id="wcarBody" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FF9C8F"/><stop offset="0.5" stop-color="#FF6B5A"/><stop offset="1" stop-color="#C93C31"/></linearGradient>
<linearGradient id="wcarSide" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#C93C31"/><stop offset="1" stop-color="#8E241D"/></linearGradient>
<linearGradient id="wbeam" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5B6A9C"/><stop offset="1" stop-color="#26315E"/></linearGradient>
<linearGradient id="wrulerTop" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFE48A"/><stop offset="1" stop-color="#FFC727"/></linearGradient>
<pattern id="whaz" width="28" height="28" patternUnits="userSpaceOnUse" patternTransform="rotate(35)"><rect width="28" height="28" fill="#FFC727"/><rect width="13" height="28" fill="#14204A"/></pattern>
</defs>

<ellipse cx="320" cy="700" rx="290" ry="58" fill="rgba(0,0,0,0.35)"/>
<path d="M30 590 L30 640 A290 92 0 0 0 610 640 L610 590 Z" fill="url(#wplatSide)"/>
<path d="M30 622 L30 640 A290 92 0 0 0 610 640 L610 622 A290 92 0 0 1 30 622 Z" fill="url(#whaz)" opacity="0.9"/>
<ellipse cx="320" cy="590" rx="290" ry="92" fill="url(#wplatTop)"/>
<ellipse cx="320" cy="586" rx="250" ry="72" fill="none" stroke="rgba(255,255,255,0.25)" stroke-width="3" stroke-dasharray="14 12"/>

<ellipse cx="452" cy="560" rx="70" ry="14" fill="rgba(10,18,50,0.45)"/>
<rect x="390" y="300" width="22" height="262" rx="8" fill="url(#wbeam)"/>
<rect x="500" y="300" width="22" height="262" rx="8" fill="url(#wbeam)"/>
<rect x="376" y="288" width="160" height="26" rx="10" fill="#FFC727"/>
<rect x="376" y="304" width="160" height="10" rx="5" fill="#C08A00"/>
<line x1="456" y1="312" x2="412" y2="470" stroke="#E6EAF7" stroke-width="4" stroke-linecap="round"/>
<circle cx="412" cy="478" r="30" fill="url(#wcoralS)"/>
<ellipse cx="402" cy="466" rx="10" ry="6" fill="rgba(255,255,255,0.7)"/>
<path d="M470 500 A120 120 0 0 1 380 492" stroke="rgba(255,255,255,0.35)" stroke-width="3" fill="none" stroke-dasharray="6 8"/>

<ellipse cx="190" cy="604" rx="66" ry="14" fill="rgba(10,18,50,0.45)"/>
<circle cx="190" cy="546" r="60" fill="url(#wsteel)"/>
<ellipse cx="170" cy="520" rx="20" ry="12" fill="rgba(255,255,255,0.85)"/>

<g transform="translate(250 600)">
<ellipse cx="96" cy="30" rx="106" ry="14" fill="rgba(10,18,50,0.45)"/>
<path d="M14 -6 L14 -34 Q14 -50 32 -52 L66 -56 L88 -88 Q94 -96 106 -96 L150 -96 Q162 -96 168 -86 L186 -56 Q204 -52 204 -36 L204 -6 Z" fill="url(#wcarSide)" transform="translate(-8 8)"/>
<path d="M14 -6 L14 -34 Q14 -50 32 -52 L66 -56 L88 -88 Q94 -96 106 -96 L150 -96 Q162 -96 168 -86 L186 -56 Q204 -52 204 -36 L204 -6 Z" fill="url(#wcarBody)"/>
<path d="M92 -60 L104 -86 L128 -86 L128 -60 Z" fill="#BFE8FF"/>
<path d="M136 -60 L136 -86 L152 -86 Q158 -86 162 -78 L172 -60 Z" fill="#BFE8FF"/>
<rect x="196" y="-44" width="10" height="12" rx="4" fill="#FFF3B0"/>
<path d="M30 -48 L180 -48" stroke="rgba(255,255,255,0.45)" stroke-width="4" stroke-linecap="round"/>
<circle cx="56" cy="2" r="24" fill="#14204A"/><circle cx="56" cy="2" r="11" fill="#C7CEDF"/>
<circle cx="164" cy="2" r="24" fill="#14204A"/><circle cx="164" cy="2" r="11" fill="#C7CEDF"/>
<path d="M-24 -70 H-2 M-38 -50 H-8 M-24 -30 H-4" stroke="rgba(255,255,255,0.6)" stroke-width="5" stroke-linecap="round"/>
</g>

<g transform="translate(70 270) rotate(-18)">
<rect x="0" y="12" width="210" height="34" rx="8" fill="#C08A00"/>
<rect x="0" y="0" width="210" height="34" rx="8" fill="url(#wrulerTop)"/>
<g stroke="#14204A" stroke-width="3" stroke-linecap="round"><path d="M20 4 V18"/><path d="M40 4 V12"/><path d="M60 4 V12"/><path d="M80 4 V12"/><path d="M100 4 V22"/><path d="M120 4 V12"/><path d="M140 4 V12"/><path d="M160 4 V12"/><path d="M180 4 V18"/></g>
</g>

<circle cx="120" cy="120" r="52" fill="url(#wearth)"/>
<path d="M88 102 Q110 92 120 108 Q132 126 156 116" stroke="#2ED3A0" stroke-width="10" fill="none" stroke-linecap="round"/>
<ellipse cx="104" cy="98" rx="14" ry="9" fill="rgba(255,255,255,0.6)"/>
<ellipse cx="120" cy="124" rx="86" ry="22" fill="none" stroke="rgba(255,199,39,0.85)" stroke-width="5" transform="rotate(-16 120 124)"/>
<circle cx="500" cy="150" r="30" fill="url(#wmoon)"/>
<circle cx="510" cy="160" r="6" fill="rgba(110,120,150,0.6)"/><circle cx="490" cy="142" r="4" fill="rgba(110,120,150,0.6)"/>

<g fill="#FFC727"><path d="M330 120 l6 16 16 6 -16 6 -6 16 -6 -16 -16 -6 16 -6z"/><path d="M590 300 l4 10 10 4 -10 4 -4 10 -4 -10 -10 -4 10 -4z"/><path d="M260 210 l3 8 8 3 -8 3 -3 8 -3 -8 -8 -3 8 -3z" fill="#FFFFFF"/></g>
</svg>`;

const W=b=>`<svg viewBox="0 0 200 110" role="img">${b}</svg>`;
const ci=(x,y,r,f='#D7263D',e='')=>`<circle cx="${x}" cy="${y}" r="${r}" fill="${f}" ${e}/>`;
const ln=(a,b,c,d,k='#D7263D',w=3,e='')=>`<line x1="${a}" y1="${b}" x2="${c}" y2="${d}" stroke="${k}" stroke-width="${w}" ${e}/>`;
const rc=(x,y,w,h,f,r=0,e='')=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${f}" ${e}/>`;
const tx=(x,y,t,c='#0E2A47',z=11)=>`<text x="${x}" y="${y}" text-anchor="middle" font-size="${z}" font-weight="bold" fill="${c}" font-family="Tajawal,Tahoma,Arial"${/[\u0600-\u06FF]/.test(t)?'':' direction="ltr"'}>${t}</text>`;
const AR=(a,b,c,d,k='#D7263D',w=3)=>{const t=Math.atan2(d-b,c-a),h=4+w*2,p=r=>[c-h*Math.cos(t+r),d-h*Math.sin(t+r)].join(',');return ln(a,b,c-h*.6*Math.cos(t),d-h*.6*Math.sin(t),k,w)+`<polygon points="${c},${d} ${p(.45)} ${p(-.45)}" fill="${k}"/>`};
const cr=(x,y,s=1)=>`<g transform="translate(${x},${y}) scale(${s})"><path d="M12 10 L16 1 H36 L42 10Z" fill="#BFE8F7" stroke="#0A1B2E" stroke-width="2"/><rect x="0" y="9" width="52" height="14" rx="4" fill="#FFC21A" stroke="#0A1B2E" stroke-width="2"/><circle cx="13" cy="24" r="5" fill="#0A1B2E"/><circle cx="39" cy="24" r="5" fill="#0A1B2E"/></g>`;
const rings=(x,y)=>[0,.7,1.4].map(d=>`<circle cx="${x}" cy="${y}" r="4" fill="none" stroke="#2B8FD9" stroke-width="2.5"><animate attributeName="r" from="4" to="45" dur="2.1s" begin="${d}s" repeatCount="indefinite"/><animate attributeName="opacity" from="1" to="0" dur="2.1s" begin="${d}s" repeatCount="indefinite"/></circle>`).join('');
const rot=(x,y,d)=>`<animateTransform attributeName="transform" type="rotate" from="0 ${x} ${y}" to="360 ${x} ${y}" dur="${d}s" repeatCount="indefinite"/>`;
const sw=`<animateTransform attributeName="transform" type="rotate" values="25 70 8;-25 70 8;25 70 8" dur="2s" repeatCount="indefinite"/>`;
const sun=ci(100,55,14,'#FFC21A')+[0,1,2,3,4,5,6,7].map(i=>{const a=i*.785;return ln(100+22*Math.cos(a),55+22*Math.sin(a),100+40*Math.cos(a),55+40*Math.sin(a),'#FFC21A',4)}).join('');
const LT=t=>t.replace(/(?:\d\.\d|[A-Za-zθπΩ0-9\[\]()=\/+×÷²³ᵃᵇᶜ⁻¹−\-])+(?: (?:\d\.\d|[A-Za-zθπΩ0-9\[\]()=\/+×÷²³ᵃᵇᶜ⁻¹−\-])+)*/g,m=>/[A-Za-zθπΩ]/.test(m)?`<bdi dir="ltr">${m}</bdi>`:m);
const CA=[
['الجسيم','جسم له كتلة (كرة، سيارة، ذرة). مثال: كرة القدم عند ركلها.',ci(130,55,24,'#fff','stroke="#0A1B2E" stroke-width="3"')+AR(20,55,98,55)+tx(130,60,'كرة')],
['الموجة','طاقة تنتقل من مكان لآخر. مثال: صوت جرس المدرسة (دوائر تتسع).',rings(100,55)+rc(93,48,14,14,'#0E2A47')],
['موجة الضوء','ضوء المصباح ينتقل في كل الاتجاهات كموجة.',sun],
['النموذج الجسيمي','ننظر للشيء ككتلة واحدة: السيارة = نقطة، ولا نهتم بالمحرك والأبواب والمقاعد.',cr(15,45)+AR(78,58,128,58)+ci(160,58,9)],
['نموذج الأمواج','يفسر الضوء والموجات اللاسلكية والليزر: المحطة ترسل والراديو يستقبل.',rings(45,45)+'<polygon points="45,35 33,85 57,85" fill="#0E2A47"/>'+rc(120,45,55,38,'#D7263D',4)+ci(135,64,9,'#fff')+tx(45,103,'محطة')+tx(148,103,'راديو')],
['الفيزياء التقليدية','حتى نهاية القرن 19: الصوت والضوء والمغناطيسية والكهربية (مصباح، جرس، بوصلة).',ci(60,32,16,'#FFC21A')+rc(54,48,12,12,'#7A8CA0')+ln(15,85,185,85,'#0E2A47',3)+ci(150,85,7)+tx(150,104,'نهاية القرن 19')],
['الفيزياء الحديثة','بعد اكتشاف الأشعة السينية: الفيزياء الذرية والنووية والنسبية ونظرية الكم.',[0,60,120].map(a=>`<ellipse cx="100" cy="55" rx="50" ry="17" fill="none" stroke="#2B8FD9" stroke-width="2" transform="rotate(${a} 100 55)"/>`).join('')+ci(100,55,9)],
['عالم تجريبي','يجري تجارب معملية: يقيس زمن سقوط كرة من ارتفاع 2 م عدة مرات ويسجل النتائج.',rc(40,10,6,92,'#B9C6D3')+`<circle cx="80" cy="16" r="9" fill="#D7263D"><animate attributeName="cy" values="16;92;16" dur="2s" repeatCount="indefinite"/></circle>`+ci(150,50,24,'#fff','stroke="#0E2A47" stroke-width="3"')+`<line x1="150" y1="50" x2="150" y2="34" stroke="#D7263D" stroke-width="3">${rot(150,50,4)}</line>`+tx(150,92,'ساعة إيقاف')],
['عالم نماذج رياضية','يضع معادلة تتنبأ بزمن السقوط دون إجراء التجربة.',ln(30,95,30,10,'#0A1B2E',2)+ln(30,95,185,95,'#0A1B2E',2)+'<path d="M30 95 Q100 95 170 15" fill="none" stroke="#D7263D" stroke-width="3"/>'+tx(110,60,'d = ½ g t²')],
['كيف يعمل العالِم؟','ملاحظة الظاهرة ← تجربة وقياس ← نموذج رياضي ← تنبؤ ومقارنة.',[['ملاحظة',152],['تجربة',106],['نموذج',60],['تنبؤ',14]].map((a,i)=>rc(a[1],36,38,34,i%2?'#2B8FD9':'#0E2A47',5)+tx(a[1]+19,57,a[0],'#fff',10)+(i<3?AR(a[1]-1,53,a[1]-7,53,'#D7263D',2):'')).join('')],
['القياس','مقارنة كمية بوحدة معيارية: العصا 1 م تتكرر 3 مرات، إذن الطاولة 3 م.',rc(20,15,160,14,'#9A6B3A')+[0,1,2].map(i=>rc(20+i*53.3,40,53.3,18,i==1?'#2B8FD9':'#0E2A47')+tx(47+i*53.3,53,'1 m','#fff',10)).join('')+tx(100,85,'الطاولة = 3 م','#0E2A47',13)],
['المتر قديماً','واحد على عشرة مليون من المسافة بين القطب الشمالي وخط الاستواء.',rc(38,16,8,74,'#2B8FD9')+ci(42,12,8,'#fff','stroke="#0A1B2E" stroke-width="2"')+ci(42,94,8)+tx(125,16,'القطب الشمالي')+tx(125,100,'خط الاستواء')+tx(125,58,'÷ 10 000 000 = 1 m','#0A1B2E',10)],
['المتر العياري','المسافة بين علامتين محفورتين على ساق من سبيكة البلاتين والإيريديوم.',rc(20,35,160,14,'#B9C6D3')+rc(40,27,4,30,'#0A1B2E')+rc(156,27,4,30,'#0A1B2E')+AR(44,76,156,76,'#D7263D',2)+tx(100,98,'1 m','#D7263D',13)],
['الكيلوجرام قديماً','كتلة لتر ماء عند 4 °م. مثال: زجاجة 1.5 لتر ≈ 1.5 كجم.',rc(20,22,50,72,'#fff',0,'stroke="#2B8FD9" stroke-width="2"')+rc(21,48,48,45,'#8FD3F0')+tx(45,76,'1 L','#0E2A47',12)+AR(80,58,118,58)+rc(125,40,55,36,'#D7263D',3)+tx(152,63,'1 kg','#fff',13)],
['الكيلوجرام العياري','أسطوانة من البلاتين والإيريديوم محفوظة في مكتب الأوزان والمقاييس.','<path d="M60 35V80A40 12 0 0 0 140 80V35Z" fill="#B9C6D3"/><ellipse cx="100" cy="35" rx="40" ry="12" fill="#DCE4EC" stroke="#7A8CA0"/>'+tx(100,66,'1 kg','#0A1B2E',15)],
['الثانية قديماً','1 / 86400 من اليوم الشمسي المتوسط: 1 h = 3600 s ، 1 day = 86400 s.','<path d="M20 90 Q100 -10 180 90" fill="none" stroke="#FFC21A" stroke-width="2" stroke-dasharray="6 4"/><circle r="11" fill="#FFC21A"><animateMotion dur="5s" repeatCount="indefinite" path="M20 90 Q100 -10 180 90"/></circle>'+ln(10,95,190,95,'#7A8CA0',4)+tx(100,70,'يوم = 86400 ث','#0E2A47',12)],
['الثانية الذرية','الفترة التي تستغرقها ذبذبات الأشعة المنبعثة من ذرات السيزيوم (ساعات دقيقة جداً).',ci(65,55,38,'#fff','stroke="#0E2A47" stroke-width="4"')+`<line x1="65" y1="55" x2="65" y2="28" stroke="#D7263D" stroke-width="3">${rot(65,55,6)}</line>`+ci(150,50,6)+'<ellipse cx="150" cy="50" rx="26" ry="10" fill="none" stroke="#2B8FD9" stroke-width="2"/>'+tx(150,92,'Cs')],
['أنظمة الوحدات','جاوس: سم-جم-ث. المتري والدولي: م-كجم-ث.',[['جاوس','cm','g','s'],['متري','m','kg','s'],['دولي','m','kg','s']].map((r,i)=>r.map((t,j)=>rc(14+j*46,12+i*32,43,28,j?'#EEF3F8':'#0E2A47',4)+tx(35.5+j*46,31+i*32,t,j?'#0E2A47':'#fff',11)).join('')).join('')],
['الراديان','زاوية تقابل قوساً طوله = نصف القطر: θ = s / r ، 360° = 2π rad.','<circle cx="80" cy="55" r="45" fill="none" stroke="#D5DEE8" stroke-width="2"/>'+ln(80,55,125,55,'#0E2A47',2)+ln(80,55,104,17,'#0E2A47',2)+'<path d="M125 55A45 45 0 0 0 104 17" fill="none" stroke="#D7263D" stroke-width="5"/>'+tx(104,50,'1 rad','#0E2A47',9)+tx(150,32,'s = r','#D7263D',11)+tx(102,70,'r')],
['الأستراديان','زاوية مجسمة: مساحة A = r² على سطح الكرة: Ω = A / r² ، الكرة كلها = 4π sr.','<polygon points="15,55 150,18 150,92" fill="#fff" stroke="#0E2A47" stroke-width="2"/><ellipse cx="150" cy="55" rx="14" ry="37" fill="#FFE7A3" stroke="#D7263D" stroke-width="2"/>'+ln(15,55,150,55,'#0E2A47',1.5,'stroke-dasharray="5 4"')+tx(80,48,'r')+tx(150,59,'A','#D7263D',12)],
['كميات أساسية ومشتقة','الأساسية: الطول L والكتلة M والزمن T. المشتقة تتكون منها: السرعة = L ÷ T.',rc(14,12,36,28,'#0E2A47',5)+tx(32,32,'L','#fff',14)+rc(58,12,36,28,'#2B8FD9',5)+tx(76,32,'M','#fff',14)+rc(102,12,36,28,'#0E2A47',5)+tx(120,32,'T','#fff',14)+rc(14,64,36,30,'#0E2A47',5)+tx(32,85,'L','#fff',14)+tx(65,85,'÷','#0A1B2E',18)+rc(80,64,36,30,'#D7263D',5)+tx(98,85,'T','#fff',14)+tx(155,85,'= v','#17A36B',14)],
['معادلة الأبعاد','[Q] = Lᵃ Mᵇ Tᶜ. مثال: السرعة [v] = L T⁻¹ والعجلة [a] = L T⁻².',rc(15,12,170,40,'#0E2A47',8)+tx(100,39,'[Q] = Lᵃ Mᵇ Tᶜ','#fff',16)+tx(100,76,'[v] = L T⁻¹  ,  [a] = L T⁻²','#D7263D',12)+tx(100,98,'[F] = M L T⁻²','#0E2A47',12)],
['الحركة الانتقالية','في خط مستقيم من نقطة بداية إلى نقطة نهاية (كحركة المقذوفات).',cr(125,22)+AR(175,65,25,65)+ci(175,90,6,'#17A36B')+ci(25,90,6)+tx(175,106,'بداية','#17A36B',9)+tx(25,106,'نهاية','#D7263D',9)],
['الحركة الدورية','تكرر نفسها في أزمنة متساوية: بندول الساعة وعقرب الساعة.',`<line x1="55" y1="8" x2="55" y2="80" stroke="#0A1B2E" stroke-width="2"><animateTransform attributeName="transform" type="rotate" values="25 55 8;-25 55 8;25 55 8" dur="2s" repeatCount="indefinite"/></line><circle cx="55" cy="86" r="10" fill="#2B8FD9"><animateTransform attributeName="transform" type="rotate" values="25 55 8;-25 55 8;25 55 8" dur="2s" repeatCount="indefinite"/></circle>`+ci(145,55,34,'#fff','stroke="#0E2A47" stroke-width="4"')+`<line x1="145" y1="55" x2="145" y2="28" stroke="#D7263D" stroke-width="3">${rot(145,55,6)}</line>`],
['المسافة والإزاحة','المسافة 3+4 = 7 م (طول المسار). الإزاحة √(3²+4²) = 5 م (بخط مستقيم).','<polyline points="30,92 110,92 110,18" fill="none" stroke="#D7263D" stroke-width="3"/><line x1="30" y1="92" x2="110" y2="18" stroke="#17A36B" stroke-width="3" stroke-dasharray="7 5"/>'+ci(30,92,6,'#0A1B2E')+ci(110,18,6,'#0E2A47')+tx(70,106,'3 م شرقاً','#D7263D',10)+tx(155,58,'4 م شمالاً','#D7263D',10)+tx(55,50,'5 م','#17A36B',10)],
['السرعة المنتظمة وغير المنتظمة','منتظمة: مسافات متساوية كل ثانية. غير منتظمة: مسافات مختلفة (سيارة في الزحام).',tx(100,18,'منتظمة','#17A36B',11)+ln(10,40,190,40,'#7A8CA0',3)+[20,60,100,140,180].map(x=>rc(x-1,32,3,16,'#17A36B')).join('')+tx(100,72,'غير منتظمة','#D7263D',11)+ln(10,95,190,95,'#7A8CA0',3)+[20,38,85,104,172].map(x=>rc(x-1,87,3,16,'#D7263D')).join('')],
['السرعة المتوسطة','v = d / t. مثال: رحلة 150 كم في 3 ساعات: v = 50 كم/س.',cr(15,22)+AR(15,66,180,66)+tx(100,88,'d = 150 km , t = 3 h','#0E2A47',11)+tx(100,104,'v = 150 / 3 = 50 km/h','#17A36B',11)],
['العجلة','معدل تغير السرعة a = (Vf − Vo) / t. هنا تزيد السرعة 2 م/ث كل ثانية.',[0,1,2,3].map(i=>cr(8+i*47,26,.6)+AR(10+i*47,20,12+i*47+8+i*7,20,'#17A36B',2)+tx(24+i*47,76,'v='+2*i,'#0E2A47',9)+tx(24+i*47,90,'t='+i,'#7A8CA0',9)).join('')+ln(5,58,195,58,'#7A8CA0',3)],
['السقوط الحر','يسقط الجسم بعجلة g = 9.8 م/ث²: تزداد سرعته كل ثانية.',ln(40,5,40,105,'#7A8CA0',4)+[[10,'0',0],[20,'9.8',1],[48,'19.6',2],[95,'29.4',3]].map(a=>ci(40,a[0],7,a[2]?'#0E2A47':'#D7263D')+tx(95,a[0]+4,'v = '+a[1],'#17A36B',10)+tx(155,a[0]+4,'t = '+a[2]+' s','#0A1B2E',10)).join('')],
['القذف لأعلى','تصعد الكرة 2 ث حتى تصل Vf = 0 ثم تهبط 2 ث. السرعة الابتدائية: Vo = 19.6 م/ث.',AR(60,98,60,26,'#D7263D',4)+AR(140,26,140,98,'#2B8FD9',4)+ci(100,16,9,'#FFC21A')+tx(100,40,'Vf = 0','#0E2A47',10)+tx(35,62,'2 s','#D7263D',11)+tx(165,62,'2 s','#2B8FD9',11)+ln(25,104,175,104,'#7A8CA0',4)],
['السكون والتوقف','السكون: Vo = 0 مثل سيارة عند الإشارة. التوقف تماماً: Vf = 0 مثل الفرامل.',cr(15,35)+tx(41,82,'Vo = 0','#17A36B',12)+ci(70,20,6,'#17A36B')+cr(115,35)+rc(178,28,6,42,'#D7263D')+tx(141,82,'Vf = 0','#D7263D',12)],
['عجلة متزايدة ومتناقصة','تزايدية: من 4 إلى 6 م/ث في ثانية، العجلة a = +2. تناقصية: من 20 إلى 14 م/ث في ثانيتين، العجلة a = −3.',cr(15,12,.8)+AR(65,31,125,31,'#17A36B',3)+tx(160,36,'a = +2','#17A36B',12)+cr(15,62,.8)+AR(110,81,65,81,'#D7263D',3)+tx(160,86,'a = −3','#D7263D',12)]];

/* ================= HOME: the station map ================= */
function pHome(m){const labs=LABS.slice(1),dn=labs.filter(l=>S.done[l.id]).length,lv=Math.min(LV.length-1,Math.floor(S.xp/100)),nx=labs.find(l=>!S.done[l.id]);
m.innerHTML=`<div class="maphead"><h1>رحلة المعمل</h1><span>${dn==0?'ابدأ من المحطة الأولى':dn<labs.length?`خلّصت ${dn} من ${labs.length} محطات`:'خلّصت كل المحطات'}</span></div>
<section class="map" id="map" aria-label="خريطة المحطات"><svg class="road" id="road" aria-hidden="true"></svg>${labs.map((l,i)=>`<button class="ped ${S.done[l.id]?'done':''} ${l===nx?'cur':''}" data-go="${l.id}" aria-label="المحطة ${i+1}: ${l.t}${S.done[l.id]?' — مكتملة':''}">${l===nx?'<span class="here">ابدأ هنا</span>':''}<span class="pic3">${icon3d(l.icon,96)}</span><span class="disc"><i class="n">${i+1}</i></span><span class="lbl">${l.t}</span></button>`).join('')}</section>
<section class="panel"><div class="grp" style="margin-top:0"><h2>لوحة الشارات</h2><span>${dn} من ${labs.length}</span></div><div class="badges">${labs.map(l=>`<div class="bdg ${S.done[l.id]?'on':''}"><div class="md">${icon3d(l.icon,64)}</div>${l.bd}</div>`).join('')}</div></section>
<section class="panel"><h3>الإعدادات</h3><div class="setrow"><b>صوت المستر</b><div class="seg" id="vpick">${VNAMES().map(n=>`<button data-v="${n}" class="${vname()==n?'on':''}">${VPACKS[n].name}<small>${VPACKS[n].note}</small></button>`).join('')}</div><button class="btn ghost" id="vtry">${ic('voice')} اسمع الصوت</button></div>${VNAMES().length<2?'<p class="mut" style="font-size:14px;margin-top:8px">صوت «شاكر» المصري بيتضاف تلقائياً بعد رفع المعمل على GitHub.</p>':''}
<div class="row" style="margin-top:14px"><button class="btn ghost" id="ren">${ic('user')} تغيير الاسم</button><button class="btn ghost" id="sw">${ic('swap')} تبديل الطالب</button><button class="btn ghost" id="rst">${ic('trash')} مسح تقدمي</button>${SWOK?`<button class="btn ghost" id="offl">${ic('download')} حمّل الصوت للاستخدام بدون نت</button>`:''}</div></section>`;
m.querySelectorAll('[data-go]').forEach(e=>e.onclick=()=>go(e.dataset.go));
const lay=()=>{const mp=$('#map');if(!mp)return;const W=mp.clientWidth,per=W>=1000?4:W>=700?3:2,peds=[...mp.querySelectorAll('.ped')],rowH=W>=700?250:220,padX=W/per/2,pts=[];
  peds.forEach((p,i)=>{const r=Math.floor(i/per),c=i%per,rev=r%2==0;const cx=rev?W-padX-c*(W-2*padX)/Math.max(1,per-1):padX+c*(W-2*padX)/Math.max(1,per-1);const cy=150+r*rowH;p.style.left=(cx-p.offsetWidth/2)+'px';p.style.top=(cy-104)+'px';pts.push([cx,cy])});
  const H=150+(Math.ceil(peds.length/per)-1)*rowH+120;mp.style.height=H+'px';let d=`M${pts[0][0]+(W-pts[0][0])} ${pts[0][1]} L${pts[0][0]} ${pts[0][1]}`;
  for(let i=1;i<pts.length;i++){const[a,b]=pts[i-1],[c,e]=pts[i];if(b===e)d+=` L${c} ${e}`;else{const side=a<W/2?-1:1,bx=a+side*padX*.9;d+=` C${bx} ${b} ${bx} ${e} ${c} ${e}`}}
  const L=pts[pts.length-1],dir=(Math.floor((pts.length-1)/per)%2==0)?-1:1;d+=` L${L[0]+dir*Math.min(80,padX)} ${L[1]}`;
  const doneN=dn;let partial='';if(doneN>0){partial=d.split(/(?=[LC])/).slice(0,doneN+1).join('')}
  $('#road').setAttribute('viewBox',`0 0 ${W} ${H}`);$('#road').innerHTML=`<path d="${d}" class="r0" transform="translate(0 12)"/><path d="${d}" class="r1"/>${partial?`<path d="${partial}" class="r3"/>`:''}<path d="${d}" class="r2"/>`};
lay();window.onresize=()=>{if(cur=='home')lay()};
$$('#vpick button').forEach(b=>b.onclick=()=>{actx();P().vname=b.dataset.v;saveDB();$$('#vpick button').forEach(o=>o.classList.toggle('on',o==b));Teacher.say('voice_on');autoCache()});
$('#vtry').onclick=()=>{actx();Teacher.say('welcome_new')};
$('#ren').onclick=()=>{const n=prompt('اكتب اسمك:',S.name);if(n&&n.trim()){S.name=n.trim().slice(0,40);save();updTop();go('home')}};
$('#sw').onclick=()=>{Teacher.stop();DB.current=null;saveDB();showWelcome()};
$('#rst').onclick=()=>{if(confirm('هل تريد مسح كل النقاط والشارات الخاصة بـ '+S.name+'؟')){Object.assign(S,blankP(S.name));save();updTop();updNav();go('home')}};
if($('#offl'))$('#offl').onclick=()=>cacheVoices(true);
if(dn==0)Teacher.say('welcome_new');else if(dn<labs.length)Teacher.say('home_progress',`خلّصت ${dn} من ${labs.length} محطات. `+LINES.home_progress);else Teacher.say('home_done')}

/* ================= 1 INTRO: particles & waves ================= */
function pIntro(m,L){const items=[['كرة القدم','p','it_ball'],['صوت جرس المدرسة','w','it_bell'],['ضوء المصباح','w','it_lamp'],['سيارة','p','it_car'],['ذرة','p','it_atom'],['موجات الراديو','w','it_radio'],['حجر','p','it_stone'],['أشعة الليزر','w','it_laser']];
m.innerHTML=plate(L,'الفيزياء تدرس <b>الجسيمات</b> (أجسام لها كتلة: كرة، سيارة، ذرة) و<b>الأمواج</b> (طاقة تنتقل من مكان لآخر: صوت، ضوء، موج الماء).')+
`<section class="panel">${panelH('flask','تجربة البركة: انقر على الماء لإسقاط حجر')}<div class="screen"><canvas id="c" aria-label="بركة ماء ومركب"></canvas>${rd([['r_n','أحجار','y'],['r_w','موجات نشطة','c']])}</div><div class="note">راقب المركب: هل يتحرك مع الموجة للأمام، أم يصعد ويهبط في مكانه؟</div></section>
${mission('intro','اسحب كل بطاقة إلى الصندوق الصحيح: جسيم أم موجة؟',`<div class="chips">${shuffle(items).map(i=>`<span class="dchip" data-k="${i[1]}">${i[0]}</span>`).join('')}</div><div class="bins"><div class="bin" data-k="p"><h4>جسيم — له كتلة</h4><div class="slot"></div></div><div class="bin" data-k="w"><h4>موجة — طاقة تنتقل</h4><div class="slot"></div></div></div>`)}
<div class="facts"><div><h4>النموذج الجسيمي</h4><p>ننظر للجسم ككتلة واحدة: السيارة = نقطة.</p></div><div><h4>نموذج الأمواج</h4><p>يفسر الضوء والموجات اللاسلكية والليزر.</p></div><div><h4>الفيزياء التقليدية</h4><p>حتى نهاية القرن 19: الصوت والضوء والمغناطيسية والكهربية.</p></div><div><h4>الفيزياء الحديثة</h4><p>بعد اكتشاف الأشعة السينية: الذرية والنووية والنسبية ونظرية الكم.</p></div></div>`;
const x=CV('#c',900,360),st=[],rp=[],sp=[],BX=680,WY=196;let n=0;
x.c.onpointerdown=e=>{actx();const[px,py]=ptr(x,e);st.push({x:Math.max(30,Math.min(870,px)),y:-15,vy:0,ty:py<WY?280:Math.max(WY+20,Math.min(340,py))});sfx('click')};
loop((t,dt)=>{let g=x.createLinearGradient(0,0,0,WY);g.addColorStop(0,'#0A1F36');g.addColorStop(1,'#1E5A8A');x.fillStyle=g;x.fillRect(0,0,900,WY);
  // distant shipyard crane silhouette
  x.fillStyle='#0E2A47';x.fillRect(90,70,10,WY-70);x.fillRect(40,70,170,9);x.fillRect(120,40,6,40);x.beginPath();x.moveTo(95,40);x.lineTo(210,74);x.lineTo(205,79);x.lineTo(95,47);x.fill();x.strokeStyle='#FFC21A';x.lineWidth=2;x.beginPath();x.moveTo(190,79);x.lineTo(190,120);x.stroke();rr(x,182,120,16,10,2,'#FFC21A');
  x.fillStyle='#123A61';x.beginPath();x.moveTo(0,WY);x.lineTo(0,150);x.lineTo(300,150);x.lineTo(330,WY);x.fill();x.beginPath();x.moveTo(560,WY);x.lineTo(590,165);x.lineTo(900,160);x.lineTo(900,WY);x.fill();
  g=x.createLinearGradient(0,WY,0,360);g.addColorStop(0,'#1C6E97');g.addColorStop(1,'#0A2A45');x.fillStyle=g;x.fillRect(0,WY,900,164);
  x.strokeStyle='rgba(255,255,255,.08)';x.lineWidth=1;for(let k=0;k<6;k++){x.beginPath();for(let i=0;i<=900;i+=20){const yy=WY+18+k*26+Math.sin(i/60+t*1.2+k)*2;i?x.lineTo(i,yy):x.moveTo(i,yy)}x.stroke()}
  for(let i=st.length-1;i>=0;i--){const s=st[i];s.vy+=1100*dt;s.y+=s.vy*dt;if(s.y>=s.ty){rp.push({x:s.x,y:s.ty,r:0});for(let k=0;k<14;k++)sp.push({x:s.x,y:s.ty,vx:(Math.random()-.5)*160,vy:-120-Math.random()*160,l:.7});st.splice(i,1);n++;sfx('drop');setRd('r_n',n);if(n==3){Teacher.say('intro_drop');award('intro_drop',10,'تجربة البركة')}continue}
    ball(x,s.x,s.y,11,'#E2E8F0','#64748B');pill(x,'جسيم',s.x,s.y-20,C.y,'#0A1B2E',13)}
  for(let i=sp.length-1;i>=0;i--){const p=sp[i];p.vy+=600*dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.l-=dt;if(p.l<=0){sp.splice(i,1);continue}circ(x,p.x,p.y,2.4,`rgba(200,235,255,${p.l})`)}
  let boat=0;for(let i=rp.length-1;i>=0;i--){const q=rp[i];q.r+=120*dt;if(q.r>760){rp.splice(i,1);continue}
    for(const d of[0,26,52]){const R=q.r-d;if(R<=0)continue;const a=Math.max(0,1-R/680);x.strokeStyle=`rgba(180,230,255,${a})`;x.lineWidth=3;x.beginPath();x.ellipse(q.x,q.y,R,R/3.4,0,0,7);x.stroke();x.strokeStyle=`rgba(255,255,255,${a*.35})`;x.lineWidth=1;x.beginPath();x.ellipse(q.x,q.y-2,R,R/3.4,0,Math.PI,2*Math.PI);x.stroke()}
    if(q.r<150)pill(x,'موجة',q.x,q.y+q.r/3.4+30,C.c,'#0A1B2E',13);
    const dd=Math.hypot(BX-q.x,(270-q.y)*3.4),ph=dd-q.r;if(ph<0&&ph>-70)boat+=Math.sin(-ph/11)*9*(1-q.r/800)}
  setRd('r_w',rp.length);
  const by=270-boat;x.save();x.translate(BX,by);x.fillStyle='rgba(0,0,0,.25)';x.beginPath();x.ellipse(0,10,40,5,0,0,7);x.fill();x.fillStyle='#D7263D';x.beginPath();x.moveTo(-38,-8);x.lineTo(38,-8);x.lineTo(26,9);x.lineTo(-26,9);x.closePath();x.fill();x.fillStyle='#0E2A47';x.fillRect(-38,-12,76,5);x.strokeStyle='#E2E8F0';x.lineWidth=2.5;x.beginPath();x.moveTo(0,-12);x.lineTo(0,-58);x.stroke();x.fillStyle='#FFC21A';x.beginPath();x.moveTo(3,-56);x.lineTo(30,-16);x.lineTo(3,-16);x.closePath();x.fill();x.restore();
  if(boat)arrow(x,BX+52,by+4,BX+52,by-14*Math.sign(boat)+4,C.y,2);
  if(!st.length&&!rp.length)pill(x,'انقر على الماء لإسقاط حجر',450,140,'rgba(255,194,26,.95)','#0A1B2E',18)});
setRd('r_n',0);setRd('r_w',0);
const voice={};items.forEach(i=>voice[i[0]]=i[2]);
sortGame($('#ms'),voice,()=>complete('intro','intro_done'));
Teacher.say('intro_start')}

/* ================= 2 PICTURE CARDS ================= */
function pCards(m,L){const G=[['الفيزياء والنماذج',0,10],['القياس والوحدات',10,22],['الحركة والسرعة والعجلة',22,CA.length]],seen=new Set();
m.innerHTML=plate(L,'كل نقطة في الفصل معها رسمة توضحها، وبعضها متحرك. انقر على أي بطاقة والمستر هيشرحها بصوته.')+mission('cards','اقرأ 10 بطاقات على الأقل (انقر عليها) لتحصل على شارة «قارئ الصور».','<div class="res" id="cnt">0 / 10</div>')+
G.map(q=>`<div class="grp"><h2>${q[0]}</h2><span>${q[2]-q[1]} بطاقة</span></div><div class="cards">${CA.slice(q[1],q[2]).map((c,i)=>`<button class="pc" data-i="${q[1]+i}"><b>${c[0]}</b>${W(c[2])}<p>${LTX(c[1])}</p></button>`).join('')}</div>`).join('');
let fired=false;m.querySelectorAll('.pc').forEach(e=>e.onclick=()=>{const i=+e.dataset.i,c=CA[i];$$('.pc.playing').forEach(p=>p.classList.remove('playing'));e.classList.add('seen','playing');seen.add(i);sfx('click');$('#cnt').textContent=`${Math.min(seen.size,10)} / 10`;
  if(seen.size>=10&&!fired){fired=true;complete('cards',['card'+i,'cards_done'],c[0]+': '+c[1]+' '+LINES.cards_done)}else Teacher.say('card'+i,c[0]+': '+c[1])});
Teacher.say('cards_start')}

/* ================= 3 MEASUREMENT ================= */
function pMeasure(m,L){const SI=[['m','الطول','المتر'],['kg','الكتلة','الكيلوجرام'],['s','الزمن','الثانية'],['A','شدة التيار','الأمبير'],['mol','كمية المادة','المول'],['K','درجة الحرارة','الكلفن'],['cd','شدة الإضاءة','الكانديلا']];
const U={'الطول':{mm:.001,cm:.01,m:1,km:1000},'الكتلة':{mg:1e-6,g:.001,kg:1,ton:1000},'الزمن':{s:1,min:60,h:3600,day:86400}};
m.innerHTML=plate(L,'<b>القياس</b> هو مقارنة كمية مجهولة بكمية أخرى من نوعها تسمى <b>وحدة القياس</b>. لو عصا المتر اتكررت 3 مرات على طول الطاولة، يبقى طولها 3 m.')+
`<section class="panel">${panelH('ruler','تجربة: قِس طول الطاولة بالمتر وأجزائه')}<div class="screen"><canvas id="c"></canvas>${rd([['r_m','أمتار (1 m)','y'],['r_c','قطع (0.1 m)','c'],['r_s','المجموع','g']])}</div>
<div class="row" style="margin-top:12px"><button class="btn" id="m1">+ متر</button><button class="btn navy" id="m2">+ 10 سم</button><button class="btn ghost" id="mu">${ic('undo')} تراجع</button><button class="btn ghost" id="mc">مسح</button><button class="btn ghost" id="mn">${ic('dice')} طاولة جديدة</button></div>
<div class="row" style="margin-top:12px"><b>طول الطاولة =</b><input type="number" id="ml" step="0.1" style="width:120px" aria-label="طول الطاولة بالمتر"><b>m</b><button class="btn green" id="mk">${ic('check')} تحقق</button><span id="mf" aria-live="polite"></span></div></section>
<section class="panel">${panelH('swap','محوّل الوحدات')}<div class="row"><select id="q" aria-label="الكمية">${Object.keys(U).map(k=>`<option>${k}</option>`).join('')}</select><input id="v" type="number" value="4" style="width:120px" aria-label="القيمة"><select id="a" aria-label="من"></select><b>إلى</b><select id="z" aria-label="إلى"></select></div><div class="res" id="cr"></div></section>
${mission('measure','أنجز الاثنين: (1) قِس طول طاولة واحدة على الأقل بشكل صحيح. (2) اسحب رمز كل وحدة من وحدات النظام الدولي السبع إلى الكمية الخاصة بها.',`<div class="res rtl" id="mst"></div><div class="chips">${shuffle(SI.map((s,i)=>[s[0],i])).map(s=>`<span class="dchip" data-k="${s[1]}" dir="ltr">${s[0]}</span>`).join('')}</div><div class="bins">${SI.map((s,i)=>`<div class="bin" data-k="${i}"><h4>${s[1]}</h4><div class="slot"></div></div>`).join('')}</div>`)}
<div class="facts"><div><h4>المتر العياري</h4><p>قديماً: واحد على عشرة ملايين من المسافة بين القطب الشمالي وخط الاستواء. ثم: المسافة بين علامتين على ساق من سبيكة البلاتين والإيريديوم.</p></div><div><h4>الكيلوجرام العياري</h4><p>قديماً: كتلة لتر ماء عند 4 °C. ثم: أسطوانة من البلاتين والإيريديوم محفوظة في المكتب الدولي للأوزان والمقاييس.</p></div><div><h4>الثانية</h4><p>قديماً: <bdi dir="ltr">1/86400</bdi> من اليوم الشمسي المتوسط. حديثاً: ذبذبات الأشعة المنبعثة من ذرات السيزيوم.</p></div><div><h4>أنظمة الوحدات</h4><p>جاوس: سم – جم – ث. المتري والدولي: م – كجم – ث. وحدتان إضافيتان: الراديان والأستراديان.</p></div></div>`;
$('#mst').dataset.x='';let okA=false,okB=false;const ms=()=>{$('#mst').textContent=`${okA?'✓':'○'} قياس الطاولة     ${okB?'✓':'○'} وحدات النظام الدولي`;if(okA&&okB)complete('measure','measure_done')};ms();
const x=CV('#c',900,280),PX=180,X0=60;let Ln,sticks;
const newT=()=>{Ln=rnd(15,44)/10;sticks=[];$('#ml').value='';$('#mf').innerHTML='';draw()};
const draw=()=>{bgScreen(x);const tw=Ln*PX;
  // table: wooden top with grain + legs
  let g=x.createLinearGradient(0,62,0,90);g.addColorStop(0,'#C98A4B');g.addColorStop(1,'#8A5527');x.fillStyle=g;rr(x,X0,62,tw,24,6,g);x.strokeStyle='rgba(60,30,10,.35)';x.lineWidth=1;for(let k=0;k<5;k++){x.beginPath();x.moveTo(X0+8,68+k*4);x.bezierCurveTo(X0+tw*.3,64+k*4+3,X0+tw*.6,72+k*4-3,X0+tw-8,68+k*4);x.stroke()}
  rr(x,X0+12,86,14,74,3,'#6B3F1C');rr(x,X0+tw-26,86,14,74,3,'#6B3F1C');
  x.strokeStyle=C.r;x.setLineDash([7,6]);x.lineWidth=2;[X0,X0+tw].forEach(v=>{x.beginPath();x.moveTo(v,40);x.lineTo(v,250);x.stroke()});x.setLineDash([]);TX(x,'الطاولة',X0+tw/2,50,C.txt,15);
  let p=X0,nm=0,nc=0;sticks.forEach(s=>{const w=s*PX;if(s==1){rr(x,p,176,w-2,30,4,nm%2?'#FFD65C':'#FFC21A');x.fillStyle='#0A1B2E';for(let k=1;k<10;k++)x.fillRect(p+k*w/10,176,1.5,k==5?13:8);TX(x,'1 m',p+w/2,198,'#0A1B2E',14,'center','Alexandria');nm++}else{rr(x,p,212,w-2,24,3,nc%2?'#5CD3F5':'#2BB3D9');TX(x,'0.1',p+w/2,229,'#0A1B2E',11,'center','Alexandria');nc++}p+=w});
  // ruler scale at the bottom
  x.strokeStyle=C.mut;x.lineWidth=1;for(let i=0;i<=45;i++){const xx=X0+i*PX/10;x.beginPath();x.moveTo(xx,252);x.lineTo(xx,i%10?258:266);x.stroke();if(i%10==0)TX(x,(i/10)+' m',xx,278,C.mut,11,'center','Alexandria')}
  setRd('r_m',nm);setRd('r_c',nc);setRd('r_s',f(nm+nc*.1,1)+' m')};
const add=s=>{if(sticks.reduce((a,b)=>a+b,0)+s>4.55){Teacher.say('measure_over');return}sticks.push(s);sfx('click');draw()};
$('#m1').onclick=()=>add(1);$('#m2').onclick=()=>add(.1);$('#mu').onclick=()=>{sticks.pop();draw()};$('#mc').onclick=()=>{sticks=[];draw()};$('#mn').onclick=newT;
$('#mk').onclick=()=>{const v=+$('#ml').value;if($('#ml').value===''){Teacher.say('measure_empty');return}if(Math.abs(v-Ln)<.001){sfx('ok');$('#mf').innerHTML=`<b class="ok">✓ صحيح: L = ${Ln} m</b>`;award('meas_table',10,'قياس صحيح');Teacher.say('measure_ok');if(!okA){okA=true;ms()}}else{sfx('no');$('#mf').innerHTML='<b class="no">✗ حاول مرة أخرى</b>';Teacher.say('measure_no',LINES.measure_no+' الطول = (عدد الأمتار) + 0.1 × (عدد القطع الصغيرة).')}};
$('#ml').onkeydown=e=>{if(e.key=='Enter')$('#mk').click()};
const fmtN=v=>(Math.abs(v)>=1e7||(Math.abs(v)<1e-3&&v!=0))?v.toExponential(3):String(+v.toPrecision(8));
const fill=()=>{const u=Object.keys(U[$('#q').value]);['a','z'].forEach(i=>$('#'+i).innerHTML=u.map(k=>`<option>${k}</option>`).join(''));$('#a').selectedIndex=u.length>2?2:0;$('#z').selectedIndex=1;calc()};
const calc=()=>{const o=U[$('#q').value],v=+$('#v').value;$('#cr').textContent=`${v} ${$('#a').value} = ${fmtN(v*o[$('#a').value]/o[$('#z').value])} ${$('#z').value}`};
$('#q').onchange=fill;['v','a','z'].forEach(i=>$('#'+i).oninput=calc);$('#a').onchange=calc;$('#z').onchange=calc;fill();
const voice={};SI.forEach(s=>voice[s[0]]='si_'+s[0]);$('#ms').dataset.wrong='si_wrong';
sortGame($('#ms'),voice,()=>{okB=true;award('meas_si',10,'الوحدات السبع');ms()});
newT();Teacher.say('measure_start')}

/* ================= 4 DISTANCE & DISPLACEMENT ================= */
function pDisp(m,L){const CH=[{t:'ارسم مساراً <b>مسافته 7 m</b> و<b>إزاحته 5 m</b> (فكّر في مثلث 3 – 4 – 5).',ok:(d,D)=>Math.abs(d-7)<.01&&Math.abs(D-5)<.01},{t:'ارجع لنقطة البداية بعد قطع مسافة <b>8 m على الأقل</b>: الإزاحة هتبقى صفر.',ok:(d,D)=>d>7.99&&D<.01},{t:'اصنع <b>إزاحة 10 m</b> بمسار <b>مسافته أكبر من 14 m</b>.',ok:(d,D)=>Math.abs(D-10)<.01&&d>14.01}];
m.innerHTML=plate(L,'<b>المسافة</b> كمية قياسية: طول المسار الفعلي. <b>الإزاحة</b> كمية متجهة: الخط المستقيم من نقطة البداية إلى نقطة النهاية، مقداراً واتجاهاً.')+
`<section class="panel">${panelH('compass','انقر على نقاط الشبكة لترسم مسارك (كل مربع = 1 m)')}<div class="screen"><canvas id="c"></canvas>${rd([['r_d','المسافة d','y'],['r_D','الإزاحة Δd','c'],['r_v','السرعة القياسية d/t','y'],['r_V','السرعة المتجهة Δd/t','c']])}</div>
<div class="row" style="margin-top:12px"><button class="btn ghost" id="du">${ic('undo')} تراجع</button><button class="btn ghost" id="dc">مسح</button><button class="btn navy" id="de">${ic('book')} مثال الكتاب: 3 m شرقاً ثم 4 m شمالاً</button></div><div style="max-width:420px;margin-top:10px">${sl('dt','زمن الحركة t',1,30,5,1,'s')}</div><div class="res rtl" id="r2"></div></section>
${mission('disp','حل التحديات الثلاثة بالترتيب:','<div id="chs"></div>')}
<div class="facts"><div><h4>السرعة القياسية</h4><p><bdi dir="ltr">v = d / t</bdi> — المسافة ÷ الزمن.</p></div><div><h4>السرعة المتجهة</h4><p><bdi dir="ltr">v = Δd / t</bdi> — الإزاحة ÷ الزمن، ولها اتجاه.</p></div><div><h4>مسار مغلق</h4><p>لو رجع الجسم لنقطة البداية: الإزاحة = صفر، والسرعة المتجهة المتوسطة = صفر، مع أن المسافة ليست صفراً.</p></div></div>`;
const x=CV('#c',900,460),G=40,OX=30,OY=30,S0=[3,8];let pts=[S0.slice()],ci=0,busy=false,demo=false,t0=0;
const dirN=(dx,dy)=>{if(!dx&&!dy)return'—';const a=(Math.atan2(dy,dx)*180/Math.PI+360)%360;return['الشرق','الشمال الشرقي','الشمال','الشمال الغربي','الغرب','الجنوب الغربي','الجنوب','الجنوب الشرقي'][Math.round(a/45)%8]};
const Pp=p=>[OX+p[0]*G,OY+p[1]*G];
const chs=()=>{$('#chs').innerHTML=CH.map((c,i)=>`<div class="note" style="${i<ci?'border-inline-start-color:var(--green)':i==ci?'':'opacity:.5'}">${i<ci?'✓':i==ci?'◀':'🔒'} تحدي ${i+1}: ${c.t}</div>`).join('')};
const calc=()=>{let d=0;for(let i=1;i<pts.length;i++)d+=Math.hypot(pts[i][0]-pts[i-1][0],pts[i][1]-pts[i-1][1]);const e=pts[pts.length-1],dx=e[0]-S0[0],dy=S0[1]-e[1],D=Math.hypot(dx,dy);return{d,D,dx,dy}};
const draw=(tt=0)=>{const{d,D,dx,dy}=calc(),t=V('dt');bgScreen(x,G/2,G);x.fillStyle=C.bg;x.fillRect(0,0,900,OY-8);x.fillRect(0,OY+10*G+8,900,40);
  for(let i=0;i<=21;i++)for(let j=0;j<=10;j++)circ(x,OX+i*G,OY+j*G,2.2,'rgba(160,190,220,.5)');
  // compass rose
  x.save();x.translate(852,72);ring(x,0,0,30,'rgba(255,255,255,.2)',2);arrow(x,0,18,0,-26,C.y,3);TX(x,'N',0,-34,C.y,14,'center','Alexandria');TX(x,'شمال',0,48,C.mut,12);x.restore();
  for(let i=1;i<pts.length;i++){const[a,b]=Pp(pts[i-1]),[c,e]=Pp(pts[i]);glow(x,'rgba(255,194,26,.6)',10,()=>arrow(x,a,b,c,e,C.y,4))}
  const[sx,sy]=Pp(S0),[ex,ey]=Pp(pts[pts.length-1]);if(D>0){glow(x,'rgba(92,211,245,.6)',8,()=>arrow(x,sx,sy,ex,ey,C.c,4,[12,8]));pill(x,`Δd = ${f(D)} m`,(sx+ex)/2,(sy+ey)/2-12,C.c,'#0A1B2E',14)}
  const pulse=4+Math.sin(tt*5)*2;circ(x,sx,sy,10,C.g);ring(x,sx,sy,14+pulse,'rgba(61,220,151,.4)',2);TX(x,'بداية',sx,sy+32,C.g,13);if(pts.length>1){circ(x,ex,ey,10,C.c);TX(x,'نهاية',ex,ey-18,C.c,13)}
  pill(x,`d = ${f(d)} m`,70,OY+10*G+32,C.y,'#0A1B2E',14);
  setRd('r_d',f(d)+' m');setRd('r_D',f(D)+' m');setRd('r_v',f(d/t)+' m/s');setRd('r_V',f(D/t)+' m/s');$('#r2').textContent=D>0?`اتجاه الإزاحة: نحو ${dirN(dx,dy)}`:'الإزاحة = صفر';};
const check=()=>{if(demo)return;const{d,D}=calc();if(ci<CH.length&&CH[ci].ok(d,D)){award('disp_c'+ci,15,'تحدي '+(ci+1));sfx('ok');ci++;chs();if(ci==CH.length)complete('disp','disp_done');else Teacher.say(['disp_ok','disp_ch'+ci],LINES.disp_ok+' '+LINES['disp_ch'+ci]);busy=true;setTimeout(()=>{if(!document.body.contains(x.c))return;pts=[pts[pts.length-1].slice()];S0[0]=pts[0][0];S0[1]=pts[0][1];busy=false},1600)}};
x.c.onpointerdown=e=>{actx();if(busy)return;if(demo){demo=false;pts=[S0.slice()]}const[px,py]=ptr(x,e),i=Math.max(0,Math.min(21,Math.round((px-OX)/G))),j=Math.max(0,Math.min(10,Math.round((py-OY)/G))),l=pts[pts.length-1];if(l[0]==i&&l[1]==j)return;pts.push([i,j]);sfx('click');check()};
$('#du').onclick=()=>{if(busy)return;demo=false;if(pts.length>1)pts.pop()};$('#dc').onclick=()=>{if(busy)return;demo=false;pts=[S0.slice()]};
$('#de').onclick=()=>{if(busy)return;demo=true;pts=[S0.slice(),[S0[0]+3,S0[1]],[S0[0]+3,S0[1]-4]];if(pts[2][0]>21||pts[2][1]<0){S0[0]=3;S0[1]=8;pts=[S0.slice(),[6,8],[6,4]]}Teacher.say('disp_example')};
onSl(['dt'],()=>{});chs();loop(t=>draw(t));Teacher.say(['disp_start','disp_ch0'],LINES.disp_start+' '+LINES.disp_ch0)}

/* ================= 5 ACCELERATION (layout from the «معمل العجلة» design board) ================= */
function pAccel(m,L){
m.innerHTML=plate(L,'<b>العجلة</b> هي معدل تغير السرعة: <bdi dir="ltr">a = (Vf − Vo) / t</bdi>. موجبة = حركة تزايدية، سالبة = تناقصية، وصفر = سرعة منتظمة.')+
`<div class="labgrid"><section class="panel ctl" aria-label="لوحة التحكم"><h2>لوحة التحكم</h2>${sl('v0','السرعة الابتدائية Vo',0,30,5,1,'m/s')}${sl('ac','العجلة a',-5,5,2,.5,'m/s²')}${sl('tt','زمن الحركة t',1,12,6,1,'s')}
<div class="row"><button class="btn green big3 grow" id="go">${ic('play')} شغّل السيارة</button><button class="btn ghost sq" id="ps" aria-label="إيقاف مؤقت">${ic('pause')}</button><button class="btn ghost sq" id="rs" aria-label="إعادة">${ic('reset')}</button></div>
<div class="spd"><b>سرعة العرض</b><div class="seg" id="spd"><button data-s="0.5">×0.5</button><button class="on" data-s="1">×1</button><button data-s="2">×2</button></div></div>
<div class="formula">Vf = Vo + a t</div><div class="formula">d = Vo t + ½ a t²</div><div class="formula">Vf² = Vo² + 2 a d</div></section>
<div class="labcol"><section class="scene3" aria-label="مشهد التجربة"><canvas id="c"></canvas><div class="gauges">
<div class="gauge"><svg viewBox="0 0 58 36" aria-hidden="true"><path d="M5 32 A24 24 0 0 1 53 32" class="gt"/><path id="ga_v" class="gv" style="stroke:#2ED3A0"/><circle cx="29" cy="32" r="4"/></svg><div><small>السرعة v</small><b id="r_v">—</b></div></div>
<div class="gauge"><svg viewBox="0 0 58 36" aria-hidden="true"><path d="M5 32 A24 24 0 0 1 53 32" class="gt"/><path id="ga_d" class="gv" style="stroke:#FFC727"/><circle cx="29" cy="32" r="4"/></svg><div><small>المسافة d</small><b id="r_d">—</b></div></div>
<div class="gauge"><svg viewBox="0 0 58 36" aria-hidden="true"><path d="M5 32 A24 24 0 0 1 53 32" class="gt"/><path id="ga_a" class="gv" style="stroke:#FF6B5A"/><circle cx="29" cy="32" r="4"/></svg><div><small>العجلة a</small><b id="r_a">—</b></div></div>
<div class="gauge"><div><small>الزمن t</small><b id="r_t">—</b></div></div></div></section>
<div class="graphs"><section class="panel gcard"><h3>المسافة – الزمن</h3><canvas id="g1"></canvas></section><section class="panel gcard"><h3>السرعة – الزمن</h3><canvas id="g2"></canvas></section></div>
<div class="note" id="r2"></div></div></div>
<section class="panel">${panelH('table','جدول القراءات (يُسجَّل كل ثانية)')}<div class="tw"><table class="t"><thead><tr><th>t (s)</th><th>v (m/s)</th><th>d (m)</th><th>Δv كل ثانية</th></tr></thead><tbody id="tb"></tbody></table></div></section>
${mission('accel','<b>تنبأ ثم تحقق</b> زي العلماء: اضغط «سؤال جديد»، احسب Vf و d بالقوانين في كراستك، ثم اضغط «تحقق وشغّل». أجب صح في سؤالين.',`<div class="res" id="gd">0 / 2</div><button class="btn" id="nq">${ic('dice')} سؤال جديد</button><div id="qq" class="note" style="display:none"></div><div class="row" id="qa" style="display:none"><bdi dir="ltr">Vf =</bdi><input type="number" id="pv" step="any" style="width:110px" aria-label="Vf"><bdi dir="ltr">m/s</bdi>&nbsp;&nbsp;<bdi dir="ltr">d =</bdi><input type="number" id="pd" step="any" style="width:110px" aria-label="d"><bdi dir="ltr">m</bdi><button class="btn green" id="pc">${ic('check')} تحقق وشغّل</button></div><div id="pf"></div>`)}`;
const x=CV('#c',960,380),g1=CV('#g1',440,220),g2=CV('#g2',440,220);let sim,spd=1,Q=null,good=0,hide=false;
const arc=(id,p)=>{p=Math.max(0,Math.min(1,p));const a=Math.PI*(1-p),X=29+24*Math.cos(a),Y=32-24*Math.sin(a);const e=$('#'+id);if(e)e.setAttribute('d',p<.01?'M5 32 L5 32':`M5 32 A24 24 0 0 1 ${X.toFixed(1)} ${Y.toFixed(1)}`)};
const BLD=[[30,120,70,120],[110,150,50,90],[170,170,40,70],[760,100,80,140],[850,140,60,100],[620,160,46,80]];
const mk=()=>{const v0=V('v0'),a=V('ac'),T=V('tt'),ts=(a<0&&v0>0)?-v0/a:Infinity,M=s=>{const q=Math.min(s,ts);return{v:v0+a*q,d:v0*q+.5*a*q*q}};let lo=0,hi=1,vlo=0,vhi=1;for(let i=0;i<=120;i++){const p=M(T*i/120);lo=Math.min(lo,p.d);hi=Math.max(hi,p.d);vlo=Math.min(vlo,p.v);vhi=Math.max(vhi,p.v)}
  sim={t:0,run:false,v0,a,T,ts,M,lo,hi,vlo,vhi,rec:-1};$('#tb').innerHTML='';const e=M(T);$('#r2').innerHTML=hide?'النتيجة مخفية حتى تتحقق من تنبؤك.':LTX(`النتيجة المتوقعة: Vf = ${f(e.v)} m/s ، d = ${f(e.d)} m`)+(ts<=T?LTX(` — السيارة تتوقف عند t = ${f(ts)} s لأن سرعتها وصلت صفر.`):'')};
const addRow=i=>{const q=sim.M(i),pv=i?sim.M(i-1).v:null;$('#tb').insertAdjacentHTML('beforeend',`<tr class="new"><td>${i}</td><td>${f(q.v)}</td><td>${f(q.d)}</td><td>${pv==null?'—':f(q.v-pv)}</td></tr>`);const w=$('#tb').closest('.tw');w.scrollTop=w.scrollHeight;sfx('tick')};
// light graph card, like the design board
const graph=(y,fn,lo,hi,col,edge,lab)=>{const s=sim,gx=46,gy=192,gw=370,gh=160,W=y.W,H=y.H;y.clearRect(0,0,W,H);y.fillStyle=document.body.classList.contains('dark')?'#17214D':'#FFFFFF';y.fillRect(0,0,W,H);
  y.lineWidth=2;y.strokeStyle=document.body.classList.contains('dark')?'#2A3870':'#E3E8F8';for(let i=1;i<=4;i++){const yy=gy-gh*i/4;y.beginPath();y.moveTo(gx,yy);y.lineTo(gx+gw,yy);y.stroke();TX(y,String(f(lo+(hi-lo)*i/4,1)),gx-6,yy+4,'#5B6690',11,'right','Alexandria')}
  const ink=document.body.classList.contains('dark')?'#EEF1FF':'#14204A';y.strokeStyle=ink;y.lineWidth=3;y.beginPath();y.moveTo(gx,gy-gh-10);y.lineTo(gx,gy);y.lineTo(gx+gw+10,gy);y.stroke();
  for(let i=0;i<=s.T;i++)TX(y,String(i),gx+gw*i/s.T,gy+15,'#5B6690',11,'center','Alexandria');TX(y,'t (s)',gx+gw,gy+30,'#5B6690',12,'center','Alexandria');TX(y,lab,gx+6,14,'#5B6690',12,'left','Alexandria');
  if(lo<0){const z=gy-(0-lo)/(hi-lo)*gh;y.strokeStyle='#C9D2FF';y.beginPath();y.moveTo(gx,z);y.lineTo(gx+gw,z);y.stroke()}
  const tt=Math.min(s.t,s.T),n=Math.max(2,Math.ceil(90*tt/s.T)),Y=v=>gy-(v-lo)/(hi-lo)*gh,base=Y(Math.max(lo,Math.min(hi,0)));
  y.beginPath();for(let i=0;i<=n;i++){const q=tt*i/n,xx=gx+gw*q/s.T;i?y.lineTo(xx,Y(fn(q))):y.moveTo(xx,Y(fn(q)))}y.lineTo(gx+gw*tt/s.T,base);y.lineTo(gx,base);y.closePath();y.fillStyle=col+'40';y.fill();
  y.strokeStyle=edge;y.lineWidth=7;y.lineCap='round';y.lineJoin='round';y.beginPath();for(let i=0;i<=n;i++){const q=tt*i/n,xx=gx+gw*q/s.T;i?y.lineTo(xx,Y(fn(q))):y.moveTo(xx,Y(fn(q)))}y.stroke();
  const ex=gx+gw*tt/s.T,ey=Y(fn(tt));circ(y,ex,ey,9,col);ring(y,ex,ey,9,ink,3)};
const draw=()=>{const s=sim,p=s.M(s.t),X=d=>40+(d-s.lo)/(s.hi-s.lo)*650;
  let g=x.createLinearGradient(0,0,0,240);g.addColorStop(0,'#1C2C66');g.addColorStop(1,'#3D5AFE');x.fillStyle=g;x.fillRect(0,0,960,240);
  BLD.forEach(b=>{rr(x,b[0],b[1],b[2],b[3],3,'#24356F');x.fillStyle='rgba(255,199,39,.7)';for(let yy=b[1]+14;yy<b[1]+b[3]-14;yy+=30)for(let xx=b[0]+12;xx<b[0]+b[2]-12;xx+=26)x.fillRect(xx,yy,11,11)});
  g=x.createLinearGradient(0,240,0,380);g.addColorStop(0,'#2A3770');g.addColorStop(1,'#0E1638');x.fillStyle=g;x.fillRect(0,240,960,140);
  x.fillStyle='#FFC727';x.fillRect(0,237,960,6);x.strokeStyle='rgba(255,255,255,.6)';x.lineWidth=5;x.setLineDash([40,30]);x.beginPath();x.moveTo(0,300);x.lineTo(960,300);x.stroke();x.setLineDash([]);
  for(let i=0;i<=Math.floor(Math.min(s.t,s.T)+1e-9);i++){const q=s.M(i);circ(x,X(q.d)+132,350,7,'#FFC727');TX(x,i+'s',X(q.d)+132,374,'#B9C4F0',13,'center','Alexandria')}
  const cx=X(p.d);if(s.run&&Math.abs(p.v)>2)for(let k=0;k<3;k++){x.strokeStyle='rgba(255,255,255,.55)';x.lineWidth=6;x.lineCap='round';const ln=Math.min(50,Math.abs(p.v)*2)+k*6,yy=258+k*20,bx=p.v>0?cx+10:cx+230;x.beginPath();x.moveTo(bx,yy);x.lineTo(bx-Math.sign(p.v)*ln,yy);x.stroke()}
  car(x,cx+14,302,214,'#FF6B5A');
  const ax=cx+132;arrow(x,ax,186,ax+p.v*6,186,'#2ED3A0',9);if(Math.abs(p.v)>.5)TX(x,'v',ax+p.v*6+(p.v>0?20:-20),194,'#2ED3A0',22,'center','Alexandria');
  const ae=s.t<s.ts?s.a:0;arrow(x,ax,156,ax+ae*18,156,'#FF6B5A',7);if(ae)TX(x,'a',ax+ae*18+(ae>0?20:-20),164,'#FF6B5A',22,'center','Alexandria');
  graph(g1,q=>s.M(q).d,s.lo,s.hi,'#FFC727','#E8A800','d (m)');graph(g2,q=>s.M(q).v,s.vlo,s.vhi,'#2ED3A0','#169E77','v (m/s)');
  setRd('r_t',f(s.t)+' s');setRd('r_v',f(p.v)+' m/s');setRd('r_d',f(p.d)+' m');setRd('r_a',(s.t<s.ts?s.a:0)+' m/s²');
  arc('ga_v',Math.abs(p.v)/Math.max(1,Math.abs(s.vhi),Math.abs(s.vlo)));arc('ga_d',(p.d-s.lo)/(s.hi-s.lo||1));arc('ga_a',Math.abs(s.t<s.ts?s.a:0)/5)};
const onEnd=()=>{const e=sim.M(sim.T);award('accel_run',10,'أول تشغيل');if(!Q){const k=sim.a>0?'accel_pos':sim.a<0?'accel_neg':'accel_zero';Teacher.say(k,`وصلنا: Vf = ${f(e.v)} m/s و d = ${f(e.d)} m. `+LINES[k])}Q=null};
loop((T_,dt)=>{if(sim.run){sim.t=Math.min(sim.T,sim.t+dt*spd);while(sim.rec<Math.floor(sim.t+1e-9)){sim.rec++;addRow(sim.rec)}if(sim.t>=sim.T){sim.run=false;onEnd()}}draw()});
$('#go').onclick=()=>{actx();if(sim.t>=sim.T||sim.t==0)mk();sim.run=true;sfx('click')};$('#ps').onclick=()=>{if(sim.t<sim.T)sim.run=!sim.run};$('#rs').onclick=()=>{mk()};
$$('#spd button').forEach(b=>b.onclick=()=>{spd=+b.dataset.s;$$('#spd button').forEach(o=>o.classList.toggle('on',o==b))});
onSl(['v0','ac','tt'],()=>{Q=null;hide=false;mk()});
$('#nq').onclick=()=>{let v0,a,T;do{v0=rnd(0,20);a=[-3,-2,-1,1,2,3,4][rnd(0,6)];T=rnd(2,8)}while(v0+a*T<0);Q={v0,a,T,vf:v0+a*T,d:v0*T+.5*a*T*T};hide=true;setSl('v0',v0);setSl('ac',a);setSl('tt',T);mk();$('#qq').style.display='';$('#qa').style.display='';$('#qq').innerHTML=LTX(`سيارة سرعتها الابتدائية Vo = ${v0} m/s وعجلتها a = ${a} m/s² لمدة t = ${T} s. احسب السرعة النهائية Vf والمسافة المقطوعة d.`);$('#pv').value='';$('#pd').value='';$('#pf').innerHTML='';Teacher.say('accel_q',LINES.accel_q+' Vf = Vo + a t ، d = Vo t + ½ a t²')};
$('#pc').onclick=()=>{if(!Q){Teacher.say('accel_needq');return}const okv=$('#pv').value!==''&&Math.abs(+$('#pv').value-Q.vf)<=.05,okd=$('#pd').value!==''&&Math.abs(+$('#pd').value-Q.d)<=.1;hide=false;setSl('v0',Q.v0);setSl('ac',Q.a);setSl('tt',Q.T);mk();sim.run=true;
  $('#pf').innerHTML=`<div class="res"><span class="${okv?'ok':'no'}">Vf ${okv?'✓':'✗'} = ${f(Q.vf)} m/s</span> &nbsp;|&nbsp; <span class="${okd?'ok':'no'}">d ${okd?'✓':'✗'} = ${f(Q.d)} m</span></div>`;
  if(okv&&okd){good++;$('#gd').textContent=`${Math.min(good,2)} / 2`;sfx('ok');Teacher.say('accel_ok');if(good==2)setTimeout(()=>complete('accel','accel_done'),1800)}else{sfx('no');Teacher.say('accel_no',`راجع: Vf = ${Q.v0} + (${Q.a}) × ${Q.T} = ${f(Q.vf)} m/s ، و d = ${Q.v0} × ${Q.T} + ½ × (${Q.a}) × ${Q.T}² = ${f(Q.d)} m. جرّب سؤال جديد.`)}Q=null};
mk();Teacher.say('accel_start')}

/* ================= 6 FREE FALL ================= */
function pFall(m,L){const PL=[['الأرض',9.8,['#0E2A47','#5BA8D8'],'#2E5E3A',1,'fall_earth'],['القمر',1.62,['#020814','#0A1626'],'#8A94A3',0,'fall_moon'],['المريخ',3.71,['#5A1E0E','#E39A63'],'#9A4A23',1,'fall_mars'],['المشتري (تخيّلي)',24.8,['#5A3A16','#E8C27A'],'#8A5A2A',1,'fall_jup']];
m.innerHTML=plate(L,'في غياب مقاومة الهواء تسقط كل الأجسام بنفس العجلة (<bdi dir="ltr">g = 9.8 m/s²</bdi> على الأرض) مهما اختلفت كتلتها. عند القذف لأعلى تقل السرعة حتى تصبح صفراً عند أقصى ارتفاع، ثم يعود الجسم للسقوط.')+
`<div class="two"><section class="panel">${panelH('fall','إعداد التجربة')}<b>مكان التجربة</b><div class="seg" id="pl" style="margin:6px 0 14px">${PL.map((p,i)=>`<button data-i="${i}" class="${i?'':'on'}">${p[0]}</button>`).join('')}</div>${sl('h','الارتفاع h',5,100,40,1,'m')}${sl('u','سرعة القذف لأعلى Vo',0,25,0,1,'m/s')}<label class="chk"><input type="checkbox" id="air"> مقاومة الهواء</label><label class="chk"><input type="checkbox" id="fe" checked> ريشة بجانب الكرة للمقارنة</label>
<div class="big" id="sw" aria-live="off">0.00 s</div><div class="row"><button class="btn green" id="st">${ic('play')} أسقط وابدأ الساعة</button><button class="btn" id="sp" disabled>أوقف الساعة (Space)</button><button class="btn ghost" id="rs" aria-label="إعادة">${ic('reset')}</button></div><p class="mut" style="font-size:14px;margin-top:10px">أوقف الساعة بنفسك لحظة ارتطام الكرة بالأرض، زي العالِم التجريبي في المعمل.</p></section>
<section><div class="screen"><canvas id="c"></canvas>${rd([['r_t','الزمن t',''],['r_v','السرعة v','g'],['r_h','الارتفاع h','y'],['r_H','أقصى ارتفاع','c']])}</div></section></div>
<section class="panel">${panelH('table','جدول المحاولات: العالِم التجريبي مقابل النموذج الرياضي')}<div class="tw"><table class="t"><thead><tr><th>#</th><th>المكان</th><th>h (m)</th><th>Vo (m/s)</th><th>t مقاس</th><th>t نظري</th><th>الخطأ</th><th>g من قياسك</th></tr></thead><tbody id="tb"></tbody></table></div><div class="note">الزمن النظري: <bdi dir="ltr">t = (Vo + √(Vo² + 2 g h)) / g</bdi> — و g من قياسك: <bdi dir="ltr">g = 2 (h + Vo t) / t²</bdi></div></section>
${mission('fall','سجّل 3 محاولات بالساعة اليدوية نسبة خطئها أقل من 10% (بدون مقاومة الهواء). زمن رد فعلك حوالي 0.2 s، فكلما زاد الارتفاع قلّت نسبة الخطأ.','<div class="res" id="gd">0 / 3</div>')}`;
const x=CV('#c',900,540),GY=500,TOP=50,BX=420,FX=520,STARS=Array.from({length:90},()=>[Math.random()*900,Math.random()*480,Math.random()*1.5+.3]);let pi=0,sim,good=0,trial=0,shake=0,dust=[];
const reset=()=>{const pl=PL[pi],h=V('h'),u=V('u'),g=pl[1],air=$('#air').checked&&!!pl[4];sim={h,u,g,air,H:h+u*u/(2*g),t:0,run:false,watch:false,meas:null,b:{y:h,v:u,land:null},fe:{y:h,v:u,land:null},tTh:(u+Math.sqrt(u*u+2*g*h))/g,trail:[]};$('#sw').textContent='0.00 s';$('#sp').disabled=true;$('#st').disabled=false};
const step=(o,c,dt)=>{if(o.land!==null)return;const n=8,hh=dt/n;for(let i=0;i<n;i++){o.v+=(-sim.g-c*o.v*Math.abs(o.v))*hh;o.y+=o.v*hh;if(o.y<=0){o.y=0;o.land=sim.t;break}}};
const stopW=()=>{const s=sim;if(!s.watch)return;s.watch=false;s.meas=s.t;$('#sp').disabled=true;sfx('tick');trial++;const err=Math.abs(s.meas-s.tTh)/s.tTh*100,gm=2*(s.h+s.u*s.meas)/(s.meas*s.meas);
  $('#tb').insertAdjacentHTML('afterbegin',`<tr class="new"><td>${trial}</td><td>${PL[pi][0]}${s.air?' + هواء':''}</td><td>${s.h}</td><td>${s.u}</td><td>${f(s.meas)}</td><td>${f(s.tTh)}</td><td class="${err<10?'ok':'no'}"><b>${f(err,1)}%</b></td><td>${f(gm)}</td></tr>`);
  if(err<10&&!s.air){good++;$('#gd').textContent=`${Math.min(good,3)} / 3`;Teacher.say('fall_good',`${err<5?'دقة عالية جداً':'قياس كويس'}: نسبة الخطأ ${f(err,1)}% وقيمة g من قياسك = ${f(gm)} m/s² (القيمة الحقيقية ${s.g}).`);if(good==3)setTimeout(()=>complete('fall','fall_done'),1400)}
  else if(s.air)Teacher.say('fall_airerr');else Teacher.say(s.meas<s.tTh?'fall_early':'fall_late',`نسبة الخطأ ${f(err,1)}%. `+LINES[s.meas<s.tTh?'fall_early':'fall_late'])};
const start=()=>{actx();reset();sim.run=true;sim.watch=true;$('#st').disabled=true;$('#sp').disabled=false;sfx('click')};
const nice=H=>H<=15?2:H<=40?5:H<=80?10:20;
loop((T_,dt)=>{const s=sim,pl=PL[pi];if(s.run){s.t+=dt;if(s.b.land===null){if(s.air)step(s.b,.0015,dt);else{s.b.y=s.h+s.u*s.t-.5*s.g*s.t*s.t;s.b.v=s.u-s.g*s.t;if(s.b.y<=0){s.b.y=0;s.b.land=s.tTh}}if(s.b.land!==null){sfx('drop');shake=8;for(let k=0;k<22;k++)dust.push({x:BX,y:GY,vx:(Math.random()-.5)*220,vy:-Math.random()*160,l:.9})}}
  step(s.fe,s.air?s.g/1.44:0,dt);if(s.watch&&s.b.land!==null&&s.t>s.b.land+2.5)stopW();if(!s.watch&&s.b.land!==null&&(s.fe.land!==null||!$('#fe').checked)){s.run=false;$('#st').disabled=false}
  $('#sw').textContent=(s.watch?s.t:(s.meas||0)).toFixed(2)+' s'}
  const Hm=Math.max(s.H,s.h,1),Y=y=>GY-(y/Hm)*(GY-TOP);x.save();if(shake>0){x.translate((Math.random()-.5)*shake,(Math.random()-.5)*shake);shake*=.85;if(shake<.4)shake=0}
  let g=x.createLinearGradient(0,0,0,GY);g.addColorStop(0,pl[2][0]);g.addColorStop(1,pl[2][1]);x.fillStyle=g;x.fillRect(-10,-10,920,560);if(pi==1){STARS.forEach(q=>circ(x,q[0],q[1],q[2],'rgba(255,255,255,.85)'));circ(x,780,90,26,'#5BA8D8');circ(x,772,84,9,'#2E5E3A')}
  x.fillStyle=pl[3];x.fillRect(-10,GY,920,50);x.fillStyle='rgba(0,0,0,.18)';for(let i=0;i<900;i+=14)x.fillRect(i,GY+6+(i*7)%14,6,3);
  // tower: steel shipyard structure
  const ty=Y(s.h);x.fillStyle='#1A3550';x.fillRect(250,ty,110,GY-ty);x.strokeStyle='rgba(255,194,26,.5)';x.lineWidth=2;for(let yy=ty;yy<GY-10;yy+=36){x.beginPath();x.moveTo(250,yy);x.lineTo(360,yy+36);x.moveTo(360,yy);x.lineTo(250,yy+36);x.stroke()}x.strokeStyle='#0A1B2E';x.lineWidth=4;x.strokeRect(250,ty,110,GY-ty);
  rr(x,250,ty-8,BX-232,10,3,'#FFC21A');x.fillStyle='#0A1B2E';for(let k=0;k<(BX-232)/14;k++)x.fillRect(254+k*14,ty-8,7,10);
  const stp=nice(Hm);x.strokeStyle='rgba(255,255,255,.75)';x.lineWidth=2;x.beginPath();x.moveTo(130,Y(0));x.lineTo(130,Y(Hm));x.stroke();for(let v=0;v<=Hm+1e-9;v+=stp){x.beginPath();x.moveTo(124,Y(v));x.lineTo(136,Y(v));x.stroke();TX(x,v+' m',118,Y(v)+5,'#fff',12,'right','Alexandria')}
  if(!s.air&&s.t>0){const tt=s.b.land!==null?s.b.land:s.t;for(let q=0;q<=tt;q+=.2){const yy=s.h+s.u*q-.5*s.g*q*q;circ(x,BX-44,Y(Math.max(0,yy))-14,5,'rgba(255,194,26,.45)')}}
  const by=Y(s.b.y)-14;glow(x,'rgba(0,0,0,.5)',10,()=>ball(x,BX,by,14,'#C8D2DC','#3A4A5A'));pill(x,'كرة حديد',BX,by-24,'rgba(10,27,46,.8)','#fff',12);if(s.b.land===null||s.t-s.b.land<.4)glow(x,C.g,6,()=>arrow(x,BX+28,by,BX+28,by-s.b.v*2.4,C.g,3));
  if($('#fe').checked){const fy=Y(s.fe.y)-10,sw=s.air&&s.fe.land===null?Math.sin(s.t*5)*12:0;x.save();x.translate(FX+sw,fy);x.rotate(-.5+sw/40);const fg=x.createLinearGradient(-26,0,26,0);fg.addColorStop(0,'#fff');fg.addColorStop(1,'#CBD5E1');x.fillStyle=fg;x.beginPath();x.ellipse(0,0,26,8,0,0,7);x.fill();x.strokeStyle='#64748B';x.lineWidth=1.5;x.beginPath();x.moveTo(-30,0);x.lineTo(26,0);x.stroke();for(let k=-20;k<20;k+=5){x.beginPath();x.moveTo(k,0);x.lineTo(k+4,-6);x.moveTo(k,0);x.lineTo(k+4,6);x.stroke()}x.restore();pill(x,'ريشة',FX,fy-20,'rgba(10,27,46,.8)','#fff',12)}
  for(let i=dust.length-1;i>=0;i--){const p=dust[i];p.vy+=400*dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.l-=dt;if(p.l<=0||p.y>GY+4){dust.splice(i,1);continue}circ(x,p.x,p.y,3,`rgba(230,220,200,${p.l})`)}
  x.restore();
  pill(x,`${pl[0]}  •  g = ${pl[1]} m/s²  •  ${s.air?'مع هواء':'فراغ'}`,740,34,'rgba(10,27,46,.85)','#fff',14);TX(x,(s.watch?s.t:(s.meas||0)).toFixed(2)+' s',880,90,C.y,38,'right','Alexandria');
  setRd('r_t',f(s.t)+' s');setRd('r_v',f(Math.abs(s.b.v))+' m/s '+(s.b.v>0?'↑':'↓'));setRd('r_h',f(s.b.y)+' m');setRd('r_H',f(s.H)+' m')});
keyH=e=>{if(e.code=='Space'){e.preventDefault();if(sim.watch)stopW();else if(!sim.run)start()}};
$('#st').onclick=start;$('#sp').onclick=stopW;$('#rs').onclick=reset;
$$('#pl button').forEach(b=>b.onclick=()=>{pi=+b.dataset.i;$$('#pl button').forEach(o=>o.classList.toggle('on',o==b));const pl=PL[pi];$('#air').disabled=!pl[4];if(!pl[4])$('#air').checked=false;reset();Teacher.say(pl[5])});
onSl(['h','u'],reset);$('#air').onchange=()=>{reset();if($('#air').checked)Teacher.say('fall_air')};$('#fe').onchange=reset;
reset();Teacher.say('fall_start')}

/* ================= 7 TYPES OF MOTION + PENDULUM ================= */
function pMotion(m,L){
m.innerHTML=plate(L,'<b>انتقالية:</b> من نقطة بداية إلى نقطة نهاية. <b>دورية:</b> تكرر نفسها في أزمنة متساوية. <b>منتظمة:</b> مسافات متساوية في أزمنة متساوية. <b>لحظية:</b> السرعة عند لحظة معينة (عداد السيارة). <b>متوسطة:</b> <bdi dir="ltr">v = d / t</bdi>.')+
`<section class="panel">${panelH('flask','أنواع الحركة أمامك')}<div class="screen"><canvas id="cm"></canvas>${rd([['r_u','سرعة المنتظمة','g'],['r_i','لحظية (غير منتظمة)','r'],['r_a','متوسطة (غير منتظمة)','y']])}</div></section>
<section class="panel">${panelH('pend','تجربة البندول البسيط (حركة دورية)')}<div class="two"><div>${sl('L','طول الخيط L',.2,2,1,.1,'m')}${sl('A0','زاوية الإزاحة',5,40,20,1,'°')}<button class="btn green" id="pm">قِس زمن 10 ذبذبات</button><div class="big" id="pt">0.00 s</div><div class="res" id="pr">—</div></div><div class="screen"><canvas id="cp"></canvas></div></div><div class="note">الذبذبة الكاملة: البندول يروح ويرجع لنفس النقطة في نفس الاتجاه. الزمن الدوري = الزمن الكلي ÷ عدد الذبذبات. (إثراء: <bdi dir="ltr">T ≈ 2π √(L / g)</bdi>، فكلما زاد طول الخيط زاد الزمن الدوري.)</div></section>
${mission('motion','أجب عن 5 أسئلة سريعة، 4 منها على الأقل صحيحة.','<div id="qz"></div>')}`;
const x=CV('#cm',900,400),U=t=>70*t,N=t=>70*t+25*Math.sin(2*t),dN=t=>70+50*Math.cos(2*t);
const lane=(y,lab,col)=>{x.fillStyle='#14263B';x.fillRect(20,y-6,560,10);TX(x,lab,590,y+4,col,14,'left')};
const drawM=t=>{bgScreen(x);const s=t%8;
  // translational: from start to finish along a straight line
  TX(x,'انتقالية: من نقطة بداية إلى نقطة نهاية',880,30,C.txt,15,'right');const p=s/8;x.strokeStyle='rgba(255,255,255,.15)';x.lineWidth=2;x.beginPath();x.moveTo(40,92);x.lineTo(560,92);x.stroke();circ(x,40,92,7,C.g);circ(x,560,92,7,C.r);TX(x,'بداية',40,118,C.g,12);TX(x,'نهاية',560,118,C.r,12);car(x,40+p*470,90,62,'#FFC727');
  // uniform vs non-uniform with second marks
  TX(x,'منتظمة: علامات متساوية كل ثانية',880,160,C.g,15,'right');TX(x,'غير منتظمة: علامات غير متساوية',880,235,C.r,15,'right');
  x.fillStyle='#14263B';x.fillRect(20,184,560,6);x.fillRect(20,259,560,6);
  for(let i=0;i<=Math.floor(s);i++){rr(x,20+U(i)+28,176,4,22,2,C.g);rr(x,20+N(i)+28,251,4,22,2,C.r)}
  car(x,20+U(s),184,58,'#2ED3A0');car(x,20+N(s),259,58,'#FF6B5A');
  // periodic: pendulum + clock hand
  TX(x,'دورية: تكرر نفسها في أزمنة متساوية',880,310,C.c,15,'right');
  const a=.6*Math.cos(s*2*Math.PI/2),px=130+70*Math.sin(a),py=300+70*Math.cos(a);x.strokeStyle='#C9D7E6';x.lineWidth=2;x.beginPath();x.moveTo(130,300);x.lineTo(px,py);x.stroke();rr(x,100,294,60,6,2,'#6B819A');glow(x,C.c,10,()=>ball(x,px,py,12,'#BFF0FF','#1E8FB8'));
  ring(x,330,345,42,'rgba(255,255,255,.35)',4);for(let k=0;k<12;k++){const q=k*Math.PI/6;x.strokeStyle='rgba(255,255,255,.5)';x.lineWidth=2;x.beginPath();x.moveTo(330+34*Math.sin(q),345-34*Math.cos(q));x.lineTo(330+40*Math.sin(q),345-40*Math.cos(q));x.stroke()}const q=s*Math.PI/4;x.strokeStyle=C.y;x.lineWidth=4;x.lineCap='round';x.beginPath();x.moveTo(330,345);x.lineTo(330+32*Math.sin(q),345-32*Math.cos(q));x.stroke();circ(x,330,345,5,C.y);
  setRd('r_u','70 m/s');setRd('r_i',f(dN(s),1)+' m/s');setRd('r_a',f(N(Math.max(s,.01))/Math.max(s,.01),1)+' m/s')};
const y=CV('#cp',500,380),PV=[250,30],K=150;let th,om,prev,meas=null;
const pr=()=>{th=V('A0')*Math.PI/180;om=0;prev=th;meas=null;$('#pt').textContent='0.00 s'};
const pend=dt=>{const Ln=V('L'),g=9.8,n=10,h=dt/n;for(let i=0;i<n;i++){om+=-(g/Ln)*Math.sin(th)*h;th+=om*h}
  if(meas&&meas.run){meas.t+=dt;if(prev>0&&th<=0){if(meas.c<0){meas.c=0;meas.t=0}else{meas.c++;sfx('tick');if(meas.c>=10){meas.run=false;const T=meas.t/10,Tt=2*Math.PI*Math.sqrt(Ln/9.8);$('#pr').textContent=`T = ${f(meas.t)} / 10 = ${f(T)} s   (2π√(L/g) = ${f(Tt)} s)`;sfx('ok');award('pend',10,'قياس الزمن الدوري');Teacher.say('pend_done',`الزمن الدوري = ${f(T)} s. `+LINES.pend_done)}}}$('#pt').textContent=Math.max(0,meas.t).toFixed(2)+' s'}prev=th;
  const bx=PV[0]+K*Ln*Math.sin(th),bY=PV[1]+K*Ln*Math.cos(th),A=V('A0')*Math.PI/180;bgScreen(y);rr(y,150,16,200,14,4,'#6B819A');y.fillStyle='#0A1B2E';for(let k=0;k<12;k++)y.fillRect(154+k*16,18,8,10);
  y.strokeStyle='rgba(160,190,220,.4)';y.setLineDash([5,5]);y.lineWidth=1.5;y.beginPath();y.arc(PV[0],PV[1],K*Ln,Math.PI/2-A,Math.PI/2+A);y.stroke();y.beginPath();y.moveTo(PV[0],PV[1]);y.lineTo(PV[0],PV[1]+K*Ln+22);y.stroke();y.setLineDash([]);
  y.strokeStyle='#E2E8F0';y.lineWidth=2;y.beginPath();y.moveTo(PV[0],PV[1]);y.lineTo(bx,bY);y.stroke();glow(y,C.c,14,()=>ball(y,bx,bY,17,'#BFF0FF','#1E8FB8'));
  TX(y,`L = ${Ln} m`,20,365,C.txt,15,'left','Alexandria');TX(y,`θ = ${f(th*180/Math.PI,1)}°`,480,365,C.y,15,'right','Alexandria');if(meas&&meas.run)pill(y,meas.c<0?'في انتظار بداية الذبذبة…':`الذبذبات: ${meas.c} / 10`,250,330,C.g,'#0A1B2E',15)};
$('#pm').onclick=()=>{actx();meas={run:true,c:-1,t:0};$('#pr').textContent='…';sfx('click')};onSl(['L','A0'],pr);pr();
loop((t,dt)=>{drawM(t);pend(dt)});
const QZ=[['الحركة التي تكرر نفسها في فترات زمنية متساوية هي الحركة:',['الدورية','الانتقالية','غير المنتظمة','المتسارعة'],'مثل البندول وعقرب الساعة.'],['عداد السرعة في السيارة يقيس السرعة:',['اللحظية','المتوسطة','المنتظمة دائماً','الكلية'],'السرعة اللحظية هي سرعة الجسم عند لحظة معينة.'],['جسم يقطع مسافات متساوية في أزمنة متساوية، حركته:',['منتظمة','غير منتظمة','دورية','متسارعة'],'في الحركة المنتظمة السرعة ثابتة.'],['قطعت سيارة 120 m في 6 s، سرعتها المتوسطة:',['20 m/s','720 m/s','0.05 m/s','126 m/s'],'v = d / t = 120 / 6 = 20 m/s'],['بندول عمل 20 ذبذبة كاملة في 40 s، زمنه الدوري:',['2 s','0.5 s','20 s','800 s'],'T = 40 / 20 = 2 s']];
const quiz=()=>mcq($('#qz'),shuffle(QZ),(sc,n)=>{if(sc>=4){$('#qz').innerHTML=`<div class="res okb">${sc} / ${n} ✓</div>`;complete('motion','motion_done',`نتيجتك ${sc} من ${n}! `+LINES.motion_done)}else{$('#qz').innerHTML=`<div class="res nob">${sc} / ${n}</div><button class="btn" id="qr">${ic('replay')} حاول مرة أخرى</button>`;$('#qr').onclick=quiz;Teacher.say('motion_retry',`جبت ${sc} من ${n}. `+LINES.motion_retry)}});quiz();
Teacher.say('motion_start')}

/* ================= 8 DIMENSIONAL ANALYSIS ================= */
function pDim(m,L){const B={d:[1,0,0],v:[1,0,-1],a:[1,0,-2],t:[0,0,1],m:[0,1,0],F:[1,1,-2],'t⁻¹':[0,0,-1]};
const E=[['d = v t',['d'],['v','t']],['v = a t',['v'],['a','t']],['a = v / t',['a'],['v','t⁻¹']],['F = m a',['F'],['m','a']],['v² = v₀² + 2 a d',['v','v'],['a','d']],['d = v t²  (?)',['d'],['v','t','t']],['v = a / t  (?)',['v'],['a','t⁻¹']],['d = a t  (?)',['d'],['a','t']]];
const nm=['L','M','T'],fm=x=>x.map((e,i)=>e?nm[i]+(e!=1?`<sup>${e}</sup>`:''):'').join(' ')||'1',sm=k=>k.reduce((s,q)=>s.map((e,i)=>e+B[q][i]),[0,0,0]);
const TB=[['المساحة','L × L',[2,0,0]],['الحجم','L × L × L',[3,0,0]],['السرعة','d / t',[1,0,-1]],['العجلة','v / t',[1,0,-2]],['الكثافة','m / V',[-3,1,0]],['القوة','m × a',[1,1,-2]],['كمية التحرك','m × v',[1,1,-1]]];
m.innerHTML=plate(L,'الكميات الأساسية: الطول <b>L</b> والكتلة <b>M</b> والزمن <b>T</b>. معادلة الأبعاد تعبّر عن الكمية المشتقة بدلالتها: <bdi dir="ltr">[Q] = Lᵃ Mᵇ Tᶜ</bdi>. ومن فوائدها التحقق من صحة المعادلات: لازم أبعاد الطرفين تتساوى.')+
`<div class="two"><section class="panel">${panelH('table','أبعاد كميات مهمة')}<table class="t"><thead><tr><th>الكمية</th><th>العلاقة</th><th>الأبعاد</th></tr></thead><tbody>${TB.map(r=>`<tr><td>${r[0]}</td><td dir="ltr">${r[1]}</td><td dir="ltr"><b>${fm(r[2])}</b></td></tr>`).join('')}</tbody></table></section>
<section class="panel">${panelH('dim','اختبر صحة معادلة')}<select id="eq" aria-label="المعادلة" style="font-size:18px">${E.map((e,i)=>`<option value="${i}">${e[0]}</option>`).join('')}</select><div class="res" id="o1"></div><div class="res" id="o2"></div><div id="vd" style="text-align:center;font-weight:800;font-size:19px;margin-top:8px"></div><div class="note">معادلة الأبعاد لا تستطيع إيجاد الثوابت العددية مثل ½، ولو تساوت الأبعاد فهذا لا يضمن صحة المعادلة تماماً.</div></section></div>
${mission('dim','ابنِ معادلة الأبعاد بنفسك: اضبط أُس كل من L و M و T للكمية المطلوبة ثم اضغط «تحقق». أجب صح 3 مرات.',`<div class="res" id="gd">0 / 3</div><p style="font-size:20px">الكمية: <b id="bq"></b> <small id="dh" style="opacity:.75" dir="ltr"></small></p><div>${nm.map(n=>`<span class="stepper"><b>${n}</b><button data-n="${n}" data-d="-1" aria-label="${n} ناقص">−</button><b id="e${n}">0</b><button data-n="${n}" data-d="1" aria-label="${n} زائد">+</button></span>`).join('')}</div><div class="res" id="bp"></div><button class="btn" id="bc">${ic('check')} تحقق</button>`)}`;
const gox=(q)=>{const e=E[$('#eq').value],l=sm(e[1]),r=sm(e[2]);$('#o1').innerHTML=`[${e[1].join(' ')}] = ${fm(l)}`;$('#o2').innerHTML=`[${e[2].join(' ')}] = ${fm(r)}`;const ok=l.join()==r.join();$('#vd').innerHTML=ok?'<span class="ok">✓ صحيحة بُعدياً: أبعاد الطرفين متساوية</span>':'<span class="no">✗ خاطئة: أبعاد الطرفين مختلفة</span>';if(!q){sfx(ok?'ok':'no');Teacher.say(ok?'dim_eq_ok':'dim_eq_no')}};$('#eq').onchange=()=>gox();
let cur=-1,ex={L:0,M:0,T:0},good=0;const nq=()=>{let i;do i=rnd(0,TB.length-1);while(i==cur);cur=i;ex={L:0,M:0,T:0};$('#bq').textContent=TB[i][0];$('#dh').textContent='('+TB[i][1]+')';up()};
const up=()=>{nm.forEach(n=>$('#e'+n).textContent=ex[n]);$('#bp').innerHTML='['+TB[cur][0]+'] = '+fm(nm.map(n=>ex[n]))};
$$('.stepper button').forEach(b=>b.onclick=()=>{const n=b.dataset.n;ex[n]=Math.max(-3,Math.min(3,ex[n]+ +b.dataset.d));sfx('click');up()});
$('#bc').onclick=()=>{const ok=nm.map(n=>ex[n]).join()==TB[cur][2].join();if(ok){good++;$('#gd').textContent=`${Math.min(good,3)} / 3`;sfx('ok');if(good==3)complete('dim','dim_done');else{const k=praiseK();Teacher.say(k,LINES[k]+` [${TB[cur][0]}] = ${fm(TB[cur][2]).replace(/<\/?sup>/g,'')}`)}nq()}else{sfx('no');Teacher.say('dim_no',`فكّر: ${TB[cur][0]} = ${TB[cur][1]}. `+LINES.dim_no)}};
gox(true);nq();Teacher.say('dim_start')}

/* ================= 9 SOLVED EXAMPLES ================= */
function pSolved(m,L){const PR=[['القانون الأول – مثال 1','تتحرك سيارة بسرعة 15 m/s لتصل إلى 20 m/s خلال 2.5 s. احسب العجلة.',['المعطيات: Vo = 15 m/s ، Vf = 20 m/s ، t = 2.5 s ، a = ?','Vf = Vo + a t','20 = 15 + a × 2.5','a = (20 − 15) / 2.5','a = 2 m/s²']],
['القانون الأول – مثال 2','طائرة تلامس الأرض بسرعة 160 m/s وتتوقف تماماً خلال 32 s. احسب العجلة.',['المعطيات: Vo = 160 m/s ، Vf = 0 ، t = 32 s','Vf = Vo + a t','0 = 160 + a × 32','a = −160 / 32','a = −5 m/s² (تناقصية)']],
['القانون الثاني – مثال 1','جسم بدأ من السكون وقطع 9 m في 3 s. احسب العجلة، ثم الزمن ليصل إلى 24 m/s.',['المعطيات: Vo = 0 ، d = 9 m ، t = 3 s','d = Vo t + ½ a t²','9 = 0 + ½ × a × 3²  ←  a = 2 m/s²','Vf = Vo + a t  ←  24 = 0 + 2 × t','t = 12 s']],
['القانون الثاني – مثال 2','سيارة سرعتها 10 m/s تتحرك بعجلة 2 m/s² لمدة 5 s. احسب المسافة.',['d = Vo t + ½ a t²','d = 10 × 5 + ½ × 2 × 5²','d = 50 + 25','d = 75 m']],
['القانون الثالث – مثال 1','أتوبيس سرعته 20 m/s يهدئ بعجلة مقدارها 3 m/s². احسب المسافة قبل أن يتوقف.',['المعطيات: Vo = 20 m/s ، Vf = 0 ، a = −3 m/s²','Vf² = Vo² + 2 a d','0 = 400 + 2 × (−3) × d','d = 400 / 6 ≈ 66.7 m']],
['القانون الثالث – مثال 2','سيارة من السكون بعجلة 4 m/s² تقطع 50 m. احسب سرعتها النهائية.',['Vf² = Vo² + 2 a d','Vf² = 0 + 2 × 4 × 50 = 400','Vf = √400','Vf = 20 m/s']],
['مسألة: الثانية الثالثة','سيارة سرعتها 30 m/s أصبحت 10 m/s خلال 5 s. احسب العجلة والمسافة المقطوعة في الثانية الثالثة.',['10 = 30 + a × 5  ←  a = −4 m/s²','المسافة في أول 3 s: d₃ = 30 × 3 + ½ × (−4) × 3² = 72 m','المسافة في أول 2 s: d₂ = 30 × 2 + ½ × (−4) × 2² = 52 m','المسافة في الثانية الثالثة = d₃ − d₂ = 20 m']],
['مسألة: السقوط الحر','كرة سقطت من السكون من ارتفاع 40 m. احسب سرعتها قبل الاصطدام والزمن اللازم (g = 9.8 m/s²).',['Vf² = Vo² + 2 g h = 2 × 9.8 × 40 = 784','Vf = 28 m/s','Vf = Vo + g t  ←  28 = 9.8 × t','t ≈ 2.86 s']],
['مسألة: القذف لأعلى','قُذفت كرة رأسياً لأعلى وعادت لنفس النقطة بعد 4 s. احسب السرعة الابتدائية (g = 9.8 m/s²).',['زمن الصعود = 4 / 2 = 2 s ، وعند القمة Vf = 0','Vf = Vo − g t','0 = Vo − 9.8 × 2','Vo = 19.6 m/s']]];
m.innerHTML=plate(L,'اختر مسألة، فكّر فيها الأول، ثم اضغط «الخطوة التالية» وتابع الحل خطوة بخطوة.')+
`<section class="panel"><div class="seg" id="ps">${PR.map((p,i)=>`<button data-i="${i}">${i+1}</button>`).join('')}</div></section>
<section class="panel"><h2 id="pt"></h2><p id="ptx" style="font-size:19px"></p><div class="steps" id="st"></div><div class="row"><button class="btn" id="nx">الخطوة التالية</button><button class="btn navy" id="al">عرض الحل كاملاً</button><button class="btn ghost" id="rs">${ic('reset')} إعادة</button></div></section>
${mission('solved','تابع حل 3 مسائل مختلفة حتى آخر خطوة.','<div class="res" id="sc">0 / 3</div>')}`;
let cur=0,k=0,fired=false;const fin=new Set();
const sh=()=>{const p=PR[cur];$$('#ps button').forEach(b=>{b.classList.toggle('on',+b.dataset.i==cur);b.title=PR[+b.dataset.i][0]});$('#pt').textContent=p[0];$('#ptx').innerHTML=LTX(p[1]);$('#st').innerHTML=p[2].slice(0,k).map((q,i)=>`<div class="res ${k==p[2].length&&i==k-1?'fin':''}">${LTX(q)}</div>`).join('');
  if(k==p[2].length){fin.add(cur);$('#sc').textContent=`${Math.min(fin.size,3)} / 3`;if(fin.size>=3&&!fired){fired=true;setTimeout(()=>complete('solved','solved_done'),900)}}};
$('#nx').onclick=()=>{const p=PR[cur];if(k<p[2].length){k++;sfx('click');const sk=clipFor(p[2][k-1]);if(k==p[2].length)Teacher.say(sk?['solved_final',sk]:'solved_final',LINES.solved_final+' '+p[2][k-1]);else Teacher.say(sk,'الخطوة '+k+': '+p[2][k-1]);sh()}};
$('#al').onclick=()=>{k=PR[cur][2].length;sh();Teacher.say('solved_all')};
$('#rs').onclick=()=>{k=0;sh()};$$('#ps button').forEach(b=>b.onclick=()=>{cur=+b.dataset.i;k=0;sh();Teacher.say('prob'+cur,PR[cur][1])});
sh();Teacher.say('solved_start')}

/* ================= 10 PRACTICE & FINAL EXAM ================= */
const TOP={phys:["علم الفيزياء","intro"],meas:["القياس والوحدات","measure"],dim:["معادلة الأبعاد","dim"],mot:["أنواع الحركة والسرعة","motion"],acc:["العجلة ومعادلات الحركة","accel"],fall:["السقوط الحر","fall"]};
const TOPN=k=>(TOP[k]||[""])[0];
function pExam(m,L){const F=[['السرعة المتوسطة','v = d / t'],['العجلة','a = (Vf − Vo) / t'],['القانون الأول (بدون d)','Vf = Vo + a t'],['القانون الثاني (بدون Vf)','d = Vo t + ½ a t²'],['القانون الثالث (بدون t)','Vf² = Vo² + 2 a d'],['عجلة الجاذبية','g = 9.8 m/s²']];
m.innerHTML=plate(L,'ملخص قوانين الفصل، تدريب على مسائل بأرقام عشوائية، والاختبار النهائي من بنك أسئلة كبير بشهادة قابلة للطباعة.')+
`<section class="panel">${panelH('book','ملخص القوانين')}<div class="grid">${F.map(a=>`<div><b>${a[0]}</b><div class="formula">${a[1]}</div></div>`).join('')}</div><div class="note">نصيحة المستر: اكتب المعطيات وحدد المجهول، ثم اختر القانون الذي لا يحتوي على الكمية غير المعطاة. السكون: <bdi dir="ltr">Vo = 0</bdi> — التوقف: <bdi dir="ltr">Vf = 0</bdi> — أقصى ارتفاع: <bdi dir="ltr">Vf = 0</bdi>.</div></section>
<section class="panel">${panelH('dice','تدريب لا نهائي')}<p id="pq" style="font-size:19px"></p><div class="row"><input id="pa" type="number" step="any" style="width:160px" placeholder="الإجابة" aria-label="الإجابة"><button class="btn green" id="pk">${ic('check')} تحقق</button><button class="btn navy" id="pn">${ic('dice')} مسألة جديدة</button><button class="btn ghost" id="ph">${ic('bulb')} تلميح</button><span class="tchip" id="pst" style="font-size:14px;padding:4px 12px">صح: 0</span></div><div id="pf" aria-live="polite"></div></section>
${mission('exam',`الاختبار النهائي من <b>بنك فيه ${BANK.length} سؤال</b> في ${Object.keys(TOP).length} موضوعات. اختر «الفصل كله» واحصل على <b>60%</b> أو أكثر لتنال الشارة و<b>شهادة إتمام المعمل</b>. وتقدر تختبر نفسك في موضوع واحد للمراجعة.`,`<div id="ex"></div>`)}<div id="certw"></div>`;
let A=0,H='',nOk=0;
const nw=()=>{const k=rnd(0,6);$('#pf').innerHTML='';$('#pa').value='';let q;
  if(k==0){const v=rnd(0,20),a=rnd(1,5),t=rnd(2,8);A=v+a*t;H='Vf = Vo + a t';q=`سيارة سرعتها الابتدائية ${v} m/s وعجلتها ${a} m/s² لمدة ${t} s. احسب سرعتها النهائية (m/s).`}
  else if(k==1){const v=rnd(0,20),a=rnd(1,5),t=rnd(2,8);A=v*t+.5*a*t*t;H='d = Vo t + ½ a t²';q=`جسم سرعته الابتدائية ${v} m/s وعجلته ${a} m/s² لمدة ${t} s. احسب المسافة المقطوعة (m).`}
  else if(k==2){const a=rnd(1,5),d=rnd(10,60);A=Math.sqrt(2*a*d);H='Vf² = Vo² + 2 a d  (Vo = 0)';q=`سيارة تنطلق من السكون بعجلة ${a} m/s² وتقطع ${d} m. احسب سرعتها النهائية (m/s) لأقرب رقمين عشريين.`}
  else if(k==3){const v=rnd(4,12)*5,t=rnd(2,10);A=-v/t;H='a = (Vf − Vo) / t  (Vf = 0)';q=`سيارة سرعتها ${v} m/s ضغط سائقها الفرامل فتوقفت خلال ${t} s. احسب العجلة (m/s²) — انتبه للإشارة.`}
  else if(k==4){const h=rnd(2,20)*5;A=Math.sqrt(2*h/9.8);H='h = ½ g t²  ←  t = √(2h / g)';q=`سقط حجر من السكون من ارتفاع ${h} m (g = 9.8 m/s²). احسب زمن السقوط (s) لأقرب رقمين عشريين.`}
  else if(k==5){const v=rnd(2,20)*18;A=v/3.6;H='m/s = km/h ÷ 3.6';q=`حوّل السرعة ${v} km/h إلى m/s.`}
  else{const a=rnd(2,12),b=rnd(2,12);A=Math.hypot(a,b);H='Δd = √(x² + y²)';q=`تحرك جسم ${a} m شرقاً ثم ${b} m شمالاً. احسب مقدار الإزاحة (m) لأقرب رقمين عشريين.`}
  $('#pq').innerHTML=LTX(q)};
$('#pk').onclick=()=>{if($('#pa').value==='')return;const ok=Math.abs(+$('#pa').value-A)<=Math.max(.06,Math.abs(A)*.005);sfx(ok?'ok':'no');if(ok){nOk++;$('#pst').textContent='صح: '+nOk;if(nOk==5)award('prac5',20,'5 مسائل صح');Teacher.say(praiseK());$('#pf').innerHTML='<div class="res okb">✓ إجابة صحيحة = '+f(A)+'</div>';setTimeout(nw,1400)}else{$('#pf').innerHTML=`<div class="res nob">✗ حاول مرة أخرى</div><button class="btn ghost" id="sa">إظهار الإجابة</button>`;$('#sa').onclick=()=>{$('#pf').innerHTML=`<div class="res">${f(A)}</div>`};Teacher.say('prac_no',LINES.prac_no+' '+H)}};
$('#pn').onclick=nw;$('#ph').onclick=()=>Teacher.say('prac_hint',LINES.prac_hint+' '+H);$('#pa').onkeydown=e=>{if(e.key=='Enter')$('#pk').click()};
const cert=(sc,tot=10)=>{$('#certw').innerHTML=`<section class="panel"><div class="cert" id="cert"><img class="seal" src="${IMG_L}" alt="شعار مركز التدريب"><img class="tph" src="${IMG_T}" alt="${TEACHER}"><div style="font-size:17px">شركة ترسانة الإسكندرية — <b>مركز التدريب</b> • قسم الفيزياء</div><h2>شهادة إتمام</h2><div style="font-size:18px">معمل الفيزياء الافتراضي — الصف الأول، الفصل الأول (الفيزياء والقياس والحركة)</div><p style="margin:16px auto 4px;font-size:18px">يشهد مدرس الفيزياء بأن الطالب/ـة</p><div class="nm">${esc(S.name)}</div><p style="font-size:18px;margin:0 auto">قد أتم تجارب المعمل الافتراضي بنجاح، وحصل في الاختبار النهائي على <b>${sc} / ${tot}</b> (${Math.round(sc/tot*100)}%)، بمجموع نقاط خبرة <b>${S.xp}</b> و<b>${Object.keys(S.done).length}</b> شارات.</p><div class="sig"><div>التاريخ<br><b>${new Date().toLocaleDateString('ar-EG')}</b></div><div>مدرس الفيزياء<i>Mohamed Mahmoud</i><b>${TEACHER}</b></div></div></div><div class="row" style="justify-content:center;margin-top:14px"><button class="btn navy" id="prn">${ic('print')} طباعة الشهادة / حفظ PDF</button></div></section>`;$('#prn').onclick=()=>print();$('#cert').scrollIntoView({behavior:'smooth'})};
const exSetup=()=>{const best=S.bestPct;
  $('#ex').innerHTML=`<div class="row"><label>الموضوع <select id="et">${'<option value="all">الفصل كله (للشهادة)</option>'+Object.keys(TOP).map(k=>`<option value="${k}">${TOPN(k)} (${BANK.filter(b=>b[3]==k).length})</option>`).join('')}</select></label><label>عدد الأسئلة <select id="en"><option>10</option><option>20</option><option>30</option></select></label><button class="btn" id="eb">${ic('play')} ابدأ الاختبار</button>${best!=null?`<span class="tchip" style="font-size:14px;padding:4px 12px">أفضل نتيجة: ${best}%</span>`:''}${S.cert?`<button class="btn ghost" id="ecs">${ic('trophy')} عرض شهادتي</button>`:''}</div><p style="font-size:14px;margin-top:10px;opacity:.8">الأسئلة بتتغير كل مرة، والمعمل بيقدّم الأسئلة اللي ماشفتهاش قبل كده. ترتيب الاختيارات كمان بيتغير.</p>`;
  $('#eb').onclick=()=>exam($('#et').value,+$('#en').value);if($('#ecs'))$('#ecs').onclick=()=>cert(S.cert[0],S.cert[1])};
const pick=(topic,n)=>{S.seen=S.seen||{};const idx=BANK.map((b,i)=>i).filter(i=>topic=='all'||BANK[i][3]==topic);
  const fresh=l=>shuffle(l).sort((a,b)=>(S.seen[a]||0)-(S.seen[b]||0));let out=[];
  if(topic=='all'){const g={};Object.keys(TOP).forEach(k=>g[k]=fresh(idx.filter(i=>BANK[i][3]==k)));let ks=shuffle(Object.keys(TOP));while(out.length<n&&ks.some(k=>g[k].length)){for(const k of ks){if(out.length>=n)break;if(g[k].length)out.push(g[k].shift())}}}
  else out=fresh(idx).slice(0,n);
  out=shuffle(out);out.forEach(i=>S.seen[i]=(S.seen[i]||0)+1);save();return out.map(i=>BANK[i])};
const exam=(topic='all',n=10)=>{const qs=pick(topic,n),N=qs.length,t0=Date.now();timers.forEach(clearInterval);
  $('#ex').innerHTML=`<div class="row" style="margin-bottom:10px"><span class="tchip" id="etm" style="font-size:14px;padding:4px 12px">00:00</span><span class="tchip" style="font-size:14px;padding:4px 12px">${topic=='all'?'الفصل كله':TOPN(topic)} • ${N} سؤال</span></div><div id="eq"></div>`;
  timers.push(setInterval(()=>{const s=Math.floor((Date.now()-t0)/1000);if($('#etm'))$('#etm').textContent=`${String(s/60|0).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`},1000));
  Teacher.say('exam_go');
  mcq($('#eq'),qs,(sc,tot,rec)=>{timers.forEach(clearInterval);const pct=Math.round(sc/tot*100),pass=pct>=60,secs=Math.floor((Date.now()-t0)/1000);
    S.bestPct=Math.max(S.bestPct||0,pct);S.exams=(S.exams||0)+1;save();
    const by={};rec.forEach(r=>{const k=r.q[3];by[k]=by[k]||[0,0];by[k][1]++;if(r.ok)by[k][0]++});
    const weak=Object.keys(by).filter(k=>by[k][0]<by[k][1]).sort((a,b)=>by[a][0]/by[a][1]-by[b][0]/by[b][1])[0];
    const wrong=rec.filter(r=>!r.ok);
    $('#ex').innerHTML=`<div class="big" style="color:${pass?'#3DDC97':'#FF6B72'}">${sc} / ${tot}</div><p style="text-align:center;margin:0 auto">النسبة <b>${pct}%</b> • الزمن ${String(secs/60|0).padStart(2,'0')}:${String(secs%60).padStart(2,'0')}</p>
      <h4 style="margin-top:14px">نتيجتك في كل موضوع</h4><div class="tbars">${Object.keys(by).map(k=>{const v=by[k],w=Math.round(v[0]/v[1]*100);return `<div class="tbar"><span>${TOPN(k)}</span><div><i style="width:${w}%;background:${w>=80?'var(--green)':w>=50?'var(--yellow)':'var(--red)'}"></i></div><b>${v[0]}/${v[1]}</b></div>`}).join('')}</div>
      ${wrong.length?`<details class="rev" ${pass?'':'open'} style="background:var(--panel);color:var(--ink)"><summary>مراجعة الأسئلة اللي غلطت فيها (${wrong.length})</summary>${wrong.map(r=>`<div class="rv"><div style="font-weight:800">${LTX(r.q[0])}</div><div>إجابتك: <span class="bad">${LTX(r.ch)}</span></div><div>الصحيحة: <span class="good">${LTX(r.q[1][0])}</span></div>${r.q[2]?`<div class="mut">${LTX(r.q[2])}</div>`:''}</div>`).join('')}</details>`:'<p class="res okb">ولا غلطة!</p>'}
      <div class="row" style="justify-content:center;margin-top:12px"><button class="btn" id="eagain">${ic('replay')} اختبار جديد</button>${weak&&TOP[weak]?`<button class="btn ghost" id="eweak">راجع «${TOPN(weak)}» في المعمل</button>`:''}</div>`;
    $('#eagain').onclick=exSetup;if($('#eweak'))$('#eweak').onclick=()=>go(TOP[weak][1]);
    const tip=weak?` محتاج تراجع «${TOPN(weak)}».`:'';
    if(topic=='all'&&pass){const c=S.cert,cp=c?c[0]/c[1]:0;if(sc/tot>=cp)S.cert=[sc,tot];save();complete('exam',pct==100?'exam_full':'exam_pass',(pct==100?LINES.exam_full:`نجحت بنسبة ${pct}%. `+LINES.exam_pass)+tip);cert(S.cert[0],S.cert[1])}
    else if(topic!='all')Teacher.say(pct>=80?'exam_topic_good':'exam_topic_low',`${pct}% في «${TOPN(topic)}». `+LINES[pct>=80?'exam_topic_good':'exam_topic_low']);
    else Teacher.say('exam_fail',`جبت ${sc} من ${tot} (${pct}%).${tip} `+LINES.exam_fail)},true)};
exSetup();nw();Teacher.say('exam_start')}

/* ================= REGISTRY ================= */
const LABS=[{id:'home',icon:'home',t:'لوحة الطالب',fn:pHome},
{id:'intro',icon:'wave',t:'علم الفيزياء',d:'جسيمات وأمواج: أسقط الحجر في البركة وصنّف الظواهر.',bd:'صياد الأمواج',fn:pIntro},
{id:'cards',icon:'cards',t:'شرح بالصور',d:'32 بطاقة مصورة لكل نقاط الفصل، يشرحها المستر بصوته.',bd:'قارئ الصور',fn:pCards},
{id:'measure',icon:'ruler',t:'معمل القياس',d:'قِس الطاولة بالمتر، حوّل الوحدات، ورتّب الوحدات الدولية.',bd:'خبير القياس',fn:pMeasure},
{id:'disp',icon:'compass',t:'المسافة والإزاحة',d:'ارسم مسارك على الشبكة وحل تحديات الإزاحة.',bd:'الملّاح',fn:pDisp},
{id:'accel',icon:'gauge',t:'معمل العجلة',d:'تنبأ ثم شغّل السيارة وشاهد منحنيات الحركة وجدول القراءات.',bd:'سائق العجلة',fn:pAccel},
{id:'fall',icon:'fall',t:'السقوط الحر',d:'ساعة إيقاف، كواكب مختلفة، ريشة وكرة، واحسب g بنفسك.',bd:'عالِم السقوط',fn:pFall},
{id:'motion',icon:'pend',t:'أنواع الحركة',d:'انتقالية ودورية ومنتظمة وغير منتظمة، وتجربة البندول.',bd:'ملك الحركة',fn:pMotion},
{id:'dim',icon:'dim',t:'معادلة الأبعاد',d:'افحص صحة المعادلات وابنِ أبعاد الكميات بنفسك.',bd:'مهندس الأبعاد',fn:pDim},
{id:'solved',icon:'steps',t:'أمثلة محلولة',d:'مسائل الكتاب محلولة خطوة بخطوة.',bd:'حلّال المسائل',fn:pSolved},
{id:'exam',icon:'trophy',t:'التدريب والاختبار',d:'ملخص القوانين، تدريب لا نهائي، واختبار نهائي بشهادة.',bd:'بطل الاختبار',fn:pExam}];
let cur='home';

function updTop(){if(!S)return;const lv=Math.min(LV.length-1,Math.floor(S.xp/100)),nb=Object.keys(S.done).filter(k=>k!='home').length;$('#who').innerHTML=`<span class="av">${esc(S.name.trim()[0]||'؟')}</span><span><b>${esc(S.name)}</b><small>المستوى ${lv+1} • ${LV[lv]}</small></span>`;$('#xpn').textContent=S.xp+' نقطة';$('#xpb').style.width=(S.xp%100)+'%';$('#bdn').textContent=nb+' من '+(LABS.length-1)+' شارات'}
function updNav(){}
function go(id){const L=LABS.find(l=>l.id==id)||LABS[0];cancelAnimationFrame(raf);timers.forEach(clearInterval);timers=[];keyH=null;cur=L.id;SLC=0;const m=$('#m');m.innerHTML='';try{L.fn(m,L)}catch(e){console.error(e);m.innerHTML='<div class="panel no">حدث خطأ: '+esc(e.message)+'</div>'}m.querySelectorAll('[data-back]').forEach(b=>b.onclick=()=>go('home'));if(L.id!='home'){const k=LABS.indexOf(L),nx=LABS[k+1];m.insertAdjacentHTML('beforeend',`<nav class="stnav" aria-label="التنقل بين المحطات"><button class="btn ghost" data-to="home">${icon3d('home',34)} الخريطة</button>${nx?`<button class="btn" data-to="${nx.id}">${icon3d(nx.icon,34)} المحطة الجاية: ${nx.t}</button>`:''}</nav>`);m.querySelectorAll('[data-to]').forEach(b=>b.onclick=()=>go(b.dataset.to))}document.body.classList.toggle('onhome',L.id=='home');addListen(m);scrollTo(0,0);try{history.replaceState(null,'','#'+cur)}catch(e){}}
function btns(){$('#bs').classList.toggle('off',!P().sound);$('#bv').classList.toggle('off',!P().voice);document.body.classList.toggle('dark',!!P().dark)}

/* ================= WELCOME / STUDENTS ================= */
function showWelcome(){const w=$('#welcome');w.style.display='block';const ps=Object.entries(DB.profiles).sort((a,b)=>(b[1].last||0)-(a[1].last||0));
w.innerHTML=`<div class="wl"><div class="wtext"><div class="org"><img src="${IMG_L}" alt="شعار مركز التدريب"><span><b>شركة ترسانة الإسكندرية</b>مركز التدريب • قسم الفيزياء</span></div><h1>معمل<br>الفيزياء</h1><div class="w3">الافتراضي ثلاثي الأبعاد</div><p class="lead">الصف الأول • الفصل الأول: الفيزياء والقياس والحركة. عشر محطات تجارب، ومستر محمد بيشرح بصوته، واختبار نهائي بشهادة.</p>
<div class="wcard"><label for="wn">اكتب اسمك عشان نبدأ الرحلة</label><div class="newp"><input id="wn" type="text" placeholder="اسمك الثلاثي" maxlength="40" autocomplete="off"><button class="btn" id="wg">يلا بينا</button></div>
${ps.length?`<div class="plist"><span>كمّل من حيث وقفت:</span>${ps.map(([id,p],k)=>`<button class="pbtn" data-id="${id}"><span class="av" style="background:${['#3D5AFE','#FF6B5A','#2ED3A0','#14204A'][k%4]}">${esc(p.name.trim()[0]||'؟')}</span>${esc(p.name)} • ${Object.keys(p.done).length}/10</button>`).join('')}</div>`:''}
<div class="wfoot">${ps.length?`<button class="tlink" id="tdb">لوحة المعلم</button>`:''}<button class="tlink" id="winst" hidden>${ic('download')} ثبّت المعمل كتطبيق</button></div></div></div>
<div class="wscene">${SCENE3D}<div class="wteach"><img src="${IMG_T}" alt="${TEACHER}"><div>أنا مستر محمد. جاهز تبدأ أول تجربة؟</div></div></div></div>`;
const enter=id=>{actx();DB.current=id;S=DB.profiles[id];save();w.style.display='none';sfx('win');begin(true)};
$$('.pbtn').forEach(b=>b.onclick=()=>enter(b.dataset.id));
const add=()=>{const n=$('#wn').value.trim();if(!n){$('#wn').classList.add('shake');setTimeout(()=>$('#wn').classList.remove('shake'),400);$('#wn').focus();return}const id='p'+Date.now();DB.profiles[id]=blankP(n.slice(0,40));enter(id)};
$('#wg').onclick=add;$('#wn').onkeydown=e=>{if(e.key=='Enter')add()};if($('#tdb'))$('#tdb').onclick=teacherDash;installBtns();if(innerWidth>700)setTimeout(()=>$('#wn').focus(),100)}

function teacherDash(){const w=$('#welcome');const ps=Object.entries(DB.profiles);const labs=LABS.slice(1);
w.innerHTML=`<div class="wrap tdash" style="padding-top:30px"><div class="wcard" style="box-shadow:10px 10px 0 var(--yellow)"><h2>لوحة المعلم</h2><p class="mut">نتائج كل الطلاب اللي استخدموا المعمل على الجهاز ده. تقدر تنزّلها كملف Excel (CSV).</p><div class="row"><button class="btn" id="csv">${ic('download')} تنزيل النتائج</button><button class="btn ghost" id="back">رجوع</button></div>
<div class="tw" style="max-height:none"><table class="t"><thead><tr><th>الطالب</th><th>المحطات</th><th>النقاط</th><th>أفضل اختبار</th><th>الشهادة</th><th>آخر دخول</th><th></th></tr></thead><tbody>${ps.map(([id,p])=>`<tr><td style="text-align:right"><b>${esc(p.name)}</b></td><td>${Object.keys(p.done).filter(k=>k!='home').length}/${labs.length}</td><td>${p.xp}</td><td>${p.bestPct!=null?p.bestPct+'%':'—'}</td><td>${p.cert?p.cert[0]+'/'+p.cert[1]:'—'}</td><td>${p.last?new Date(p.last).toLocaleDateString('ar-EG'):'—'}</td><td><button class="btn ghost" data-del="${id}" style="padding:4px 10px" aria-label="حذف ${esc(p.name)}">${ic('trash')}</button></td></tr>`).join('')}</tbody></table></div></div></div>`;
$('#back').onclick=showWelcome;
$$('[data-del]').forEach(b=>b.onclick=()=>{const p=DB.profiles[b.dataset.del];if(confirm('حذف الطالب «'+p.name+'» وكل تقدمه؟')){delete DB.profiles[b.dataset.del];saveDB();teacherDash()}});
$('#csv').onclick=()=>{const rows=[['الطالب',...labs.map(l=>l.t),'النقاط','أفضل اختبار %','الشهادة','آخر دخول']].concat(ps.map(([id,p])=>[p.name,...labs.map(l=>p.done[l.id]?'✓':''),p.xp,p.bestPct??'',p.cert?p.cert[0]+'/'+p.cert[1]:'',p.last?new Date(p.last).toLocaleString('ar-EG'):'']));
  const csv='﻿'+rows.map(r=>r.map(c=>'"'+String(c).replace(/"/g,'""')+'"').join(',')).join('\r\n');const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'}));a.download='نتائج_معمل_الفيزياء.csv';document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},500)}}

/* ================= PWA: install + offline ================= */
let deferredPrompt=null;const SWOK='serviceWorker' in navigator&&!IS_FILE;
addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferredPrompt=e;installBtns()});
const isIOS=/iphone|ipad|ipod/i.test(navigator.userAgent),standalone=matchMedia('(display-mode: standalone)').matches||navigator.standalone;
function installBtns(){$$('#winst,#binst').forEach(b=>{b.hidden=standalone||IS_FILE||!(deferredPrompt||isIOS);b.onclick=async()=>{if(deferredPrompt){deferredPrompt.prompt();await deferredPrompt.userChoice;deferredPrompt=null;installBtns()}else alert('على الآيفون: اضغط زر المشاركة ⬆️ في Safari، ثم «إضافة إلى الشاشة الرئيسية».')}})}
function cacheVoices(loud){if(!SWOK)return;const pk=vname(),flag='physlab_vc_'+pk;navigator.serviceWorker.ready.then(reg=>{if(!reg.active)return;const urls=Object.keys(VLINES).map(k=>'voice/'+pk+'/'+k+'.mp3');reg.active.postMessage({type:'cache',urls,pack:pk});if(loud)toast('جاري تحميل صوت '+VPACKS[pk].name+' للاستخدام بدون نت…')}).catch(()=>{});try{localStorage.setItem(flag,'1')}catch(e){}}
function autoCache(){try{if(localStorage.getItem('physlab_vc_'+vname()))return}catch(e){}cacheVoices(false)}
if(SWOK){addEventListener('load',()=>{navigator.serviceWorker.register('sw.js').then(()=>autoCache()).catch(()=>{})});navigator.serviceWorker.addEventListener('message',e=>{if(e.data&&e.data.type==='cached'&&e.data.n)toast(`صوت ${(VPACKS[e.data.pack]||{}).name||''} جاهز بدون نت ✓`)})}

function begin(fresh){updNav();updTop();btns();const h=location.hash.slice(1);go(LABS.some(l=>l.id==h)&&!fresh?h:'home')}
function init(){$('#brand-logo').src=IMG_L;$('#face').src=IMG_T;
  $('#bs').innerHTML=ic('sound');$('#binst').innerHTML=ic('download');$('#bv').innerHTML=ic('voice');$('#bd').innerHTML=ic('moon');$('#bf').innerHTML=ic('full');$('#tr').innerHTML=ic('replay');$('#tx').innerHTML=ic('close');btns();installBtns();
  $('#bs').onclick=()=>{P().sound=!P().sound;saveDB();btns();sfx('click')};
  $('#bv').onclick=()=>{P().voice=!P().voice;saveDB();btns();if(P().voice)Teacher.say('voice_on');else Teacher.stop()};
  $('#bd').onclick=()=>{P().dark=!P().dark;saveDB();btns()};
  $('#bf').onclick=()=>{try{document.fullscreenElement?document.exitFullscreen():document.documentElement.requestFullscreen()}catch(e){}};
  $('#face').onclick=()=>$('#dock').classList.toggle('min');$('#tx').onclick=()=>{$('#dock').classList.add('min');Teacher.stop()};$('#tr').onclick=()=>{actx();Teacher.replay()};
  $('#wave').innerHTML='<i></i>'.repeat(7);
  if(DB.current&&DB.profiles[DB.current]){S=DB.profiles[DB.current];begin(false);Teacher.say('greet_back','أهلاً بعودتك يا '+S.name+'! '+LINES.greet_back)}else showWelcome()}
(document.fonts&&document.fonts.load?Promise.all([document.fonts.load('900 20px Alexandria'),document.fonts.load('800 16px Tajawal'),document.fonts.load('500 16px Tajawal')]):Promise.resolve()).catch(()=>{}).then(init);
