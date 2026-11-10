/* ============================================================
   Normatīvā bāze: which legal sources the tool relies on, what was
   actually read, what is still unverified
   ============================================================ */
const NORMS = [
  {id:'nkdl', title:'Nacionālās kiberdrošības likums (NKDL)', url:'https://likumi.lv/ta/id/353390-nacionalas-kiberdrosibas-likums', scope:'Kas ir tvērumā, vadības pienākumi, uzraudzība, sodi', version:'Redakcija ar grozījumiem 04.06.2026; grozījumi 18.06.2026 un 01.10.2026 (20. p. 11. d.)', read:'28.09.2026', badge:'green', status:'Pārlasīts avotā'},
  {id:'mk397', title:'MK noteikumi Nr. 397 "Minimālās kiberdrošības prasības"', url:'https://likumi.lv/ta/id/361481-minimalas-kiberdrosibas-prasibas', scope:'Dokumenti, sistēmu klases A/B/C, žurnāli, rezerves kopijas, incidenti, pašnovērtējums', version:'Pieņemti 25.06.2025, spēkā no 02.07.2025', read:'28.09.2026', badge:'orange', status:'Jāpārbauda grozījumi', note:'Lapā nebija redzamu atzīmju par grozījumiem pēc 18.06.2026; nav apstiprināts, ka redakcija ir aktuāla.'},
  {id:'nis2', title:'Direktīva (ES) 2022/2555 (NIS2)', url:'https://eur-lex.europa.eu/eli/dir/2022/2555/oj', scope:'Pamats Art. 21 kategorijām', version:'—', read:'', badge:'grey', status:'Nav pārbaudīts šajā instrumentā', note:'Latvijas prasības balstītas uz NKDL un MK noteikumiem Nr. 397.'},
  {id:'reg2690', title:'Īstenošanas regula (ES) 2024/2690', url:'https://eur-lex.europa.eu/eli/reg_impl/2024/2690/oj', scope:'Digitālo pakalpojumu sniedzēju tehniskās prasības (MK not. Nr. 397 6. p.)', version:'—', read:'', badge:'grey', status:'Nav pārbaudīts šajā instrumentā', note:'Instrumenta kontroļu sarakstā nav iekļauta.'},
  {id:'dora', title:'Regula (ES) 2022/2554 (DORA)', url:'https://eur-lex.europa.eu/eli/reg/2022/2554/oj', scope:'Finanšu iestādes; ietekmē NKDL piemērošanu', version:'—', read:'', badge:'grey', status:'Nav pārbaudīts šajā instrumentā', note:'Piemērojamības vednis to neapstrādā.'}
];
const NORM_OPEN = [
  'Vai uzņēmuma lielumu rēķina kopā ar saistītajiem uzņēmumiem (NKDL 1. pants agregāciju nenosaka).',
  'Kā skaitīt darbiniekus: vidējais skaits, pilna laika ekvivalents vai konkrēts datums.',
  'Nozaru termini (piem., enerģētika, ārstniecības iestāde) ir definēti citos likumos un vednī nav precizēti.',
  'Kā tiek noteikts, ka komercsabiedrība ir nozīmīga nacionālajai drošībai (grozījumi no 01.10.2026).',
  'Vai SaaS pakalpojums ir mākoņpakalpojums NKDL izpratnē.',
  'Vai MK noteikumi Nr. 397 ir grozīti pēc 2026. gada jūnija likuma grozījumiem.',
  'Kā tieši skaita trīs gadu pašnovērtējuma ciklu.',
  'Vai kompetentajām iestādēm ir oficiāls pašnovērtējuma tests (minēts tikai latviešu valodā).'
];

async function renderNormas(){
  const el = document.getElementById('view-normas');
  const saved = {};
  if(db){ for(const n of NORMS){ const d = await dbGet(pdoc('norms/' + n.id)); if(d) saved[n.id] = d; } }
  const rows = NORMS.map(n => {
    const s = saved[n.id] || {};
    return '<tr><td><strong>' + esc(n.title) + '</strong><br><a class="norm-link" href="' + esc(n.url) + '" target="_blank" rel="noopener">Atvērt avotu</a></td>' +
      '<td>' + esc(n.scope) + (n.note ? '<br><small>' + esc(n.note) + '</small>' : '') + '</td>' +
      '<td>' + esc(n.version) + '</td>' +
      '<td><span class="badge ' + n.badge + '">' + esc(n.status) + '</span>' + (n.read ? '<br><small>Pārlasīts izstrādes laikā: ' + esc(n.read) + '</small>' : '') + '</td>' +
      '<td><input type="date" data-nid="' + n.id + '" data-role="date" value="' + esc(s.date || '') + '" aria-label="Jūsu pārbaudes datums"><input type="text" data-nid="' + n.id + '" data-role="by" value="' + esc(s.by || '') + '" placeholder="Pārbaudīja" aria-label="Pārbaudīja"></td></tr>';
  }).join('');
  el.innerHTML =
    '<div class="card"><div class="section-title">Normatīvā bāze</div><p class="hint">Uz kādiem tiesību aktiem balstīts instrumenta saturs, kas ir pārlasīts avotā un kas nav. Kolonna "Jūsu pārbaude" ir vieta, kur piefiksēt savu pārbaudi pirms atskaites vai tendera izmantošanas.</p>' +
    '<div style="overflow-x:auto"><table><thead><tr><th>Avots</th><th>Ko aptver</th><th>Redakcija</th><th>Statuss</th><th>Jūsu pārbaude</th></tr></thead><tbody>' + rows + '</tbody></table></div></div>' +
    '<div class="card"><div class="section-title">Neatrisināti jautājumi</div><p class="hint">Punkti, kurus instruments nevar izlemt pats un kuros rezultāts jāpārbauda ar juristu vai NKDC.</p><ul>' + NORM_OPEN.map(x => '<li>' + esc(x) + '</li>').join('') + '</ul></div>';
  el.querySelectorAll('input[data-nid]').forEach(inp => {
    let t;
    inp.addEventListener('input', () => {
      clearTimeout(t);
      t = setTimeout(async () => {
        if(db) await dbUpdate(pdoc('norms/' + inp.dataset.nid), {[inp.dataset.role]: inp.value, _updatedAt: Date.now(), _updatedBy: myId});
      }, 600);
    });
  });
}

