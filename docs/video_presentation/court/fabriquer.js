/* Fabrique une vidéo courte à partir de son scénario.
   Usage : node fabriquer.js <id> [etape]   (etape : voix | enregistrer | assembler ; sans étape : tout)
   Dossier de travail (hors du dépôt) : C:/Users/Denis/video_travail (voix/, <id>/). Sortie finale : <id>/<id>.mp4
   Image de l'application en haut (1280 x 720), bande noire AJOUTÉE dessous (96 px) pour les sous-titres en blanc : la bande ne coupe jamais l'image. */
const fs = require('fs'), cp = require('child_process'), path = require('path');
const { chromium } = require('playwright');
const { CURSEUR, creer } = require('./lib');
const VT = process.env.VIDEO_TRAVAIL || 'C:/Users/Denis/video_travail';
const FF = fs.readFileSync(VT + '/ffmpeg_path.txt', 'utf8').trim();
const FP = FF.replace(/ffmpeg\.exe$/, 'ffprobe.exe');
const PY = 'C:/Users/Denis/piper_venv/Scripts/python.exe';
const id = process.argv[2], etape = process.argv[3] || 'tout';
const sc = require('./scenarios/' + id + '.js');
const D = VT + '/' + id; fs.mkdirSync(D + '/blocs', { recursive: true }); fs.mkdirSync(D + '/brut', { recursive: true });
const f3 = n => n.toFixed(3);
const hms = (s, sep) => { const h = Math.floor(s / 3600), m = Math.floor(s % 3600 / 60), x = s % 60; return String(h).padStart(2, '0') + ':' + String(m).padStart(2, '0') + ':' + String(Math.floor(x)).padStart(2, '0') + sep + String(Math.round((x % 1) * 1000)).padStart(3, '0'); };

function voix() {
  fs.writeFileSync(D + '/blocs.json', JSON.stringify(sc.blocs, null, 1));
  const r = cp.spawnSync(PY, ['-I', path.join(__dirname, 'voix_court.py'), VT, id], { encoding: 'utf8' }); console.log(r.stdout, r.stderr.slice(-300));
  const b = JSON.parse(fs.readFileSync(D + '/blocs.json', 'utf8'));
  for (const x of b) x.duree = +cp.execFileSync(FP, ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', D + '/blocs/' + x.id + '.wav']).toString().trim();
  fs.writeFileSync(D + '/blocs.json', JSON.stringify(b, null, 1));
  console.log('voix totale', b.reduce((a, x) => a + x.duree + 0.35, 0).toFixed(1), 's');
}

async function enregistrer() {
  const blocs = JSON.parse(fs.readFileSync(D + '/blocs.json', 'utf8')); const duree = {}; blocs.forEach(b => { duree[b.id] = b.duree; });
  for (const f of fs.readdirSync(D + '/brut')) fs.unlinkSync(D + '/brut/' + f);
  const b = await chromium.launch(sc.navigateur || {});
  const ctx = await b.newContext(Object.assign({ viewport: { width: 1280, height: 720 }, acceptDownloads: true, recordVideo: { dir: D + '/brut', size: { width: 1280, height: 720 } } }, sc.contexte || {}));
  await ctx.addInitScript(CURSEUR);
  const p = await ctx.newPage(); p.errs = []; global.PG = p;
  p.on('pageerror', e => p.errs.push(String(e).slice(0, 160)));
  const o = creer(p, duree); o.top();
  o.ctx = ctx; o.D = D; o.VT = VT;
  const tRes = { debut: 0 };
  o.commencer = () => { tRes.debut = o.maint(); o.finVoix = o.maint(); console.log('début du film à', tRes.debut.toFixed(2)); };
  await sc.jouer(o);
  const fin = o.maint(); const video = p.video();
  console.log('erreurs de page :', p.errs);
  await ctx.close();
  const brut = await video.path();
  fs.writeFileSync(D + '/timeline.json', JSON.stringify({ tDebut: tRes.debut, fin: fin + 0.6, depart: o.depart, fichier: brut }, null, 1));
  await b.close(); console.log('fini, durée brute', (fin - tRes.debut).toFixed(1), 's');
}

function assembler() {
  const tl = JSON.parse(fs.readFileSync(D + '/timeline.json', 'utf8')); const blocs = JSON.parse(fs.readFileSync(D + '/blocs.json', 'utf8'));
  const t0 = tl.tDebut, duree = tl.fin - t0; const BANDE = 96, H = 720 + BANDE;
  const cues = blocs.map(b => ({ d: tl.depart[b.id] - t0, f: tl.depart[b.id] - t0 + b.duree + 0.25, t: b.sous_titre }));
  // Le sous-titre reste affiché jusqu'au suivant (la voix se tait pendant les gestes, le texte aide à suivre).
  cues.forEach((c, i) => { if (cues[i + 1]) c.f = cues[i + 1].d - 0.05; else c.f = duree - 0.05; });
  // Sous-titres en blanc sur la bande noire, sous l'image (ASS : taille exacte, pas de mise à l'échelle surprise).
  const ass = t => { const h = Math.floor(t / 3600), m = Math.floor(t % 3600 / 60), x = t % 60; return h + ':' + String(m).padStart(2, '0') + ':' + x.toFixed(2).padStart(5, '0'); };
  fs.writeFileSync(D + '/sous.ass', '[Script Info]\nScriptType: v4.00+\nPlayResX: 1280\nPlayResY: ' + H + '\nWrapStyle: 0\n\n[V4+ Styles]\n' +
    'Format: Name,Fontname,Fontsize,PrimaryColour,SecondaryColour,OutlineColour,BackColour,Bold,Italic,Underline,StrikeOut,ScaleX,ScaleY,Spacing,Angle,BorderStyle,Outline,Shadow,Alignment,MarginL,MarginR,MarginV,Encoding\n' +
    'Style: Defaut,Arial,28,&H00FFFFFF,&H00FFFFFF,&H00000000,&H00000000,-1,0,0,0,100,100,0,0,1,0,0,2,50,50,16,1\n\n[Events]\nFormat: Layer,Start,End,Style,Name,MarginL,MarginR,MarginV,Effect,Text\n' +
    cues.map(c => 'Dialogue: 0,' + ass(c.d) + ',' + ass(c.f) + ',Defaut,,0,0,0,,' + c.t).join('\n') + '\n', 'utf8');
  fs.writeFileSync(D + '/sous.srt', cues.map((c, i) => (i + 1) + '\n' + hms(c.d, ',') + ' --> ' + hms(c.f, ',') + '\n' + c.t).join('\n\n') + '\n', 'utf8');
  const entrees = ['-i', tl.fichier]; const filtres = [];
  filtres.push('[0:v]trim=start=' + f3(t0) + ':end=' + f3(tl.fin) + ',setpts=PTS-STARTPTS,fps=25,pad=1280:' + H + ':0:0:black,' +
    'ass=sous.ass,format=yuv420p[v]');
  const labels = [];
  blocs.forEach((b, i) => { entrees.push('-i', D + '/blocs/' + b.id + '.wav'); const ms = Math.round((tl.depart[b.id] - t0) * 1000); filtres.push('[' + (i + 1) + ':a]aresample=44100,adelay=' + ms + '|' + ms + '[a' + i + ']'); labels.push('[a' + i + ']'); });
  filtres.push(labels.join('') + 'amix=inputs=' + blocs.length + ':normalize=0:dropout_transition=0,loudnorm=I=-16:TP=-1.5:LRA=11[voix]');
  const sortie = D + '/' + id + '.mp4';
  const args = ['-hide_banner', '-y'].concat(entrees, ['-filter_complex', filtres.join(';'), '-map', '[v]', '-map', '[voix]', '-t', f3(duree), '-c:v', 'libx264', '-crf', '24', '-preset', 'medium', '-c:a', 'aac', '-b:a', '112k', '-movflags', '+faststart', sortie]);
  const r = cp.spawnSync(FF, args, { cwd: D, encoding: 'utf8', maxBuffer: 1e8 });
  console.log(sortie, r.status, r.status ? r.stderr.slice(-900) : 'durée ' + duree.toFixed(1) + ' s');
}

(async () => {
  if (etape === 'tout' || etape === 'voix') voix();
  if (etape === 'tout' || etape === 'enregistrer') await enregistrer().catch(async e => { console.error('ERREUR', String(e).slice(0, 400)); try { await global.PG.screenshot({ path: D + '/erreur.png' }); } catch (x) {} process.exit(1); });
  if (etape === 'tout' || etape === 'assembler') assembler();
})();
