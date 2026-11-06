/* Assemble : image (avec les parties accélérées) + voix (blocs calés) + sous-titres.
   Sorties dans <VIDEO_TRAVAIL>/video : presentation_brouillon.mp4 (sous-titres incrustés, pour relire), presentation.mp4 + presentation.vtt (propres, pour l'application).
   Usage : VIDEO_TRAVAIL=<dossier de travail> node assembler.js */
const fs = require('fs'), cp = require('child_process');
const SP = process.env.VIDEO_TRAVAIL; const D = SP + '/video';
const FF = fs.readFileSync(SP + '/ffmpeg_path.txt', 'utf8').trim().replace(/^\/([a-z])\//, '$1:/');
const tl = JSON.parse(fs.readFileSync(D + '/timeline.json', 'utf8'));
const blocs = JSON.parse(fs.readFileSync(SP + '/blocs.json', 'utf8'));
const f3 = n => n.toFixed(3);
const hms = (s, sep) => { const h = Math.floor(s / 3600), m = Math.floor(s % 3600 / 60), x = s % 60; return String(h).padStart(2, '0') + ':' + String(m).padStart(2, '0') + ':' + String(Math.floor(x)).padStart(2, '0') + sep + String(Math.round((x % 1) * 1000)).padStart(3, '0'); };

// Segments de l'image : normaux (x = 1) ou accélérés, du début du film à la fin.
const acc = (tl.accelerations || []).slice().sort((a, b) => a.d - b.d);
const segs = []; let t = tl.tDebut;
for (const a of acc) { if (a.d > t) segs.push({ a: t, b: a.d, x: 1 }); segs.push({ a: a.d, b: a.f, x: a.x }); t = a.f; }
if (tl.fin > t) segs.push({ a: t, b: tl.fin, x: 1 });
let cumul = 0; segs.forEach(s => { s.n0 = cumul; cumul += (s.b - s.a) / s.x; });
const duree = cumul;
const nouveau = t0 => { for (const s of segs) { if (t0 >= s.a && t0 <= s.b) return s.n0 + (t0 - s.a) / s.x; } return t0 > tl.fin ? duree : 0; };

const cues = blocs.map(b => ({ d: nouveau(tl.depart[b.id]), f: nouveau(tl.depart[b.id]) + b.duree + 0.2, t: b.sous_titre }));
cues.forEach((c, i) => { if (cues[i + 1] && c.f > cues[i + 1].d - 0.05) c.f = cues[i + 1].d - 0.05; });
fs.writeFileSync(D + '/presentation.vtt', 'WEBVTT\n\n' + cues.map(c => hms(c.d, '.') + ' --> ' + hms(c.f, '.') + '\n' + c.t).join('\n\n') + '\n', 'utf8');
fs.writeFileSync(D + '/sous.srt', cues.map((c, i) => (i + 1) + '\n' + hms(c.d, ',') + ' --> ' + hms(c.f, ',') + '\n' + c.t).join('\n\n') + '\n', 'utf8');

const entrees = ['-i', tl.fichier];
const filtres = [];
segs.forEach((s, i) => { filtres.push('[0:v]trim=start=' + f3(s.a) + ':end=' + f3(s.b) + ',setpts=(PTS-STARTPTS)/' + s.x + ',fps=25[s' + i + ']'); });
filtres.push(segs.map((s, i) => '[s' + i + ']').join('') + 'concat=n=' + segs.length + ':v=1:a=0[vc]');
const labels = [];
blocs.forEach((b, i) => { entrees.push('-i', SP + '/voix/blocs/' + b.id + '.wav'); const ms = Math.round(nouveau(tl.depart[b.id]) * 1000); filtres.push('[' + (i + 1) + ':a]aresample=44100,adelay=' + ms + '|' + ms + '[a' + i + ']'); labels.push('[a' + i + ']'); });
filtres.push(labels.join('') + 'amix=inputs=' + blocs.length + ':normalize=0:dropout_transition=0,loudnorm=I=-16:TP=-1.5:LRA=11[voix]');
function lancer(sortie, brule) {
  const vf = brule ? "subtitles=sous.srt:force_style='FontName=Arial,FontSize=19,Bold=1,Outline=2,Shadow=0,MarginV=22'," : '';
  const f = filtres.concat(['[vc]' + vf + 'format=yuv420p[v]']).join(';');
  const args = ['-hide_banner', '-y'].concat(entrees, ['-filter_complex', f, '-map', '[v]', '-map', '[voix]', '-t', f3(duree), '-c:v', 'libx264', '-crf', '23', '-preset', 'medium', '-c:a', 'aac', '-b:a', '128k', '-movflags', '+faststart', sortie]);
  const r = cp.spawnSync(FF, args, { cwd: D, encoding: 'utf8', maxBuffer: 1e8 });
  console.log(sortie, r.status, r.status ? r.stderr.slice(-800) : '');
}
console.log('durée prévue', Math.floor(duree / 60) + ' min ' + Math.round(duree % 60) + ' s', '(segments :', segs.map(s => s.x === 1 ? 'n' : 'x' + s.x).join(' '), ')');
lancer('presentation_brouillon.mp4', true);
lancer('presentation.mp4', false);
