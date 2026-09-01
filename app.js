/* Aurora Story Studio MVP — dependency-free, GitHub Pages friendly. */

const STORAGE_KEY = 'aurora_story_studio_v1';
const palette = {
  Aurora: ['#a855f7','#7c3aed'], Ocean: ['#38bdf8','#2563eb'], Emerald: ['#34d399','#059669'], Crimson: ['#fb7185','#e11d48'], Amber: ['#fbbf24','#d97706'], Rose: ['#fb7185','#be185d'], Mono: ['#d4d4d8','#71717a']
};

const builtInStyles = [
  {id:'balanced', name:'Aurora Balanced', desc:'Concrete, readable, flexible; a safe default for long fiction.', tags:['natural','clear','adaptive']},
  {id:'quiet', name:'Quiet Literary', desc:'Restrained description, subtext-heavy dialogue, close observation.', tags:['restrained','subtext','intimate']},
  {id:'epic', name:'Epic Weight', desc:'Larger scale and stronger atmosphere, without decorative overload.', tags:['epic','grand','controlled']},
  {id:'fast', name:'Fast Modern', desc:'Lean paragraphs, active dialogue, quick scene movement.', tags:['fast','lean','dialogue']},
  {id:'cultivation', name:'Cultivation Chronicle', desc:'Mature progression, world history, calm power, earned reveals.', tags:['cultivation','mature','worldbuilding']}
];

const defaultState = {
  settings: { accent:'Aurora', theme:'dark', fontScale:1, api:{provider:'NanoGPT', endpoint:'https://nano-gpt.com/api/v1/chat/completions', key:'', model:'deepseek-v4-pro'} },
  activeView:'library', activeStoryId:'demo',
  stories:[{
    id:'demo', title:"The Immortal's Retirement", genre:'Cultivation / Fantasy', status:'Draft', progress:8, words:1240, chapterCount:1,
    concept:"A 3,000-year-old immortal leaves the upper realms behind and settles anonymously in a remote lower realm, expecting an ordinary life. The lower realm has no idea who just arrived.",
    premise:"An exhausted immortal emperor chooses quiet life over glory, but the people around him slowly pull him into a world whose small problems turn out to have larger roots.",
    styleId:'cultivation', pov:'Third Person Limited', aiWritesUser:true,
    characters:[
      {id:'c1',name:'Ruin',role:'Protagonist',type:'character',desc:'Ancient immortal emperor. Calm, observant, quietly humorous. Wants an ordinary life and avoids unnecessary displays of power.',visual:'Tall mature man; understated dark robes; composed face; silver-black hair; relaxed posture.'},
      {id:'c2',name:'Mira',role:'Village Healer',type:'character',desc:'Practical village healer. Blunt, curious and suspicious of people who seem too capable.',visual:'Young adult woman; practical linen clothing; dark braided hair; focused eyes.'},
      {id:'c3',name:'Old Jian',role:'Merchant',type:'character',desc:'Talkative local merchant who sees every problem as either business or gossip.',visual:'Older man; round spectacles; travel-worn coat; expressive hands.'}
    ],
    locations:[
      {id:'l1',name:'Cloudreed Village',type:'location',desc:'Small lower-realm settlement surrounded by reed fields and distant mountains.'},
      {id:'l2',name:'Old North Road',type:'location',desc:'A trade road connecting the village to a provincial city.'}
    ],
    factions:[{id:'f1',name:'Reed Valley Sect',type:'faction',desc:'A minor cultivation sect that treats the village as its outer territory.'}],
    items:[{id:'i1',name:'Plain Iron Bell',type:'item',desc:'A cheap bell Ruin keeps above his door.'}],
    rules:[{id:'r1',name:'Upper-Realm Secrecy',type:'rule',desc:'Ruin\'s identity should not be casually discovered. His power is obvious only when he chooses to reveal it.'}],
    acts:[
      {id:'a1',title:'Act I — The Quiet Life',pct:20, chapters:[{id:'ch1',title:'The House at the Edge',summary:'Ruin arrives, repairs an old house and meets the village healer. The chapter establishes his quiet routine and the first sign that the village sits on something unusual.',scenes:[{id:'s1',title:'Arrival',objective:'Establish the protagonist and the quiet-life premise.',text:'Ruin stopped at the end of the north road and looked over Cloudreed Village. The houses were small. The fields were green. Nobody bowed.\n\nHe liked that.\n\nA broken cart sat beside the road. A woman was arguing with the driver while three villagers watched. Ruin considered walking past.\n\nThen the wheel came loose.\n\nHe sighed, picked it up, and carried it toward them.'}]}]},
      {id:'a2',title:'Act II — Small Problems',pct:55,chapters:[]},
      {id:'a3',title:'Act III — What Sleeps Below',pct:85,chapters:[]}
    ],
    notes:[], branches:[], versions:[], swipes:{},
    taste:{likes:[],dislikes:[],confidence:{},learning:true,snapshot:null},
    customAuthorProfiles:[]
  }],
  ui:{tourSeen:false}
};

let state = loadState();
let transient = { modal:null, swipeIndex:0, candidates:[] };

function deepClone(x){ return JSON.parse(JSON.stringify(x)); }
function loadState(){
  try { const raw=localStorage.getItem(STORAGE_KEY); if(raw){ const parsed=JSON.parse(raw); return {...deepClone(defaultState),...parsed, settings:{...defaultState.settings,...parsed.settings,api:{...defaultState.settings.api,...(parsed.settings.api||{})}}}; }} catch(e){}
  return deepClone(defaultState);
}
function saveState(){ localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
function escapeHtml(s){ return String(s??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#039;','"':'&quot;'}[c])); }
function story(){ return state.stories.find(s=>s.id===state.activeStoryId) || state.stories[0]; }
function currentScene(){ return story().acts?.[0]?.chapters?.[0]?.scenes?.[0] || null; }
function applyPalette(){ const p=palette[state.settings.accent]||palette.Aurora; document.documentElement.style.setProperty('--accent',p[0]); document.documentElement.style.setProperty('--accent-2',p[1]); }
function toast(msg){ const t=document.getElementById('toast'); t.textContent=msg; t.classList.add('show'); clearTimeout(toast._t); toast._t=setTimeout(()=>t.classList.remove('show'),1800); }
function setView(v){ state.activeView=v; render(); saveState(); window.scrollTo({top:0,behavior:'smooth'}); }

function render(){ applyPalette(); const root=document.getElementById('view'); document.querySelectorAll('.nav-item').forEach(b=>b.classList.toggle('active',b.dataset.view===state.activeView));
  const v=state.activeView;
  if(v==='library') root.innerHTML=renderLibrary();
  else if(v==='story') root.innerHTML=renderStory();
  else if(v==='write') root.innerHTML=renderWrite();
  else if(v==='codex') root.innerHTML=renderCodex();
  else root.innerHTML=renderMore();
  bindActions();
  if(transient.modal) renderModal();
}

function renderLibrary(){
  return `<section class="hero">
    <div class="eyebrow">Private AI Story Studio</div>
    <h1>Make the story.<br><span class="muted">Let Aurora manage it.</span></h1>
    <p>Your concept becomes characters, world, outline, scenes and persistent memory. Your taste improves the engine as you write.</p>
    <div class="hero-actions"><button class="btn primary" data-action="newStory">✨ New Concept</button><button class="btn" data-action="quickDemo">Open Demo</button></div>
  </section>
  <div class="section-title row"><strong>My Stories</strong><span class="tiny">${state.stories.length} projects</span></div>
  <div class="grid two">${state.stories.map(renderStoryCard).join('')}</div>
  <div class="section-title">What Aurora learns</div>
  <div class="grid three">
    <div class="card soft"><div class="kpi">🧠</div><h3>What you like</h3><div class="muted">Edits, swipes and approvals become your personal writing taste.</div></div>
    <div class="card soft"><div class="kpi">🧭</div><h3>What matters now</h3><div class="muted">Only relevant memory reaches the writer, even after 100+ chapters.</div></div>
    <div class="card soft"><div class="kpi">✨</div><h3>What sounds right</h3><div class="muted">Author profile + your taste + current scene, compiled automatically.</div></div>
  </div>`;
}
function renderStoryCard(s){ return `<article class="card story-card"><div class="row"><span class="pill">${escapeHtml(s.genre)}</span><span class="tiny">${s.status}</span></div><h3 style="margin-top:22px">${escapeHtml(s.title)}</h3><div class="story-meta">${s.chapterCount} chapter${s.chapterCount===1?'':'s'} · ${s.words.toLocaleString()} words</div><div class="progress"><span style="width:${s.progress}%"></span></div><div class="row"><span class="tiny">${s.progress}% foundation</span><button class="btn primary small" data-action="openStory" data-id="${s.id}">Open</button></div></article>`; }

function renderStory(){ const s=story(); return `<section class="hero"><div class="row"><div><div class="eyebrow">Story</div><h1 style="font-size:38px">${escapeHtml(s.title)}</h1><div class="story-meta">${escapeHtml(s.genre)} · ${s.pov}</div></div><button class="btn" data-action="storyMenu">⋯</button></div></section>
  <div class="grid two">
    <div class="card"><div class="row"><div><div class="tiny">Current Chapter</div><h3>Chapter 1 — The House at the Edge</h3></div><span class="pill">Draft</span></div><p class="muted">${escapeHtml(s.acts[0].chapters[0].summary)}</p><div class="hero-actions"><button class="btn primary" data-view="write">Continue writing</button><button class="btn" data-action="openPlan">Plan</button></div></div>
    <div class="card"><div class="tiny">Story Foundation</div><div class="kpi">${s.progress}%</div><div class="progress"><span style="width:${s.progress}%"></span></div><div class="stat-row"><span class="muted">Codex</span><strong>${s.characters.length+s.locations.length+s.factions.length+s.items.length+s.rules.length}</strong></div><div class="stat-row"><span class="muted">Acts</span><strong>${s.acts.length}</strong></div><div class="stat-row"><span class="muted">Branches</span><strong>${s.branches.length}</strong></div></div>
  </div>
  <div class="section-title row"><strong>Story workspace</strong><span class="tiny">Everything linked</span></div>
  <div class="grid two">
    ${quickTile('◈','Codex','Characters, locations, factions, rules','codex')}
    ${quickTile('☷','Outline','Acts → chapters → scene objectives','plan')}
    ${quickTile('✦','AI Director','Get logical, interesting or bold next directions','director')}
    ${quickTile('↗','Branches','Test a plot without touching canon','branches')}
  </div>`; }
function quickTile(icon,title,desc,action){ return `<button class="card soft" style="text-align:left" data-action="${action}"><div class="kpi">${icon}</div><h3>${title}</h3><div class="muted">${desc}</div></button>`; }

function renderCodex(){ const s=story(); const groups=[['Characters',s.characters],['Locations',s.locations],['Factions',s.factions],['Items',s.items],['Rules',s.rules]]; return `<section class="hero"><div class="row"><div><div class="eyebrow">Story Brain</div><h1 style="font-size:38px">Codex</h1><div class="story-meta">Aurora keeps this synchronized with the manuscript.</div></div><button class="btn primary small" data-action="newCodex">＋ Add</button></div></section>
  <div class="field"><input id="codexSearch" placeholder="Search characters, places, lore…" /></div>
  <div id="codexList" class="stack">${groups.map(([name,items])=>`<div class="card"><div class="row"><h3>${name}</h3><span class="tiny">${items.length}</span></div><div class="list">${items.map(item=>`<div class="list-item" data-action="editCodex" data-type="${item.type}" data-id="${item.id}"><div class="avatar">${item.type==='character'?'◉':item.type==='location'?'⌖':item.type==='faction'?'⚑':item.type==='rule'?'✓':'◇'}</div><div style="min-width:0"><strong>${escapeHtml(item.name)}</strong><div class="tiny">${escapeHtml(item.desc).slice(0,100)}${item.desc.length>100?'…':''}</div></div></div>`).join('')||'<div class="empty">Nothing here yet. Aurora can discover entries from the manuscript.</div>'}</div></div>`).join('')}</div>`; }

function renderPlan(){ const s=story(); return `<section class="hero"><div class="row"><div><div class="eyebrow">Plot Brain</div><h1 style="font-size:38px">Outline</h1><div class="story-meta">The plan is guidance, not a prison.</div></div><button class="btn primary small" data-action="expandOutline">✨ Improve Plan</button></div></section>
  ${s.acts.map((a,ai)=>`<div class="card"><div class="row"><div><span class="pill">Act ${ai+1}</span><h3 style="margin-top:9px">${escapeHtml(a.title)}</h3></div><span class="tiny">${a.pct}%</span></div><div class="stack">${a.chapters.map((c,ci)=>`<div class="chapter-row"><div class="row"><div><strong>Chapter ${ci+1} — ${escapeHtml(c.title)}</strong><div class="tiny">${c.scenes.length} scene${c.scenes.length===1?'':'s'}</div></div><button class="btn small" data-action="editChapter" data-act="${ai}" data-ch="${ci}">Edit</button></div><p>${escapeHtml(c.summary)}</p>${c.scenes.map(sc=>`<div class="tiny" style="margin-top:9px">• ${escapeHtml(sc.title)} — ${escapeHtml(sc.objective)}</div>`).join('')}</div>`).join('')}</div></div>`).join('')}`; }

function renderWrite(){ const s=story(); const sc=currentScene(); const cand=transient.candidates.length?transient.candidates: [sc?.text||'']; const idx=Math.min(transient.swipeIndex,cand.length-1); return `<section class="hero"><div class="row"><div><div class="eyebrow">Writer</div><h1 style="font-size:34px">Chapter 1</h1><div class="story-meta">${escapeHtml(sc?.title||'Scene')} · ${s.pov} · ${escapeHtml(styleName(s))}</div></div><button class="btn" data-action="openSettings">⚙</button></div></section>
  <div class="card editor"><div class="row" style="margin-bottom:12px"><span class="pill">Style Lock ✓</span><span class="tiny">Taste engine ${s.taste.learning?'ON':'frozen'}</span></div><div class="manuscript" id="manuscript">${escapeHtml(cand[idx])}</div><div class="editor-actions"><button class="btn" data-action="cleanProse">✨ Clean</button><button class="btn" data-action="director">Guide me</button><button class="btn primary" data-action="swipe">Swipe →</button></div><div class="row" style="margin-top:10px"><span class="tiny">${s.words.toLocaleString()} words · ${s.versions.length} saved versions</span><span class="swipe-count">${idx+1} / ${cand.length}</span></div></div>`; }

function renderMore(){ return `<section class="hero"><div class="eyebrow">Control center</div><h1 style="font-size:38px">More</h1><p>Advanced systems live here. The normal writing experience stays clean.</p></section><div class="grid two">
  ${quickTile('✍','Authors','Author profiles and custom style analysis','authors')}
  ${quickTile('🧠','My Taste','What Aurora learned about your writing','taste')}
  ${quickTile('↗','Branches','Alternate plot paths and checkpoints','branches')}
  ${quickTile('◷','Versions','Restore previous accepted states','versions')}
  ${quickTile('⌁','Timeline','Story events and persistent state','timeline')}
  ${quickTile('⚙','Settings','Theme, NanoGPT, advanced options','settings')}
</div>`; }

function renderTaste(){ const s=story(); const t=s.taste; return `<section class="hero"><div class="eyebrow">Personal Writing Model</div><h1 style="font-size:38px">My Taste</h1><p>Aurora learns from explicit feedback, edits, swipes and accepted generations. Your current project uses this profile automatically.</p></section><div class="card"><div class="row"><div><h3>Learning</h3><div class="tiny">Learn from this project</div></div><button class="btn ${t.learning?'primary':''}" data-action="toggleLearning">${t.learning?'ON':'OFF'}</button></div></div><div class="section-title">Known preferences</div><div class="grid two"><div class="card soft"><h3>Likes</h3><div class="chips">${t.likes.length?t.likes.map(x=>`<span class="chip active">${escapeHtml(x)}</span>`).join(''):'<span class="muted">Your choices will appear here.</span>'}</div></div><div class="card soft"><h3>Dislikes</h3><div class="chips">${t.dislikes.length?t.dislikes.map(x=>`<span class="chip">${escapeHtml(x)}</span>`).join(''):'<span class="muted">The app will learn these from your edits.</span>'}</div></div></div><div class="section-title row"><strong>Controls</strong><div><button class="btn small" data-action="saveTaste">Save snapshot</button> <button class="btn small danger" data-action="resetTaste">Reset</button></div></div><div class="card soft"><div class="tiny">Baseline</div><p>${t.snapshot?'Snapshot saved. Current learning may continue from it.':'No snapshot yet. Save one once the profile feels right.'}</p></div>`; }

function styleName(s){ return (builtInStyles.find(x=>x.id===s.styleId)||s.customAuthorProfiles?.find(x=>x.id===s.styleId)||{name:'My Taste'}).name; }
function renderAuthors(){ const s=story(); const all=[...builtInStyles,...(s.customAuthorProfiles||[])]; return `<section class="hero"><div class="row"><div><div class="eyebrow">Author Library</div><h1 style="font-size:38px">Voice</h1><div class="story-meta">Choose a profile or make your own from a sample.</div></div><button class="btn primary small" data-action="newAuthor">＋ Create</button></div></section><div class="list">${all.map(a=>`<div class="card"><div class="row"><div><h3>${escapeHtml(a.name)}</h3><div class="tiny">${escapeHtml(a.desc)}</div></div><button class="btn small ${s.styleId===a.id?'primary':''}" data-action="useAuthor" data-id="${a.id}">${s.styleId===a.id?'Active':'Use'}</button></div><div class="chips" style="margin-top:9px">${(a.tags||[]).map(t=>`<span class="chip">${escapeHtml(t)}</span>`).join('')}</div><div class="tiny" style="margin-top:10px">Preview: ${escapeHtml(stylePreview(a.id))}</div></div>`).join('')}</div>`; }
function stylePreview(id){ const map={balanced:'Concrete narration, selective detail, natural dialogue.',quiet:'He waited. She said nothing. Neither of them filled the silence.',epic:'The valley opened beneath the road, wide enough to swallow the last house.',fast:'He opened the door. The room was empty. The phone rang behind him.',cultivation:'Ruin set the cup down. The old man across the table had finally stopped pretending not to recognize him.'}; return map[id]||'A user-trained style profile built from your sample.'; }

function renderModal(){ const mr=document.getElementById('modal-root'); let body=''; const s=story();
  if(transient.modal==='newStory') body=`<div class="modal"><div class="row"><div><h2>New Concept</h2><div class="muted">Give Aurora the messy version. It will do the organizing.</div></div><button class="icon-btn" data-action="closeModal">×</button></div><div class="field"><label>What are you thinking about?</label><textarea id="newConcept" placeholder="Example: an ancient immortal retires to a lower realm and tries to live an ordinary life…"></textarea></div><div class="field"><label>Story mode</label><div class="grid two"><div class="choice selected" data-choice="novel"><h4>Novel</h4><p>Chapters, scenes, prose and continuity.</p></div><div class="choice" data-choice="comic"><h4>Comic</h4><p>Story first; visual pipeline follows later.</p></div></div></div><div class="hero-actions"><button class="btn" data-action="closeModal">Cancel</button><button class="btn primary" data-action="buildStory">✨ Build foundation</button></div></div>`;
  else if(transient.modal==='director') body=`<div class="modal"><div class="row"><div><h2>AI Director</h2><div class="muted">Pick a direction. You can always branch.</div></div><button class="icon-btn" data-action="closeModal">×</button></div><div class="stack" style="margin-top:12px">${[['logical','🧭','Logical','Most natural and earned'],['interesting','✦','Interesting','Stronger creative move'],['bold','⚡','Bold','Riskier, surprising direction'],['own','✎','Write my own','Give Aurora your exact intent']].map(x=>`<div class="choice" data-action="directorPick" data-mode="${x[0]}"><h4>${x[1]} ${x[2]}</h4><p>${x[3]}</p></div>`).join('')}</div></div>`;
  else if(transient.modal==='swipe') body=`<div class="modal"><div class="row"><div><h2>Swipe alternatives</h2><div class="muted">Alternatives stay non-canon until you accept one.</div></div><button class="icon-btn" data-action="closeModal">×</button></div><div class="card soft" style="margin-top:12px"><div class="manuscript">${escapeHtml(transient.candidates[transient.swipeIndex]||'')}</div></div><div class="row" style="margin-top:12px"><button class="btn" data-action="prevSwipe">‹ Previous</button><span class="swipe-count">${transient.swipeIndex+1} / ${transient.candidates.length}</span><button class="btn" data-action="nextSwipe">Next ›</button></div><div class="hero-actions"><button class="btn" data-action="learnSwipe" data-feedback="dislike">Not like this</button><button class="btn" data-action="learnSwipe" data-feedback="like">❤️ More like this</button><button class="btn primary" data-action="acceptSwipe">✓ Accept</button></div></div>`;
  else if(transient.modal==='taste'){ document.getElementById('view').innerHTML=renderTaste(); return; }
  else if(transient.modal==='authors'){ document.getElementById('view').innerHTML=renderAuthors(); return; }
  else if(transient.modal==='settings') body=`<div class="modal"><div class="row"><div><h2>Settings</h2><div class="muted">The beautiful part stays simple. Advanced lives below.</div></div><button class="icon-btn" data-action="closeModal">×</button></div><div class="section-title">Appearance</div><div class="field"><label>Accent color</label><div class="chips">${Object.keys(palette).map(k=>`<button class="chip ${state.settings.accent===k?'active':''}" data-action="setAccent" data-accent="${k}">${k}</button>`).join('')}</div></div><div class="field"><label>Theme</label><select id="themeSelect"><option value="dark">Dark</option><option value="system">System (dark shell)</option></select></div><div class="section-title">NanoGPT</div><div class="field"><label>API endpoint</label><input id="apiEndpoint" value="${escapeHtml(state.settings.api.endpoint)}" /></div><div class="field"><label>API key</label><input id="apiKey" type="password" value="${escapeHtml(state.settings.api.key)}" placeholder="Stored only in this browser" /></div><div class="field"><label>Model</label><input id="apiModel" value="${escapeHtml(state.settings.api.model)}" /></div><button class="btn" data-action="saveApi">Save connection</button><div class="section-title">Advanced</div><div class="card soft"><div class="muted">Context compiler, memory retrieval, style lock, prose evaluator and model routing are engine features. The MVP keeps their controls hidden while the architecture is ready for them.</div></div></div>`;
  else if(transient.modal==='newCodex') body=`<div class="modal"><div class="row"><div><h2>Add Codex Entry</h2><div class="muted">Tell Aurora roughly what it is. It will structure it.</div></div><button class="icon-btn" data-action="closeModal">×</button></div><div class="field"><label>Type</label><select id="cType"><option value="character">Character</option><option value="location">Location</option><option value="faction">Faction</option><option value="item">Item</option><option value="rule">Rule</option></select></div><div class="field"><label>Name</label><input id="cName" placeholder="Mira" /></div><div class="field"><label>Rough description</label><textarea id="cDesc" placeholder="Describe it naturally. Aurora will organize the details."></textarea></div><button class="btn primary" data-action="saveCodex">Add to Codex</button></div>`;
  else if(transient.modal==='newAuthor') body=`<div class="modal"><div class="row"><div><h2>Create Author Profile</h2><div class="muted">Paste a representative passage you love. Aurora analyzes structural style traits.</div></div><button class="icon-btn" data-action="closeModal">×</button></div><div class="field"><label>Name</label><input id="authorName" placeholder="My Custom Voice" /></div><div class="field"><label>Sample</label><textarea id="authorSample" placeholder="Paste a chapter or several paragraphs here…"></textarea></div><button class="btn primary" data-action="analyzeAuthor">✨ Analyze style</button></div>`;
  else if(transient.modal==='clean') body=`<div class="modal"><div class="row"><div><h2>Clean Prose</h2><div class="muted">Remove common LLM padding without changing the story events.</div></div><button class="icon-btn" data-action="closeModal">×</button></div><div class="stack"><div class="choice selected"><h4>Decorative sensory padding</h4><p>Remove setting smells/sounds/temperature details that do not matter.</p></div><div class="choice selected"><h4>Purple prose</h4><p>Reduce forced metaphors, similes and ornamental phrasing.</p></div><div class="choice selected"><h4>LLM repetition</h4><p>Reduce repeated phrases, emotional labels and generic transitions.</p></div></div><button class="btn primary" style="margin-top:12px" data-action="runClean">Clean this scene</button></div>`;
  mr.innerHTML = body ? `<div class="modal-backdrop">${body}</div>` : ''; bindActions(); }

function showModal(name){ transient.modal=name; render(); }
function closeModal(){ transient.modal=null; render(); }

function buildStoryFromIdea(idea){
  const base = deepClone(defaultState.stories[0]); const cleaned=idea.trim(); base.id='s_'+Date.now(); base.title=titleFromIdea(cleaned); base.concept=cleaned; base.premise=cleaned ? cleaned.replace(/\.$/,'')+'. Aurora will build the world around this premise.' : base.premise; base.status='Draft'; base.progress=18; base.words=0; base.chapterCount=0; base.acts=[{id:'a1',title:'Act I — Foundation',pct:20,chapters:[{id:'ch1',title:'The Beginning',summary:'Establish the protagonist, premise and the first meaningful disturbance.',scenes:[{id:'s1',title:'Opening Scene',objective:'Establish normal life and the first hook.',text:'Start here. Aurora will write the opening scene from the concept and your taste profile.'}]}]},{id:'a2',title:'Act II — Pressure',pct:55,chapters:[]},{id:'a3',title:'Act III — Consequences',pct:85,chapters:[]}]; base.characters=[]; base.locations=[]; base.factions=[]; base.items=[]; base.rules=[]; base.branches=[]; base.versions=[]; base.swipes={};
  seedFromIdea(base, cleaned); return base;
}
function titleFromIdea(idea){ if(!idea) return 'Untitled Story'; const words=idea.replace(/[^a-z0-9'\s-]/gi,'').split(/\s+/).filter(Boolean); const pick=words.slice(0,4).map(w=>w[0]?.toUpperCase()+w.slice(1)).join(' '); return pick.length<4?'New Story':pick; }
function seedFromIdea(s,idea){
  const low=idea.toLowerCase();
  if(low.includes('immortal')||low.includes('cultivation')){ s.genre='Cultivation / Fantasy'; s.styleId='cultivation'; s.characters=[{id:'c1',name:'Protagonist',role:'Protagonist',type:'character',desc:'Mature, powerful and deliberately restrained. The exact personality will be refined from your direction.',visual:'Generate from your chosen visual profile.'}]; }
  else { s.genre='Fantasy / Fiction'; s.styleId='balanced'; s.characters=[{id:'c1',name:'Protagonist',role:'Protagonist',type:'character',desc:'Central character generated from the concept. Refine through natural-language direction.',visual:'Generate from story context.'}]; }
  s.locations=[{id:'l1',name:'Primary Setting',type:'location',desc:'Main location inferred from the concept.'}]; s.rules=[{id:'r1',name:'Story Truth',type:'rule',desc:'The premise remains stable while details can evolve.'}];
}
function acceptSceneText(text){ const s=story(); const sc=currentScene(); if(!sc) return; s.versions.push({id:'v_'+Date.now(),sceneId:sc.id,text:sc.text,createdAt:new Date().toISOString(),label:'Before acceptance'}); sc.text=text; s.words=text.split(/\s+/).filter(Boolean).length; s.chapterCount=Math.max(1,s.chapterCount); s.progress=Math.min(100,Math.max(s.progress,28)); updateTasteFromAcceptance(text); transient.candidates=[]; transient.swipeIndex=0; saveState(); render(); toast('Accepted. Story memory updated.'); }

function demoSwipeCandidates(){ const sc=currentScene(); const base=sc?.text||''; return [base, base+'\n\nAt the gate, Mira looked at the wheel, then at Ruin.\n"You fixed that too quickly."\nHe handed her the axle pin.\n"It was only a wheel."', base+'\n\nThe wheel hit the dirt. Ruin caught it before it rolled away. Nobody in the village noticed the speed of his hand except Mira. She said nothing.'] }
function updateTasteFromAcceptance(text){ const s=story(); if(!s.taste.learning) return; const t=s.taste; const tags=[]; if(text.includes('\n\n')) tags.push('clean paragraph breaks'); if(text.split('"').length>3) tags.push('dialogue'); if(!/smell|scent|ozone|diesel|spice/i.test(text)) tags.push('restrained sensory detail'); tags.forEach(x=>{ if(!t.likes.includes(x)) t.likes.push(x); t.confidence[x]=(t.confidence[x]||0)+1; }); }
function addTasteDislike(){ const s=story(); if(!s.taste.learning) return; const t=s.taste; const x='generic LLM phrasing'; if(!t.dislikes.includes(x)) t.dislikes.push(x); t.confidence[x]=(t.confidence[x]||0)+1; }
function cleanText(text){ return text.replace(/\b(the smell of|a scent of|the scent of|the air was|a chill crept|a flicker of|a wave of)\b[^.?!]*[.?!]/gi,'').replace(/\b(like|as if)\b[^.?!]{0,80}[.?!]/gi, m=>m.length>55?'':m).replace(/\b(felt|realized|knew|noticed)\s+/gi,'').replace(/\n{3,}/g,'\n\n').trim(); }

function bindActions(){
  document.querySelectorAll('[data-view]').forEach(b=>b.addEventListener('click',()=>setView(b.dataset.view)));
  document.querySelectorAll('[data-action]').forEach(el=>el.addEventListener('click',()=>handleAction(el.dataset.action,el)));
  const q=document.getElementById('codexSearch'); if(q) q.addEventListener('input',()=>{ const term=q.value.toLowerCase(); document.querySelectorAll('#codexList .list-item').forEach(i=>i.style.display=i.textContent.toLowerCase().includes(term)?'flex':'none'); });
}
async function handleAction(action,el){
  const s=story();
  if(action==='newStory') return showModal('newStory');
  if(action==='buildStory'){
    const ideaEl=document.getElementById('newConcept'); const idea=(ideaEl?.value||'').trim();
    if(!idea) return toast('Give Aurora the idea first.');
    closeModal();
    if(state.settings.api.key){
      toast('Building your foundation with NanoGPT…');
      const prompt=[
        {role:'system',content:'You are Aurora Story Studio\'s story architect. Return ONLY valid JSON with keys: title, genre, premise, characters, locations, factions, items, rules, acts. Build a practical novel foundation from the user\'s rough idea. Keep character and world details concise but useful. Each character needs id,name,role,type,desc,visual. Each location/faction/item/rule needs id,name,type,desc. Each act needs id,title,pct,chapters; each chapter needs id,title,summary,scenes; each scene needs id,title,objective,text. The text field should be an empty string.'},
        {role:'user',content:idea}
      ];
      window.nanoGPTGenerate(prompt,{temperature:.75,max_tokens:3500}).then(raw=>{
        let parsed; try{ parsed=JSON.parse(raw.replace(/^```json\s*|\s*```$/g,'')); }catch(e){ parsed=null; }
        const base=buildStoryFromIdea(idea); if(parsed){
          Object.assign(base,{title:parsed.title||base.title,genre:parsed.genre||base.genre,premise:parsed.premise||base.premise,characters:parsed.characters||base.characters,locations:parsed.locations||base.locations,factions:parsed.factions||[],items:parsed.items||[],rules:parsed.rules||base.rules,acts:parsed.acts||base.acts,chapterCount:0,words:0,progress:35});
        }
        state.stories.unshift(base); state.activeStoryId=base.id; saveState(); setView('story'); toast('Foundation built.');
      }).catch(()=>{ const base=buildStoryFromIdea(idea); state.stories.unshift(base); state.activeStoryId=base.id; saveState(); setView('story'); toast('Foundation built locally; NanoGPT was unavailable.'); });
    } else {
      const base=buildStoryFromIdea(idea); state.stories.unshift(base); state.activeStoryId=base.id; saveState(); setView('story'); toast('Foundation built locally. Add NanoGPT later for richer generation.');
    }
    return;
  }
  if(action==='openStory'){ state.activeStoryId=el.dataset.id; setView('story'); return; }
  if(action==='quickDemo'){state.activeStoryId='demo'; setView('story'); return;}
  if(action==='openPlan') return renderRoute('plan');
  if(action==='plan'){ document.getElementById('view').innerHTML=renderPlan(); bindActions(); return; }
  if(action==='director'||action==='directorPick'){ if(action==='director') return showModal('director'); const mode=el.dataset.mode; closeModal(); if(mode==='own') { const idea=prompt('What do you want Aurora to do?'); if(idea){ const sc=currentScene(); sc.text += '\n\n[Director note: '+idea+']'; toast('Direction saved for this scene.'); saveState(); render(); }} else { toast({logical:'Logical direction selected.',interesting:'Interesting direction selected.',bold:'Bold direction selected.'}[mode]); addTasteLike(mode==='bold'?'bold plot turns':'earned scene progression'); } return; }
  if(action==='swipe'){ transient.candidates=demoSwipeCandidates(); transient.swipeIndex=Math.min(1,transient.candidates.length-1); renderWrite(); showModal('swipe'); return; }
  if(action==='nextSwipe'){ transient.swipeIndex=Math.min(transient.candidates.length-1,transient.swipeIndex+1); render(); return; }
  if(action==='prevSwipe'){ transient.swipeIndex=Math.max(0,transient.swipeIndex-1); render(); return; }
  if(action==='acceptSwipe'){ acceptSceneText(transient.candidates[transient.swipeIndex]||''); return; }
  if(action==='learnSwipe'){ if(el.dataset.feedback==='like') updateTasteFromAcceptance(transient.candidates[transient.swipeIndex]||''); else addTasteDislike(); toast('Taste engine learned from your choice.'); return; }
  if(action==='cleanProse') return showModal('clean');
  if(action==='runClean'){ const sc=currentScene(); const cleaned=cleanText(sc.text); s.versions.push({id:'v_'+Date.now(),sceneId:sc.id,text:sc.text,createdAt:new Date().toISOString(),label:'Before prose clean'}); sc.text=cleaned; saveState(); closeModal(); toast('Prose cleaned without changing the story direction.'); return; }
  if(action==='codex') return setView('codex');
  if(action==='newCodex') return showModal('newCodex');
  if(action==='saveCodex'){ const type=document.getElementById('cType').value,name=document.getElementById('cName').value.trim(),desc=document.getElementById('cDesc').value.trim(); if(!name) return toast('Give it a name first.'); const item={id:'x_'+Date.now(),type,name,desc:desc||'Created from a rough user description.'}; const arr=({character:'characters',location:'locations',faction:'factions',item:'items',rule:'rules'})[type]; s[arr].push(item); saveState(); closeModal(); toast('Added to Codex.'); return; }
  if(action==='editCodex'){ const id=el.dataset.id; const type=el.dataset.type; const arr=({character:'characters',location:'locations',faction:'factions',item:'items',rule:'rules'})[type]; const item=s[arr].find(x=>x.id===id); if(item){ const n=prompt('Name',item.name); if(n!==null&&n.trim()) item.name=n.trim(); const d=prompt('Description',item.desc); if(d!==null) item.desc=d; saveState(); render(); } return; }
  if(action==='authors') return renderRoute('authors');
  if(action==='newAuthor') return showModal('newAuthor');
  if(action==='analyzeAuthor'){ const name=document.getElementById('authorName').value.trim()||'My Custom Voice'; const sample=document.getElementById('authorSample').value.trim(); if(!sample) return toast('Paste a sample first.'); const profile=heuristicAuthor(name,sample); s.customAuthorProfiles=s.customAuthorProfiles||[]; s.customAuthorProfiles.push(profile); s.styleId=profile.id; saveState(); closeModal(); toast('Custom author profile created.'); render(); return; }
  if(action==='useAuthor'){ s.styleId=el.dataset.id; saveState(); toast('Style locked for this story.'); render(); return; }
  if(action==='taste') return renderRoute('taste');
  if(action==='toggleLearning'){ s.taste.learning=!s.taste.learning; saveState(); renderRoute('taste'); return; }
  if(action==='saveTaste'){ s.taste.snapshot=deepClone(s.taste); saveState(); toast('Taste snapshot saved.'); return; }
  if(action==='resetTaste'){ if(confirm('Reset the learned taste for this story to its baseline?')){ s.taste={likes:[],dislikes:[],confidence:{},learning:true,snapshot:s.taste.snapshot}; saveState(); toast('Taste reset.'); renderRoute('taste'); } return; }
  if(action==='branches') return renderBranches();
  if(action==='versions') return renderVersions();
  if(action==='timeline') return renderTimeline();
  if(action==='settings'||action==='openSettings') return showModal('settings');
  if(action==='setAccent'){state.settings.accent=el.dataset.accent; saveState(); render(); if(transient.modal) showModal('settings'); return;}
  if(action==='saveApi'){state.settings.api.endpoint=document.getElementById('apiEndpoint').value.trim(); state.settings.api.key=document.getElementById('apiKey').value; state.settings.api.model=document.getElementById('apiModel').value.trim(); saveState(); toast('NanoGPT settings saved locally.'); return;}
  if(action==='closeModal') return closeModal();
  if(action==='more') return setView('more');
  if(action==='back') return setView('library');
  if(action==='storyMenu'){ toast('Story menu ready. Advanced actions will appear here.'); return; }
  if(action==='expandOutline'){ s.progress=Math.min(100,s.progress+8); s.acts[0].chapters.push({id:'ch_'+Date.now(),title:'A New Complication',summary:'A new complication is introduced without breaking established character motivation.',scenes:[{id:'s_'+Date.now(),title:'Pressure Rises',objective:'Complicate the current goal while preserving continuity.',text:''}]}); saveState(); toast('Outline expanded.'); render(); return; }
  if(action==='editChapter'){ toast('Chapter editing is wired for the next iteration.'); return; }
}
function addTasteLike(x){ const t=story().taste; if(t.learning&&!t.likes.includes(x)) t.likes.push(x); saveState(); }
function renderRoute(route){ state.activeView='more'; render(); setTimeout(()=>{ let html; if(route==='taste') html=renderTaste(); else if(route==='authors') html=renderAuthors(); else if(route==='plan') html=renderPlan(); document.getElementById('view').innerHTML=html||renderMore(); bindActions(); },0); }
function renderBranches(){ const s=story(); document.getElementById('view').innerHTML=`<section class="hero"><div class="row"><div><div class="eyebrow">Safe Experiments</div><h1 style="font-size:38px">Branches</h1><div class="story-meta">Try a new plot without touching the main timeline.</div></div><button class="btn primary small" onclick="window.createBranch()">＋ Branch</button></div></section><div class="list">${s.branches.map(b=>`<div class="card"><div class="row"><div><h3>${escapeHtml(b.name)}</h3><div class="tiny">Parent: ${escapeHtml(b.parentScene||'Current scene')}</div></div><span class="pill">${escapeHtml(b.status)}</span></div><p class="muted">${escapeHtml(b.idea)}</p></div>`).join('')||'<div class="empty">No branches yet. Create one from the current scene when you want to experiment.</div>'}</div>`; }
window.createBranch=function(){ const s=story(); const idea=prompt('What are you testing?'); if(!idea) return; s.branches.push({id:'b_'+Date.now(),name:'Branch '+(s.branches.length+1),idea,parentScene:currentScene()?.title||'Current scene',status:'Experimental'}); saveState(); toast('Branch created. Canon is untouched.'); renderBranches(); };
function renderVersions(){ const s=story(); document.getElementById('view').innerHTML=`<section class="hero"><div class="eyebrow">Safety net</div><h1 style="font-size:38px">Versions</h1><p>Every accepted rewrite and prose clean stores the previous text.</p></section><div class="list">${s.versions.map(v=>`<div class="card"><div class="row"><div><h3>${escapeHtml(v.label)}</h3><div class="tiny">${new Date(v.createdAt).toLocaleString()}</div></div><button class="btn small" onclick="window.restoreVersion('${v.id}')">Restore</button></div></div>`).join('')||'<div class="empty">No versions yet.</div>'}</div>`; }
window.restoreVersion=function(id){ const s=story(),v=s.versions.find(x=>x.id===id); if(!v) return; const sc=currentScene(); s.versions.push({id:'v_'+Date.now(),sceneId:sc.id,text:sc.text,createdAt:new Date().toISOString(),label:'Before restore'}); sc.text=v.text; saveState(); toast('Version restored.'); renderWrite(); };
function renderTimeline(){ const s=story(); document.getElementById('view').innerHTML=`<section class="hero"><div class="eyebrow">Persistent State</div><h1 style="font-size:38px">Timeline</h1><p>Long-term facts and current story state live separately from the raw manuscript.</p></section><div class="card"><div class="row"><strong>Current state</strong><span class="badge-ok">✓ Canon</span></div><div class="stack" style="margin-top:12px"><div class="stat-row"><span class="muted">Protagonist</span><strong>${escapeHtml(s.characters[0]?.name||'—')}</strong></div><div class="stat-row"><span class="muted">POV</span><strong>${escapeHtml(s.pov)}</strong></div><div class="stat-row"><span class="muted">AI writes user</span><strong>${s.aiWritesUser?'Yes':'No'}</strong></div><div class="stat-row"><span class="muted">Style lock</span><strong>${escapeHtml(styleName(s))}</strong></div></div></div>`; bindActions(); }
function heuristicAuthor(name,sample){ const words=sample.trim().split(/\s+/); const sentences=sample.split(/[.!?]+/).filter(Boolean); const avg=words.length/Math.max(1,sentences.length); const dialogue=(sample.match(/"/g)||[]).length/2; const metaphor=(sample.match(/\blike\b|\bas if\b/gi)||[]).length; const desc=sample.match(/\bsmell|scent|ozone|rain|light|shadow|wind|heat|cold\b/gi)||[]; return {id:'author_'+Date.now(),name,desc:`Custom profile learned from ${words.length} words.`,tags:[avg<13?'lean sentences':'longer sentences',dialogue>4?'dialogue-forward':'narration-forward',metaphor<3?'restrained imagery':'imagistic'],sampleHash:sample.slice(0,120)}; }

// Optional direct NanoGPT adapter. The UI defaults to demo behavior; this is invoked only when explicitly requested.
window.nanoGPTGenerate = async function(messages,{temperature=.8,max_tokens=1200}={}){
  const {endpoint,key,model}=state.settings.api; if(!key) throw new Error('NanoGPT API key is not configured.');
  const res=await fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json','Authorization':`Bearer ${key}`},body:JSON.stringify({model,messages,temperature,max_tokens,stream:false})});
  if(!res.ok) throw new Error(`NanoGPT HTTP ${res.status}`); const data=await res.json(); return data?.choices?.[0]?.message?.content||data?.output_text||'';
};

if('serviceWorker' in navigator){ window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{})); }
render();
