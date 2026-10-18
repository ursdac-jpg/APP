// Migration d'un rayon vers le répertoire de « Qui fait quoi » (outil jetable, même méthode que Logement et Accompagnement).
// Usage : node migrer_rayon.js '<json de configuration>'
const fs = require('fs');
const RACINE = require('path').resolve(__dirname, '..') + '/';
const R = RACINE + 'modules/comprendre-le-cadre/';
const cfg = JSON.parse(process.argv[2]);
const lire = (p) => fs.readFileSync(p, 'utf8');
const eolDe = (t) => (t.indexOf('\r\n') !== -1 ? '\r\n' : '\n');

// registre des adresses (première occurrence de chaque identifiant)
const reg = {};
lire(R + 'liens-verifies.txt').split(/\r?\n/).forEach((l) => { if (!l.trim() || l.trim()[0] === '#') return; const p = l.split(' | ').map((x) => x.trim()); if (!reg[p[0]]) reg[p[0]] = { url: p[1], date: p[2], portee: p[3] }; });
const pCollecte = R + 'contenu/' + cfg.rayon + '/' + cfg.rayon + '.collecte.md';
const collecte = lire(pCollecte);
const lignes = {};
let dans = false;
collecte.split(/\r?\n/).forEach((l) => {
  if (/^structures:/.test(l)) { dans = true; return; }
  if (dans) { const m = l.match(/^\s*-\s*"(.*)"\s*$/); if (m) { const p = m[1].split(' | '); lignes[p[0].trim()] = p[1] || ''; } else if (/^\S/.test(l)) dans = false; }
});
const decouper = (d) => { const i = d.indexOf(' : '); return i === -1 ? [d, ''] : [d.slice(0, i), d.slice(i + 3)]; };
const nouvelles = [];
Object.keys(cfg.types).forEach((id) => {
  if (lignes[id] === undefined) throw new Error('absent de la collecte : ' + id);
  const g = reg[id]; if (!g) throw new Error('absent du registre : ' + id);
  const [nom, detail] = decouper(lignes[id]);
  nouvelles.push([id, cfg.types[id], nom, detail, '', '', '', g.url, g.portee, cfg.rayon, 'Migré du rayon ' + cfg.libelle + ' de Comprendre le cadre (collecte du ' + cfg.collecte + ')', g.date].join(' | ').replace(/ \|  \| /g, ' | | ').replace(/ \|  \| /g, ' | | '));
});

// 1. lieux.txt : nouvelles lignes + rayons supplémentaires de structures déjà présentes
const pLieux = RACINE + 'modules/mon-territoire/contenu/lieux.txt';
let lieux = lire(pLieux);
const eol = eolDe(lieux);
nouvelles.forEach((n) => { if (lieux.indexOf('\n' + n.split(' | ')[0] + ' | ') !== -1) throw new Error('deja la : ' + n.split(' | ')[0]); });
Object.keys(cfg.ajouterRayon || {}).forEach((id) => {
  const re = new RegExp('^(' + id.replace(/[-]/g, '\\-') + ' \\| .*\\| )([a-z,]+)( \\| [^|]* \\| \\d{4}-\\d{2}-\\d{2})$', 'm');
  if (!re.test(lieux)) throw new Error('ligne introuvable pour ajouter un rayon : ' + id);
  lieux = lieux.replace(re, (m, a, rayons, b) => (rayons.split(',').indexOf(cfg.rayon) !== -1 ? m : a + rayons + ',' + cfg.rayon + b));
});
lieux = lieux.replace(/\s*$/, '') + eol + '# ---- Rayon ' + cfg.libelle + ', Dordogne (24), national et région : migration du ' + cfg.date + ' ----' + eol + nouvelles.join(eol) + eol;
fs.writeFileSync(pLieux, lieux);

// 2. collecte du rayon : retirer les lignes déplacées et les génériques fusionnés
const retirer = Object.keys(cfg.types).concat(cfg.fusionnes || []);
const eolC = eolDe(collecte);
let dansC = false, retirees = 0;
const sortie = [];
collecte.split(eolC).forEach((l) => {
  if (/^structures:/.test(l)) { dansC = true; sortie.push(l); return; }
  if (dansC) { const m = l.match(/^\s*-\s*"([^ |]+) \|/); if (m) { if (retirer.indexOf(m[1]) !== -1) { retirees++; return; } } else if (/^\S/.test(l)) dansC = false; }
  sortie.push(l);
});
if (retirees !== retirer.length) throw new Error('lignes retirees ' + retirees + ' au lieu de ' + retirer.length);
fs.writeFileSync(pCollecte, sortie.join(eolC));

// 3. registre : retirer les adresses des structures désormais dans lieux.txt (toutes les occurrences)
const pReg = R + 'liens-verifies.txt';
const rg = lire(pReg), eolR = eolDe(rg);
const ids = Object.keys(cfg.types);
let rr = 0;
fs.writeFileSync(pReg, rg.split(eolR).filter((l) => { const n = l.indexOf(' | ') !== -1 ? l.split(' | ')[0].trim() : ''; if (n && ids.indexOf(n) !== -1) { rr++; return false; } return true; }).join(eolR));
console.log('lieux +' + nouvelles.length + ' ; collecte -' + retirees + ' ; registre -' + rr);
