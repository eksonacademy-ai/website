(function(){'use strict';
var API='https://api.github.com',app=document.getElementById('app'),st={cfg:null,data:null,sha:null,dirty:false,tab:'content'};
function h(t,a){var e=document.createElement(t);a=a||{};for(var k in a){if(k==='on'){for(var ev in a.on)e.addEventListener(ev,a.on[ev])}else if(k==='text')e.textContent=a[k];else if(k in e&&k!=='list')e[k]=a[k];else e.setAttribute(k,a[k])}
 for(var i=2;i<arguments.length;i++){var c=arguments[i];if(c==null)continue;e.appendChild(typeof c==='string'?document.createTextNode(c):c)}return e}
function store(k,v){try{if(v===undefined)return localStorage.getItem(k);localStorage.setItem(k,v)}catch(e){return null}}
function tok(v){try{if(v===undefined)return sessionStorage.getItem('gh_token');if(v===null)sessionStorage.removeItem('gh_token');else sessionStorage.setItem('gh_token',v)}catch(e){return null}}
function gh(path,opt){opt=opt||{};return fetch(API+path,{method:opt.method||'GET',headers:{'Accept':'application/vnd.github+json','Authorization':'Bearer '+tok(),'X-GitHub-Api-Version':'2022-11-28'},body:opt.body?JSON.stringify(opt.body):undefined}).then(function(r){return r.json().catch(function(){return {}}).then(function(j){if(!r.ok){var e=new Error(j.message||('HTTP '+r.status));e.status=r.status;throw e}return j})})}
function b64d(s){var b=atob(s.replace(/\n/g,'')),u=new Uint8Array(b.length);for(var i=0;i<b.length;i++)u[i]=b.charCodeAt(i);return new TextDecoder().decode(u)}
function b64e(s){var u=new TextEncoder().encode(s),b='';for(var i=0;i<u.length;i++)b+=String.fromCharCode(u[i]);return btoa(b)}
function setStatus(t,c){var s=document.getElementById('status');s.textContent=t;s.className='pill '+(c||'')}
window.addEventListener('beforeunload',function(e){if(st.dirty){e.preventDefault();e.returnValue=''}});
document.getElementById('logout').addEventListener('click',function(){tok(null);st.data=null;st.dirty=false;login()});

function login(){
 document.getElementById('logout').hidden=true;setStatus('');app.textContent='';
 var cfg=JSON.parse(store('cfg')||'{}');
 var o=h('input',{value:cfg.owner||'',placeholder:'your-github-username'}),r=h('input',{value:cfg.repo||'',placeholder:'repository name'}),b=h('input',{value:cfg.branch||'main'}),t=h('input',{type:'password',placeholder:'github_pat_...',autocomplete:'off'}),msg=h('p',{className:'mut'});
 var go=h('button',{text:'Connect',on:{click:function(){
  var c={owner:o.value.trim(),repo:r.value.trim(),branch:b.value.trim()||'main'};if(!c.owner||!c.repo||!t.value.trim()){msg.textContent='Fill in all fields.';return}
  tok(t.value.trim());msg.textContent='Connecting…';
  gh('/repos/'+c.owner+'/'+c.repo).then(function(rep){if(!rep.permissions||!rep.permissions.push)throw new Error('This token cannot write to the repo. Give it Contents: Read and write.');store('cfg',JSON.stringify(c));st.cfg=c;return load()}).catch(function(e){tok(null);msg.textContent='Failed: '+e.message})}}});
 app.appendChild(h('div',{className:'card'},h('h2',{text:'Connect to your GitHub repository'}),
  h('p',{className:'mut',text:'Create a fine-grained token at GitHub → Settings → Developer settings → Fine-grained tokens. Select ONLY this repository, permission "Contents: Read and write" (add "Actions: Read" and "Pages: Read" to see deploy status). Set a short expiry. The token stays in this browser tab only and is erased when you close it.'}),
  h('label',{text:'GitHub username / organisation'}),o,h('label',{text:'Repository'}),r,h('label',{text:'Branch'}),b,h('label',{text:'Access token'}),t,h('p',{},go),msg));
}
function load(){return gh('/repos/'+st.cfg.owner+'/'+st.cfg.repo+'/contents/content.json?ref='+encodeURIComponent(st.cfg.branch)).then(function(f){st.sha=f.sha;st.data=JSON.parse(b64d(f.content));st.dirty=false;document.getElementById('logout').hidden=false;setStatus('Connected: '+st.cfg.owner+'/'+st.cfg.repo,'ok');render()})}
function save(btn){
 btn.disabled=true;btn.textContent='Saving…';st.data.site.last_modified=new Date().toISOString().slice(0,10);
 gh('/repos/'+st.cfg.owner+'/'+st.cfg.repo+'/contents/content.json',{method:'PUT',body:{message:'Dashboard: update content',content:b64e(JSON.stringify(st.data,null,1)+'\n'),sha:st.sha,branch:st.cfg.branch}})
 .then(function(r){st.sha=r.content.sha;st.dirty=false;btn.textContent='Saved ✓ – site rebuilds in ~1 minute'}).catch(function(e){btn.textContent='Save changes';alert(e.status===409?'Someone else changed the content. Reload the page and try again.':'Save failed: '+e.message)}).then(function(){btn.disabled=false})}
function dirty(){st.dirty=true}
function field(label,obj,key,opts){opts=opts||{};var i=h(opts.multi?'textarea':'input',{value:obj[key]||''});if(opts.dir)i.className=opts.dir;i.addEventListener('input',function(){obj[key]=i.value;dirty();if(cnt)cnt.textContent=i.value.length+' chars'});var cnt=opts.count?h('div',{className:'cnt',text:(obj[key]||'').length+' chars'}):null;return h('div',{},h('label',{text:label}),i,cnt)}

function tabContent(){var w=h('div',{}),groups={};
 st.data.texts.concat(st.data.ui).forEach(function(t){(groups[t.sec||'Other']=groups[t.sec||'Other']||[]).push(t)});
 w.appendChild(h('p',{className:'mut',text:'Edit English (left) and Arabic (right). Orange outline = Arabic missing. Numbers/brand names can stay the same in both.'}));
 Object.keys(groups).forEach(function(g){var c=h('div',{className:'card'},h('h2',{text:g}));
  groups[g].forEach(function(t){var long=t.en.length>70;var en=h(long?'textarea':'input',{value:t.en}),ar=h(long?'textarea':'input',{value:t.ar||'',className:'ar'});
   function chk(){ar.classList.toggle('miss',!ar.value.trim())}chk();
   en.addEventListener('input',function(){t.en=en.value;dirty()});ar.addEventListener('input',function(){t.ar=ar.value;chk();dirty()});
   c.appendChild(h('div',{className:'row'},h('div',{},h('label',{text:t.id}),en),h('div',{},h('label',{text:'Arabic'}),ar)))});w.appendChild(c)});return w}
function tabSeo(){var S=st.data.site;return h('div',{className:'card'},h('h2',{text:'Site & SEO'}),
 field('Live site URL (must match where it is published, ends with /)',S,'url'),
 h('div',{className:'row'},field('Page title – English (30–60 chars)',S,'title_en',{count:1}),field('Page title – Arabic',S,'title_ar',{dir:'ar'})),
 h('div',{className:'row'},field('Meta description – English (70–160 chars)',S,'description_en',{multi:1,count:1}),field('Meta description – Arabic',S,'description_ar',{multi:1,dir:'ar'})),
 field('Keywords (comma separated)',S,'keywords'),field('Google Search Console verification code (content of the meta tag)',S,'google_verification'),
 h('h3',{text:'Organisation data (shown in Google results)'}),
 h('div',{className:'row'},field('Phone (international format)',S,'phone'),field('Email',S,'email')),
 h('div',{className:'row'},field('Street / area',S,'address_street'),field('City',S,'address_locality')),field('Country code (e.g. EG)',S,'address_country'))}

function item(level,title,detail){var m={ok:'✓',wn:'!',er:'✕',in:'i'};return h('div',{className:'chk'},h('span',{className:'dot '+level,text:m[level]}),h('div',{},h('b',{text:title}),detail?h('div',{className:'mut',text:detail}):null))}
function tabChecks(){var S=st.data.site,box=h('div',{}),seo=h('div',{className:'card'},h('h2',{text:'SEO checklist'})),sec=h('div',{className:'card'},h('h2',{text:'Security checks'}),h('p',{className:'mut',text:'Running live checks…'}));
 var miss=st.data.texts.filter(function(t){return !t.ar||!t.ar.trim()}).length;
 seo.appendChild(item(/YOUR-/.test(S.url)||S.url.slice(0,8)!=='https://'?'er':'ok','Site URL set to the real https address',S.url));
 seo.appendChild(item(S.title_en.length>=30&&S.title_en.length<=60?'ok':'wn','Title length '+S.title_en.length,'Aim for 30–60 characters, with your main keyword near the start.'));
 seo.appendChild(item(S.description_en.length>=70&&S.description_en.length<=160?'ok':'wn','Description length '+S.description_en.length,'Aim for 70–160 characters; this is the snippet people see in Google.'));
 seo.appendChild(item(miss?'wn':'ok','Arabic translation',miss?miss+' text(s) missing Arabic':'All texts have Arabic'));
 seo.appendChild(item(S.google_verification?'ok':'in','Google Search Console verification',S.google_verification?'Code present':'Optional: add the code, or verify through DNS/HTML file instead.'));
 seo.appendChild(item('in','Do these once','1) Search Console → add property → submit '+S.url+'sitemap.xml  2) Request indexing of the home page  3) Add the site link to your social profiles / EKSON site (backlinks help ranking).'));
 var base=location.pathname.replace(/admin\/?(index\.html)?$/,'');
 var out=[];function add(l,t,d){out.push(item(l,t,d))}
 add(location.protocol==='https:'?'ok':'er','Dashboard served over HTTPS',location.origin);
 var jobs=[fetch(base+'index.html',{cache:'no-store'}).then(function(r){return r.text()}).then(function(t){
   add(/Content-Security-Policy/.test(t)?'ok':'er','Content-Security-Policy present on the home page');
   var inl=(t.match(/<script(?![^>]*\bsrc=)(?![^>]*ld\+json)[^>]*>/g)||[]).length;add(inl?'er':'ok','No inline scripts',inl?inl+' found':'Blocks most XSS attacks');
   add(/\son[a-z]+=\s*"/.test(t)?'er':'ok','No inline event handlers');
   add(/rel="canonical"/.test(t)&&/application\/ld\+json/.test(t)?'ok':'wn','Canonical + structured data present')}),
  fetch(base+'robots.txt').then(function(r){return r.text().then(function(t){add(r.ok&&/Disallow: \/admin\//.test(t)&&/Sitemap:/.test(t)?'ok':'wn','robots.txt blocks /admin/ and lists the sitemap')})}),
  fetch(base+'sitemap.xml').then(function(r){add(r.ok?'ok':'er','sitemap.xml reachable')}),
  gh('/repos/'+st.cfg.owner+'/'+st.cfg.repo+'/pages').then(function(p){add(p.https_enforced?'ok':'er','"Enforce HTTPS" is on in Pages settings')}).catch(function(){add('in','Could not read Pages settings','Token needs "Pages: Read" for this check.')}),
  gh('/repos/'+st.cfg.owner+'/'+st.cfg.repo+'/actions/runs?per_page=1').then(function(r){var x=r.workflow_runs&&r.workflow_runs[0];add(!x?'in':x.conclusion==='success'?'ok':x.status==='completed'?'er':'wn','Last deploy: '+(x?(x.conclusion||x.status):'none yet'),x?x.html_url:'')}).catch(function(){add('in','Could not read deploy status','Token needs "Actions: Read".')})];
 Promise.all(jobs.map(function(p){return p.catch(function(e){add('wn','A check failed',e.message)})})).then(function(){
  add('wn','This dashboard page is public','Anyone can open /admin/, but nobody can change anything without your GitHub token. If you prefer, delete the admin folder and edit content.json directly on GitHub instead.');
  add('in','Token hygiene','Use a fine-grained token limited to this repo, 30–90 day expiry; revoke it in GitHub settings if a device is lost. Turn on two-factor authentication for your GitHub account and enable branch protection if several people edit.');
  add('in','Limits of GitHub Pages','Pages cannot send custom HTTP headers (HSTS, X-Frame-Options). The CSP meta tag covers scripts; for full headers put Cloudflare (free) in front of a custom domain.');
  sec.textContent='';sec.appendChild(h('h2',{text:'Security checks'}));out.forEach(function(x){sec.appendChild(x)})});
 box.appendChild(seo);box.appendChild(sec);return box}
function tabHelp(){return h('div',{className:'card'},h('h2',{text:'How it works'}),
 h('p',{text:'Editing here saves content.json to GitHub. GitHub Actions rebuilds the website automatically and publishes it in about a minute. Text stays in the HTML so Google can read it.'}),
 h('p',{text:'To change images, upload new files with the same names into assets/img on GitHub (logo.png, hero.webp, 3dof-simulator.webp, 2dof-simulator.webp, ai-sign-avatar.webp). Keep alt text accurate for SEO.'}),
 h('p',{text:'Changing the page layout or adding sections: edit index.template.html (placeholders look like {{t012}}) and add matching entries to content.json.'}))}
var TABS=[['content','Content'],['seo','Site & SEO'],['checks','Security & SEO checks'],['help','Help']];
function render(){app.textContent='';var tabs=h('div',{className:'tabs'});
 TABS.forEach(function(t){tabs.appendChild(h('button',{text:t[1],className:st.tab===t[0]?'on':'',on:{click:function(){st.tab=t[0];render()}}}))});app.appendChild(tabs);
 app.appendChild({content:tabContent,seo:tabSeo,checks:tabChecks,help:tabHelp}[st.tab]());
 if(st.tab==='content'||st.tab==='seo'){var b=h('button',{text:'Save changes'});b.addEventListener('click',function(){save(b)});app.appendChild(h('div',{className:'bar'},b,h('span',{className:'mut',text:'Saving publishes the site.'})))}}
if(tok()){var c=JSON.parse(store('cfg')||'null');if(c){st.cfg=c;load().catch(function(){tok(null);login()})}else login()}else login();
})();
