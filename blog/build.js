/* felipeparisinteriors.com blog builder. Runs in a browser tab on github.com.
   FPBLOG.prepare(post) -> fetches the current blog data from the repo, adds `post`, renders
   the article pages (4 languages), the 4 blog index pages and sitemap.xml, and stores every
   file to upload in sessionStorage under "fpblog" as {dir: {filename: content}}.
   FPBLOG.upload(dir) -> on https://github.com/felipeparis-hub/felipeparisinteriors/upload/main/<dir>,
   attaches that directory's files to the upload form (then click "Commit changes"). */
(function(){
const RAW='https://raw.githubusercontent.com/felipeparis-hub/felipeparisinteriors/main/';
const DOM='https://felipeparisinteriors.com', WA='34651059366', LANGS=['es','en','fr','it'];
const HOME={es:'/',en:'/en/',fr:'/fr/',it:'/it/'}; const BLOG={}; LANGS.forEach(l=>BLOG[l]=HOME[l]+'blog/');
const UI={
 es:{blog:'Blog',home:'Inicio',prices:'Precios',contact:'Contacto',idxT:'Blog de interiorismo',idxS:'en Marbella',idxD:'Ideas, guías y consejos para amueblar y decorar villas y apartamentos en Marbella y la Costa del Sol.',read:'Leer artículo',min:'min de lectura',by:'Por Felipe Paris, interiorista en Marbella',back:'Todos los artículos',ctaT:'¿Hablamos de tu casa?',ctaP:'Te preparo una primera propuesta para tu villa o apartamento, en tu idioma.',call:'Llámame',waTxt:'Hola Felipe, he leído tu blog y me gustaría hablar de mi casa.',foot:'Interiorismo integral en Marbella y la Costa del Sol',more:'Más artículos',loc:'es_ES',months:['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre']},
 en:{blog:'Blog',home:'Home',prices:'Pricing',contact:'Contact',idxT:'Interior design journal',idxS:'Marbella',idxD:'Ideas, guides and advice for furnishing and decorating villas and apartments in Marbella and on the Costa del Sol.',read:'Read article',min:'min read',by:'By Felipe Paris, interior designer in Marbella',back:'All articles',ctaT:'Shall we talk about your home?',ctaP:'I will prepare a first proposal for your villa or apartment, in your language.',call:'Call Me',waTxt:"Hi Felipe, I read your blog and I'd like to talk about my home.",foot:'Complete interior design in Marbella and on the Costa del Sol',more:'More articles',loc:'en_GB',months:['January','February','March','April','May','June','July','August','September','October','November','December']},
 fr:{blog:'Blog',home:'Accueil',prices:'Tarifs',contact:'Contact',idxT:"Journal d'intérieur",idxS:'à Marbella',idxD:'Idées, guides et conseils pour meubler et décorer villas et appartements à Marbella et sur la Costa del Sol.',read:"Lire l'article",min:'min de lecture',by:"Par Felipe Paris, décorateur d'intérieur à Marbella",back:'Tous les articles',ctaT:'Parlons de votre maison ?',ctaP:'Je vous prépare une première proposition pour votre villa ou appartement, dans votre langue.',call:"M'appeler",waTxt:"Bonjour Felipe, j'ai lu votre blog et j'aimerais parler de ma maison.",foot:'Décoration intérieure complète à Marbella et sur la Costa del Sol',more:"Plus d'articles",loc:'fr_FR',months:['janvier','février','mars','avril','mai','juin','juillet','août','septembre','octobre','novembre','décembre']},
 it:{blog:'Blog',home:'Home',prices:'Prezzi',contact:'Contatti',idxT:"Diario d'interni",idxS:'a Marbella',idxD:'Idee, guide e consigli per arredare e decorare ville e appartamenti a Marbella e sulla Costa del Sol.',read:"Leggi l'articolo",min:'min di lettura',by:'Di Felipe Paris, interior designer a Marbella',back:'Tutti gli articoli',ctaT:'Parliamo della tua casa?',ctaP:'Ti preparo una prima proposta per la tua villa o il tuo appartamento, nella tua lingua.',call:'Chiamami',waTxt:'Ciao Felipe, ho letto il tuo blog e vorrei parlare della mia casa.',foot:'Interior design completo a Marbella e sulla Costa del Sol',more:'Altri articoli',loc:'it_IT',months:['gennaio','febbraio','marzo','aprile','maggio','giugno','luglio','agosto','settembre','ottobre','novembre','dicembre']}};
const LOGO='<svg viewBox="0 0 48 60" aria-hidden="true"><path d="M6 58V24a18 18 0 0 1 36 0v34"/><text x="24" y="46" text-anchor="middle">fp</text></svg>';
const IWA='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M4 20l1.3-3.9A8 8 0 1 1 8 19z"/><path d="M9.5 9.5c.3 1.8 1.7 3.6 3.7 4.6"/></svg>';
const ITEL='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2"/></svg>';
const HEADX='<link rel="icon" href="/favicon.ico" sizes="any"><link rel="icon" type="image/png" sizes="192x192" href="/favicon-192.png"><link rel="apple-touch-icon" href="/apple-touch-icon.png">\n<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;500;600&family=Instrument+Serif:ital@0;1&display=swap">\n<link rel="stylesheet" href="/blog/blog.css">';
const esc=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#x27;');
const inline=s=>esc(s).replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>').replace(/\[([^\]]+)\]\(([^)\s]+)\)/g,'<a href="$2">$1</a>');
function md(text){const out=[];let para=[],lst=null;
 const flush=()=>{if(para.length){out.push('<p>'+inline(para.join(' '))+'</p>');para=[];}
  if(lst){out.push('<'+lst.k+'>'+lst.items.map(i=>'<li>'+inline(i)+'</li>').join('')+'</'+lst.k+'>');lst=null;}};
 for(const raw of text.split('\n')){const ln=raw.replace(/\s+$/,'');let m;
  if(!ln.trim()){flush();continue;}
  if((m=ln.match(/^(#{2,3})\s+(.*)/))){flush();const h=m[1].length===2?'h2':'h3';out.push('<'+h+'>'+inline(m[2])+'</'+h+'>');continue;}
  if((m=ln.match(/^\s*(?:[-*]|(\d+)\.)\s+(.*)/))){if(para.length)flush();const k=m[1]?'ol':'ul';if(lst&&lst.k!==k)flush();if(!lst)lst={k,items:[]};lst.items.push(m[2]);continue;}
  if((m=ln.match(/^>\s+(.*)/))){flush();out.push('<blockquote><p>'+inline(m[1])+'</p></blockquote>');continue;}
  if(lst)flush();para.push(ln.trim());}
 flush();return out.join('\n');}
const words=t=>(t.match(/[\p{L}\p{N}_]+/gu)||[]).length;
function fdate(d,l){const [y,m,dd]=d.split('-').map(Number);const mo=UI[l].months[m-1];return l==='en'?`${mo} ${dd}, ${y}`:`${dd} ${mo} ${y}`;}
const urlPost=(l,p)=>BLOG[l]+p.langs[l].slug+'.html';
function header(l,alts){const u=UI[l];
 const sw=LANGS.map(x=>`<a href="${alts[x]}" hreflang="${x}" lang="${x}"${x===l?' aria-current="true"':''}>${x.toUpperCase()}</a>`).join('');
 return `<header class="top"><a class="logo" href="${HOME[l]}" aria-label="Felipe Paris">${LOGO}<span class="wm"><b>FELIPE PARIS</b><i>Maison d'intérieurs · Marbella</i></span></a><nav class="menu"><a href="${HOME[l]}">${u.home}</a><a href="${BLOG[l]}">${u.blog}</a><a href="${HOME[l]}#precios">${u.prices}</a><a href="${HOME[l]}#contacto">${u.contact}</a></nav><div class="lang">${sw}</div></header>`;}
function cta(l){const u=UI[l];return `<aside class="cta"><h2>${esc(u.ctaT)}</h2><p>${esc(u.ctaP)}</p><div class="row"><a class="btn solid" href="https://wa.me/${WA}?text=${encodeURIComponent(u.waTxt)}" target="_blank" rel="noopener">${IWA}<span>WhatsApp</span></a><a class="btn" href="tel:+${WA}">${ITEL}<span>${u.call}</span></a></div></aside>`;}
const footer=l=>`<footer class="foot"><a class="logo" href="${HOME[l]}">${LOGO}<span class="wm"><b>FELIPE PARIS</b></span></a><p>${esc(UI[l].foot)} · <a href="https://wa.me/${WA}">+34 651 05 93 66</a></p></footer>`;
function page(l,title,desc,canon,alts,body,ld,type){
 const al=LANGS.map(x=>`<link rel="alternate" hreflang="${x}" href="${DOM}${alts[x]}">`).join('')+`<link rel="alternate" hreflang="x-default" href="${DOM}${alts.es}">`;
 return `<!doctype html>\n<html lang="${l}">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width,initial-scale=1">\n<title>${esc(title)}</title>\n<meta name="description" content="${esc(desc)}">\n<link rel="canonical" href="${DOM}${canon}">\n${al}\n<meta property="og:type" content="${type||'website'}"><meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(desc)}"><meta property="og:url" content="${DOM}${canon}"><meta property="og:image" content="${DOM}/assets/despues.jpg"><meta property="og:locale" content="${UI[l].loc}">\n<meta name="theme-color" content="#0E1A2E">\n${HEADX}\n<script type="application/ld+json">${JSON.stringify(ld).replace(/</g,'\\u003c')}</script>\n</head>\n<body>\n${header(l,alts)}\n<main>${body}</main>\n${footer(l)}\n</body>\n</html>\n`;}
function renderPost(p,posts){const alts={};LANGS.forEach(l=>alts[l]=urlPost(l,p));const files={};
 for(const l of LANGS){const c=p.langs[l],u=UI[l];const mins=Math.max(2,Math.round(words(c.body)/220));
  const others=posts.filter(q=>q.id!==p.id).slice(0,2);
  const rel=others.map(q=>`<a class="card" href="${urlPost(l,q)}"><span class="d">${fdate(q.date,l)}</span><h3>${esc(q.langs[l].title)}</h3><p>${esc(q.langs[l].description)}</p></a>`).join('');
  const body=`<article class="post"><nav class="crumb"><a href="${BLOG[l]}">← ${u.back}</a></nav><header class="ph"><p class="meta"><time datetime="${p.date}">${fdate(p.date,l)}</time> · ${mins} ${u.min}</p><h1>${esc(c.title)}</h1><p class="lead">${esc(c.description)}</p><p class="by">${u.by}</p></header><div class="prose">${md(c.body)}</div>${cta(l)}</article>`+(rel?`<section class="more"><h2>${u.more}</h2><div class="grid">${rel}</div></section>`:'');
  const ld={"@context":"https://schema.org","@graph":[{"@type":"BlogPosting",headline:c.title,description:c.description,datePublished:p.date,dateModified:p.updated||p.date,inLanguage:l,mainEntityOfPage:DOM+alts[l],image:DOM+'/assets/despues.jpg',author:{"@type":"Person",name:"Felipe Paris",url:DOM+HOME[l]},publisher:{"@type":"Organization",name:"Felipe Paris · Maison d'intérieurs",logo:{"@type":"ImageObject",url:DOM+'/favicon-192.png'}}},{"@type":"BreadcrumbList",itemListElement:[{"@type":"ListItem",position:1,name:u.home,item:DOM+HOME[l]},{"@type":"ListItem",position:2,name:u.blog,item:DOM+BLOG[l]},{"@type":"ListItem",position:3,name:c.title,item:DOM+alts[l]}]}]};
  files[alts[l].slice(1)]=page(l,c.title+' · Felipe Paris',c.description,alts[l],alts,body,ld,'article');}
 return files;}
function renderIndexes(posts){const files={};
 for(const l of LANGS){const u=UI[l];
  const cards=posts.map(p=>`<a class="card" href="${urlPost(l,p)}"><span class="d">${fdate(p.date,l)}</span><h2>${esc(p.langs[l].title)}</h2><p>${esc(p.langs[l].description)}</p><span class="go">${u.read} →</span></a>`).join('');
  const body=`<section class="bh"><h1>${u.idxT} <span class="s">${u.idxS}</span></h1><p>${esc(u.idxD)}</p></section><section class="list">${cards}</section>${cta(l)}`;
  const ld={"@context":"https://schema.org","@type":"Blog",name:`${u.idxT} ${u.idxS} · Felipe Paris`,url:DOM+BLOG[l],inLanguage:l,blogPost:posts.map(p=>({"@type":"BlogPosting",headline:p.langs[l].title,url:DOM+urlPost(l,p),datePublished:p.date}))};
  files[BLOG[l].slice(1)+'index.html']=page(l,`${u.idxT} ${u.idxS} · Felipe Paris`,u.idxD,BLOG[l],BLOG,body,ld);}
 return files;}
function renderSitemap(posts){const e=(loc,alts,lm)=>`<url><loc>${DOM}${loc}</loc><lastmod>${lm}</lastmod>`+LANGS.map(x=>`<xhtml:link rel="alternate" hreflang="${x}" href="${DOM}${alts[x]}"/>`).join('')+'</url>';
 const last=posts.length?posts[0].date:new Date().toISOString().slice(0,10);let xs=LANGS.map(l=>e(HOME[l],HOME,'2026-10-26')).concat(LANGS.map(l=>e(BLOG[l],BLOG,last)));
 for(const p of posts){const alts={};LANGS.forEach(l=>alts[l]=urlPost(l,p));xs=xs.concat(LANGS.map(l=>e(alts[l],alts,p.updated||p.date)));}
 return '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">'+xs.join('')+'</urlset>\n';}
async function getJSON(path,fallback){const r=await fetch(RAW+path+'?t='+Date.now(),{cache:'no-store'});if(!r.ok){if(fallback!==undefined)return fallback;throw new Error(path+' '+r.status);}return r.json();}
function check(p){if(!p||!p.id||!/^\d{4}-\d{2}-\d{2}$/.test(p.date||''))throw new Error('post needs id and date YYYY-MM-DD');
 for(const l of LANGS){const c=p.langs&&p.langs[l];if(!c||!c.slug||!c.title||!c.description||!c.body)throw new Error('missing '+l);if(!/^[a-z0-9-]+$/.test(c.slug))throw new Error('bad slug '+l);if(words(c.body)<500)throw new Error('body too short '+l);}}
async function prepare(post,usedTopic){check(post);
 const ids=await getJSON('blog/posts.json',[]);const posts=[];
 for(const id of ids){if(id!==post.id)posts.push(await getJSON('blog/post-'+id+'.json'));}
 posts.push(post);posts.sort((a,b)=>b.date.localeCompare(a.date));
 const newIds=posts.map(p=>p.id);
 const out=Object.assign({},renderPost(post,posts),renderIndexes(posts));out['sitemap.xml']=renderSitemap(posts);
 out['blog/posts.json']=JSON.stringify(newIds);out['blog/post-'+post.id+'.json']=JSON.stringify(post,null,1);
 if(usedTopic!==undefined){const topics=await getJSON('blog/topics.json',[]);out['blog/topics.json']=JSON.stringify(topics.filter(t=>t!==usedTopic),null,1);}
 const byDir={};for(const [path,content] of Object.entries(out)){const i=path.lastIndexOf('/');const dir=i<0?'':path.slice(0,i);(byDir[dir]=byDir[dir]||{})[path.slice(i+1)]=content;}
 sessionStorage.setItem('fpblog',JSON.stringify(byDir));
 return Object.fromEntries(Object.entries(byDir).map(([d,f])=>[d||'(root)',Object.keys(f)]));}
function upload(dir){const byDir=JSON.parse(sessionStorage.getItem('fpblog')||'{}');const files=byDir[dir];if(!files)throw new Error('nothing for '+dir);
 const dt=new DataTransfer();for(const [n,c] of Object.entries(files)){const t=n.endsWith('.html')?'text/html':n.endsWith('.json')?'application/json':n.endsWith('.css')?'text/css':n.endsWith('.xml')?'application/xml':'text/plain';dt.items.add(new File([c],n,{type:t}));}
 const inp=document.querySelector('input[type=file]');inp.files=dt.files;inp.dispatchEvent(new Event('change',{bubbles:true}));return Object.keys(files);}
async function verify(){const byDir=JSON.parse(sessionStorage.getItem('fpblog')||'{}');const bad=[];
 for(const [dir,files] of Object.entries(byDir))for(const [n,c] of Object.entries(files)){const p=(dir?dir+'/':'')+n;const r=await fetch(RAW+p+'?t='+Date.now(),{cache:'no-store'});const t=r.ok?await r.text():'';if(t!==c)bad.push(p);}
 return bad.length?{ok:false,mismatched:bad}:{ok:true};}
window.FPBLOG={prepare,upload,verify,dirs:()=>Object.keys(JSON.parse(sessionStorage.getItem('fpblog')||'{}'))};
})();
