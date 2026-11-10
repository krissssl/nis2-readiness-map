import re, subprocess, sys

HELPERS = r'''
let db = null, userCap = null, sample = null, myId = null;

/* ---- safety + id helpers ---- */
function esc(v){ return String(v==null?'':v).replace(/[&<>"']/g, function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]; }); }
function uid(prefix){ return prefix + ((window.crypto && crypto.randomUUID) ? crypto.randomUUID().slice(0,13) : Date.now().toString(36) + Math.random().toString(36).slice(2,8)); }

/* ---- evidence model: "filled in" is not the same as "confirmed" ---- */
function evState(s){
  if(!s || s.compliance==='N/A') return 'na';
  if(s.compliance==='Jā' || s.compliance==='Daļēji') return (s.evidence && s.evDate) ? 'ok' : 'missing';
  return 'na';
}
function evBadgeText(s){ var st=evState(s); return st==='ok' ? 'Pierādīts' : st==='missing' ? 'Nav apstiprināts' : '—'; }
function evBadgeClass(s){ var st=evState(s); return st==='ok' ? 'green' : st==='missing' ? 'orange' : 'grey'; }
function evidenceStats(){
  var applicable=0, filled=0, evidenced=0, unconfirmed=0;
  CONTROLS.forEach(function(c){
    var s = controlsCache[c.id] || {};
    if(s.compliance==='N/A') return;
    applicable++;
    if(s.compliance!=null || s.maturity!=null) filled++;
    var st = evState(s);
    if(st==='ok') evidenced++; else if(st==='missing') unconfirmed++;
  });
  return {applicable:applicable, filled:filled, evidenced:evidenced, unconfirmed:unconfirmed};
}
function refreshEvBadge(cid){
  var el = document.querySelector('[data-role="ev-badge"][data-cid="'+cid+'"]');
  if(!el) return;
  var s = controlsCache[cid];
  el.className = 'badge ' + evBadgeClass(s);
  el.textContent = evBadgeText(s);
}
function renderEvidenceSummary(){
  var el = document.getElementById('ev-summary');
  if(!el) return;
  var st = evidenceStats();
  var pct = function(n){ return st.applicable ? Math.round(n/st.applicable*100) : 0; };
  el.innerHTML =
    '<div class="ev-cell"><span class="ev-num">'+pct(st.filled)+'%</span><span class="ev-lbl">Aizpildīts</span></div>'+
    '<div class="ev-cell"><span class="ev-num">'+pct(st.evidenced)+'%</span><span class="ev-lbl">Pierādīts</span></div>'+
    '<div class="ev-cell"><span class="ev-num">'+st.unconfirmed+'</span><span class="ev-lbl">Nav apstiprināti</span></div>';
}
'''

STORAGE = r'''/* ---- storage layer: every write reports success or failure to the UI ---- */
const SaveState = {pending:0, lastOk:null, failed:[]};
function renderSaveStatus(){
  const el = document.getElementById('save-status');
  if(!el) return;
  let text, state;
  if(!db){ text='Lokāls skats — nesaglabājas'; state='warn'; }
  else if(SaveState.pending>0){ text='Saglabā…'; state='busy'; }
  else if(SaveState.failed.length>0){ text='Kļūda saglabājot — nospied, lai atkārtotu'; state='error'; }
  else if(SaveState.lastOk){ text='Saglabāts '+new Date(SaveState.lastOk).toLocaleTimeString('lv-LV',{hour:'2-digit',minute:'2-digit'}); state='ok'; }
  else { text='Dati sinhronizēti'; state='ok'; }
  el.textContent = text; el.dataset.state = state;
}
async function dbGet(ref){
  try { const snap = await ref.get(); return snap.exists ? snap.data() : null; }
  catch(e){ console.error('db get failed', e); return null; }
}
async function dbWrite(op){
  SaveState.pending++; renderSaveStatus();
  let ok = false;
  try {
    await op(); ok = true; SaveState.lastOk = Date.now();
    const i = SaveState.failed.indexOf(op); if(i>=0) SaveState.failed.splice(i,1);
  } catch(e){
    console.error('db write failed', e);
    if(!SaveState.failed.includes(op)) SaveState.failed.push(op);
  } finally { SaveState.pending--; renderSaveStatus(); }
  return ok;
}
async function dbSet(ref, data){ return dbWrite(()=>ref.set(data)); }
async function dbUpdate(ref, data){
  return dbWrite(async ()=>{ try { await ref.update(data); } catch(e){ await ref.set(data); } });
}
async function retryFailed(){ const ops = SaveState.failed.slice(); for(const op of ops){ await dbWrite(op); } }
document.addEventListener('click', function(e){
  const b = e.target.closest && e.target.closest('#save-status');
  if(b && SaveState.failed.length) retryFailed();
});
window.addEventListener('beforeunload', function(e){
  if(SaveState.pending>0 || SaveState.failed.length){ e.preventDefault(); e.returnValue = ''; }
});
'''

EV_ROW = r'''<input type="text" data-cid="${c.id}" data-role="note" placeholder="Piezīme..." value="${esc(s.note||'')}" style="font-size:.82rem;">
      <div class="ev-row">
        <span class="badge ${evBadgeClass(s)}" data-role="ev-badge" data-cid="${c.id}">${evBadgeText(s)}</span>
        <input type="text" data-cid="${c.id}" data-role="evidence" placeholder="Pierādījums: dokuments, ekrānuzņēmums, saite" value="${esc(s.evidence||'')}">
        <input type="date" data-cid="${c.id}" data-role="evDate" value="${esc(s.evDate||'')}" aria-label="Pārbaudes datums">
        <input type="text" data-cid="${c.id}" data-role="evOwner" placeholder="Pārbaudīja (vārds)" value="${esc(s.evOwner||'')}">
      </div>'''

READINESS = r'''// determine honest level: based on confirmed evidence, not on filled-in fields
  const st = evidenceStats();
  const filledShare = st.applicable ? st.filled / st.applicable : 0;
  const evShare = st.applicable ? st.evidenced / st.applicable : 0;
  const disclaimer = '\n\nŠis apliecinājums balstīts uz uzņēmuma pašnovērtējumu un norādītajiem pierādījumiem. Tas nav neatkarīgs audits, juridisks atzinums vai NKDC lēmums.';
  const respLine = pase?.atbildigais ? 'Uzņēmumā ir noteikta atbildīgā persona par kiberdrošības jautājumiem.' : '';
  let level, levelLabel, text;

  if(filledShare < 0.5){
    level = 0;
    levelLabel = 'Līmenis 0 — Apzināšanās';
    text = `${companyName}${sectorPhrase} apzinās, ka Eiropas Savienības NIS2 direktīva un tās Latvijas ieviešana (Nacionālās kiberdrošības likums, MK noteikumi Nr. 397) var skart uzņēmuma darbības jomu.\n\nMēs esam veikuši sākotnēju piemērojamības izvērtējumu un strādājam pie atbilstības nodrošināšanas, izmantojot strukturētu iekšējo procesu.` + disclaimer;
  } else if(evShare < 0.6 || policiesApproved < REQUIRED_POLICIES.length || techDone < 2){
    level = 1;
    levelLabel = 'Līmenis 1 — Strukturēts pašnovērtējums';
    text = `${companyName} ir veikusi pašnovērtējumu pret MK noteikumu Nr. 397 prasībām, aptverot ${assets.length} IKT sistēmas un ${st.filled} no ${st.applicable} kontroles punktiem 10 kategorijās. Ar dokumentāru pierādījumu apstiprināti: ${st.evidenced}. ${respLine}\n\nPašnovērtējuma rezultātā sagatavots prioritizēts rīcības plāns galveno drošības pasākumu ieviešanai.` + disclaimer;
  } else {
    level = 2;
    levelLabel = 'Līmenis 2 — Dokumentēti pasākumi';
    text = `${companyName} ir dokumentējusi šādus kiberdrošības pasākumus:\n- Pašnovērtējums: ${st.filled} no ${st.applicable} kontroles punktiem, no tiem ar dokumentāru pierādījumu: ${st.evidenced}\n- ${policiesApproved} no ${REQUIRED_POLICIES.length} obligātajiem dokumentiem apstiprināti vadībā\n- ${techDone} no ${TECH_CHECKS.length} tehniskajām pārbaudēm veiktas un dokumentētas\n- ${trainingDone} no ${TRAINING_MODULES.length} apmācību moduļiem pabeigti\n\nPierādījumi pieejami pēc pieprasījuma.` + disclaimer;
  }
'''

CSS_EXTRA = r'''
.save-status{font-family:inherit;font-weight:700;font-size:.72rem;text-transform:uppercase;letter-spacing:.1em;min-height:44px;padding:0 14px;border:2px solid var(--line);background:transparent;color:var(--ink);cursor:default}
.save-status[data-state=busy],.save-status[data-state=warn]{color:var(--accent);border-color:var(--accent)}
.save-status[data-state=error]{background:var(--accent);border-color:var(--accent);color:#000;cursor:pointer}
.ev-summary{display:grid;grid-template-columns:repeat(3,1fr);gap:1px;background:var(--line);border:2px solid var(--line);margin-bottom:12px}
.ev-cell{background:var(--paper);padding:16px;display:flex;flex-direction:column}
.ev-num{font-size:clamp(2rem,4vw,3.4rem);font-weight:700;letter-spacing:-.05em;line-height:1}
.ev-lbl{font-size:.72rem;font-weight:700;text-transform:uppercase;letter-spacing:.12em;color:var(--ink-soft);margin-top:6px}
.ev-note{font-size:.85rem;color:var(--ink-soft);margin:0 0 20px;max-width:68ch}
.ev-row{display:grid;grid-template-columns:auto 1fr auto 1fr;gap:12px;align-items:end;margin-top:8px}
@media(max-width:700px){.ev-row{grid-template-columns:1fr}}
'''

def patch(src, dst):
    s = open(src, encoding='utf-8').read()
    log = []
    def rep(old, new):
        nonlocal s
        assert old in s, 'NOT FOUND: ' + old[:80]
        s = s.replace(old, new, 1)
    def sub(pat, repl, expect_min=1, flags=0):
        nonlocal s
        s, n = re.subn(pat, repl, s, flags=flags)
        assert n >= expect_min, ('regex miss', pat[:60], n)
        return n

    # A. helpers, storage layer, save-status UI
    rep("let db = null, userCap = null, sample = null, myId = null;", HELPERS.strip())
    sub(r"async function dbGet\(ref\)\{[\s\S]*?async function dbUpdate\(ref, data\)\{[\s\S]*?\n\}\n", lambda m: STORAGE, 1)
    rep('<div class="presence" id="presence"><span class="dot"></span><span id="presence-text">Ielādē...</span></div>',
        '<button type="button" class="save-status" id="save-status" data-state="busy">Ielādē…</button>')
    sub(r"function updatePresence\(\)\{[\s\S]*?\n\}\n", lambda m: "function updatePresence(){ renderSaveStatus(); }\n", 1)

    # B. correctness bugs found in own code (labels were 'na'/'no', stored values are 'N/A'/'Nē')
    sub(r"compliance === 'na'", "compliance === 'N/A'", 1)
    sub(r"compliance === 'no'", "compliance === 'Nē'", 1)
    rep("if(!s || s.compliance === 'N/A') return;",
        "if(!s || s.compliance === 'N/A') return;\n    if(s.compliance == null && s.maturity == null) return;")

    # C. evidence fields: load, edit, summary
    rep("note: data.note ?? '', _updatedBy:data._updatedBy",
        "note: data.note ?? '', evidence: data.evidence ?? '', evDate: data.evDate ?? '', evOwner: data.evOwner ?? '', _updatedBy:data._updatedBy")
    rep('''<input type="text" data-cid="${c.id}" data-role="note" placeholder="Piezīme / pierādījums..." value="${s.note||''}" style="font-size:.82rem;">''', EV_ROW)
    rep("""rows.querySelectorAll('input[data-role="note"]')""",
        """rows.querySelectorAll('input[data-role="note"], input[data-role="evidence"], input[data-role="evDate"], input[data-role="evOwner"]')""")
    rep("controlsCache[cid] = {...controlsCache[cid], note: inp.value};",
        "const role = inp.dataset.role; controlsCache[cid] = {...controlsCache[cid], [role]: inp.value}; refreshEvBadge(cid);")
    rep("await dbUpdate(DOC.control(cid), {note: inp.value, _updatedAt: Date.now(), _updatedBy: myId});",
        "await dbUpdate(DOC.control(cid), {[role]: inp.value, _updatedAt: Date.now(), _updatedBy: myId}); renderHeatgrid();")
    rep("controlsCache[cid] = {...controlsCache[cid], compliance: btn.dataset.v};",
        "controlsCache[cid] = {...controlsCache[cid], compliance: btn.dataset.v}; refreshEvBadge(cid);")
    rep('<div class="heatgrid" id="heatgrid"></div>',
        '<div class="ev-summary" id="ev-summary" role="group" aria-label="Aizpildīšana un pierādījumi"></div>\n      <p class="ev-note">Aizpildīts nenozīmē atbilstošs. Punkts ir pierādīts tikai tad, ja norādīts dokuments un pārbaudes datums.</p>\n      <div class="heatgrid" id="heatgrid"></div>')
    sub(r"(function renderHeatgrid\(\)\{\s*const grid = document\.getElementById\('heatgrid'\);\s*grid\.innerHTML = '';)",
        lambda m: m.group(1) + "\n  renderEvidenceSummary();", 1)

    # D. wording: progress is a fill indicator, not compliance
    rep("% pabeigts", "% aizpildīts")
    rep("label:'Pabeigts'", "label:'Aizpildīts'")
    sub(r"note\.innerHTML = '[^\n]*';",
        lambda m: "const evs = evidenceStats();\n  note.innerHTML = 'Progress ir <strong>aizpildīšanas rādītājs</strong>, nevis atbilstības apliecinājums. Kontroles punkti: aizpildīti ' + evs.filled + ' no ' + evs.applicable + ', ar pierādījumu ' + evs.evidenced + ', nav apstiprināti ' + evs.unconfirmed + '.';", 1)

    # E. readiness generator: only evidenced items count; no unbacked claims
    sub(r"const techDone = TECH_CHECKS\.filter\(t=>\{\s*const s = techChecksCache\[t\.id\];\s*return s\.status === 'Veikts — OK' \|\| s\.status === 'Veikts — problēmas';\s*\}\)\.length;",
        lambda m: "const techDone = TECH_CHECKS.filter(t=>{ const s = techChecksCache[t.id]; return (s.status === 'Veikts — OK' || s.status === 'Veikts — problēmas') && s.result && s.date; }).length;", 1)
    sub(r"// determine honest level based on real thresholds[\s\S]*?(?=\n  const today = new Date\(\)\.toLocaleDateString\('lv-LV'\);)", lambda m: READINESS.rstrip(), 1)
    s = s.replace("Balstīts uz reāliem datiem instrumentā šajā brīdī. Pirms izmantošanas tenderā — pārbaudīt, vai dati joprojām ir aktuāli.",
                  "Balstīts uz instrumentā ievadītajiem datiem šajā brīdī. Pirms izmantošanas pārbaudiet aktualitāti un pierādījumus.")

    # F. escaping of everything user/db/AI-sourced that goes into HTML
    sub(r'value="\$\{(?!esc\()([^}]*)\}"', lambda m: 'value="${esc(' + m.group(1) + ')}"', 15)
    sub(r'placeholder="\$\{placeholder\}"', lambda m: 'placeholder="${esc(placeholder)}"', 1)
    sub(r'>\$\{(?!esc\()([^}]*)\}</textarea>', lambda m: '>${esc(' + m.group(1) + ')}</textarea>', 5)
    sub(r'\$\{p\.name\}', lambda m: '${esc(p.name)}', 1)
    sub(r"\$\{p\.sector \|\| 'Nozare nav norādīta'\}", lambda m: "${esc(p.sector || 'Nozare nav norādīta')}", 1)
    sub(r'<td>\$\{data\.decision\}</td><td>\$\{data\.rationale\|\|\'\'\}</td>', lambda m: "<td>${esc(data.decision)}</td><td>${esc(data.rationale||'')}</td>", 1)
    sub(r'\$\{(state|wizardState)\.(verdictTitle|verdictReason|verdictRef)\}', lambda m: '${esc(%s.%s)}' % (m.group(1), m.group(2)), 3)
    sub(r'\$\{result\.pamatojums\}', lambda m: '${esc(result.pamatojums)}', 1)
    sub(r"\$\{result\.brīdinājums \|\| '([^']*)'\}", lambda m: "${esc(result.brīdinājums || '" + m.group(1) + "')}", 1)
    sub(r'(white-space:pre-wrap;[^"]*">)\$\{text\}', lambda m: m.group(1) + '${esc(text)}', 3)
    rep("const result = await sample.json(prompt, {modelTier:'quick'});",
        "const result = await sample.json(prompt, {modelTier:'quick'});\n    if(!result || !['A','B','C'].includes(result.klase)) throw new Error('invalid class from AI');")

    # G. duplicate handler, ids, look-alike key
    i = s.find("document.getElementById('create-project-btn').addEventListener('click', async ()=>{")
    assert i >= 0
    j = s.find("\n  });\n}", i)
    assert j > i
    s = s[:i] + "document.getElementById('create-project-btn').onclick = async ()=>{" + s[i+len("document.getElementById('create-project-btn').addEventListener('click', async ()=>{"):j] + "\n  };\n}" + s[j+len("\n  });\n}"):]
    rep("const id = 'proj-' + Date.now();", "const id = uid('proj-');")
    rep("const newId = 'a' + Date.now();", "const newId = uid('a');")
    s = s.replace('f\u0430ze', 'faze')
    rep("pase?.['faze'] || ''", "pase?.faze || pase?.['f\\u0430ze'] || ''")
    rep("const existing = db ? await dbGet(DOC.pase()) : null;",
        "const existing = db ? await dbGet(DOC.pase()) : null;\n  if(existing && existing.faze === undefined && existing['f\\u0430ze'] !== undefined){ existing.faze = existing['f\\u0430ze']; }")

    # H. css
    rep('</style>', CSS_EXTRA + '</style>')

    open(dst, 'w', encoding='utf-8').write(s)
    script = s.split('<script>')[-1].split('</script>')[0]
    open('/tmp/chk.js', 'w', encoding='utf-8').write(script)
    r = subprocess.run(['node', '--check', '/tmp/chk.js'], capture_output=True, text=True)
    print(dst, len(s), 'bytes | esc( uses:', s.count('esc('), '| syntax:', 'OK' if r.returncode == 0 else r.stderr[:300])

patch('quant-nis2-tool-kinetic.html', 'quant-nis2-tool-v2.html')
patch('nis2-client-template-kinetic.html', 'nis2-client-template-v2.html')

# quick behavioural test of the new helpers
test = HELPERS.replace("let db = null, userCap = null, sample = null, myId = null;", "") + r'''
var window = {}; var CONTROLS=[{id:'a'},{id:'b'},{id:'c'}];
var controlsCache = {a:{compliance:'Jā',evidence:'Politika.pdf',evDate:'2026-10-01'}, b:{compliance:'Daļēji'}, c:{compliance:'N/A'}};
console.log(esc('SIA "Quantrum" <b>&'));
console.log(JSON.stringify(evidenceStats()));
'''
open('/tmp/t.js','w',encoding='utf-8').write(test)
print(subprocess.run(['node','/tmp/t.js'],capture_output=True,text=True).stdout)
