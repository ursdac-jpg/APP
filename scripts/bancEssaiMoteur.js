'use strict';
/* ============================================================
   scripts/bancEssaiMoteur.js
   Banc d'essai REJOUABLE du moteur de recommandation de « Explorer les métiers » (consigne 491, 19/11/2026).
   Lecture seule : ne modifie rien dans l'application. Il sert à juger chaque changement (étiquettes des fiches, poids, seuils) par des CHIFFRES.

   Lancer :
     node scripts/bancEssaiMoteur.js                          affiche le rapport
     node scripts/bancEssaiMoteur.js --ecrire avant           range la mesure dans docs/bancEssai/mesure_avant.json
     node scripts/bancEssaiMoteur.js --comparer avant         affiche le rapport et les écarts avec docs/bancEssai/mesure_avant.json

   Ce que mesure le banc (trois chemins) :
   - chemin 2, UN CHOIX À LA FOIS (les 108 choix des catalogues) : combien de métiers, combien d'égalités en tête, et la part des métiers d'exemple
     du catalogue retrouvés parmi les 10 et les 50 premiers (attention : ces exemples sont écrits avec les mêmes étiquettes que le moteur, d'où le jury humain) ;
   - chemin 2, PROFILS TYPES avec les secteurs attendus (part des 5 premiers métiers qui sont dans un secteur attendu) ;
   - chemin 2, STABILITÉ (même profil deux fois ; un choix général ajouté) et profils difficiles (contradictoires, très généraux) ;
   - « RETROUVAILLE » : on prend trois choix tirés de la fiche d'un métier, le moteur doit remettre ce métier parmi les premiers (chemins 1 et 2) ;
   - chemin 3 : dix codes à lettres, égalités en tête après départage et cohérence des lettres.
   La mesure de DÉPART et la feuille du jury sont rangées dans docs/bancEssai/.
   ============================================================ */
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const RACINE = path.join(__dirname, '..');
const DOSSIER = path.join(RACINE, 'docs', 'bancEssai');

['data/actionsProfessionnelles.js', 'data/personnesMaterielsLieux.js', 'data/environnementsTravail.js'].forEach((f) => {
  vm.runInThisContext(fs.readFileSync(path.join(RACINE, f), 'utf8'), { filename: f });
});
const M = require('../data/metiers.js');
const L = require('../modules/comprendre-les-metiers/logique.js');
const C = require('../modules/comprendre-les-metiers/parMetierCalcul.js');
const { pmdDonnees } = require('../modules/comprendre-les-metiers/parMetierDonnees.js');

const CAT = {
  activites: vm.runInThisContext('CATALOGUE_PERSONNES_MATERIELS_LIEUX'),
  actions: vm.runInThisContext('CATALOGUE_ACTIONS_PRO'),
  environnement: vm.runInThisContext('CATALOGUE_ENVIRONNEMENTS_TRAVAIL')
};
const norm = M.normaliserTexte;
const mediane = (a) => { if (!a.length) { return 0; } const s = a.slice().sort((x, y) => x - y); const m = s.length >> 1; return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; };
const moyenne = (a) => (a.length ? a.reduce((s, x) => s + x, 0) / a.length : 0);
const arrondi = (x, n) => { const k = Math.pow(10, n === undefined ? 3 : n); return Math.round(x * k) / k; };

// Profils types du chemin 2, avec les secteurs de la base qu'un conseiller attendrait en tête (jugement de départ, à corriger par Denis).
const PERSONAS = [
  { titre: 'Animaux et nature', choix: { activites: ['animaux_compagnie', 'vegetaux'], environnement: ['espaces_verts'] }, secteurs: ['Agriculture, nature et espaces verts', 'Métiers animaliers'] },
  { titre: 'Cuisine et service', choix: { actions: ['cuisiner', 'servir'], activites: ['clients', 'aliments'], environnement: ['cuisine'] }, secteurs: ['Hôtellerie, restauration et tourisme', 'Métiers de bouche (artisanat)'] },
  { titre: 'Aide aux personnes âgées', choix: { actions: ['soigner', 'accompagner'], activites: ['personnes_agees'], environnement: ['domicile'] }, secteurs: ['Santé et soins', 'Social et services à la personne'] },
  { titre: 'Petite enfance et école', choix: { actions: ['accompagner', 'former'], activites: ['enfants'], environnement: ['social_creche', 'ecole_formation'] }, secteurs: ['Social et services à la personne', 'Éducation et formation'] },
  { titre: 'Bâtiment', choix: { actions: ['construire', 'installer', 'monter'], activites: ['outils', 'materiaux'], environnement: ['exterieur'] }, secteurs: ['Bâtiment et travaux publics'] },
  { titre: 'Logistique', choix: { actions: ['transporter', 'preparer_commandes', 'manutentionner_emballer'], activites: ['marchandises', 'vehicules'], environnement: ['entrepot_logistique'] }, secteurs: ['Transport et logistique'] },
  { titre: 'Vente en magasin', choix: { actions: ['vendre', 'conseiller', 'encaisser'], activites: ['clients'], environnement: ['magasin'] }, secteurs: ['Commerce et vente'] },
  { titre: 'Bureau et gestion', choix: { actions: ['saisir', 'classer', 'communiquer_ecrit'], activites: ['ordinateur', 'documents'], environnement: ['bureau'] }, secteurs: ['Administration, gestion et bureau', 'Banque, assurance et immobilier'] },
  { titre: 'Mécanique', choix: { actions: ['reparer', 'utiliser_machines_outils'], activites: ['machines', 'vehicules', 'outils'] }, secteurs: ['Mécanique et automobile', 'Industrie, production et énergie'] },
  { titre: 'Nettoyage et entretien', choix: { actions: ['nettoyer', 'entretenir_maintenir'], activites: ['produits'] }, secteurs: ['Propreté et gestion des déchets'] },
  { titre: 'Informatique', choix: { actions: ['programmer', 'rechercher_tester'], activites: ['ordinateur', 'appareils_numeriques'] }, secteurs: ['Informatique et numérique'] },
  { titre: 'Sécurité', choix: { actions: ['surveiller_securiser', 'reagir_urgence'], environnement: ['securite_penitentiaire'] }, secteurs: ['Sécurité'] },
  { titre: 'Sport et animation', choix: { actions: ['encadrer_animer'], activites: ['sportifs'], environnement: ['salle_sport'] }, secteurs: ['Sport, animation et loisirs'] },
  { titre: 'Création', choix: { actions: ['creer', 'dessiner', 'concevoir'], environnement: ['medias_studio'] }, secteurs: ['Communication, culture et événementiel', 'Artisanat et création'] }
];
// Profils difficiles : on ne juge pas la « bonne » réponse, on regarde ce que le moteur en fait (nombre de métiers, meilleur pourcentage).
const DIFFICILES = [
  { titre: 'Contradictoire : bureau et extérieur, programmer et soigner', choix: { actions: ['programmer', 'soigner'], environnement: ['bureau', 'exterieur'] } },
  { titre: 'Contradictoire : animaux, bureau, usine', choix: { activites: ['animaux_compagnie'], environnement: ['bureau', 'usine'] } },
  { titre: 'Très général : clients et collègues', choix: { activites: ['clients', 'collegues'] } },
  { titre: 'Très général : bureau seul', choix: { environnement: ['bureau'] } },
  { titre: 'Quinze choix variés', choix: { actions: ['cuisiner', 'soigner', 'conduire', 'decouper', 'vendre', 'nettoyer', 'cultiver_entretenir_plantes', 'servir'], activites: ['clients', 'enfants', 'machines', 'animaux_compagnie'], environnement: ['bureau', 'exterieur', 'domicile'] } },
  { titre: 'Aucun choix', choix: {} }
];
const CODES_RIASEC = ['RIA', 'RC', 'SA', 'IE', 'SEC', 'AIS', 'ERC', 'RIE', 'CSE', 'ASI'];

function tousLesChoix() {
  const sortie = [];
  Object.keys(CAT).forEach((cle) => { CAT[cle].forEach((g) => g.items.forEach((it) => sortie.push({ cle: cle, id: it.id, label: it.label, exemples: it.metiers || [] }))); });
  return sortie;
}
function profil(cle, id) { const p = {}; p[cle] = [id]; return p; }
function rang(liste, id) { for (let i = 0; i < liste.length; i++) { if (liste[i].id === id) { return i; } } return -1; }

/* ---------- A. un choix à la fois ---------- */
function mesurerUnChoix() {
  const lignes = [];
  let r10 = 0, r50 = 0, exemplesTotal = 0;
  tousLesChoix().forEach((c) => {
    const res = L.cmlEntree2Metiers(profil(c.cle, c.id), 5000);
    const tete = res.length ? res[0].scoreExact : 0;
    const egalites = res.filter((m) => Math.abs(m.scoreExact - tete) < 1e-9).length;
    const noms = res.map((m) => norm(m.nom));
    let t10 = 0, t50 = 0, trouves = 0;
    c.exemples.forEach((e) => {
      const k = noms.indexOf(norm(e));
      const present = M.baseMetiers.some((m) => norm(m.nom) === norm(e));
      if (!present) { return; }
      trouves++;
      if (k !== -1 && k < 10) { t10++; }
      if (k !== -1 && k < 50) { t50++; }
    });
    r10 += t10; r50 += t50; exemplesTotal += trouves;
    lignes.push({ id: c.id, label: c.label, nbMetiers: res.length, egalitesEnTete: egalites, exemples: trouves, dans10: t10, dans50: t50, meilleurScore: res.length ? res[0].score : 0 });
  });
  return {
    lignes: lignes,
    nbChoix: lignes.length,
    rappel10: exemplesTotal ? arrondi(r10 / exemplesTotal) : 0,
    rappel50: exemplesTotal ? arrondi(r50 / exemplesTotal) : 0,
    egalitesMediane: mediane(lignes.map((l) => l.egalitesEnTete)),
    nbMetiersMediane: mediane(lignes.map((l) => l.nbMetiers)),
    scoreMaxObserve: Math.max.apply(null, lignes.map((l) => l.meilleurScore))
  };
}

/* ---------- B. profils types et difficiles ---------- */
function mesurerPersonas() {
  const lignes = PERSONAS.map((p) => {
    const res = L.cmlEntree2Metiers(p.choix, 5000);
    const t5 = res.slice(0, 5), t10 = res.slice(0, 10);
    const part = (liste) => (liste.length ? liste.filter((m) => p.secteurs.indexOf(m.secteur) !== -1).length / liste.length : 0);
    return { titre: p.titre, nbMetiers: res.length, meilleurScore: res.length ? res[0].score : 0, coherence5: arrondi(part(t5)), coherence10: arrondi(part(t10)), top5: t5.map((m) => m.nom + ' (' + m.secteur + ', ' + m.score + ' %)') };
  });
  return { lignes: lignes, coherence5Moyenne: arrondi(moyenne(lignes.map((l) => l.coherence5))), coherence10Moyenne: arrondi(moyenne(lignes.map((l) => l.coherence10))) };
}
function mesurerDifficiles() {
  return DIFFICILES.map((p) => {
    const res = L.cmlEntree2Metiers(p.choix, 5000);
    return { titre: p.titre, nbMetiers: res.length, meilleurScore: res.length ? res[0].score : 0, top3: res.slice(0, 3).map((m) => m.nom + ' (' + m.score + ' %)') };
  });
}
function mesurerStabilite() {
  const generaux = [['activites', 'collegues'], ['activites', 'clients']];
  const parts = [];
  let deterministe = true;
  PERSONAS.forEach((p) => {
    const a = L.cmlEntree2Metiers(p.choix, 5000), b = L.cmlEntree2Metiers(p.choix, 5000);
    if (JSON.stringify(a.slice(0, 20).map((m) => m.id)) !== JSON.stringify(b.slice(0, 20).map((m) => m.id))) { deterministe = false; }
    const g = generaux.find((x) => (p.choix[x[0]] || []).indexOf(x[1]) === -1);
    const avec = {}; Object.keys(p.choix).forEach((k) => { avec[k] = p.choix[k].slice(); });
    avec[g[0]] = (avec[g[0]] || []).concat([g[1]]);
    const c = L.cmlEntree2Metiers(avec, 5000);
    const t10a = a.slice(0, 10).map((m) => m.id), t10c = c.slice(0, 10).map((m) => m.id);
    parts.push(t10a.filter((x) => t10c.indexOf(x) !== -1).length / 10);
  });
  const opposes = L.cmlEntree2Metiers(PERSONAS[0].choix, 5000).slice(0, 10).map((m) => m.id);
  const autre = L.cmlEntree2Metiers(PERSONAS[6].choix, 5000).slice(0, 10).map((m) => m.id);
  return { deterministe: deterministe, recouvrementAjoutGeneral: arrondi(moyenne(parts)), recouvrementOpposes: opposes.filter((x) => autre.indexOf(x) !== -1).length / 10 };
}

/* ---------- C. retrouvaille (chemin 2) : trois choix tirés de la fiche d'un métier ---------- */
function mesurerRetrouvaille2() {
  const base = M.baseMetiers;
  const connus = { activites: {}, actions: {}, environnement: {} };
  Object.keys(CAT).forEach((k) => CAT[k].forEach((g) => g.items.forEach((it) => { connus[k][it.id] = true; })));
  const echantillon = [];
  for (let i = 11; i < base.length && echantillon.length < 60; i += 29) {
    const m = base[i];
    const choix = {};
    let n = 0;
    ['activites', 'actions', 'environnement'].forEach((k) => {
      const ids = (m[k] || []).filter((x) => connus[k][x]);
      if (ids.length) { choix[k] = [ids[0]]; n++; }
    });
    if (n === 3) { echantillon.push({ m: m, choix: choix }); }
  }
  let d10 = 0, d50 = 0;
  const rangs = [];
  echantillon.forEach((e) => {
    const res = L.cmlEntree2Metiers(e.choix, 5000);
    const k = rang(res, e.m.id);
    rangs.push(k);
    if (k !== -1 && k < 10) { d10++; }
    if (k !== -1 && k < 50) { d50++; }
  });
  return { essais: echantillon.length, rappel10: arrondi(d10 / (echantillon.length || 1)), rappel50: arrondi(d50 / (echantillon.length || 1)), rangMedian: mediane(rangs.filter((k) => k >= 0)), absents: rangs.filter((k) => k === -1).length };
}

/* ---------- D. chemin 3 : dix codes ---------- */
function mesurerChemin3() {
  const lignes = CODES_RIASEC.map((code) => {
    const lettres = code.split('');
    const res = L.cmlMetiersPourLettres(lettres);
    const tete = res[0];
    const egalites = tete ? res.filter((e) => Math.abs(e.indice - tete.indice) < 1e-9 && e.retrouvees === tete.retrouvees && e.ecart === tete.ecart).length : 0;
    const coherentes = res.slice(0, 10).filter((e) => e.lettres.split('').every((l) => lettres.indexOf(l) !== -1)).length / 10;
    return { code: code, nbMetiers: res.length, egalitesEnTete: egalites, lettresDansLeCode10: coherentes, top5: res.slice(0, 5).map((e) => e.metier.nom + ' [' + e.lettres + ']') };
  });
  return { lignes: lignes, egalitesMediane: mediane(lignes.map((l) => l.egalitesEnTete)), coherence10Moyenne: arrondi(moyenne(lignes.map((l) => l.lettresDansLeCode10))) };
}

/* ---------- E. chemin 1 : retrouvaille ---------- */
function mesurerChemin1() {
  const D = pmdDonnees();
  const essais = [];
  for (let i = 5; i < D.m.length && essais.length < 40; i += 47) {
    const r = D.m[i];
    if (r[3].length >= 3 && r[4].length >= 1 && r[2] !== 0) { essais.push(i); }
  }
  let d10 = 0, d50 = 0;
  const rangs = [], retenus = [];
  essais.forEach((i) => {
    const r = D.m[i];
    const S = C.pmcEtatInitial();
    S.comp = r[3].slice(0, 3).map((id) => ({ t: 'sf', i: id })).concat([{ t: 'se', i: r[4][0] }]);
    S.secteurs = [r[1]];
    const res = C.pmcCalculer(D, S);
    const k = res.tous.findIndex((o) => o.i === i);
    rangs.push(k);
    retenus.push(res.retenus.length);
    if (k < 10) { d10++; }
    if (k < 50) { d50++; }
  });
  // Un seul secteur, un seul savoir-être très répandu : ce que le moteur en fait.
  const unSecteur = C.pmcEtatInitial(); unSecteur.secteurs = [0];
  const rUn = C.pmcCalculer(D, unSecteur);
  const autonomie = D.se.findIndex((x) => /autonomie/i.test(x.lib));
  const uneComp = C.pmcEtatInitial(); uneComp.comp = [{ t: 'se', i: autonomie }];
  const rAut = C.pmcCalculer(D, uneComp);
  // Consigne 497 (rareté) : trois combinaisons qui mêlent une compétence très répandue et une compétence rare ; on garde les cinq premiers métiers pour les comparer avant et après.
  const trouver = (t, re) => D[t].findIndex((x) => re.test(x.lib));
  const CAS = [
    { titre: 'Autonomie + Soigner des animaux', comp: [['se', /autonomie/i], ['sf', /^Soigner des animaux$/]] },
    { titre: 'Autonomie + esprit d’équipe + Conduire sur la route', comp: [['se', /autonomie/i], ['se', /esprit d’équipe/i], ['sf', /^Conduire un véhicule sur la route$/]] },
    { titre: 'Rigueur + Accueillir le public + Soigner des animaux', comp: [['se', /rigueur et de précision/i], ['sf', /^Accueillir, orienter et renseigner le public$/], ['sf', /^Soigner des animaux$/]] }
  ];
  const cas = CAS.map((c) => {
    const S = C.pmcEtatInitial();
    S.comp = c.comp.map((x) => ({ t: x[0], i: trouver(x[0], x[1]) }));
    const res = C.pmcCalculer(D, S);
    return { titre: c.titre, retenus: res.retenus.length, top5: res.tous.slice(0, 5).map((o) => D.m[o.i][0] + ' (' + o.sc.pct + ' %, ' + o.sc.retrouvees + ' choix)') };
  });
  return {
    essais: essais.length, rappel10: arrondi(d10 / (essais.length || 1)), rappel50: arrondi(d50 / (essais.length || 1)), rangMedian: mediane(rangs), retenusMediane: mediane(retenus), cas: cas,
    unSecteur: { retenus: rUn.retenus.length, meilleurPct: rUn.tous[0].sc.pct },
    autonomieSeule: { retenus: rAut.retenus.length, meilleurPct: rAut.tous[0].sc.pct, dansLaBaseSur: D.m.length }
  };
}

function mesurer() {
  const unChoix = mesurerUnChoix();
  const personas = mesurerPersonas();
  const difficiles = mesurerDifficiles();
  const stabilite = mesurerStabilite();
  const retrouvaille2 = mesurerRetrouvaille2();
  const chemin3 = mesurerChemin3();
  const chemin1 = mesurerChemin1();
  const agregats = {
    c2_unChoix_rappel10: unChoix.rappel10, c2_unChoix_rappel50: unChoix.rappel50, c2_unChoix_egalitesMediane: unChoix.egalitesMediane, c2_unChoix_scoreMax: unChoix.scoreMaxObserve,
    c2_personas_coherence5: personas.coherence5Moyenne, c2_personas_coherence10: personas.coherence10Moyenne,
    c2_stabilite_ajoutGeneral: stabilite.recouvrementAjoutGeneral, c2_stabilite_opposes: stabilite.recouvrementOpposes, c2_deterministe: stabilite.deterministe ? 1 : 0,
    c2_retrouvaille_rappel10: retrouvaille2.rappel10, c2_retrouvaille_rappel50: retrouvaille2.rappel50,
    c3_egalitesMediane: chemin3.egalitesMediane, c3_coherence10: chemin3.coherence10Moyenne,
    c1_retrouvaille_rappel10: chemin1.rappel10, c1_retrouvaille_rappel50: chemin1.rappel50
  };
  return { version: 1, agregats: agregats, chemin2: { unChoix: unChoix, personas: personas, difficiles: difficiles, stabilite: stabilite, retrouvaille: retrouvaille2 }, chemin3: chemin3, chemin1: chemin1 };
}

function rapport(m, ancien) {
  const a = m.agregats, o = ancien ? ancien.agregats : null;
  const sortie = ['=== Banc d\'essai du moteur : chiffres clés ==='];
  const sens = { c2_unChoix_rappel10: '+', c2_unChoix_rappel50: '+', c2_unChoix_egalitesMediane: '-', c2_unChoix_scoreMax: '-', c2_personas_coherence5: '+', c2_personas_coherence10: '+', c2_stabilite_ajoutGeneral: '+', c2_stabilite_opposes: '-', c2_deterministe: '+', c2_retrouvaille_rappel10: '+', c2_retrouvaille_rappel50: '+', c3_egalitesMediane: '-', c3_coherence10: '+', c1_retrouvaille_rappel10: '+', c1_retrouvaille_rappel50: '+' };
  Object.keys(a).forEach((k) => {
    let ligne = '  ' + k.padEnd(30) + String(a[k]).padStart(8);
    if (o && typeof o[k] === 'number') {
      const d = arrondi(a[k] - o[k]);
      const bon = d === 0 ? '' : ((d > 0) === (sens[k] === '+') ? '  mieux' : '  moins bien');
      ligne += '   (avant : ' + o[k] + ', écart ' + (d > 0 ? '+' : '') + d + ')' + bon;
    }
    sortie.push(ligne);
  });
  sortie.push('', '=== Profils types (secteurs attendus dans les 5 premiers) ===');
  m.chemin2.personas.lignes.forEach((l) => sortie.push('  ' + l.titre.padEnd(30) + ' ' + String(l.nbMetiers).padStart(4) + ' métiers, cohérence ' + l.coherence5 + ', meilleur ' + l.meilleurScore + ' %'));
  sortie.push('', '=== Profils difficiles ===');
  m.chemin2.difficiles.forEach((l) => sortie.push('  ' + l.titre + ' : ' + l.nbMetiers + ' métiers, meilleur ' + l.meilleurScore + ' % ; ' + l.top3.join(' | ')));
  sortie.push('', '=== Chemin 3 : codes ===');
  m.chemin3.lignes.forEach((l) => sortie.push('  ' + l.code.padEnd(4) + String(l.nbMetiers).padStart(5) + ' métiers, ' + String(l.egalitesEnTete).padStart(4) + ' ex aequo en tête ; ' + l.top5.slice(0, 2).join(' | ')));
  sortie.push('', '=== Chemin 1 ===', '  Un seul secteur : ' + m.chemin1.unSecteur.retenus + ' métiers, meilleur ' + m.chemin1.unSecteur.meilleurPct + ' %', '  « Autonomie » seule : ' + m.chemin1.autonomieSeule.retenus + ' métiers sur ' + m.chemin1.autonomieSeule.dansLaBaseSur + ', meilleur ' + m.chemin1.autonomieSeule.meilleurPct + ' %');
  (m.chemin1.cas || []).forEach((c) => sortie.push('  ' + c.titre + ' : ' + c.retenus + ' métiers ; ' + c.top5.join(' | ')));
  return sortie.join('\n');
}

module.exports = { mesurer: mesurer, rapport: rapport, mesurerPersonas: mesurerPersonas, mesurerStabilite: mesurerStabilite, mesurerChemin3: mesurerChemin3, PERSONAS: PERSONAS, DIFFICILES: DIFFICILES, CODES_RIASEC: CODES_RIASEC, tousLesChoix: tousLesChoix, DOSSIER: DOSSIER };

if (require.main === module) {
  const args = process.argv.slice(2);
  const valeur = (nom) => { const i = args.indexOf(nom); return i !== -1 ? args[i + 1] : null; };
  const cmp = valeur('--comparer');
  const ancien = cmp ? JSON.parse(fs.readFileSync(path.join(DOSSIER, 'mesure_' + cmp + '.json'), 'utf8')) : null;
  const m = mesurer();
  console.log(rapport(m, ancien));
  const ecrire = valeur('--ecrire');
  if (ecrire) {
    fs.mkdirSync(DOSSIER, { recursive: true });
    fs.writeFileSync(path.join(DOSSIER, 'mesure_' + ecrire + '.json'), JSON.stringify(m, null, 1), 'utf8');
    console.log('\nMesure rangée dans docs/bancEssai/mesure_' + ecrire + '.json');
  }
}
