import re, subprocess
MODULE = open('/tmp/dati_module.js', encoding='utf-8').read()
CSS = ".mono-ta{font-family:'IBM Plex Mono',monospace;font-size:.8rem;min-height:160px}\n.hint[data-err=\"1\"]{color:var(--accent);font-weight:700}\n"

def patch(src, dst):
    s = open(src, encoding='utf-8').read()
    def rep(old, new):
        nonlocal s
        assert old in s, 'NOT FOUND: ' + old[:70]
        s = s.replace(old, new, 1)
    rep('<button class="tab" data-view="partneri">Partneri</button>',
        '<button class="tab" data-view="partneri">Partneri</button>\n    <button class="tab" data-view="dati">Dati un atskaite</button>')
    rep('<div class="view" id="view-partneri"></div>', '<div class="view" id="view-partneri"></div>\n  <div class="view" id="view-dati"></div>')
    rep('async function renderAll(){', MODULE + 'async function renderAll(){')
    rep('await renderPartneri();', 'await renderPartneri();\n  await renderDati();')
    rep('</style>', CSS + '</style>')
    open(dst, 'w', encoding='utf-8').write(s)
    script = s.split('<script>')[-1].split('</script>')[0]
    open('/tmp/chk3.js', 'w', encoding='utf-8').write(script)
    r = subprocess.run(['node', '--check', '/tmp/chk3.js'], capture_output=True, text=True)
    print(dst, len(s), 'bytes | syntax:', 'OK' if r.returncode == 0 else r.stderr[:400])
    return script

o = '/mnt/user-data/outputs/'
script = patch(o + 'quant-nis2-tool-v2.html', o + 'quant-nis2-tool-v3.html')
patch(o + 'nis2-client-template-v2.html', o + 'nis2-client-template-v3.html')

# behavioural test of sanitizer + report (hostile input)
consts = ''
for name in ['PASE_FIELDS', 'CONTROLS', 'OPEN_QUESTIONS', 'TECH_CHECKS', 'TRAINING_MODULES', 'REQUIRED_POLICIES', 'PARTNER_CATEGORIES']:
    m = re.search(r'const ' + name + r' = \[[\s\S]*?\n\];', script); assert m, name
    consts += m.group(0) + '\n'
helpers = re.search(r'function esc\(v\)[\s\S]*?(?=function refreshEvBadge)', script).group(0)
test = 'var window = {}; var document = {}; var controlsCache = {a1:{compliance:"Jā",evidence:"<img src=x onerror=alert(1)>",evDate:"2026-10-01",evOwner:"J \\"J\\""}, b1:{compliance:"Daļēji"}};\n' + consts + helpers + MODULE + r'''
const raw = {schema:'nis2-karte', version:2, exportedAt:'2026-10-02', pase:{uznemums:'SIA "Test" <b>', evil:'x'}, applicability:[{n:1,title:'T',status:'purple'},{n:'x'}], controls:{a1:{compliance:'Jā',maturity:7,evidence:'doc',evDate:'bad'}, zzz:{compliance:'Jā'}}, assets:[{id:'../hack',name:'x'},{id:'a1',name:'Sys',klase:'Z'}], policies:{pol1:{status:'Apstiprināts',draft:'t',version:3}}};
const r = datiSanitize(raw);
console.log('pase keys:', Object.keys(r.clean.pase).join(','), '| bases:', r.clean.applicability.length, r.clean.applicability[0].status);
console.log('controls:', JSON.stringify(r.clean.controls));
console.log('assets kept:', r.clean.assets.length, '| bad klase ->', JSON.stringify(r.clean.assets[0].klase));
try { datiSanitize({schema:'x'}); } catch(e){ console.log('rejects foreign file:', e.message); }
try { datiSanitize({schema:'nis2-karte', version:9}); } catch(e){ console.log('rejects newer version:', e.message); }
const rep = buildReportHtml({pase:{uznemums:'SIA "Test" <script>alert(1)</script>'}, controls:controlsCache, applicability:[], assets:[], policies:{}, techChecks:{}, training:{}, questions:{}, wizard:{}});
console.log('raw <script> in report:', rep.includes('<script>alert'), '| raw <img> in report:', rep.includes('<img src=x'), '| report bytes:', rep.length);
'''
open('/tmp/t3.js', 'w', encoding='utf-8').write(test)
res = subprocess.run(['node', '/tmp/t3.js'], capture_output=True, text=True)
print(res.stdout, res.stderr[:500])
