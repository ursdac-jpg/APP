'use strict';
// Compare des règles de choix des compétences des cartes à partir des notes de Denis sur la feuille des 30 métiers (consigne 509, 21/11/2026).
// GOLD = compétences que Denis voulait voir (ou qu'il a laissées en notant « Bon ») ; BAD = compétences qu'il a jugées trompeuses.
// Limite : 30 métiers, une seule personne, règle réglée sur les mêmes 30 : ordre de grandeur, pas une preuve.
// Lancer depuis la racine : node scripts/auditCartes/analyseRegleCompetences.js
const R = require('path').join(__dirname, '..', '..') + '/';
const { F, P, N } = require('./choixCompetences.js');
const feuille = require(R + 'docs/bancEssai/feuille_competences_metiers.json');
const freq = new Array(P.phrases.length).fill(0); Object.values(F).forEach((f) => (f.k || []).forEach((x) => { freq[x[0]]++; }));
const GOLD = {
  M02: ['Conseiller et accompagner une personne'], M03: ['Mesurer, doser et ajuster'],
  M04: ['Aider la personne dans les gestes', 'Informer et accompagner', 'Donner des soins médicaux'],
  M05: ['Concevoir un logiciel', 'Analyser un problème', 'Faire des essais et des tests'],
  M06: ['Respecter les règles de qualité', 'Inventer des recettes', 'Contrôler la qualité des façons'],
  M07: ['Trouver l\'origine d\'une panne', 'Repérer, prévenir et gérer les risques'], M08: ['Évacuer et trier des déchets'],
  M11: ['Trouver l\'origine d\'une panne'],
  M12: ['Conseiller dans une relation commerciale', 'Présenter et mettre en valeur', 'Mener des actions commerciales'],
  M13: ['Proposer et animer des activités sportives', 'Repérer, prévenir et gérer les risques', 'Accompagner une personne dans ses progrès'],
  M14: ['Rechercher et analyser des informations', 'Mener une enquête', 'Utiliser un outil, une machine'],
  M15: ['Utiliser et régler des machines', 'Régler une machine', 'Réaliser une étape de fabrication'],
  M16: ['Préparer et planifier la production', 'Appliquer un traitement', 'Nettoyer et entretenir du matériel'],
  M17: ['Définir les besoins en équipement', 'Lancer et animer une démarche', 'Définir les étapes et les méthodes'],
  M18: ['Répondre aux attentes', 'Accueillir, orienter', 'Respecter les règles de qualité'],
  M19: ['Contrôler la qualité d\'un travail', 'Préparer son matériel', 'Contrôler la qualité d\'un produit'],
  M21: ['Organiser le travail d\'une équipe', 'Préparer, suivre et piloter un budget', 'Améliorer le fonctionnement'],
  M22: ['Piloter une démarche pour améliorer la qualité', 'Appliquer les lois'], M23: ['Façonner ou retoucher'],
  M25: ['Mettre en place et appliquer des consignes de sécurité', 'Repérer, prévenir et gérer les risques', 'Faire des essais et des tests'],
  M26: ['Préparer et planifier la production', 'Superviser des opérations', 'Gérer un planning'],
  M27: ['Analyser des chiffres avec des statistiques', 'Réaliser des opérations sur les marchés', 'Vérifier qu\'un projet est possible']
};
const BAD = {
  M03: ['Participer à un inventaire'], M04: ['Faire des soins du corps et d\'esthétique'], M05: ['Installer et mettre en service'],
  M06: ['Réduire les dépenses', 'Organiser et suivre les approvisionnements'], M12: ['Cultiver et récolter', 'Organiser le traitement des commandes', 'Gérer les stocks'],
  M13: ['Proposer et animer des activités de détente'], M14: ['Faire le bilan de l\'impact'], M15: ['Superviser des opérations', 'Appliquer les méthodes de travail'],
  M16: ['Utiliser et régler une machine d\'impression'], M17: ['S\'adapter selon', 'Organiser la logistique', 'Appliquer les politiques publiques'],
  M18: ['Conseiller dans une relation commerciale'], M19: ['Réparer'], M21: ['Mettre à jour régulièrement'], M22: ['Repérer et choisir des fournisseurs'],
  M23: ['Conseiller dans une relation commerciale'], M25: ['S\'adapter selon', 'Estimer les coûts'], M26: ['Conseiller une organisation'], M27: ['Repérer les tendances']
};
const B_OK = ['M02','M07','M08','M09','M10','M11','M20','M24','M28','M29','M30'];
const comp0 = require('./choixCompetences.js').competences;
feuille.forEach((m) => { if (B_OK.indexOf(m.id) !== -1) { GOLD[m.id] = (GOLD[m.id] || []).concat(comp0(m.rome).slice(0, 3)); } });
const dbt = (t, l) => l.some((x) => t.toLowerCase().indexOf(x.toLowerCase()) === 0);
function evalue(nom, score) {
  let bad = 0, gold = 0, goldMax = 0, metiersOk = 0, nbMet = 0;
  feuille.forEach((m) => {
    const top = F[m.rome].k.map((x) => ({ p: P.phrases[x[0]], c: x[1], nb: (x[2] || []).length, f: freq[x[0]] })).sort((a, b) => score(b) - score(a)).slice(0, 3).map((x) => x.p);
    const b = top.filter((t) => dbt(t, BAD[m.id] || [])).length, g = top.filter((t) => dbt(t, GOLD[m.id] || [])).length;
    bad += b; gold += g; goldMax += Math.min(3, (GOLD[m.id] || []).length);
    if (BAD[m.id] || GOLD[m.id]) { nbMet++; if (b === 0) { metiersOk++; } }
  });
  console.log(nom.padEnd(46) + ' mauvaises dans le top 3 : ' + String(bad).padStart(2) + ' | souhaitées dans le top 3 : ' + String(gold).padStart(2) + '/' + goldMax + ' | métiers sans mauvaise : ' + metiersOk + '/' + nbMet);
}
const rar = (x) => Math.log(N / x.f);
evalue('actuelle (cœur, puis nb x rareté)', (x) => x.c * 1e6 + x.nb * rar(x));
evalue('nb x rareté seul', (x) => x.nb * rar(x));
evalue('cœur seul puis ordre fiche', (x) => x.c * 1e6);
evalue('nb seul', (x) => x.nb * 1e3 - x.f);
evalue('(c+nb) x rareté', (x) => (x.c + x.nb) * rar(x));
evalue('(c+nb) x rareté^0.5', (x) => (x.c + x.nb) * Math.sqrt(rar(x)));
evalue('c x rareté (sans nb)', (x) => x.c * rar(x));
evalue('(c+nb) sans rareté', (x) => (x.c + x.nb) * 1e3 - x.f);
evalue('(c+nb) x rareté, sans fréquents > 10 %', (x) => (x.f / N > 0.10 ? -1 : (x.c + x.nb) * rar(x)));
evalue('(c+nb) x rareté, sans fréquents > 15 %', (x) => (x.f / N > 0.15 ? -1 : (x.c + x.nb) * rar(x)));
evalue('(c+nb) x rareté plafonnée à 3 (> 5 %)', (x) => (x.c + x.nb) * Math.min(rar(x), 3.0));
console.log('--- variantes autour de nb x rareté ---');
evalue('nb x rareté, sans > 10 %', (x) => (x.f / N > 0.10 ? -1 : x.nb * rar(x)));
evalue('nb x rareté, sans > 15 %', (x) => (x.f / N > 0.15 ? -1 : x.nb * rar(x)));
evalue('nb x rareté, sans > 20 %', (x) => (x.f / N > 0.20 ? -1 : x.nb * rar(x)));
evalue('nb x rareté^0.5', (x) => x.nb * Math.sqrt(rar(x)));
evalue('nb x rareté^2', (x) => x.nb * rar(x) * rar(x));
evalue('nb^1.5 x rareté', (x) => Math.pow(x.nb, 1.5) * rar(x));
evalue('(nb + 0.5 c) x rareté', (x) => (x.nb + 0.5 * x.c) * rar(x));
evalue('(nb + 0.25 c) x rareté', (x) => (x.nb + 0.25 * x.c) * rar(x));
evalue('nb x rareté, trop rares (< 1 %) écartées', (x) => (x.f / N < 0.01 ? -1 : x.nb * rar(x)));
evalue('nb x rareté, hors 1 %-10 %', (x) => (x.f / N > 0.10 || x.f / N < 0.01 ? -1 : x.nb * rar(x)));
console.log('--- détail nb x rareté ---');
feuille.forEach((m) => {
  const top = F[m.rome].k.map((x) => ({ p: P.phrases[x[0]], c: x[1], nb: (x[2] || []).length, f: freq[x[0]] })).sort((a, b) => b.nb * rar(b) - a.nb * rar(a)).slice(0, 3);
  console.log(m.id + ' ' + m.nom + ' : ' + top.map((x) => (dbt(x.p, BAD[m.id] || []) ? '[MAUVAIS] ' : dbt(x.p, GOLD[m.id] || []) ? '[bon] ' : '') + x.p).join(' / '));
});
