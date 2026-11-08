/* Fabrique une vidéo courte à partir d'IMAGES FIXES (écrans de sites tiers qu'on ne peut pas filmer : ChatGPT, Perplexity...).
   Usage : node fabriquer_images.js <id> [etape]   (etape : voix | assembler ; sans étape : tout)
   Même rendu que fabriquer.js : image en haut (1280 x 720, l'image est centrée sur un fond clair), bande noire de 96 px dessous, sous-titres blancs, voix de l'introduction. */
const fs = require('fs'), cp = require('child_process'), path = require('path');
const VT = process.env.VIDEO_TRAVAIL || 'C:/Users/Denis/video_travail';
const FF = fs.readFileSync(VT + '/ffmpeg_path.txt', 'utf8').trim();
const FP = FF.replace(/ffmpeg\.exe$/, 'ffprobe.exe');
const PY = 'C:/Users/Denis/piper_venv/Scripts/python.exe';
const id = process.argv[2], etape = process.argv[3] || 'tout';
const sc = require('./scenarios/' + id + '.js');
const D = VT + '/' + id; fs.mkdirSync(D + '/blocs', { recursive: true });
const IMG = VT + '/' + (sc.dossierImages || 'chatgpt/img'); // images fixes : video_travail/<dossier>
const PAUSE = 0.7; // temps de lecture laissé après chaque phrase
const f3 = n => n.toFixed(3);

function voix() {
  fs.writeFileSync(D + '/blocs.json', JSON.stringify(sc.blocs.map(b => ({ id: b.id, voix: b.voix, sous_titre: b.sous_titre })), null, 1));
  const r = cp.spawnSync(PY, ['-I', path.join(__dirname, 'voix_court.py'), VT, id], { encoding: 'utf8' }); console.log(r.stdout, r.stderr.slice(-300));
  const b = JSON.parse(fs.readFileSync(D + '/blocs.json', 'utf8'));
  for (const x of b) x.duree = +cp.execFileSync(FP, ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', D + '/blocs/' + x.id + '.wav']).toString().trim();
  fs.writeFileSync(D + '/blocs.json', JSON.stringify(b, null, 1));
}

function assembler() {
  const blocs = JSON.parse(fs.readFileSync(D + '/blocs.json', 'utf8'));
  const BANDE = 96, H = 720 + BANDE, HI = 720; // image d'origine mise à la hauteur 720
  let t = 0; const cues = [], segs = [];
  sc.blocs.forEach((b, i) => {
    const d = blocs[i].duree + PAUSE; cues.push({ d: t + 0.1, f: t + d, t: b.sous_titre, debut: t });
    b.images.forEach(im => { segs.push({ f: im.f, rect: im.rect, dur: d * (im.part || 1) }); });
    t += d;
  });
  const duree = t;
  const ass = x => { const h = Math.floor(x / 3600), m = Math.floor(x % 3600 / 60), s = x % 60; return h + ':' + String(m).padStart(2, '0') + ':' + s.toFixed(2).padStart(5, '0'); };
  fs.writeFileSync(D + '/sous.ass', '[Script Info]\nScriptType: v4.00+\nPlayResX: 1280\nPlayResY: ' + H + '\nWrapStyle: 0\n\n[V4+ Styles]\n' +
    'Format: Name,Fontname,Fontsize,PrimaryColour,SecondaryColour,OutlineColour,BackColour,Bold,Italic,Underline,StrikeOut,ScaleX,ScaleY,Spacing,Angle,BorderStyle,Outline,Shadow,Alignment,MarginL,MarginR,MarginV,Encoding\n' +
    'Style: Defaut,Arial,28,&H00FFFFFF,&H00FFFFFF,&H00000000,&H00000000,-1,0,0,0,100,100,0,0,1,0,0,2,50,50,16,1\n\n[Events]\nFormat: Layer,Start,End,Style,Name,MarginL,MarginR,MarginV,Effect,Text\n' +
    cues.map(c => 'Dialogue: 0,' + ass(c.d) + ',' + ass(c.f) + ',Defaut,,0,0,0,,' + c.t).join('\n') + '\n', 'utf8');
  const entrees = [], filtres = [], labels = [];
  segs.forEach((s, i) => {
    entrees.push('-loop', '1', '-framerate', '25', '-t', f3(s.dur), '-i', IMG + '/' + s.f);
    // image mise à 720 de haut, centrée sur un fond clair, rectangle (qui apparaît après 0,5 s), puis bande noire dessous
    const ech = HI / 701; let ch = '[' + i + ':v]scale=-2:' + HI + ',pad=1280:' + HI + ':(ow-iw)/2:0:color=0xE9EDF3';
    if (s.rect) {
      const ox = Math.round((1280 - 800 * ech) / 2), [x, y, w, h] = s.rect;
      ch += ',drawbox=x=' + Math.round(ox + x * ech - 5) + ':y=' + Math.round(y * ech - 5) + ':w=' + Math.round(w * ech + 10) + ':h=' + Math.round(h * ech + 10) + ':color=0xE8590C:t=5:enable=gte(t\\,0.5)';
    }
    ch += ',pad=1280:' + H + ':0:0:black,setsar=1,format=yuv420p[s' + i + ']';
    filtres.push(ch); labels.push('[s' + i + ']');
  });
  filtres.push(labels.join('') + 'concat=n=' + segs.length + ':v=1:a=0,ass=sous.ass[v]');
  const n0 = segs.length, alabels = [];
  blocs.forEach((b, i) => { entrees.push('-i', D + '/blocs/' + b.id + '.wav'); const ms = Math.round(cues[i].debut * 1000 + 100); filtres.push('[' + (n0 + i) + ':a]aresample=44100,adelay=' + ms + '|' + ms + '[a' + i + ']'); alabels.push('[a' + i + ']'); });
  filtres.push(alabels.join('') + 'amix=inputs=' + blocs.length + ':normalize=0:dropout_transition=0,loudnorm=I=-16:TP=-1.5:LRA=11[voix]');
  const sortie = D + '/' + id + '.mp4';
  const args = ['-hide_banner', '-y'].concat(entrees, ['-filter_complex', filtres.join(';'), '-map', '[v]', '-map', '[voix]', '-t', f3(duree), '-c:v', 'libx264', '-crf', '22', '-preset', 'medium', '-c:a', 'aac', '-b:a', '112k', '-movflags', '+faststart', sortie]);
  const r = cp.spawnSync(FF, args, { cwd: D, encoding: 'utf8', maxBuffer: 1e8 });
  console.log(sortie, r.status, r.status ? r.stderr.slice(-1500) : 'durée ' + duree.toFixed(1) + ' s');
}

if (etape === 'tout' || etape === 'voix') voix();
if (etape === 'tout' || etape === 'assembler') assembler();
