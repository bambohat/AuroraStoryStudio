/* Aurora Story Studio — mobile-first MVP, rebuilt for touch, readability and low-friction use. */

const STORAGE_KEY = 'aurora_story_studio_v2';
const palette = {
  Aurora: ['#a855f7','#7c3aed'], Ocean: ['#38bdf8','#2563eb'], Emerald: ['#34d399','#059669'],
  Crimson: ['#fb7185','#e11d48'], Amber: ['#fbbf24','#d97706'], Rose: ['#fb7185','#be185d'], Mono: ['#d4d4d8','#71717a']
};
const themeLabels = { dark:'Dark', system:'System', light:'Light' };

const builtInStyles = [
  {id:'balanced',name:'Aurora Balanced',desc:'Concrete, readable and flexible for long fiction.',tags:['natural','clear','adaptive'],preview:'Concrete action, selective detail, natural dialogue.'},
  {id:'quiet',name:'Quiet Literary',desc:'Restrained description, subtext-heavy dialogue and close observation.',tags:['restrained','subtext','intimate'],preview:'He waited. She said nothing. Neither filled the silence.'},
  {id:'epic',name:'Epic Weight',desc:'Larger scale and stronger atmosphere without decorative overload.',tags:['epic','grand','controlled'],preview:'The valley opened below the road, broad enough to swallow the last house.'},
  {id:'fast',name:'Fast Modern',desc:'Lean paragraphs, active dialogue and quick scene movement.',tags:['fast','lean','dialogue'],preview:'He opened the door. Empty room. The phone rang behind him.'},
  {id:'cultivation',name:'Cultivation Chronicle',desc:'Mature progression, world history, calm power and earned reveals.',tags:['cultivation','mature','worldbuilding'],preview:'Ruin set the cup down. The old man finally stopped pretending not to know him.'}
];

function now(){return new Date().toISOString();}
function uid(prefix='id'){return prefix+'_'+Date.now().toString(36)+Math.random().toString(36).slice(2,7);}
function deepClone(v){return JSON.parse(JSON.stringify(v));}
function esc(v){return String(v ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));}
function words(text){return String(text||'').trim().split(/\s+/).filter(Boolean).length;}

const defaultState = {
  settings:{accent:'Aurora',theme:'dark',fontScale:1,api:{provider:'NanoGPT',endpoint:'https://nano-gpt.com/api/v1/chat/completions',key:'',model:'deepseek-v4-pro'},budget:{periodLabel:'$3 / 14 days',limit:3},tips:true},
  activeView:'library',activeStoryId:'demo',
  stories:[{
    id:'demo',title:"The Immortal's Retirement",genre:'Cultivation / Fantasy',status:'Draft',progress:42,words:1240,chapterCount:1,
    concept:'A 3,000-year-old immortal leaves the upper realms behind and settles anonymously in a remote lower realm, expecting an ordinary life.',
    premise:'An exhausted immortal emperor chooses quiet life over glory, but the people around him slowly pull him into a world whose small problems have larger roots.',
    styleId:'cultivation',pov:'Third Person Limited',aiWritesUser:true,storyMode:'novel',
    projectNote:'Let Aurora handle the structure. You only need to tell it what you want next.',
    characters:[
      {id:'c1',name:'Ruin',role:'Protagonist',type:'character',desc:'Ancient immortal emperor. Calm, observant, quietly humorous. Wants an ordinary life and avoids unnecessary displays of power.',visual:'Tall mature man; understated dark robes; composed face; silver-black hair; relaxed posture.',details:{voice:'Dry, economical, rarely performs emotion.',goals:'Live anonymously; understand ordinary life.',fears:'Being dragged back into upper-realm politics.',knowledge:'Knows the upper realms intimately; knows little about local village politics.'}},
      {id:'c2',name:'Mira',role:'Village Healer',type:'character',desc:'Practical village healer. Blunt, curious and suspicious of people who seem too capable.',visual:'Young adult woman; practical linen clothing; dark braided hair; focused eyes.',details:{voice:'Direct and practical.',goals:'Keep the village healthy.',fears:'Hidden dangers reaching the villagers.',knowledge:'Local terrain, village politics, basic cultivation.'}},
      {id:'c3',name:'Old Jian',role:'Merchant',type:'character',desc:'Talkative local merchant who sees every problem as either business or gossip.',visual:'Older man; round spectacles; travel-worn coat; expressive hands.',details:{voice:'Talkative, teasing, observant.',goals:'Profit and interesting gossip.',fears:'Missing a profitable opportunity.',knowledge:'Trade routes and provincial rumors.'}}
    ],
    locations:[
      {id:'l1',name:'Cloudreed Village',type:'location',desc:'Small lower-realm settlement surrounded by reed fields and distant mountains.',details:'A quiet village whose routines hide connections to older cultivation routes.'},
      {id:'l2',name:'Old North Road',type:'location',desc:'A trade road connecting the village to a provincial city.',details:'Poorly maintained but still active with merchants and travelers.'}
    ],
    factions:[{id:'f1',name:'Reed Valley Sect',type:'faction',desc:'A minor cultivation sect that treats the village as its outer territory.',details:'Proud of its local authority, unaware of Ruin\'s real identity.'}],
    items:[{id:'i1',name:'Plain Iron Bell',type:'item',desc:'A cheap bell Ruin keeps above his door.',details:'Ordinary object; useful as a recurring symbol of his quiet life.'}],
    rules:[{id:'r1',name:'Upper-Realm Secrecy',type:'rule',desc:'Ruin\'s identity should not be casually discovered. His power is obvious only when he chooses to reveal it.',details:'Hard story truth.'}],
    acts:[
      {id:'a1',title:'Act I — The Quiet Life',pct:20,chapters:[{id:'ch1',title:'The House at the Edge',summary:'Ruin arrives, repairs an old house and meets the village healer. The chapter establishes his quiet routine and the first sign that the village sits on something unusual.',scenes:[{id:'s1',title:'Arrival',objective:'Establish the protagonist and the quiet-life premise.',text:'Ruin stopped at the end of the north road and looked over Cloudreed Village. The houses were small. The fields were green. Nobody bowed.\n\nHe liked that.\n\nA broken cart sat beside the road. A woman was arguing with the driver while three villagers watched. Ruin considered walking past.\n\nThen the wheel came loose.\n\nHe sighed, picked it up, and carried it toward them.'}]}]},
      {id:'a2',title:'Act II — Small Problems',pct:55,chapters:[{id:'ch2',title:'The Village Bell',summary:'Ruin settles into a routine. A small local problem reveals a thread leading toward the sect.',scenes:[{id:'s2',title:'A Curious Sound',objective:'Create a small, character-driven disturbance with wider implications.',text:''}]}]},
      {id:'a3',title:'Act III — What Sleeps Below',pct:85,chapters:[]}
    ],
    branches:[],versions:[],swipes:{},notes:[],
    taste:{likes:['concrete action','restrained sensory detail'],dislikes:['generic LLM phrasing'],confidence:{'concrete action':2,'restrained sensory detail':2,'generic LLM phrasing':2},learning:true,snapshot:null,history:[]},
    customAuthorProfiles:[]
  }],
  ui:{tourSeen:false}
};

let state = loadState();
let ui = {modal:null,reader:null,editor:null,swipeIndex:0,candidates:[],pendingConfirm:null,settingsDraft:null};

function mergeState(parsed){
  const out=deepClone(defaultState);
  if(!parsed)return out;
  Object.assign(out,parsed);
  out.settings={...defaultState.settings,...(parsed.settings||{}),api:{...defaultState.settings.api,...((parsed.settings||{}).api||{})},budget:{...defaultState.settings.budget,...((parsed.settings||{}).budget||{})}};
  out.stories=Array.isArray(parsed.stories)&&parsed.stories.length?parsed.stories:out.stories;
  out.activeStoryId=parsed.activeStoryId||out.stories[0].id;
  return out;
}
function loadState(){try{return mergeState(JSON.parse(localStorage.getItem(STORAGE_KEY)||'null'));}catch{return deepClone(defaultState);}}
function saveState(){localStorage.setItem(STORAGE_KEY,JSON.stringify(state));}
function story(){return state.stories.find(s=>s.id===state.activeStoryId)||state.stories[0];}
function applyTheme(){
  const root=document.documentElement, p=palette[state.settings.accent]||palette.Aurora;
  root.style.setProperty('--accent',p[0]); root.style.setProperty('--accent-2',p[1]); root.style.setProperty('--font-scale',state.settings.fontScale||1);
  root.dataset.theme=state.settings.theme||'dark';
}
function toast(msg){const t=document.getElementById('toast');if(!t)return;t.textContent=msg;t.classList.add('show');clearTimeout(toast._t);toast._t=setTimeout(()=>t.classList.remove('show'),2300);}
function setView(v){ui.reader=null;ui.editor=null;ui.modal=null;state.activeView=v;saveState();render();window.scrollTo({top:0,behavior:'smooth'});}
function tip(label,text){return state.settings.tips?`<button class="tip-btn" data-action="tip" data-tip="${esc(text)}" aria-label="What is ${esc(label)}?">?</button>`:'';}
function pageIntro(kicker,title,desc,action='',actionLabel=''){
  return `<section class="page-head"><div><div class="eyebrow">${esc(kicker)}</div><div class="title-row"><h1>${esc(title)}</h1>${tip(title,desc)}</div><p>${esc(desc)}</p></div>${action?`<button class="btn primary" data-action="${action}">${esc(actionLabel)}</button>`:''}</section>`;
}
function render(){
  applyTheme();
  document.querySelectorAll('.nav-item').forEach(b=>b.classList.toggle('active',b.dataset.view===state.activeView));
  const root=document.getElementById('view');
  if(state.activeView==='library')root.innerHTML=renderLibrary();
  else if(state.activeView==='story')root.innerHTML=renderStory();
  else if(state.activeView==='write')root.innerHTML=renderWrite();
  else if(state.activeView==='codex')root.innerHTML=renderCodex();
  else if(state.activeView==='plan')root.innerHTML=renderPlan();
  else root.innerHTML=renderMore();
  bindActions();
  renderOverlays();
}

function renderLibrary(){
  return pageIntro('Private AI Story Studio','Create stories without the busywork','Start with a rough idea. Aurora builds the concept, characters, world, Codex and outline for you.','newStory','✨ New concept')+
  `<div class="tip-banner"><div><strong>Start with an idea, not a form.</strong><div class="muted">You can type one sentence, a messy paragraph, or even half an idea.</div></div>${tip('Quick build','Quick Build turns a rough idea into a usable story foundation. You can change everything later.')}</div>`+
  `<div class="section-title row"><strong>My Stories</strong><span class="tiny">${state.stories.length} project${state.stories.length===1?'':'s'}</span></div><div class="grid">${state.stories.map(renderStoryCard).join('')}</div>`+
  `<div class="section-title">What Aurora handles for you</div><div class="grid two">${infoCard('🧠','Memory','Old chapters become compact story memory. The manuscript remains untouched.','The memory engine stores facts separately so a 100-chapter story does not need to send all 100 chapters every time.')}${infoCard('✍','Your taste','Your edits, swipes and approvals teach the engine your preferences.','Your taste can be saved, frozen, rolled back or reset.')}${infoCard('↗','Safe branches','Try a completely different plot without changing the main story.','Branches are non-canon until you promote one.')}${infoCard('✨','AI Director','When you do not know what to write, Aurora proposes useful directions.','You choose a direction or ask Aurora to surprise you.')}</div>`;
}
function infoCard(icon,title,short,long){return `<article class="card soft feature-card"><div class="kpi">${icon}</div><div class="row"><h3>${esc(title)}</h3>${tip(title,long)}</div><div class="muted">${esc(short)}</div></article>`;}
function renderStoryCard(s){return `<article class="card story-card clickable" data-action="openStory" data-id="${s.id}"><div class="row"><span class="pill">${esc(s.genre)}</span><span class="tiny">${esc(s.status)}</span></div><h3>${esc(s.title)}</h3><div class="story-meta">${s.chapterCount} chapter${s.chapterCount===1?'':'s'} · ${words(s.acts?.flatMap(a=>a.chapters.flatMap(c=>c.scenes.map(sc=>sc.text||'')).join(' ')).join(' ')).toLocaleString()} words</div><div class="progress"><span style="width:${Math.min(100,s.progress||0)}%"></span></div><div class="row"><span class="tiny">${s.progress||0}% foundation</span><button class="btn primary small" data-action="openStory" data-id="${s.id}">Open story</button></div></article>`;}

function renderStory(){
  const s=story(), chap=firstChapter(s), scene=firstScene(s);
  return pageIntro('Story workspace',s.title,`${s.genre} · ${s.pov}`,'storyMenu','⋯')+
  `<div class="hero-story card"><div class="row"><div><span class="pill">Current scene</span><h2>Chapter ${chapterNumber(s,chap)} — ${esc(chap?.title||'Untitled')}</h2><p class="muted">${esc(chap?.summary||'No summary yet.')}</p></div><div class="kpi">${s.progress||0}%</div></div><div class="progress"><span style="width:${Math.min(100,s.progress||0)}%"></span></div><div class="hero-actions"><button class="btn primary" data-action="openScene" data-scene="${scene?.id||''}">📖 Open reader</button><button class="btn" data-action="openPlan">☷ Outline</button><button class="btn" data-action="director">✨ Guide me</button></div></div>`+
  `<div class="section-title">Your story at a glance</div><div class="grid two">${navCard('◈','Codex',`${countCodex(s)} entries`,`Keep characters, locations, factions, items and rules together.`,'codex')}${navCard('☷','Outline',`${countChapters(s)} chapters planned`,`Acts → chapters → scenes, with objectives and summaries.`,'plan')}${navCard('◒','Author & taste',styleName(s),`The selected author voice and your personal taste are applied automatically.`,'authors')}${navCard('↗','Branches',`${s.branches.length} experiments`,`Test alternate plot decisions without touching canon.`,'branches')}</div>`+
  `<div class="section-title row"><strong>Recent structure</strong><button class="btn small" data-action="openSynopsis">Read story synopsis</button></div><div class="card"><div class="stack compact"><div class="stat-row"><span>Concept</span><strong>${esc(s.concept)}</strong></div><div class="stat-row"><span>Premise</span><strong>${esc(s.premise)}</strong></div><div class="stat-row"><span>POV</span><strong>${esc(s.pov)}</strong></div><div class="stat-row"><span>AI writes your actions</span><strong>${s.aiWritesUser?'Yes':'No'}</strong></div></div></div>`;
}
function navCard(icon,title,value,desc,target){return `<button class="card soft nav-card" data-action="${esc(target)}"><div class="kpi">${icon}</div><div class="row"><h3>${esc(title)}</h3>${tip(title,desc)}</div><strong>${esc(value)}</strong><div class="muted">${esc(desc)}</div></button>`;}
function firstChapter(s){return s.acts?.flatMap(a=>a.chapters)[0]||null;}
function firstScene(s){return firstChapter(s)?.scenes?.[0]||null;}
function chapterNumber(s,chap){let n=0;for(const a of s.acts||[])for(const c of a.chapters||[]){n++;if(c===chap)return n;}return 1;}
function countChapters(s){return (s.acts||[]).reduce((n,a)=>n+(a.chapters||[]).length,0);}
function countCodex(s){return ['characters','locations','factions','items','rules'].reduce((n,k)=>n+(s[k]?.length||0),0);}

function renderCodex(){
  const s=story(),groups=[['Characters','characters','character','👤'],['Locations','locations','location','⌖'],['Factions','factions','faction','⚑'],['Items','items','item','◇'],['Rules','rules','rule','✓']];
  return pageIntro('Story brain','Codex','Aurora keeps your world organized and connected to the manuscript. Tap any entry to read or edit it.','newCodex','＋ Add')+
  `<div class="tip-banner compact-tip"><span>New here? <strong>Characters</strong> are people, <strong>Locations</strong> are places, <strong>Rules</strong> are hard truths. You can always use natural language.</span>${tip('Codex','Codex is your persistent world reference. Aurora can create entries from rough descriptions and can later discover missing entries from your manuscript.')}</div>`+
  `<div class="field"><label>Search the world</label><div class="search-wrap"><span>⌕</span><input id="codexSearch" placeholder="Search characters, places, lore…" /></div></div>`+
  `<div id="codexList" class="stack">${groups.map(([name,key,type,icon])=>`<section class="card codex-group"><div class="row"><div class="title-row"><h2>${name}</h2>${tip(name,`Open a ${name.slice(0,-1).toLowerCase()} to read its full information. Edit it in a large writing sheet.`)}</div><span class="tiny">${s[key].length}</span></div><div class="list">${s[key].map(x=>`<button class="list-item codex-item" data-action="openCodex" data-type="${type}" data-id="${x.id}"><div class="avatar">${icon}</div><div class="grow"><strong>${esc(x.name)}</strong><div class="tiny">${esc(x.desc)}</div></div><span class="chev">›</span></button>`).join('')||'<div class="empty">Nothing here yet. Add one or ask Aurora to discover entries from your story.</div>'}</div></section>`).join('')}</div>`;
}

function renderPlan(){
  const s=story();
  return pageIntro('Plot brain','Outline','Your plan gives the AI direction without locking you into it. Open any chapter to read or edit it.','improvePlan','✨ Improve plan')+
  `<div class="tip-banner"><div><strong>Think of the outline as a map.</strong><div class="muted">You can change chapters, add scenes and branch away from the plan at any time.</div></div>${tip('Outline','Acts contain chapters. Chapters contain scenes. Each scene has an objective. The AI uses those objectives when writing but can adapt when you give new direction.')}</div>`+
  `<div class="stack">${s.acts.map((a,ai)=>`<section class="card act-card"><div class="row"><div><span class="pill">Act ${ai+1} · ${a.pct}%</span><h2>${esc(a.title)}</h2></div>${tip(`Act ${ai+1}`,'An act is a large story movement. It groups chapters around a major change in the story.')}</div><div class="stack">${a.chapters.map((c,ci)=>`<button class="chapter-card" data-action="openChapter" data-act="${ai}" data-ch="${ci}"><div class="row"><div><strong>Chapter ${chapterNumber(s,c)} — ${esc(c.title)}</strong><div class="tiny">${c.scenes.length} scene${c.scenes.length===1?'':'s'}</div></div><span class="chev">›</span></div><p>${esc(c.summary)}</p><div class="tiny">Next: ${esc(c.scenes?.[0]?.objective||'Scene objective not set.')}</div></button>`).join('')||'<div class="empty">No chapters yet. Improve the plan when you want Aurora to build more.</div>'}</div></section>`).join('')}</div>`;
}

function renderWrite(){
  const s=story(),sc=currentSceneForStory();
  return pageIntro('Writer',sc?.title||'New scene',`${s.pov} · ${styleName(s)}`,'openWriterHelp','How writing works')+
  `<div class="write-status row"><div class="stack-inline"><span class="status-pill ok">✓ Style locked</span><span class="status-pill">🧠 Taste ${s.taste.learning?'learning':'frozen'}</span></div><button class="btn ghost small" data-action="openSceneDetails">Scene details</button></div>`+
  `<article class="reader-card"><div class="reader-meta"><span>Chapter ${chapterNumberForScene(s,sc)}</span><span>·</span><span>${words(sc?.text||'').toLocaleString()} words</span></div><div class="manuscript" id="manuscript">${esc(sc?.text||'')}</div></article>`+
  `<div class="writer-toolbar"><button class="tool-btn" data-action="openEditScene">✎<small>Edit</small></button><button class="tool-btn" data-action="director">✨<small>Guide</small></button><button class="tool-btn" data-action="cleanProse">◒<small>Clean</small></button><button class="tool-btn primary-tool" data-action="swipe">↻<small>Swipe</small></button></div>`+
  `<div class="writer-foot"><span>${s.words.toLocaleString()} story words</span><span>${s.versions.length} saved version${s.versions.length===1?'':'s'}</span></div>`;
}
function currentSceneForStory(){return firstScene(story());}
function chapterNumberForScene(s,sc){let n=0;for(const a of s.acts||[])for(const c of a.chapters||[]){n++;if(c.scenes?.includes(sc))return n;}return 1;}

function renderMore(){
  return pageIntro('Control center','More','Everything advanced lives here. The writing screen stays clean.')+
  `<div class="grid two">${navCard('🎨','Authors','${safeStyleCount()} styles','Pick a voice or create a custom one from a sample.','authors')}${navCard('🧠','My Taste',story().taste.learning?'Learning':'Frozen','Save, freeze, inspect, or reset what Aurora learned about your preferences.','taste')}${navCard('↗','Branches',`${story().branches.length} saved`,`Try alternate plot routes without touching canon.`,'branches')}${navCard('◷','Versions',`${story().versions.length} saved`,`Restore earlier accepted scene states.`,'versions')}${navCard('⌁','Timeline','Story state','See the continuity state Aurora uses behind the scenes.','timeline')}${navCard('💾','Backups','Export / Restore','Make a full backup of your local story data or restore one later.','backups')}${navCard('⚙','Settings','Theme · API · Tips','Customize Aurora and configure NanoGPT.','settings')}</div>`+
  `<div class="tip-banner"><strong>Need something explained?</strong><span class="muted">Tap the small <b>?</b> beside a feature. Aurora explains it in plain language without sending you into documentation.</span></div>`;
}
function safeStyleCount(){return builtInStyles.length+(story().customAuthorProfiles?.length||0);}
function styleName(s){return builtInStyles.find(x=>x.id===s.styleId)?.name||s.customAuthorProfiles?.find(x=>x.id===s.styleId)?.name||'My Taste';}

function renderTaste(){const s=story(),t=s.taste;return pageIntro('Personal writing model','My Taste','Aurora learns from what you accept, edit, reject and regenerate. Your explicit instruction always beats learned preference.')+
  `<div class="card"><div class="row"><div><h2>Learning from you</h2><div class="muted">${t.learning?'Aurora is currently learning from this story.':'Learning is frozen; your existing taste still applies.'}</div></div><button class="switch ${t.learning?'on':''}" data-action="toggleLearning"><span></span></button></div><div class="section-note">Tip: freeze learning before you deliberately experiment with a completely different style.</div></div>`+
  `<div class="section-title row"><strong>What Aurora thinks you like</strong>${tip('Taste model','These are learned tendencies, not absolute rules. Current explicit instructions and story needs can override them.')}</div><div class="grid two"><div class="card soft"><h3>Likes</h3><div class="chips">${t.likes.map(x=>`<span class="chip active">${esc(x)}</span>`).join('')||'<span class="muted">Nothing strong yet.</span>'}</div></div><div class="card soft"><h3>Dislikes</h3><div class="chips">${t.dislikes.map(x=>`<span class="chip">${esc(x)}</span>`).join('')||'<span class="muted">Nothing strong yet.</span>'}</div></div></div>`+
  `<div class="section-title row"><strong>Safety controls</strong>${tip('Taste safety','Save a snapshot before experimenting. Restore it if Aurora learns something you do not want.')}</div><div class="grid two"><button class="card soft action-card" data-action="saveTaste"><strong>💾 Save snapshot</strong><span class="muted">Keep this version of your taste.</span></button><button class="card soft action-card" data-action="restoreTaste"><strong>↶ Restore snapshot</strong><span class="muted">Return to your saved taste.</span></button><button class="card soft action-card" data-action="resetTaste"><strong>⟳ Reset learned taste</strong><span class="muted">Start learning again from a clean baseline.</span></button><button class="card soft action-card" data-action="openTasteHistory"><strong>◴ Taste history</strong><span class="muted">Undo individual learning events.</span></button></div>`;
}

function renderAuthors(){
  const s=story(),all=[...builtInStyles,...(s.customAuthorProfiles||[])];
  return pageIntro('Author library','Voice','Choose a writing profile. Aurora keeps the style active throughout the project instead of relying on chat memory.','newAuthor','＋ Create author')+
  `<div class="tip-banner"><div><strong>Do not know what you like?</strong><div class="muted">Open a profile to read its preview. Or give Aurora a chapter you love and let it build a reusable custom profile.</div></div>${tip('Author profiles','An author profile is a compact description of writing tendencies. Your Personal Taste layer sits on top and can modify it.')}</div>`+
  `<div class="list">${all.map(a=>`<button class="card author-card ${s.styleId===a.id?'selected-card':''}" data-action="useAuthor" data-id="${a.id}"><div class="row"><div><h2>${esc(a.name)}</h2><div class="tiny">${esc(a.desc)}</div></div><span class="pill">${s.styleId===a.id?'Active':'Use'}</span></div><div class="chips">${(a.tags||[]).map(t=>`<span class="chip">${esc(t)}</span>`).join('')}</div><blockquote>${esc(a.preview||'A user-trained style profile built from your sample.')}</blockquote><div class="tiny">Tap to use · ${tip('Style preview','This sample is only a preview. Your actual prose comes from the model plus the complete style profile and your personal taste.')}</div></button>`).join('')}</div>`;
}

function renderBranches(){const s=story();return pageIntro('Safe experiments','Branches','A branch is a private alternate timeline. It does not change your main story unless you promote it.','newBranch','＋ New branch')+`<div class="list">${s.branches.map(b=>`<button class="card branch-card" data-action="openBranch" data-id="${b.id}"><div class="row"><h2>${esc(b.name)}</h2><span class="pill">${esc(b.status)}</span></div><p>${esc(b.idea)}</p><div class="tiny">From: ${esc(b.parentScene||'Current scene')}</div></button>`).join('')||'<div class="empty">No branches yet. Create one when you want to test a risky plot idea.</div>'}</div>`;}
function renderVersions(){const s=story();return pageIntro('Safety net','Versions','Accepted edits and prose cleanups can be restored. The original scene remains recoverable.','openBackups','Backups')+`<div class="list">${s.versions.map(v=>`<button class="card version-card" data-action="openVersion" data-id="${v.id}"><div class="row"><div><h3>${esc(v.label)}</h3><div class="tiny">${new Date(v.createdAt).toLocaleString()}</div></div><span class="chev">›</span></div></button>`).join('')||'<div class="empty">No versions yet.</div>'}</div>`;}
function renderTimeline(){const s=story();return pageIntro('Persistent state','Timeline','Aurora separates permanent facts from the current state so long stories stay coherent.')+`<div class="grid two"><div class="card"><h3>Current narrative state</h3><div class="stack compact"><div class="stat-row"><span>POV</span><strong>${esc(s.pov)}</strong></div><div class="stat-row"><span>AI writes your actions</span><strong>${s.aiWritesUser?'Yes':'No'}</strong></div><div class="stat-row"><span>Style</span><strong>${esc(styleName(s))}</strong></div><div class="stat-row"><span>Codex</span><strong>${countCodex(s)} entries</strong></div></div></div><div class="card"><h3>Continuity layers</h3><p class="muted">Permanent truths, current character state, relevant past events, open threads and scene intent. Only relevant context is sent to the writer.</p></div></div>`;}
function renderBackups(){return pageIntro('Data safety','Backups & restore','Your projects live locally in this browser. Export regularly so your stories survive device changes or browser storage cleanup.','exportBackup','⬇ Export backup')+`<div class="grid two"><button class="card soft action-card" data-action="importBackup"><strong>⬆ Restore backup</strong><span class="muted">Choose a previously exported Aurora JSON file.</span></button><button class="card soft action-card" data-action="resetApp"><strong>⟳ Reset application</strong><span class="muted">Erase local Aurora data and return to the demo.</span></button></div><div class="tip-banner"><strong>Your API key is stored locally.</strong><span class="muted">It is included in browser storage, not uploaded by Aurora. Do not share an exported backup if it contains the key.</span></div>`;}

function renderOverlays(){
  const root=document.getElementById('modal-root'); root.innerHTML='';
  if(ui.reader)root.innerHTML=readerOverlay(ui.reader);
  else if(ui.editor)root.innerHTML=editorOverlay(ui.editor);
  else if(ui.modal)root.innerHTML=modalOverlay(ui.modal);
  if(ui.modal==='settings')bindSettingsDraft();
  bindActions();
}

function shellOverlay(inner,cls='sheet-full') {return `<div class="overlay" data-action="closeOverlay"><section class="${cls}" data-stop-overlay="1">${inner}</section></div>`;}
function overlayHeader(kicker,title,desc){return `<header class="sheet-head"><div><div class="eyebrow">${esc(kicker)}</div><h2>${esc(title)}</h2>${desc?`<p>${esc(desc)}</p>`:''}</div><button class="icon-btn close-big" data-action="closeOverlay" aria-label="Close">×</button></header>`;}

function readerOverlay(kind){
  const s=story();
  if(kind.type==='codex'){
    const arr=s[kind.collection]||[],item=arr.find(x=>x.id===kind.id); if(!item)return '';
    return shellOverlay(overlayHeader(kind.label,item.name,'Read the full entry without leaving your place.')+`<div class="reader-sheet"><div class="reader-badge">${esc(kind.label)}</div><p class="reader-lead">${esc(item.desc)}</p>${item.details?`<div class="reader-section"><h3>Details</h3><p>${esc(item.details)}</p></div>`:''}${item.visual?`<div class="reader-section"><h3>Visual identity</h3><p>${esc(item.visual)}</p></div>`:''}${item.role?`<div class="reader-section"><h3>Role</h3><p>${esc(item.role)}</p></div>`:''}</div><div class="sheet-footer two"><button class="btn" data-action="closeOverlay">Close</button><button class="btn primary" data-action="editCodexLarge" data-type="${kind.type}" data-id="${kind.id}">Edit entry</button></div>`);
  }
  if(kind.type==='chapter'){
    const c=s.acts?.[kind.ai]?.chapters?.[kind.ci]; if(!c)return '';
    return shellOverlay(overlayHeader(`Chapter ${chapterNumber(s,c)}`,c.title,'Read the chapter, inspect its scene plan, or edit it in a large sheet.')+`<div class="reader-sheet"><p class="reader-lead">${esc(c.summary)}</p>${c.scenes.map((sc,i)=>`<section class="scene-block"><div class="scene-kicker">Scene ${i+1}</div><h3>${esc(sc.title)}</h3><div class="tiny">Objective: ${esc(sc.objective)}</div><div class="manuscript scene-prose">${esc(sc.text||'No prose yet. Use Write to generate it.')}</div></section>`).join('')}</div><div class="sheet-footer three"><button class="btn" data-action="closeOverlay">Close</button><button class="btn" data-action="editChapterLarge" data-ai="${kind.ai}" data-ci="${kind.ci}">Edit</button><button class="btn primary" data-action="openWriteFromChapter" data-ai="${kind.ai}" data-ci="${kind.ci}">Write</button></div>`);
  }
  if(kind.type==='scene'){
    const sc=findScene(s,kind.id); if(!sc)return '';
    return shellOverlay(overlayHeader('Scene reader',sc.title,'Read the scene in a focused book-like view.')+`<div class="reader-sheet book-page"><div class="scene-kicker">${esc(sc.objective)}</div><div class="manuscript scene-prose">${esc(sc.text||'This scene has no prose yet.')}</div></div><div class="sheet-footer three"><button class="btn" data-action="closeOverlay">Close</button><button class="btn" data-action="openEditScene">Edit</button><button class="btn primary" data-action="openWriterFromReader">Write</button></div>`);
  }
  if(kind.type==='synopsis') return shellOverlay(overlayHeader('Story overview',s.title,'A quick reader for the concept, premise and current structure.')+`<div class="reader-sheet"><div class="reader-section"><h3>Concept</h3><p>${esc(s.concept)}</p></div><div class="reader-section"><h3>Premise</h3><p>${esc(s.premise)}</p></div>${s.acts.map((a,i)=>`<div class="reader-section"><h3>Act ${i+1} — ${esc(a.title)}</h3>${a.chapters.map(c=>`<p><strong>Chapter ${chapterNumber(s,c)} — ${esc(c.title)}</strong><br>${esc(c.summary)}</p>`).join('')}</div>`).join('')}</div>`);
  return '';
}

function editorOverlay(kind){
  if(kind.type==='codex'){
    const s=story(),arr=s[kind.collection],item=arr.find(x=>x.id===kind.id);if(!item)return '';
    return shellOverlay(overlayHeader('Edit Codex entry',item.name,'Large, comfortable editor. Aurora will keep this information structured.')+`<div class="editor-sheet"><div class="field"><label>Name ${tip('Name','Use the name the story should consistently use.')}</label><input id="editName" value="${esc(item.name)}" /></div><div class="field"><label>Short description ${tip('Short description','A compact canonical description. This is the part most often retrieved while writing.')}</label><textarea id="editDesc">${esc(item.desc)}</textarea></div><div class="field"><label>More details ${tip('More details','Optional deeper information. Aurora retrieves it when the scene needs it.')}</label><textarea id="editDetails">${esc(item.details||'')}</textarea></div>${kind.type==='character'?`<div class="field"><label>Visual identity ${tip('Visual identity','Used by the comic/image pipeline and kept separate from prose behavior.')}</label><textarea id="editVisual">${esc(item.visual||'')}</textarea></div><div class="field"><label>Role</label><input id="editRole" value="${esc(item.role||'')}" /></div>`:''}</div><div class="sheet-footer two"><button class="btn" data-action="closeOverlay">Cancel</button><button class="btn primary" data-action="saveCodexLarge" data-type="${kind.type}" data-id="${kind.id}">✓ Save entry</button></div>`);
  }
  if(kind.type==='chapter'){
    const c=story().acts?.[kind.ai]?.chapters?.[kind.ci];if(!c)return '';
    return shellOverlay(overlayHeader('Edit chapter',`Chapter ${chapterNumber(story(),c)} — ${c.title}`,'Change the chapter without losing its existing prose.')+`<div class="editor-sheet"><div class="field"><label>Chapter title</label><input id="editChapterTitle" value="${esc(c.title)}" /></div><div class="field"><label>Chapter purpose ${tip('Chapter purpose','What this chapter must accomplish. The writer uses this as direction.')}</label><textarea id="editChapterSummary">${esc(c.summary)}</textarea></div>${c.scenes.map((sc,i)=>`<div class="scene-edit-card"><div class="row"><strong>Scene ${i+1}</strong><button class="btn small" data-action="openScene" data-scene="${sc.id}">Read</button></div><div class="field"><label>Scene title</label><input data-scene-title="${sc.id}" value="${esc(sc.title)}" /></div><div class="field"><label>Objective</label><textarea data-scene-objective="${sc.id}">${esc(sc.objective)}</textarea></div></div>`).join('')}</div><div class="sheet-footer two"><button class="btn" data-action="closeOverlay">Cancel</button><button class="btn primary" data-action="saveChapterLarge" data-ai="${kind.ai}" data-ci="${kind.ci}">✓ Save chapter</button></div>`);
  }
  if(kind.type==='scene'){
    const sc=findScene(story(),kind.id);if(!sc)return '';
    return shellOverlay(overlayHeader('Edit scene',sc.title,'Edit the prose directly in a comfortable book editor.')+`<div class="editor-sheet"><div class="field"><label>Scene title</label><input id="editSceneTitle" value="${esc(sc.title)}" /></div><div class="field"><label>Scene objective ${tip('Scene objective','What should change or be accomplished in this scene?') }</label><textarea id="editSceneObjective">${esc(sc.objective)}</textarea></div><div class="field"><label>Manuscript ${tip('Manuscript','This is the canonical scene text. Every accepted swipe creates a restore point.')}</label><textarea id="editSceneText" class="big-editor">${esc(sc.text||'')}</textarea></div></div><div class="sheet-footer three"><button class="btn" data-action="closeOverlay">Cancel</button><button class="btn" data-action="openDirectorForScene">Guide</button><button class="btn primary" data-action="saveSceneLarge" data-id="${sc.id}">✓ Save scene</button></div>`);
  }
  return '';
}

function modalOverlay(name){
  if(name==='newStory')return shellOverlay(overlayHeader('Create','New concept','Give Aurora the messy version. You do not need to know how to plan a novel.')+`<div class="editor-sheet"><div class="tip-banner"><strong>Write however you normally think.</strong><span class="muted">Example: “A retired immortal lives in a village and tries to stay anonymous.”</span></div><div class="field"><label>Your idea ${tip('Your idea','One sentence is enough. Aurora expands it into a concept, premise, protagonist, supporting cast, world and outline.')}</label><textarea id="newConcept" class="idea-editor" placeholder="Tell Aurora the idea in your own words…"></textarea></div><div class="field"><label>Format</label><div class="choice-grid"><button class="choice-card selected" data-choice-group="format" data-choice-value="novel"><strong>📖 Novel</strong><span>Chapters, scenes, prose and continuity.</span></button><button class="choice-card" data-choice-group="format" data-choice-value="comic"><strong>🎨 Comic</strong><span>Story first, visual planning ready later.</span></button></div></div></div><div class="sheet-footer two"><button class="btn" data-action="closeOverlay">Cancel</button><button class="btn primary" data-action="buildStory">✨ Build my foundation</button></div>`);
  if(name==='director')return shellOverlay(overlayHeader('AI Director','What should happen next?','You can be vague. Aurora turns the direction into a scene plan and preserves your story rules.')+`<div class="choice-stack">${[['logical','🧭','Logical','The most natural, earned continuation.'],['interesting','✦','Interesting','A stronger creative move that still fits the story.'],['bold','⚡','Bold','A risky turn that changes the situation.'],['own','✎','My idea','Tell Aurora exactly what you want in plain language.'],['surprise','🎲','Surprise me','Aurora invents a direction based on your taste.']].map(x=>`<button class="choice-card director-choice" data-action="directorPick" data-mode="${x[0]}"><strong>${x[1]} ${x[2]}</strong><span>${x[3]}</span></button>`).join('')}</div>`);
  if(name==='swipe')return swipeOverlay();
  if(name==='clean')return shellOverlay(overlayHeader('Prose cleaner','Remove AI-style writing','Aurora preserves story events, character decisions and useful details while targeting generic LLM patterns.')+`<div class="choice-stack"><div class="choice-card selected"><strong>◒ Decorative sensory padding</strong><span>Remove automatic smells, sounds, weather and atmosphere when they add no narrative value.</span></div><div class="choice-card selected"><strong>✦ Purple prose</strong><span>Reduce forced metaphors, similes and ornamental phrasing.</span></div><div class="choice-card selected"><strong>↻ Repetition</strong><span>Reduce repeated phrases, emotional labels, stock transitions and scene-openers.</span></div><div class="choice-card selected"><strong>✓ Preserve intent</strong><span>Do not change the underlying story event, decision or character goal.</span></div></div><div class="sheet-footer two"><button class="btn" data-action="closeOverlay">Cancel</button><button class="btn primary" data-action="runClean">✨ Clean this scene</button></div>`);
  if(name==='newCodex')return shellOverlay(overlayHeader('Add to Codex','New entry','Describe it naturally. You can refine it later in the large editor.')+`<div class="editor-sheet"><div class="field"><label>Type</label><select id="cType"><option value="character">Character</option><option value="location">Location</option><option value="faction">Faction</option><option value="item">Item</option><option value="rule">Rule</option></select></div><div class="field"><label>Name</label><input id="cName" placeholder="Mira" /></div><div class="field"><label>Rough description</label><textarea id="cDesc" class="idea-editor" placeholder="Write the messy version. Aurora will keep it organized."></textarea></div></div><div class="sheet-footer two"><button class="btn" data-action="closeOverlay">Cancel</button><button class="btn primary" data-action="saveCodex">Add entry</button></div>`);
  if(name==='newAuthor')return shellOverlay(overlayHeader('Create author profile','Teach Aurora a voice','Paste a representative piece you love. Aurora builds a reusable style profile from it.')+`<div class="editor-sheet"><div class="field"><label>Profile name</label><input id="authorName" placeholder="My Dark Literary Voice" /></div><div class="field"><label>Sample text ${tip('Sample text','Use a representative excerpt rather than only a single sentence. The engine studies sentence rhythm, dialogue, description, imagery and pacing.')}</label><textarea id="authorSample" class="sample-editor" placeholder="Paste a chapter or representative pages here…"></textarea></div></div><div class="sheet-footer two"><button class="btn" data-action="closeOverlay">Cancel</button><button class="btn primary" data-action="analyzeAuthor">✨ Analyze style</button></div>`);
  if(name==='settings')return settingsSheet();
  if(name==='confirmReset')return confirmSheet('Reset local Aurora data?','This deletes local stories, taste, settings and API credentials from this browser. Export a backup first if there is anything you want to keep.','Yes, reset everything','resetConfirmed');
  if(name==='confirmRestore')return confirmSheet('Restore this backup?','This replaces the current local Aurora data with the selected backup. The current data will be saved in memory only until the page is reloaded.','Restore backup','restoreConfirmed');
  if(name==='tip')return shellOverlay(overlayHeader('Help','What does this do?','Aurora explains it here without technical jargon.')+`<div class="reader-sheet"><p class="reader-lead">${esc(ui.tipText||'')}</p></div>`);
  return '';
}

function swipeOverlay(){const list=ui.candidates.length?ui.candidates:[''];const idx=Math.max(0,Math.min(ui.swipeIndex,list.length-1));return shellOverlay(overlayHeader('Alternatives',`Swipe ${idx+1} of ${list.length}`,'Each swipe is a non-canon candidate. Your story changes only when you accept one.')+`<div class="reader-sheet"><div class="manuscript scene-prose">${esc(list[idx])}</div></div><div class="swipe-controls"><button class="btn" data-action="prevSwipe" ${idx===0?'disabled':''}>‹</button><div class="swipe-dot-row">${list.map((_,i)=>`<span class="swipe-dot ${i===idx?'active':''}"></span>`).join('')}</div><button class="btn" data-action="nextSwipe" ${idx===list.length-1?'disabled':''}>›</button></div><div class="sheet-footer three"><button class="btn" data-action="learnSwipe" data-feedback="dislike">👎 Less like this</button><button class="btn" data-action="learnSwipe" data-feedback="like">❤️ More like this</button><button class="btn primary" data-action="acceptSwipe">✓ Accept</button></div>`);}

function settingsSheet(){const draft=ui.settingsDraft||state.settings;return shellOverlay(overlayHeader('Preferences','Settings','Settings are scrollable. Save is always at the bottom, and Close never loses your place.')+`<div class="settings-scroll"><section class="settings-section"><div class="title-row"><h3>Appearance</h3>${tip('Appearance','Theme and accent color only change the interface. They do not change how your stories are written.')}</div><div class="field"><label>Accent color</label><div class="color-grid">${Object.keys(palette).map(k=>`<button class="color-choice ${draft.accent===k?'selected':''}" data-setting-accent="${k}"><span style="--swatch:${palette[k][0]}"></span>${k}</button>`).join('')}</div></div><div class="field"><label>Theme</label><div class="choice-grid three">${Object.entries(themeLabels).map(([k,v])=>`<button class="choice-card ${draft.theme===k?'selected':''}" data-setting-theme="${k}"><strong>${v}</strong><span>${k==='dark'?'Best for reading':k==='light'?'Bright paper feel':'Follows device preference'}</span></button>`).join('')}</div></div><div class="field"><label>Reader text size</label><div class="stepper"><button data-setting-font="-0.05">−</button><span>${Math.round((draft.fontScale||1)*100)}%</span><button data-setting-font="0.05">＋</button></div></div></section>
  <section class="settings-section"><div class="title-row"><h3>NanoGPT</h3>${tip('NanoGPT','Enter your OpenAI-compatible NanoGPT endpoint, API key and model. The key is kept in this browser in the MVP.')}</div><div class="field"><label>API endpoint</label><input id="apiEndpoint" value="${esc(draft.api.endpoint)}" /><div class="field-hint">Default: https://nano-gpt.com/api/v1/chat/completions</div></div><div class="field"><label>API key</label><input id="apiKey" type="password" value="${esc(draft.api.key)}" placeholder="Your NanoGPT key" /><div class="field-hint">Stored locally in this browser.</div></div><div class="field"><label>Model</label><input id="apiModel" value="${esc(draft.api.model)}" placeholder="deepseek-v4-pro" /></div></section>
  <section class="settings-section"><div class="title-row"><h3>Budget guard</h3>${tip('Budget guard','A visible spending ceiling helps prevent accidental overuse. The MVP does not yet know your remote NanoGPT balance automatically.')}</div><div class="budget-card"><div><strong>${esc(draft.budget.periodLabel)}</strong><div class="muted">Recommended hard ceiling</div></div><div class="budget-number">$${draft.budget.limit.toFixed(2)}</div></div></section>
  <section class="settings-section"><div class="title-row"><h3>Help inside the app</h3>${tip('Tips','Keep this on if you want a small ? beside unfamiliar features. Turn it off when you feel comfortable.')}</div><div class="row"><span class="muted">Show tips</span><button class="switch ${draft.tips?'on':''}" data-setting-tips><span></span></button></div></section>
  <section class="settings-section"><div class="title-row"><h3>Data</h3>${tip('Data','Backups export your entire local application state. Restore replaces the current state.')}</div><div class="grid two"><button class="card soft action-card" data-action="exportBackup"><strong>⬇ Export backup</strong><span class="muted">Save a JSON copy of your stories.</span></button><button class="card soft action-card" data-action="importBackup"><strong>⬆ Restore backup</strong><span class="muted">Load an Aurora JSON backup.</span></button><button class="card soft action-card" data-action="resetApp"><strong>⟳ Reset app</strong><span class="muted">Start over on this browser.</span></button></div></section>
  </div><div class="sheet-footer settings-footer"><button class="btn" data-action="closeOverlay">Cancel</button><button class="btn primary" data-action="saveSettings">✓ Save settings</button></div>`);}

function confirmSheet(title,desc,confirmText,action){return shellOverlay(overlayHeader('Confirm',title,'Please make sure this is what you want.')+`<div class="reader-sheet"><p class="reader-lead">${esc(desc)}</p></div><div class="sheet-footer two"><button class="btn" data-action="closeOverlay">Cancel</button><button class="btn danger primary" data-action="${action}">${esc(confirmText)}</button></div>`);}

function bindSettingsDraft(){ if(!ui.settingsDraft)ui.settingsDraft=deepClone(state.settings); }
function findScene(s,id){for(const a of s.acts||[])for(const c of a.chapters||[])for(const sc of c.scenes||[])if(sc.id===id)return sc;return null;}
function sceneParent(s,id){for(let ai=0;ai<(s.acts||[]).length;ai++)for(let ci=0;ci<s.acts[ai].chapters.length;ci++)for(const sc of s.acts[ai].chapters[ci].scenes||[])if(sc.id===id)return {ai,ci,scene:sc};return null;}
function collectionForType(type){return ({character:'characters',location:'locations',faction:'factions',item:'items',rule:'rules'})[type];}

function showModal(name){ui.modal=name;ui.reader=null;ui.editor=null;ui.settingsDraft=(name==='settings'?deepClone(state.settings):ui.settingsDraft);renderOverlays();}
function closeOverlay(){ui.modal=null;ui.reader=null;ui.editor=null;ui.pendingConfirm=null;render();}
function openReader(obj){ui.modal=null;ui.editor=null;ui.reader=obj;renderOverlays();}
function openEditor(obj){ui.modal=null;ui.reader=null;ui.editor=obj;renderOverlays();}

function buildStoryFromIdea(idea,mode='novel'){
  const s=deepClone(defaultState.stories[0]);s.id=uid('story');s.title=titleFromIdea(idea);s.genre=/cultivation|immortal|xianxia/i.test(idea)?'Cultivation / Fantasy':'Fantasy / Fiction';s.concept=idea;s.premise=idea?s.premise:s.premise;s.storyMode=mode;s.progress=18;s.words=0;s.chapterCount=0;s.status='Draft';
  s.characters=[{id:uid('c'),name:'Protagonist',role:'Protagonist',type:'character',desc:'Generated from your rough idea. Aurora will deepen this profile as the story develops.',visual:'To be refined from your story and visual preferences.',details:{voice:'To be learned from your choices.',goals:'To be refined.',fears:'To be refined.',knowledge:'Only what the story establishes.'}}];
  s.locations=[{id:uid('l'),name:'Primary Setting',type:'location',desc:'Main setting inferred from the concept.',details:'Aurora will expand the location as it becomes relevant.'}];
  s.factions=[];s.items=[];s.rules=[{id:uid('r'),name:'Story Truth',type:'rule',desc:'Established facts remain canonical unless you explicitly change them.',details:'Hard truth.'}];
  s.acts=[{id:uid('a'),title:'Act I — Foundation',pct:20,chapters:[{id:uid('ch'),title:'The Beginning',summary:'Introduce the protagonist, establish the core promise and create the first meaningful disturbance.',scenes:[{id:uid('sc'),title:'Opening Scene',objective:'Establish the protagonist, world and initial hook.',text:''}]}]},{id:uid('a'),title:'Act II — Pressure',pct:55,chapters:[]},{id:uid('a'),title:'Act III — Consequences',pct:85,chapters:[]}];
  s.taste=deepClone(story().taste);s.branches=[];s.versions=[];s.swipes={};s.customAuthorProfiles=[];seedSmartDefaults(s,idea);return s;
}
function titleFromIdea(idea){const words=idea.replace(/[^\p{L}\p{N}\s'’-]/gu,' ').trim().split(/\s+/).filter(Boolean);if(!words.length)return'Untitled Story';return words.slice(0,5).map(w=>w[0]?.toUpperCase()+w.slice(1)).join(' ');}
function seedSmartDefaults(s,idea){const low=idea.toLowerCase();if(/immortal|cultivation|xianxia/.test(low)){s.styleId='cultivation';s.characters[0].name='Protagonist';s.rules.push({id:uid('r'),name:'Progression must be earned',type:'rule',desc:'Power and major developments should follow established story logic.',details:'Created automatically from cultivation cues.'});}else{s.styleId='balanced';}}

async function buildWithNanoGPT(idea){
  const messages=[{role:'system',content:'You are Aurora Story Studio\'s story architect. Return ONLY JSON. Create title, genre, premise, characters, locations, factions, items, rules, acts. Keep all descriptions compact and useful. Do not write chapter prose.'},{role:'user',content:idea}];
  return window.nanoGPTGenerate(messages,{temperature:.72,max_tokens:2800});
}
function applyFoundationJSON(s,raw){try{const json=JSON.parse(raw.replace(/^```json\s*|\s*```$/g,''));Object.assign(s,{title:json.title||s.title,genre:json.genre||s.genre,premise:json.premise||s.premise,characters:Array.isArray(json.characters)?json.characters:s.characters,locations:Array.isArray(json.locations)?json.locations:s.locations,factions:Array.isArray(json.factions)?json.factions:s.factions,items:Array.isArray(json.items)?json.items:s.items,rules:Array.isArray(json.rules)?json.rules:s.rules,acts:Array.isArray(json.acts)?json.acts:s.acts});return true;}catch{return false;}}

function updateTaste(text,liked){const s=story();if(!s.taste.learning)return;const t=s.taste;const observations=[];if(liked){if(text.split('\n\n').length>2)observations.push('clean paragraph rhythm');if(text.split('"').length>4)observations.push('dialogue carrying the scene');if(!/the smell of|the scent of|ozone|diesel|spices|a chill|a flicker/i.test(text))observations.push('restrained sensory detail');}else observations.push('generic LLM phrasing');for(const x of observations){if(liked&&!t.likes.includes(x))t.likes.push(x);if(!liked&&!t.dislikes.includes(x))t.dislikes.push(x);t.confidence[x]=(t.confidence[x]||0)+1;t.history.unshift({id:uid('learn'),at:now(),kind:liked?'like':'dislike',text:x});t.history=t.history.slice(0,100);}}
function cleanText(text){
  let out=text;
  out=out.replace(/\b(?:the smell of|the scent of|a scent of|the air was|the atmosphere was)\s+[^.!?\n]+[.!?]/gi,'');
  out=out.replace(/\b(?:a chill crept|a flicker of|a wave of|a shiver ran)\s+[^.!?\n]+[.!?]/gi,'');
  out=out.replace(/\b(It was|It felt|He felt|She felt|He realized|She realized|He knew|She knew)\s+([^.!?]+)[.!?]/gi,(_,__m,rest)=>rest.trim().replace(/^[a-z]/,c=>c.toUpperCase())+'.');
  out=out.replace(/\b(?:like|as if)\s+[^.!?\n]{30,}[.!?]/gi,'');
  out=out.replace(/(?:\bthe\s+){2,}/gi,'the ');
  out=out.replace(/\n{3,}/g,'\n\n').trim();
  return out||text;
}

function demoSwipes(){const sc=currentSceneForStory(),base=sc?.text||'';return[
  base,
  base+(base?'\n\n':'')+'Mira looked at the wheel, then at Ruin.\n“You fixed that too quickly.”\nHe handed her the axle pin.\n“It was only a wheel.”',
  base+(base?'\n\n':'')+'The wheel hit the dirt. Ruin caught it before it rolled away. Nobody in the village noticed the speed of his hand except Mira. She said nothing.'
];}
function saveVersion(sc,label='Before change'){const s=story();s.versions.unshift({id:uid('ver'),sceneId:sc.id,text:sc.text||'',createdAt:now(),label});s.versions=s.versions.slice(0,50);}
function acceptSwipe(){const sc=currentSceneForStory();if(!sc)return;saveVersion(sc,'Before swipe acceptance');sc.text=ui.candidates[ui.swipeIndex]||'';story().words=totalStoryWords();updateTaste(sc.text,true);saveState();closeOverlay();toast('Accepted. Story state remains recoverable.');}
function totalStoryWords(){let n=0;for(const a of story().acts||[])for(const c of a.chapters||[])for(const sc of c.scenes||[])n+=words(sc.text);return n;}

function bindActions(){
  document.querySelectorAll('[data-view]').forEach(el=>el.addEventListener('click',e=>{e.stopPropagation();setView(el.dataset.view);}));
  // Actions use one delegated listener installed once below. This is deliberately
  // used instead of attaching listeners to every dynamically-rendered button; it
  // prevents mobile overlays from losing their click handlers after a re-render.
  if(!document.body.dataset.auroraActionDelegation){
    document.body.dataset.auroraActionDelegation='1';
    document.body.addEventListener('click',e=>{
      const el=e.target.closest?.('[data-action]');
      if(!el) return;
      if(el.closest('#modal-root') || el.dataset.action==='tip') e.stopPropagation();
      handleAction(el.dataset.action,el);
    });
  }
  const q=document.getElementById('codexSearch');if(q)q.addEventListener('input',()=>{const term=q.value.toLowerCase();document.querySelectorAll('#codexList .codex-item').forEach(i=>i.hidden=!i.textContent.toLowerCase().includes(term));});
  document.querySelectorAll('[data-choice-group]').forEach(el=>el.addEventListener('click',()=>{document.querySelectorAll(`[data-choice-group="${el.dataset.choiceGroup}"]`).forEach(x=>x.classList.remove('selected'));el.classList.add('selected');}));
  document.querySelectorAll('[data-setting-accent]').forEach(el=>el.addEventListener('click',()=>{if(ui.settingsDraft){ui.settingsDraft.accent=el.dataset.settingAccent;applyDraftPreview();renderOverlays();}}));
  document.querySelectorAll('[data-setting-theme]').forEach(el=>el.addEventListener('click',()=>{if(ui.settingsDraft){ui.settingsDraft.theme=el.dataset.settingTheme;applyDraftPreview();renderOverlays();}}));
  document.querySelectorAll('[data-setting-font]').forEach(el=>el.addEventListener('click',()=>{if(ui.settingsDraft){ui.settingsDraft.fontScale=Math.max(.85,Math.min(1.35,(ui.settingsDraft.fontScale||1)+Number(el.dataset.settingFont)));applyDraftPreview();renderOverlays();}}));
  const tips=document.querySelector('[data-setting-tips]');if(tips)tips.addEventListener('click',()=>{ui.settingsDraft.tips=!ui.settingsDraft.tips;renderOverlays();});
}
function applyDraftPreview(){const root=document.documentElement,p=palette[ui.settingsDraft.accent]||palette.Aurora;root.style.setProperty('--accent',p[0]);root.style.setProperty('--accent-2',p[1]);root.dataset.theme=ui.settingsDraft.theme;root.style.setProperty('--font-scale',ui.settingsDraft.fontScale||1);}

async function handleAction(action,el){
  const s=story();
  switch(action){
    case 'tip':ui.tipText=el.dataset.tip||'';showModal('tip');break;
    case 'newStory':showModal('newStory');break;
    case 'buildStory':{
      const idea=document.getElementById('newConcept')?.value.trim();if(!idea){toast('Give Aurora even a small idea.');return;}
      const mode=document.querySelector('[data-choice-group="format"].selected')?.dataset.choiceValue||'novel';
      const base=buildStoryFromIdea(idea,mode);closeOverlay();toast('Building your foundation…');
      if(state.settings.api.key){try{const raw=await buildWithNanoGPT(idea);applyFoundationJSON(base,raw);toast('Foundation built with NanoGPT.');}catch{toast('NanoGPT unavailable. Aurora used a local foundation.');}}
      state.stories.unshift(base);state.activeStoryId=base.id;saveState();setView('story');break;
    }
    case 'openStory':state.activeStoryId=el.dataset.id;setView('story');break;
    case 'openScene':openReader({type:'scene',id:el.dataset.scene});break;
    case 'openSynopsis':openReader({type:'synopsis'});break;
    case 'openChapter':openReader({type:'chapter',ai:+el.dataset.act,ci:+el.dataset.ch});break;
    case 'openPlan':setView('plan');break;
    case 'plan':setView('plan');break;
    case 'improvePlan':s.acts[0].chapters.push({id:uid('ch'),title:'A New Complication',summary:'A complication develops from existing motives without breaking continuity.',scenes:[{id:uid('sc'),title:'Pressure Rises',objective:'Complicate the current goal while preserving established character logic.',text:''}]});s.progress=Math.min(100,(s.progress||0)+8);saveState();render();toast('Outline expanded safely.');break;
    case 'director':showModal('director');break;
    case 'directorPick':await handleDirector(el.dataset.mode);break;
    case 'swipe':ui.candidates=await generateCandidates();ui.swipeIndex=0;showModal('swipe');break;
    case 'prevSwipe':ui.swipeIndex=Math.max(0,ui.swipeIndex-1);renderOverlays();break;
    case 'nextSwipe':ui.swipeIndex=Math.min(ui.candidates.length-1,ui.swipeIndex+1);renderOverlays();break;
    case 'acceptSwipe':acceptSwipe();break;
    case 'learnSwipe':updateTaste(ui.candidates[ui.swipeIndex]||'',el.dataset.feedback==='like');saveState();toast('Aurora learned from your choice.');break;
    case 'cleanProse':showModal('clean');break;
    case 'runClean':{const sc=currentSceneForStory();if(!sc)return;saveVersion(sc,'Before prose clean');sc.text=cleanText(sc.text||'');story().words=totalStoryWords();saveState();closeOverlay();toast('Prose cleaned without changing the scene objective.');break;}
    case 'openCodex':openReader({type:'codex',collection:collectionForType(el.dataset.type),label:el.dataset.type[0].toUpperCase()+el.dataset.type.slice(1),id:el.dataset.id});break;
    case 'newCodex':showModal('newCodex');break;
    case 'saveCodex':saveNewCodex();break;
    case 'editCodexLarge':openEditor({type:'codex',collection:collectionForType(el.dataset.type),id:el.dataset.id,label:el.dataset.type[0].toUpperCase()+el.dataset.type.slice(1)});break;
    case 'saveCodexLarge':saveCodexLarge(el);break;
    case 'authors':setView('more');setTimeout(()=>{document.getElementById('view').innerHTML=renderAuthors();bindActions();},0);break;
    case 'newAuthor':showModal('newAuthor');break;
    case 'analyzeAuthor':analyzeAuthor();break;
    case 'useAuthor':s.styleId=el.dataset.id;saveState();render();toast('Author voice locked for this project.');break;
    case 'taste':setView('more');setTimeout(()=>{document.getElementById('view').innerHTML=renderTaste();bindActions();},0);break;
    case 'toggleLearning':s.taste.learning=!s.taste.learning;saveState();render();break;
    case 'saveTaste':s.taste.snapshot=deepClone(s.taste);saveState();toast('Taste snapshot saved.');break;
    case 'restoreTaste':if(s.taste.snapshot){s.taste=deepClone(s.taste.snapshot);saveState();toast('Taste restored.');render();}else toast('Save a taste snapshot first.');break;
    case 'resetTaste':showModal('confirmResetTaste');break;
    case 'confirmResetTaste':s.taste={likes:[],dislikes:[],confidence:{},learning:true,snapshot:null,history:[]};saveState();closeOverlay();toast('Learned taste reset.');break;
    case 'openTasteHistory':openReader({type:'tasteHistory'});break;
    case 'branches':setView('more');setTimeout(()=>{document.getElementById('view').innerHTML=renderBranches();bindActions();},0);break;
    case 'newBranch':showModal('newBranch');break;
    case 'saveBranch':createBranch();break;
    case 'versions':setView('more');setTimeout(()=>{document.getElementById('view').innerHTML=renderVersions();bindActions();},0);break;
    case 'openVersion':openVersion(el.dataset.id);break;
    case 'timeline':setView('more');setTimeout(()=>{document.getElementById('view').innerHTML=renderTimeline();bindActions();},0);break;
    case 'backups':setView('more');setTimeout(()=>{document.getElementById('view').innerHTML=renderBackups();bindActions();},0);break;
    case 'openBackups':setView('more');setTimeout(()=>{document.getElementById('view').innerHTML=renderBackups();bindActions();},0);break;
    case 'exportBackup':exportBackup();break;
    case 'importBackup':document.getElementById('backupInput').click();break;
    case 'resetApp':showModal('confirmReset');break;
    case 'resetConfirmed':resetApp();break;
    case 'restoreConfirmed':restoreBackup();break;
    case 'settings':showModal('settings');break;
    case 'openSettings':showModal('settings');break;
    case 'saveSettings':saveSettings();break;
    case 'closeOverlay':closeOverlay();break;
    case 'more':setView('more');break;
    case 'back':setView('library');break;
    case 'storyMenu':showStoryMenu();break;
    case 'openEditScene':openEditor({type:'scene',id:currentSceneForStory()?.id});break;
    case 'openWriterFromReader':closeOverlay();setView('write');break;
    case 'openWriterFromChapter':{closeOverlay();const c=s.acts[+el.dataset.ai]?.chapters[+el.dataset.ci];if(c?.scenes?.[0])openReader({type:'scene',id:c.scenes[0].id});}break;
    case 'editChapterLarge':openEditor({type:'chapter',ai:+el.dataset.ai,ci:+el.dataset.ci});break;
    case 'saveChapterLarge':saveChapterLarge(el);break;
    case 'editChapter':break;
    case 'openWriterHelp':showModal('writingHelp');break;
    case 'openSceneDetails':openReader({type:'scene',id:currentSceneForStory()?.id});break;
    case 'openDirectorForScene':showModal('director');break;
    case 'saveSceneLarge':saveSceneLarge(el);break;
  }
}

async function handleDirector(mode){
  if(mode==='own'){ui.reader=null;ui.editor=null;showModal('directorOwn');return;}
  if(mode==='surprise')story().notes.unshift({id:uid('note'),text:'Aurora surprise direction requested.',createdAt:now()});
  addTasteDirection(mode);saveState();closeOverlay();toast(mode==='logical'?'Logical direction ready.':mode==='interesting'?'Interesting direction ready.':mode==='bold'?'Bold direction ready.':'Aurora will use a surprising direction.');
}
function addTasteDirection(mode){if(!story().taste.learning)return;const label=mode==='bold'?'bold plot turns':mode==='interesting'?'interesting plot turns':'earned scene progression';if(!story().taste.likes.includes(label))story().taste.likes.push(label);}
async function generateCandidates(){
  const sc=currentSceneForStory();if(!sc)return[''];
  if(state.settings.api.key){try{const out=await window.nanoGPTGenerate([{role:'system',content:'Generate three alternative continuations of the provided scene. Return ONLY a JSON array of three strings. Preserve established story facts and current style preferences. Do not explain.'},{role:'user',content:`Story: ${story().title}\nStyle: ${styleName(story())}\nPOV: ${story().pov}\nCurrent scene:\n${sc.text}`}],{temperature:.8,max_tokens:2400});const arr=JSON.parse(out.replace(/^```json\s*|\s*```$/g,''));if(Array.isArray(arr)&&arr.length)return arr.slice(0,4);}catch{}}
  return demoSwipes();
}

function saveNewCodex(){const s=story(),type=document.getElementById('cType').value,name=document.getElementById('cName').value.trim(),desc=document.getElementById('cDesc').value.trim();if(!name){toast('Give it a name first.');return;}s[collectionForType(type)].push({id:uid('x'),type,name,desc:desc||'Created from a rough user description.',details:''});saveState();closeOverlay();toast('Added to Codex.');render();}
function saveCodexLarge(el){const s=story(),arr=s[collectionForType(el.dataset.type)],item=arr.find(x=>x.id===el.dataset.id);if(!item)return;item.name=document.getElementById('editName').value.trim()||item.name;item.desc=document.getElementById('editDesc').value.trim();item.details=document.getElementById('editDetails').value.trim();if(el.dataset.type==='character'){item.visual=document.getElementById('editVisual')?.value.trim()||'';item.role=document.getElementById('editRole')?.value.trim()||'';}saveState();closeOverlay();toast('Codex entry saved.');render();}
function saveChapterLarge(el){const s=story(),c=s.acts[+el.dataset.ai]?.chapters[+el.dataset.ci];if(!c)return;c.title=document.getElementById('editChapterTitle').value.trim()||c.title;c.summary=document.getElementById('editChapterSummary').value.trim();c.scenes.forEach(sc=>{const t=document.querySelector(`[data-scene-title="${sc.id}"]`),o=document.querySelector(`[data-scene-objective="${sc.id}"]`);if(t)sc.title=t.value.trim()||sc.title;if(o)sc.objective=o.value.trim();});saveState();closeOverlay();toast('Chapter saved.');render();}
function saveSceneLarge(el){const sc=findScene(story(),el.dataset.id);if(!sc)return;saveVersion(sc,'Before manual edit');sc.title=document.getElementById('editSceneTitle').value.trim()||sc.title;sc.objective=document.getElementById('editSceneObjective').value.trim();sc.text=document.getElementById('editSceneText').value;story().words=totalStoryWords();saveState();closeOverlay();toast('Scene saved.');render();}
function analyzeAuthor(){const name=document.getElementById('authorName').value.trim()||'My Custom Voice',sample=document.getElementById('authorSample').value.trim();if(sample.length<80){toast('Paste a larger sample so Aurora can learn something useful.');return;}const sentences=sample.split(/[.!?]+/).filter(Boolean);const avg=Math.round(words(sample)/Math.max(1,sentences.length));const dialogue=(sample.match(/"/g)||[]).length/2;const metaphors=(sample.match(/\blike\b|\bas if\b/gi)||[]).length;const sens=(sample.match(/\bsmell|scent|ozone|rain|shadow|wind|heat|cold\b/gi)||[]).length;const profile={id:uid('author'),name,desc:`Custom voice learned from a ${words(sample)}-word sample.`,tags:[avg<15?'lean sentences':'longer sentences',dialogue>4?'dialogue-forward':'narration-forward',metaphors<3?'restrained imagery':'imagistic',sens<3?'selective sensory detail':'sensory-rich'],preview:sample.slice(0,220)+(sample.length>220?'…':'')};const s=story();s.customAuthorProfiles.push(profile);s.styleId=profile.id;saveState();closeOverlay();toast('Custom author profile created.');render();}
function openVersion(id){const v=story().versions.find(x=>x.id===id);if(!v)return;openReader({type:'version',id});}
function showStoryMenu(){ui.modal='storyMenu';renderOverlays();}
function restoreVersion(id){const v=story().versions.find(x=>x.id===id),sc=findScene(story(),v?.sceneId);if(!v||!sc)return;saveVersion(sc,'Before restore');sc.text=v.text;story().words=totalStoryWords();saveState();closeOverlay();toast('Version restored.');render();}
function createBranch(){const name=document.getElementById('branchName')?.value.trim()||`Branch ${story().branches.length+1}`,idea=document.getElementById('branchIdea')?.value.trim();if(!idea){toast('Tell Aurora what you want to test.');return;}story().branches.unshift({id:uid('branch'),name,idea,parentScene:currentSceneForStory()?.title||'Current scene',status:'Experimental',createdAt:now()});saveState();closeOverlay();toast('Branch created. Main story is untouched.');render();}
function saveSettings(){const key=document.getElementById('apiKey')?.value??ui.settingsDraft.api.key;ui.settingsDraft.api.endpoint=document.getElementById('apiEndpoint')?.value.trim()||ui.settingsDraft.api.endpoint;ui.settingsDraft.api.key=key;ui.settingsDraft.api.model=document.getElementById('apiModel')?.value.trim()||ui.settingsDraft.api.model;state.settings=deepClone(ui.settingsDraft);saveState();closeOverlay();toast('Settings saved.');render();}
function exportBackup(){const data=JSON.stringify({version:2,exportedAt:now(),state},null,2);const blob=new Blob([data],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=`aurora-backup-${new Date().toISOString().slice(0,10)}.json`;a.click();URL.revokeObjectURL(url);toast('Backup exported.');}
function restoreBackup(){const file=document.getElementById('backupInput').files?.[0];if(!file){toast('Choose a backup file first.');return;}const reader=new FileReader();reader.onload=()=>{try{const payload=JSON.parse(reader.result);state=payload.state?mergeState(payload.state):mergeState(payload);saveState();ui.modal=null;toast('Backup restored.');render();}catch{toast('That backup could not be read.');}};reader.readAsText(file);}
function resetApp(){state=deepClone(defaultState);saveState();ui.modal=null;toast('Aurora reset.');render();}

// Native-free helper dialogs for features that used to rely on window.prompt/confirm.
function customOwnDirector(){const val=document.getElementById('directorOwnText')?.value.trim();if(!val){toast('Tell Aurora what you want.');return;}const sc=currentSceneForStory();story().notes.unshift({id:uid('note'),text:val,sceneId:sc?.id,createdAt:now()});saveState();closeOverlay();toast('Direction saved for this scene.');render();}

// Extra modal content injected through modalOverlay via small dispatcher extension.
const oldModalOverlay = modalOverlay;
modalOverlay = function(name){
  if(name==='directorOwn')return shellOverlay(overlayHeader('Your direction','Tell Aurora what you want','Natural language is enough. The Director will translate it into hidden scene instructions.')+`<div class="editor-sheet"><div class="field"><label>Direction ${tip('Direction','Example: Make the protagonist suspicious but do not reveal the secret yet.')}</label><textarea id="directorOwnText" class="idea-editor" placeholder="I want this scene to…"></textarea></div></div><div class="sheet-footer two"><button class="btn" data-action="closeOverlay">Cancel</button><button class="btn primary" data-action="saveOwnDirector">Save direction</button></div>`);
  if(name==='confirmResetTaste')return confirmSheet('Reset your learned taste?','This removes learned likes, dislikes and confidence for this project. Your manuscript and Codex remain safe.','Reset learned taste','confirmResetTaste');
  if(name==='writingHelp')return shellOverlay(overlayHeader('Writing','How the writing screen works','You do not need to write prompts.')+`<div class="reader-sheet"><div class="reader-section"><h3>Write</h3><p>Use Guide me when you have no idea what should happen. Write your idea in plain language and Aurora turns it into scene direction.</p></div><div class="reader-section"><h3>Swipe</h3><p>Swipe creates alternatives. They stay non-canon until you accept one.</p></div><div class="reader-section"><h3>Clean</h3><p>Clean targets generic LLM prose such as decorative sensory padding, repetitive phrasing and forced figurative language.</p></div><div class="reader-section"><h3>Style</h3><p>Your author profile and Personal Taste are silently applied every time. They are not forgotten when a chat gets long.</p></div></div>`);
  if(name==='storyMenu')return shellOverlay(overlayHeader('Story tools','Story menu','Quick access to the tools you might need while writing.')+`<div class="choice-stack"><button class="choice-card" data-action="openSynopsis"><strong>📖 Read synopsis</strong><span>Review the story foundation and structure.</span></button><button class="choice-card" data-action="backups"><strong>💾 Backups</strong><span>Export or restore your local story data.</span></button><button class="choice-card" data-action="settings"><strong>⚙ Settings</strong><span>Theme, NanoGPT and tips.</span></button></div>`);
  if(name==='confirmReset')return confirmSheet('Reset local Aurora data?','This deletes local stories, taste, settings and API credentials from this browser. Export a backup first if there is anything you want to keep.','Yes, reset everything','resetConfirmed');
  if(name==='confirmRestore')return confirmSheet('Restore this backup?','This replaces the current local Aurora data with the selected backup. Your current data will not be recoverable after the page is refreshed, so restore only when you mean it.','Restore backup','restoreConfirmed');
  return oldModalOverlay(name);
};

// Extend action switch without making the main flow unreadable.
const oldHandleAction = handleAction;
handleAction = async function(action,el){
  if(action==='saveOwnDirector'){customOwnDirector();return;}
  if(action==='openVersion'){const v=story().versions.find(x=>x.id===el.dataset.id);if(v)openReader({type:'version',id:v.id});return;}
  if(action==='newBranch'){showModal('newBranch');return;}
  if(action==='saveBranch'){createBranch();return;}
  if(action==='settings'){showModal('settings');return;}
  if(action==='backups'){setView('more');setTimeout(()=>{document.getElementById('view').innerHTML=renderBackups();bindActions();},0);return;}
  if(action==='resetApp'){showModal('confirmReset');return;}
  if(action==='restoreVersion'){restoreVersion(el.dataset.id);return;}
  if(action==='closeOverlay'){closeOverlay();return;}
  return oldHandleAction(action,el);
};

const oldRenderOverlays = renderOverlays;
renderOverlays = function(){
  const root=document.getElementById('modal-root');root.innerHTML='';
  if(ui.reader){
    if(ui.reader.type==='version'){const v=story().versions.find(x=>x.id===ui.reader.id);root.innerHTML=v?shellOverlay(overlayHeader('Saved version',v.label,'Restore this exact text or simply read it.')+`<div class="reader-sheet book-page"><div class="manuscript scene-prose">${esc(v.text)}</div></div><div class="sheet-footer three"><button class="btn" data-action="closeOverlay">Close</button><button class="btn" data-action="restoreVersion" data-id="${v.id}">↶ Restore</button><button class="btn primary" data-action="openWriterFromReader">Write</button></div>`):'';}
    else if(ui.reader.type==='tasteHistory'){const h=story().taste.history||[];root.innerHTML=shellOverlay(overlayHeader('Taste history','What Aurora learned','Undo individual learning events in Advanced later; the MVP shows the learning trail here.')+`<div class="reader-sheet">${h.map(x=>`<div class="history-row"><span class="pill">${x.kind}</span><div><strong>${esc(x.text)}</strong><div class="tiny">${new Date(x.at).toLocaleString()}</div></div></div>`).join('')||'<div class="empty">No learning events yet.</div>'}</div>`);}
    else root.innerHTML=readerOverlay(ui.reader);
  } else if(ui.editor)root.innerHTML=editorOverlay(ui.editor); else if(ui.modal)root.innerHTML=modalOverlay(ui.modal);
  bindActions();
};

// New branch modal route.
const modalOverlayCore=modalOverlay;
modalOverlay=function(name){if(name==='newBranch')return shellOverlay(overlayHeader('Safe experiment','New branch','Describe the alternate decision. The main story remains untouched.')+`<div class="editor-sheet"><div class="field"><label>Branch name</label><input id="branchName" placeholder="What if he accepts?" /></div><div class="field"><label>What are you testing?</label><textarea id="branchIdea" class="idea-editor" placeholder="Example: He accepts the sect leader’s invitation and enters the capital early."></textarea></div></div><div class="sheet-footer two"><button class="btn" data-action="closeOverlay">Cancel</button><button class="btn primary" data-action="saveBranch">＋ Create branch</button></div>`);return modalOverlayCore(name);};

// Input used by import without cluttering the interface.
function ensureBackupInput(){let f=document.getElementById('backupInput');if(!f){f=document.createElement('input');f.type='file';f.accept='application/json,.json';f.id='backupInput';f.style.display='none';f.addEventListener('change',()=>{ui.modal='confirmRestore';renderOverlays();});document.body.appendChild(f);}}

window.nanoGPTGenerate=async function(messages,{temperature=.8,max_tokens=1200}={}){const {endpoint,key,model}=state.settings.api;if(!key)throw new Error('NanoGPT API key is not configured.');const res=await fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json','Authorization':`Bearer ${key}`},body:JSON.stringify({model,messages,temperature,max_tokens,stream:false})});if(!res.ok)throw new Error(`NanoGPT HTTP ${res.status}`);const data=await res.json();return data?.choices?.[0]?.message?.content||data?.output_text||'';};

applyTheme();ensureBackupInput();
if('serviceWorker' in navigator)window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}));
render();
