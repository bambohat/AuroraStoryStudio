(() => {
  const accents = [
    {id:'aurora', name:'Aurora', value:'#8b5cf6', value2:'#a78bfa'},
    {id:'ocean', name:'Ocean', value:'#38bdf8', value2:'#60a5fa'},
    {id:'emerald', name:'Emerald', value:'#34d399', value2:'#6ee7b7'},
    {id:'crimson', name:'Crimson', value:'#f43f5e', value2:'#fb7185'},
    {id:'amber', name:'Amber', value:'#f59e0b', value2:'#fbbf24'},
    {id:'rose', name:'Rose', value:'#f472b6', value2:'#fb7185'},
    {id:'mono', name:'Mono', value:'#a1a1aa', value2:'#d4d4d8'}
  ];
  const saved = (() => { try { return JSON.parse(localStorage.getItem('aurora_phase1_settings') || '{}'); } catch(e) { return {}; } })();
  const ROUTES = Object.freeze({
    home:{title:'Home'},
    library:{title:'Library'},
    create:{title:'Create'},
    more:{title:'Settings'}
  });
  const LIBRARY_KEY = 'aurora_library_v1';

  function loadLibrarySafe(){
    try{
      const raw = localStorage.getItem(LIBRARY_KEY);
      if(!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    }catch(e){ return []; }
  }

  function saveLibrarySafe(items){
    try{
      localStorage.setItem(LIBRARY_KEY, JSON.stringify(items));
      return true;
    }catch(e){ return false; }
  }

  function storyId(){
    return 'story_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2,8);
  }

  function safeText(value){
    return String(value ?? '').replace(/[&<>"']/g, c => ({
      '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
    }[c]));
  }

  function dateLabel(ts){
    if(!ts) return 'Not opened yet';
    try{
      return new Intl.DateTimeFormat(undefined,{month:'short',day:'numeric',year:'numeric'}).format(new Date(ts));
    }catch(e){ return 'Recently'; }
  }

  const SAVED_STYLES_KEY = 'aurora_saved_styles_v1';

  function loadSavedStylesSafe(){
    try{
      const raw=localStorage.getItem(SAVED_STYLES_KEY);
      const parsed=raw?JSON.parse(raw):[];
      return Array.isArray(parsed)?parsed:[];
    }catch(e){return []}
  }

  function saveSavedStylesSafe(items){
    try{
      localStorage.setItem(SAVED_STYLES_KEY,JSON.stringify(items));
      return true;
    }catch(e){return false}
  }

  function saveCustomStyleProfile(){
    const d=state.conceptDraft;
    const name=(d.customStyleName||'').trim();
    const definition=(d.customStyle||'').trim();
    if(!name){toast('Give your style a name first');return false}
    if(!definition){toast('Describe the style first');return false}
    const existing=state.savedStyles.find(x=>x.name.toLowerCase()===name.toLowerCase());
    const profile={
      id:existing?.id||('style_'+Date.now().toString(36)+'_'+Math.random().toString(36).slice(2,7)),
      name,
      definition,
      sample:(d.customStyleSample||'').trim(),
      createdAt:existing?.createdAt||Date.now(),
      updatedAt:Date.now()
    };
    if(existing) state.savedStyles=state.savedStyles.map(x=>x.id===existing.id?profile:x);
    else state.savedStyles.push(profile);
    saveSavedStylesSafe(state.savedStyles);
    d.style=profile.id;
    toast(existing?'Style updated and saved':'Style saved to My Styles');
    return true;
  }

  function applySavedStyle(id){
    const p=state.savedStyles.find(x=>x.id===id);
    if(!p)return;
    state.conceptDraft.style=p.id;
    state.conceptDraft.customStyleName=p.name;
    state.conceptDraft.customStyle=p.definition;
    state.conceptDraft.customStyleSample=p.sample||'';
    render();
  }

  function askDeleteSavedStyle(id){
    if(!state.savedStyles.some(x=>x.id===id)) return;
    state.styleDeleteConfirmId=id;
    render();
  }

  function deleteSavedStyle(id){
    state.savedStyles=state.savedStyles.filter(x=>x.id!==id);
    saveSavedStylesSafe(state.savedStyles);
    if(state.conceptDraft.style===id){
      state.conceptDraft.style='my-taste';
      state.conceptDraft.customStyleName='';
      state.conceptDraft.customStyle='';
      state.conceptDraft.customStyleSample='';
    }
    render();
    toast('Saved style removed');
  }

  function conceptSummary(idea){
    const clean=String(idea||'').replace(/\s+/g,' ').trim();
    if(!clean)return 'No premise added yet.';
    const first=clean.split(/(?<=[.!?])\s+/)[0]||clean;
    return first.length>145?first.slice(0,142).trimEnd()+'…':first;
  }


  const STORY_BRAIN_KEY='aurora_story_brain_v1';
  const TAGS_KEY='aurora_tags_v1';

  function defaultStoryBrain(){
    return {
      premise:'',
      storyPosition:{arc:'',phase:'',chapter:'',status:'Not started'},
      arcs:[],
      storyRules:[],
      characters:[],
      locations:[],
      factions:[],
      events:[],
      threads:[],
      customEntries:[],
      notes:[],
      fieldDefs:{characters:[],locations:[],factions:[],events:[],threads:[],storyRules:[],customEntries:[]}
    };
  }

  function loadStoryBrainsSafe(){
    try{
      const raw=localStorage.getItem(STORY_BRAIN_KEY);
      const parsed=raw?JSON.parse(raw):{};
      return parsed && typeof parsed==='object' ? parsed : {};
    }catch(e){ return {}; }
  }

  function saveStoryBrainsSafe(){
    try{
      localStorage.setItem(STORY_BRAIN_KEY,JSON.stringify(state.storyBrains));
      return true;
    }catch(e){ return false; }
  }

  function getStoryBrain(id){
    if(!state.storyBrains[id]) state.storyBrains[id]=defaultStoryBrain();
    return state.storyBrains[id];
  }

  function saveStoryBrain(id, brain){
    state.storyBrains[id]=brain;
    saveStoryBrainsSafe();
  }

  // Story Brain 2.0 data model: one entity, evolving state/history, structured arcs.
  function ensureBrain20(brain){
    if(!brain || typeof brain!=='object' || Array.isArray(brain)) brain=defaultStoryBrain();
    brain.storyPosition = brain.storyPosition && typeof brain.storyPosition==='object' && !Array.isArray(brain.storyPosition)
      ? brain.storyPosition : {arcId:'',phaseId:'',chapter:'',status:'Not started'};
    // Older builds used arc/phase instead of arcId/phaseId. Preserve those values.
    if(!brain.storyPosition.arcId && brain.storyPosition.arc) brain.storyPosition.arcId=brain.storyPosition.arc;
    if(!brain.storyPosition.phaseId && brain.storyPosition.phase) brain.storyPosition.phaseId=brain.storyPosition.phase;

    const recordKeys=['characters','locations','factions','events','threads','storyRules','customEntries','secrets','ideas'];
    recordKeys.forEach(k=>{
      if(!Array.isArray(brain[k])) brain[k]=[];
      // A malformed null/string/object record must never crash the whole Brain.
      brain[k]=brain[k].filter(x=>x && typeof x==='object' && !Array.isArray(x));
    });

    if(!Array.isArray(brain.arcs)) brain.arcs=[];
    brain.arcs=brain.arcs.filter(a=>a && typeof a==='object' && !Array.isArray(a));
    brain.arcs.forEach(a=>{
      if(!a.id) a.id='arc_'+Date.now().toString(36)+'_'+Math.random().toString(36).slice(2,6);
      if(!Array.isArray(a.phases)) a.phases=[];
      if(!Array.isArray(a.events)) a.events=[];
      if(!Array.isArray(a.consequences)) a.consequences=[];
      a.phases=a.phases.filter(x=>x && typeof x==='object' && !Array.isArray(x));
      a.events=a.events.filter(x=>x && typeof x==='object' && !Array.isArray(x));
      if(!a.status) a.status='Planned';
      a.phases.forEach((p,i)=>{ if(!p.id) p.id='phase_'+Date.now().toString(36)+'_'+i; if(!p.status) p.status='Locked'; });
      a.events.forEach((ev,i)=>{ if(!ev.id) ev.id='event_'+Date.now().toString(36)+'_'+i; if(!ev.state) ev.state='Future'; });
    });

    ['characters','locations','factions','events','threads','storyRules','customEntries','secrets','ideas'].forEach(k=>{
      brain[k].forEach(x=>{
        if(!Array.isArray(x.stateTimeline)){
          x.stateTimeline=[];
          if(Array.isArray(x.stateHistory)) x.stateTimeline=x.stateHistory.filter(h=>h&&typeof h==='object'&&!Array.isArray(h)).map(h=>({...h,timeline:h.timeline||'Past'}));
        }else x.stateTimeline=x.stateTimeline.filter(st=>st&&typeof st==='object'&&!Array.isArray(st));
        if(!Array.isArray(x.stateHistory)) x.stateHistory=[];
        if(!x.currentStateData || typeof x.currentStateData!=='object' || Array.isArray(x.currentStateData)) x.currentStateData={};
      });
    });
    if(!brain.fieldDefs || typeof brain.fieldDefs!=='object' || Array.isArray(brain.fieldDefs)) brain.fieldDefs={};
    ['characters','locations','factions','events','threads','storyRules','customEntries'].forEach(k=>{if(!Array.isArray(brain.fieldDefs[k])) brain.fieldDefs[k]=[];});
    return brain;
  }

  function currentArc20(brain){
    ensureBrain20(brain);
    const pos=brain.storyPosition||{};
    let arc=brain.arcs.find(a=>a.id===pos.arcId) || null;
    // Migrate older builds that stored the arc name instead of its id.
    if(!arc && pos.arcId) arc=brain.arcs.find(a=>String(a.name||'')===String(pos.arcId)) || null;
    if(arc && pos.arcId!==arc.id) brain.storyPosition.arcId=arc.id;
    if(arc && pos.phaseId){
      const ph=arc.phases.find(p=>p.id===pos.phaseId) || arc.phases.find(p=>String(p.name||'')===String(pos.phaseId));
      if(ph && pos.phaseId!==ph.id) brain.storyPosition.phaseId=ph.id;
      if(!ph) brain.storyPosition.phaseId='';
    }
    return arc;
  }

  function arcLabel20(brain){
    const a=currentArc20(brain);
    return a ? (a.name||'Untitled arc') : 'No current arc';
  }

  function stateBadge20(x){
    const t=x?.memoryType||'established';
    return t==='current'?'CURRENT':t==='idea'?'IDEA':t==='rejected'?'REJECTED':'ESTABLISHED';
  }

  function storyBrainOverview(id){
    const b=ensureBrain20(getStoryBrain(id));
    const arc=currentArc20(b);
    const currentPhase=arc?.phases?.find(p=>p.id===b.storyPosition.phaseId);
    const chars=b.characters||[];
    const activeThreads=(b.threads||[]).filter(x=>String(x.status||'').toLowerCase()!=='resolved');
    const locked=(b.secrets||[]).filter(x=>x.revealStatus==='locked');
    return `<div class="brain-overview">
      <div class="overview-hero">
        <div class="brain-form-kicker">STORY BRAIN 2.0</div>
        <h2>Your story, not a pile of entries.</h2>
        <p>Characters stay as one record. Their changing states become history. Arcs contain phases and events. Secrets have separate knowledge and reveal controls.</p>
      </div>
      <div class="overview-section current-position-card">
        <div class="section-title">Current story position</div>
        <div class="overview-row static">
          <span class="overview-type">${safeText(b.storyPosition.status||'Not started')}</span>
          <b>${safeText(arcLabel20(b))}</b>
          <em>${safeText(currentPhase?.name || b.storyPosition.chapter || 'No phase selected')}</em>
        </div>
        <button class="primary" data-brain-view="story">Open story timeline</button>
      </div>
      <div class="brain-grid">
        <div class="brain-tile"><b>${chars.length}</b><span>Characters</span></div>
        <div class="brain-tile"><b>${b.arcs.length}</b><span>Arcs</span></div>
        <div class="brain-tile"><b>${locked.length}</b><span>Locked secrets</span></div>
        <div class="brain-tile"><b>${activeThreads.length}</b><span>Open threads</span></div>
      </div>
      <div class="overview-section">
        <div class="section-title">Current character states</div>
        ${chars.slice(0,8).map((x,i)=>`<button class="overview-row" data-brain-edit="characters" data-brain-index="${i}">
          <span class="overview-type">${safeText(x.currentStateData?.cultivation || x.currentStateData?.status || 'STATE')}</span>
          <b>${safeText(x.name||'Unnamed character')}</b>
          <em>${safeText(x.currentStateData?.location || x.currentState || '')}</em>
        </button>`).join('') || '<div class="mutedbox">Add a character to begin.</div>'}
      </div>
      <div class="overview-section">
        <div class="section-title">Arc status</div>
        ${b.arcs.slice(0,8).map(a=>`<div class="overview-row static"><span class="overview-type">${safeText(a.status||'Planned')}</span><b>${safeText(a.name)}</b><em>${a.phases?.length||0} phases · ${a.events?.length||0} events</em></div>`).join('') || '<div class="mutedbox">No arcs yet.</div>'}
      </div>
    </div>`;
  }

  function brainEditorModal(id){
    if(!state.brainInput) return '';
    const bi=state.brainInput, b=ensureBrain20(getStoryBrain(id));
    const arr=Array.isArray(b[bi.kind])?b[bi.kind]:[];
    const obj=bi.mode==='edit' && arr[bi.index] ? arr[bi.index] : {};
    const v=k=>brainFieldValue(obj,k);
    if(bi.kind==='characters'){
      const s=obj.currentStateData||{};
      const hist=Array.isArray(obj.stateHistory)?obj.stateHistory:[];
      return `<div class="modal-backdrop brain-backdrop" data-brain-modal-backdrop><div class="confirm-modal brain-editor-modal">
        <div class="confirm-icon">●</div><h2>${bi.mode==='edit'?'Edit character':'New character'}</h2>
        <p>One character stays one character. Changing cultivation, location, condition, etc. updates their state — it does not create another Saly.</p>
        <div class="brain-form-section"><div class="brain-form-kicker">IDENTITY</div>
          <label class="modal-label">Name<input class="modal-input" data-brain-field="name" value="${v('name')}" placeholder="Saly"></label>
          <div class="modal-grid2">
            <label class="modal-label">Role<input class="modal-input" data-brain-field="role" value="${v('role')}" placeholder="Protagonist, rival, mentor…"></label>
            <label class="modal-label">Age<input class="modal-input" data-brain-field="age" value="${v('age')}" placeholder="25"></label>
          </div>
          <label class="modal-label">Personality<textarea class="modal-textarea" data-brain-field="personality" placeholder="Core personality and behavior.">${v('personality')}</textarea></label>
        </div>
        <div class="brain-form-section"><div class="brain-form-kicker">CURRENT STATE</div>
          <p class="field-hint" style="margin:0 0 8px">These values describe the character at the current story position. Change them later; Aurora keeps the previous values as history.</p>
          <div class="modal-grid2">
            <label class="modal-label">Cultivation / power<input class="modal-input" data-state-field="cultivation" value="${safeText(s.cultivation||'')}" placeholder="Foundation Establishment"></label>
            <label class="modal-label">Location<input class="modal-input" data-state-field="location" value="${safeText(s.location||'')}" placeholder="Azure Cloud Sect"></label>
          </div>
          <div class="modal-grid2">
            <label class="modal-label">Condition<input class="modal-input" data-state-field="condition" value="${safeText(s.condition||'')}" placeholder="Healthy, injured…"></label>
            <label class="modal-label">Current goal<input class="modal-input" data-state-field="goal" value="${safeText(s.goal||'')}" placeholder="Find her brother"></label>
          </div>
          <label class="modal-label">Other current state<textarea class="modal-textarea" data-state-field="notes" placeholder="Equipment, political position, temporary circumstances, etc.">${safeText(s.notes||'')}</textarea></label>
          <button class="secondary" data-save-character-state data-character-index="${bi.mode==='edit'?bi.index:''}">Save current state</button>
        </div>
        ${hist.length?`<div class="brain-form-section"><div class="brain-form-kicker">STATE HISTORY</div>${hist.slice().reverse().slice(0,12).map(h=>`<div class="overview-row static"><span class="overview-type">${safeText(h.chapter||h.position||'Unknown')}</span><b>${safeText(h.cultivation||h.status||'State change')}</b><em>${safeText([h.location,h.condition].filter(Boolean).join(' · '))}</em></div>`).join('')}</div>`:''}
        <div class="brain-form-section"><div class="brain-form-kicker">KNOWLEDGE & SECRETS</div>
          <label class="modal-label">What this character knows<textarea class="modal-textarea" data-brain-field="knowledge" placeholder="Facts, beliefs, suspicions.">${v('knowledge')}</textarea></label>
          <label class="modal-label">Secrets<textarea class="modal-textarea" data-brain-field="secrets" placeholder="Secrets this character keeps.">${v('secrets')}</textarea></label>
        </div>
        <div class="brain-advanced"><details><summary>Advanced</summary><div class="advanced-fields">
          <label class="modal-label">Protect this information <input type="checkbox" data-memory-protect ${obj.protectedFact?'checked':''}></label>
          <label class="modal-label">Aurora instructions<textarea class="modal-textarea small" data-brain-field="instructions">${v('instructions')}</textarea></label>
        </div></details></div>
        <div class="confirm-actions"><button class="secondary" data-brain-modal-cancel>Cancel</button><button class="primary" data-brain-modal-save>Save character</button></div>
      </div></div>`;
    }
    if(bi.kind==='arcs'){
      const phases=Array.isArray(obj.phases)?obj.phases:[];
      const events=Array.isArray(obj.events)?obj.events:[];
      return `<div class="modal-backdrop brain-backdrop" data-brain-modal-backdrop><div class="confirm-modal brain-editor-modal">
        <div class="confirm-icon">◆</div><h2>${bi.mode==='edit'?'Edit arc':'New arc'}</h2>
        <p>An arc is a container. Its phases, events and consequences belong inside it.</p>
        <label class="modal-label">Arc name<input class="modal-input" data-brain-field="name" value="${v('name')}" placeholder="Marineford"></label>
        <label class="modal-label">Purpose / overview<textarea class="modal-textarea" data-brain-field="description" placeholder="What this arc is about.">${v('description')}</textarea></label>
        <div class="brain-form-section"><div class="brain-form-kicker">PHASES</div>
          ${phases.map((p,i)=>`<div class="overview-row static"><span class="overview-type">${safeText(p.status||'Locked')}</span><b>${safeText(p.name)}</b><em>${safeText(p.description||'')}</em></div>`).join('')||'<div class="mutedbox">No phases yet.</div>'}
          <div class="modal-grid2"><input class="modal-input" id="new-phase-name" placeholder="Phase name"><select class="modal-input" id="new-phase-status"><option>Locked</option><option>Available</option><option>Completed</option></select></div>
          <button class="secondary" data-add-phase>Add phase</button>
        </div>
        <div class="brain-form-section"><div class="brain-form-kicker">EVENTS</div>
          ${events.map(e=>`<div class="overview-row static"><span class="overview-type">${safeText(e.state||'Future')}</span><b>${safeText(e.name)}</b><em>${safeText(e.description||'')}</em></div>`).join('')||'<div class="mutedbox">No events yet.</div>'}
          <div class="modal-grid2"><input class="modal-input" id="new-event-name" placeholder="Event"><select class="modal-input" id="new-event-state"><option>Future</option><option>Current</option><option>Completed</option></select></div>
          <input class="modal-input" id="new-event-description" style="margin-top:9px" placeholder="What happens?">
          <button class="secondary" data-add-arc-event>Add event</button>
        </div>
        <div class="brain-advanced"><details><summary>Advanced</summary><div class="advanced-fields"><label class="modal-label">Status<select class="modal-input" data-brain-field="status"><option ${obj.status==='Planned'?'selected':''}>Planned</option><option ${obj.status==='Active'?'selected':''}>Active</option><option ${obj.status==='Completed'?'selected':''}>Completed</option></select></label></div></details></div>
        <div class="confirm-actions"><button class="secondary" data-brain-modal-cancel>Close</button><button class="primary" data-brain-modal-save>Save arc</button></div>
      </div></div>`;
    }
    // Simple editors for other Brain entities; they remain single records.
    const map={locations:'Location',factions:'Faction',events:'Timeline event',threads:'Open thread',storyRules:'Story rule',customEntries:'Custom entry',secrets:'Secret',ideas:'Idea'};
    const label=map[bi.kind]||'Brain record';
    return `<div class="modal-backdrop brain-backdrop" data-brain-modal-backdrop><div class="confirm-modal brain-editor-modal">
      <div class="confirm-icon">◇</div><h2>${bi.mode==='edit'?'Edit':'New'} ${label.toLowerCase()}</h2>
      <label class="modal-label">${bi.kind==='storyRules'?'Rule':'Name'}<input class="modal-input" data-brain-field="${bi.kind==='storyRules'?'text':'name'}" value="${v(bi.kind==='storyRules'?'text':'name')}" placeholder="${label}"></label>
      <label class="modal-label">Description<textarea class="modal-textarea" data-brain-field="description" placeholder="Useful information for Aurora.">${v('description')}</textarea></label>
      ${bi.kind==='secrets'?`<div class="brain-form-section"><div class="brain-form-kicker">KNOWLEDGE CONTROL</div>
        <label class="modal-label">Who knows this?<select class="modal-input" data-brain-field="knowledgeScope"><option value="ai_only" ${obj.knowledgeScope==='ai_only'?'selected':''}>AI / author only</option><option value="mc_only" ${obj.knowledgeScope==='mc_only'?'selected':''}>MC only</option><option value="specific" ${obj.knowledgeScope==='specific'?'selected':''}>Specific characters / groups</option><option value="everyone" ${!obj.knowledgeScope||obj.knowledgeScope==='everyone'?'selected':''}>Everyone</option></select></label>
        <label class="modal-label">Who specifically?<input class="modal-input" data-brain-field="knowledgePeople" value="${v('knowledgePeople')}" placeholder="MC, Saly, Elder Chen"></label>
        <label class="modal-label">Reveal<select class="modal-input" data-brain-field="revealStatus"><option value="locked" ${obj.revealStatus==='locked'?'selected':''}>Locked</option><option value="available" ${!obj.revealStatus||obj.revealStatus==='available'?'selected':''}>Available</option></select></label>
        <label class="modal-label">Unlock when<input class="modal-input" data-brain-field="revealWhen" value="${v('revealWhen')}" placeholder="Marineford Phase 4 / Chapter 87"></label>
      </div>`:''}
      <div class="confirm-actions"><button class="secondary" data-brain-modal-cancel>Cancel</button><button class="primary" data-brain-modal-save>Save</button></div>
    </div></div>`;
  }

  function brainReadModal(id){
    const bi=state.brainRead;
    if(!bi) return '';
    const b=ensureBrain20(getStoryBrain(id)), arr=Array.isArray(b[bi.kind])?b[bi.kind]:[], obj=arr[bi.index];
    if(!obj)return '';
    const title=obj.name||obj.text||'Record';
    const current=obj.currentStateData;
    const history=Array.isArray(obj.stateHistory)?obj.stateHistory:[];
    return `<div class="modal-backdrop brain-backdrop" data-brain-read-backdrop><div class="confirm-modal brain-read-modal">
      <div class="confirm-icon">◇</div><h2>${safeText(title)}</h2><p>${safeText(BRAIN_LABELS[bi.kind]||bi.kind)}</p>
      ${bi.kind==='characters'&&current?`<div class="read-field"><b>Current state</b><p>${safeText([current.cultivation,current.location,current.condition,current.goal,current.notes].filter(Boolean).join('\\n')||'No current state recorded.')}</p></div>`:''}
      ${history.length?`<div class="read-field"><b>State history</b><p>${safeText(history.slice().reverse().map(h=>[h.chapter||h.position,h.cultivation,h.location,h.condition].filter(Boolean).join(' · ')).join('\\n'))}</p></div>`:''}
      ${Object.entries(obj).filter(([k,v])=>!['currentStateData','stateHistory','customFields','active','memoryType','timeScope','knowledgeScope','knowledgePeople','revealStatus','revealWhen','protectedFact'].includes(k)&&v!==''&&v!=null&&typeof v!=='object').map(([k,v])=>`<div class="read-field"><b>${safeText(k)}</b><p>${safeText(v)}</p></div>`).join('')}
      <div class="confirm-actions"><button class="secondary" data-brain-read-close>Close</button><button class="primary" data-brain-read-edit data-brain-kind="${bi.kind}" data-brain-index="${bi.index}">Edit</button></div>
    </div></div>`;
  }

  function storyBrainPage(id){
    const item=state.library.find(x=>x.id===id); if(!item)return library();
    const b=ensureBrain20(getStoryBrain(id));
    const active=state.brainView||'overview';
    const views=[
      ['overview','Overview','⌂'],['characters','Characters','●'],['story','Story & Arcs','◆'],['locations','World','⌖'],
      ['secrets','Secrets','◈'],['threads','Threads','◇'],['rules','Rules','§'],['ideas','Ideas','✦'],['defaults','Fields','＋']
    ];
    let body='';
    if(active==='overview') body=storyBrainOverview(id);
    else if(active==='story'){
      const arc=currentArc20(b);
      body=`<div class="overview-section"><div class="section-title">Current position</div>
        <div class="brain-form-section"><div class="modal-grid2">
          <label class="modal-label">Arc<select class="modal-input" data-story-position="arcId"><option value="">Select arc</option>${b.arcs.map(a=>`<option value="${safeText(a.id)}" ${b.storyPosition.arcId===a.id?'selected':''}>${safeText(a.name)}</option>`).join('')}</select></label>
          <label class="modal-label">Phase<select class="modal-input" data-story-position="phaseId"><option value="">Select phase</option>${(arc?.phases||[]).map(p=>`<option value="${safeText(p.id)}" ${b.storyPosition.phaseId===p.id?'selected':''}>${safeText(p.name)} — ${safeText(p.status)}</option>`).join('')}</select></label>
        </div><div class="modal-grid2">
          <label class="modal-label">Chapter / scene<input class="modal-input" data-story-position="chapter" value="${safeText(b.storyPosition.chapter||'')}" placeholder="Chapter 42 / Scene 3"></label>
          <label class="modal-label">Story status<select class="modal-input" data-story-position="status"><option ${b.storyPosition.status==='Not started'?'selected':''}>Not started</option><option ${b.storyPosition.status==='Active'?'selected':''}>Active</option><option ${b.storyPosition.status==='Completed'?'selected':''}>Completed</option></select></label>
        </div><button class="primary" data-save-story-position>Save position</button></div></div>
        <div class="overview-section"><div class="section-title">Arcs <span>${b.arcs.length}</span></div>
          ${b.arcs.map((a,i)=>`<button class="overview-row" data-brain-edit="arcs" data-brain-index="${i}"><span class="overview-type">${safeText(a.status||'Planned')}</span><b>${safeText(a.name)}</b><em>${a.phases?.length||0} phases · ${a.events?.length||0} events</em></button>`).join('')||'<div class="mutedbox">No arcs yet.</div>'}
          <button class="primary" data-brain-add="arcs">＋ New arc</button>
        </div>`;
    } else if(active==='characters'){
      body=`<div class="brain-section-head"><div><b>Characters</b><span>One record per character · evolving state stays inside the character</span></div><button class="primary" data-brain-add="characters">＋ Add character</button></div>
      ${(b.characters||[]).map((x,i)=>`<div class="brain-record"><div class="record-main"><button class="record-read" data-brain-open-record="characters" data-brain-index="${i}"><b>${safeText(x.name||'Unnamed')}</b><span>${safeText([x.currentStateData?.cultivation,x.currentStateData?.location,x.currentStateData?.condition].filter(Boolean).join(' · ')||'No current state yet')}</span><small>${(x.stateHistory||[]).length} state changes recorded</small></button></div><div class="record-actions"><button class="mini-action" data-brain-edit="characters" data-brain-index="${i}">Edit</button><button class="mini-action danger-mini" data-brain-delete="characters" data-brain-index="${i}">Delete</button></div></div>`).join('')||'<div class="mutedbox">No characters yet.</div>'}`;
    } else if(active==='secrets'){
      body=`<div class="brain-section-head"><div><b>Secrets & hidden knowledge</b><span>True information can exist without being known in-world.</span></div><button class="primary" data-brain-add="secrets">＋ Add secret</button></div>
      ${(b.secrets||[]).map((x,i)=>`<div class="brain-record"><div class="record-main"><button class="record-read" data-brain-open-record="secrets" data-brain-index="${i}"><b>${safeText(x.name||'Unnamed secret')}</b><span>${safeText(x.knowledgeScope==='ai_only'?'AI / author only':x.knowledgeScope==='mc_only'?'MC only':x.knowledgeScope==='specific'?'Specific people':'Everyone')} · ${x.revealStatus==='locked'?'Locked':'Available'}</span></button></div><div class="record-actions"><button class="mini-action" data-brain-edit="secrets" data-brain-index="${i}">Edit</button><button class="mini-action danger-mini" data-brain-delete="secrets" data-brain-index="${i}">Delete</button></div></div>`).join('')||'<div class="mutedbox">No hidden information yet.</div>'}`;
    } else {
      const map={locations:['locations','Locations'],threads:['threads','Open threads'],rules:['storyRules','Story rules'],ideas:['ideas','Ideas']};
      const pair=map[active];
      if(pair){
        const [key,label]=pair, arr=Array.isArray(b[key])?b[key]:[];
        body=`<div class="brain-section-head"><div><b>${label}</b><span>${arr.length} records</span></div><button class="primary" data-brain-add="${key}">＋ Add ${label.replace(/s$/,'')}</button></div>
        ${arr.map((x,i)=>`<div class="brain-record"><div class="record-main"><button class="record-read" data-brain-open-record="${key}" data-brain-index="${i}"><b>${safeText(x.name||x.text||'Untitled')}</b><span>${safeText(x.description||x.currentState||x.status||'')}</span></button></div><div class="record-actions"><button class="mini-action" data-brain-edit="${key}" data-brain-index="${i}">Edit</button><button class="mini-action danger-mini" data-brain-delete="${key}" data-brain-index="${i}">Delete</button></div></div>`).join('')||`<div class="mutedbox">No ${label.toLowerCase()} yet.</div>`}`;
      } else {
        body=`<div class="defaults-intro"><b>Custom fields remain available.</b><span>Use Fields for story-specific attributes such as Power, Weakness, Bloodline, etc.</span></div>${brainFieldManager(id)||''}`;
      }
    }
    return layout(`<div class="page">
      <div class="backrow"><button class="back" data-action="back">‹ Back</button><span style="color:var(--muted);font-size:12px">Back to ${safeText(item.title)}</span></div>
      <div class="eyebrow">Story Brain</div><h1>${safeText(item.title)}</h1>
      <p>One coherent model of the evolving story.</p>
      <div class="brain-tab-viewport"><div class="brain-tabs">${views.map(v=>`<button class="brain-tab ${active===v[0]?'active':''}" data-brain-view="${v[0]}">${v[2]} ${v[1]}</button>`).join('')}</div></div>
      ${active==='overview'?`<div class="brain-premise"><span>Premise</span><p>${safeText(item.summary||item.concept?.summary||'No premise recorded yet.')}</p></div>`:''}
      ${body}${brainEditorModal(id)}${brainReadModal(id)}
      ${state.brainDelete?`<div class="modal-backdrop brain-backdrop" data-brain-delete-backdrop><div class="confirm-modal delete-record-modal"><div class="confirm-icon">!</div><h2>Delete this record?</h2><p>This removes the Story Brain record.</p><div class="confirm-actions"><button class="secondary" data-cancel-brain-delete>Cancel</button><button class="danger-confirm" data-confirm-brain-delete>Delete</button></div></div></div>`:''}
    </div>`,'library');
  }


  function loadTagsSafe(){
    try{
      const raw=localStorage.getItem(TAGS_KEY);
      const parsed=raw?JSON.parse(raw):[];
      return Array.isArray(parsed)?parsed:[];
    }catch(e){ return []; }
  }

  function saveTagsSafe(){
    try{
      localStorage.setItem(TAGS_KEY,JSON.stringify(state.tags));
      return true;
    }catch(e){ return false; }
  }

  function normalizeTag(t){
    return String(t||'').trim().replace(/\s+/g,' ');
  }

  function allStoryTags(){
    const tags=new Set(state.tags||[]);
    state.library.forEach(story=>(story.tags||[]).forEach(t=>tags.add(t)));
    return [...tags].sort((a,b)=>a.localeCompare(b,undefined,{sensitivity:'base'}));
  }

  function addStoryTag(story,idTag){
    const item=state.library.find(s=>s.id===story);
    const tag=normalizeTag(idTag);
    if(!item||!tag)return false;
    item.tags=Array.isArray(item.tags)?item.tags:[];
    if(!item.tags.some(t=>t.toLowerCase()===tag.toLowerCase())){
      item.tags.push(tag);
      if(!state.tags.some(t=>t.toLowerCase()===tag.toLowerCase())) state.tags.push(tag);
      item.updatedAt=Date.now();
      saveLibrarySafe(state.library);
      saveTagsSafe();
    }
    return true;
  }

  function removeStoryTag(story,tag){
    const item=state.library.find(s=>s.id===story);
    if(!item)return false;
    item.tags=(item.tags||[]).filter(t=>t.toLowerCase()!==String(tag).toLowerCase());
    item.updatedAt=Date.now();
    saveLibrarySafe(state.library);
    return true;
  }

  function storyMatchesTagFilter(item){
    const wanted=Array.isArray(state.libraryTagFilters)?state.libraryTagFilters:[];
    if(!wanted.length) return true;
    const have=(item.tags||[]).map(t=>t.toLowerCase());
    if(state.libraryTagMode==='any') return wanted.some(t=>have.includes(t.toLowerCase()));
    return wanted.every(t=>have.includes(t.toLowerCase()));
  }

  function brainCount(id){
    const b=getStoryBrain(id);
    const len=k=>Array.isArray(b[k])?b[k].length:0;
    return len('characters')+len('locations')+len('factions')+len('events')+len('threads')+len('storyRules')+len('customEntries');
  }

  function createLocalStory(title,type){
    const now=Date.now();
    const item={
      id:storyId(),
      title:(title||'Untitled Story').trim() || 'Untitled Story',
      type:type==='comic'?'comic':'novel',
      favorite:false,
      createdAt:now,
      updatedAt:now,
      lastOpenedAt:null,
      progress:0,
      chapterCount:0,
      tags:[],
      summary:'',
      styleName:'',
      concept:null
    };
    state.storyBrains[item.id]=defaultStoryBrain();
    state.manuscripts=state.manuscripts||{}; state.manuscripts[item.id]=defaultManuscript(); saveManuscriptsSafe();
    saveStoryBrainsSafe();
    state.library.unshift(item);
    saveLibrarySafe(state.library);
    return item;
  }

  function updateLocalStory(id,patch){
    const item=state.library.find(x=>x.id===id);
    if(!item) return false;
    Object.assign(item,patch,{updatedAt:Date.now()});
    saveLibrarySafe(state.library);
    return true;
  }

  function removeLocalStory(id){
    const old=state.library.length;
    state.library=state.library.filter(x=>x.id!==id);
    if(old!==state.library.length) saveLibrarySafe(state.library);
    return old!==state.library.length;
  }

  function loadNanoGPTSettings(){
    try{
      const raw=JSON.parse(localStorage.getItem('aurora_nanogpt_settings_v1')||'null');
      if(raw&&typeof raw==='object') return raw;
    }catch(e){}
    return {};
  }
  const NANO_DEFAULTS={
    access:'ask',maxRequests:0,requestCount:0,provider:'NanoGPT',endpoint:'https://nano-gpt.com/api/v1',apiKey:'',
    textModel:'',imageModel:'',textModelManual:'',imageModelManual:'',textModels:[],imageModels:[],billing:'Default',routing:'Automatic',contextMemory:false,
    connectionStatus:'Not tested yet.',modelStatus:'Text models not loaded.',imageStatus:'Image models not loaded.',catalogStatus:'NanoGPT catalogs not loaded.',connectionBusy:false,textBusy:false,imageBusy:false
  };
  function normalizeNanoGPT(raw){
    const n=Object.assign({},NANO_DEFAULTS,raw&&typeof raw==='object'?raw:{});
    n.endpoint=String(n.endpoint||NANO_DEFAULTS.endpoint).trim().replace(/\/+$/,'');
    n.provider='NanoGPT'; n.access=['off','ask','on'].includes(n.access)?n.access:'ask';
    n.maxRequests=Math.max(0,Number(n.maxRequests)||0); n.requestCount=Math.max(0,Number(n.requestCount)||0);
    n.textModels=Array.isArray(n.textModels)?n.textModels:[]; n.imageModels=Array.isArray(n.imageModels)?n.imageModels:[];
    n.textModel=String(n.textModel||''); n.imageModel=String(n.imageModel||''); n.textModelManual=String(n.textModelManual||''); n.imageModelManual=String(n.imageModelManual||''); n.apiKey=String(n.apiKey||'');
    return n;
  }
  function saveNanoGPTSettings(n){
    try{localStorage.setItem('aurora_nanogpt_settings_v1',JSON.stringify(normalizeNanoGPT(n)));return true}catch(e){return false}
  }
  function nanoDraft(){
    if(!state.settingsDraft) beginSettings();
    state.settingsDraft.nano=normalizeNanoGPT(state.settingsDraft.nano);
    return state.settingsDraft.nano;
  }
  function nanoEndpoint(n,path){return normalizeNanoGPT(n).endpoint.replace(/\/+$/,'')+path}
  function nanoHeaders(n,accept,method){
    const m=String(method||'GET').toUpperCase();
    const h={};
    if(String(n.apiKey||'').trim()) h.Authorization='Bearer '+String(n.apiKey||'').trim();
    if(accept) h.Accept=accept;
    if(m!=='GET'&&m!=='HEAD'&&m!=='OPTIONS') h['Content-Type']='application/json';
    return h;
  }
  function nanoCatalogModels(raw){
    const data=Array.isArray(raw?.data)?raw.data:[];
    return data.filter(x=>x&&x.id).map(x=>({id:String(x.id),name:String(x.name||x.id),description:String(x.description||''),context_length:x.context_length||null,pricing:x.pricing||null,capabilities:x.capabilities||null,owned_by:String(x.owned_by||'')}));
  }
  const NANO_FALLBACK_TEXT=[
    ['deepseek/deepseek-v3.2','DeepSeek V3.2'],['deepseek/deepseek-v3.2-thinking','DeepSeek V3.2 Thinking'],
    ['openai/gpt-5.2','GPT-5.2'],['openai/gpt-5.2-chat-latest','GPT-5.2 Chat'],
    ['anthropic/claude-opus-4.6','Claude Opus 4.6'],['google/gemini-3-flash-preview','Gemini 3 Flash'],
    ['google/gemini-3-pro-preview','Gemini 3 Pro'],['moonshotai/kimi-k2.6','Kimi K2.6'],
    ['glm-4.7','GLM 4.7'],['qwen/qwen3-coder-flash','Qwen3 Coder Flash']
  ].map(x=>({id:x[0],name:x[1],description:'Built-in starter ID; refresh the live NanoGPT catalog when browser networking permits.'}));
  const NANO_FALLBACK_IMAGE=[
    ['hidream','HiDream'],['flux-pro','FLUX Pro'],['flux-schnell','FLUX Schnell']
  ].map(x=>({id:x[0],name:x[1],description:'Built-in starter ID; refresh the live NanoGPT image catalog when browser networking permits.'}));
  function nanoCatalogImageModels(raw){
    const data=Array.isArray(raw?.data)?raw.data:[];
    return data.filter(x=>x&&x.id).map(x=>({id:String(x.id),name:String(x.name||x.id),description:String(x.description||''),pricing:x.pricing||null,architecture:x.architecture||null,supported_parameters:x.supported_parameters||null,owned_by:String(x.owned_by||'')}));
  }

  // NanoGPT browser transport.
  // Every request gets a real AbortController deadline. This prevents the UI from ever
  // remaining on "Testing…" because a browser/CORS connection left fetch pending.
  async function nanoFetchJson(url,n,options={}){
    const method=String(options.method||'GET').toUpperCase();
    const auth=options.auth!==false;
    const timeoutMs=Math.max(3000,Number(options.timeoutMs)||10000);
    const controller=new AbortController();
    const timer=setTimeout(()=>controller.abort('NanoGPT request timeout'),timeoutMs);
    const requestOptions=Object.assign({},options);
    delete requestOptions.auth; delete requestOptions.timeoutMs; delete requestOptions.signal;
    requestOptions.headers=Object.assign(nanoHeaders(auth?n:{apiKey:''},'application/json',method),options.headers||{});
    requestOptions.mode='cors'; requestOptions.credentials='omit'; requestOptions.cache='no-store'; requestOptions.signal=controller.signal;
    try{
      let response;
      try{
        response=await fetch(url,requestOptions);
      }catch(e){
        if(e?.name==='AbortError' || controller.signal.aborted){
          const err=new Error('NanoGPT request timed out after '+Math.round(timeoutMs/1000)+' seconds.');
          err.code='TIMEOUT'; throw err;
        }
        const err=new Error('Browser could not reach NanoGPT. This is usually a CORS/origin/network restriction.');
        err.code='NETWORK'; err.cause=e; throw err;
      }
      let raw='';
      try{raw=await response.text()}catch(e){
        const err=new Error('NanoGPT responded, but the browser could not read the response.');
        err.code='READ_ERROR'; err.cause=e; throw err;
      }
      let data=null; try{data=raw?JSON.parse(raw):null}catch(e){data={raw:raw}};
      if(!response.ok){
        const msg=data?.error?.message||data?.error_description||data?.message||(typeof data?.error==='string'?data.error:'')||('HTTP '+response.status);
        const err=new Error('HTTP '+response.status+' — '+String(msg).slice(0,300));
        err.httpStatus=response.status;
        err.requestId=response.headers?.get?.('x-request-id')||'';
        err.apiError=data?.error||null;
        throw err;
      }
      return data;
    }finally{clearTimeout(timer)}
  }
  function nanoErrorText(err){
    if(err?.code==='TIMEOUT') return String(err.message||'NanoGPT request timed out.');
    if(err?.code==='NETWORK') return 'Browser could not reach NanoGPT. Check NanoGPT Allowed browser origins, network, or CORS.';
    if(err?.code==='READ_ERROR') return 'Browser reached NanoGPT but could not read its response.';
    if(err?.httpStatus===403) return 'NanoGPT rejected this browser origin/key (HTTP 403). Use “Sign in with NanoGPT” below or allow this GitHub Pages origin for the API key.';
    if(err?.httpStatus===401) return 'NanoGPT rejected the API key (HTTP 401).';
    return String(err?.message||err||'Unknown NanoGPT error');
  }
  async function nanoFetchCatalogWithFallback(url,n,kind){
    try{
      return await nanoFetchJson(url,n,{auth:false,timeoutMs:10000});
    }catch(firstErr){
      const e=new Error('Live '+kind+' catalog unavailable. '+nanoErrorText(firstErr));
      e.code='CATALOG_UNAVAILABLE'; e.cause=firstErr; throw e;
    }
  }

  // NanoGPT OAuth PKCE shortcut. This is the browser-safe path for Aurora hosted on GitHub Pages.
  function nanoOAuthCallbackUrl(){ return window.location.origin+window.location.pathname; }
  function nanoRandomString(bytes=48){
    const a=new Uint8Array(bytes); crypto.getRandomValues(a);
    return Array.from(a,b=>('0'+b.toString(16)).slice(-2)).join('');
  }
  function nanoBase64Url(bytes){
    let s=''; for(const b of new Uint8Array(bytes)) s+=String.fromCharCode(b);
    return btoa(s).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
  }
  async function nanoPkceChallenge(verifier){
    const digest=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(verifier));
    return nanoBase64Url(digest);
  }
  async function nanoStartOAuth(){
    try{
      const verifier=nanoRandomString(48);
      const challenge=await nanoPkceChallenge(verifier);
      const stateValue=nanoRandomString(24);
      sessionStorage.setItem('aurora_nanogpt_pkce_v1',JSON.stringify({verifier,state:stateValue,returnUrl:window.location.href,createdAt:Date.now()}));
      const u=new URL('https://nano-gpt.com/auth');
      u.searchParams.set('callback_url',nanoOAuthCallbackUrl());
      u.searchParams.set('code_challenge',challenge);
      u.searchParams.set('code_challenge_method','S256');
      u.searchParams.set('scope','api.use models.read');
      u.searchParams.set('state',stateValue);
      u.searchParams.set('client_name','Aurora Story Studio');
      window.location.assign(u.toString());
    }catch(e){toast('Could not start NanoGPT sign-in: '+(e?.message||e));}
  }
  async function nanoHandleOAuthCallback(){
    const params=new URLSearchParams(window.location.search);
    const code=params.get('code');
    const oauthError=params.get('error');
    if(!code && !oauthError) return false;
    let saved=null;
    try{saved=JSON.parse(sessionStorage.getItem('aurora_nanogpt_pkce_v1')||'null')}catch(e){}
    try{sessionStorage.removeItem('aurora_nanogpt_pkce_v1')}catch(e){}
    if(oauthError){
      history.replaceState({},document.title,window.location.pathname+window.location.hash);
      toast('NanoGPT sign-in was cancelled or failed: '+oauthError);
      return false;
    }
    if(!saved?.verifier || !saved?.state || params.get('state')!==saved.state){
      history.replaceState({},document.title,window.location.pathname+window.location.hash);
      toast('NanoGPT sign-in failed: invalid OAuth state. Please try again.');
      return false;
    }
    try{
      const data=await nanoFetchJson('https://nano-gpt.com/api/v1/auth/keys',{apiKey:''},{method:'POST',auth:false,body:JSON.stringify({grant_type:'authorization_code',code,code_verifier:saved.verifier}),timeoutMs:15000});
      const key=String(data?.access_token||data?.key||'').trim();
      if(!key) throw new Error('NanoGPT did not return an API key.');
      const n=normalizeNanoGPT(loadNanoGPTSettings()); n.apiKey=key; state.settingsDraft=null; n.connectionStatus='Signed in with NanoGPT. Testing API access…'; n.connectionState='loading'; saveNanoGPTSettings(n); state.nanoGPT=n;
      history.replaceState({},document.title,window.location.pathname+window.location.hash);
      toast('NanoGPT sign-in successful');
      render();
      await nanoTestConnection();
      return true;
    }catch(err){
      history.replaceState({},document.title,window.location.pathname+window.location.hash);
      toast('NanoGPT sign-in failed: '+nanoErrorText(err));
      return false;
    }
  }
  function syncNanoDraftFromDom(){
    const n=nanoDraft();
    const key=document.getElementById('nano-api-key'); if(key) n.apiKey=String(key.value||'').trim();
    const endpoint=document.querySelector('[data-nano-field="endpoint"]'); if(endpoint) n.endpoint=String(endpoint.value||'').trim().replace(/\/+$/,'');
    return n;
  }
  function nanoCanRequest(n){
    if(n.access==='off') return {ok:false,reason:'API access is disabled.'};
    if(n.maxRequests>0 && n.requestCount>=n.maxRequests) return {ok:false,reason:'Maximum AI request limit reached.'};
    if(!n.apiKey.trim()) return {ok:false,reason:'Add your NanoGPT API key first.'};
    return {ok:true};
  }
  function nanoRecordRequest(n){n.requestCount=(Number(n.requestCount)||0)+1;saveNanoGPTSettings(n)}
  function nanoSetConnection(n,text,kind){
    n.connectionStatus=text;
    n.connectionState=kind||'neutral';
  }
  async function nanoLoadTextModels(){
    const n=syncNanoDraftFromDom(); if(!n.endpoint.trim()){toast('Enter the NanoGPT endpoint first');render();return false}
    if(n.textBusy){return false}
    n.textBusy=true; n.modelStatus='Loading text models (public catalog)…'; render();
    try{
      const data=await nanoFetchCatalogWithFallback(nanoEndpoint(n,'/models'),n,'text');
      n.textModels=nanoCatalogModels(data);
      if(n.textModels.length && (!n.textModel || !n.textModels.some(x=>x.id===n.textModel))) n.textModel=n.textModels[0].id;
      n.modelStatus=n.textModels.length?`${n.textModels.length} text models loaded.`:'NanoGPT returned no text models.';
      n.textBusy=false; render();
      toast(n.textModels.length?`Loaded ${n.textModels.length} text models`:'NanoGPT returned no text models');
      return true;
    }catch(err){
      n.textBusy=false;
      const msg=nanoErrorText(err);
      n.textModels=NANO_FALLBACK_TEXT.slice();
      if(!n.textModel) n.textModel=n.textModels[0].id;
      n.modelStatus=`Live text catalog unavailable · using ${n.textModels.length} built-in starter models.`;
      if(err?.httpStatus===401||err?.httpStatus===403) nanoSetConnection(n,'Connection rejected · check API key/origin.','error');
      else nanoSetConnection(n,'Live catalog unavailable · '+msg,'error');
      render(); toast('Live catalog unavailable; starter models are available'); return false;
    }
  }
  async function nanoLoadImageModels(){
    const n=syncNanoDraftFromDom(); if(!n.endpoint.trim()){toast('Enter the NanoGPT endpoint first');render();return false}
    if(n.imageBusy){return false}
    n.imageBusy=true; n.imageStatus='Loading image models…'; render();
    try{
      const data=await nanoFetchCatalogWithFallback(nanoEndpoint(n,'/image-models'),n,'image');
      n.imageModels=nanoCatalogImageModels(data);
      if(n.imageModels.length && (!n.imageModel || !n.imageModels.some(x=>x.id===n.imageModel))) n.imageModel=n.imageModels[0].id;
      n.imageStatus=n.imageModels.length?`${n.imageModels.length} image models loaded.`:'NanoGPT returned no image models.';
      n.imageBusy=false; render();
      toast(n.imageModels.length?`Loaded ${n.imageModels.length} image models`:'NanoGPT returned no image models');
      return true;
    }catch(err){
      n.imageBusy=false;
      const msg=nanoErrorText(err);
      n.imageModels=NANO_FALLBACK_IMAGE.slice();
      if(!n.imageModel) n.imageModel=n.imageModels[0].id;
      n.imageStatus=`Live image catalog unavailable · using ${n.imageModels.length} built-in starter models.`;
      if(err?.httpStatus===401||err?.httpStatus===403) nanoSetConnection(n,'Connection rejected · check API key/origin.','error');
      else nanoSetConnection(n,'Live image catalog unavailable · '+msg,'error');
      render(); toast('Live image catalog unavailable; starter models are available'); return false;
    }
  }
  async function nanoTestConnection(){
    const n=syncNanoDraftFromDom();
    if(!n.apiKey.trim()){
      nanoSetConnection(n,'Not connected · enter your API key or use “Sign in with NanoGPT”.','error');
      render(); toast('Connect NanoGPT first'); return false;
    }
    if(n.connectionBusy) return false;
    n.connectionBusy=true; nanoSetConnection(n,'Checking NanoGPT API…','loading'); render();
    try{
      const authData=await nanoFetchJson(nanoEndpoint(n,'/models'),n,{auth:true,timeoutMs:10000});
      const count=Array.isArray(authData?.data)?authData.data.length:null;
      nanoSetConnection(n,count==null?'Connected · NanoGPT API key accepted.':`Connected · NanoGPT API key accepted (${count} text models visible).`,'ok');
      toast('NanoGPT connection successful');
      return true;
    }catch(err){
      const msg=nanoErrorText(err);
      nanoSetConnection(n,'NanoGPT connection failed · '+msg,'error');
      if(err?.httpStatus===403) n.modelStatus='Use “Sign in with NanoGPT” to create an origin-scoped key for this GitHub Pages app.';
      toast('NanoGPT connection failed'); return false;
    }finally{
      n.connectionBusy=false;
      render();
    }
  }
  function nanoRequestPermission(kind,details){
    const n=normalizeNanoGPT(loadNanoGPTSettings());
    const gate=nanoCanRequest(n); if(!gate.ok) return Promise.reject(new Error(gate.reason));
    if(n.access!=='ask') return Promise.resolve(true);
    return new Promise(resolve=>{state.nanoConfirm={kind:String(kind||'AI request'),details:String(details||''),resolve};render()});
  }
  async function nanoChatCompletion(messages,extra={}){
    const n=normalizeNanoGPT(loadNanoGPTSettings()); const gate=nanoCanRequest(n); if(!gate.ok) throw new Error(gate.reason);
    if(!n.textModel) throw new Error('Choose a NanoGPT text model first.');
    const allowed=await nanoRequestPermission('Text generation',n.textModel); if(!allowed) throw new Error('AI request cancelled.');
    const body=Object.assign({model:n.textModel,messages,stream:false},extra||{}); const data=await nanoFetchJson(nanoEndpoint(n,'/chat/completions'),n,{method:'POST',body:JSON.stringify(body)}); nanoRecordRequest(n); return data;
  }
  async function nanoGenerateImage(prompt,extra={}){
    const n=normalizeNanoGPT(loadNanoGPTSettings()); const gate=nanoCanRequest(n); if(!gate.ok) throw new Error(gate.reason);
    if(!n.imageModel) throw new Error('Choose a NanoGPT image model first.');
    const allowed=await nanoRequestPermission('Image generation',n.imageModel); if(!allowed) throw new Error('AI request cancelled.');
    const body=Object.assign({model:n.imageModel,prompt,n:1},extra||{}); const url=n.endpoint.replace(/\/api\/v1$/,'')+'/v1/images/generations'; const data=await nanoFetchJson(url,n,{method:'POST',body:JSON.stringify(body)}); nanoRecordRequest(n); return data;
  }

  const state = {
    route:'home',
    history:[],
    theme:saved.theme==='light'?'light':'dark',
    accent:accents.some(x=>x.id===saved.accent)?saved.accent:'aurora',
    help:saved.help!==false,
    settingsDraft:null
  };
  state.nanoGPT=normalizeNanoGPT(loadNanoGPTSettings());
  state.nanoConfirm=null;

  state.library = loadLibrarySafe();
  state.library.forEach(item=>{
    if(!Array.isArray(item.tags)) item.tags=[];
    if(!item.summary) item.summary='';
    if(!item.styleName) item.styleName='';
    if(!item.concept) item.concept=null;
  });

  state.libraryQuery = '';
  state.libraryFilter = 'all';
  state.librarySort = 'opened-new';
  state.libraryOpenId = null;
  state.manuscripts = loadManuscriptsSafe();
  state.readerOpenId = null;
  state.editorOpenId = null;
  state.editorFindOpen = false;
  state.editorLinkOpen = false;
  state.readerFindOpen = false;
  state.readerFindQuery = '';
  state.readerFindIndex = -1;
  state.readerFindCount = 0;
  state.editorRename = null;
  state.editorDelete = null;
  state.createType = 'novel';
  state.libraryModal = null;
  state.storyBrains=loadStoryBrainsSafe();
  Object.keys(state.storyBrains||{}).forEach(id=>{
    const b=state.storyBrains[id]||{};
    b.premise=typeof b.premise==='string'?b.premise:'';
    b.characters=Array.isArray(b.characters)?b.characters:[];
    b.locations=Array.isArray(b.locations)?b.locations:[];
    b.factions=Array.isArray(b.factions)?b.factions:[];
    b.events=Array.isArray(b.events)?b.events:[];
    b.threads=Array.isArray(b.threads)?b.threads:[];
    b.storyRules=Array.isArray(b.storyRules)?b.storyRules:[];
    b.customEntries=Array.isArray(b.customEntries)?b.customEntries:[];
    b.notes=Array.isArray(b.notes)?b.notes:[];
    if(!b.fieldDefs || typeof b.fieldDefs!=='object') b.fieldDefs={};
    ['characters','locations','factions','events','threads','storyRules','customEntries'].forEach(key=>{
      b.fieldDefs[key]=Array.isArray(b.fieldDefs[key])?b.fieldDefs[key]:[];
      b.fieldDefs[key]=b.fieldDefs[key].filter(fd=>fd && typeof fd==='object' && typeof fd.id==='string' && typeof fd.name==='string');
    });
    if(!b.storyPosition || typeof b.storyPosition!=='object') b.storyPosition={arc:'',phase:'',chapter:'',status:'Not started'};
    if(!Array.isArray(b.arcs)) b.arcs=[];
    if(!Array.isArray(b.arcs)) b.arcs=[];
    ['characters','locations','factions','events','threads','storyRules','customEntries'].forEach(key=>{
      b[key].forEach(x=>{
        if(!x || typeof x!=='object') return;
        if(typeof x.active!=='boolean') x.active=true;
        if(typeof x.instructions!=='string') x.instructions='';
        if(typeof x.promptTemplate!=='string') x.promptTemplate='';
        if(typeof x.placeholders!=='string') x.placeholders='';
        if(typeof x.additionalInfo!=='string') x.additionalInfo='';
        if(typeof x.memoryType!=='string') x.memoryType = x.canonStatus==='draft'?'idea':(x.canonStatus==='rejected'?'rejected':(x.canonStatus==='current'?'current':'established'));
        if(typeof x.timeScope!=='string') x.timeScope = x.memoryType==='current'?'current':'current';
        if(typeof x.knowledgeScope!=='string') x.knowledgeScope='everyone';
        if(typeof x.knowledgePeople!=='string') x.knowledgePeople='';
        if(typeof x.revealStatus!=='string') x.revealStatus='available';
        if(typeof x.revealWhen!=='string') x.revealWhen='';
        if(typeof x.protectedFact!=='boolean') x.protectedFact=!!x.canonLocked;
      });
    });
    state.storyBrains[id]=b;
  });
  saveStoryBrainsSafe();
  Object.values(state.storyBrains||{}).forEach(b=>ensureBrain20(b));
  saveStoryBrainsSafe();

  state.tags=loadTagsSafe();
  state.libraryTagFilter='all';
  state.libraryTagFilters=[];
  state.libraryTagMode='all';
  state.brainView='overview';
  state.brainOpenId=null;
  state.brainInput=null;
  state.brainRead=null;
  state.brainFieldManager=null;
  state.brainDefaultPack='worldbuilding';
  state.brainDelete=null;
  state.brainFieldDelete=null;
  state.brainRead=null;
  state.brainRead=null;

  state.conceptDraft = {
    idea:'',
    type:'novel',
    style:'my-taste',
    customStyle:'',
    customStyleName:'',
    customStyleSample:'',
    projectTitle:''
  };
  state.conceptStep = 1;
  state.savedStyles = loadSavedStylesSafe();
  state.styleDeleteConfirmId = null;




  function saveSettings(values){
    const next=values || {theme:state.theme, accent:state.accent, help:state.help, nano:state.nanoGPT};
    next.nano=normalizeNanoGPT(next.nano||state.nanoGPT);
    try {
      localStorage.setItem('aurora_phase1_settings', JSON.stringify(next));
      return true;
    } catch(e) { return false; }
  }
  function beginSettings(){
    state.settingsDraft={theme:state.theme, accent:state.accent, help:state.help, nano:normalizeNanoGPT(state.nanoGPT)};
  }
  function discardSettings(){
    state.settingsDraft=null;
  }
  function commitSettings(){
    const draft=state.settingsDraft || {theme:state.theme, accent:state.accent, help:state.help, nano:state.nanoGPT};
    draft.nano=normalizeNanoGPT(draft.nano||state.nanoGPT);
    if(!saveSettings(draft)) return false;
    state.theme=draft.theme;
    state.accent=draft.accent;
    state.help=draft.help;
    state.nanoGPT=normalizeNanoGPT(draft.nano);
    saveNanoGPTSettings(state.nanoGPT);
    state.settingsDraft=null;
    return true;
  }

  function effectiveSettings(){
    if(state.route==='more' && state.settingsDraft) return state.settingsDraft;
    return {theme:state.theme, accent:state.accent, help:state.help};
  }
  function applyTheme(settings){
    const active=settings || effectiveSettings();
    const a=accents.find(x=>x.id===active.accent)||accents[0];
    document.documentElement.style.setProperty('--accent',a.value);
    document.documentElement.style.setProperty('--accent2',a.value2);
    document.documentElement.style.setProperty('--accent-soft',hexToRgba(a.value,.16));
    document.documentElement.style.setProperty('--bg',active.theme==='light'?'#f5f3f8':'#0b0a10');
    document.documentElement.style.setProperty('--surface',active.theme==='light'?'#ffffff':'#12101a');
    document.documentElement.style.setProperty('--surface2',active.theme==='light'?'#f0edf5':'#191622');
    document.documentElement.style.setProperty('--surface3',active.theme==='light'?'#e8e3ef':'#211d2c');
    document.documentElement.style.setProperty('--text',active.theme==='light'?'#17131d':'#f7f4fb');
    document.documentElement.style.setProperty('--muted',active.theme==='light'?'#625a6d':'#aaa3b8');
    document.querySelector('meta[name="theme-color"]').setAttribute('content',a.value);
  }
  function hexToRgba(hex,alpha){
    const h=hex.replace('#',''); const r=parseInt(h.slice(0,2),16),g=parseInt(h.slice(2,4),16),b=parseInt(h.slice(4,6),16);
    return `rgba(${r},${g},${b},${alpha})`;
  }
  function persistNavigation(){
    try{
      sessionStorage.setItem('aurora_phase2_navigation',JSON.stringify({route:state.route,history:state.history.slice(-50)}));
    }catch(e){}
  }
  function restoreNavigation(){
    try{
      const raw=sessionStorage.getItem('aurora_phase2_navigation');
      if(!raw)return;
      const n=JSON.parse(raw);
      if(n && ROUTES[n.route]){
        state.route=n.route;
        state.history=Array.isArray(n.history)?n.history.filter(r=>ROUTES[r]).slice(-50):[];
      }
    }catch(e){}
  }
  function renderAndScroll(){
    persistNavigation();
    render();
    window.scrollTo(0,0);
  }
  function go(route){
    if(!ROUTES[route] || route===state.route)return;
    if(state.route==='more') discardSettings();
    state.history.push(state.route);
    if(route==='more') beginSettings();
    state.route=route;
    renderAndScroll();
  }
  function back(){if(state.brainRead){state.brainRead=null;render();window.scrollTo(0,0);return}if(state.brainInput){state.brainInput=null;render();window.scrollTo(0,0);return}if(state.brainOpenId){state.brainOpenId=null;state.brainView='overview';render();window.scrollTo(0,0);return}if(state.libraryOpenId && state.route==='library'){state.libraryOpenId=null;render();window.scrollTo(0,0);return}
    if(state.route==='more') discardSettings();
    const previous=state.history.pop();
    if(previous && ROUTES[previous]) state.route=previous;
    else {state.route='home';state.history=[];}
    renderAndScroll();
  }
  function goHome(){
    if(state.route==='more') discardSettings();
    state.history=[];
    state.route='home';
    renderAndScroll();
  }
  function help(title,body){
    const settings=effectiveSettings();
    return settings.help ? `<div class="tip"><b>💡 ${title}</b><br>${body}</div>` : '';
  }
  function layout(content,active){
    return `<div class="app">
      <header class="topbar">
        <button class="iconbtn" data-action="back" aria-label="Back">‹</button>
        <button class="brandbutton" data-action="home" aria-label="Aurora home"><div class="logo"><span>A</span></div><div class="brand"><div><div class="title">Aurora</div><div class="subtitle">Private Story Studio · Phase 5</div></div></div></button>
        <div class="spacer"></div>
        <button class="iconbtn" data-action="help" aria-label="Help">?</button>
      </header>
      <main>${content}</main>
      <nav class="bottom">
        ${nav('home','⌂','Home',active)}${nav('library','▤','Library',active)}${nav('create','＋','Create',active)}${nav('more','⋯','More',active)}
      </nav>
    </div>`;
  }
  function nav(route,icon,label,active){
    return `<button class="navitem ${active===route?'active':''}" data-route="${route}"><span class="ni">${icon}</span>${label}</button>`;
  }
  function home(){
    return layout(`<div class="page">
      <section class="hero"><div class="eyebrow">Your private creative studio</div><h1>Make stories.<br>Keep the complexity hidden.</h1><p>Aurora will eventually handle memory, characters, planning, style, continuity and AI generation for you. Phase 5 is building the local Story Brain before AI generation.</p>
      ${help('What am I looking at?','This is Aurora’s home. The large actions will become your main workflow. During Phase 1, they are only navigation and design tests; AI generation is intentionally not connected yet.')}</section>
      <section class="section"><div class="eyebrow">Phase 1</div><div class="card"><div class="status"><span class="dot"></span> Navigation architecture testing</div><p style="margin-top:8px">No AI calls, no story database and no fake generation. We are proving the interface before adding complexity.</p></div></section>
    </div>`,'home');
  }

  const MANUSCRIPT_KEY='aurora_manuscripts_v1';
  function loadManuscriptsSafe(){try{const raw=localStorage.getItem(MANUSCRIPT_KEY);const p=raw?JSON.parse(raw):{};return p&&typeof p==='object'&&!Array.isArray(p)?p:{}}catch(e){return {}}}
  function saveManuscriptsSafe(){try{localStorage.setItem(MANUSCRIPT_KEY,JSON.stringify(state.manuscripts));return true}catch(e){return false}}
  function uid(prefix){return prefix+'_'+Date.now().toString(36)+'_'+Math.random().toString(36).slice(2,7)}
  function defaultReaderSettings(){return {fontFamily:'system',fontSize:19,lineHeight:1.75,width:720,margin:24,padding:18,align:'left',theme:'match',background:'plain'}}
  function defaultManuscript(){const ch={id:uid('ch'),title:'Chapter 1',order:1,scenes:[{id:uid('sc'),title:'Scene 1',content:'',notes:''}]};return {version:2,chapters:[ch],activeChapterId:ch.id,activeSceneId:ch.scenes[0].id,reader:defaultReaderSettings(),bookmarks:[],updatedAt:Date.now()}}
  function ensureManuscript(id){
    let m=state.manuscripts[id];
    if(!m||typeof m!=='object'||Array.isArray(m)) m=defaultManuscript();
    if(!Array.isArray(m.chapters)) m.chapters=[];
    if(!m.chapters.length){const d=defaultManuscript();m.chapters=d.chapters;m.activeChapterId=d.activeChapterId;m.activeSceneId=d.activeSceneId}
    m.chapters=m.chapters.filter(c=>c&&typeof c==='object');
    m.chapters.forEach((c,i)=>{if(!c.id)c.id=uid('ch');if(!c.title)c.title='Chapter '+(i+1);if(!Array.isArray(c.scenes))c.scenes=[];if(!c.scenes.length)c.scenes.push({id:uid('sc'),title:'Scene 1',content:'',notes:''});c.scenes=c.scenes.filter(x=>x&&typeof x==='object');c.scenes.forEach((sc,j)=>{if(!sc.id)sc.id=uid('sc');if(!sc.title)sc.title='Scene '+(j+1);if(typeof sc.content!=='string')sc.content=String(sc.content||'')})});
    if(!m.activeChapterId||!m.chapters.some(c=>c.id===m.activeChapterId))m.activeChapterId=m.chapters[0].id;
    const ac=m.chapters.find(c=>c.id===m.activeChapterId);if(!m.activeSceneId||!ac.scenes.some(sc=>sc.id===m.activeSceneId))m.activeSceneId=ac.scenes[0].id;
    m.reader=Object.assign(defaultReaderSettings(),m.reader||{});if(!Array.isArray(m.bookmarks))m.bookmarks=[];
    m.updatedAt=m.updatedAt||Date.now();state.manuscripts[id]=m;return m;
  }
  function getActiveScene(m){const c=m.chapters.find(x=>x.id===m.activeChapterId)||m.chapters[0];const sc=c.scenes.find(x=>x.id===m.activeSceneId)||c.scenes[0];m.activeChapterId=c.id;m.activeSceneId=sc.id;return {chapter:c,scene:sc}}
  function manuscriptStats(m){let words=0,filled=0; m.chapters.forEach(c=>c.scenes.forEach(sc=>{const txt=String(sc.content||'').replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim();words+=txt?txt.split(' ').length:0;if(txt)filled++}));return {words,filled,chapters:m.chapters.length}}
  function syncStoryManuscriptMeta(id){const item=state.library.find(x=>x.id===id);if(!item)return;const m=ensureManuscript(id),st=manuscriptStats(m);item.chapterCount=m.chapters.length;item.progress=st.chapters?Math.min(100,Math.round((st.filled/st.chapters)*100)):0;item.updatedAt=Date.now();saveLibrarySafe(state.library);m.updatedAt=Date.now();saveManuscriptsSafe()}
  function editorPersistSurface(){if(!state.editorOpenId)return;const m=ensureManuscript(state.editorOpenId);const el=document.getElementById('editor-surface');if(el){const {scene}=getActiveScene(m);scene.content=el.innerHTML;scene.updatedAt=Date.now();m.updatedAt=Date.now();saveManuscriptsSafe();syncStoryManuscriptMeta(state.editorOpenId)}}
  function escapeHtml(s){return safeText(s).replace(/\n/g,'<br>')}
  function readerThemeStyle(m){const r=m.reader||defaultReaderSettings();let bg='transparent',fg='var(--text)';if(r.theme==='light'){bg='#fff';fg='#15151a'}else if(r.theme==='dark'){bg='#101016';fg='#eee'}else if(r.theme==='sepia'){bg='#f4ead7';fg='#3e3326'}return `font-family:${r.fontFamily==='serif'?'Georgia,serif':r.fontFamily==='sans'?'Arial,sans-serif':'system-ui,sans-serif'};font-size:${Number(r.fontSize)||19}px;line-height:${Number(r.lineHeight)||1.75};max-width:${Number(r.width)||720}px;margin-left:auto;margin-right:auto;padding:${Number(r.padding)||18}px ${Number(r.margin)||24}px;background:${bg};color:${fg};text-align:${r.align||'left'};border-radius:18px`}
  function manuscriptReader(id){const item=state.library.find(x=>x.id===id);if(!item)return library();const m=ensureManuscript(id);const r=m.reader;const active=m.chapters.find(c=>c.id===m.activeChapterId)||m.chapters[0];const allText=active.scenes.map(sc=>sc.content||'').join('<hr>');return layout(`<div class="page reader-shell reader-layout">
    <div class="reader-toolbar"><div class="reader-top"><button class="back" data-reader-close>‹ Back</button><div class="reader-title"><b>${safeText(item.title)}</b><span>Reader · ${safeText(active.title)}</span></div><div class="reader-actions"><button class="mini-action" data-reader-toc>TOC</button><button class="mini-action" data-reader-settings>Reader</button><button class="mini-action" data-reader-find>Find</button><button class="mini-action" data-reader-bookmark>🔖</button><button class="mini-action" data-reader-fullscreen>⛶</button></div></div></div>
    <div class="reader-drawer" id="reader-toc"><b>Table of contents</b>${m.chapters.map(c=>`<button class="reader-toc-item ${c.id===active.id?'active':''}" data-reader-chapter="${c.id}"><span>${c.order||''}</span><b>${safeText(c.title)}</b></button>`).join('')}</div>
    <div class="reader-drawer" id="reader-settings"><div class="reader-settings-grid">
      <div class="reader-setting"><label>Font</label><select data-reader-setting="fontFamily"><option value="system" ${r.fontFamily==='system'?'selected':''}>System</option><option value="serif" ${r.fontFamily==='serif'?'selected':''}>Serif</option><option value="sans" ${r.fontFamily==='sans'?'selected':''}>Sans</option></select></div>
      <div class="reader-setting"><label>Size</label><input type="range" min="14" max="30" step="1" value="${r.fontSize}" data-reader-setting="fontSize"></div>
      <div class="reader-setting"><label>Line height</label><input type="range" min="1.2" max="2.2" step="0.05" value="${r.lineHeight}" data-reader-setting="lineHeight"></div>
      <div class="reader-setting"><label>Text width</label><input type="range" min="420" max="980" step="20" value="${r.width}" data-reader-setting="width"></div>
      <div class="reader-setting"><label>Page margin</label><input type="range" min="8" max="60" step="2" value="${r.margin}" data-reader-setting="margin"></div>
      <div class="reader-setting"><label>Alignment</label><select data-reader-setting="align"><option value="left" ${r.align==='left'?'selected':''}>Left</option><option value="justify" ${r.align==='justify'?'selected':''}>Justified</option><option value="center" ${r.align==='center'?'selected':''}>Center</option></select></div>
      <div class="reader-setting"><label>Theme</label><select data-reader-setting="theme"><option value="match" ${r.theme==='match'?'selected':''}>App</option><option value="light" ${r.theme==='light'?'selected':''}>Light</option><option value="dark" ${r.theme==='dark'?'selected':''}>Dark</option><option value="sepia" ${r.theme==='sepia'?'selected':''}>Sepia</option></select></div>
    </div></div>
    ${state.readerFindOpen?`<div class="reader-find-dock" id="reader-find-panel"><div class="reader-find-dock-inner"><input id="reader-find-input" placeholder="Find in this chapter" value="${safeText(state.readerFindQuery||'')}"><button class="primary" data-reader-find-next>Next</button><span class="reader-find-count" id="reader-find-count">${state.readerFindCount?`0 / ${state.readerFindCount}`:'Ready'}</span><button class="secondary" data-reader-find-close>Close</button></div></div>`:''}
    <div class="reader-chapter-head"><div class="eyebrow">Chapter ${active.order||''}</div><h1>${safeText(active.title)}</h1><div class="bookmark-strip">${m.bookmarks.filter(b=>b.chapterId===active.id).map(b=>`<button class="bookmark-chip" data-reader-bookmark-jump="${safeText(b.id)}">🔖 ${safeText(b.label||'Bookmark')}</button>`).join('')}</div></div>
    <div class="reader-progress" id="reader-progress"><span style="width:${Number(m.readerProgress?.[active.id]||0)}%"></span></div><article id="reader-content" class="reader-content" style="${readerThemeStyle(m)}">${allText||'<div class="reader-empty"><h2>This chapter is empty</h2><p>Open the Editor to write it. Aurora will keep the manuscript separate from the Story Brain.</p><button class="primary" data-open-editor-from-reader="'+id+'">Open Editor</button></div>'}</article>
    <div class="reader-actions" style="margin-top:18px"><button class="secondary" data-reader-prev>‹ Previous</button><button class="secondary" data-reader-next>Next ›</button><button class="secondary" data-open-editor-from-reader="${id}">Edit manuscript</button></div>
  </div>`,'library')}
  function editorToolbar(){return `<div class="editor-formatbar"><button class="mini-action" data-editor-cmd="bold"><b>B</b></button><button class="mini-action" data-editor-cmd="italic"><i>I</i></button><button class="mini-action" data-editor-cmd="underline"><u>U</u></button><select class="sortselect" data-editor-font aria-label="Font"><option value="">Font</option><option value="Georgia">Serif</option><option value="Arial">Sans</option><option value="Courier New">Mono</option></select><select class="sortselect" data-editor-size aria-label="Size"><option value="">Size</option><option value="2">Small</option><option value="3">Normal</option><option value="4">Large</option><option value="5">Huge</option></select><label class="mini-action color-tool">A <input type="color" data-editor-color value="#ffffff" aria-label="Text color"></label><label class="mini-action color-tool">▰ <input type="color" data-editor-highlight value="#fff59d" aria-label="Highlight"></label><button class="mini-action" data-editor-cmd="insertUnorderedList">• List</button><button class="mini-action" data-editor-cmd="insertOrderedList">1. List</button><button class="mini-action" data-editor-block="H2">H2</button><button class="mini-action" data-editor-block="H3">H3</button><button class="mini-action" data-editor-align="justifyLeft">Left</button><button class="mini-action" data-editor-align="justifyCenter">Center</button><button class="mini-action" data-editor-align="justifyRight">Right</button><button class="mini-action" data-editor-link>Link</button><button class="mini-action" data-editor-image>Image</button><button class="mini-action" data-editor-find>Find/Replace</button><button class="mini-action" data-editor-cmd="undo">↶</button><button class="mini-action" data-editor-cmd="redo">↷</button></div>`}
  function manuscriptEditor(id){const item=state.library.find(x=>x.id===id);if(!item)return library();const m=ensureManuscript(id),a=getActiveScene(m);return layout(`<div class="page editor-shell">
    <div class="editor-toolbar"><div class="editor-top"><button class="back" data-editor-close>‹ Back</button><div class="editor-title"><b>${safeText(item.title)}</b><span>Manuscript Editor · ${safeText(a.chapter.title)} · ${safeText(a.scene.title)}</span></div><div class="editor-actions"><button class="mini-action" data-editor-sidebar>Chapters</button><button class="mini-action" data-open-reader-from-editor="${id}">Reader</button><button class="primary" data-editor-save>Save</button></div></div></div>
    ${state.editorDelete?`<div class="card" style="margin-bottom:10px"><b>Remove ${state.editorDelete.type==='chapter'?'chapter':'scene'}?</b><p class="builder-note">This cannot be undone from the editor.</p><div class="chapter-actions"><button class="secondary" data-editor-delete-cancel>Cancel</button><button class="danger" data-editor-delete-confirm>Delete</button></div></div>`:''}<div class="editor-workspace"><aside class="editor-sidebar" id="editor-sidebar"><h3>CHAPTERS</h3>${m.chapters.map((c,i)=>`<div><button class="editor-tree-btn ${c.id===a.chapter.id?'active':''}" data-editor-chapter="${c.id}">${i+1}. ${safeText(c.title)}</button><div class="chapter-actions"><button class="mini-action" data-editor-rename-chapter="${c.id}">Rename</button><button class="mini-action danger-mini" data-editor-delete-chapter="${c.id}">Delete</button></div>${c.id===a.chapter.id?`<div class="editor-scene">${c.scenes.map(sc=>`<button class="editor-tree-btn ${sc.id===a.scene.id?'active':''}" data-editor-scene="${sc.id}">${safeText(sc.title)}</button>`).join('')}<div class="chapter-actions"><button class="mini-action" data-editor-new-scene>＋ Scene</button></div></div>`:''}</div>`).join('')}<div class="chapter-add-card"><button class="secondary" data-editor-new-chapter>＋ New chapter</button></div></aside>
      <section><input id="editor-image-input" type="file" accept="image/*" hidden><div class="card" style="margin-bottom:10px"><div class="storytop"><b>${safeText(a.scene.title)}</b><div class="editor-actions"><button class="mini-action" data-editor-rename-scene>Rename</button><button class="mini-action danger-mini" data-editor-delete-scene>Delete</button></div></div><div class="storymeta">${safeText(a.chapter.title)} · ${manuscriptStats(m).words} words total</div></div>${state.editorRename?`<div class="editor-link-panel"><input id="editor-rename-input" value="${safeText(state.editorRename.value||'')}"><button class="secondary" data-editor-rename-confirm>Save name</button><button class="secondary" data-editor-rename-cancel>Cancel</button></div>`:''}<div class="editor-surface-wrap">${state.editorFindOpen?`<div class="editor-search-panel"><input id="editor-find-input" placeholder="Find"><input id="editor-replace-input" placeholder="Replace"><button class="secondary" data-editor-find-next>Find</button><button class="secondary" data-editor-replace-all>Replace all</button></div>`:''}${state.editorLinkOpen?`<div class="editor-link-panel"><input id="editor-link-input" placeholder="https://example.com"><button class="secondary" data-editor-apply-link>Apply link</button><button class="secondary" data-editor-close-link>Close</button></div>`:''}${editorToolbar()}<div id="editor-surface" class="editor-surface" contenteditable="true" spellcheck="true" data-editor-surface>${a.scene.content||'<p><br></p>'}</div><div class="editor-meta"><span>${manuscriptStats(m).words} words</span><span>Autosaves locally</span><span>Scene content is separate from Story Brain</span></div></div></section></div></div>`,'library')}
  function library(){
    if(state.brainOpenId) return storyBrainPage(state.brainOpenId);
    if(state.readerOpenId) return manuscriptReader(state.readerOpenId);
    if(state.editorOpenId) return manuscriptEditor(state.editorOpenId);
    if(state.libraryOpenId){
      const item=state.library.find(x=>x.id===state.libraryOpenId);
      if(!item){state.libraryOpenId=null;return library();}
      const tags=item.tags||[];
      return layout(`<div class="page">
        <div class="backrow"><button class="back" data-action="back">‹ Back</button><span style="color:var(--muted);font-size:12px">Back to Library</span></div>
        <div class="eyebrow">${item.type==='comic'?'Comic':'Novel'}</div>
        <h1>${safeText(item.title)}</h1>
        <p>${safeText(item.summary||item.concept?.summary||(item.type==='comic'?'Comic':'Novel')+' stored privately on this device.')}</p>
        ${item.styleName?`<div class="detail-style"><span>Style</span><b>${safeText(item.styleName)}</b></div>`:''}
        <div class="tag-editor-card">
          <div class="tag-editor-head"><div><b>Tags</b><span>Organize and filter your archive</span></div></div>
          <div class="tagchips">${tags.length?tags.map(t=>`<button class="tag removable" data-remove-tag="${item.id}" data-tag="${safeText(t)}">#${safeText(t)} ×</button>`).join(''):`<span class="no-tags">No tags yet.</span>`}</div>
          <div class="tag-add-row"><input id="story-tag-input" placeholder="e.g. cultivation, action, mature"><button class="secondary" data-add-tag="${item.id}">Add tag</button></div>
          <div class="builder-note">💡 Tags are local labels for your own organization. Later Aurora can suggest tags automatically.</div>
        </div>

        <div class="actions"><button class="primary" data-open-reader="${item.id}">📖 Read</button><button class="secondary" data-open-editor="${item.id}">✎ Edit manuscript</button></div>

        <div class="brain-entry-card">
          <div class="brain-entry-icon">◇</div>
          <div class="cardcopy"><strong>Story Brain</strong><span>${brainCount(item.id)} knowledge records · characters, world, events, threads and rules.</span></div>
          <button class="secondary" data-open-brain="${item.id}">Open</button>
        </div>

        <div class="library-detail">
          <div><span>Type</span><b>${item.type==='comic'?'Comic':'Novel'}</b></div>
          <div><span>Progress</span><b>${Math.round(item.progress||0)}%</b></div>
          <div><span>Chapters</span><b>${item.chapterCount||0}</b></div>
          <div><span>Favorite</span><b>${item.favorite?'Yes':'No'}</b></div>
        </div>
        <div class="actions">
          <button class="primary" data-library-favorite="${item.id}">${item.favorite?'★ Remove favorite':'☆ Add to favorites'}</button>
          <button class="secondary" data-library-rename="${item.id}">Rename</button>
          <button class="danger" data-library-delete="${item.id}">Delete</button>
        </div>
      </div>`,'library');
    }

    const q=state.libraryQuery.trim().toLowerCase();
    let items=state.library.filter(item=>{
      const typeOk=state.libraryFilter==='all'||item.type===state.libraryFilter||(state.libraryFilter==='favorites'&&item.favorite);
      const tagOk=storyMatchesTagFilter(item);
      const qOk=!q||item.title.toLowerCase().includes(q)||String(item.summary||item.concept?.summary||'').toLowerCase().includes(q)||(item.tags||[]).some(t=>t.toLowerCase().includes(q));
      return typeOk&&tagOk&&qOk;
    });
    items=[...items];
    if(state.librarySort==='name-asc')items.sort((a,b)=>a.title.localeCompare(b.title,undefined,{sensitivity:'base',numeric:true}));
    else if(state.librarySort==='name-desc')items.sort((a,b)=>b.title.localeCompare(a.title,undefined,{sensitivity:'base',numeric:true}));
    else if(state.librarySort==='created-new')items.sort((a,b)=>b.createdAt-a.createdAt);
    else if(state.librarySort==='created-old')items.sort((a,b)=>a.createdAt-b.createdAt);
    else if(state.librarySort==='progress-high')items.sort((a,b)=>(b.progress||0)-(a.progress||0));
    else if(state.librarySort==='progress-low')items.sort((a,b)=>(a.progress||0)-(b.progress||0));
    else if(state.librarySort==='favorites')items.sort((a,b)=>Number(b.favorite)-Number(a.favorite)||b.updatedAt-a.updatedAt);
    else if(state.librarySort==='type')items.sort((a,b)=>a.type.localeCompare(b.type)||a.title.localeCompare(b.title));
    else if(state.librarySort==='updated-new')items.sort((a,b)=>b.updatedAt-a.updatedAt);
    else items.sort((a,b)=>(b.lastOpenedAt||0)-(a.lastOpenedAt||0)||b.updatedAt-a.updatedAt);

    const cards=items.map(item=>`<button class="storycard" data-library-open="${item.id}">
      <div class="storycover">${item.type==='comic'?'◈':'✦'}</div>
      <div class="storyinfo">
        <div class="storytop"><b>${safeText(item.title)}</b>${item.favorite?'<span>★</span>':''}</div>
        <div class="storymeta">${item.type==='comic'?'Comic':'Novel'} · ${item.chapterCount||0} chapters${item.styleName?' · '+safeText(item.styleName):''}</div>
        <p class="storysummary">${safeText(item.summary||item.concept?.summary||'No story summary yet.')}</p>
        ${(item.tags||[]).length?`<div class="tagchips small">${item.tags.slice(0,4).map(t=>`<span class="tag">#${safeText(t)}</span>`).join('')}${item.tags.length>4?`<span class="tag moretag">+${item.tags.length-4}</span>`:''}</div>`:''}
        <div class="progressline"><span style="width:${Math.round(item.progress||0)}%"></span></div>
        <div class="storymeta">${Math.round(item.progress||0)}% · ${item.lastOpenedAt?'Opened '+dateLabel(item.lastOpenedAt):'Not opened yet'}</div>
      </div>
    </button>`).join('');

    const tags=allStoryTags();
    return layout(`<div class="page">
      <div class="eyebrow">Archive</div><h1>Library</h1><p>Your stories, stored privately on this device.</p>
      <div class="library-tools">
        <label class="searchbox"><span>⌕</span><input id="library-search" value="${safeText(state.libraryQuery)}" placeholder="Search titles, summaries or tags…" autocomplete="off"></label>
        <div class="filterrow">
          <button class="chip ${state.libraryFilter==='all'?'active':''}" data-library-filter="all">All</button>
          <button class="chip ${state.libraryFilter==='novel'?'active':''}" data-library-filter="novel">Novels</button>
          <button class="chip ${state.libraryFilter==='comic'?'active':''}" data-library-filter="comic">Comics</button>
          <button class="chip ${state.libraryFilter==='favorites'?'active':''}" data-library-filter="favorites">Favorites</button>
        </div>
        ${tags.length?`<div class="tag-filter-box">
          <div class="tag-filter-head"><div><b>Filter by tags</b><span>${state.libraryTagFilters.length?state.libraryTagFilters.length+' selected':'Choose one or more tags'}</span></div>
          ${state.libraryTagFilters.length?`<button class="mini-action" data-clear-tag-filters>Clear</button>`:''}</div>
          <div class="tag-filter-modes"><button class="tag ${state.libraryTagMode==='all'?'active':''}" data-tag-mode="all">Match all</button><button class="tag ${state.libraryTagMode==='any'?'active':''}" data-tag-mode="any">Match any</button></div>
          <div class="tag-filter-strip">${tags.map(t=>`<button class="tag ${state.libraryTagFilters.some(x=>x.toLowerCase()===t.toLowerCase())?'active':''}" data-tag-filter="${safeText(t)}">#${safeText(t)}</button>`).join('')}</div>
          <div class="builder-note">💡 <b>Match all</b> means a story must have every selected tag. <b>Match any</b> means it can have at least one.</div>
        </div>`:''}
        <div class="sort-row"><span>Sort</span><select class="sortselect" id="library-sort" aria-label="Sort stories">
          <option value="opened-new" ${state.librarySort==='opened-new'?'selected':''}>Recently opened</option>
          <option value="created-new" ${state.librarySort==='created-new'?'selected':''}>Recently added</option>
          <option value="updated-new" ${state.librarySort==='updated-new'?'selected':''}>Recently changed</option>
          <option value="created-old" ${state.librarySort==='created-old'?'selected':''}>Oldest added</option>
          <option value="name-asc" ${state.librarySort==='name-asc'?'selected':''}>Title A–Z</option>
          <option value="name-desc" ${state.librarySort==='name-desc'?'selected':''}>Title Z–A</option>
          <option value="progress-high" ${state.librarySort==='progress-high'?'selected':''}>Progress high → low</option>
          <option value="progress-low" ${state.librarySort==='progress-low'?'selected':''}>Progress low → high</option>
          <option value="favorites" ${state.librarySort==='favorites'?'selected':''}>Favorites first</option>
          <option value="type" ${state.librarySort==='type'?'selected':''}>Type</option>
        </select></div>
      </div>
      ${items.length?`<div class="storylist">${cards}</div>`:`<div class="emptycard"><div class="emptyicon">✦</div><h2>${state.library.length?'No matches':'Your library is empty'}</h2><p>${state.library.length?'Try another search, filter or tag.':'Create your first story and it will appear here.'}</p><button class="primary" data-route="create">Create a story</button></div>`}
    </div>`,'library');
  }

  const BRAIN_KEYS=['characters','locations','factions','events','threads','storyRules','customEntries'];
  const BRAIN_LABELS={characters:'Characters',locations:'Locations',factions:'Factions',events:'Timeline events',threads:'Open threads',storyRules:'Story rules',customEntries:'Custom entries'};
  function brainFieldDefs(brain,key){return Array.isArray(brain.fieldDefs?.[key])?brain.fieldDefs[key]:[]}
  const DEFAULT_FIELD_PACKS=[
    {id:'worldbuilding',icon:'🌍',name:'Worldbuilding',desc:'Core setting fields for places, factions, societies and the rules that make a world feel consistent.',items:[
      ['locations','Culture & Daily Life','Social customs, traditions, cuisine, clothing, taboos, entertainment and ordinary life.','textarea'],
      ['locations','Economy & Trade','Currencies, resources, trade routes, labor, markets and black markets.','textarea'],
      ['locations','Cosmology & Religion','Creation myths, pantheons, afterlife, astrology, magic origins and religious institutions.','textarea'],
      ['factions','Culture & Customs','Traditions, values, rituals, taboos and everyday practices.','textarea'],
      ['factions','Beliefs & Religion','Religious or philosophical beliefs and institutions.','textarea'],
      ['factions','Economy & Resources','How the group obtains, controls and trades resources.','textarea']
    ]},
    {id:'fanfic-comic',icon:'🎭',name:'Fanfiction & Comic Tropes',desc:'Continuity helpers for fanfiction, adaptations and stories that need to respect or deliberately bend source material.',items:[
      ['characters','Canon Role','The character’s canon role or relationship to the source material.','text'],
      ['characters','Canon Divergence','What differs from canon for this character.','textarea'],
      ['customEntries','Fanfiction Tropes','Tropes, callbacks, canon expectations and genre conventions to preserve.','textarea'],
      ['customEntries','Canon Facts','Important source-material facts that should remain consistent.','textarea'],
      ['customEntries','Adaptation Changes','Deliberate changes from the source material.','textarea']
    ]},
    {id:'visual',icon:'🎬',name:'Comic & Visual Storytelling',desc:'Fields for visual continuity, composition, panels, camera language and recurring design details.',items:[
      ['characters','Visual Character Notes','Hair, outfit, silhouette, colors, identifying features and continuity anchors.','textarea'],
      ['locations','Visual Environment','Architecture, palette, lighting, recurring props and visual identity.','textarea'],
      ['customEntries','Panel / Camera Rules','Preferred panel rhythm, camera language, framing and recurring compositions.','textarea'],
      ['customEntries','Comic Dialogue Rules','Speech-bubble, caption, dialogue-density and lettering constraints.','textarea'],
      ['customEntries','Visual Continuity Rule','A visual fact that must remain consistent across scenes/pages.','textarea']
    ]},
    {id:'culture',icon:'🍜',name:'Culture & Daily Life',desc:'A dedicated pack for making ordinary life believable instead of only tracking plot-important lore.',items:[
      ['locations','Social Customs','Greetings, etiquette, hospitality, hierarchy and social expectations.','textarea'],
      ['locations','Cuisine & Food','Staple foods, meals, cooking methods, drinks and food customs.','textarea'],
      ['locations','Clothing & Appearance','Typical clothing, status markers, uniforms and fashion.','textarea'],
      ['locations','Taboos & Etiquette','Things considered rude, shameful, forbidden or sacred.','textarea'],
      ['locations','Entertainment & Leisure','Games, festivals, music, sports, performances and hobbies.','textarea']
    ]},
    {id:'cosmology',icon:'☀️',name:'Cosmology & Religion',desc:'Keep creation myths, gods, afterlife concepts, religious institutions and supernatural beliefs coherent.',items:[
      ['customEntries','Creation Myth','How the world or cosmos is believed to have begun.','textarea'],
      ['customEntries','Pantheon / Deities','Major gods, entities, domains, symbols and relationships.','textarea'],
      ['customEntries','Afterlife','What happens after death and who can enter which afterlife.','textarea'],
      ['customEntries','Magic Origins','Religious or cosmological origin of supernatural power.','textarea'],
      ['factions','Religious Institutions','Temples, churches, cults, priesthoods and their influence.','textarea']
    ]},
    {id:'economy',icon:'💰',name:'Economy & Trade',desc:'Track the economic layer that often gets forgotten in long stories.',items:[
      ['locations','Currency','Names, denominations, exchange rules and valuable alternatives.','textarea'],
      ['locations','Trade Routes','Major routes, hubs, hazards and goods moving through them.','textarea'],
      ['locations','Labor & Occupations','Common jobs, guilds, status of professions and labor systems.','textarea'],
      ['customEntries','Valuable Resources','Rare resources, where they come from and why they matter.','textarea'],
      ['customEntries','Black Market','Illegal goods, smugglers, prices, risks and important brokers.','textarea']
    ]},
    {id:'power',icon:'⚡',name:'Power & Magic Systems',desc:'For cultivation, magic, superheroes and any setting where power needs explicit rules, progression and costs.',items:[
      ['characters','Power / Abilities','What this character can actually do, including signature abilities.','textarea'],
      ['characters','Power Tier / Rank','Realm, rank, class or threat tier.','text'],
      ['characters','Limits & Costs','Hard limits, activation requirements, energy sources and physical or mental costs.','textarea'],
      ['characters','Visuals & Auras','Colors, symbols, transformations and visible activation cues.','textarea'],
      ['customEntries','Power System Rules','Canonical rules, progression and restrictions of the power system.','textarea'],
      ['customEntries','Power Scaling & Tiers','Realm/rank progression, threat levels and boundaries between tiers.','textarea']
    ]},
    {id:'artifacts',icon:'🔮',name:'Artifacts, Gear & Exotic Materials',desc:'Track important items and materials so their histories, abilities and limitations remain consistent.',items:[
      ['customEntries','Relic / Legendary Item','History, abilities, personality, restrictions and costs of an important item.','textarea'],
      ['customEntries','Special Resource','Unique metals, minerals, monster parts or other crafting materials.','textarea'],
      ['customEntries','Gear / Equipment','Recurring equipment, ownership, function and limitations.','textarea'],
      ['customEntries','Crafting Rules','How important items are made, repaired, upgraded or destroyed.','textarea']
    ]},
    {id:'species',icon:'🧬',name:'Species, Races & Lineages',desc:'Track biology, inherited traits, lifespans, weaknesses and special bloodlines.',items:[
      ['customEntries','Biology & Traits','Physical adaptations, natural abilities, lifespan and weaknesses.','textarea'],
      ['customEntries','Special Bloodline','Inherited traits, transformations and ancestry.','textarea'],
      ['customEntries','Race / Species Culture','Social structure, customs and differences from other peoples.','textarea'],
      ['characters','Bloodline','This character’s clan, dynasty or inherited ancestry.','text'],
      ['characters','Species / Race','This character’s species or race.','text']
    ]}
  ];
  function fieldDefId(name){return 'field_'+name.toLowerCase().replace(/[^a-z0-9]+/g,'_').replace(/^_|_$/g,'')+'_'+Date.now().toString(36)+'_'+Math.random().toString(36).slice(2,6)}
  function addDefaultPack(brain,packId){
    const pack=DEFAULT_FIELD_PACKS.find(x=>x.id===packId); if(!pack)return 0;
    let added=0;
    pack.items.forEach(([key,name,help,type])=>{
      brain.fieldDefs[key]=Array.isArray(brain.fieldDefs[key])?brain.fieldDefs[key]:[];
      if(brain.fieldDefs[key].some(fd=>fd.name.toLowerCase()===name.toLowerCase()))return;
      brain.fieldDefs[key].push({id:fieldDefId(name),name,type,placeholder:'',help,required:false}); added++;
    });
    return added;
  }
  function customFieldHtml(def,obj){
    const value=obj?.customFields?.[def.id]??'';
    if(def.type==='textarea')return `<label class="modal-label">${safeText(def.name)}${def.required?' <span class="field-required">required</span>':''}<textarea class="modal-textarea" data-custom-field="${safeText(def.id)}" placeholder="${safeText(def.placeholder||'')}">${safeText(value)}</textarea>${def.help?`<small class="field-help">${safeText(def.help)}</small>`:''}</label>`;
    return `<label class="modal-label">${safeText(def.name)}${def.required?' <span class="field-required">required</span>':''}<input class="modal-input" data-custom-field="${safeText(def.id)}" value="${safeText(value)}" placeholder="${safeText(def.placeholder||'')}">${def.help?`<small class="field-help">${safeText(def.help)}</small>`:''}</label>`;
  }
  function brainFieldManager(id){
    if(!state.brainFieldManager)return '';
    const b=getStoryBrain(id),key=state.brainFieldManager.key,defs=brainFieldDefs(b,key);
    return `<div class="modal-backdrop brain-backdrop" data-field-manager-backdrop><div class="confirm-modal field-manager-modal">
      <div class="confirm-icon">＋</div><h2>Fields for ${safeText(BRAIN_LABELS[key]||'Brain entries')}</h2>
      <p>Add reusable fields to every entry in this section. Example: <b>Power</b> for Characters.</p>
      ${defs.length?`<div class="field-def-list">${defs.map(fd=>`<div class="field-def-row"><div><b>${safeText(fd.name)}</b><span>${fd.type==='textarea'?'Long text':'Short text'}${fd.required?' · Required':''}</span></div><button class="mini-action danger-mini" data-delete-field-def="${safeText(fd.id)}">Delete</button></div>`).join('')}`:`<div class="mutedbox">No custom fields yet.</div>`}
      <div class="field-add-form">
        <label class="modal-label">Field name<input class="modal-input" id="new-field-name" placeholder="e.g. Power, Weakness, Favorite food"></label>
        <label class="modal-label">Field type<select class="modal-input" id="new-field-type"><option value="text">Short text</option><option value="textarea">Long text</option></select></label>
        <label class="modal-label">Placeholder <span class="field-hint">optional</span><input class="modal-input" id="new-field-placeholder" placeholder="What should be written here?"></label>
        <label class="modal-label">Tip <span class="field-hint">optional</span><textarea class="modal-textarea small" id="new-field-help" placeholder="Explain what belongs in this field."></textarea></label>
        <label class="active-toggle"><input id="new-field-required" type="checkbox"><span><b>Required</b><small>Show this field when creating a new record.</small></span></label>
        <button class="primary" data-add-field-def>＋ Add field</button>
      </div>
      <div class="confirm-actions"><button class="secondary" data-field-manager-close>Close</button></div>
    </div></div>`;
  }

  function brainFieldValue(obj,key){
    return safeText(obj && obj[key] != null ? obj[key] : '');
  }

  function brainEditorModal(id){
    if(!state.brainInput) return '';
    const bi=state.brainInput;
    const b=getStoryBrain(id);
    const map={characters:'Character',locations:'Location',factions:'Faction',events:'Timeline event',threads:'Open thread',storyRules:'Story rule',customEntries:'Custom brain entry'};
    const label=map[bi.kind]||'Brain entry';
    const arr=Array.isArray(b[bi.kind])?b[bi.kind]:[];
    const obj=bi.mode==='edit' && arr[bi.index] ? arr[bi.index] : {};
    const checked=obj.active!==false?'checked':'';
    const v=k=>brainFieldValue(obj,k);

    let fields='';
    if(bi.kind==='characters'){
      fields=`
        <div class="brain-form-section"><div class="brain-form-kicker">IDENTITY</div>
          <label class="modal-label">Name<input class="modal-input" data-brain-field="name" value="${v('name')}" placeholder="e.g. Ruin"></label>
          <div class="modal-grid2">
            <label class="modal-label">Role / place in story<input class="modal-input" data-brain-field="role" value="${v('role')}" placeholder="Protagonist, rival, mentor…"></label>
            <label class="modal-label">Age / apparent age<input class="modal-input" data-brain-field="age" value="${v('age')}" placeholder="e.g. 3000"></label>
          </div>
          <div class="modal-grid2">
            <label class="modal-label">Gender / identity<input class="modal-input" data-brain-field="identity" value="${v('identity')}" placeholder="Optional"></label>
            <label class="modal-label">Status<input class="modal-input" data-brain-field="status" value="${v('status')}" placeholder="Alive, retired, missing…"></label>
          </div>
          <label class="modal-label">Species / race<input class="modal-input" data-brain-field="species" value="${v('species')}" placeholder="Human, immortal, elf…"></label>
        </div>

        <div class="brain-form-section"><div class="brain-form-kicker">APPEARANCE & VOICE</div>
          <label class="modal-label">Appearance<textarea class="modal-textarea" data-brain-field="appearance" placeholder="Stable physical details, clothing, distinguishing features.">${v('appearance')}</textarea></label>
          <label class="modal-label">Voice / dialogue style<textarea class="modal-textarea" data-brain-field="voice" placeholder="How they speak: formal, blunt, playful, vocabulary, verbal habits…">${v('voice')}</textarea></label>
        </div>

        <div class="brain-form-section"><div class="brain-form-kicker">MIND & BEHAVIOR</div>
          <label class="modal-label">Personality<textarea class="modal-textarea" data-brain-field="personality" placeholder="Core temperament, values and behavior.">${v('personality')}</textarea></label>
          <label class="modal-label">Strengths & flaws<textarea class="modal-textarea" data-brain-field="strengthsFlaws" placeholder="Useful strengths, weaknesses, blind spots and recurring flaws.">${v('strengthsFlaws')}</textarea></label>
          <label class="modal-label">Fears / boundaries<textarea class="modal-textarea" data-brain-field="fears" placeholder="What they fear, refuse to do, or strongly avoid.">${v('fears')}</textarea></label>
        </div>

        <div class="brain-form-section"><div class="brain-form-kicker">MOTIVATION & STORY ROLE</div>
          <label class="modal-label">Goals / motivations<textarea class="modal-textarea" data-brain-field="goals" placeholder="What they want, what drives them, and why.">${v('goals')}</textarea></label>
          <label class="modal-label">Character arc / development<textarea class="modal-textarea" data-brain-field="arc" placeholder="How this character is expected to change, if at all.">${v('arc')}</textarea></label>
          <label class="modal-label">Backstory / history<textarea class="modal-textarea" data-brain-field="backstory" placeholder="Important past events Aurora needs to remember.">${v('backstory')}</textarea></label>
        </div>

        <div class="brain-form-section"><div class="brain-form-kicker">RELATIONSHIPS & KNOWLEDGE</div>
          <label class="modal-label">Relationships<textarea class="modal-textarea" data-brain-field="relationships" placeholder="Important relationships and dynamics.">${v('relationships')}</textarea></label>
          <label class="modal-label">Knowledge<textarea class="modal-textarea" data-brain-field="knowledge" placeholder="What this character knows, believes, suspects, or does not know.">${v('knowledge')}</textarea></label>
          <label class="modal-label">Secrets<textarea class="modal-textarea" data-brain-field="secrets" placeholder="Secrets this character keeps. Use Advanced controls later if the information needs special AI handling.">${v('secrets')}</textarea></label>
        </div>

        <div class="brain-form-section"><div class="brain-form-kicker">ABILITIES & CURRENT STATE</div>
          <label class="modal-label">Abilities / skills<textarea class="modal-textarea" data-brain-field="abilities" placeholder="Powers, skills, expertise and important limitations.">${v('abilities')}</textarea></label>
          <label class="modal-label">Current state<textarea class="modal-textarea" data-brain-field="currentState" placeholder="Where they are now, what they are doing, and important temporary conditions.">${v('currentState')}</textarea></label>
        </div>
      `;
    }else if(bi.kind==='locations'){
      fields=`
        <div class="brain-form-section"><div class="brain-form-kicker">IDENTITY</div>
          <label class="modal-label">Location name<input class="modal-input" data-brain-field="name" value="${v('name')}" placeholder="e.g. Mistfall Village"></label>
          <div class="modal-grid2">
            <label class="modal-label">Type<input class="modal-input" data-brain-field="type" value="${v('type')}" placeholder="Village, city, sect, realm…"></label>
            <label class="modal-label">Region / hierarchy<input class="modal-input" data-brain-field="region" value="${v('region')}" placeholder="Province, continent, realm…"></label>
          </div>
          <label class="modal-label">Tags / keywords<input class="modal-input" data-brain-field="tags" value="${v('tags')}" placeholder="Capital, sacred, dangerous, poor…"></label>
        </div>
        <div class="brain-form-section"><div class="brain-form-kicker">PLACE & DAILY LIFE</div>
          <label class="modal-label">Description<textarea class="modal-textarea" data-brain-field="description" placeholder="What this place looks and feels like. Include useful visual anchors.">${v('description')}</textarea></label>
          <label class="modal-label">Culture & daily life<textarea class="modal-textarea" data-brain-field="culture" placeholder="Customs, cuisine, clothing, entertainment, taboos and ordinary life.">${v('culture')}</textarea></label>
          <label class="modal-label">People & population<textarea class="modal-textarea" data-brain-field="population" placeholder="Who lives here, population character, social groups.">${v('population')}</textarea></label>
        </div>
        <div class="brain-form-section"><div class="brain-form-kicker">RULES & IMPORTANCE</div>
          <label class="modal-label">Important rules / conditions<textarea class="modal-textarea" data-brain-field="rules" placeholder="Stable rules, restrictions, dangers or unusual conditions.">${v('rules')}</textarea></label>
          <label class="modal-label">Economy / resources<textarea class="modal-textarea" data-brain-field="economy" placeholder="Currencies, resources, trade, jobs, markets or scarcity.">${v('economy')}</textarea></label>
          <label class="modal-label">Significance<textarea class="modal-textarea" data-brain-field="significance" placeholder="Why Aurora should remember this location.">${v('significance')}</textarea></label>
        </div>
        <div class="brain-form-section"><div class="brain-form-kicker">ACCESS & STORY USE</div>
          <label class="modal-label">Access / travel<textarea class="modal-textarea" data-brain-field="access" placeholder="How characters reach it, distance, routes, barriers or costs.">${v('access')}</textarea></label>
          <label class="modal-label">Important locations within it<textarea class="modal-textarea" data-brain-field="landmarks" placeholder="Districts, landmarks, rooms, shops, temples or other recurring places.">${v('landmarks')}</textarea></label>
        </div>
      `;
    }else if(bi.kind==='factions'){
      fields=`
        <div class="brain-form-section"><div class="brain-form-kicker">IDENTITY</div>
          <label class="modal-label">Faction name<input class="modal-input" data-brain-field="name" value="${v('name')}" placeholder="e.g. Azure Cloud Sect"></label>
          <div class="modal-grid2">
            <label class="modal-label">Type / role<input class="modal-input" data-brain-field="type" value="${v('type')}" placeholder="Sect, empire, guild, cult…"></label>
            <label class="modal-label">Status<input class="modal-input" data-brain-field="status" value="${v('status')}" placeholder="Active, fallen, hidden…"></label>
          </div>
        </div>
        <div class="brain-form-section"><div class="brain-form-kicker">BELIEFS & STRUCTURE</div>
          <label class="modal-label">Purpose / ideology<textarea class="modal-textarea" data-brain-field="purpose" placeholder="What the faction wants, values or believes.">${v('purpose')}</textarea></label>
          <label class="modal-label">Leadership & structure<textarea class="modal-textarea" data-brain-field="structure" placeholder="Leader, ranks, departments, succession and internal organization.">${v('structure')}</textarea></label>
          <label class="modal-label">Important members<textarea class="modal-textarea" data-brain-field="members" placeholder="Key people and positions.">${v('members')}</textarea></label>
        </div>
        <div class="brain-form-section"><div class="brain-form-kicker">RESOURCES & RELATIONSHIPS</div>
          <label class="modal-label">Resources / assets<textarea class="modal-textarea" data-brain-field="resources" placeholder="Money, territory, troops, artifacts, information or other assets.">${v('resources')}</textarea></label>
          <label class="modal-label">Allies / enemies<textarea class="modal-textarea" data-brain-field="relations" placeholder="Important relationships with other factions.">${v('relations')}</textarea></label>
          <label class="modal-label">Methods / reputation<textarea class="modal-textarea" data-brain-field="methods" placeholder="How they operate and how others perceive them.">${v('methods')}</textarea></label>
        </div>
      `;
    }else if(bi.kind==='events'){
      fields=`
        <div class="brain-form-section"><div class="brain-form-kicker">WHEN & WHERE</div>
          <label class="modal-label">Event name<input class="modal-input" data-brain-field="name" value="${v('name')}" placeholder="e.g. The Sect War"></label>
          <div class="modal-grid2">
            <label class="modal-label">When<input class="modal-input" data-brain-field="when" value="${v('when')}" placeholder="Year 312 / Chapter 8…"></label>
            <label class="modal-label">Where<input class="modal-input" data-brain-field="where" value="${v('where')}" placeholder="Mistfall / Upper Realm…"></label>
          </div>
        </div>
        <div class="brain-form-section"><div class="brain-form-kicker">WHAT HAPPENED</div>
          <label class="modal-label">What happened<textarea class="modal-textarea" data-brain-field="description" placeholder="Concise canonical event description.">${v('description')}</textarea></label>
          <label class="modal-label">Participants<textarea class="modal-textarea" data-brain-field="participants" placeholder="Characters, factions or forces directly involved.">${v('participants')}</textarea></label>
          <label class="modal-label">Cause / trigger<textarea class="modal-textarea" data-brain-field="cause" placeholder="What caused the event.">${v('cause')}</textarea></label>
        </div>
        <div class="brain-form-section"><div class="brain-form-kicker">CONSEQUENCES & CONTINUITY</div>
          <label class="modal-label">Consequences<textarea class="modal-textarea" data-brain-field="consequences" placeholder="What changed because of this event.">${v('consequences')}</textarea></label>
          <label class="modal-label">Canon importance<select class="modal-input" data-brain-field="importance"><option ${obj.importance==='Normal' || !obj.importance?'selected':''}>Normal</option><option ${obj.importance==='High'?'selected':''}>High</option><option ${obj.importance==='Critical'?'selected':''}>Critical</option></select></label>
        </div>
      `;
    }else if(bi.kind==='threads'){
      fields=`
        <div class="brain-form-section"><div class="brain-form-kicker">THREAD</div>
          <label class="modal-label">Thread title<input class="modal-input" data-brain-field="name" value="${v('name')}" placeholder="e.g. Who is watching the village?"></label>
          <div class="modal-grid2">
            <label class="modal-label">Status<select class="modal-input" data-brain-field="status"><option ${obj.status==='Open' || !obj.status?'selected':''}>Open</option><option ${obj.status==='Dormant'?'selected':''}>Dormant</option><option ${obj.status==='Resolved'?'selected':''}>Resolved</option><option ${obj.status==='Abandoned'?'selected':''}>Abandoned</option></select></label>
            <label class="modal-label">Priority<select class="modal-input" data-brain-field="priority"><option ${obj.priority==='Normal' || !obj.priority?'selected':''}>Normal</option><option ${obj.priority==='High'?'selected':''}>High</option><option ${obj.priority==='Critical'?'selected':''}>Critical</option></select></label>
          </div>
        </div>
        <div class="brain-form-section"><div class="brain-form-kicker">UNRESOLVED BUSINESS</div>
          <label class="modal-label">What is unresolved?<textarea class="modal-textarea" data-brain-field="description" placeholder="What still needs to happen or be answered.">${v('description')}</textarea></label>
          <label class="modal-label">Known clues / progress<textarea class="modal-textarea" data-brain-field="clues" placeholder="What has already been discovered or established.">${v('clues')}</textarea></label>
          <label class="modal-label">Related characters / factions<textarea class="modal-textarea" data-brain-field="participants" placeholder="Who is connected to this thread.">${v('participants')}</textarea></label>
        </div>
        <div class="brain-form-section"><div class="brain-form-kicker">PAYOFF</div>
          <label class="modal-label">Stakes / payoff<textarea class="modal-textarea" data-brain-field="stakes" placeholder="Why this thread matters and what payoff is expected.">${v('stakes')}</textarea></label>
          <label class="modal-label">Possible directions<textarea class="modal-textarea" data-brain-field="directions" placeholder="Plausible developments without forcing Aurora to choose one.">${v('directions')}</textarea></label>
          <label class="modal-label">Last touched<input class="modal-input" data-brain-field="lastTouched" value="${v('lastTouched')}" placeholder="Chapter / scene / date"></label>
        </div>
      `;
    }else if(bi.kind==='storyRules'){
      fields=`
        <div class="brain-form-section"><div class="brain-form-kicker">RULE</div>
          <label class="modal-label">Rule<textarea class="modal-textarea" data-brain-field="text" placeholder="e.g. Ruin's true cultivation level must not be casually revealed.">${v('text')}</textarea></label>
          <div class="modal-grid2">
            <label class="modal-label">Priority<select class="modal-input" data-brain-field="priority"><option ${obj.priority==='Normal' || !obj.priority?'selected':''}>Normal</option><option ${obj.priority==='High'?'selected':''}>High</option><option ${obj.priority==='Critical'?'selected':''}>Critical</option></select></label>
            <label class="modal-label">Scope<input class="modal-input" data-brain-field="scope" value="${v('scope')}" placeholder="Character, world, whole story…"></label>
          </div>
        </div>
        <div class="brain-form-section"><div class="brain-form-kicker">ENFORCEMENT</div>
          <label class="modal-label">Why this rule matters<textarea class="modal-textarea" data-brain-field="description" placeholder="Explain the continuity reason.">${v('description')}</textarea></label>
          <label class="modal-label">What Aurora should avoid<textarea class="modal-textarea" data-brain-field="avoid" placeholder="Specific mistakes, contradictions or behaviors to avoid.">${v('avoid')}</textarea></label>
          <label class="modal-label">Allowed exceptions<textarea class="modal-textarea" data-brain-field="exceptions" placeholder="When the rule may legitimately be broken.">${v('exceptions')}</textarea></label>
          <label class="modal-label">Applies to<input class="modal-input" data-brain-field="appliesTo" value="${v('appliesTo')}" placeholder="Characters, scenes, dialogue, worldbuilding…"></label>
        </div>
      `;
    }else{
      fields=`
        <div class="brain-form-section"><div class="brain-form-kicker">CUSTOM ENTRY</div>
          <label class="modal-label">Entry name<input class="modal-input" data-brain-field="name" value="${v('name')}" placeholder="e.g. Magic system principle"></label>
          <label class="modal-label">Category<input class="modal-input" data-brain-field="category" value="${v('category')}" placeholder="Magic, culture, technology, lore…"></label>
          <label class="modal-label">What should Aurora remember?<textarea class="modal-textarea" data-brain-field="description" placeholder="Write the useful canonical information here.">${v('description')}</textarea></label>
        </div>
        <div class="brain-form-section"><div class="brain-form-kicker">PRIORITY & USE</div>
          <label class="modal-label">Importance<select class="modal-input" data-brain-field="importance"><option ${obj.importance==='Normal' || !obj.importance?'selected':''}>Normal</option><option ${obj.importance==='High'?'selected':''}>High</option><option ${obj.importance==='Critical'?'selected':''}>Critical</option></select></label>
          <label class="modal-label">When should this matter?<textarea class="modal-textarea" data-brain-field="whenUseful" placeholder="Scenes, characters, locations or situations where this entry is relevant.">${v('whenUseful')}</textarea></label>
        </div>
      `;
    }

    const customFields=brainFieldDefs(b,bi.kind).map(fd=>customFieldHtml(fd,obj)).join('');
    const extraNote=`<label class="modal-label brain-extra-note">Additional information <span class="field-hint">optional</span><textarea class="modal-textarea" data-brain-field="additionalInfo" placeholder="Anything important that does not fit the fields above. Add as much detail as you need.">${v('additionalInfo')}</textarea></label>`;
    const memoryBlock=`<div class="brain-form-section memory-section">
      <div class="brain-form-kicker">STORY MEMORY</div>
      <p class="field-help">You normally do not need to change this. Aurora uses these controls to understand whether information is established, changing, speculative, or hidden.</p>
      <details>
        <summary>How should Aurora treat this information?</summary>
        <div class="advanced-fields">
          <label class="modal-label">Information type
            <select class="modal-input" data-brain-field="memoryType">
              <option value="established" ${v('memoryType')==='established'||!v('memoryType')?'selected':''}>Established fact</option>
              <option value="current" ${v('memoryType')==='current'?'selected':''}>Current state</option>
              <option value="idea" ${v('memoryType')==='idea'?'selected':''}>Idea / possibility</option>
              <option value="rejected" ${v('memoryType')==='rejected'?'selected':''}>Rejected</option>
            </select>
          </label>
          <label class="modal-label">When does it apply?
            <select class="modal-input" data-brain-field="timeScope">
              <option value="current" ${v('timeScope')==='current'||!v('timeScope')?'selected':''}>Current story position</option>
              <option value="past" ${v('timeScope')==='past'?'selected':''}>Past / already happened</option>
              <option value="future" ${v('timeScope')==='future'?'selected':''}>Future / not happened yet</option>
              <option value="timeless" ${v('timeScope')==='timeless'?'selected':''}>Applies regardless of time</option>
            </select>
          </label>
          <label class="modal-label">Who can know this?
            <select class="modal-input" data-brain-field="knowledgeScope">
              <option value="everyone" ${v('knowledgeScope')==='everyone'||!v('knowledgeScope')?'selected':''}>Everyone who could reasonably know</option>
              <option value="mc" ${v('knowledgeScope')==='mc'?'selected':''}>MC only</option>
              <option value="specific" ${v('knowledgeScope')==='specific'?'selected':''}>Specific characters / groups</option>
              <option value="ai_only" ${v('knowledgeScope')==='ai_only'?'selected':''}>AI / author only — hidden in the story</option>
              <option value="nobody" ${v('knowledgeScope')==='nobody'?'selected':''}>Nobody in-world yet</option>
            </select>
          </label>
          <label class="modal-label">Who specifically? <span class="field-hint">only for Specific characters / groups</span><input class="modal-input" data-brain-field="knowledgePeople" value="${v('knowledgePeople')}" placeholder="e.g. MC, Elder Chen, Azure Cloud Sect"></label>
          <label class="modal-label">Reveal status
            <select class="modal-input" data-brain-field="revealStatus">
              <option value="available" ${v('revealStatus')==='available'||!v('revealStatus')?'selected':''}>Available now</option>
              <option value="hidden" ${v('revealStatus')==='hidden'?'selected':''}>Hidden until unlocked</option>
            </select>
          </label>
          <label class="modal-label">Unlock when <span class="field-hint">optional</span><input class="modal-input" data-brain-field="revealWhen" value="${v('revealWhen')}" placeholder="e.g. Marineford Phase 4 / Chapter 87 / after MC discovers it"></label>
          <label class="active-toggle"><input type="checkbox" data-memory-protect ${obj.protectedFact?'checked':''}><span><b>Protect this information from casual contradiction</b><small>Useful for facts you never want the AI to silently overwrite. You can still change it deliberately.</small></span></label>
        </div>
      </details>
    </div>`;

    const advanced=`
      <div class="brain-advanced">
        <details>
          <summary>Optional AI controls</summary>
          <div class="advanced-fields">
            <p class="advanced-explain">You do not need these for normal Brain use. They are optional controls for telling Aurora <b>how to use this memory</b> later.</p>
            <label class="active-toggle">
              <input type="checkbox" data-brain-active ${checked}>
              <span><b>Use this entry as active memory</b><small>On = Aurora may use it when relevant. Off = keep it saved, but normally leave it out of future context.</small></span>
            </label>
            <label class="modal-label">How should Aurora use this information?<textarea class="modal-textarea" data-brain-field="instructions" placeholder="Example: Keep this secret hidden unless the character has a reason to know it.">${v('instructions')}</textarea></label>
            <label class="modal-label">Template <span class="field-hint">advanced · optional</span><textarea class="modal-textarea" data-brain-field="promptTemplate" placeholder="Only use this if you want to control the format sent to the AI. Example: Character: {{name}} — Goal: {{goals}}">${v('promptTemplate')}</textarea></label>
            <label class="modal-label">Variables <span class="field-hint">advanced · optional</span><textarea class="modal-textarea small" data-brain-field="placeholders" placeholder="Only needed for your own template. One per line:
mood = calm
secret = unknown">${v('placeholders')}</textarea></label>
            <div class="placeholder-help">💡 <b>If you are unsure:</b> leave Template and Variables empty. The only advanced field most people need is <b>How should Aurora use this information?</b></div>
          </div>
        </details>
      </div>`;

    return `<div class="modal-backdrop brain-backdrop" data-brain-modal-backdrop>
      <div class="confirm-modal brain-editor-modal" role="dialog" aria-modal="true">
        <div class="confirm-icon">◇</div>
        <h2>${bi.mode==='edit'?'Edit':'Add'} ${label}</h2>
        <p>${bi.kind==='characters'?'Characters have dedicated fields because they drive behavior, goals and continuity.':bi.kind==='locations'?'Locations store stable setting information and world constraints.':bi.kind==='events'?'Timeline events record canonical changes and consequences.':bi.kind==='storyRules'?'Rules protect constraints Aurora should preserve during generation.':bi.kind==='threads'?'Open threads track unresolved story business.':'This information becomes structured memory for this story.'}</p>
        ${fields}
        ${customFields}
        ${memoryBlock}
        ${extraNote}
        ${advanced}
        <div class="confirm-actions"><button class="secondary" data-brain-modal-cancel>Cancel</button><button class="primary" data-brain-modal-save>${bi.mode==='edit'?'Save changes':'Add to Story Brain'}</button></div>
      </div>
    </div>`;
  }


  function brainReadModal(id){
    const bi=state.brainRead;
    if(!bi) return '';
    const b=getStoryBrain(id);
    const arr=Array.isArray(b[bi.kind])?b[bi.kind]:[];
    const obj=arr[bi.index];
    if(!obj) return '';
    const map={characters:'Character',locations:'Location',factions:'Faction',events:'Timeline event',threads:'Open thread',storyRules:'Story rule',customEntries:'Custom brain entry'};
    const label=map[bi.kind]||'Brain entry';
    const labels={name:'Name',role:'Role / place in story',age:'Age / apparent age',identity:'Gender / identity',status:'Status',species:'Species / race',appearance:'Appearance',voice:'Voice / dialogue style',personality:'Personality',strengthsFlaws:'Strengths & flaws',fears:'Fears / boundaries',goals:'Goals / motivations',arc:'Character arc / development',backstory:'Backstory / history',relationships:'Relationships',knowledge:'Knowledge',secrets:'Secrets',abilities:'Abilities / skills',currentState:'Current state',type:'Type',region:'Region / hierarchy',tags:'Tags / keywords',description:'Description',culture:'Culture & daily life',population:'People & population',rules:'Important rules / conditions',economy:'Economy / resources',significance:'Significance',access:'Access / travel',landmarks:'Important locations within it',purpose:'Purpose / ideology',structure:'Leadership & structure',members:'Important members',resources:'Resources / assets',relations:'Allies / enemies',methods:'Methods / reputation',when:'When',where:'Where',participants:'Participants / related people',cause:'Cause / trigger',consequences:'Consequences',priority:'Priority',stakes:'Stakes / payoff',clues:'Known clues / progress',directions:'Possible directions',lastTouched:'Last touched',text:'Rule',scope:'Scope',avoid:'What Aurora should avoid',exceptions:'Allowed exceptions',appliesTo:'Applies to',category:'Category',importance:'Importance',whenUseful:'When this is useful',additionalInfo:'Additional information',memoryType:'Information type',timeScope:'When it applies',knowledgeScope:'Who can know',knowledgePeople:'Specific knowledge holders',revealStatus:'Reveal status',revealWhen:'Unlock when',protectedFact:'Protected information',canonStatus:'Legacy memory status',canonLocked:'Legacy canon protected',canonNote:'Legacy canon note',instructions:'How Aurora should use this information',promptTemplate:'Template',placeholders:'Variables'};
    const preferred={characters:['name','role','age','identity','status','species','appearance','voice','personality','strengthsFlaws','fears','goals','arc','backstory','relationships','knowledge','secrets','abilities','currentState','additionalInfo','instructions','promptTemplate','placeholders'],locations:['name','type','region','tags','description','culture','population','rules','economy','significance','access','landmarks','additionalInfo','instructions','promptTemplate','placeholders'],factions:['name','type','status','purpose','structure','members','resources','relations','methods','additionalInfo','instructions','promptTemplate','placeholders'],events:['name','when','where','description','participants','cause','consequences','importance','additionalInfo','instructions','promptTemplate','placeholders'],threads:['name','status','priority','description','clues','participants','stakes','directions','lastTouched','additionalInfo','instructions','promptTemplate','placeholders'],storyRules:['text','priority','scope','description','avoid','exceptions','appliesTo','additionalInfo','instructions','promptTemplate','placeholders'],customEntries:['name','category','description','importance','whenUseful','additionalInfo','instructions','promptTemplate','placeholders']};
    const vals=preferred[bi.kind]||Object.keys(obj);
    const fields=vals.filter(k=>obj[k]!==undefined && String(obj[k]).trim()!=='').map(k=>`<div class="read-field"><b>${safeText(labels[k]||k)}</b><p>${safeText(obj[k])}</p></div>`).join('');
    const memoryMeta=[['memoryType',obj.memoryType],['timeScope',obj.timeScope],['knowledgeScope',obj.knowledgeScope],['knowledgePeople',obj.knowledgePeople],['revealStatus',obj.revealStatus],['revealWhen',obj.revealWhen],['protectedFact',obj.protectedFact?'Yes':'']].filter(x=>x[1]!==undefined && String(x[1]).trim()!=='').map(x=>`<div class="read-field memory-meta"><b>${safeText(labels[x[0]])}</b><p>${safeText(x[1])}</p></div>`).join('');
    const extraFields=brainFieldDefs(getStoryBrain(id),bi.kind).filter(fd=>obj.customFields?.[fd.id]!==undefined && String(obj.customFields[fd.id]).trim()!=='').map(fd=>`<div class="read-field"><b>${safeText(fd.name)}</b><p>${safeText(obj.customFields[fd.id])}</p></div>`).join('');
    return `<div class="modal-backdrop brain-backdrop" data-brain-read-backdrop><div class="confirm-modal brain-read-modal" role="dialog" aria-modal="true"><div class="confirm-icon">◇</div><h2>${safeText(obj.name||obj.title||obj.text||label)}</h2><p>${label} — full record</p><div class="read-status"><span class="read-dot ${obj.active===false?'off':''}"></span>${obj.active===false?'Inactive memory':'Active memory'}</div>${memoryMeta}${fields||''}${extraFields||''}${memoryMeta||fields||extraFields?'':'<div class="mutedbox">This record has no additional information yet.</div>'}<div class="confirm-actions"><button class="secondary" data-brain-read-close>Close</button><button class="primary" data-brain-read-edit data-brain-kind="${bi.kind}" data-brain-index="${bi.index}">Edit</button></div></div></div>`;
  }

  function brainRecordSummary(x,key,label){
    if(key==='characters') return [x.role,x.age&&`Age ${x.age}`,x.species,x.goals||x.personality].filter(Boolean).join(' · ');
    if(key==='locations') return [x.type,x.region,x.description||x.significance].filter(Boolean).join(' · ');
    if(key==='factions') return [x.type,x.status,x.purpose].filter(Boolean).join(' · ');
    if(key==='events') return [x.when,x.where,x.description].filter(Boolean).join(' · ');
    if(key==='threads') return [x.status,x.priority,x.description||x.stakes].filter(Boolean).join(' · ');
    if(key==='storyRules') return [x.priority,x.scope,x.text].filter(Boolean).join(' · ');
    return [x.category,x.description].filter(Boolean).join(' · ');
  }


  function canonLabel(status){return ({canon:'Permanent Canon',current:'Current State',draft:'Draft / Temporary',rejected:'Rejected / Alternative'}[status]||'Unspecified');}
  function allBrainRecords(brain){
    const out=[];
    ['characters','locations','factions','events','threads','storyRules','customEntries'].forEach(key=>{
      (Array.isArray(brain[key])?brain[key]:[]).forEach((item,index)=>out.push({key,index,item}));
    });
    return out;
  }
  function storyBrainOverview(id){
    const brain=getStoryBrain(id),rows=allBrainRecords(brain);
    const counts={canon:0,current:0,draft:0,rejected:0,unset:0};
    rows.forEach(r=>{const k=r.item.canonStatus||'unset';counts[k]=(counts[k]||0)+1;});
    const protectedRows=rows.filter(r=>r.item.canonLocked);
    const openThreads=(brain.threads||[]).filter(x=>String(x.status||'').toLowerCase()!=='resolved');
    return `<div class="brain-overview">
      <div class="overview-hero"><div class="brain-form-kicker">STORY BRAIN</div><h2>What Aurora currently knows</h2><p>Facts, changing state, ideas, secrets and story position are kept separate so the AI can use the right information at the right time.</p></div>
      <div class="canon-stat-grid">
        <div><b>${counts.canon}</b><span>Established</span></div><div><b>${counts.current}</b><span>Current state</span></div>
        <div><b>${counts.draft}</b><span>Ideas</span></div><div><b>${counts.rejected}</b><span>Rejected</span></div>
      </div>
      <div class="overview-section current-position-card"><div class="section-title">Current story position</div><div class="overview-row static"><span class="overview-type">${safeText(brain.storyPosition?.status||'Not started')}</span><b>${safeText(brain.storyPosition?.arc||'No arc selected')}</b><em>${safeText(brain.storyPosition?.phase||brain.storyPosition?.chapter||'Set in Story position')}</em></div></div>
      <div class="overview-section"><div class="section-title">Hidden knowledge <span>${rows.filter(r=>r.item.knowledgeScope==='ai_only'||r.item.revealStatus==='hidden').length}</span></div><div class="mutedbox">Information can be true without being known by the MC or other characters. Locked future information stays out of normal story context until its reveal condition is reached.</div></div>
      <div class="overview-section"><div class="section-title">Protected facts <span>${protectedRows.length}</span></div>
        ${protectedRows.slice(0,12).map(r=>`<button class="overview-row" data-overview-open-key="${safeText(r.key)}" data-overview-open-index="${r.index}"><span class="overview-type">${safeText(BRAIN_LABELS[r.key])}</span><b>${safeText(r.item.name||r.item.title||r.item.event||'Untitled')}</b><em>${canonLabel(r.item.canonStatus)}</em></button>`).join('')||'<div class="mutedbox">No protected facts yet.</div>'}
      </div>
      <div class="overview-section"><div class="section-title">Open threads <span>${openThreads.length}</span></div>
        ${openThreads.slice(0,8).map(x=>`<div class="overview-row static"><span class="overview-type">THREAD</span><b>${safeText(x.name||x.title||'Untitled thread')}</b><em>${safeText(x.priority||x.status||'Open')}</em></div>`).join('')||'<div class="mutedbox">No open threads recorded.</div>'}
      </div>
      <div class="overview-section"><div class="section-title">Brain coverage</div>
        <div class="coverage-list">${['characters','locations','factions','events','threads','storyRules','customEntries'].map(k=>`<div><span>${safeText(BRAIN_LABELS[k])}</span><b>${(brain[k]||[]).length}</b></div>`).join('')}</div>
      </div>
    </div>`;
  }

  function storyBrainPage(id){
    const item=state.library.find(x=>x.id===id); if(!item)return library();
    const b=ensureBrain20(getStoryBrain(id));
    const views=[
      ['overview','Overview','◇'],
      ['characters','Characters','◉'],
      ['world','World','⌖'],
      ['events','Timeline','◷'],
      ['story','Story & Arcs','◆'],
      ['canon','Canon','✓'],
      ['secrets','Secrets','🔒'],
      ['threads','Open threads','↯'],
      ['rules','Story rules','✓'],
      ['ideas','Ideas','◇'],
      ['custom','Custom','＋'],
      ['fields','Fields','⚙']
    ];
    const active=state.brainView;
    let body='';
    if(active==='overview'){
      body=storyBrainOverview(id);
    }else if(active==='story'){
      const pos=b.storyPosition||{};
      body=`<div class="timeline-panel">
        <div class="overview-hero"><div class="brain-form-kicker">STORY POSITION</div><h2>Where is the story now?</h2><p>Aurora uses this position to distinguish what already happened, what is happening now, and what must stay in the future.</p></div>
        <div class="brain-form-section">
          <div class="modal-grid2"><label class="modal-label">Current arc<input class="modal-input" data-story-position="arc" value="${safeText(pos.arc||'')}" placeholder="e.g. Marineford"></label><label class="modal-label">Current phase<input class="modal-input" data-story-position="phase" value="${safeText(pos.phase||'')}" placeholder="e.g. Aftermath"></label></div>
          <div class="modal-grid2"><label class="modal-label">Chapter / scene<input class="modal-input" data-story-position="chapter" value="${safeText(pos.chapter||'')}" placeholder="e.g. Chapter 42 / Scene 3"></label><label class="modal-label">Arc status<select class="modal-input" data-story-position="status"><option ${pos.status==='Not started'?'selected':''}>Not started</option><option ${pos.status==='Active'?'selected':''}>Active</option><option ${pos.status==='Completed'?'selected':''}>Completed</option></select></label></div>
          <button class="primary" data-save-story-position>Save story position</button>
        </div>
      </div>
      <div class="overview-section"><div class="section-title">Arcs <span>${b.arcs.length}</span></div>${b.arcs.length?b.arcs.map((a,i)=>`<div class="overview-row static"><span class="overview-type">ARC</span><b>${safeText(a.name||'Untitled arc')}</b><em>${safeText(a.status||'Planned')}</em></div>`).join(''):'<div class="mutedbox">No arcs recorded yet. Add your first arc below.</div>'}</div>
      <div class="brain-form-section"><div class="brain-form-kicker">ADD ARC</div><div class="modal-grid2"><label class="modal-label">Arc name<input class="modal-input" id="new-arc-name" placeholder="e.g. Marineford"></label><label class="modal-label">Status<select class="modal-input" id="new-arc-status"><option>Planned</option><option>Active</option><option>Completed</option></select></label></div><label class="modal-label">What is this arc about? <span class="field-hint">optional</span><textarea class="modal-textarea" id="new-arc-description" placeholder="Purpose, major conflict and important consequences."></textarea></label><button class="primary" data-add-arc>Add arc</button></div>`;
    }else if(active==='secrets'){
      const arr=Array.isArray(b.secrets)?b.secrets:[];
      body=`<div class="overview-hero"><div class="brain-form-kicker">KNOWLEDGE & REVEAL</div><h2>Secrets</h2><p>Truth can exist in the Brain before characters know it. Reveal timing is stored separately.</p></div>
      <div class="brain-section-head"><div><b>Secrets</b><span>${arr.length} stored</span></div><button class="secondary" data-brain-add="secrets">＋ Add secret</button></div>
      ${arr.length?`<div class="brain-records">${arr.map((x,i)=>`<div class="brain-record"><div class="record-main"><button class="record-read" data-brain-open-record="secrets" data-brain-index="${i}"><b>${safeText(x.name||'Unnamed secret')}</b><span>${safeText(x.description||'No description yet.')}</span><small>${x.revealStatus==='locked'?'🔒 Locked':'Available'} · ${safeText(x.knowledgeScope||'everyone')}</small></button></div><div class="record-actions"><button class="mini-action" data-brain-edit="secrets" data-brain-index="${i}">Edit</button><button class="mini-action danger-mini" data-brain-delete="secrets" data-brain-index="${i}">Delete</button></div></div>`).join('')}</div>`:'<div class="mutedbox">No secrets yet.</div>'}`;
    }else if(active==='ideas'){
      const arr=Array.isArray(b.ideas)?b.ideas:[];
      body=`<div class="overview-hero"><div class="brain-form-kicker">SANDBOX</div><h2>Ideas</h2><p>Ideas are possibilities, not story truth. Keep them separate until you deliberately use one.</p></div>
      <div class="brain-section-head"><div><b>Ideas</b><span>${arr.length} stored</span></div><button class="secondary" data-brain-add="ideas">＋ Add idea</button></div>
      ${arr.length?`<div class="brain-records">${arr.map((x,i)=>`<div class="brain-record"><div class="record-main"><button class="record-read" data-brain-open-record="ideas" data-brain-index="${i}"><b>${safeText(x.name||'Unnamed idea')}</b><span>${safeText(x.description||'No description yet.')}</span><small>Sandbox · not canon</small></button></div><div class="record-actions"><button class="mini-action" data-brain-edit="ideas" data-brain-index="${i}">Edit</button><button class="mini-action danger-mini" data-brain-delete="ideas" data-brain-index="${i}">Delete</button></div></div>`).join('')}</div>`:'<div class="mutedbox">No ideas yet.</div>'}`;
    }else if(active==='canon'){
      // Canon is a read/control center over existing Brain data. It never creates duplicate records.
      const canonKeys=['characters','locations','factions','events','threads','storyRules','customEntries','secrets','ideas'];
      const canonRows=[];
      canonKeys.forEach(key=>{
        (Array.isArray(b[key])?b[key]:[]).forEach((item,index)=>{
          const baseName=item.name||item.title||item.text||'Untitled';
          const tl=Array.isArray(item.stateTimeline)?item.stateTimeline:[];
          if(tl.length) tl.forEach((st,stateIndex)=>canonRows.push({key,index,stateIndex,item,st,name:baseName}));
          else canonRows.push({key,index,stateIndex:null,item,st:null,name:baseName});
        });
      });
      const stateKind=(r)=>{
        const st=r.st;
        if(!st){
          const mt=String(r.item.memoryType||r.item.canonStatus||'canon').toLowerCase();
          if(mt==='rejected') return 'rejected';
          if(mt==='draft'||mt==='idea') return 'idea';
          if(mt==='future') return 'future';
          if(mt==='current') return 'current';
          return 'established';
        }
        const reveal=String(st.revealStatus||'').toLowerCase();
        if(reveal==='hidden'||reveal==='locked') return 'hidden';
        const t=String(st.timeline||'Past');
        return t==='Future'?'future':t==='Current'?'current':'established';
      };
      const groups={established:[],current:[],future:[],hidden:[],idea:[],rejected:[]};
      canonRows.forEach(r=>groups[stateKind(r)].push(r));
      const keyLabel={characters:'Character',locations:'Location',factions:'Faction',events:'Timeline event',threads:'Open thread',storyRules:'Story rule',customEntries:'Custom entry',secrets:'Secret',ideas:'Idea'};
      const row=(r)=>{
        const st=r.st;
        const title=st?(st.label||st.status||st.cultivation||'State'):r.name;
        const detail=st?[st.chapter,st.arc,st.phase].filter(Boolean).join(' · '):brainRecordSummary(r.item,r.key,keyLabel[r.key]||r.key);
        const reveal=st?String(st.revealStatus||'Revealed'):'Revealed';
        const knowledge=st?String(st.knowledgeScope||'AI knows'):'AI knows';
        const time=st?String(st.timeline||'Past'):'Established';
        const meta=st?`<span class="state-chip ${time.toLowerCase()} ">${time}</span><span class="state-chip ${reveal.toLowerCase()==='hidden'?'hidden':'revealed'}">${reveal==='Hidden'?'🔒 Hidden':'◉ Revealed'}</span><span class="state-chip ai">AI knows</span>`:`<span class="state-chip past">✓ Established</span><span class="state-chip ai">AI knows</span>`;
        const hiddenInfo=st&&String(reveal).toLowerCase()==='hidden'?`<small>🔒 ${safeText(knowledge)}${st.knowledgePeople?' · '+safeText(st.knowledgePeople):''}${st.revealWhen?' · unlock: '+safeText(st.revealWhen):''}</small>`:'';
        return `<div class="state-timeline-row canon-control-row"><button class="canon-main-button" data-canon-open data-overview-open-key="${safeText(r.key)}" data-overview-open-index="${r.index}"><div class="state-timeline-main"><div>${meta}</div><b>${safeText(r.name)}${st?' — '+safeText(title):''}</b><span>${safeText(keyLabel[r.key]||r.key)}${detail?' · '+safeText(detail):''}</span>${hiddenInfo}</div></button>${st?`<button class="mini-action canon-state-edit" data-canon-state-edit data-canon-kind="${safeText(r.key)}" data-canon-index="${r.index}" data-canon-state-index="${r.stateIndex}">Edit state</button>`:`<button class="mini-action" data-canon-record-edit data-canon-kind="${safeText(r.key)}" data-canon-index="${r.index}">Edit</button>`}</div>`;
      };
      const section=(title,key,desc,open=false)=>`<details class="brain-form-section canon-section" ${open?'open':''}><summary><span><b>${title}</b><em>${groups[key].length}</em></span><small>${safeText(desc)}</small></summary><div class="canon-section-body">${groups[key].slice(0,50).map(row).join('')||'<div class="mutedbox">Nothing here yet.</div>'}</div></details>`;
      const currentPos=b.storyPosition||{};
      const currentArc=b.arcs.find(a=>a.id===currentPos.arcId);
      const currentPhase=currentArc?.phases?.find(p=>p.id===currentPos.phaseId);
      const totalStates=canonRows.filter(r=>r.st).length;
      body=`<div class="overview-hero"><div class="brain-form-kicker">CANON & TRUTH</div><h2>What is true right now — and what belongs to the past or future.</h2><p>Canon reads your existing Brain. Nothing is duplicated here. Tap an item to inspect it, or edit its specific state.</p></div>
        <div class="canon-stat-grid"><div><b>${groups.current.length}</b><span>Current</span></div><div><b>${groups.established.length}</b><span>Past / established</span></div><div><b>${groups.future.length}</b><span>Future</span></div><div><b>${groups.hidden.length}</b><span>Hidden</span></div></div>
        <div class="brain-form-section canon-position-card"><div class="brain-form-kicker">CURRENT STORY POSITION</div><div class="state-timeline-row"><div class="state-timeline-main"><b>${safeText(currentArc?.name||'No arc selected')}</b><span>${safeText(currentPhase?.name||'No phase selected')} · ${safeText(currentPos.chapter||'No chapter')}</span><small>${safeText(currentPos.status||'Not started')}</small></div><button class="mini-action" data-brain-view="story">Open position</button></div></div>
        ${section('CURRENT TRUTH','current','What generation should treat as the present state.',true)}
        ${section('PAST / ESTABLISHED','established','Things that happened or were true earlier. Still canon, but not automatically current.')}
        ${section('FUTURE','future','Known later information. Never treat it as current before its time.')}
        ${section('HIDDEN','hidden','True information whose visibility or knowledge is restricted. A hidden future state stays here until its conditions change.')}
        ${section('IDEAS','idea','Possibilities only. They are not story truth until deliberately promoted.')}
        ${section('REJECTED','rejected','Explicitly rejected alternatives. Aurora should not resurrect them.')}
        <div class="brain-form-section"><div class="brain-form-kicker">HOW CANON WORKS</div><p class="field-hint">${totalStates} state records are attached to Brain entities. Canon is a view over those states; Characters, World, Timeline, Arcs and other entries remain the source of truth.</p></div>`;
    }else if(active==='world'){
      const renderWorld=(key,label,icon)=>`<div class="brain-subsection"><div class="brain-section-head"><div><b>${icon} ${label}</b><span>${(Array.isArray(b[key])?b[key]:[]).length} records</span></div><button class="secondary" data-brain-add="${key}">＋ Add ${label}</button></div>${b[key].length?`<div class="brain-records">${b[key].map((x,i)=>`<div class="brain-record ${x.active===false?'inactive':''}">
  <div class="record-main"><button class="brain-active ${x.active===false?'off':''}" data-brain-toggle-active="${key}" data-brain-index="${i}" title="${x.active===false?'Activate':'Deactivate'}">${x.active===false?'○':'●'}</button><button class="record-read" data-brain-open-record="${key}" data-brain-index="${i}"><b>${safeText(x.name||label)}</b><span>${safeText(brainRecordSummary(x,key,label)||'No description yet.')}</span><small>Tap to read</small></button></div>
  <div class="record-actions"><button class="mini-action" data-brain-edit="${key}" data-brain-index="${i}">Edit</button><button class="mini-action danger-mini" data-brain-delete="${key}" data-brain-index="${i}">Delete</button></div>
</div>`).join('')}`:`<div class="mutedbox">No ${label.toLowerCase()} records yet.</div>`}</div>`;
      body=renderWorld('locations','Locations','⌖')+renderWorld('factions','Factions','◆');
    }else{
      const map={characters:['characters','Character'],events:['events','Timeline event'],threads:['threads','Open thread'],rules:['storyRules','Story rule'],custom:['customEntries','Custom brain entry']};
      const [key,label]=map[active]||map.characters;
      const arr=Array.isArray(b[key])?b[key]:[];
      const activeCount=arr.filter(x=>x.active!==false).length;
      const customIntro=active==='custom'?`<div class="builder-note">💡 You can create as many custom brain entries as you want. Use the <b>● / ○</b> control to activate or deactivate any combination. Multiple custom entries can be active at the same time.</div>
      <div class="brain-selectbar"><b>${activeCount} active</b><button class="mini-action" data-brain-activate-all="customEntries">Activate all</button><button class="mini-action" data-brain-deactivate-all="customEntries">Deactivate all</button></div>`:'';
      body=`<div class="brain-section-head"><div><b>${label}s</b><span>${arr.length} records</span></div><button class="secondary" data-brain-add="${key}">＋ Add ${label}</button></div>
      ${customIntro}
      ${arr.length?`<div class="brain-records">${arr.map((x,i)=>`<div class="brain-record ${x.active===false?'inactive':''}">
  <div class="record-main"><button class="brain-active ${x.active===false?'off':''}" data-brain-toggle-active="${key}" data-brain-index="${i}" title="${x.active===false?'Activate':'Deactivate'}">${x.active===false?'○':'●'}</button><button class="record-read" data-brain-open-record="${key}" data-brain-index="${i}"><b>${safeText(x.name||x.title||x.text||label+' '+(i+1))}</b><span>${safeText(brainRecordSummary(x,key,label)||'No description yet.')}</span><small>Tap to read</small></button></div>
  <div class="record-actions"><button class="mini-action" data-brain-edit="${key}" data-brain-index="${i}">Edit</button><button class="mini-action danger-mini" data-brain-delete="${key}" data-brain-index="${i}">Delete</button></div>
</div>`).join('')}`:`<div class="mutedbox">No ${label.toLowerCase()} records yet. Add one when you want Aurora to remember something important.</div>`}`;
    }
    return layout(`<div class="page">
      <div class="backrow"><button class="back" data-action="back">‹ Back</button><span style="color:var(--muted);font-size:12px">Back to ${safeText(item.title)}</span></div>
      <div class="eyebrow">Story Brain 2.0</div>
      <h1>${safeText(item.title)}</h1>
      <p>The structured knowledge layer for facts Aurora should remember about this project.</p>
      <div class="brain-tab-viewport"><div class="brain-tabs">${views.map(v=>`<button class="brain-tab ${active===v[0]?'active':''}" data-brain-view="${v[0]}">${v[2]} ${v[1]}</button>`).join('')}</div></div>
      ${active==='overview'?`<div class="brain-premise"><span>Premise</span><p>${safeText(item.summary||item.concept?.summary||'No premise recorded yet.')}</p></div>`:''}
      ${body}
      ${brainEditorModal(id)}
    
      ${brainReadModal(id)}
      ${brainFieldManager(id)}
      ${state.brainDelete?`<div class="modal-backdrop brain-backdrop" data-brain-delete-backdrop><div class="confirm-modal delete-record-modal"><div class="confirm-icon">!</div><h2>Delete this record?</h2><p>This removes the Story Brain entry. Your manuscript is not affected.</p><div class="confirm-actions"><button class="secondary" data-cancel-brain-delete>Cancel</button><button class="danger-confirm" data-confirm-brain-delete>Delete record</button></div></div></div>`:''}
      ${state.brainFieldDelete?`<div class="modal-backdrop brain-backdrop" data-field-delete-backdrop><div class="confirm-modal delete-record-modal"><div class="confirm-icon">!</div><h2>Delete this field?</h2><p>The field will be removed from this Brain type. Existing values will remain in stored records but the field will no longer appear in the editor.</p><div class="confirm-actions"><button class="secondary" data-cancel-field-delete>Cancel</button><button class="danger-confirm" data-confirm-field-delete>Delete field</button></div></div></div>`:''}
    </div>`,'library');
  }

  function create(){
    const d=state.conceptDraft, step=state.conceptStep;
    const styles=[
      ['my-taste','🧠','My Taste','Uses Aurora’s future learned taste profile.','Accepted/rejected generations, edits, likes and dislikes will shape this.'],
      ['natural','✦','Natural','Clean, concrete, restrained prose.','Moderate description · natural dialogue · low figurative language · avoids filler and stock phrasing.'],
      ['cinematic','◉','Cinematic','Visual, scene-driven storytelling.','Strong scene beats · clear physical action · purposeful description · spatial clarity.'],
      ['literary','Aa','Literary','Deliberate sentence craft and layered description.','Attention to rhythm · subtext · selective imagery · slower reflective moments when useful.'],
      ['light-novel','⚡','Light Novel','Accessible, fast-moving character-focused storytelling.','Quick scene movement · readable prose · strong character beats · lighter descriptive density.']
    ];
    const saved=state.savedStyles||[];
    const selectedBuiltIn=styles.find(x=>x[0]===d.style);
    const selectedSaved=saved.find(x=>x.id===d.style);
    const selectedName=selectedSaved?.name || selectedBuiltIn?.[2] || (d.style==='custom'?'My Custom Style':'My Taste');

    return layout(`<div class="page create-page">
      <div class="backrow"><button class="back" data-action="back">‹ Back</button></div>
      <div class="eyebrow">Create a project</div>
      <h1>Start with an idea.</h1>
      <p>Write naturally. Aurora will eventually handle the complicated parts.</p>
      ${help('The easy way to start','You do not need a character card, giant prompt, outline, or world bible first. Give Aurora whatever you have and build it step by step.')}

      <div class="builder-progress">
        <div class="builder-step ${step>=1?'active':''}"><span>1</span><b>Idea</b></div>
        <div class="builder-line ${step>=2?'active':''}"></div>
        <div class="builder-step ${step>=2?'active':''}"><span>2</span><b>Format</b></div>
        <div class="builder-line ${step>=3?'active':''}"></div>
        <div class="builder-step ${step>=3?'active':''}"><span>3</span><b>Style</b></div>
        <div class="builder-line ${step>=4?'active':''}"></div>
        <div class="builder-step ${step>=4?'active':''}"><span>4</span><b>Review</b></div>
      </div>

      ${step===1?`
        <div class="builder-card">
          <div class="builder-card-head"><div><span class="builder-kicker">Step 1</span><h2>Your idea</h2></div><span class="builder-count">${d.idea.length}/2000</span></div>
          <textarea id="concept-idea" maxlength="2000" placeholder="Example: An immortal emperor is tired of endless battles and retires to a quiet lower realm.">${safeText(d.idea)}</textarea>
          <div class="builder-note">💡 It can be messy. A sentence, paragraph, character, scene, or “surprise me” is enough.</div>
          <div class="actions"><button class="primary" data-concept-next="1">Next: Format →</button></div>
        </div>
      `:step===2?`
        <div class="builder-card">
          <div class="builder-card-head"><div><span class="builder-kicker">Step 2</span><h2>What are you making?</h2></div></div>
          <div class="choicegrid builder-choicegrid">
            <button class="choice ${d.type==='novel'?'selected':''}" data-concept-type="novel"><strong>📖 Novel</strong><span>Chapters, scenes, prose, and a manuscript.</span></button>
            <button class="choice ${d.type==='comic'?'selected':''}" data-concept-type="comic"><strong>◈ Comic</strong><span>Pages, panels, dialogue, and visual continuity.</span></button>
          </div>
          <div class="builder-note">💡 This chooses the project format. You can change it later.</div>
          <div class="actions"><button class="secondary" data-concept-prev>← Back</button><button class="primary" data-concept-next="2">Next: Style →</button></div>
        </div>
      `:step===3?`
        <div class="builder-card">
          <div class="builder-card-head"><div><span class="builder-kicker">Step 3</span><h2>How should it feel?</h2></div></div>
          <p class="style-intro">A style is a writing recipe: voice, sentence rhythm, dialogue, description, pacing, figurative language, and things to avoid. These presets are starting points, not rigid rules.</p>

          <div class="style-section-title">Aurora styles</div>
          <div class="style-list">
            ${styles.map(c=>`<button class="style-card ${d.style===c[0]?'selected':''}" data-concept-style="${c[0]}"><div class="style-mark">${c[1]}</div><div><strong>${c[2]}</strong><span>${c[3]}</span><small>${c[4]}</small></div>${d.style===c[0]?'<b class="style-check">✓</b>':''}</button>`).join('')}
          </div>

          <div class="new-style-bar">
            <div><b>Custom styles</b><span>Create a separate reusable style whenever you want.</span></div>
            <button class="secondary new-style-button" data-new-custom-style>＋ New custom style</button>
          </div>

          ${saved.length?`
            <div class="style-section-title saved-title">My saved styles</div>
            <div class="style-list">
              ${saved.map(p=>`<div class="saved-style-row ${d.style===p.id?'selected':''}">
                <div class="saved-style-main">
                  <div class="style-mark">✎</div>
                  <div><strong>${safeText(p.name)}</strong><span>${safeText(p.definition)}</span>${p.sample?'<small>Writing sample attached</small>':''}</div>
                  ${d.style===p.id?'<b class="style-check">✓</b>':''}
                </div>
                <div class="saved-style-actions">
                  <button class="mini-action" data-saved-style="${p.id}">Use</button>
                  <button class="mini-action" data-edit-style="${p.id}">Edit</button>
                  <button class="mini-action danger-mini" data-delete-style="${p.id}" aria-label="Delete saved style">Delete</button>
                </div>
              </div>`).join('')}
            </div>
          `:''}

          <div class="custom-style-builder">
            <div class="custom-style-title"><b>${selectedSaved?'Edit selected style':'Create your own style'}</b><span>${selectedSaved?'Saved profile':'New profile — temporary or saved'}</span></div>
            <label for="custom-style-name">Style name</label>
            <input id="custom-style-name" maxlength="80" value="${safeText(d.customStyleName)}" placeholder="e.g. My Mature Xianxia Style">
            <label for="custom-style">Describe the style</label>
            <textarea id="custom-style" maxlength="1500" placeholder="Describe sentence rhythm, dialogue, pacing, description, emotional intensity, things to avoid, and anything else that defines the voice.">${safeText(d.customStyle)}</textarea>

            <div class="sample-help">
              <b>What is a writing sample?</b>
              <p>Optional: a short piece of <strong>your own writing</strong> that shows the feel you want. It helps Aurora later analyze observable traits such as sentence rhythm, dialogue density, description, pacing, and figurative language. You can leave it completely empty.</p>
            </div>

            <label for="custom-style-sample">Optional writing sample</label>
            <textarea id="custom-style-sample" maxlength="4000" placeholder="Paste a short sample of your own writing here — or leave this empty.">${safeText(d.customStyleSample)}</textarea>

            <div class="custom-style-actions">
              <button class="secondary" data-style-use-temp>Use for this story only</button>
              <button class="primary" data-style-save>💾 Save to My Styles</button>
            </div>
            <div class="builder-note">💡 Temporary means it is used for this project but does not become a reusable default. Saved styles appear above whenever you create another project.</div>
          </div>

          ${d.style!=='custom' && !selectedSaved?`
            <div class="selected-style-detail"><span>Selected style</span><b>${safeText(selectedName)}</b><p>${safeText(selectedBuiltIn?.[4]||'Your saved style is ready to use.')}</p></div>
            <div class="custom-style-builder compact-custom">
              <label for="custom-direction">Extra direction <span>optional</span></label>
              <textarea id="custom-direction" maxlength="1500" placeholder="Example: Mature, restrained, little purple prose, strong dialogue, no generic sensory filler.">${safeText(d.customStyle)}</textarea>
              <div class="builder-note">💡 This adds project-specific direction on top of the selected style. It is not saved as a reusable style unless you create one below.</div>
            </div>
          `:''}

          <div class="actions"><button class="secondary" data-concept-prev>← Back</button><button class="primary" data-concept-next="3">Next: Review →</button></div>
        </div>
      `:`
        <div class="builder-card">
          <div class="builder-card-head"><div><span class="builder-kicker">Step 4</span><h2>Ready to build</h2></div></div>
          <div class="review-block">
            <span>Project title</span>
            <input id="concept-title" maxlength="120" value="${safeText(d.projectTitle)}" placeholder="Give your story a name">
            <div class="builder-note">💡 Aurora will use this as the Library title. You can rename it later.</div>
          </div>
          <div class="review-block"><span>Idea</span><p>${safeText(d.idea||'No idea entered.')}</p></div>
          <div class="review-grid">
            <div><span>Format</span><b>${d.type==='comic'?'Comic':'Novel'}</b></div>
            <div><span>Style</span><b>${safeText(selectedName)}</b></div>
          </div>
          ${d.customStyle?`<div class="review-block"><span>Style direction</span><p>${safeText(d.customStyle)}</p></div>`:''}
          ${d.style==='custom' || selectedSaved ? (d.customStyleSample?`<div class="review-block"><span>Writing sample</span><p>${safeText(d.customStyleSample)}</p></div>`:'') : ''}
          <div class="builder-note">💡 Build now creates the project in your Library and stores this concept brief locally. NanoGPT is still not called in this phase.</div>
          <div class="actions"><button class="secondary" data-concept-prev>← Back</button><button class="primary" data-concept-build>✨ Build &amp; Open in Library</button></div>
        </div>
      `}
      ${state.styleDeleteConfirmId?(()=>{
        const p=(state.savedStyles||[]).find(x=>x.id===state.styleDeleteConfirmId);
        if(!p)return '';
        return `<div class="modal-backdrop" data-style-delete-backdrop>
          <div class="confirm-modal" role="dialog" aria-modal="true">
            <div class="confirm-icon">!</div>
            <h2>Delete saved style?</h2>
            <p>You are about to permanently remove <strong>${safeText(p.name)}</strong> from My Styles.</p>
            <p class="confirm-warning">This cannot be undone. The style will disappear from future Create screens. Existing stories that already used it are not deleted.</p>
            <div class="confirm-actions">
              <button class="secondary" data-cancel-style-delete>Cancel</button>
              <button class="danger-confirm" data-confirm-style-delete="${p.id}">Delete style</button>
            </div>
          </div>
        </div>`;
      })():''}
    </div>`,'create');
  }
  function more(){
    const draft=state.settingsDraft || {theme:state.theme, accent:state.accent, help:state.help, nano:state.nanoGPT};
    draft.nano=normalizeNanoGPT(draft.nano||state.nanoGPT);
    const n=draft.nano, a=accents.find(x=>x.id===draft.accent)||accents[0];
    const textOptions=n.textModels.length?n.textModels.map(m=>`<option value="${safeText(m.id)}" ${n.textModel===m.id?'selected':''}>${safeText(m.name||m.id)}${m.pricing?.prompt!=null?' · $'+safeText(String(m.pricing.prompt))+'/M':''}</option>`).join(''):`<option value="">No models loaded — use manual ID below</option>`;
    const imageOptions=n.imageModels.length?n.imageModels.map(m=>`<option value="${safeText(m.id)}" ${n.imageModel===m.id?'selected':''}>${safeText(m.name||m.id)}</option>`).join(''):`<option value="">No models loaded — use manual ID below</option>`;
    return layout(`<div class="page"><div class="backrow"><button class="back" data-action="back">‹ Back</button></div>
      <div class="eyebrow">Control center</div><h1>Settings</h1><p>Choose your preferences. Aurora previews changes immediately; Save &amp; Close makes them permanent.</p>
      ${help('Important','Reader font size, line height and margins live in Reader Settings, not here. This prevents reading preferences from changing Aurora’s interface.')}
      <section class="section grid">
        <div class="card"><h2>Appearance</h2><p>Choose how Aurora looks.</p><div class="choicegrid"><button class="choice ${draft.theme==='dark'?'selected':''}" data-theme="dark"><strong>Dark</strong><span>Default Aurora appearance.</span></button><button class="choice ${draft.theme==='light'?'selected':''}" data-theme="light"><strong>Light</strong><span>Bright interface.</span></button></div></div>
        <div class="card"><h2>Accent color</h2><p>Only the interface accent changes.</p><div class="palette">${accents.map(x=>`<button class="swatch ${draft.accent===x.id?'selected':''}" title="${x.name}" aria-label="${x.name}" data-accent="${x.id}" style="background:linear-gradient(135deg,${x.value},${x.value2})"></button>`).join('')}</div><div class="tip"><b>${a.name}</b> is the current draft accent.</div></div>
        <div class="card"><h2>Help tips</h2><p>Small explanations appear around unfamiliar controls.</p><div class="actions"><button class="secondary" data-action="toggle-help">${draft.help?'Hide tips':'Show tips'}</button></div></div>
      </section>

      <section class="section" style="margin-top:18px"><div class="card nano-card"><div class="eyebrow">AI access</div><h2>Remote AI access</h2>
        <label class="modal-label">Connected AI access<select class="modal-input" data-nano-field="access"><option value="off" ${n.access==='off'?'selected':''}>OFF — no remote requests</option><option value="ask" ${n.access==='ask'?'selected':''}>ASK — confirm each AI request</option><option value="on" ${n.access==='on'?'selected':''}>ON — allow AI requests</option></select></label>
        <div class="nano-note">OFF blocks remote AI calls. ASK is recommended while testing. ON allows Aurora to send AI requests without confirmation.</div>
        <label class="modal-label">Maximum AI requests<input class="modal-input" type="number" min="0" step="1" value="${n.maxRequests}" data-nano-field="maxRequests"><span class="field-hint">0 = unlimited. Counter is stored locally.</span></label>
        <button class="secondary" data-nano-reset-counter>Reset request counter</button>
        <button class="secondary nano-danger" data-nano-disable>${n.access==='off'?'Enable API access':'Disable API now'}</button>
        <div class="nano-meter">AI requests used: ${n.requestCount} / ${n.maxRequests||'unlimited'}</div>
      </div></section>

      <section class="section" style="margin-top:18px"><div class="card nano-card"><div class="eyebrow">CONNECTED AI PROVIDER</div><h2>NanoGPT</h2>
        <label class="modal-label">Endpoint<input class="modal-input" data-nano-field="endpoint" value="${safeText(n.endpoint)}" placeholder="https://nano-gpt.com/api/v1" autocomplete="off"></label>
        <div class="nano-key-row"><label class="modal-label">API key<input id="nano-api-key" class="modal-input" type="password" value="${safeText(n.apiKey)}" placeholder="Paste your NanoGPT API key" data-nano-field="apiKey" autocomplete="off"></label><button class="secondary nano-key-toggle" data-nano-toggle-key>Show</button></div>
        <div class="nano-model-actions"><button class="primary" data-nano-test ${n.connectionBusy?'disabled':''}>${n.connectionBusy?'Testing…':'Test Connection'}</button><button class="secondary" data-nano-oauth>Sign in with NanoGPT</button></div>
        <div class="nano-note">Recommended for Aurora on GitHub Pages: NanoGPT OAuth creates an app-specific key tied to this site’s origin, avoiding the common browser-origin restriction on manually created keys.</div>
        <div class="nano-status ${n.connectionState==='ok'?'ok':n.connectionState==='error'?'error':''}"><b>Connection</b><br>${safeText(n.connectionStatus)}</div>
      </div></section>

      <section class="section" style="margin-top:18px"><div class="card nano-card"><div class="eyebrow">TEXT GENERATION</div><h2>Text model</h2>
        <label class="modal-label">Selected text model<select class="modal-input" data-nano-field="textModel">${textOptions}</select></label>
        <label class="modal-label">Manual text model ID<input class="modal-input" data-nano-field="textModelManual" value="${safeText(n.textModelManual||'')}" placeholder="Example: deepseek/deepseek-v4-flash-latest" autocomplete="off"></label>
        <div class="field-hint">Paste the model ID (for example <b>deepseek/deepseek-v4-flash-latest</b>). You can also paste an exact loaded model name and Aurora will resolve it.</div>
        <div class="nano-model-actions"><button class="secondary" data-nano-load-text ${n.textBusy?'disabled':''}>${n.textBusy?'Loading…':'Load Text Models'}</button><button class="secondary" data-nano-use-text-manual ${n.textBusy?'disabled':''}>Use Manual Text Model</button></div>
        <div class="nano-status ${String(n.modelStatus||'').includes('failed')?'error':''}"><b>Text models</b><br>${safeText(n.modelStatus)}</div>
      </div></section>

      <section class="section" style="margin-top:18px"><div class="card nano-card"><div class="eyebrow">IMAGE GENERATION</div><h2>Image model</h2>
        <label class="modal-label">Selected image model<select class="modal-input" data-nano-field="imageModel">${imageOptions}</select></label>
        <label class="modal-label">Manual image model ID<input class="modal-input" data-nano-field="imageModelManual" value="${safeText(n.imageModelManual||'')}" placeholder="Paste a NanoGPT image model ID" autocomplete="off"></label>
        <div class="field-hint">Use this when you already know the NanoGPT image model ID.</div>
        <div class="nano-model-actions"><button class="secondary" data-nano-load-image ${n.imageBusy?'disabled':''}>${n.imageBusy?'Loading…':'Load Image Models'}</button><button class="secondary" data-nano-use-image-manual ${n.imageBusy?'disabled':''}>Use Manual Image Model</button></div>
        <div class="nano-status ${String(n.imageStatus||'').includes('failed')?'error':''}"><b>Image models</b><br>${safeText(n.imageStatus)}</div>
      </div></section>

      <section class="section" style="margin-top:18px"><div class="card nano-card"><div class="eyebrow">NanoGPT options</div><h2>Request options</h2>
        <label class="modal-label">Billing<select class="modal-input" data-nano-field="billing"><option ${n.billing==='Default'?'selected':''}>Default</option><option ${n.billing==='Pay As You Go'?'selected':''}>Pay As You Go</option></select></label>
        <label class="modal-label">Provider routing<select class="modal-input" data-nano-field="routing"><option ${n.routing==='Automatic'?'selected':''}>Automatic</option><option ${n.routing==='Fixed provider'?'selected':''}>Fixed provider</option></select></label>
        <label class="active-toggle"><input type="checkbox" data-nano-field="contextMemory" ${n.contextMemory?'checked':''}><span><b>Enable NanoGPT context memory</b><small>Optional. Aurora’s Story Brain remains separate and is not replaced by provider memory.</small></span></label>
      </div></section>
      <div class="settings-actions"><div style="text-align:center;color:var(--muted);font-size:12px;margin-bottom:9px">Live preview · Not saved yet</div><button class="primary" style="width:100%" data-action="save-close">Save &amp; Close</button></div>
    </div>`,'more');
  }
  function renderLibraryModal(){
    const old=document.getElementById('library-modal'); if(old) old.remove();
    const m=state.libraryModal; if(!m)return;
    const node=document.createElement('div'); node.id='library-modal'; node.className='actionmodal';
    if(m.kind==='rename'){
      node.innerHTML=`<div class="actionpanel" role="dialog" aria-modal="true"><h3>Rename story</h3><p>Choose a new name for this Library item.</p><input id="library-modal-input" value="${safeText(m.value)}" maxlength="120"><div class="modalrow"><button class="secondary" data-action="library-cancel">Cancel</button><button class="primary" data-action="library-rename-confirm">Rename</button></div></div>`;
    }else{
      node.innerHTML=`<div class="actionpanel" role="dialog" aria-modal="true"><h3>Delete story?</h3><p>This removes the Library item from this device.</p><div class="modalrow"><button class="secondary" data-action="library-cancel">Cancel</button><button class="danger" data-action="library-delete-confirm">Delete</button></div></div>`;
    }
    document.body.appendChild(node);
    const input=node.querySelector('#library-modal-input'); if(input){input.focus();input.select();}
  }

  function cleanupBrainOverlays(){
    document.querySelectorAll('body > .brain-backdrop').forEach(el=>el.remove());
    document.body.classList.remove('brain-modal-open');
  }

  // ===== Story Brain 2.1 refinement: persistent character state timeline + visible canon/arc controls =====
  function ensureBrain20(brain){
    // Single defensive migration layer. Every Brain tab calls this, so it must
    // tolerate any legacy/malformed record without ever throwing.
    if(!brain || typeof brain!=='object' || Array.isArray(brain)) brain=defaultStoryBrain();
    if(!brain.storyPosition || typeof brain.storyPosition!=='object' || Array.isArray(brain.storyPosition)) brain.storyPosition={};
    if(!brain.storyPosition.arcId && brain.storyPosition.arc) brain.storyPosition.arcId=brain.storyPosition.arc;
    if(!brain.storyPosition.phaseId && brain.storyPosition.phase) brain.storyPosition.phaseId=brain.storyPosition.phase;
    if(!brain.storyPosition.arcId) brain.storyPosition.arcId='';
    if(!brain.storyPosition.phaseId) brain.storyPosition.phaseId='';
    if(!brain.storyPosition.chapter) brain.storyPosition.chapter='';
    if(!brain.storyPosition.status) brain.storyPosition.status='Not started';

    const recordKeys=['characters','locations','factions','events','threads','storyRules','customEntries','secrets','ideas'];
    recordKeys.forEach(k=>{
      if(!Array.isArray(brain[k])) brain[k]=[];
      brain[k]=brain[k].filter(x=>x && typeof x==='object' && !Array.isArray(x));
      brain[k].forEach(x=>{
        if(!Array.isArray(x.stateTimeline)){
          const legacy=Array.isArray(x.stateHistory)?x.stateHistory:[];
          x.stateTimeline=legacy.filter(h=>h&&typeof h==='object'&&!Array.isArray(h)).map(h=>({...h,timeline:h.timeline||'Past'}));
        }else{
          x.stateTimeline=x.stateTimeline.filter(st=>st&&typeof st==='object'&&!Array.isArray(st));
        }
        x.stateTimeline.forEach(st=>{
          if(!st.id) st.id='state_'+Date.now().toString(36)+'_'+Math.random().toString(36).slice(2,6);
          if(!st.timeline) st.timeline='Past';
          if(!st.revealStatus) st.revealStatus='Revealed';
          if(!st.knowledgeScope) st.knowledgeScope='Everyone';
        });
        if(!Array.isArray(x.stateHistory)) x.stateHistory=[];
        if(!x.currentStateData || typeof x.currentStateData!=='object' || Array.isArray(x.currentStateData)) x.currentStateData={};
      });
    });

    if(!Array.isArray(brain.arcs)) brain.arcs=[];
    brain.arcs=brain.arcs.filter(a=>a && typeof a==='object' && !Array.isArray(a));
    brain.arcs.forEach((a,i)=>{
      if(!a.id) a.id='arc_'+Date.now().toString(36)+'_'+i;
      if(!Array.isArray(a.phases)) a.phases=[];
      if(!Array.isArray(a.events)) a.events=[];
      if(!Array.isArray(a.consequences)) a.consequences=[];
      a.phases=a.phases.filter(x=>x&&typeof x==='object'&&!Array.isArray(x));
      a.events=a.events.filter(x=>x&&typeof x==='object'&&!Array.isArray(x));
      if(!a.status) a.status='Planned';
      a.phases.forEach((ph,j)=>{if(!ph.id)ph.id='phase_'+Date.now().toString(36)+'_'+j;if(!ph.status)ph.status='Locked';});
      a.events.forEach((ev,j)=>{if(!ev.id)ev.id='event_'+Date.now().toString(36)+'_'+j;if(!ev.state)ev.state='Future';});
    });
    if(!brain.fieldDefs || typeof brain.fieldDefs!=='object' || Array.isArray(brain.fieldDefs)) brain.fieldDefs={};
    ['characters','locations','factions','events','threads','storyRules','customEntries'].forEach(k=>{
      if(!Array.isArray(brain.fieldDefs[k])) brain.fieldDefs[k]=[];
      brain.fieldDefs[k]=brain.fieldDefs[k].filter(fd=>fd&&typeof fd==='object'&&!Array.isArray(fd)&&typeof fd.name==='string');
    });
    return brain;
  }

  function stateMetaHtml(st){
    const t=['Past','Current','Future'].includes(st?.timeline)?st.timeline:'Past', r=['Revealed','Hidden'].includes(st?.revealStatus)?st.revealStatus:'Revealed';
    const tIcon=t==='Current'?'●':t==='Future'?'○':'✓';
    const rIcon=r==='Hidden'?'🔒':'👁';
    return `<span class="state-chip ${t.toLowerCase()}">${tIcon} ${safeText(t)}</span><span class="state-chip reveal">${rIcon} ${safeText(r)}</span><span class="state-chip ai">AI knows</span>`;
  }

  function characterStateModal(id){
    const si=state.brainStateInput;if(!si)return '';
    const b=ensureBrain20(getStoryBrain(id)); const ch=b.characters[si.characterIndex]; if(!ch)return '';
    const tl=ch.stateTimeline||[]; const st=si.stateIndex!=null?tl[si.stateIndex]:{};
    const v=k=>safeText(st?.[k]??'');
    const current=st?.timeline==='Current';
    return `<div class="modal-backdrop brain-backdrop" data-state-modal-backdrop><div class="confirm-modal brain-editor-modal">
      <div class="confirm-icon">◷</div>
      <h2>${si.stateIndex!=null?'Edit':'Add'} state — ${safeText(ch.name||'Character')}</h2>
      <p>One character can have unlimited states. When a new state becomes Current, the previous Current state automatically becomes Past. Nothing is deleted.</p>
      <label class="modal-label">State name <span class="field-hint">optional but recommended</span><input class="modal-input" data-state-v2="label" value="${v('label')}" placeholder="Foundation Establishment / Core Formation / Injured"></label>
      <div class="brain-form-section"><div class="brain-form-kicker">WHEN</div>
        <div class="modal-grid2">
          <label class="modal-label">Timeline<select class="modal-input" data-state-v2="timeline"><option ${v('timeline')==='Past'?'selected':''}>Past</option><option ${v('timeline')==='Current' || !v('timeline')?'selected':''}>Current</option><option ${v('timeline')==='Future'?'selected':''}>Future</option></select></label>
          <label class="modal-label">Chapter / position<input class="modal-input" data-state-v2="chapter" value="${v('chapter')}" placeholder="Chapter 42"></label>
        </div>
        <div class="modal-grid2"><label class="modal-label">Arc<input class="modal-input" data-state-v2="arc" value="${v('arc')}" placeholder="Marineford"></label><label class="modal-label">Phase<input class="modal-input" data-state-v2="phase" value="${v('phase')}" placeholder="War Begins"></label></div>
      </div>
      <div class="brain-form-section"><div class="brain-form-kicker">WHAT IS TRUE</div>
        <div class="modal-grid2"><label class="modal-label">Power / cultivation<input class="modal-input" data-state-v2="cultivation" value="${v('cultivation')}" placeholder="Foundation Establishment"></label><label class="modal-label">Location<input class="modal-input" data-state-v2="location" value="${v('location')}" placeholder="Azure Sect"></label></div>
        <div class="modal-grid2"><label class="modal-label">Condition<input class="modal-input" data-state-v2="condition" value="${v('condition')}" placeholder="Healthy / injured"></label><label class="modal-label">Current goal<input class="modal-input" data-state-v2="goal" value="${v('goal')}" placeholder="Find her brother"></label></div>
        <label class="modal-label">Other state details<textarea class="modal-textarea" data-state-v2="notes" placeholder="Temporary circumstances, equipment, political position, relationships at this point, etc.">${v('notes')}</textarea></label>
      </div>
      <div class="brain-form-section"><div class="brain-form-kicker">KNOWLEDGE & REVEAL</div>
        <div class="modal-grid2"><label class="modal-label">Story visibility<select class="modal-input" data-state-v2="revealStatus"><option ${v('revealStatus')==='Revealed' || !v('revealStatus')?'selected':''}>Revealed</option><option ${v('revealStatus')==='Hidden'?'selected':''}>Hidden</option></select></label>
        <label class="modal-label">Who knows?<select class="modal-input" data-state-v2="knowledgeScope"><option ${v('knowledgeScope')==='AI / author only'?'selected':''}>AI / author only</option><option ${v('knowledgeScope')==='MC only'?'selected':''}>MC only</option><option ${v('knowledgeScope')==='Specific characters'?'selected':''}>Specific characters</option><option ${v('knowledgeScope')==='Everyone'?'selected':''}>Everyone</option></select></label></div>
        <label class="modal-label">Specific people / groups <span class="field-hint">optional</span><input class="modal-input" data-state-v2="knowledgePeople" value="${v('knowledgePeople')}" placeholder="MC, Saly, Azure Cloud Sect"></label>
        <label class="modal-label">Reveal / unlock condition <span class="field-hint">optional</span><input class="modal-input" data-state-v2="revealWhen" value="${v('revealWhen')}" placeholder="Chapter 200 / after MC discovers it"></label>
        <div class="builder-note">AI knowledge is stored separately from character knowledge. A Future + Hidden state can be known by Aurora without being revealed to the characters.</div>
      </div>
      <div class="confirm-actions"><button class="secondary" data-state-modal-cancel>Cancel</button><button class="primary" data-state-save-v2>${si.stateIndex!=null?'Save state':'Add state'}</button></div>
    </div></div>`;
  }


  function entityStateTimelineHtml(obj, kind, index){
    const tl=Array.isArray(obj.stateTimeline)?obj.stateTimeline:[];
    const cur=tl.find(x=>x.timeline==='Current');
    return `<div class="brain-form-section"><div class="brain-form-kicker">CURRENT STATE</div>
      ${cur?`<div class="state-current-card"><div>${stateMetaHtml(cur)}</div><b>${safeText(cur.label||cur.status||'Current state')}</b><span>${safeText([cur.chapter,cur.arc,cur.phase,cur.details].filter(Boolean).join(' · '))}</span></div>`:'<div class="mutedbox">No current state yet.</div>'}
      <button class="secondary" data-entity-state-add data-entity-kind="${safeText(kind)}" data-entity-index="${index}">＋ Add new state</button>
      <p class="field-hint" style="margin-top:8px">One entry can change unlimited times. Finished states remain attached to this same entry as history.</p>
    </div>
    ${tl.length?`<div class="brain-form-section"><div class="brain-form-kicker">STATE TIMELINE · ${tl.length}</div>${tl.slice().sort((a,b)=>({Current:0,Future:1,Past:2}[a.timeline]??3)-({Current:0,Future:1,Past:2}[b.timeline]??3)).map(st=>{const real=tl.indexOf(st);return `<div class="state-timeline-row"><div class="state-timeline-main"><div>${stateMetaHtml(st)}</div><b>${safeText(st.label||st.status||'Unnamed state')}</b><span>${safeText([st.chapter,st.arc,st.phase].filter(Boolean).join(' · '))}</span><small>${safeText(st.details||'')}</small></div><div class="record-actions"><button class="mini-action" data-entity-state-edit data-entity-kind="${safeText(kind)}" data-entity-index="${index}" data-state-index="${real}">Edit</button><button class="mini-action danger-mini" data-entity-state-delete data-entity-kind="${safeText(kind)}" data-entity-index="${index}" data-state-index="${real}">Delete</button></div></div>`}).join('')}</div>`:''}`;
  }

  function entityStateModal(id){
    const si=state.brainEntityStateInput;if(!si)return '';
    const b=ensureBrain20(getStoryBrain(id)); const arr=Array.isArray(b[si.kind])?b[si.kind]:[]; const rec=arr[si.index]; if(!rec)return '';
    const tl=Array.isArray(rec.stateTimeline)?rec.stateTimeline:[]; const st=si.stateIndex!=null?(tl[si.stateIndex]||{}):{}; const v=k=>safeText(st[k]??'');
    return `<div class="modal-backdrop brain-backdrop" data-entity-state-modal-backdrop><div class="confirm-modal brain-editor-modal">
      <div class="confirm-icon">◷</div><h2>${si.stateIndex!=null?'Edit':'Add'} state — ${safeText(rec.name||rec.title||rec.text||'Entry')}</h2>
      <p>This is the same entry at another point in the story. Nothing is duplicated or deleted. A new Current state automatically moves the previous Current state to Past.</p>
      <label class="modal-label">State name <span class="field-hint">optional but recommended</span><input class="modal-input" data-entity-state-field="label" value="${v('label')}" placeholder="Active / Destroyed / Alliance formed / Unresolved"></label>
      <div class="brain-form-section"><div class="brain-form-kicker">WHEN</div><div class="modal-grid2">
        <label class="modal-label">Timeline<select class="modal-input" data-entity-state-field="timeline"><option ${v('timeline')==='Past'?'selected':''}>Past</option><option ${v('timeline')==='Current'||!v('timeline')?'selected':''}>Current</option><option ${v('timeline')==='Future'?'selected':''}>Future</option></select></label>
        <label class="modal-label">Chapter / position<input class="modal-input" data-entity-state-field="chapter" value="${v('chapter')}" placeholder="Chapter 42"></label></div>
        <div class="modal-grid2"><label class="modal-label">Arc<input class="modal-input" data-entity-state-field="arc" value="${v('arc')}" placeholder="Marineford"></label><label class="modal-label">Phase<input class="modal-input" data-entity-state-field="phase" value="${v('phase')}" placeholder="War Begins"></label></div>
      </div>
      <div class="brain-form-section"><div class="brain-form-kicker">WHAT IS TRUE / WHAT CHANGED</div>
        <label class="modal-label">State / status<input class="modal-input" data-entity-state-field="status" value="${v('status')}" placeholder="Active / Destroyed / Unresolved"></label>
        <label class="modal-label">Details<textarea class="modal-textarea" data-entity-state-field="details" placeholder="What is true at this point? What changed from the previous state?">${v('details')}</textarea></label>
      </div>
      <div class="brain-form-section"><div class="brain-form-kicker">KNOWLEDGE & REVEAL</div><div class="modal-grid2">
        <label class="modal-label">Visibility<select class="modal-input" data-entity-state-field="revealStatus"><option ${v('revealStatus')==='Revealed'||!v('revealStatus')?'selected':''}>Revealed</option><option ${v('revealStatus')==='Hidden'?'selected':''}>Hidden</option></select></label>
        <label class="modal-label">Who knows?<select class="modal-input" data-entity-state-field="knowledgeScope"><option ${v('knowledgeScope')==='AI / author only'?'selected':''}>AI / author only</option><option ${v('knowledgeScope')==='MC only'?'selected':''}>MC only</option><option ${v('knowledgeScope')==='Specific characters / groups'?'selected':''}>Specific characters / groups</option><option ${v('knowledgeScope')==='Everyone'||!v('knowledgeScope')?'selected':''}>Everyone</option></select></label></div>
        <label class="modal-label">Specific people / groups<input class="modal-input" data-entity-state-field="knowledgePeople" value="${v('knowledgePeople')}" placeholder="MC, Saly, Elder Chen"></label>
        <label class="modal-label">Reveal / unlock when<input class="modal-input" data-entity-state-field="revealWhen" value="${v('revealWhen')}" placeholder="Chapter 200 / after the betrayal"></label>
        <div class="builder-note">These labels describe what Aurora knows, when it is true, and who can know it. They are stored on this state, not on the whole entry.</div>
      </div>
      <div class="confirm-actions"><button class="secondary" data-entity-state-cancel>Cancel</button><button class="primary" data-entity-state-save>${si.stateIndex!=null?'Save state':'Add state'}</button></div>
    </div></div>`;
  }

  function brainEditorModal(id){
    if(!state.brainInput)return '';
    const bi=state.brainInput,b=ensureBrain20(getStoryBrain(id));
    const arr=Array.isArray(b[bi.kind])?b[bi.kind]:[]; const obj=bi.mode==='edit'&&arr[bi.index]?arr[bi.index]:{}; const v=k=>brainFieldValue(obj,k);
    let fields='';
    if(bi.kind==='characters'){
      const tl=obj.stateTimeline||[]; const cur=tl.find(x=>x.timeline==='Current');
      return `<div class="modal-backdrop brain-backdrop" data-brain-modal-backdrop><div class="confirm-modal brain-editor-modal">
        <div class="confirm-icon">●</div><h2>${bi.mode==='edit'?'Edit character':'New character'}</h2>
        <p><b>One character = one permanent record.</b> Power, location, injuries, goals and other changing conditions belong in the State Timeline below.</p>
        <div class="brain-form-section"><div class="brain-form-kicker">IDENTITY</div>
          <label class="modal-label">Name<input class="modal-input" data-brain-field="name" value="${v('name')}" placeholder="Saly"></label>
          <div class="modal-grid2"><label class="modal-label">Role<input class="modal-input" data-brain-field="role" value="${v('role')}" placeholder="Protagonist, rival, mentor…"></label><label class="modal-label">Age<input class="modal-input" data-brain-field="age" value="${v('age')}" placeholder="25"></label></div>
          <label class="modal-label">Species / race<input class="modal-input" data-brain-field="species" value="${v('species')}" placeholder="Human, immortal, elf…"></label>
          <label class="modal-label">Appearance<textarea class="modal-textarea" data-brain-field="appearance" placeholder="Stable appearance and identifying details.">${v('appearance')}</textarea></label>
          <label class="modal-label">Voice / dialogue style<textarea class="modal-textarea" data-brain-field="voice" placeholder="How they speak.">${v('voice')}</textarea></label>
        </div>
        <div class="brain-form-section"><div class="brain-form-kicker">MIND & ROLE</div>
          <label class="modal-label">Personality<textarea class="modal-textarea" data-brain-field="personality">${v('personality')}</textarea></label>
          <label class="modal-label">Strengths & flaws<textarea class="modal-textarea" data-brain-field="strengthsFlaws">${v('strengthsFlaws')}</textarea></label>
          <label class="modal-label">Goals / motivations<textarea class="modal-textarea" data-brain-field="goals">${v('goals')}</textarea></label>
          <label class="modal-label">Backstory / history<textarea class="modal-textarea" data-brain-field="backstory">${v('backstory')}</textarea></label>
        </div>
        <div class="brain-form-section"><div class="brain-form-kicker">ABILITIES & KNOWLEDGE</div>
          <label class="modal-label">Abilities / skills<textarea class="modal-textarea" data-brain-field="abilities">${v('abilities')}</textarea></label>
          <label class="modal-label">What this character knows<textarea class="modal-textarea" data-brain-field="knowledge">${v('knowledge')}</textarea></label>
          <label class="modal-label">Secrets<textarea class="modal-textarea" data-brain-field="secrets">${v('secrets')}</textarea></label>
        </div>
        <div class="brain-form-section"><div class="brain-form-kicker">CURRENT STATE</div>
          ${cur?`<div class="state-current-card"><div>${stateMetaHtml(cur)}</div><b>${safeText(cur.label||cur.cultivation||'Current state')}</b><span>${safeText([cur.cultivation,cur.location,cur.condition].filter(Boolean).join(' · '))}</span></div>`:'<div class="mutedbox">No current state yet.</div>'}
          ${bi.mode==='edit'?'<button class="secondary" data-state-add-v2 data-character-index="'+bi.index+'">＋ Add new state</button>':'<div class="builder-note">Save the character first, then you can add as many states as you need.</div>'}
          <p class="field-hint" style="margin-top:8px">Finished states stay here as history. You never create another copy of the character.</p>
        </div>
        ${tl.length?`<div class="brain-form-section"><div class="brain-form-kicker">STATE TIMELINE · ${tl.length}</div>${tl.slice().sort((a,b)=>({Current:0,Future:1,Past:2}[a.timeline]??3)-({Current:0,Future:1,Past:2}[b.timeline]??3)).map((st,i)=>{const real=tl.indexOf(st);return `<div class="state-timeline-row"><div class="state-timeline-main"><div>${stateMetaHtml(st)}</div><b>${safeText(st.label||st.cultivation||'Unnamed state')}</b><span>${safeText([st.chapter,st.arc,st.phase].filter(Boolean).join(' · '))}</span><small>${safeText([st.cultivation,st.location,st.condition].filter(Boolean).join(' · '))}</small></div><div class="record-actions"><button class="mini-action" data-state-edit-v2 data-character-index="${bi.index}" data-state-index="${real}">Edit</button><button class="mini-action danger-mini" data-state-delete-v2 data-character-index="${bi.index}" data-state-index="${real}">Delete</button></div></div>`}).join('')}</div>`:''}
        <div class="brain-advanced"><details><summary>Advanced</summary><div class="advanced-fields"><label class="modal-label">Protect this character record <input type="checkbox" data-memory-protect ${obj.protectedFact?'checked':''}></label><label class="modal-label">Aurora instructions<textarea class="modal-textarea small" data-brain-field="instructions">${v('instructions')}</textarea></label></div></details></div>
        <div class="confirm-actions"><button class="secondary" data-brain-modal-cancel>Cancel</button><button class="primary" data-brain-modal-save>Save character</button></div>
      </div></div>`;
    }
    if(bi.kind==='arcs'){
      const phases=obj.phases||[],events=obj.events||[];
      return `<div class="modal-backdrop brain-backdrop" data-brain-modal-backdrop><div class="confirm-modal brain-editor-modal">
        <div class="confirm-icon">◆</div><h2>${bi.mode==='edit'?'Edit arc':'New arc'}</h2><p>An Arc is a container. Keep all phases, events and lasting consequences together.</p>
        <label class="modal-label">Arc name<input class="modal-input" data-brain-field="name" value="${v('name')}" placeholder="Marineford"></label>
        <div class="modal-grid2"><label class="modal-label">Status<select class="modal-input" data-brain-field="status"><option ${obj.status==='Planned'?'selected':''}>Planned</option><option ${obj.status==='Active'?'selected':''}>Active</option><option ${obj.status==='Completed'?'selected':''}>Completed</option></select></label><label class="modal-label">Description<input class="modal-input" data-brain-field="description" value="${v('description')}" placeholder="Major conflict and purpose"></label></div>
        <div class="brain-form-section"><div class="brain-form-kicker">PHASES · ${phases.length}</div>
          ${phases.map((ph,i)=>{const isCurrent=(b.storyPosition?.arcId===obj.id&&b.storyPosition?.phaseId===ph.id);const icon=isCurrent?'●':ph.status==='Completed'?'✓':ph.status==='Available'?'○':'🔒';const label=isCurrent?'Current':ph.status;const action=ph.status==='Locked'?'Unlock':ph.status==='Available'?'Complete':'Reopen';return `<div class="state-timeline-row"><div class="state-timeline-main"><div><span class="state-chip ${isCurrent?'current':String(ph.status||'Locked').toLowerCase()}">${icon} ${label}</span></div><b>${safeText(ph.name||'Unnamed phase')}</b><small>${safeText(ph.description||'')}</small></div><div class="record-actions"><button class="mini-action" data-phase-status-v2 data-phase-index="${i}">${action}</button><button class="mini-action danger-mini" data-phase-delete-v2 data-phase-index="${i}">Delete</button></div></div>`}).join('')||'<div class="mutedbox">No phases yet.</div>'}
          <div class="modal-grid2"><input class="modal-input" id="new-phase-name-v2" placeholder="Phase name"><select class="modal-input" id="new-phase-status-v2"><option>Locked</option><option>Available</option><option>Completed</option></select></div><input class="modal-input" id="new-phase-description-v2" style="margin-top:9px" placeholder="What this phase accomplishes"><button class="secondary" data-phase-add-v2 style="margin-top:9px">＋ Add phase</button>
        </div>
        <div class="brain-form-section"><div class="brain-form-kicker">EVENTS · ${events.length}</div>
          ${events.map((ev,i)=>`<div class="state-timeline-row"><div class="state-timeline-main"><div><span class="state-chip ${String(ev.state||'Future').toLowerCase()}">${ev.state==='Completed'?'✓':ev.state==='Current'?'●':'○'} ${safeText(ev.state||'Future')}</span></div><b>${safeText(ev.name||'Unnamed event')}</b><small>${safeText(ev.description||'')}</small></div><div class="record-actions"><button class="mini-action" data-event-state-v2 data-event-index="${i}">Cycle status</button><button class="mini-action danger-mini" data-event-delete-v2 data-event-index="${i}">Delete</button></div></div>`).join('')||'<div class="mutedbox">No events yet.</div>'}
          <div class="modal-grid2"><input class="modal-input" id="new-event-name-v2" placeholder="Event"><select class="modal-input" id="new-event-state-v2"><option>Future</option><option>Current</option><option>Completed</option></select></div><input class="modal-input" id="new-event-description-v2" style="margin-top:9px" placeholder="What happens?"><button class="secondary" data-event-add-v2 style="margin-top:9px">＋ Add event</button>
        </div>
        <label class="modal-label">Lasting consequences<textarea class="modal-textarea" data-brain-field="consequencesText" placeholder="Changes that remain true after this arc ends.">${v('consequencesText')}</textarea></label>
        ${bi.mode==='edit'?entityStateTimelineHtml(obj,bi.kind,bi.index):'<div class="brain-form-section"><div class="brain-form-kicker">STATE TIMELINE</div><div class="builder-note">Save this arc first. Then you can add unlimited states to the same arc.</div></div>'}
        <div class="confirm-actions"><button class="secondary" data-brain-modal-cancel>Close</button><button class="primary" data-brain-modal-save>Save arc</button></div>
      </div></div>`;
    }
    // Rich, legacy field sets are preserved for every non-character entity.
    const map={locations:'Location',factions:'Faction',events:'Timeline event',threads:'Open thread',storyRules:'Story rule',customEntries:'Custom brain entry',secrets:'Secret',ideas:'Idea'}; const label=map[bi.kind]||'Brain entry';
    if(bi.kind==='locations'){
      fields=`
        <div class="brain-form-section"><div class="brain-form-kicker">IDENTITY</div>
          <label class="modal-label">Location name<input class="modal-input" data-brain-field="name" value="${v('name')}" placeholder="e.g. Mistfall Village"></label>
          <div class="modal-grid2">
            <label class="modal-label">Type<input class="modal-input" data-brain-field="type" value="${v('type')}" placeholder="Village, city, sect, realm…"></label>
            <label class="modal-label">Region / hierarchy<input class="modal-input" data-brain-field="region" value="${v('region')}" placeholder="Province, continent, realm…"></label>
          </div>
          <label class="modal-label">Tags / keywords<input class="modal-input" data-brain-field="tags" value="${v('tags')}" placeholder="Capital, sacred, dangerous, poor…"></label>
        </div>
        <div class="brain-form-section"><div class="brain-form-kicker">PLACE & DAILY LIFE</div>
          <label class="modal-label">Description<textarea class="modal-textarea" data-brain-field="description" placeholder="What this place looks and feels like. Include useful visual anchors.">${v('description')}</textarea></label>
          <label class="modal-label">Culture & daily life<textarea class="modal-textarea" data-brain-field="culture" placeholder="Customs, cuisine, clothing, entertainment, taboos and ordinary life.">${v('culture')}</textarea></label>
          <label class="modal-label">People & population<textarea class="modal-textarea" data-brain-field="population" placeholder="Who lives here, population character, social groups.">${v('population')}</textarea></label>
        </div>
        <div class="brain-form-section"><div class="brain-form-kicker">RULES & IMPORTANCE</div>
          <label class="modal-label">Important rules / conditions<textarea class="modal-textarea" data-brain-field="rules" placeholder="Stable rules, restrictions, dangers or unusual conditions.">${v('rules')}</textarea></label>
          <label class="modal-label">Economy / resources<textarea class="modal-textarea" data-brain-field="economy" placeholder="Currencies, resources, trade, jobs, markets or scarcity.">${v('economy')}</textarea></label>
          <label class="modal-label">Significance<textarea class="modal-textarea" data-brain-field="significance" placeholder="Why Aurora should remember this location.">${v('significance')}</textarea></label>
        </div>
        <div class="brain-form-section"><div class="brain-form-kicker">ACCESS & STORY USE</div>
          <label class="modal-label">Access / travel<textarea class="modal-textarea" data-brain-field="access" placeholder="How characters reach it, distance, routes, barriers or costs.">${v('access')}</textarea></label>
          <label class="modal-label">Important locations within it<textarea class="modal-textarea" data-brain-field="landmarks" placeholder="Districts, landmarks, rooms, shops, temples or other recurring places.">${v('landmarks')}</textarea></label>
        </div>
      `;
    }else if(bi.kind==='factions'){
      fields=`
        <div class="brain-form-section"><div class="brain-form-kicker">IDENTITY</div>
          <label class="modal-label">Faction name<input class="modal-input" data-brain-field="name" value="${v('name')}" placeholder="e.g. Azure Cloud Sect"></label>
          <div class="modal-grid2">
            <label class="modal-label">Type / role<input class="modal-input" data-brain-field="type" value="${v('type')}" placeholder="Sect, empire, guild, cult…"></label>
            <label class="modal-label">Status<input class="modal-input" data-brain-field="status" value="${v('status')}" placeholder="Active, fallen, hidden…"></label>
          </div>
        </div>
        <div class="brain-form-section"><div class="brain-form-kicker">BELIEFS & STRUCTURE</div>
          <label class="modal-label">Purpose / ideology<textarea class="modal-textarea" data-brain-field="purpose" placeholder="What the faction wants, values or believes.">${v('purpose')}</textarea></label>
          <label class="modal-label">Leadership & structure<textarea class="modal-textarea" data-brain-field="structure" placeholder="Leader, ranks, departments, succession and internal organization.">${v('structure')}</textarea></label>
          <label class="modal-label">Important members<textarea class="modal-textarea" data-brain-field="members" placeholder="Key people and positions.">${v('members')}</textarea></label>
        </div>
        <div class="brain-form-section"><div class="brain-form-kicker">RESOURCES & RELATIONSHIPS</div>
          <label class="modal-label">Resources / assets<textarea class="modal-textarea" data-brain-field="resources" placeholder="Money, territory, troops, artifacts, information or other assets.">${v('resources')}</textarea></label>
          <label class="modal-label">Allies / enemies<textarea class="modal-textarea" data-brain-field="relations" placeholder="Important relationships with other factions.">${v('relations')}</textarea></label>
          <label class="modal-label">Methods / reputation<textarea class="modal-textarea" data-brain-field="methods" placeholder="How they operate and how others perceive them.">${v('methods')}</textarea></label>
        </div>
      `;
    }else if(bi.kind==='events'){
      fields=`
        <div class="brain-form-section"><div class="brain-form-kicker">WHEN & WHERE</div>
          <label class="modal-label">Event name<input class="modal-input" data-brain-field="name" value="${v('name')}" placeholder="e.g. The Sect War"></label>
          <div class="modal-grid2">
            <label class="modal-label">When<input class="modal-input" data-brain-field="when" value="${v('when')}" placeholder="Year 312 / Chapter 8…"></label>
            <label class="modal-label">Where<input class="modal-input" data-brain-field="where" value="${v('where')}" placeholder="Mistfall / Upper Realm…"></label>
          </div>
        </div>
        <div class="brain-form-section"><div class="brain-form-kicker">WHAT HAPPENED</div>
          <label class="modal-label">What happened<textarea class="modal-textarea" data-brain-field="description" placeholder="Concise canonical event description.">${v('description')}</textarea></label>
          <label class="modal-label">Participants<textarea class="modal-textarea" data-brain-field="participants" placeholder="Characters, factions or forces directly involved.">${v('participants')}</textarea></label>
          <label class="modal-label">Cause / trigger<textarea class="modal-textarea" data-brain-field="cause" placeholder="What caused the event.">${v('cause')}</textarea></label>
        </div>
        <div class="brain-form-section"><div class="brain-form-kicker">CONSEQUENCES & CONTINUITY</div>
          <label class="modal-label">Consequences<textarea class="modal-textarea" data-brain-field="consequences" placeholder="What changed because of this event.">${v('consequences')}</textarea></label>
          <label class="modal-label">Canon importance<select class="modal-input" data-brain-field="importance"><option ${obj.importance==='Normal' || !obj.importance?'selected':''}>Normal</option><option ${obj.importance==='High'?'selected':''}>High</option><option ${obj.importance==='Critical'?'selected':''}>Critical</option></select></label>
        </div>
      `;
    }else if(bi.kind==='threads'){
      fields=`
        <div class="brain-form-section"><div class="brain-form-kicker">THREAD</div>
          <label class="modal-label">Thread title<input class="modal-input" data-brain-field="name" value="${v('name')}" placeholder="e.g. Who is watching the village?"></label>
          <div class="modal-grid2">
            <label class="modal-label">Status<select class="modal-input" data-brain-field="status"><option ${obj.status==='Open' || !obj.status?'selected':''}>Open</option><option ${obj.status==='Dormant'?'selected':''}>Dormant</option><option ${obj.status==='Resolved'?'selected':''}>Resolved</option><option ${obj.status==='Abandoned'?'selected':''}>Abandoned</option></select></label>
            <label class="modal-label">Priority<select class="modal-input" data-brain-field="priority"><option ${obj.priority==='Normal' || !obj.priority?'selected':''}>Normal</option><option ${obj.priority==='High'?'selected':''}>High</option><option ${obj.priority==='Critical'?'selected':''}>Critical</option></select></label>
          </div>
        </div>
        <div class="brain-form-section"><div class="brain-form-kicker">UNRESOLVED BUSINESS</div>
          <label class="modal-label">What is unresolved?<textarea class="modal-textarea" data-brain-field="description" placeholder="What still needs to happen or be answered.">${v('description')}</textarea></label>
          <label class="modal-label">Known clues / progress<textarea class="modal-textarea" data-brain-field="clues" placeholder="What has already been discovered or established.">${v('clues')}</textarea></label>
          <label class="modal-label">Related characters / factions<textarea class="modal-textarea" data-brain-field="participants" placeholder="Who is connected to this thread.">${v('participants')}</textarea></label>
        </div>
        <div class="brain-form-section"><div class="brain-form-kicker">PAYOFF</div>
          <label class="modal-label">Stakes / payoff<textarea class="modal-textarea" data-brain-field="stakes" placeholder="Why this thread matters and what payoff is expected.">${v('stakes')}</textarea></label>
          <label class="modal-label">Possible directions<textarea class="modal-textarea" data-brain-field="directions" placeholder="Plausible developments without forcing Aurora to choose one.">${v('directions')}</textarea></label>
          <label class="modal-label">Last touched<input class="modal-input" data-brain-field="lastTouched" value="${v('lastTouched')}" placeholder="Chapter / scene / date"></label>
        </div>
      `;
    }else if(bi.kind==='storyRules'){
      fields=`
        <div class="brain-form-section"><div class="brain-form-kicker">RULE</div>
          <label class="modal-label">Rule<textarea class="modal-textarea" data-brain-field="text" placeholder="e.g. Ruin's true cultivation level must not be casually revealed.">${v('text')}</textarea></label>
          <div class="modal-grid2">
            <label class="modal-label">Priority<select class="modal-input" data-brain-field="priority"><option ${obj.priority==='Normal' || !obj.priority?'selected':''}>Normal</option><option ${obj.priority==='High'?'selected':''}>High</option><option ${obj.priority==='Critical'?'selected':''}>Critical</option></select></label>
            <label class="modal-label">Scope<input class="modal-input" data-brain-field="scope" value="${v('scope')}" placeholder="Character, world, whole story…"></label>
          </div>
        </div>
        <div class="brain-form-section"><div class="brain-form-kicker">ENFORCEMENT</div>
          <label class="modal-label">Why this rule matters<textarea class="modal-textarea" data-brain-field="description" placeholder="Explain the continuity reason.">${v('description')}</textarea></label>
          <label class="modal-label">What Aurora should avoid<textarea class="modal-textarea" data-brain-field="avoid" placeholder="Specific mistakes, contradictions or behaviors to avoid.">${v('avoid')}</textarea></label>
          <label class="modal-label">Allowed exceptions<textarea class="modal-textarea" data-brain-field="exceptions" placeholder="When the rule may legitimately be broken.">${v('exceptions')}</textarea></label>
          <label class="modal-label">Applies to<input class="modal-input" data-brain-field="appliesTo" value="${v('appliesTo')}" placeholder="Characters, scenes, dialogue, worldbuilding…"></label>
        </div>
      `;
    }else{
      fields=`
        <div class="brain-form-section"><div class="brain-form-kicker">CUSTOM ENTRY</div>
          <label class="modal-label">Entry name<input class="modal-input" data-brain-field="name" value="${v('name')}" placeholder="e.g. Magic system principle"></label>
          <label class="modal-label">Category<input class="modal-input" data-brain-field="category" value="${v('category')}" placeholder="Magic, culture, technology, lore…"></label>
          <label class="modal-label">What should Aurora remember?<textarea class="modal-textarea" data-brain-field="description" placeholder="Write the useful canonical information here.">${v('description')}</textarea></label>
        </div>
        <div class="brain-form-section"><div class="brain-form-kicker">PRIORITY & USE</div>
          <label class="modal-label">Importance<select class="modal-input" data-brain-field="importance"><option ${obj.importance==='Normal' || !obj.importance?'selected':''}>Normal</option><option ${obj.importance==='High'?'selected':''}>High</option><option ${obj.importance==='Critical'?'selected':''}>Critical</option></select></label>
          <label class="modal-label">When should this matter?<textarea class="modal-textarea" data-brain-field="whenUseful" placeholder="Scenes, characters, locations or situations where this entry is relevant.">${v('whenUseful')}</textarea></label>
        </div>
      `;
    }


    const checked=obj.active!==false?'checked':'';
    const customFields=brainFieldDefs(b,bi.kind).map(fd=>customFieldHtml(fd,obj)).join('');
    const extraNote=`<label class="modal-label brain-extra-note">Additional information <span class="field-hint">optional</span><textarea class="modal-textarea" data-brain-field="additionalInfo" placeholder="Anything important that does not fit the fields above. Add as much detail as you need.">${v('additionalInfo')}</textarea></label>`;
    const timeline=(bi.mode==='edit' && bi.index!=null) ? entityStateTimelineHtml(obj,bi.kind,bi.index) : `<div class="brain-form-section"><div class="brain-form-kicker">STATE HISTORY</div><div class="builder-note">Save this entry first. Then you can add unlimited states to the same entry.</div></div>`;
    const advanced=`<div class="brain-advanced"><details><summary>Optional AI controls</summary><div class="advanced-fields"><p class="advanced-explain">You do not need these for normal Brain use. These controls stay advanced so the main editor remains simple.</p><label class="active-toggle"><input type="checkbox" data-brain-active ${checked}><span><b>Use this entry as active memory</b><small>On = Aurora may use it when relevant. Off = keep it saved but normally leave it out of future context.</small></span></label><label class="modal-label">How should Aurora use this information?<textarea class="modal-textarea" data-brain-field="instructions" placeholder="Example: Keep this secret hidden unless the character has a reason to know it.">${v('instructions')}</textarea></label><label class="modal-label">Template <span class="field-hint">advanced · optional</span><textarea class="modal-textarea" data-brain-field="promptTemplate" placeholder="Only use this if you want to control the format sent to the AI.">${v('promptTemplate')}</textarea></label><label class="modal-label">Variables <span class="field-hint">advanced · optional</span><textarea class="modal-textarea small" data-brain-field="placeholders">${v('placeholders')}</textarea></label></div></details></div>`;
    return `<div class="modal-backdrop brain-backdrop" data-brain-modal-backdrop><div class="confirm-modal brain-editor-modal" role="dialog" aria-modal="true"><div class="confirm-icon">◇</div><h2>${bi.mode==='edit'?'Edit':'Add'} ${label}</h2><p>${bi.kind==='locations'?'Locations store stable setting information and world constraints.':bi.kind==='events'?'Timeline events record canonical changes and consequences.':bi.kind==='storyRules'?'Rules protect constraints Aurora should preserve during generation.':bi.kind==='threads'?'Open threads track unresolved story business.':bi.kind==='factions'?'Factions store organizations, power, beliefs and relationships.':bi.kind==='secrets'?'Secrets store truth separately from who knows it.':bi.kind==='ideas'?'Ideas stay separate from canon until deliberately promoted.':'This information becomes structured memory for this story.'}</p>${fields}${timeline}${customFields}${extraNote}${advanced}<div class="confirm-actions"><button class="secondary" data-brain-modal-cancel>Cancel</button><button class="primary" data-brain-modal-save>${bi.mode==='edit'?'Save changes':'Add to Story Brain'}</button></div></div></div>`;
  }

  function storyBrainPage(id){
    const item=state.library.find(x=>x.id===id);if(!item)return library();
    const b=ensureBrain20(getStoryBrain(id)); const views=[['overview','Overview','◇'],['characters','Characters','◉'],['world','World','⌖'],['events','Timeline','◷'],['story','Story & Arcs','◆'],['canon','Canon','✓'],['threads','Open threads','↯'],['rules','Story rules','✓'],['custom','Custom','＋'],['fields','Fields','⚙']];
    const active=state.brainView||'overview'; let body='';
    if(active==='overview') body=storyBrainOverview(id);
    else if(active==='characters'){
      const arr=b.characters||[]; body=`<div class="overview-hero"><div class="brain-form-kicker">CHARACTERS</div><h2>One record per character.</h2><p>Use the State Timeline to record power progression, injuries, locations, goals and other changes without duplicating the character.</p></div><div class="brain-section-head"><div><b>Characters</b><span>${arr.length} characters</span></div><button class="primary" data-brain-add="characters">＋ Add character</button></div>${arr.length?`<div class="brain-records">${arr.map((x,i)=>{const tl=x.stateTimeline||[];const cur=tl.find(s=>s.timeline==='Current');return `<div class="brain-record"><div class="record-main"><button class="record-read" data-brain-open-record="characters" data-brain-index="${i}"><b>${safeText(x.name||'Unnamed')}</b><span>${safeText([x.role,x.age&&'Age '+x.age,x.species].filter(Boolean).join(' · '))}</span><small>${tl.length} states · Current: ${safeText(cur?.label||cur?.cultivation||'Not set')}</small></button></div><div class="record-actions"><button class="mini-action" data-brain-edit="characters" data-brain-index="${i}">Edit</button><button class="mini-action danger-mini" data-brain-delete="characters" data-brain-index="${i}">Delete</button></div></div>`}).join('')}</div>`:'<div class="mutedbox">No characters yet.</div>'}`;
    }else if(active==='story'){
      const pos=b.storyPosition||{}; const curArc=b.arcs.find(a=>a.id===pos.arcId)||null; const curPhase=curArc?.phases?.find(p=>p.id===pos.phaseId)||null;
      body=`<div class="overview-hero"><div class="brain-form-kicker">STORY & ARCS</div><h2>Organize the story by arcs and phases.</h2><p>An arc contains its phases, events and lasting consequences. Your current position is linked directly to those phases.</p></div>
      <div class="brain-form-section"><div class="brain-form-kicker">CURRENT STORY POSITION</div><div class="modal-grid2"><label class="modal-label">Current arc<select class="modal-input" data-story-position-v2="arcId"><option value="">— Select arc —</option>${b.arcs.map(a=>`<option value="${safeText(a.id)}" ${pos.arcId===a.id?'selected':''}>${safeText(a.name)}</option>`).join('')}</select></label><label class="modal-label">Current phase<select class="modal-input" data-story-position-v2="phaseId"><option value="">— Select phase —</option>${(curArc?.phases||[]).map(p=>`<option value="${safeText(p.id)}" ${pos.phaseId===p.id?'selected':''}>${safeText(p.name)}${p.status==='Completed'?' — Completed':p.status==='Locked'?' — Locked':''}</option>`).join('')}</select></label></div><div class="modal-grid2"><label class="modal-label">Chapter / scene<input class="modal-input" data-story-position-v2="chapter" value="${safeText(pos.chapter||'')}" placeholder="Chapter 87"></label><label class="modal-label">Story status<select class="modal-input" data-story-position-v2="status"><option ${pos.status==='Not started'?'selected':''}>Not started</option><option ${pos.status==='Active'?'selected':''}>Active</option><option ${pos.status==='Completed'?'selected':''}>Completed</option></select></label></div><button class="primary" data-save-story-position-v2>Save current position</button><div class="builder-note">Choose an arc first. Its phases appear automatically. Aurora uses this position to interpret what is past, current and future.</div></div>
      <div class="section-title" style="margin-top:18px">Arcs <span>${b.arcs.length}</span></div><div class="brain-records">${b.arcs.map((a,i)=>`<div class="brain-record"><div class="record-main"><button class="record-read" data-brain-edit="arcs" data-brain-index="${i}"><b>${safeText(a.name||'Untitled arc')}</b><span>${safeText(a.status||'Planned')} · ${(a.phases||[]).length} phases · ${(a.events||[]).length} events</span><small>${safeText(a.description||'Tap to manage phases, events and consequences.')}</small></button></div><div class="record-actions"><button class="mini-action" data-brain-edit="arcs" data-brain-index="${i}">Open</button><button class="mini-action danger-mini" data-brain-delete="arcs" data-brain-index="${i}">Delete</button></div></div>`).join('')||'<div class="mutedbox">No arcs yet.</div>'}</div><button class="secondary" data-brain-add="arcs" style="margin-top:12px">＋ Add arc</button>`;
    }else if(active==='canon'){
      // Canon is a live control center over the existing Brain records. It does not create duplicate canon entries.
      const canonKeys=['characters','locations','factions','events','threads','storyRules','customEntries','secrets','ideas'];
      const canonRows=[];
      canonKeys.forEach(key=>{
        (Array.isArray(b[key])?b[key]:[]).forEach((item,index)=>{
          const baseName=item.name||item.title||item.text||'Untitled';
          const tl=Array.isArray(item.stateTimeline)?item.stateTimeline:[];
          if(tl.length){
            tl.forEach((st,stateIndex)=>canonRows.push({key,index,stateIndex,item,st,name:baseName}));
          }else{
            canonRows.push({key,index,stateIndex:null,item,st:null,name:baseName});
          }
        });
      });
      const stateKind=(r)=>{
        const st=r.st;
        if(!st){
          const mt=String(r.item.memoryType||r.item.canonStatus||'canon').toLowerCase();
          if(mt==='rejected') return 'rejected';
          if(mt==='draft'||mt==='idea') return 'idea';
          if(mt==='future') return 'future';
          if(mt==='current') return 'current';
          return 'established';
        }
        if(String(st.revealStatus||'').toLowerCase()==='hidden' || String(st.revealStatus||'').toLowerCase()==='locked') return 'hidden';
        const t=String(st.timeline||'Past');
        return t==='Future'?'future':t==='Current'?'current':'established';
      };
      const groups={established:[],current:[],future:[],idea:[],rejected:[],hidden:[]};
      canonRows.forEach(r=>groups[stateKind(r)].push(r));
      const keyLabel={characters:'Character',locations:'Location',factions:'Faction',events:'Timeline event',threads:'Open thread',storyRules:'Story rule',customEntries:'Custom entry',secrets:'Secret',ideas:'Idea'};
      const row=(r,section)=>{
        const st=r.st;
        const meta=st?stateMetaHtml(st):`<span class="state-chip past">✓ Established</span><span class="state-chip ai">AI knows</span>`;
        const title=st?(st.label||st.status||st.cultivation||'State'):r.name;
        const detail=st?[st.chapter,st.arc,st.phase].filter(Boolean).join(' · '):brainRecordSummary(r.item,r.key,keyLabel[r.key]||r.key);
        const hidden=st&&String(st.revealStatus||'').toLowerCase()==='hidden';
        return `<div class="state-timeline-row canon-control-row"><button class="canon-main-button" data-canon-open data-overview-open-key="${safeText(r.key)}" data-overview-open-index="${r.index}"><div class="state-timeline-main"><div>${meta}</div><b>${safeText(r.name)} — ${safeText(title)}</b><span>${safeText(keyLabel[r.key]||r.key)}${detail?' · '+safeText(detail):''}</span>${hidden?`<small>🔒 ${safeText(st.knowledgeScope||'Hidden')} ${st.knowledgePeople?'· '+safeText(st.knowledgePeople):''}${st.revealWhen?' · unlock: '+safeText(st.revealWhen):''}</small>`:''}</div></button>${st?`<button class="mini-action canon-state-edit" data-canon-state-edit data-canon-kind="${safeText(r.key)}" data-canon-index="${r.index}" data-canon-state-index="${r.stateIndex}">Edit state</button>`:`<button class="mini-action" data-canon-record-edit data-canon-kind="${safeText(r.key)}" data-canon-index="${r.index}">Edit</button>`}</div>`;
      };
      const section=(title,key,desc)=>`<div class="brain-form-section canon-section"><div class="brain-form-kicker">${title} · ${groups[key].length}</div><p class="field-hint">${desc}</p>${groups[key].slice(0,50).map(r=>row(r,key)).join('')||'<div class="mutedbox">Nothing here yet.</div>'}</div>`;
      const currentPos=b.storyPosition||{};
      const currentArc=b.arcs.find(a=>a.id===currentPos.arcId);
      const currentPhase=currentArc?.phases?.find(p=>p.id===currentPos.phaseId);
      const totalStates=canonRows.filter(r=>r.st).length;
      body=`<div class="overview-hero"><div class="brain-form-kicker">CANON & TRUTH</div><h2>What is true, when, and who can know it.</h2><p>Canon is a view of your existing Brain. Tap any item to inspect it, or edit a specific state. You never create a second copy just for Canon.</p></div>
        <div class="canon-stat-grid"><div><b>${groups.established.length}</b><span>Past / established</span></div><div><b>${groups.current.length}</b><span>Current</span></div><div><b>${groups.future.length}</b><span>Future</span></div><div><b>${groups.hidden.length}</b><span>Hidden</span></div></div>
        <div class="brain-form-section"><div class="brain-form-kicker">CURRENT STORY POSITION</div><div class="state-timeline-row"><div class="state-timeline-main"><b>${safeText(currentArc?.name||'No arc selected')}</b><span>${safeText(currentPhase?.name||currentPos.chapter||'No phase selected')} · ${safeText(currentPos.chapter||'No chapter')}</span><small>${safeText(currentPos.status||'Not started')}</small></div><button class="mini-action" data-brain-view="story">Open position</button></div></div>
        ${section('CURRENT','current','Facts that are true at the current story position. This is what normal generation should treat as the present state.')}
        ${section('PAST / ESTABLISHED','established','Things that happened or were true earlier. They remain canon, but are not automatically current.')}
        ${section('FUTURE','future','Known to Aurora but belonging to a later point. Future information must not be treated as current.')}
        ${section('HIDDEN / LOCKED','hidden','Information may be true while remaining hidden from characters. Knowledge and reveal conditions stay attached to the state.')}
        ${section('IDEAS','idea','Possibilities only. They are not story truth until deliberately promoted.')}
        ${section('REJECTED','rejected','Explicitly rejected alternatives. Aurora should not resurrect them.')}
        <div class="brain-form-section"><div class="brain-form-kicker">HOW CANON WORKS</div><p class="field-hint">${totalStates} state records are currently attached to Brain entities. Canon reads those states instead of replacing your Characters, World, Timeline or other entries.</p></div>`;
    }else if(active==='world'){
      const renderWorld=(key,label,icon)=>`<div class="brain-subsection"><div class="brain-section-head"><div><b>${icon} ${label}</b><span>${(Array.isArray(b[key])?b[key]:[]).length} records</span></div><button class="secondary" data-brain-add="${key}">＋ Add ${label}</button></div>${(Array.isArray(b[key])?b[key]:[]).map((x,i)=>`<div class="brain-record"><div class="record-main"><button class="record-read" data-brain-open-record="${key}" data-brain-index="${i}"><b>${safeText(x.name||label)}</b><span>${safeText(brainRecordSummary(x,key,label)||'No description yet.')}</span><small>Tap to read</small></button></div><div class="record-actions"><button class="mini-action" data-brain-edit="${key}" data-brain-index="${i}">Edit</button><button class="mini-action danger-mini" data-brain-delete="${key}" data-brain-index="${i}">Delete</button></div></div>`).join('')||'<div class="mutedbox">No records yet.</div>'}</div>`; body=renderWorld('locations','Locations','⌖')+renderWorld('factions','Factions','◆');
    }else if(active==='events'||active==='threads'||active==='rules'||active==='custom'){
      const map={events:['events','Timeline event'],threads:['threads','Open thread'],rules:['storyRules','Story rule'],custom:['customEntries','Custom brain entry']}; const [key,label]=map[active]; const arr=b[key]||[]; body=`<div class="brain-section-head"><div><b>${label}s</b><span>${arr.length} records</span></div><button class="secondary" data-brain-add="${key}">＋ Add ${label}</button></div>${arr.map((x,i)=>`<div class="brain-record"><div class="record-main"><button class="record-read" data-brain-open-record="${key}" data-brain-index="${i}"><b>${safeText(x.name||x.title||x.text||label)}</b><span>${safeText(brainRecordSummary(x,key,label)||x.description||'No description')}</span><small>${x.memoryType==='future'?'○ Future':x.revealStatus==='hidden'?'🔒 Hidden':'AI knows'}</small></button></div><div class="record-actions"><button class="mini-action" data-brain-edit="${key}" data-brain-index="${i}">Edit</button><button class="mini-action danger-mini" data-brain-delete="${key}" data-brain-index="${i}">Delete</button></div></div>`).join('')||`<div class="mutedbox">No ${label.toLowerCase()} records yet.</div>`}`;
    }else if(active==='fields'){
      const pack=DEFAULT_FIELD_PACKS.find(x=>x.id===state.brainDefaultPack)||DEFAULT_FIELD_PACKS[0]; body=`<div class="defaults-intro"><b>Build the Brain you actually need.</b><span>Optional reusable fields. Add only what your story needs.</span></div><div class="field-pack-tabs">${DEFAULT_FIELD_PACKS.map(x=>`<button class="field-pack-tab ${state.brainDefaultPack===x.id?'active':''}" data-default-pack="${x.id}"><span>${x.icon}</span><b>${safeText(x.name)}</b></button>`).join('')}</div><div class="field-pack-card"><div class="field-pack-title"><div><span class="builder-kicker">Recommended fields</span><h2>${pack.icon} ${safeText(pack.name)}</h2></div><button class="primary small-primary" data-install-default-pack="${pack.id}">＋ Add all</button></div><p>${safeText(pack.desc)}</p><div class="field-pack-items">${pack.items.map(([key,name,help,type])=>{const exists=brainFieldDefs(b,key).some(fd=>fd.name.toLowerCase()===name.toLowerCase());return `<div class="field-pack-item ${exists?'installed':''}"><div><b>${safeText(name)}</b><span>${safeText(BRAIN_LABELS[key]||key)} · ${type==='textarea'?'Long text':'Short text'}</span><small>${safeText(help)}</small></div><button class="mini-action" data-install-one-field='${safeText(JSON.stringify({key,name,help,type}))}'>${exists?'✓ Added':'Add'}</button></div>`}).join('')}</div></div>`;
    }else body=storyBrainOverview(id);
    return layout(`<div class="page"><div class="backrow"><button class="back" data-action="back">‹ Back</button><span style="color:var(--muted);font-size:12px">Back to ${safeText(item.title)}</span></div><div class="eyebrow">Story Brain 2.1</div><h1>${safeText(item.title)}</h1><p>One place for characters, story structure, canon, knowledge and continuity.</p><div class="brain-tab-viewport"><div class="brain-tabs">${views.map(v=>`<button class="brain-tab ${active===v[0]?'active':''}" data-brain-view="${v[0]}">${v[2]} ${v[1]}</button>`).join('')}</div></div>${body}${brainEditorModal(id)}${characterStateModal(id)}${entityStateModal(id)}${brainReadModal(id)}${brainFieldManager(id)}</div>`,'library');
  }

  // Targeted handlers for the new state/arc controls. They coexist with the legacy handlers.
  document.addEventListener('change',e=>{
    const arcSelect=e.target.closest('[data-story-position-v2="arcId"]');
    if(!arcSelect) return;
    const brain=ensureBrain20(getStoryBrain(state.brainOpenId));
    const arc=brain.arcs.find(a=>a.id===arcSelect.value);
    const phaseSelect=document.querySelector('[data-story-position-v2="phaseId"]');
    if(!phaseSelect) return;
    const phases=arc?.phases||[];
    phaseSelect.innerHTML='<option value="">— Select phase —</option>'+phases.map(p=>`<option value="${safeText(p.id)}">${safeText(p.name)}${p.status==='Completed'?' — Completed':p.status==='Locked'?' — Locked':''}</option>`).join('');
    phaseSelect.value='';
  });


  document.addEventListener('change',e=>{
    const key=e.target.closest('[data-reader-setting]')?.dataset.readerSetting;
    if(key&&state.readerOpenId){const m=ensureManuscript(state.readerOpenId);m.reader[key]=e.target.value;saveManuscriptsSafe();render();return}
  });
  let editorSaveTimer=null;
  document.addEventListener('input',e=>{
    if(e.target.matches('[data-editor-surface]')&&state.editorOpenId){clearTimeout(editorSaveTimer);editorSaveTimer=setTimeout(()=>{editorPersistSurface();renderEditorWordCountOnly()},350)}
  });
  function renderEditorWordCountOnly(){const m=ensureManuscript(state.editorOpenId),st=manuscriptStats(m);document.querySelectorAll('.editor-meta').forEach(el=>el.innerHTML=`<span>${st.words} words</span><span>Autosaves locally</span><span>Scene content is separate from Story Brain</span>`)}
  document.addEventListener('mousedown',e=>{if(e.target.closest('.editor-formatbar button,.editor-formatbar select,.editor-formatbar label'))e.preventDefault()});
  document.addEventListener('input',e=>{
    const f=e.target.closest('[data-nano-field]')?.dataset.nanoField;
    if(!f)return;
    const n=nanoDraft();
    if(f==='maxRequests') n.maxRequests=Math.max(0,Number(e.target.value)||0);
    else if(f==='contextMemory') n.contextMemory=!!e.target.checked;
    else n[f]=e.target.value;
  });
  document.addEventListener('change',e=>{
    const f=e.target.closest('[data-nano-field]')?.dataset.nanoField;
    if(!f)return;
    const n=nanoDraft(); if(f==='contextMemory') n.contextMemory=!!e.target.checked; else if(f==='maxRequests') n.maxRequests=Math.max(0,Number(e.target.value)||0); else n[f]=e.target.value;
  });
  document.addEventListener('click',e=>{
    const nanoConfirm=e.target.closest('[data-nano-confirm]');
    if(nanoConfirm && state.nanoConfirm){const yes=nanoConfirm.dataset.nanoConfirm==='yes';const resolver=state.nanoConfirm.resolve;state.nanoConfirm=null;render();resolver(yes);return}
    if(e.target.closest('[data-nano-toggle-key]')){const input=document.getElementById('nano-api-key');if(input){const show=input.type==='password';input.type=show?'text':'password';e.target.closest('[data-nano-toggle-key]').textContent=show?'Hide':'Show'}return}
    if(e.target.closest('[data-nano-reset-counter]')){const n=nanoDraft();n.requestCount=0;toast('AI request counter reset');render();return}
    if(e.target.closest('[data-nano-disable]')){const n=nanoDraft();n.access=n.access==='off'?'ask':'off';toast(n.access==='off'?'API disabled':'API access enabled in ASK mode');render();return}
    if(e.target.closest('[data-nano-test]')){nanoTestConnection();return}
    if(e.target.closest('[data-nano-oauth]')){nanoStartOAuth();return}
    if(e.target.closest('[data-nano-load-text]')){nanoLoadTextModels();return}
    if(e.target.closest('[data-nano-load-image]')){nanoLoadImageModels();return}
    if(e.target.closest('[data-nano-use-text-manual]')){
      const n=nanoDraft(); const v=String(n.textModelManual||'').trim(); if(!v){toast('Enter a text model ID first');return}
      const match=n.textModels.find(m=>m.id.toLowerCase()===v.toLowerCase() || m.name.toLowerCase()===v.toLowerCase());
      n.textModel=match?match.id:v; n.textModelManual=match?match.id:v; n.modelStatus=match?`Selected ${match.name||match.id}.`:`Using manual text model ID: ${v}`; toast('Text model selected'); render(); return;
    }
    if(e.target.closest('[data-nano-use-image-manual]')){
      const n=nanoDraft(); const v=String(n.imageModelManual||'').trim(); if(!v){toast('Enter an image model ID first');return}
      const match=n.imageModels.find(m=>m.id.toLowerCase()===v.toLowerCase() || m.name.toLowerCase()===v.toLowerCase());
      n.imageModel=match?match.id:v; n.imageModelManual=match?match.id:v; n.imageStatus=match?`Selected ${match.name||match.id}.`:`Using manual image model ID: ${v}`; toast('Image model selected'); render(); return;
    }
  });

  document.addEventListener('click',e=>{
    if(e.target.closest('[data-open-reader]')){const id=e.target.closest('[data-open-reader]').dataset.openReader;state.readerOpenId=id;state.editorOpenId=null;updateLocalStory(id,{lastOpenedAt:Date.now()});renderAndScroll();return}
    if(e.target.closest('[data-open-editor]')){const id=e.target.closest('[data-open-editor]').dataset.openEditor;state.editorOpenId=id;state.readerOpenId=null;ensureManuscript(id);renderAndScroll();return}
    if(e.target.closest('[data-reader-close]')){state.readerOpenId=null;renderAndScroll();return}
    if(e.target.closest('[data-editor-close]')){editorPersistSurface();state.editorOpenId=null;state.editorFindOpen=false;state.editorLinkOpen=false;state.editorRename=null;state.editorDelete=null;renderAndScroll();return}
    if(e.target.closest('[data-open-editor-from-reader]')){const id=e.target.closest('[data-open-editor-from-reader]').dataset.openEditorFromReader;state.readerOpenId=null;state.editorOpenId=id;ensureManuscript(id);renderAndScroll();return}
    if(e.target.closest('[data-open-reader-from-editor]')){editorPersistSurface();const id=e.target.closest('[data-open-reader-from-editor]').dataset.openReaderFromEditor;state.editorOpenId=null;state.readerOpenId=id;renderAndScroll();return}
    if(e.target.closest('[data-reader-toc]')){document.getElementById('reader-settings')?.classList.remove('open');document.getElementById('reader-toc')?.classList.toggle('open');return}
    if(e.target.closest('[data-reader-settings]')){document.getElementById('reader-toc')?.classList.remove('open');document.getElementById('reader-settings')?.classList.toggle('open');return}
    if(e.target.closest('[data-reader-chapter]')){const id=e.target.closest('[data-reader-chapter]').dataset.readerChapter;const m=ensureManuscript(state.readerOpenId);if(m.chapters.some(c=>c.id===id)){state.readerFindOpen=false;state.readerFindQuery='';state.readerFindIndex=-1;state.readerFindCount=0;m.activeChapterId=id;m.activeSceneId=m.chapters.find(c=>c.id===id).scenes[0].id;saveManuscriptsSafe();renderAndScroll()}return}
    if(e.target.closest('[data-reader-prev]')||e.target.closest('[data-reader-next]')){const m=ensureManuscript(state.readerOpenId),i=m.chapters.findIndex(c=>c.id===m.activeChapterId),dir=e.target.closest('[data-reader-prev]')?-1:1,n=i+dir;if(n>=0&&n<m.chapters.length){m.activeChapterId=m.chapters[n].id;m.activeSceneId=m.chapters[n].scenes[0].id;saveManuscriptsSafe();renderAndScroll()}return}
    if(e.target.closest('[data-reader-fullscreen]')){const el=document.querySelector('.reader-shell');if(document.fullscreenElement){document.exitFullscreen?.()}else{el?.requestFullscreen?.().catch(()=>toast('Fullscreen is not available here'))}return}
    if(e.target.closest('[data-reader-bookmark]')){const m=ensureManuscript(state.readerOpenId);const c=m.chapters.find(c=>c.id===m.activeChapterId);const existing=m.bookmarks.find(b=>b.chapterId===c.id);if(existing)m.bookmarks=m.bookmarks.filter(b=>b!==existing);else m.bookmarks.push({id:uid('bm'),chapterId:c.id,label:c.title,createdAt:Date.now()});saveManuscriptsSafe();render();toast(existing?'Bookmark removed':'Chapter bookmarked');return}
    if(e.target.closest('[data-reader-bookmark-jump]')){const b=ensureManuscript(state.readerOpenId).bookmarks.find(x=>x.id===e.target.closest('[data-reader-bookmark-jump]').dataset.readerBookmarkJump);if(b){const m=ensureManuscript(state.readerOpenId);m.activeChapterId=b.chapterId;m.activeSceneId=m.chapters.find(c=>c.id===b.chapterId)?.scenes[0]?.id||'';saveManuscriptsSafe();renderAndScroll()}return}
    if(e.target.closest('[data-reader-find]')){state.readerFindOpen=true;render();return}
    if(e.target.closest('[data-reader-find-close]')){state.readerFindOpen=false;state.readerFindQuery='';state.readerFindIndex=-1;window.getSelection()?.removeAllRanges();render();return}
    if(e.target.closest('[data-reader-find-next]')){const input=document.getElementById('reader-find-input');const q=(input?.value||'').trim();if(!q){toast('Enter text to find');return}const root=document.getElementById('reader-content');if(!root)return;const clearMarks=()=>{root.querySelectorAll('mark.reader-find-match').forEach(mark=>{const parent=mark.parentNode;if(!parent)return;parent.replaceChild(document.createTextNode(mark.textContent||''),mark);parent.normalize();});};
      // Same query: do NOT rescan the document. Cycle the existing highlighted matches.
      if(q===state.readerFindQuery){
        const marks=[...root.querySelectorAll('mark.reader-find-match')];
        if(marks.length){
          marks.forEach(x=>x.classList.remove('current'));
          state.readerFindCount=marks.length;
          state.readerFindIndex=(Number.isFinite(state.readerFindIndex)?state.readerFindIndex:-1)+1;
          state.readerFindIndex=state.readerFindIndex%marks.length;
          const current=marks[state.readerFindIndex];
          current.classList.add('current');
          current.scrollIntoView({behavior:'smooth',block:'center',inline:'nearest'});
          const c=document.getElementById('reader-find-count');if(c)c.textContent=`${state.readerFindIndex+1} / ${marks.length}`;
          return;
        }
      }
      // New query (or no existing matches): remove old marks and build a fresh match list.
      clearMarks();
      state.readerFindQuery=q;state.readerFindIndex=-1;state.readerFindCount=0;
      const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT,{acceptNode:n=>{if(!n.nodeValue||!n.nodeValue.trim())return NodeFilter.FILTER_REJECT;if(n.parentElement?.closest('script,style,mark'))return NodeFilter.FILTER_REJECT;return NodeFilter.FILTER_ACCEPT}});
      const nodes=[];while(walker.nextNode())nodes.push(walker.currentNode);
      const hay=q.toLocaleLowerCase();const matchNodes=[];nodes.forEach(n=>{const text=n.nodeValue||'';const low=text.toLocaleLowerCase();let at=0;while((at=low.indexOf(hay,at))!==-1){matchNodes.push({node:n,start:at,end:at+q.length});at+=Math.max(1,q.length)}});
      if(!matchNodes.length){state.readerFindCount=0;state.readerFindIndex=-1;const c=document.getElementById('reader-find-count');if(c)c.textContent='0 matches';toast('No matches found');return}
      const fragments=new Map();matchNodes.forEach(m=>{if(!fragments.has(m.node))fragments.set(m.node,[]);fragments.get(m.node).push(m)});
      const marks=[];fragments.forEach((items,node)=>{let cursor=0;const frag=document.createDocumentFragment();items.forEach(item=>{if(item.start>cursor)frag.appendChild(document.createTextNode((node.nodeValue||'').slice(cursor,item.start)));const mark=document.createElement('mark');mark.className='reader-find-match';mark.textContent=(node.nodeValue||'').slice(item.start,item.end);frag.appendChild(mark);marks.push(mark);cursor=item.end;});if(cursor<(node.nodeValue||'').length)frag.appendChild(document.createTextNode((node.nodeValue||'').slice(cursor)));node.parentNode?.replaceChild(frag,node);});
      state.readerFindCount=marks.length;state.readerFindIndex=0;const current=marks[0];if(current){current.classList.add('current');current.scrollIntoView({behavior:'smooth',block:'center',inline:'nearest'});}const c=document.getElementById('reader-find-count');if(c)c.textContent=`1 / ${marks.length}`;return}
    if(e.target.closest('[data-editor-rename-scene]')){editorPersistSurface();const m=ensureManuscript(state.editorOpenId),a=getActiveScene(m);state.editorRename={type:'scene',id:a.scene.id,value:a.scene.title};render();return}
    if(e.target.closest('[data-editor-rename-chapter]')){editorPersistSurface();const id=e.target.closest('[data-editor-rename-chapter]').dataset.editorRenameChapter;const m=ensureManuscript(state.editorOpenId),c=m.chapters.find(x=>x.id===id);if(c){state.editorRename={type:'chapter',id,value:c.title};render()}return}
    if(e.target.closest('[data-editor-rename-confirm]')){const name=(document.getElementById('editor-rename-input')?.value||'').trim();if(!name){toast('Give it a name first');return}const m=ensureManuscript(state.editorOpenId),r=state.editorRename;if(r?.type==='chapter'){const c=m.chapters.find(x=>x.id===r.id);if(c)c.title=name}else if(r?.type==='scene'){for(const c of m.chapters){const sc=c.scenes.find(x=>x.id===r.id);if(sc){sc.title=name;break}}}state.editorRename=null;saveManuscriptsSafe();render();return}
    if(e.target.closest('[data-editor-rename-cancel]')){state.editorRename=null;render();return}
    if(e.target.closest('[data-editor-delete-scene]')){editorPersistSurface();const m=ensureManuscript(state.editorOpenId),a=getActiveScene(m);if(a.chapter.scenes.length<=1){toast('A chapter needs at least one scene');return}state.editorDelete={type:'scene',id:a.scene.id};render();return}
    if(e.target.closest('[data-editor-delete-chapter]')){editorPersistSurface();const id=e.target.closest('[data-editor-delete-chapter]').dataset.editorDeleteChapter;if(ensureManuscript(state.editorOpenId).chapters.length<=1){toast('A manuscript needs at least one chapter');return}state.editorDelete={type:'chapter',id};render();return}
    if(state.editorDelete && !e.target.closest('[data-editor-delete-cancel]') && !e.target.closest('[data-editor-delete-confirm]')){return}
    if(e.target.closest('[data-editor-delete-cancel]')){state.editorDelete=null;render();return}
    if(e.target.closest('[data-editor-delete-confirm]')){const m=ensureManuscript(state.editorOpenId),d=state.editorDelete;if(d?.type==='chapter'){const i=m.chapters.findIndex(c=>c.id===d.id);if(i>=0){m.chapters.splice(i,1);m.chapters.forEach((c,j)=>c.order=j+1);const c=m.chapters[Math.max(0,i-1)]||m.chapters[0];m.activeChapterId=c.id;m.activeSceneId=c.scenes[0].id}}else if(d?.type==='scene'){const c=m.chapters.find(c=>c.id===m.activeChapterId);const i=c?.scenes.findIndex(sc=>sc.id===d.id);if(c&&i>=0){c.scenes.splice(i,1);m.activeSceneId=c.scenes[Math.max(0,i-1)].id}}state.editorDelete=null;saveManuscriptsSafe();syncStoryManuscriptMeta(state.editorOpenId);render();toast('Removed');return}
    if(e.target.closest('[data-editor-sidebar]')){document.getElementById('editor-sidebar')?.classList.toggle('collapsed');return}
    if(e.target.closest('[data-editor-chapter]')){editorPersistSurface();const id=e.target.closest('[data-editor-chapter]').dataset.editorChapter;const m=ensureManuscript(state.editorOpenId);m.activeChapterId=id;m.activeSceneId=m.chapters.find(c=>c.id===id).scenes[0].id;saveManuscriptsSafe();render();return}
    if(e.target.closest('[data-editor-scene]')){editorPersistSurface();const id=e.target.closest('[data-editor-scene]').dataset.editorScene;const m=ensureManuscript(state.editorOpenId);const c=m.chapters.find(c=>c.id===m.activeChapterId);if(c?.scenes.some(sc=>sc.id===id)){m.activeSceneId=id;saveManuscriptsSafe();render()}return}
    if(e.target.closest('[data-editor-new-chapter]')){editorPersistSurface();const m=ensureManuscript(state.editorOpenId),c={id:uid('ch'),title:'Chapter '+(m.chapters.length+1),order:m.chapters.length+1,scenes:[{id:uid('sc'),title:'Scene 1',content:'',notes:''}]};m.chapters.push(c);m.activeChapterId=c.id;m.activeSceneId=c.scenes[0].id;saveManuscriptsSafe();syncStoryManuscriptMeta(state.editorOpenId);render();return}
    if(e.target.closest('[data-editor-new-scene]')){editorPersistSurface();const m=ensureManuscript(state.editorOpenId),c=m.chapters.find(c=>c.id===m.activeChapterId);if(c){const sc={id:uid('sc'),title:'Scene '+(c.scenes.length+1),content:'',notes:''};c.scenes.push(sc);m.activeSceneId=sc.id;saveManuscriptsSafe();render()}return}
    if(e.target.closest('[data-editor-save]')){editorPersistSurface();toast('Manuscript saved locally');renderEditorWordCountOnly();return}
    const cmd=e.target.closest('[data-editor-cmd]')?.dataset.editorCmd;if(cmd){document.execCommand(cmd,false,null);document.getElementById('editor-surface')?.focus();editorPersistSurface();return}
    const block=e.target.closest('[data-editor-block]')?.dataset.editorBlock;if(block){document.execCommand('formatBlock',false,block);document.getElementById('editor-surface')?.focus();editorPersistSurface();return}
    const align=e.target.closest('[data-editor-align]')?.dataset.editorAlign;if(align){document.execCommand(align,false,null);document.getElementById('editor-surface')?.focus();editorPersistSurface();return}
    const font=e.target.closest('[data-editor-font]')?.value;if(font){document.execCommand('fontName',false,font);document.getElementById('editor-surface')?.focus();editorPersistSurface();return}
    const size=e.target.closest('[data-editor-size]')?.value;if(size){document.execCommand('fontSize',false,size);document.getElementById('editor-surface')?.focus();editorPersistSurface();return}
    const color=e.target.closest('[data-editor-color]')?.value;if(color){document.execCommand('foreColor',false,color);document.getElementById('editor-surface')?.focus();editorPersistSurface();return}
    const hi=e.target.closest('[data-editor-highlight]')?.value;if(hi){document.execCommand('hiliteColor',false,hi);document.getElementById('editor-surface')?.focus();editorPersistSurface();return}
    if(e.target.closest('[data-editor-link]')){state.editorLinkOpen=true;render();return}
    if(e.target.closest('[data-editor-close-link]')){state.editorLinkOpen=false;render();return}
    if(e.target.closest('[data-editor-apply-link]')){const url=(document.getElementById('editor-link-input')?.value||'').trim();if(!/^https?:\/\//i.test(url)){toast('Use a full http:// or https:// link');return}document.execCommand('createLink',false,url);state.editorLinkOpen=false;editorPersistSurface();render();return}
    if(e.target.closest('[data-editor-image]')){document.getElementById('editor-image-input')?.click();return}
    if(e.target.closest('[data-editor-find]')){state.editorFindOpen=!state.editorFindOpen;render();return}
    if(e.target.closest('[data-editor-find-next]')){const q=(document.getElementById('editor-find-input')?.value||'').trim();if(!q){toast('Enter text to find');return}window.find?.(q);return}
    if(e.target.closest('[data-editor-replace-all]')){const q=(document.getElementById('editor-find-input')?.value||'').trim(),r=(document.getElementById('editor-replace-input')?.value||'');const el=document.getElementById('editor-surface');if(!q||!el)return;const walker=document.createTreeWalker(el,NodeFilter.SHOW_TEXT);const nodes=[];while(walker.nextNode())nodes.push(walker.currentNode);let count=0;nodes.forEach(n=>{if(n.nodeValue.includes(q)){const parts=n.nodeValue.split(q);count+=parts.length-1;n.nodeValue=parts.join(r)}});editorPersistSurface();render();toast(`${count} replacement${count===1?'':'s'} made`);return}
  });

  function updateReaderProgress(){if(!state.readerOpenId)return;const el=document.getElementById('reader-content'),bar=document.querySelector('#reader-progress span');if(!el||!bar)return;const shell=document.querySelector('.reader-shell');const scroller=(shell&&document.fullscreenElement===shell)?shell:document.documentElement;const scrollTop=(shell&&document.fullscreenElement===shell)?shell.scrollTop:window.scrollY;const viewportH=(shell&&document.fullscreenElement===shell)?shell.clientHeight:window.innerHeight;const max=Math.max(1,scroller.scrollHeight-viewportH);const pct=Math.max(0,Math.min(100,(scrollTop/max)*100));bar.style.width=pct+'%';const m=ensureManuscript(state.readerOpenId);m.readerProgress=m.readerProgress||{};m.readerProgress[m.activeChapterId]=pct;saveManuscriptsSafe()}
document.addEventListener('scroll',updateReaderProgress,{passive:true});
document.addEventListener('fullscreenchange',()=>{const shell=document.querySelector('.reader-shell');const active=document.fullscreenElement===shell;document.body.classList.toggle('reader-fullscreen-active',active);if(shell){shell.removeEventListener('scroll',updateReaderProgress);if(active)shell.addEventListener('scroll',updateReaderProgress,{passive:true});}updateReaderProgress()},{passive:true});
  document.addEventListener('change',e=>{
    if(e.target.matches('[data-editor-font]')){document.execCommand('fontName',false,e.target.value);document.getElementById('editor-surface')?.focus();editorPersistSurface();return}
    if(e.target.matches('[data-editor-size]')){document.execCommand('fontSize',false,e.target.value);document.getElementById('editor-surface')?.focus();editorPersistSurface();return}
    if(e.target.matches('[data-editor-color]')){document.execCommand('foreColor',false,e.target.value);document.getElementById('editor-surface')?.focus();editorPersistSurface();return}
    if(e.target.matches('[data-editor-highlight]')){document.execCommand('hiliteColor',false,e.target.value);document.getElementById('editor-surface')?.focus();editorPersistSurface();return}
  });
  document.addEventListener('change',e=>{
    if(e.target.id==='editor-image-input'&&e.target.files?.[0]&&state.editorOpenId){const file=e.target.files[0];const reader=new FileReader();reader.onload=()=>{const el=document.getElementById('editor-surface');el?.focus();document.execCommand('insertImage',false,String(reader.result));editorPersistSurface();render()};reader.readAsDataURL(file);}
  });
  document.addEventListener('click',e=>{
    const entityStateCancel=e.target.closest('[data-entity-state-cancel]') || e.target.matches('[data-entity-state-modal-backdrop]');
    if(entityStateCancel){state.brainEntityStateInput=null;render();return;}
    const entityStateAdd=e.target.closest('[data-entity-state-add]');
    if(entityStateAdd){state.brainEntityStateInput={kind:entityStateAdd.dataset.entityKind,index:Number(entityStateAdd.dataset.entityIndex),stateIndex:null};render();return;}
    const entityStateEdit=e.target.closest('[data-entity-state-edit]');
    if(entityStateEdit){state.brainEntityStateInput={kind:entityStateEdit.dataset.entityKind,index:Number(entityStateEdit.dataset.entityIndex),stateIndex:Number(entityStateEdit.dataset.stateIndex)};render();return;}
    const entityStateDelete=e.target.closest('[data-entity-state-delete]');
    if(entityStateDelete){const b=ensureBrain20(getStoryBrain(state.brainOpenId));const arr=Array.isArray(b[entityStateDelete.dataset.entityKind])?b[entityStateDelete.dataset.entityKind]:[];const rec=arr[Number(entityStateDelete.dataset.entityIndex)];const idx=Number(entityStateDelete.dataset.stateIndex);if(rec?.stateTimeline?.[idx]){rec.stateTimeline.splice(idx,1);if(!rec.stateTimeline.some(x=>x.timeline==='Current')&&rec.stateTimeline.length){rec.stateTimeline[rec.stateTimeline.length-1].timeline='Current';}saveStoryBrain(state.brainOpenId,b);render();toast('State removed');}return;}
    const entityStateSave=e.target.closest('[data-entity-state-save]');
    if(entityStateSave){const si=state.brainEntityStateInput,b=ensureBrain20(getStoryBrain(state.brainOpenId));const arr=Array.isArray(b[si.kind])?b[si.kind]:[];const rec=arr[si.index];if(!rec){toast('Entry not found');return;}rec.stateTimeline=Array.isArray(rec.stateTimeline)?rec.stateTimeline:[];const old=si.stateIndex!=null?(rec.stateTimeline[si.stateIndex]||{}):{};const st={...old,id:old.id||'state_'+Date.now().toString(36)+'_'+Math.random().toString(36).slice(2,6)};document.querySelectorAll('[data-entity-state-field]').forEach(el=>st[el.dataset.entityStateField]=el.value.trim());if(!st.label)st.label=st.status||'State';if(st.timeline==='Current'){rec.stateTimeline.forEach((x,i)=>{if(i!==si.stateIndex&&x.timeline==='Current')x.timeline='Past';});}if(si.stateIndex!=null)rec.stateTimeline[si.stateIndex]=st;else rec.stateTimeline.push(st);saveStoryBrain(state.brainOpenId,b);state.brainEntityStateInput=null;render();toast(si.stateIndex!=null?'State updated':'State added');return;}
    const stateCancelBtn=e.target.closest('[data-state-modal-cancel]');
    const stateBackdrop=e.target.closest('[data-state-modal-backdrop]');
    const stateCancel=stateCancelBtn || (stateBackdrop && e.target===stateBackdrop);
    if(stateCancel){state.brainStateInput=null;render();return;}
    const stateAdd=e.target.closest('[data-state-add-v2]');
    if(stateAdd){state.brainStateInput={characterIndex:Number(stateAdd.dataset.characterIndex),stateIndex:null};render();return;}
    const stateEdit=e.target.closest('[data-state-edit-v2]');
    if(stateEdit){state.brainStateInput={characterIndex:Number(stateEdit.dataset.characterIndex),stateIndex:Number(stateEdit.dataset.stateIndex)};render();return;}
    const stateDelete=e.target.closest('[data-state-delete-v2]');
    if(stateDelete){const b=ensureBrain20(getStoryBrain(state.brainOpenId));const ch=b.characters[Number(stateDelete.dataset.characterIndex)];const idx=Number(stateDelete.dataset.stateIndex);if(ch?.stateTimeline?.[idx]){ch.stateTimeline.splice(idx,1);if(!ch.stateTimeline.some(x=>x.timeline==='Current')&&ch.stateTimeline.length){ch.stateTimeline[ch.stateTimeline.length-1].timeline='Current';}saveStoryBrain(state.brainOpenId,b);render();toast('State removed');}return;}
    const stateSave=e.target.closest('[data-state-save-v2]');
    if(stateSave){const b=ensureBrain20(getStoryBrain(state.brainOpenId));const si=state.brainStateInput;const ch=b.characters[si.characterIndex];if(!ch){toast('Character not found');return;}const st={id:si.stateIndex!=null?(ch.stateTimeline[si.stateIndex]?.id||'state_'+Date.now().toString(36)):'state_'+Date.now().toString(36)+'_'+Math.random().toString(36).slice(2,6)};document.querySelectorAll('[data-state-v2]').forEach(el=>st[el.dataset.stateV2]=el.value.trim());if(!st.label)st.label=st.cultivation||'State';if(st.timeline==='Current'){ch.stateTimeline.forEach((x,i)=>{if(i!==si.stateIndex&&x.timeline==='Current')x.timeline='Past';});}if(si.stateIndex!=null)ch.stateTimeline[si.stateIndex]={...ch.stateTimeline[si.stateIndex],...st};else ch.stateTimeline.push(st);ch.currentStateData={};const cur=ch.stateTimeline.find(x=>x.timeline==='Current');if(cur){ch.currentStateData={cultivation:cur.cultivation||'',location:cur.location||'',condition:cur.condition||'',goal:cur.goal||'',notes:cur.notes||''};ch.currentState=cur.label||cur.cultivation||'Current state';}ch.stateHistory=ch.stateTimeline.filter(x=>x.timeline==='Past').map(x=>({...x}));saveStoryBrain(state.brainOpenId,b);state.brainStateInput=null;render();toast(si.stateIndex!=null?'State updated':'State added');return;}
    const phaseAdd=e.target.closest('[data-phase-add-v2]');
    if(phaseAdd){const b=ensureBrain20(getStoryBrain(state.brainOpenId)),bi=state.brainInput,arc=b.arcs[bi.index],name=document.getElementById('new-phase-name-v2')?.value.trim();if(!arc||!name){toast('Give the phase a name first');return;}arc.phases.push({id:'phase_'+Date.now().toString(36),name,status:document.getElementById('new-phase-status-v2')?.value||'Locked',description:document.getElementById('new-phase-description-v2')?.value.trim()||''});saveStoryBrain(state.brainOpenId,b);render();return;}
    const phaseStatus=e.target.closest('[data-phase-status-v2]');
    if(phaseStatus){const b=ensureBrain20(getStoryBrain(state.brainOpenId)),bi=state.brainInput,ph=b.arcs[bi.index]?.phases?.[Number(phaseStatus.dataset.phaseIndex)];if(ph){ph.status=ph.status==='Locked'?'Available':ph.status==='Available'?'Completed':'Available';saveStoryBrain(state.brainOpenId,b);render();}return;}
    const phaseDelete=e.target.closest('[data-phase-delete-v2]');
    if(phaseDelete){const b=ensureBrain20(getStoryBrain(state.brainOpenId)),bi=state.brainInput,arc=b.arcs[bi.index];if(arc){arc.phases.splice(Number(phaseDelete.dataset.phaseIndex),1);if(b.storyPosition.phaseId===arc.phases[Number(phaseDelete.dataset.phaseIndex)]?.id)b.storyPosition.phaseId='';saveStoryBrain(state.brainOpenId,b);render();}return;}
    const eventAdd=e.target.closest('[data-event-add-v2]');
    if(eventAdd){const b=ensureBrain20(getStoryBrain(state.brainOpenId)),bi=state.brainInput,arc=b.arcs[bi.index],name=document.getElementById('new-event-name-v2')?.value.trim();if(!arc||!name){toast('Give the event a name first');return;}arc.events.push({id:'event_'+Date.now().toString(36),name,state:document.getElementById('new-event-state-v2')?.value||'Future',description:document.getElementById('new-event-description-v2')?.value.trim()||''});saveStoryBrain(state.brainOpenId,b);render();return;}
    const eventState=e.target.closest('[data-event-state-v2]');
    if(eventState){const b=ensureBrain20(getStoryBrain(state.brainOpenId)),bi=state.brainInput,ev=b.arcs[bi.index]?.events?.[Number(eventState.dataset.eventIndex)];if(ev){ev.state=ev.state==='Future'?'Current':ev.state==='Current'?'Completed':'Future';saveStoryBrain(state.brainOpenId,b);render();}return;}
    const eventDelete=e.target.closest('[data-event-delete-v2]');
    if(eventDelete){const b=ensureBrain20(getStoryBrain(state.brainOpenId)),bi=state.brainInput,arc=b.arcs[bi.index];if(arc){arc.events.splice(Number(eventDelete.dataset.eventIndex),1);saveStoryBrain(state.brainOpenId,b);render();}return;}
    const posSave=e.target.closest('[data-save-story-position-v2]');
    if(posSave){const b=ensureBrain20(getStoryBrain(state.brainOpenId));b.storyPosition=b.storyPosition||{};const next={...b.storyPosition};document.querySelectorAll('[data-story-position-v2]').forEach(el=>next[el.dataset.storyPositionV2]=el.value.trim());const arc=b.arcs.find(a=>a.id===next.arcId);if(next.arcId && !arc){toast('Choose a valid arc');return;}if(next.phaseId && (!arc || !(arc.phases||[]).some(p=>p.id===next.phaseId))){next.phaseId='';}b.storyPosition=next;saveStoryBrain(state.brainOpenId,b);render();toast('Current story position saved');return;}
  });
  // Canon control-center handlers. These are deliberately late so they win over legacy Brain handlers.
  document.addEventListener('click',e=>{
    const canonStateEdit=e.target.closest('[data-canon-state-edit]');
    if(canonStateEdit){
      const kind=canonStateEdit.dataset.canonKind, index=Number(canonStateEdit.dataset.canonIndex), stateIndex=Number(canonStateEdit.dataset.canonStateIndex);
      if(kind==='characters') state.brainStateInput={characterIndex:index,stateIndex};
      else state.brainEntityStateInput={kind,index,stateIndex};
      render(); return;
    }
    const canonRecordEdit=e.target.closest('[data-canon-record-edit]');
    if(canonRecordEdit){ state.brainInput={kind:canonRecordEdit.dataset.canonKind,mode:'edit',index:Number(canonRecordEdit.dataset.canonIndex)}; state.brainRead=null; render(); return; }
    const canonOpen=e.target.closest('[data-canon-open]');
    if(canonOpen){ state.brainRead={key:canonOpen.dataset.overviewOpenKey,index:Number(canonOpen.dataset.overviewOpenIndex)}; render(); return; }
  });

  function render(){
    try{
      applyTheme(effectiveSettings());
      let view=state.route==='home'?home():state.route==='library'?library():state.route==='create'?create():more();
      cleanupBrainOverlays();
      document.getElementById('app').innerHTML=view;
      if(state.nanoConfirm){
        const c=document.createElement('div'); c.className='nano-confirm-backdrop'; c.innerHTML=`<section class="nano-confirm" role="dialog" aria-modal="true"><div class="eyebrow">Remote AI request</div><h2>Allow ${safeText(state.nanoConfirm.kind)}?</h2><p>This request will be sent to NanoGPT using your saved API key.</p><div class="nano-status">Model: ${safeText(state.nanoConfirm.details)}</div><div class="actions" style="margin-top:14px"><button class="secondary" data-nano-confirm="no">Cancel</button><button class="primary" data-nano-confirm="yes">Allow request</button></div></section>`; document.body.appendChild(c);
      }
      if(state.brainView==='canon'){
        const seen=new Set();
        document.querySelectorAll('.canon-section').forEach(sec=>{
          const k=String(sec.querySelector('.brain-form-kicker')?.textContent||'').replace(/\s+/g,' ').trim().toUpperCase();
          if(k.startsWith('HIDDEN / LOCKED')){ if(seen.has('hidden')) sec.remove(); else seen.add('hidden'); }
        });
      }
      document.body.classList.toggle('brain-modal-open',!!(state.brainInput||state.brainRead||state.brainEntityStateInput));
      renderLibraryModal();
    }catch(err){
      console.error('Aurora render error',err);
      state.libraryOpenId=null;
      state.brainOpenId=null;
      state.brainInput=null;
      state.brainEntityStateInput=null;
      state.route='library';
      try{
        document.getElementById('app').innerHTML=`<div class="page"><div class="eyebrow">Recovery</div><h1>Aurora recovered.</h1><p>Aurora stopped a Story Brain error instead of locking the app. The technical error is shown below so it can be fixed precisely.</p><details style="margin:18px 0"><summary>Technical error</summary><pre style="white-space:pre-wrap;margin-top:10px;font-size:12px;color:var(--muted)">${safeText(err?.stack||err?.message||String(err))}</pre></details><button class="primary" data-route="library">Return to Library</button></div>`;
        applyTheme(effectiveSettings());
      }catch(e){}
    }
  }
  function toast(msg){
    const el=document.getElementById('toast');el.textContent=msg;el.classList.add('show');clearTimeout(window.__toast);window.__toast=setTimeout(()=>el.classList.remove('show'),2200);
  }
  function openHelp(){
    const back=document.createElement('div');back.className='modalback';back.innerHTML=`<section class="sheet" role="dialog" aria-modal="true"><div class="sheethead"><h2>How Aurora works</h2><button class="close" data-close>×</button></div>
      <p><b>Home</b> is your starting point.</p><p style="margin-top:9px"><b>Library</b> will hold your saved novels and comics.</p><p style="margin-top:9px"><b>Create</b> will eventually turn a simple idea into a complete story foundation.</p><p style="margin-top:9px"><b>More</b> contains settings and advanced tools.</p>
      <div class="tip"><b>Phase 3 rule</b><br>We are testing navigation and visual behavior first. AI systems are deliberately not connected yet.</div></section>`;
    document.body.appendChild(back);
  }
  document.addEventListener('input',e=>{if(e.target.id==='library-search'){state.libraryQuery=e.target.value;const pos=e.target.selectionStart;render();const x=document.getElementById('library-search');if(x){x.focus();x.setSelectionRange(pos,pos)}}});
  document.addEventListener('change',e=>{
    if(e.target.id==='library-sort'){
      state.librarySort=e.target.value;
      render();
      const label=e.target.options[e.target.selectedIndex]?.textContent||'Sorted';
      toast(label);
    }
  });
  document.addEventListener('input',e=>{
    if(e.target.id==='concept-idea'){
      state.conceptDraft.idea=e.target.value;
      const count=document.querySelector('.builder-count');
      if(count) count.textContent=`${e.target.value.length}/2000`;
    }
    if(e.target.id==='custom-style' || e.target.id==='custom-direction') state.conceptDraft.customStyle=e.target.value;
    if(e.target.id==='custom-style-name') state.conceptDraft.customStyleName=e.target.value;
    if(e.target.id==='custom-style-sample') state.conceptDraft.customStyleSample=e.target.value;
    if(e.target.id==='concept-title') state.conceptDraft.projectTitle=e.target.value;
  });

  document.addEventListener('click',e=>{
    if(e.target.closest('[data-brain-modal-cancel]') || (e.target.matches('[data-brain-modal-backdrop]'))){
      state.brainInput=null;render();return;
    }
    if(e.target.closest('[data-brain-modal-save]')){
      const brain=getStoryBrain(state.brainOpenId);
      const bi=state.brainInput;
      const modal=e.target.closest('.brain-editor-modal');
      const values={};
      modal?.querySelectorAll('[data-brain-field]').forEach(el=>values[el.dataset.brainField]=el.value.trim());
      values.customFields={};
      modal?.querySelectorAll('[data-custom-field]').forEach(el=>values.customFields[el.dataset.customField]=el.value.trim());
      values.active=true;
      values.protectedFact=!!modal?.querySelector('[data-memory-protect]')?.checked;
      if(bi.kind==='characters'){
        const existing=(bi.mode==='edit' && brain.characters[bi.index]) ? brain.characters[bi.index] : {};
        values.currentStateData=existing.currentStateData||{};
        values.stateHistory=Array.isArray(existing.stateHistory)?existing.stateHistory:[];
        values.currentState=Object.values(values.currentStateData).filter(Boolean).join(' · ');
      }
      if(bi.kind==='storyRules' && !values.text){toast('Write the rule first');return}
      if(bi.kind!=='storyRules' && !values.name){toast('Give the entry a name first');return}
      const arr=brain[bi.kind]=Array.isArray(brain[bi.kind])?brain[bi.kind]:[];
      if(bi.mode==='edit' && arr[bi.index]){
        const oldNested={phases:arr[bi.index].phases,events:arr[bi.index].events,consequences:arr[bi.index].consequences,stateHistory:arr[bi.index].stateHistory,stateTimeline:arr[bi.index].stateTimeline,currentStateData:arr[bi.index].currentStateData};
        Object.assign(arr[bi.index],values);
        Object.keys(oldNested).forEach(k=>{if(oldNested[k]!==undefined)arr[bi.index][k]=oldNested[k]});
      } else {
        if(bi.kind==='arcs') Object.assign(values,{id:'arc_'+Date.now().toString(36),phases:[],events:[],consequences:[],status:values.status||'Planned'});
        arr.push(values);
      }
      saveStoryBrain(state.brainOpenId,brain);
      state.brainInput=null;
      render();
      toast(bi.mode==='edit'?'Story Brain changes saved':'Added to Story Brain');
      return;
    }

    const openBrain=e.target.closest('[data-open-brain]')?.dataset.openBrain;
    if(openBrain){
      state.brainInput=null;
      state.brainRead=null;
      state.brainOpenId=openBrain;
      state.brainView='overview';
      renderAndScroll();
      return;
    }
    const brainView=e.target.closest('[data-brain-view]')?.dataset.brainView;
    if(brainView){
      state.brainView=brainView;
      render();
      return;
    }
    const defaultPack=e.target.closest('[data-default-pack]')?.dataset.defaultPack;
    if(defaultPack){state.brainDefaultPack=defaultPack;render();return}
    const savePos=e.target.closest('[data-save-story-position]');
    if(savePos){const brain=getStoryBrain(state.brainOpenId);brain.storyPosition=brain.storyPosition||{};document.querySelectorAll('[data-story-position]').forEach(el=>brain.storyPosition[el.dataset.storyPosition]=el.value.trim());saveStoryBrain(state.brainOpenId,brain);render();toast('Story position saved');return}
    const addArc=e.target.closest('[data-add-arc]');
    if(addArc){const name=document.getElementById('new-arc-name')?.value.trim();if(!name){toast('Give the arc a name first');return}const brain=getStoryBrain(state.brainOpenId);brain.arcs=Array.isArray(brain.arcs)?brain.arcs:[];brain.arcs.push({id:'arc_'+Date.now().toString(36),name,status:document.getElementById('new-arc-status')?.value||'Planned',description:document.getElementById('new-arc-description')?.value.trim()||'',createdAt:Date.now(),updatedAt:Date.now()});saveStoryBrain(state.brainOpenId,brain);render();toast('Arc added');return}

    const installPack=e.target.closest('[data-install-default-pack]')?.dataset.installDefaultPack;
    if(installPack){const brain=getStoryBrain(state.brainOpenId);const n=addDefaultPack(brain,installPack);saveStoryBrain(state.brainOpenId,brain);render();toast(n?`Added ${n} fields`:'All fields already added');return}
    const installOne=e.target.closest('[data-install-one-field]')?.dataset.installOneField;
    if(installOne){try{const f=JSON.parse(installOne),brain=getStoryBrain(state.brainOpenId);brain.fieldDefs[f.key]=Array.isArray(brain.fieldDefs[f.key])?brain.fieldDefs[f.key]:[];if(!brain.fieldDefs[f.key].some(fd=>fd.name.toLowerCase()===f.name.toLowerCase()))brain.fieldDefs[f.key].push({id:fieldDefId(f.name),name:f.name,type:f.type,placeholder:'',help:f.help,required:false});saveStoryBrain(state.brainOpenId,brain);render();toast('Field added')}catch(err){toast('Could not add field')}return}
    const defaultKey=e.target.closest('[data-defaults-key]')?.dataset.defaultsKey;
    if(defaultKey){state.brainFieldDelete=null;state.brainFieldManager={key:defaultKey};render();return}
    if(e.target.closest('[data-field-manager-close]') || e.target.matches('[data-field-manager-backdrop]')){state.brainFieldManager=null;render();return}
    const deleteFieldId=e.target.closest('[data-delete-field-def]')?.dataset.deleteFieldDef;
    if(deleteFieldId && state.brainFieldManager){
      state.brainFieldDelete={key:state.brainFieldManager.key,id:deleteFieldId};
      render();
      return;
    }
    if(e.target.closest('[data-cancel-field-delete]') || e.target.matches('[data-field-delete-backdrop]')){
      state.brainFieldDelete=null;render();return;
    }
    if(e.target.closest('[data-confirm-field-delete]')){
      const pending=state.brainFieldDelete,brain=getStoryBrain(state.brainOpenId);
      if(pending){brain.fieldDefs[pending.key]=(brain.fieldDefs[pending.key]||[]).filter(x=>x.id!==pending.id);saveStoryBrain(state.brainOpenId,brain);toast('Field removed');}
      state.brainFieldDelete=null;render();return;
    }
    if(e.target.closest('[data-add-field-def]') && state.brainFieldManager){
      const brain=getStoryBrain(state.brainOpenId),key=state.brainFieldManager.key;
      const name=(document.getElementById('new-field-name')?.value||'').trim();
      const type=document.getElementById('new-field-type')?.value||'text';
      const placeholder=(document.getElementById('new-field-placeholder')?.value||'').trim();
      const help=(document.getElementById('new-field-help')?.value||'').trim();
      const required=!!document.getElementById('new-field-required')?.checked;
      if(!name){toast('Give the field a name first');return}
      if(brainFieldDefs(brain,key).some(fd=>fd.name.toLowerCase()===name.toLowerCase())){toast('That field already exists');return}
      brain.fieldDefs[key].push({id:'field_'+Date.now().toString(36)+'_'+Math.random().toString(36).slice(2,7),name,type,placeholder,help,required});
      saveStoryBrain(state.brainOpenId,brain);render();toast('Field added');return;
    }

    const overviewOpen=e.target.closest('[data-overview-open-key]');
    if(overviewOpen){
      state.brainRead={key:overviewOpen.dataset.overviewOpenKey,index:Number(overviewOpen.dataset.overviewOpenIndex)};
      render(); return;
    }

    const saveStateBtn=e.target.closest('[data-save-character-state]');
    if(saveStateBtn){
      const brain=ensureBrain20(getStoryBrain(state.brainOpenId));
      const idx=Number(saveStateBtn.dataset.characterIndex);
      const ch=brain.characters[idx];
      if(!ch){toast('Character not found');return}
      const stateData={};
      document.querySelectorAll('[data-state-field]').forEach(el=>stateData[el.dataset.stateField]=el.value.trim());
      const has=Object.values(stateData).some(Boolean);
      if(!has){toast('Add at least one current-state value');return}
      if(!Array.isArray(ch.stateHistory)) ch.stateHistory=[];
      const pos=brain.storyPosition||{};
      ch.stateHistory.push({chapter:pos.chapter||'Current position',arcId:pos.arcId||'',phaseId:pos.phaseId||'',...ch.currentStateData});
      ch.currentStateData=stateData;
      ch.currentState=Object.values(stateData).filter(Boolean).join(' · ');
      saveStoryBrain(state.brainOpenId,brain);
      state.brainInput=null; render(); toast('Current state updated — previous state kept in history'); return;
    }

    const addPhase=e.target.closest('[data-add-phase]');
    if(addPhase){
      const bi=state.brainInput, brain=ensureBrain20(getStoryBrain(state.brainOpenId));
      const arc=brain.arcs[bi.index];
      const name=document.getElementById('new-phase-name')?.value.trim();
      if(!arc||!name){toast('Give the phase a name first');return}
      arc.phases=Array.isArray(arc.phases)?arc.phases:[];
      arc.phases.push({id:'phase_'+Date.now().toString(36),name,status:document.getElementById('new-phase-status')?.value||'Locked',description:''});
      saveStoryBrain(state.brainOpenId,brain); render(); return;
    }

    const addArcEvent=e.target.closest('[data-add-arc-event]');
    if(addArcEvent){
      const bi=state.brainInput, brain=ensureBrain20(getStoryBrain(state.brainOpenId));
      const arc=brain.arcs[bi.index];
      const name=document.getElementById('new-event-name')?.value.trim();
      if(!arc||!name){toast('Give the event a name first');return}
      arc.events=Array.isArray(arc.events)?arc.events:[];
      arc.events.push({id:'event_'+Date.now().toString(36),name,state:document.getElementById('new-event-state')?.value||'Future',description:document.getElementById('new-event-description')?.value.trim()||''});
      saveStoryBrain(state.brainOpenId,brain); render(); return;
    }

    const brainAdd=e.target.closest('[data-brain-add]')?.dataset.brainAdd;
    if(brainAdd){
      state.brainRead=null;
      state.brainRead=null;
      state.brainInput={kind:brainAdd,mode:'add',index:null};
      render();
      return;
    }
    const brainReadClose=e.target.closest('[data-brain-read-close]') || e.target.closest('[data-brain-read-backdrop]');
    if(brainReadClose){
      state.brainRead=null;
      render();
      return;
    }
    const brainReadEdit=e.target.closest('[data-brain-read-edit]');
    if(brainReadEdit){
      state.brainRead=null;
      state.brainInput={kind:brainReadEdit.dataset.brainKind,mode:'edit',index:Number(brainReadEdit.dataset.brainIndex)};
      render();
      return;
    }
    const brainEdit=e.target.closest('[data-brain-edit]');
    if(brainEdit){
      state.brainRead=null;
      state.brainInput={kind:brainEdit.dataset.brainEdit,mode:'edit',index:Number(brainEdit.dataset.brainIndex)};
      render();
      return;
    }
    const brainDeleteButton=e.target.closest('[data-brain-delete]');
    if(brainDeleteButton){
      state.brainDelete={key:brainDeleteButton.dataset.brainDelete,index:Number(brainDeleteButton.dataset.brainIndex)};
      render();
      return;
    }
    if(e.target.closest('[data-cancel-brain-delete]') || e.target.matches('[data-brain-delete-backdrop]')){
      state.brainDelete=null;
      render();
      return;
    }
    if(e.target.closest('[data-confirm-brain-delete]')){
      const pending=state.brainDelete,brain=getStoryBrain(state.brainOpenId);
      if(pending && Array.isArray(brain[pending.key]) && brain[pending.key][pending.index]){
        brain[pending.key].splice(pending.index,1);
        saveStoryBrain(state.brainOpenId,brain);
        toast('Story Brain record removed');
      }
      state.brainDelete=null;
      render();
      return;
    }
    const brainOpenRecord=e.target.closest('[data-brain-open-record]');
    if(brainOpenRecord){
      state.brainRead={kind:brainOpenRecord.dataset.brainOpenRecord,index:Number(brainOpenRecord.dataset.brainIndex)};
      render();
      return;
    }
    const brainToggle=e.target.closest('[data-brain-toggle-active]');
    if(brainToggle){
      const key=brainToggle.dataset.brainToggleActive, index=Number(brainToggle.dataset.brainIndex);
      const brain=getStoryBrain(state.brainOpenId);
      if(Array.isArray(brain[key]) && brain[key][index]){
        brain[key][index].active=brain[key][index].active===false;
        saveStoryBrain(state.brainOpenId,brain);
        render();
        return;
      }
    }
    const bulkKey=e.target.closest('[data-brain-activate-all]')?.dataset.brainActivateAll;
    if(bulkKey){
      const brain=getStoryBrain(state.brainOpenId);
      (Array.isArray(brain[bulkKey])?brain[bulkKey]:[]).forEach(x=>x.active=true);
      saveStoryBrain(state.brainOpenId,brain); render(); return;
    }
    const bulkOffKey=e.target.closest('[data-brain-deactivate-all]')?.dataset.brainDeactivateAll;
    if(bulkOffKey){
      const brain=getStoryBrain(state.brainOpenId);
      (Array.isArray(brain[bulkOffKey])?brain[bulkOffKey]:[]).forEach(x=>x.active=false);
      saveStoryBrain(state.brainOpenId,brain); render(); return;
    }

    const addTagStory=e.target.closest('[data-add-tag]')?.dataset.addTag;
    if(addTagStory){
      const input=document.getElementById('story-tag-input');
      const value=normalizeTag(input?.value);
      if(!value){toast('Enter a tag first');return}
      addStoryTag(addTagStory,value);
      render();
      return;
    }
    const removeTagStory=e.target.closest('[data-remove-tag]')?.dataset.removeTag;
    const removeTag=e.target.closest('[data-remove-tag]')?.dataset.tag;
    if(removeTagStory && removeTag){
      removeStoryTag(removeTagStory,removeTag);
      render();
      return;
    }
    const tagFilter=e.target.closest('[data-tag-filter]')?.dataset.tagFilter;
    if(tagFilter){
      const current=Array.isArray(state.libraryTagFilters)?state.libraryTagFilters:[];
      const ix=current.findIndex(x=>x.toLowerCase()===tagFilter.toLowerCase());
      if(ix>=0) current.splice(ix,1); else current.push(tagFilter);
      state.libraryTagFilters=current;
      render();
      return;
    }
    const tagMode=e.target.closest('[data-tag-mode]')?.dataset.tagMode;
    if(tagMode){
      state.libraryTagMode=tagMode==='any'?'any':'all';
      render();
      return;
    }
    if(e.target.closest('[data-clear-tag-filters]')){
      state.libraryTagFilters=[];
      render();
      return;
    }

    if(e.target.closest('[data-new-custom-style]')){
      state.conceptDraft.style='custom';
      state.conceptDraft.customStyleName='';
      state.conceptDraft.customStyle='';
      state.conceptDraft.customStyleSample='';
      toast('New custom style started');
      render();
      return;
    }
    const editStyleId=e.target.closest('[data-edit-style]')?.dataset.editStyle;
    if(editStyleId){
      const p=state.savedStyles.find(x=>x.id===editStyleId);
      if(!p)return;
      state.conceptDraft.style=p.id;
      state.conceptDraft.customStyleName=p.name;
      state.conceptDraft.customStyle=p.definition;
      state.conceptDraft.customStyleSample=p.sample||'';
      toast('Editing '+p.name);
      render();
      return;
    }
    if(e.target.closest('[data-cancel-style-delete]') || e.target.closest('[data-style-delete-backdrop]') && !e.target.closest('.confirm-modal')){
      state.styleDeleteConfirmId=null;
      render();
      return;
    }
    const confirmDeleteId=e.target.closest('[data-confirm-style-delete]')?.dataset.confirmStyleDelete;
    if(confirmDeleteId){
      deleteSavedStyle(confirmDeleteId);
      state.styleDeleteConfirmId=null;
      return;
    }

    const savedStyleId=e.target.closest('[data-saved-style]')?.dataset.savedStyle;
    if(savedStyleId){applySavedStyle(savedStyleId);return}
    const deleteStyleId=e.target.closest('[data-delete-style]')?.dataset.deleteStyle;
    if(deleteStyleId){
      askDeleteSavedStyle(deleteStyleId);
      return;
    }
    if(e.target.closest('[data-style-use-temp]')){
      const d=state.conceptDraft;
      const name=(d.customStyleName||'').trim();
      const definition=(d.customStyle||'').trim();
      if(!name){toast('Give your style a name first');return}
      if(!definition){toast('Describe the style first');return}
      d.style='custom';
      toast('Style will be used for this story only');
      return;
    }
    if(e.target.closest('[data-style-save]')){
      saveCustomStyleProfile();
      render();
      return;
    }

    const ctype=e.target.closest('[data-concept-type]')?.dataset.conceptType;
    if(ctype){state.conceptDraft.type=ctype;render();return}
    const cstyle=e.target.closest('[data-concept-style]')?.dataset.conceptStyle;
    if(cstyle){state.conceptDraft.style=cstyle;render();return}
    const cnext=e.target.closest('[data-concept-next]')?.dataset.conceptNext;
    if(cnext){
      if(cnext==='1' && !state.conceptDraft.idea.trim()){toast('Give Aurora an idea first');return}
      state.conceptStep=Math.min(4,state.conceptStep+1);
      render();
      return;
    }
    if(e.target.closest('[data-concept-prev]')){state.conceptStep=Math.max(1,state.conceptStep-1);render();return}
    if(e.target.closest('[data-concept-build]')){
      const title=(state.conceptDraft.projectTitle||'').trim();
      if(!title){toast('Give your story a title first');return}
      const item=createLocalStory(title,state.conceptDraft.type);
      item.concept={
        idea:state.conceptDraft.idea,
        summary:conceptSummary(state.conceptDraft.idea),
        type:state.conceptDraft.type,
        style:state.conceptDraft.style,
        styleName:(state.savedStyles.find(x=>x.id===state.conceptDraft.style)?.name)||(
          { 'my-taste':'My Taste','natural':'Natural','cinematic':'Cinematic','literary':'Literary','light-novel':'Light Novel' }[state.conceptDraft.style] || state.conceptDraft.customStyleName || 'Custom Style'
        ),
        customStyle:state.conceptDraft.customStyle,
        customStyleName:state.conceptDraft.customStyleName,
        customStyleSample:state.conceptDraft.customStyleSample
      };
      item.summary=item.concept.summary;
      item.styleName=item.concept.styleName;
      item.updatedAt=Date.now();
      saveLibrarySafe(state.library);
      state.libraryOpenId=item.id;
      state.conceptStep=1;
      toast('Project created. Opening Library…');
      setTimeout(()=>{state.route='library';state.history=[];renderAndScroll()},120);
      return;
    }


    const filter=e.target.closest('[data-library-filter]')?.dataset.libraryFilter;
    if(filter){state.libraryFilter=filter;render();return}
    const createType=e.target.closest('[data-create-type]')?.dataset.createType;
    if(createType){state.createType=createType;render();return}
    const openId=e.target.closest('[data-library-open]')?.dataset.libraryOpen;
    if(openId){const item=state.library.find(x=>x.id===openId);if(item){updateLocalStory(openId,{lastOpenedAt:Date.now()});state.libraryOpenId=openId;renderAndScroll()}return}
    const favId=e.target.closest('[data-library-favorite]')?.dataset.libraryFavorite;
    if(favId){const item=state.library.find(x=>x.id===favId);if(item){updateLocalStory(favId,{favorite:!item.favorite});render()}return}
    const renameId=e.target.closest('[data-library-rename]')?.dataset.libraryRename;
    if(renameId){const item=state.library.find(x=>x.id===renameId);if(item){state.libraryModal={kind:'rename',id:renameId,value:item.title};renderLibraryModal()}return}
    const deleteId=e.target.closest('[data-library-delete]')?.dataset.libraryDelete;
    if(deleteId){if(state.library.find(x=>x.id===deleteId)){state.libraryModal={kind:'delete',id:deleteId};renderLibraryModal()}return}
    if(e.target.closest('[data-action="library-cancel"]')){state.libraryModal=null;renderLibraryModal();return}
    if(e.target.closest('[data-action="library-rename-confirm"]')){const input=document.getElementById('library-modal-input');const name=(input?.value||'').trim();if(!name){toast('Give the story a name');return}updateLocalStory(state.libraryModal.id,{title:name});state.libraryModal=null;render();toast('Story renamed');return}
    if(e.target.closest('[data-action="library-delete-confirm"]')){const id=state.libraryModal.id;removeLocalStory(id);state.libraryModal=null;state.libraryOpenId=null;render();toast('Story deleted');return}
    if(e.target.closest('[data-action="create-story"]')){const title=(document.getElementById('new-story-title')?.value||'').trim();if(!title){toast('Give your story a title first');return}const item=createLocalStory(title,state.createType);state.libraryOpenId=item.id;state.history.push('create');renderAndScroll();toast('Story created');return}

    const route=e.target.closest('[data-route]')?.dataset.route;
    if(route){go(route);return;}
    if(e.target.closest('[data-action="back"]')){back();return;}
    if(e.target.closest('[data-action="home"]')){goHome();return;}
    if(e.target.closest('[data-action="help"]')){openHelp();return;}
    if(e.target.closest('[data-action="toggle-help"]')){
      if(!state.settingsDraft) beginSettings();
      state.settingsDraft.help=!state.settingsDraft.help;
      render();
      return;
    }
    if(e.target.closest('[data-action="save-close"]')){
      const ok=commitSettings();
      if(ok){
        back();
        toast('Settings saved');
      } else {
        toast('Could not save settings');
      }
      return;
    }
    if(e.target.closest('[data-action="concept-demo"]')){toast('Concept Builder is scheduled for a later phase. Phase 3 is testing navigation.');return;}
    const theme=e.target.closest('[data-theme]')?.dataset.theme;
    if(theme){
      if(!state.settingsDraft) beginSettings();
      state.settingsDraft.theme=theme;
      render();
      toast('Change selected — save to apply');
      return;
    }
    const accent=e.target.closest('[data-accent]')?.dataset.accent;
    if(accent){
      if(!state.settingsDraft) beginSettings();
      state.settingsDraft.accent=accent;
      render();
      toast('Change selected — save to apply');
      return;
    }
    if(e.target.closest('[data-close]')){e.target.closest('.modalback')?.remove();return;}
    if(e.target.classList.contains('modalback'))e.target.remove();
  });
  // Prevent Android Chrome pull-to-refresh while preserving normal page scrolling.
  let touchStartY = 0;
  document.addEventListener('touchstart', e => {
    if(e.touches.length===1) touchStartY=e.touches[0].clientY;
  }, {passive:true});
  document.addEventListener('touchmove', e => {
    if(e.touches.length!==1 || window.scrollY>0) return;
    // Never intercept downward swipes inside Aurora's own scrollable overlays.
    // Otherwise, once a Brain editor reaches the bottom, Android Chrome sees
    // the next upward gesture as pull-to-refresh prevention and the modal
    // appears unable to scroll back up.
    if(e.target.closest('.brain-backdrop, .brain-editor-modal, .brain-read-modal, .field-manager-modal, .sheet, .reader-shell')) return;
    const currentY=e.touches[0].clientY;
    if(currentY>touchStartY) e.preventDefault();
  }, {passive:false});

  restoreNavigation();
  render();
  // Complete a pending NanoGPT OAuth callback after the first UI is available.
  nanoHandleOAuthCallback();
})();
