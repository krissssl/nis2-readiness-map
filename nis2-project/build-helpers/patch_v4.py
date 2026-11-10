import subprocess
MODULE = open('/tmp/norms_module.js', encoding='utf-8').read()
CSS = ".norm-link{color:var(--accent);font-weight:700}\ntd input[type=date],td input[type=text]{min-width:130px}\n"
def patch(src, dst):
    s = open(src, encoding='utf-8').read()
    def rep(old, new):
        nonlocal s
        assert old in s, 'NOT FOUND: ' + old[:70]
        s = s.replace(old, new, 1)
    rep('<button class="tab" data-view="dati">Dati un atskaite</button>', '<button class="tab" data-view="dati">Dati un atskaite</button>\n    <button class="tab" data-view="normas">Normatīvā bāze</button>')
    rep('<div class="view" id="view-dati"></div>', '<div class="view" id="view-dati"></div>\n  <div class="view" id="view-normas"></div>')
    rep('async function renderAll(){', MODULE + 'async function renderAll(){')
    rep('await renderDati();', 'await renderDati();\n  await renderNormas();')
    rep('</style>', CSS + '</style>')
    open(dst, 'w', encoding='utf-8').write(s)
    open('/tmp/chk4.js', 'w', encoding='utf-8').write(s.split('<script>')[-1].split('</script>')[0])
    r = subprocess.run(['node', '--check', '/tmp/chk4.js'], capture_output=True, text=True)
    print(dst, len(s), 'bytes | syntax:', 'OK' if r.returncode == 0 else r.stderr[:400])
o = '/mnt/user-data/outputs/'
patch(o + 'quant-nis2-tool-v3.html', o + 'quant-nis2-tool-v4.html')
patch(o + 'nis2-client-template-v3.html', o + 'nis2-client-template-v4.html')
