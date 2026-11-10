const pptxgen=require('pptxgenjs');
const {applyTheme}=require('/mnt/skills/public/pptx/scripts/apply_theme.js');
const BG='09090B',FG='FAFAFA',MU='A1A1AA',AC='DFE104',BD='3F3F46',DK='27272A';
const THEME={name:'NIS2 Kinetic',headFontFace:'Arial',bodyFontFace:'Arial',colors:{dk1:BG,lt1:FG,dk2:DK,lt2:MU,accent1:AC,accent2:FG,accent3:MU,accent4:BD,accent5:DK,accent6:AC,hlink:AC,folHlink:MU}};
const pres=new pptxgen();pres.layout='LAYOUT_WIDE';pres.theme={headFontFace:'Arial',bodyFontFace:'Arial'};
pres.title='NIS2 Sagatavotības Karte';
const foot=c=>({text:{text:'NIS2 SAGATAVOTĪBAS KARTE',options:{x:0.6,y:7.0,w:6,h:0.3,fontSize:10,bold:true,color:c,charSpacing:2,margin:0}}});
const ttl=c=>({placeholder:{options:{name:'title',type:'title',x:0.6,y:0.7,w:12.1,h:0.95,fontSize:36,bold:true,color:c,fontFace:'Arial',valign:'top',margin:0},text:''}});
const num=c=>({x:11.9,y:7.0,w:0.8,h:0.3,fontSize:10,color:c,align:'right'});
pres.defineSlideMaster({title:'DARK',background:{color:BG},objects:[foot(MU),ttl(FG)],slideNumber:num(MU)});
pres.defineSlideMaster({title:'ACC',background:{color:AC},objects:[foot(BG),ttl(BG)],slideNumber:num(BG)});
pres.defineSlideMaster({title:'COVER',background:{color:BG}});

const T=(s,t,x,y,w,h,o={})=>s.addText(t,Object.assign({x,y,w,h,margin:0,isTextBox:true,fontFace:'Arial',fontSize:16,color:FG,valign:'top'},o));
const R=(s,x,y,w,h,o={})=>s.addShape(pres.shapes.RECTANGLE,{x,y,w,h,fill:{color:o.fill||BG},line:{color:o.line||BD,width:1.5},objectName:o.name||'Panelis'});
const HL=(s,x,y,w)=>s.addShape(pres.shapes.LINE,{x,y,w,h:0,line:{color:BD,width:1.5}});
const seen={};
const SL=(layout,sec,kick,title)=>{if(!seen[sec]){pres.addSection({title:sec});seen[sec]=1;}
  const s=pres.addSlide({masterName:layout,sectionTitle:sec});
  if(kick)T(s,kick,0.6,0.38,9,0.3,{fontSize:11,bold:true,color:layout==='ACC'?BG:AC,charSpacing:3});
  if(title)s.addText(title.toUpperCase(),{placeholder:'title'});return s;};
const cap=(s,t,y,c=AC)=>T(s,t,0.6,y,12.1,0.5,{fontSize:18,bold:true,color:c});

// 1 cover
{const s=pres.addSlide({masterName:'COVER',sectionTitle:'Ievads'});pres.addSection({title:'Ievads'});
 T(s,'NIS2 · NACIONĀLĀS KIBERDROŠĪBAS LIKUMS',0.6,0.8,10,0.3,{fontSize:12,bold:true,color:AC,charSpacing:3});
 s.addText([{text:'NIS2',options:{breakLine:true}},{text:'SAGATAVOTĪBAS '},{text:'KARTE',options:{color:AC}}],{x:0.6,y:1.5,w:12.1,h:3.2,fontSize:66,bold:true,color:FG,fontFace:'Arial',margin:0,isTextBox:true,valign:'top',lineSpacingMultiple:0.92});
 T(s,'No neskaidrības līdz rīcības plānam: kiberdrošības atbilstība apsardzes nozarē',0.6,5.1,9.5,0.9,{fontSize:22,color:MU});
 T(s,'2026. gada oktobris',0.6,6.8,4,0.3,{fontSize:12,bold:true,color:MU,charSpacing:2});
 R(s,10.1,5.0,2.6,1.8,{fill:AC,line:AC,name:'Zīmola bloks'});T(s,'NIS2·LV',10.1,5.0,2.6,1.8,{fontSize:34,bold:true,color:BG,align:'center',valign:'middle'});}
// 2 agenda
{const s=SL('DARK','Ievads','PROGRAMMA','Kas šodien tiks apskatīts');
 [['01','Regulējums','6 min'],['02','Produkts','12 min'],['03','Metodoloģija','6 min'],['04','Pierādījumi','3 min'],['05','Nākamie soļi','3 min']].forEach((r,i)=>{const y=1.95+i*0.95;HL(s,0.6,y,12.1);
  T(s,r[0],0.6,y+0.15,1.4,0.7,{fontSize:36,bold:true,color:AC});T(s,r[1],2.1,y+0.2,7,0.7,{fontSize:30,bold:true});T(s,r[2],10.2,y+0.28,2.5,0.5,{fontSize:22,color:MU,align:'right'});});}
// 3 timeline
{const s=SL('DARK','Regulējums','REGULĒJUMS · 01','NIS2 Latvijā: hronoloģija');
 [['01.09.2024','Nacionālās kiberdrošības likums stājas spēkā'],['02.07.2025','MK noteikumi Nr. 397 nosaka minimālās prasības'],['18.06.2026','Grozījumi likumā: personāls, pašnovērtējums, audits'],['01.10.2026','Grozījumi par nacionālajai drošībai nozīmīgiem subjektiem (20. p. 11. d.)']].forEach((d,i)=>{const x=0.6+i*3.025,hot=i===3;
  R(s,x,2.0,3.025,3.7,{fill:hot?AC:BG,line:hot?AC:BD});T(s,d[0],x+0.3,2.35,2.5,0.6,{fontSize:28,bold:true,color:hot?BG:AC});T(s,d[1],x+0.3,3.25,2.45,2.2,{fontSize:17,color:hot?BG:FG});});
 cap(s,'Likums mainās regulāri: pirms lēmumiem pārbaudiet aktuālo redakciju likumi.lv.',6.05,MU);}
// 4 why
{const s=SL('DARK','Regulējums','REGULĒJUMS · 02','Kāpēc NIS2 skar apsardzi');
 [['01','Nozare','Apsardzes pakalpojumi ir tieši minēti likuma 21. panta 1. daļas 2. punktā.'],['02','Ostas un valsts objekti','Nozīmīguma kritērijs (20. p. 11. d.) darbojas neatkarīgi no uzņēmuma lieluma.'],['03','Klientu piegādes ķēde','Bankas un citi NIS2 subjekti pārbaudīs apakšuzņēmējus (MK not. 397, 86.–107. p.).']].forEach((c,i)=>{const x=0.6+i*4.1;
  R(s,x,2.0,3.9,4.4);T(s,c[0],x+0.3,2.25,3,0.9,{fontSize:54,bold:true,color:AC});T(s,c[1],x+0.3,3.3,3.3,0.9,{fontSize:24,bold:true});T(s,c[2],x+0.3,4.45,3.3,1.8,{fontSize:16,color:MU});});}
// 5 obligations
{const s=SL('DARK','Regulējums','REGULĒJUMS · 03','Pienākumi un termiņi');
 [['Paziņot NKDC par statusu','1 mēnesis','NKDL 22. p.'],['Iecelt kiberdrošības vadītāju','3 mēneši','NKDL 25. p.'],['Paziņot NKDC par vadītāju','5 darba dienas','397. not. 10. p.'],['Izstrādāt četrus obligātos dokumentus','obligāti','397. not. 21. p.'],['Pirmā pašnovērtēšana','līdz 1. okt. vai 3 mēn.','397. not. 142.–143. p.']].forEach((r,i)=>{const y=1.95+i*0.88;HL(s,0.6,y,12.1);
  T(s,r[0],0.6,y+0.2,6.2,0.6,{fontSize:20,bold:true});T(s,r[1],6.9,y+0.2,3.7,0.6,{fontSize:20,bold:true,color:AC});T(s,r[2],10.7,y+0.25,2.0,0.6,{fontSize:13,color:MU});});}
// 6 incidents + fines
{const s=SL('DARK','Regulējums','REGULĒJUMS · 04','Incidenti un sodi');
 [['24 st.','Agrīnais brīdinājums','Pirmā reakcija uz nozīmīgu incidentu.'],['72 st.','Sākotnējais ziņojums','Pirmais izvērtējums un ietekme.'],['1 mēn.','Galaziņojums','Cēloņi, seku novēršana, secinājumi; 1 mēnesis pēc sākotnējā ziņojuma.']].forEach((r,i)=>{const y=1.95+i*1.38;HL(s,0.6,y,7.0);
  T(s,r[0],0.6,y+0.2,2.5,0.8,{fontSize:38,bold:true,color:AC});T(s,r[1],3.2,y+0.2,4.4,0.4,{fontSize:20,bold:true});T(s,r[2],3.2,y+0.65,4.4,0.7,{fontSize:14,color:MU});});
 R(s,8.2,1.95,4.5,2.0,{fill:AC,line:AC});T(s,'10 milj. €',8.5,2.15,4,0.9,{fontSize:44,bold:true,color:BG});T(s,'maksimālais sods būtiskiem pakalpojumu sniedzējiem',8.5,3.1,3.9,0.7,{fontSize:15,color:BG});
 R(s,8.2,4.2,4.5,2.0);T(s,'7 milj. €',8.5,4.4,4,0.9,{fontSize:44,bold:true,color:AC});T(s,'maksimālais sods svarīgiem pakalpojumu sniedzējiem',8.5,5.35,3.9,0.7,{fontSize:15,color:MU});
 cap(s,'Procesam jābūt gatavam pirms incidenta, nevis tā laikā.',6.45);}
// 7 product overview
{const s=SL('DARK','Produkts','PRODUKTS · 01','Produkts vienā skatā');
 [['1','Piemērojamības vednis','Statuss ar pamatojumu un atsaucēm'],['2','Aktīvu katalogs','Visas sistēmas ar klasēm A, B, C'],['3','Robu analīze','10 likuma kategorijas, prioritātes'],['4','Dokumenti','Četri obligātie dokumenti'],['5','Pārbaudes un apmācība','Instrukcijas un trekeris'],['6','Ceļvedis un atskaite','Progress, atskaite, rezerves kopija']].forEach((c,i)=>{const x=0.6+(i%3)*4.033,y=1.95+Math.floor(i/3)*2.0;
  R(s,x,y,4.033,2.0);T(s,c[0],x+0.3,y+0.2,1,0.6,{fontSize:32,bold:true,color:AC});T(s,c[1],x+0.3,y+0.85,3.5,0.5,{fontSize:21,bold:true});T(s,c[2],x+0.3,y+1.4,3.5,0.5,{fontSize:14,color:MU});});
 cap(s,'Viena vide visam ceļam: no statusa noteikšanas līdz ikgadējai uzturēšanai.',6.15,MU);}
// 8 audience
{const s=SL('DARK','Produkts','PRODUKTS · 02','Kam un ko tas dod');
 [['VADĪBA','Skaidrs lēmums','Statuss, sodu un termiņu skaidrojums, pamatojums ar atsaucēm uz likumu.'],['KIBERDROŠĪBAS VADĪTĀJS','Darba plāns','Prioritātes, uzdevumi un progress vienā Ceļvedī.'],['IT UN DROŠĪBAS SPECIĀLISTI','Konkrēti uzdevumi','Aktīvu uzskaite un tehnisko pārbaužu saraksts ar instrukcijām.']].forEach((c,i)=>{const x=0.6+i*4.1,hot=i===1;
  R(s,x,2.0,3.9,3.9,{fill:hot?AC:BG,line:hot?AC:BD});T(s,c[0],x+0.3,2.3,3.3,0.5,{fontSize:12,bold:true,color:hot?BG:AC,charSpacing:2});T(s,c[1],x+0.3,3.0,3.3,1.2,{fontSize:30,bold:true,color:hot?BG:FG});T(s,c[2],x+0.3,4.35,3.3,1.4,{fontSize:16,color:hot?BG:MU});});
 cap(s,'Izstrādāts apsardzes nozarei; vednis un metodika der jebkuram uzņēmumam Latvijā.',6.2,MU);}
// 9 wizard
{const s=SL('DARK','Produkts','PRODUKTS · 03','Piemērojamības vednis');
 ['Jurisdikcija: Latvija','Organizācijas veids','Īpašās kategorijas','Nozare: apsardze','Uzņēmuma lielums','Vienīgais piegādātājs','Nozīmīguma kritērijs'].forEach((t,i)=>{const y=1.95+i*0.64;HL(s,0.6,y,5.4);T(s,String(i+1),0.6,y+0.12,0.6,0.5,{fontSize:18,bold:true,color:AC});T(s,t,1.2,y+0.14,4.8,0.5,{fontSize:18});});
 [['Būtisks pakalpojumu sniedzējs','Stingrākie termiņi, sods līdz 10 milj. €.',1],['Svarīgs pakalpojumu sniedzējs','Pienākumi un termiņi, sods līdz 7 milj. €.',0],['Formāli ārpus tvēruma','NKDC joprojām var lemt citādi (22. p. 5. d.).',0]].forEach((o,i)=>{const y=1.95+i*1.65;
  R(s,6.6,y,6.1,1.45,{fill:o[2]?AC:BG,line:o[2]?AC:BD});T(s,o[0],6.9,y+0.25,5.5,0.5,{fontSize:22,bold:true,color:o[2]?BG:FG});T(s,o[1],6.9,y+0.8,5.5,0.5,{fontSize:15,color:o[2]?BG:MU});});}
// 10 gap analysis
{const s=SL('DARK','Produkts','PRODUKTS · 04','Robu analīze: 10 kategorijas');
 ['Politikas un risku vadība','Incidentu pārvaldība','Nepārtrauktība un krīzes vadība','Piegādes ķēde','Sistēmu drošība un ievainojamības','Pasākumu efektivitātes novērtēšana','Kiberhigiēna un apmācība','Kriptogrāfija','Personāls, piekļuve, aktīvi','MFA un droša saziņa'].forEach((t,i)=>{const x=0.6+(i%5)*2.42,y=1.95+Math.floor(i/5)*2.05;
  R(s,x,y,2.42,2.05);T(s,'abcdefghij'[i],x+0.25,y+0.2,1,0.7,{fontSize:36,bold:true,color:AC});T(s,t,x+0.25,y+0.95,1.95,1.0,{fontSize:15,bold:true});});
 cap(s,'Katram punktam: atbilstība (Jā / Daļēji / Nē / N/A) un briedums 0–5.',6.25,MU);}
// 11 evidence
{const s=SL('DARK','Produkts','PRODUKTS · 05','Pierādījumi, nevis atzīmes');
 [['AIZPILDĪTS','Atbilde ievadīta. Nenozīmē, ka pasākums ir ieviests.',0],['PIERĀDĪTS','Norādīts dokuments un pārbaudes datums.',1],['NAV APSTIPRINĀTS','Atbilde "Jā" vai "Daļēji" bez pierādījuma.',0]].forEach((c,i)=>{const x=0.6+i*4.1,hot=c[2];
  R(s,x,2.0,3.9,3.3,{fill:hot?AC:BG,line:hot?AC:BD});T(s,c[0],x+0.3,2.35,3.3,1.0,{fontSize:28,bold:true,color:hot?BG:FG});T(s,c[1],x+0.3,3.7,3.3,1.4,{fontSize:17,color:hot?BG:MU});});
 cap(s,'Progress ir aizpildīšanas rādītājs, nevis atbilstības apliecinājums.',5.75);
 T(s,'Katrai mērķa pārbaudei: dokuments, datums un atbildīgais.',0.6,6.3,12.1,0.4,{fontSize:15,color:MU});}
// 12 assets docs checks training
{const s=SL('DARK','Produkts','PRODUKTS · 06','Aktīvi, dokumenti, pārbaudes');
 [['Aktīvu katalogs','Serveri, CRM, signalizācijas ar attālināto piekļuvi, kameras, e-pasts un mājaslapa vienā sarakstā. AI iesaka klasi A, B vai C, cilvēks apstiprina (397. not. 31. p.).'],['Četri obligātie dokumenti','Kiberdrošības politika, IKT resursu katalogs, risku un nepārtrauktības plāns, incidentu žurnāls. AI sagatavo melnrakstu, cilvēks to apstiprina.'],['Tehniskās pārbaudes','Konkrētas instrukcijas, kā uzņēmums pats var pārbaudīt drošības stāvokli, piemēram, vai MFA ir ieslēgta. Rezultāts un datums tiek fiksēti.'],['Apmācības','Trekeris savienojas ar uzņēmuma Mācību centru: kiberdrošības tēmas ieliek jau esošajā programmā.']].forEach((c,i)=>{const x=0.6+(i%2)*6.15,y=1.95+Math.floor(i/2)*2.3;
  R(s,x,y,5.95,2.1);T(s,c[0],x+0.3,y+0.25,5.4,0.5,{fontSize:22,bold:true,color:AC});T(s,c[1],x+0.3,y+0.85,5.4,1.15,{fontSize:15,color:MU});});}
// 13 collaboration + report
{const s=SL('DARK','Produkts','PRODUKTS · 07','Kopīgs darbs un atskaite');
 T(s,'VIENA VIDE. VAIRĀKI CILVĒKI.',0.6,2.0,4.8,3.2,{fontSize:40,bold:true,color:AC});
 [['Vairāki lietotāji','Katalogu un robu analīzi aizpilda vairāki cilvēki vienlaikus.'],['Ceļvedis','Vizuāls pārskats par visām fāzēm ar automātiski aprēķinātu progresu.'],['Atskaite un rezerves kopija','Atskaite drukāšanai vai PDF, projekta eksports un imports ar pārbaudi.'],['Gatavības apliecinājums','Teksts tenderiem veidojas no pierādītiem datiem, līmeņi 0–2.']].forEach((r,i)=>{const y=1.95+i*1.18;HL(s,6.0,y,6.7);
  T(s,r[0],6.0,y+0.15,6.7,0.4,{fontSize:20,bold:true});T(s,r[1],6.0,y+0.6,6.7,0.5,{fontSize:15,color:MU});});}
// 14 phases + timeline
{const s=SL('DARK','Metodoloģija','METODOLOĢIJA · 01','Piecu fāžu projekts');
 const x0=4.6,mw=(12.7-4.6)/6;
 for(let m=0;m<6;m++){T(s,'mēn. '+(m+1),x0+m*mw,1.85,mw,0.3,{fontSize:12,color:MU,align:'center'});s.addShape(pres.shapes.LINE,{x:x0+m*mw,y:2.25,w:0,h:3.85,line:{color:DK,width:1}});}
 [['0 Mandāts',0,0.5,'1–2 ned.'],['1 Novērtējums',0.5,1.25,'3–4 ned.'],['2 Projektēšana',1.25,2.5,'4–6 ned.'],['3 Ieviešana',2.5,5.0,'2–3 mēn.'],['4 Apmācība un tests',4.5,5.5,'1 mēn.'],['5 Uzturēšana',5.5,6.0,'pastāvīgi']].forEach((r,i)=>{const y=2.4+i*0.62;
  T(s,r[0],0.6,y+0.02,3.9,0.4,{fontSize:18,bold:true});R(s,x0+r[1]*mw,y+0.03,(r[2]-r[1])*mw,0.34,{fill:AC,line:AC,name:'Fāzes josla'});
  if(i<5)T(s,r[3],x0+r[2]*mw+0.12,y+0.06,1.6,0.3,{fontSize:13,color:MU});else T(s,r[3],x0+r[1]*mw-1.7,y+0.06,1.6,0.3,{fontSize:13,color:MU,align:'right'});});
 cap(s,'Orientējošs grafiks: ilgumi atkarīgi no iesaistīto cilvēku pieejamības. Fāze 0 ir vadības mandāts.',6.3,MU);}
// 15 roles
{const s=SL('DARK','Metodoloģija','METODOLOĢIJA · 02','Lomas projektā');
 [['Vadība','Mandāts un apjoms.'],['Atbildīgā persona','Projekta vadība un saziņa ar NKDC.'],['IT un drošība','Aktīvi, pārbaudes, ieviešana.'],['Jurists','Ostu apsardzes statusa jautājums.']].forEach((c,i)=>{const x=0.6+i*3.075;
  R(s,x,2.0,2.95,3.6);T(s,String(i+1),x+0.3,2.25,1,0.8,{fontSize:44,bold:true,color:AC});T(s,c[0],x+0.3,3.3,2.4,0.9,{fontSize:22,bold:true});T(s,c[1],x+0.3,4.3,2.4,1.1,{fontSize:16,color:MU});});}
// 16 levels
{const s=SL('DARK','Metodoloģija','METODOLOĢIJA · 03','Trīs gatavības līmeņi');
 [['LĪMENIS 0','Apzināšanās','Piemērojamība izvērtēta, gatavošanās notiek sistemātiski.'],['LĪMENIS 1','Strukturēts pašnovērtējums','Pašnovērtējums veikts, ir rīcības plāns ar termiņiem.'],['LĪMENIS 2','Dokumentēti pasākumi','Vismaz 60% punktu ar pierādījumu, politikas apstiprinātas, pārbaudes veiktas.']].forEach((c,i)=>{const x=0.6+i*4.1,hot=i===2;
  R(s,x,2.0,3.9,3.7,{fill:hot?AC:BG,line:hot?AC:BD});T(s,c[0],x+0.3,2.3,3.3,0.4,{fontSize:12,bold:true,color:hot?BG:AC,charSpacing:2});T(s,c[1],x+0.3,2.95,3.3,1.2,{fontSize:26,bold:true,color:hot?BG:FG});T(s,c[2],x+0.3,4.3,3.3,1.3,{fontSize:15,color:hot?BG:MU});});
 cap(s,'Apliecinājums veidojas no ievadītajiem datiem, tāpēc nevar solīt vairāk, nekā pierādīts.',6.1);}
// 17 pilot
{const s=SL('DARK','Pierādījumi','PIERĀDĪJUMI · 01','Pilots: reāls uzņēmums');
 R(s,0.6,1.95,4.2,4.3,{fill:AC,line:AC,name:'Pilota skaitlis'});T(s,'145',0.9,2.2,3.6,1.6,{fontSize:90,bold:true,color:BG});T(s,'darbinieki (VID dati, 2025)',0.9,3.95,3.6,0.5,{fontSize:17,bold:true,color:BG});T(s,'Ostu un valsts objektu apsardze, tehniskā apsardze.',0.9,4.7,3.6,1.2,{fontSize:15,color:BG});
 [['STATUSS','Trīs pamati','Nozare, ostu apsardze un nozīmīguma kritērijs. Ostu jautājums tiek precizēts.'],['PIRMAIS ROBS','Nav vienota kataloga','IT atbildība sadalīta starp cilvēkiem, vienota IKT resursu kataloga nav.'],['STIPRĀ PUSE','Mācību centrs','Kiberapmācību var iebūvēt jau esošajā uzņēmuma programmā.']].forEach((r,i)=>{const y=1.95+i*1.5;
  R(s,5.2,y,7.5,1.35);T(s,r[0],5.5,y+0.18,2.2,0.3,{fontSize:11,bold:true,color:AC,charSpacing:2});T(s,r[1],5.5,y+0.5,2.8,0.7,{fontSize:20,bold:true});T(s,r[2],8.4,y+0.2,4.1,1.0,{fontSize:14,color:MU});});}
// 18 open sources
{const s=SL('DARK','Pierādījumi','PIERĀDĪJUMI · 02','Ko parāda atklātie avoti');
 [['APSTIPRINĀTS',['Ir privātuma politika (GDPR)','Ir mācību centrs','Ir apsardzes darbības licences'],1],['ZINĀMS DAĻĒJI',['Kvalitātes politikas saturs','Vai apmācībās ir kiberdrošības tēmas'],0],['JĀPRECIZĒ IEKŠĒJI',['Incidentu process IT sistēmām','Dublēšana un atjaunošana','Piegādātāju pārbaude'],0]].forEach((c,i)=>{const x=0.6+i*4.1,hot=c[2];
  R(s,x,2.0,3.9,3.9,{fill:hot?AC:BG,line:hot?AC:BD});T(s,c[0],x+0.3,2.3,3.3,0.4,{fontSize:13,bold:true,color:hot?BG:AC,charSpacing:2});
  T(s,c[1].map((t,j)=>({text:t,options:{breakLine:j<c[1].length-1,paraSpaceAfter:10}})),x+0.3,3.0,3.35,2.7,{fontSize:17,color:hot?BG:FG});});
 cap(s,'Rīks nemin atbildes: katrai kategorijai tas parāda, kam jautāt uzņēmumā.',6.2,MU);}
// 19 benefits (accent)
{const s=SL('ACC','Nākamie soļi','NĀKAMIE SOĻI · 01','Ieguvumi');
 [['SKAIDRĪBA','Statuss ar pamatojumu un atsaucēm.'],['ĀTRUMS','Gatavs darba rīks, nav jāsāk no nulles.'],['PIERĀDĀMĪBA','Dokumenti un progress, ko var parādīt klientam.'],['KONKURĒTSPĒJA','Priekšrocība tenderos un klientu pārbaudēs.']].forEach((c,i)=>{const x=0.6+(i%2)*6.15,y=2.0+Math.floor(i/2)*2.3;
  T(s,c[0],x,y,5.8,0.9,{fontSize:38,bold:true,color:BG});T(s,c[1],x,y+1.0,5.6,0.8,{fontSize:19,color:BG});});}
// 20 limits
{const s=SL('DARK','Nākamie soļi','NĀKAMIE SOĻI · 02','Ko rīks nedara');
 [['Nav juridisks atzinums','Statusu var citādi noteikt NKDC (NKDL 22. p. 5. d.). Sarežģītos gadījumos vajadzīga jurista konsultācija.'],['Nav pentests','Ielaušanās testēšanu veic sertificēts neatkarīgs partneris (MK not. Nr. 397, 131.–134. p.).'],['Pierādīts nenozīmē pārbaudīts saturs','Rīks pārbauda, vai norādīts dokuments un datums, nevis paša dokumenta saturu.'],['Likums mainās','Normatīvā bāze pārbaudīta 28.09.2026; MK not. Nr. 397 grozījumi pēc jūnija jāapstiprina.']].forEach((r,i)=>{const y=1.95+i*1.2;HL(s,0.6,y,12.1);
  T(s,'0'+(i+1),0.6,y+0.2,0.9,0.6,{fontSize:28,bold:true,color:AC});T(s,r[0],1.7,y+0.15,10.9,0.4,{fontSize:21,bold:true});T(s,r[1],1.7,y+0.62,10.9,0.5,{fontSize:15,color:MU});});}
// 21 next steps
{const s=SL('DARK','Nākamie soļi','NĀKAMIE SOĻI · 03','Četri soļi, lai sāktu');
 ['Vadības mandāts un atbildīgā persona','Piekļuve rīkam 2–3 IT un drošības speciālistiem','Apgrozījuma un bilances dati statusa precizēšanai','Jurista konsultācija vai pieprasījums NKDC par ostu apsardzi'].forEach((t,i)=>{const y=1.95+i*1.2;
  R(s,0.6,y,0.95,0.95,{fill:AC,line:AC,name:'Soļa numurs'});T(s,String(i+1),0.6,y,0.95,0.95,{fontSize:36,bold:true,color:BG,align:'center',valign:'middle'});T(s,t,1.85,y+0.1,10.8,0.8,{fontSize:24,bold:true,valign:'middle'});});}
// 22 thanks
{const s=pres.addSlide({masterName:'COVER',sectionTitle:'Nākamie soļi'});
 s.addText([{text:'PALDIES'},{text:'!',options:{color:AC}}],{x:0.6,y:0.9,w:12.1,h:2.2,fontSize:100,bold:true,color:FG,fontFace:'Arial',margin:0,isTextBox:true,valign:'top'});
 T(s,'Jautājumi un diskusija',0.6,3.2,12,0.7,{fontSize:30,bold:true,color:AC});
 HL(s,0.6,4.6,12.1);
 [['E-PASTS','info@quantrum.lv'],['TĀLRUNIS','+371 26582076'],['ADRESE','Tallinas 95 - 206, Rīga'],['TĪMEKLIS','quant.lv']].forEach((c,i)=>{const x=0.6+i*3.075;T(s,c[0],x,4.95,2.9,0.3,{fontSize:11,bold:true,color:AC,charSpacing:2});T(s,c[1],x,5.35,2.9,0.9,{fontSize:18,bold:true});});}

const OUT='/mnt/user-data/outputs/NIS2_Sagatavotibas_Karte_v2.pptx';
pres.writeFile({fileName:OUT}).then(()=>applyTheme(OUT,THEME)).then(()=>console.log('written',OUT));
