let lang='en';try{lang=localStorage.getItem('lang')||((navigator.language||'').slice(0,2)=='ar'?'ar':'en')}catch(e){}
const AR=window.AR||{};
const tr=x=>lang=='ar'?(AR[x]||x):x;
const $$=s=>[...document.querySelectorAll(s)];
const still=matchMedia('(prefers-reduced-motion:reduce)').matches;
const secs=$$('.ch'),NAMES=secs.map(s=>s.dataset.n);let cur=0;
/* loader */
let v=0;const pc=document.getElementById('pc'),ld=document.getElementById('ld');
const bar=document.getElementById('bar');try{document.getElementById('ldlogo').src=document.getElementById('xlogo').src}catch(e){}
try{document.getElementById('xlogo').addEventListener('error',function(){this.hidden=true;document.getElementById('xtxt').hidden=false})}catch(e){}
const iv=setInterval(()=>{v=Math.min(100,v+(still?34:Math.ceil(Math.random()*8)));pc.textContent=v;bar.style.strokeDashoffset=100-v;
if(v>=100){clearInterval(iv);ld.classList.add('full');setTimeout(()=>{ld.classList.add('done');document.body.classList.add('go');secs[0].classList.add('in')},still?100:900)}},100);
/* chapters */
const P=[[8,6],[62,2],[68,52],[4,58],[62,30],[42,26],[58,60]];let cu=0;
function setActive(i){cur=i;const p=P[i];
document.querySelector('.o1').style.transform=`translate(${p[0]}vw,${p[1]}vh)`;
document.querySelector('.o2').style.transform=`translate(${70-p[0]}vw,${55-p[1]/1.5}vh)`;
document.querySelector('.o3').style.transform=`translate(${p[1]+20}vw,${p[0]+10}vh)`;
cnt.textContent=String(i+1).padStart(2,'0')+' / 0'+secs.length+'   '+tr(NAMES[i]).toUpperCase();
$$('#dots button').forEach((b,j)=>b.classList.toggle('on',j==i))}
const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting)setActive(secs.indexOf(e.target))}),{rootMargin:'-45% 0px -45% 0px'});
const ready=t=>t!==secs[0]||document.body.classList.contains('go');
const io2=new IntersectionObserver(es=>es.forEach(e=>{const t=e.target;if(!ready(t))return;if(e.isIntersecting){t.classList.add('in');if(t.id=='c2')countUp()}else t.classList.remove('in')}),{rootMargin:'-15% 0px -15% 0px'});
secs.forEach(s=>{io.observe(s);io2.observe(s)});
addEventListener('scroll',()=>{if(still)return;secs.forEach(s=>{const r=s.getBoundingClientRect();if(r.bottom<0||r.top>innerHeight)return;s.querySelector('.ghost').style.translate=(r.top/innerHeight*-9)+'vw 0'})},{passive:true});
function split(){$$('[data-sp]').forEach(el=>{if(el._o===undefined)el._o=el.textContent.replace(/\s+/g,' ').trim();
const t=tr(el._o),ch=el.dataset.sp=='chars'&&lang!='ar',toks=ch?[...t]:t.split(' ');
el.innerHTML='<span class="sr">'+t+'</span>'+toks.map((w,i)=>'<span class="w" aria-hidden="true"><span class="wi" style="--i:'+i+'">'+(w==' '?'&nbsp;':w)+'</span></span>'+(ch?'':' ')).join('')})}
const go=i=>secs[Math.max(0,Math.min(secs.length-1,i))].scrollIntoView({behavior:still?'auto':'smooth'});
prev.onclick=()=>go(cur-1);next.onclick=()=>go(cur+1);
/* menu */
const menu=document.getElementById('menu');
function toggleMenu(o){menu.classList.toggle('open',o);mbtn.setAttribute('aria-expanded',o);document.body.style.overflow=o?'hidden':''}
mbtn.onclick=()=>toggleMenu(!menu.classList.contains('open'));
addEventListener('keydown',e=>{if(e.key=='Escape')toggleMenu(false)});
function build(){mlist.innerHTML=secs.map((s,i)=>`<a href="#${s.id}"><i>0${i+1}</i>${tr(NAMES[i])}</a>`).join('');
dots.innerHTML=secs.map((s,i)=>`<button type="button" aria-label="${tr(NAMES[i])}"></button>`).join('');
$$('#dots button').forEach((b,i)=>b.onclick=()=>go(i));$$('#mlist a').forEach(a=>a.onclick=()=>toggleMenu(false))}
/* pointer effects */
document.addEventListener('pointermove',e=>{const g=e.target.closest&&e.target.closest('.glass');if(g){const r=g.getBoundingClientRect();g.style.setProperty('--mx',e.clientX-r.left+'px');g.style.setProperty('--my',e.clientY-r.top+'px')}
if(!still)$$('.shot .box').forEach(b=>{const r=b.getBoundingClientRect();if(r.bottom<0||r.top>innerHeight)return;b.style.setProperty('--ry',((e.clientX-r.left)/r.width-.5)*8+'deg');b.style.setProperty('--rx',-((e.clientY-r.top)/r.height-.5)*8+'deg')})});
function countUp(){if(still)return;$$('.stats b').forEach(b=>{const t=b.textContent,n=parseInt(t),f=t.replace(/\d/g,'');let s0=null;(function st(ts){s0=s0||ts;const k=Math.min(1,(ts-s0)/1400);b.textContent=Math.round(n*(1-Math.pow(1-k,3)))+f;if(k<1)requestAnimationFrame(st)})(performance.now())})}
const C=['Hello, how can I help you today?','Where is the ticket office?','Thank you. Have a good day.'];let ci=0;
if(!still)setInterval(()=>{ci=(ci+1)%C.length;cap.textContent=tr(C[ci])},3200);
/* language */
function apply(){document.documentElement.lang=lang;document.documentElement.dir=lang=='ar'?'rtl':'ltr';
split();const w=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);let n;
while(n=w.nextNode()){if(n.parentElement.closest('[data-skip],[data-sp],script,#mlist'))continue;if(n._en===undefined)n._en=n.nodeValue;const k=n._en.trim();if(AR[k])n.nodeValue=lang=='ar'?n._en.replace(k,AR[k]):n._en}
cap.textContent=tr(C[ci]);build();setActive(cur);langbtn.textContent=lang=='ar'?'English':'العربية';
try{localStorage.setItem('lang',lang)}catch(e){}}
langbtn.onclick=()=>{lang=lang=='ar'?'en':'ar';apply()};apply();
