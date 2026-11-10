/* ============================================================
   Dati un atskaite: report download, project export, guarded import
   ============================================================ */
const DATI_SCHEMA = 'nis2-karte';
const DATI_VERSION = 2;
const REPORT_CSS = 'body{font-family:Arial,Helvetica,sans-serif;color:#111;max-width:980px;margin:24px auto;padding:0 20px;line-height:1.45}h1{font-size:1.8rem;margin:0 0 4px}h2{font-size:1.15rem;margin:28px 0 8px;border-bottom:2px solid #111;padding-bottom:4px}table{width:100%;border-collapse:collapse;font-size:.85rem}th,td{border:1px solid #bbb;padding:6px 8px;text-align:left;vertical-align:top}th{background:#eee}small{color:#555}.box{border:2px solid #111;padding:10px 14px;margin:14px 0}.stats{display:flex;gap:16px;flex-wrap:wrap;margin:10px 0}.stats div{border:1px solid #bbb;padding:8px 14px}.stats b{font-size:1.5rem;display:block}@media print{body{margin:0}h2{break-after:avoid}tr{break-inside:avoid}}';
let datiPending = null;

function datiStrip(o){ if(!o || typeof o !== 'object') return o; const r = {}; Object.keys(o).forEach(k=>{ if(k[0] !== '_' && k !== 'createdBy') r[k] = o[k]; }); return r; }
function datiMapStrip(o){ const r = {}; Object.keys(o || {}).forEach(k=>{ r[k] = datiStrip(o[k]); }); return r; }
function datiSlug(s){ return (String(s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'projekts').slice(0, 40); }
function datiMsg(text, isErr){ const el = document.getElementById('dati-status'); if(!el) return; el.textContent = text; el.dataset.err = isErr ? '1' : ''; }

async function collectProjectData(){
  const pase = db ? await dbGet(DOC.pase()) : null;
  const bases = await loadApplicabilityBases();
  const calendar = db ? await dbGet(DOC.calendarBase()) : null;
  const wizard = db ? await dbGet(DOC.wizardState()) : null;
  const assets = await loadAssets();
  controlsCache = await loadControls();
  techChecksCache = await loadTechChecks();
  trainingCache = await loadTraining();
  policiesCache = await loadPolicies();
  partnersCache = await loadPartnerContacts();
  const questions = {};
  for(let i = 1; i <= OPEN_QUESTIONS.length; i++){ const q = db ? await dbGet(DOC.question(i)) : null; if(q) questions[i] = datiStrip(q); }
  let decisions = [];
  if(db){ try { const snap = await DOC.decisionsCol().orderBy('createdAt', 'asc').get(); decisions = snap.docs.map(d=>({id:d.id, ...datiStrip(d.data())})); } catch(e){ decisions = []; } }
  return {
    schema: DATI_SCHEMA, version: DATI_VERSION, exportedAt: new Date().toISOString(),
    project: {id: currentProjectId, name: (pase && pase.uznemums) || ''},
    pase: datiStrip(pase) || {}, applicability: bases.map(datiStrip), calendar: datiStrip(calendar) || {}, wizard: datiStrip(wizard) || {},
    assets: assets.map(datiStrip), controls: datiMapStrip(controlsCache), questions: questions,
    techChecks: datiMapStrip(techChecksCache), training: datiMapStrip(trainingCache), policies: datiMapStrip(policiesCache),
    partners: datiMapStrip(partnersCache), decisions: decisions
  };
}

function showCopyBox(text){
  const b = document.getElementById('dati-copybox'); if(!b) return;
  b.innerHTML = '<label for="dati-copy-ta">Teksts kopēšanai</label><textarea id="dati-copy-ta" class="mono-ta" readonly></textarea>';
  document.getElementById('dati-copy-ta').value = text;
}
async function saveFile(filename, text){
  let dl = null;
  try { dl = await window.claude.use('downloads'); } catch(e){ dl = null; }
  if(!dl){ showCopyBox(text); datiMsg('Failu saglabāšana šajā skatā nav pieejama — kopē tekstu zemāk.', true); return; }
  try { await dl.save({filename: filename, data: text}); datiMsg('Fails nosūtīts saglabāšanai: ' + filename); }
  catch(e){
    if(e && e.code === 'declined') datiMsg('Saglabāšana atcelta.');
    else if(e && e.code === 'rate_limited') datiMsg('Mēģini vēlreiz pēc brīža.', true);
    else { datiMsg('Saglabāt neizdevās — kopē tekstu zemāk.', true); showCopyBox(text); }
  }
}
async function exportProject(){
  datiMsg('Apkopo datus…');
  const data = await collectProjectData();
  await saveFile('nis2-karte-' + datiSlug(data.project.name) + '-' + new Date().toISOString().slice(0, 10) + '.json', JSON.stringify(data, null, 2));
}
async function downloadReport(){
  datiMsg('Veido atskaiti…');
  const data = await collectProjectData();
  await saveFile('nis2-atskaite-' + datiSlug(data.project.name) + '-' + new Date().toISOString().slice(0, 10) + '.html', buildReportHtml(data));
}

function buildReportHtml(d){
  const e = esc;
  const today = new Date().toLocaleDateString('lv-LV');
  const pase = d.pase || {}, ctl = d.controls || {};
  const st = evidenceStats();
  const pct = n => st.applicable ? Math.round(n / st.applicable * 100) : 0;
  const ul = a => a.length ? '<ul>' + a.map(x => '<li>' + x + '</li>').join('') + '</ul>' : '<p>—</p>';
  const ctlRows = CONTROLS.map(c => {
    const s = ctl[c.id] || {};
    const state = evState(s);
    const ev = s.evidence ? e(s.evidence) + (s.evDate ? ' (' + e(s.evDate) + (s.evOwner ? ', ' + e(s.evOwner) : '') + ')' : ' (nav datuma)') : '—';
    const label = state === 'ok' ? 'Pierādīts' : state === 'missing' ? 'Nav apstiprināts' : '—';
    return '<tr><td>' + e(c.cat.toUpperCase()) + '</td><td>' + e(c.text) + '<br><small>' + e(c.ref) + '</small></td><td>' + e(s.compliance || '—') + '</td><td>' + (s.maturity == null ? '—' : e(s.maturity)) + '</td><td>' + ev + '</td><td>' + label + '</td></tr>';
  }).join('');
  const verdict = d.wizard && d.wizard.verdictTitle ? e(d.wizard.verdictTitle) + ' — ' + e(d.wizard.verdictReason) + ' (' + e(d.wizard.verdictRef) + ')' : 'Piemērojamības vednis nav pabeigts.';
  const stLbl = {green: 'apstiprināts', yellow: 'iespējams', red: 'neskaidrs'};
  const bases = (d.applicability || []).map(b => '<b>' + e(b.title) + '</b> — ' + e(stLbl[b.status] || '') + (b.note ? '. ' + e(b.note) : ''));
  const assetRows = (d.assets || []).map(a => '<tr><td>' + e(a.name) + '</td><td>' + e(a.owner) + '</td><td>' + e(a.klase || '—') + '</td><td>' + e(a.supplier) + '</td></tr>').join('');
  const pol = REQUIRED_POLICIES.map(p => e(p.title) + ': ' + e(((d.policies || {})[p.id] || {}).status || 'Nav sākts'));
  const tech = TECH_CHECKS.map(t => { const s = (d.techChecks || {})[t.id] || {}; return e(t.title) + ': ' + e(s.status || 'Nav veikts') + (s.date ? ' (' + e(s.date) + ')' : ''); });
  const trn = TRAINING_MODULES.map(t => { const s = (d.training || {})[t.id] || {}; return e(t.title) + ': ' + e(s.status || 'Nav plānots') + (s.date ? ' (' + e(s.date) + ')' : ''); });
  const missing = CONTROLS.filter(c => evState(ctl[c.id]) === 'missing').map(c => e(c.text));
  const answered = Object.keys(d.questions || {}).filter(k => d.questions[k] && d.questions[k].answer).length;
  const limits = [
    'Atskaite balstīta tikai uz instrumentā ievadītajiem datiem. Tā nav neatkarīgs audits, juridisks atzinums vai NKDC lēmums.',
    'Statuss "Pierādīts" nozīmē, ka norādīts dokuments un pārbaudes datums; paša dokumenta saturs nav pārbaudīts.',
    'Kontroļu saraksts ir saīsināts (' + CONTROLS.length + ' punkti), nevis pilns noteikumu klāsts.',
    'Normatīvā bāze: Nacionālās kiberdrošības likums un MK noteikumi Nr. 397; teksts pārbaudīts 28.09.2026. Nav pārbaudīts, vai MK noteikumi Nr. 397 ir grozīti pēc 2026. gada jūnija likuma grozījumiem.',
    'Atbildēti ' + answered + ' no ' + OPEN_QUESTIONS.length + ' atklātajiem jautājumiem.'
  ].map(e);
  const paseRows = [['Uzņēmums', pase.uznemums], ['Mājaslapa', pase.majaslapa], ['Nozare', pase.nozare], ['Darbinieki', pase.darbinieki], ['Apgrozījums (€)', pase.apgrozijums], ['Bilance (€)', pase.bilance], ['Atbildīgais par projektu', pase.atbildigais]].map(r => '<tr><th>' + e(r[0]) + '</th><td>' + e(r[1] || '—') + '</td></tr>').join('');
  return '<!DOCTYPE html><html lang="lv"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>NIS2 atskaite</title><style>' + REPORT_CSS + '</style></head><body>' +
    '<h1>NIS2 sagatavotības atskaite</h1><p>' + e(pase.uznemums || '') + ' · sagatavota ' + e(today) + '</p>' +
    '<div class="box"><b>Svarīgi.</b> ' + limits[0] + '</div>' +
    '<h2>1. Uzņēmums</h2><table>' + paseRows + '</table>' +
    '<h2>2. Piemērojamība</h2><p>' + verdict + '</p>' + ul(bases) +
    '<h2>3. Atbilstības kontroles</h2><div class="stats"><div><b>' + pct(st.filled) + '%</b>aizpildīts</div><div><b>' + pct(st.evidenced) + '%</b>pierādīts</div><div><b>' + st.unconfirmed + '</b>nav apstiprināti</div></div>' +
    '<table><tr><th>Kat.</th><th>Prasība</th><th>Atbilstība</th><th>Briedums (0-5)</th><th>Pierādījums</th><th>Statuss</th></tr>' + ctlRows + '</table>' +
    '<h2>4. IKT aktīvi</h2>' + (assetRows ? '<table><tr><th>Nosaukums</th><th>Īpašnieks</th><th>Klase</th><th>Piegādātājs</th></tr>' + assetRows + '</table>' : '<p>Nav ievadīts neviens aktīvs.</p>') +
    '<h2>5. Dokumenti, pārbaudes, apmācības</h2><h3>Politikas</h3>' + ul(pol) + '<h3>Tehniskās pārbaudes</h3>' + ul(tech) + '<h3>Apmācības</h3>' + ul(trn) +
    '<h2>6. Kas nav apstiprināts un ierobežojumi</h2><h3>Punkti bez pierādījuma</h3>' + ul(missing) + '<h3>Ierobežojumi</h3>' + ul(limits) +
    '</body></html>';
}

function datiSanitize(o){
  if(!o || o.schema !== DATI_SCHEMA) throw new Error('Šis nav šī instrumenta eksporta fails.');
  if(typeof o.version !== 'number' || o.version > DATI_VERSION) throw new Error('Faila versija ir jaunāka par šī instrumenta versiju.');
  const S = (v, m) => typeof v === 'string' ? v.slice(0, m || 2000) : '';
  const D = v => (typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v)) ? v : '';
  const pick = (v, l) => l.includes(v) ? v : null;
  const obj = v => (v && typeof v === 'object' && !Array.isArray(v)) ? v : {};
  const arr = v => Array.isArray(v) ? v.slice(0, 500) : [];
  const idOk = v => typeof v === 'string' && /^[A-Za-z0-9_-]{1,60}$/.test(v);
  const c = {pase: {}, applicability: [], calendar: {}, wizard: null, assets: [], controls: {}, questions: {}, techChecks: {}, training: {}, policies: {}, partners: {}, decisions: []};
  const p = obj(o.pase);
  PASE_FIELDS.forEach(f => { if(typeof p[f[0]] === 'string') c.pase[f[0]] = S(p[f[0]], 500); });
  arr(o.applicability).forEach(b => { const n = Number(b && b.n); if(Number.isInteger(n) && n > 0 && n < 1000) c.applicability.push({n: n, title: S(b.title, 300), desc: S(b.desc, 3000), ref: S(b.ref, 200), status: pick(b.status, ['green', 'yellow', 'red']) || 'yellow', note: S(b.note, 3000)}); });
  const cal = obj(o.calendar);
  ['statusDate', 'nkdcNotifiedDate', 'managerAppointedDate'].forEach(k => { c.calendar[k] = D(cal[k]); });
  const wz = obj(o.wizard);
  if(wz.verdict !== undefined || Array.isArray(wz.trail)){
    c.wizard = {trail: arr(wz.trail).map(t => ({stepId: S(t && t.stepId, 10), kicker: S(t && t.kicker, 100), optText: S(t && t.optText, 500), tag: S(t && t.tag, 20)})), currentId: wz.currentId ? S(wz.currentId, 10) : null, verdict: wz.verdict ? S(wz.verdict, 40) : null, verdictTitle: S(wz.verdictTitle, 300), verdictReason: S(wz.verdictReason, 2000), verdictRef: S(wz.verdictRef, 200)};
  }
  arr(o.assets).forEach(a => { if(a && idOk(a.id)) c.assets.push({id: a.id, name: S(a.name, 300), desc: S(a.desc, 3000), owner: S(a.owner, 200), supplier: S(a.supplier, 300), klase: pick(a.klase, ['A', 'B', 'C', 'Nav noteikts']) || '', remote: pick(a.remote, ['Jā', 'Nē', 'Nezinu']) || '', createdAt: Number(a.createdAt) || Date.now()}); });
  const ctl = obj(o.controls);
  CONTROLS.forEach(k => { const s = ctl[k.id]; if(!s) return; const m = Number(s.maturity); c.controls[k.id] = {compliance: pick(s.compliance, ['Jā', 'Daļēji', 'Nē', 'N/A']), maturity: (s.maturity != null && Number.isInteger(m) && m >= 0 && m <= 5) ? m : null, note: S(s.note, 2000), evidence: S(s.evidence, 1000), evDate: D(s.evDate), evOwner: S(s.evOwner, 200)}; });
  const qs = obj(o.questions);
  OPEN_QUESTIONS.forEach((q, i) => { const s = qs[i + 1]; if(s && typeof s.answer === 'string') c.questions[i + 1] = {answer: S(s.answer, 5000)}; });
  const tc = obj(o.techChecks);
  TECH_CHECKS.forEach(t => { const s = tc[t.id]; if(s) c.techChecks[t.id] = {status: pick(s.status, ['Nav veikts', 'Ieplānots', 'Veikts — OK', 'Veikts — problēmas']), result: S(s.result, 2000), date: D(s.date)}; });
  const tr = obj(o.training);
  TRAINING_MODULES.forEach(t => { const s = tr[t.id]; if(s) c.training[t.id] = {status: pick(s.status, ['Nav plānots', 'Ieplānots', 'Pabeigts']), date: D(s.date), coverage: S(s.coverage, 50)}; });
  const pl = obj(o.policies);
  REQUIRED_POLICIES.forEach(t => { const s = pl[t.id]; if(s) c.policies[t.id] = {status: pick(s.status, ['Nav sākts', 'Melnraksts', 'Apstiprināšanā', 'Apstiprināts']), draft: S(s.draft, 30000), version: (Number.isInteger(s.version) && s.version >= 0) ? s.version : 0}; });
  const pt = obj(o.partners);
  PARTNER_CATEGORIES.forEach(t => { const s = pt[t.id]; if(s) c.partners[t.id] = {name: S(s.name, 300), contact: S(s.contact, 300), note: S(s.note, 1000)}; });
  arr(o.decisions).forEach(x => { if(x && idOk(x.id)) c.decisions.push({id: x.id, decision: S(x.decision, 1000), rationale: S(x.rationale, 3000), createdAt: Number(x.createdAt) || Date.now()}); });
  const counts = 'kontroles ' + Object.keys(c.controls).length + ', aktīvi ' + c.assets.length + ', politikas ' + Object.keys(c.policies).length + ', tehniskās pārbaudes ' + Object.keys(c.techChecks).length + ', apmācības ' + Object.keys(c.training).length + ', lēmumi ' + c.decisions.length;
  return {clean: c, counts: counts, name: c.pase.uznemums || '', exportedAt: S(o.exportedAt, 40)};
}

async function datiPreview(){
  const raw = document.getElementById('dati-import-text').value.trim();
  const out = document.getElementById('dati-import-preview');
  out.innerHTML = ''; datiPending = null;
  if(!raw){ datiMsg('Ielīmē vai izvēlies JSON failu.', true); return; }
  let obj; try { obj = JSON.parse(raw); } catch(e){ datiMsg('Fails nav derīgs JSON.', true); return; }
  let res; try { res = datiSanitize(obj); } catch(e){ datiMsg(e.message, true); return; }
  datiPending = res.clean;
  out.innerHTML = '<p class="ev-note"><b>' + esc(res.name || '(bez nosaukuma)') + '</b>, eksportēts ' + esc(res.exportedAt || '?') + '. Ieraksti: ' + esc(res.counts) + '. Imports pārrakstīs šī projekta ierakstus ar tiem pašiem ID. Pirms tam ieteicams izveidot eksportu.</p><button type="button" class="btn" id="dati-import-apply">Apstiprināt importu</button>';
  document.getElementById('dati-import-apply').addEventListener('click', datiApply);
  datiMsg('Fails pārbaudīts. Pārskati kopsavilkumu un apstiprini.');
}
async function datiApply(){
  if(!datiPending) return;
  const c = datiPending; datiPending = null;
  datiMsg('Importē…');
  let ok = true;
  const w = async (ref, data) => { if(!(await dbSet(ref, data))) ok = false; };
  await w(DOC.pase(), c.pase);
  for(const b of c.applicability){ const {n, ...rest} = b; await w(DOC.applicability(n), rest); }
  await w(pdoc('applicability/_index'), {ids: c.applicability.map(b => b.n)});
  await w(DOC.calendarBase(), c.calendar);
  if(c.wizard) await w(DOC.wizardState(), c.wizard);
  for(const a of c.assets){ const {id, ...rest} = a; await w(DOC.asset(id), rest); }
  for(const id of Object.keys(c.controls)) await w(DOC.control(id), c.controls[id]);
  for(const n of Object.keys(c.questions)) await w(DOC.question(n), c.questions[n]);
  for(const id of Object.keys(c.techChecks)) await w(DOC.techCheck(id), c.techChecks[id]);
  for(const id of Object.keys(c.training)) await w(DOC.trainingItem(id), c.training[id]);
  for(const id of Object.keys(c.policies)) await w(DOC.policy(id), c.policies[id]);
  for(const id of Object.keys(c.partners)) await w(pdoc('partners/' + id), c.partners[id]);
  for(const x of c.decisions){ const {id, ...rest} = x; await w(pdoc('decisions/' + id), rest); }
  await renderAll();
  await updateTechProgress(); await updateTrainingProgress(); await updatePoliciesProgress();
  datiMsg(ok ? 'Imports pabeigts.' : 'Imports pabeigts ar kļūdām — skaties saglabāšanas statusu augšā.', !ok);
}

async function renderDati(){
  const el = document.getElementById('view-dati');
  el.innerHTML =
    '<div class="card"><div class="section-title">Atskaite</div><p class="hint">Atskaite tiek saglabāta kā HTML fails, ko var atvērt pārlūkā un izdrukāt vai saglabāt kā PDF. Tajā ir tikai šajā instrumentā ievadītie dati, un tā skaidri norāda, kas nav apstiprināts.</p><button type="button" class="btn" id="dati-report-btn">Lejupielādēt atskaiti (HTML)</button></div>' +
    '<div class="card"><div class="section-title">Rezerves kopija</div><p class="hint">Eksportē visu šī projekta saturu JSON failā. Eksportā nav lietotāju identifikatoru.</p><button type="button" class="btn ghost" id="dati-export-btn">Eksportēt projektu (JSON)</button></div>' +
    '<div class="card edit-only"><div class="section-title">Imports</div><p class="hint">Izvēlies iepriekš eksportētu failu vai ielīmē tā saturu. Pirms rakstīšanas tiks parādīts kopsavilkums, un nepieciešams apstiprinājums.</p>' +
    '<div class="field"><label for="dati-file">JSON fails</label><input type="file" id="dati-file" accept=".json,application/json"></div>' +
    '<div class="field"><label for="dati-import-text">vai ielīmē saturu</label><textarea id="dati-import-text" class="mono-ta"></textarea></div>' +
    '<button type="button" class="btn ghost" id="dati-preview-btn">Pārbaudīt failu</button><div id="dati-import-preview" style="margin-top:16px;"></div></div>' +
    '<p id="dati-status" role="status" aria-live="polite" class="hint"></p><div id="dati-copybox"></div>';
  document.getElementById('dati-report-btn').addEventListener('click', downloadReport);
  document.getElementById('dati-export-btn').addEventListener('click', exportProject);
  document.getElementById('dati-preview-btn').addEventListener('click', datiPreview);
  document.getElementById('dati-file').addEventListener('change', function(ev){
    const f = ev.target.files && ev.target.files[0]; if(!f) return;
    if(f.size > 5 * 1024 * 1024){ datiMsg('Fails ir pārāk liels (virs 5 MB).', true); return; }
    const r = new FileReader();
    r.onload = function(){ document.getElementById('dati-import-text').value = String(r.result || ''); datiMsg('Fails ielādēts. Nospied "Pārbaudīt failu".'); };
    r.onerror = function(){ datiMsg('Failu nevarēja nolasīt.', true); };
    r.readAsText(f);
  });
}

