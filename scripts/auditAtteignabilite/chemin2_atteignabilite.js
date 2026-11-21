'use strict';
// Audit « Explorer les métiers » du 21/11/2026 (consigne 503), lecture seule : ne modifie rien dans l'application. Voir docs/AUDIT_ATTEIGNABILITE_METIERS_EXPLORER_LES_METIERS_2026-11-21.md.
const { M, L, CAT } = require('./commun.js');
const fs = require('fs');
const [,, shard, nshards] = process.argv;
const corr = M.correspond, base = M.baseMetiers;
const cats = ['activites', 'actions', 'environnement'];
const ids = []; cats.forEach((c) => CAT[c].forEach((g) => g.items.forEach((it) => ids.push({ cat: c, item: it.id, label: it.label }))));
// choix portés par une signature
const portes = (sig) => sig ? ids.filter((c) => (sig[c.cat] || []).some((x) => corr(c.item, x))) : [];
// rareté globale : nombre de métiers (meilleure union des deux signatures) qui portent chaque choix
const compteur = {};
base.forEach((m) => { const u = new Set(); portes(m).concat(portes(m.signatureRome)).forEach((c) => u.add(c.cat + ':' + c.item)); u.forEach((k) => { compteur[k] = (compteur[k] || 0) + 1; }); });
const out = {};
const KMAX = 8;
base.forEach((m, idx) => {
  if (idx % Number(nshards) !== Number(shard)) { return; }
  const sigs = [m, m.signatureRome].filter(Boolean).map((s) => portes(s));
  const union = new Set(); sigs.forEach((p) => p.forEach((c) => union.add(c.cat + ':' + c.item)));
  const res = { nom: m.nom, rome: m.rome, secteur: m.secteur, nPortes: union.size, nPortesSig: sigs.map((p) => p.length), rang: {} };
  let k5 = null, k20 = null, k1 = null, meilleur = null;
  for (let k = 1; k <= KMAX && (k5 === null || k20 === null || k1 === null); k++) {
    let best = null;
    sigs.forEach((p) => {
      if (p.length < k) { return; }
      const choisis = p.slice().sort((a, b) => compteur[a.cat + ':' + a.item] - compteur[b.cat + ':' + b.item]).slice(0, k);
      const choix = { activites: [], actions: [], environnement: [] }; choisis.forEach((c) => choix[c.cat].push(c.item));
      const liste = L.cmlEntree2Metiers(choix, 5000);
      const r = liste.findIndex((x) => x.nom === m.nom);
      const info = { r: r, n: liste.length, pct: r >= 0 ? liste[r].score : 0, top: liste[0] ? liste[0].score : 0, choix: choisis.map((c) => c.item) };
      if (r >= 0 && (best === null || r < best.r || best.r < 0)) { best = info; } else if (best === null) { best = info; }
    });
    if (!best) { continue; }
    res.rang[k] = best;
    if (best.r >= 0) { if (k20 === null && best.r < 20) { k20 = k; } if (k5 === null && best.r < 5) { k5 = k; } if (k1 === null && best.r === 0) { k1 = k; } }
  }
  res.k1 = k1; res.k5 = k5; res.k20 = k20;
  out[idx] = res;
});
fs.writeFileSync('c2_' + shard + '.json', JSON.stringify(out));
console.log('fini', shard, Object.keys(out).length);
