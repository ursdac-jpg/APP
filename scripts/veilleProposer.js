/* ============================================================
   veilleProposer.js  --  contrôle des propositions que Claude dépose pour l'outil de veille (onglet « Travailler avec Claude »)
   ------------------------------------------------------------
   Usage :
     node scripts/veilleProposer.js gabarit              affiche les deux formats de fichier à déposer
     node scripts/veilleProposer.js controler [AAAA-MM-JJ]   contrôle outils/retours/<jour>/propositions/ avec les MÊMES lecteurs que l'outil
   Lecture seule : rien n'est écrit, rien n'est versé dans un sas. Code de sortie 1 s'il reste une erreur à corriger.
   ============================================================ */
'use strict';
const path = require('path');
const racine = path.resolve(__dirname, '..');
const { creerRetours } = require(path.join(racine, 'outils', 'veilleRetours.js'));
const { creerDepot } = require(path.join(racine, 'outils', 'veilleDepot.js'));
const chg = require(path.join(racine, 'outils', 'veilleChangements.js'));

const GABARIT = [
  '=== balayage.json : un tableau de changements (un objet par changement, tous les champs en texte) ===',
  JSON.stringify([{
    mois: '2026-10', periode: 'du 01/10/2026 au 31/10/2026', domaine: 'Emploi et contrats de travail', intitule: 'Titre court du changement', nature: 'décret, publié le 2026-10-07',
    en_vigueur: '2026-11-01', concerne: 'Qui est concerné, en une phrase', ce_qui_change: 'Ce qui change concrètement, en une ou deux phrases', source_titre: 'Journal officiel du 07/10/2026', source_url: 'https://www.legifrance.gouv.fr/...'
  }], null, 2),
  '',
  '=== fiches-hebdo.md ou fiches-rayon-<rayon>.md : des blocs [FICHE] (mise à jour ou nouvelle) et [RETRAIT] ===',
  '[FICHE]', 'id: identifiant-de-la-fiche', 'titre: ...', 'pour_qui: ...', 'tags: [mot, mot]', 'sources:', '  - Nom de la source', 'lexique:', '  - terme = définition', 'ce_qui_change_souvent:', '  - ...', 'texte:', '...', '[/FICHE]',
  '',
  '[RETRAIT]', 'fiche: identifiant-de-la-fiche', 'raison: ...', 'remplace_par: ...', '[/RETRAIT]',
  '',
  '=== chiffres.md : le texte tel que l\'écran « Les chiffres clés du trimestre » le lit (mêmes blocs que la réponse de l\'assistant, plus la lecture) ===',
  '[CHIFFRES periode: 1er trimestre 2026]', 'indicateur: Taux de chômage localisé', 'territoire: Haute-Vienne', 'valeur: 7,4 %', 'date_donnee: 1er trimestre 2026 (provisoire)', 'valeur_precedente: 7,5 %', 'valeur_an_precedent: 7,6 %', 'serie: T4 2025: 7,5 % ; T1 2026: 7,4 %', 'source: nom-court | titre | https://adresse | AAAA-MM-JJ', '(une entrée par indicateur et par territoire, séparées par une ligne vide)', '[/CHIFFRES]',
  '[OU-SE-SITUER]', 'departement_bas: ... | ... | ...', 'departement_haut: ...', 'region_bas: ...', 'region_haut: ...', 'source: ...', '[/OU-SE-SITUER]',
  '[LECTURE]', '### Territoire', 'Paragraphe 1...', '', 'Paragraphe 2...', '[/LECTURE]',
  '[SYNTHESE-COURTE]', 'Territoire : phrase...', '[/SYNTHESE-COURTE]',
  '',
  '=== reseau.md : le bloc que l\'écran « Ce qui circule dans le réseau » lit ===',
  '[CONFRONTER periode: 1er trimestre 2026]', 'signal: ...', 'd_ou: ...', 'rayon: ...', 'confrontation: ...', 'statut: CONFIRME | EN PARTIE | INEXACT | PAS DE POSITION', 'a_recouper: ...', 'preuve: https://adresse-exacte-de-la-page-lue | JJ/MM/AAAA ou sans date | passage recopié mot pour mot', '[/CONFRONTER]',
  '',
  '=== lexique.md : le bloc que « Les mots à proposer » (porte C) lit ===',
  '[LEXIQUE-BRUT]', 'id: identifiant-en-minuscules', 'titre: ...', 'statut: nouveau | evolue | obsolete', 'changement: -', 'fait_brut: ...', 'source: nom-court | titre | https://adresse | AAAA-MM-JJ', 'preuve: https://adresse-exacte-de-la-page-lue | JJ/MM/AAAA ou sans date | passage recopié mot pour mot', '[/LEXIQUE-BRUT]',
  '',
  '=== portrait.md et ue.md : le fichier COMPLET du module (une fois par an), repris du fichier de l\'année précédente et mis à jour avec les réponses ===',
  '---', 'type: portrait   (ue.md : type: chiffres-ue)', 'annee: 2027', 'publie_le: 2027-09', 'prochaine_maj: ...', 'verifie_le: 2027-09', 'territoire: national', 'sources:', '  - "Organisme | Titre de la page | https://adresse | 2027-09"', '---', '', '# Titre', '## Une section', '... (une valeur par ligne, avec sa source : nom | https://adresse)',
  'Modèles : modules/comprendre-les-chiffres/contenu/portrait-2026.md et ue-2026.md. Une valeur sans preuve : la laisser comme dans le fichier actuel avec « [à vérifier] », jamais inventée.',
  '',
  'Règles : jamais de tiret long, jamais le mot « IA », rien de figé dans le texte d\'une fiche (montant ou date : dire où les trouver), une adresse https par source, aucune proposition sans preuve.'
].join('\n');

function jourDuJour() { const d = new Date(), p = (n) => (n < 10 ? '0' : '') + n; return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate()); }

// Lot 4b : chiffres.md, reseau.md, lexique.md sont lus par les lecteurs de l'écran (dans la page) : ici, contrôle de forme seulement (bloc fermé, champs présents, adresse https).
const ECRANS = {
  chiffres: { bloc: 'CHIFFRES', debut: 'indicateur', exige: ['valeur', 'date_donnee', 'source'], libre: 'indicateur' },
  reseau: { bloc: 'CONFRONTER', debut: 'signal', exige: ['confrontation', 'statut', 'preuve'], libre: 'signal', preuveTrois: true },
  lexique: { bloc: 'LEXIQUE-BRUT', debut: 'id', exige: ['titre', 'fait_brut', 'source', 'preuve'], libre: 'titre', preuveTrois: true }
};
function entreesDe(texte, debut) {
  const out = []; let cur = null;
  texte.split('\n').forEach(function (ln) {
    const m = /^\s*[-*]?\s*([a-zA-Zéè_]+)\s*:\s*(.*)$/.exec(ln); if (!m) { return; }
    const k = m[1].toLowerCase();
    if (k === debut) { cur = {}; out.push(cur); }
    if (cur) { cur[k] = m[2].trim(); }
  });
  return out;
}
// Lot 4c : portrait.md et ue.md sont des fichiers complets du module (comme portrait-AAAA.md et ue-AAAA.md) : le Dépôt exige l'en-tête avec type: et annee:.
function controlerAnnuel(p) {
  const attendu = p.id === 'portrait' ? 'portrait' : 'chiffres-ue';
  const t = /^type:\s*(.+?)\s*$/m.exec(p.texte), an = /^annee:\s*(\d{4})\s*$/m.exec(p.texte);
  const titres = p.texte.split('\n').filter(function (l) { return /^##\s+\S/.test(l); }).length;
  console.log('- ' + p.id + ' : ' + titres + ' section(s).');
  let n = 0;
  if (!/^---\s*\n/.test(p.texte) || !t || !an) { console.log('    en-tête manquant : il faut « --- », type: ' + attendu + ' et annee: AAAA en tête de fichier.'); n++; }
  else if (t[1].replace(/^["']|["']$/g, '') !== attendu) { console.log('    type: devrait valoir ' + attendu + ' (trouvé : ' + t[1] + ').'); n++; }
  if (!titres) { console.log('    aucune section (ligne commençant par « ## »).'); n++; }
  if (/—|–/.test(p.texte)) { console.log('    tiret long trouvé : interdit.'); n++; }
  if (/\[à vérifier\]/i.test(p.texte)) { console.log('    des lignes « [à vérifier] » restent : à signaler à Denis, pas à publier telles quelles sans son accord.'); }
  return n;
}
function controlerEcran(p) {
  if (p.id === 'portrait' || p.id === 'ue') { return controlerAnnuel(p); }
  const s = ECRANS[p.id]; let n = 0;
  if (!s) { console.log('- ' + p.id + ' : fichier non prévu.'); return 1; }
  const re = new RegExp('\\[' + s.bloc + '[^\\]]*\\]([\\s\\S]*?)\\[/' + s.bloc + '\\]', 'i'), m = re.exec(p.texte);
  if (!m) { console.log('- ' + p.id + ' : ERREUR : le bloc [' + s.bloc + ' ...] [/' + s.bloc + '] est absent ou non refermé.'); return 1; }
  const entrees = entreesDe(m[1], s.debut).filter(function (e) { return !/^rien\b/i.test(e[s.libre] || ''); });
  console.log('- ' + p.id + ' : ' + entrees.length + ' entrée(s).');
  if (!entrees.length) { console.log('    rien de lisible dans le bloc.'); return 1; }
  entrees.forEach(function (e, i) {
    const manque = s.exige.filter(function (c) { return !(e[c] || '').trim(); });
    if (manque.length) { console.log('    entrée ' + (i + 1) + ' (' + String(e[s.libre] || '').slice(0, 50) + ') : champ(s) manquant(s) : ' + manque.join(', ') + '.'); n++; }
    else if (s.preuveTrois && !/^https:\/\/\S+\s*\|[^|]*\|\s*\S.{8,}/.test(e.preuve || '')) { console.log('    entrée ' + (i + 1) + ' (' + String(e[s.libre] || '').slice(0, 50) + ') : preuve à écrire « adresse | date | passage recopié mot pour mot ».'); n++; }
    else if (!/https:\/\/\S+/.test((e.source || '') + ' ' + (e.preuve || ''))) { console.log('    entrée ' + (i + 1) + ' (' + String(e[s.libre] || '').slice(0, 50) + ') : aucune adresse https en preuve.'); n++; }
  });
  if (p.id === 'chiffres') {
    ['LECTURE', 'SYNTHESE-COURTE', 'OU-SE-SITUER'].forEach(function (b) { if (!new RegExp('\\[' + b + '\\][\\s\\S]*?\\[/' + b + '\\]', 'i').test(p.texte)) { console.log('    bloc [' + b + '] absent.'); n++; } });
  }
  return n;
}

function controler(jour) {
  const [a, m, j] = jour.split('-').map(Number);
  // Les données se lisent dans le dépôt (ou, pour un essai, dans le dossier donné par VEILLE_RACINE) ; le code est toujours celui de ce dépôt.
  const donnees = process.env.VEILLE_RACINE || racine;
  const retours = creerRetours(donnees, { maintenant: () => new Date(a, m - 1, j, 12, 0) });
  const depot = creerDepot(donnees);
  const r = retours.propositions();
  let erreurs = 0;
  console.log('Propositions du ' + jour + ' (' + r.dossier + ') : ' + r.propositions.length + ' fichier(s).');
  r.propositions.forEach(function (p) {
    if (p.erreur) { console.log('- ' + p.id + ' : ERREUR : ' + p.erreur); erreurs++; return; }
    if (p.type === 'changements') {
      console.log('- ' + p.id + ' : ' + p.lignes.length + ' changement(s).');
      p.lignes.forEach(function (l, i) {
        const pb = chg.verifierChangement(l);
        if (pb.length) { console.log('    ligne ' + (i + 1) + ' (' + (l.intitule || 'sans intitulé').slice(0, 50) + ') : à compléter : ' + pb.join(' ')); erreurs++; }
      });
      return;
    }
    if (p.type === 'ecran') { erreurs += controlerEcran(p); return; }
    const rayon = /^fiches-rayon-/.test(p.id) ? p.id.slice('fiches-rayon-'.length) : '';
    const l = depot.lireReponseFichesSas({ texte: p.texte, rayon: rayon });
    if (!l.ok) { console.log('- ' + p.id + ' : ERREUR : ' + (l.erreur || 'texte illisible')); erreurs++; return; }
    console.log('- ' + p.id + ' : ' + l.items.length + ' proposition(s) de fiche.');
    l.items.forEach(function (x) {
      const q = x.proposition || {};
      console.log('    ' + (q.genre || '?') + ' ' + (q.fiche || q.titre || '') + (x.problemes && x.problemes.length ? ' : à corriger : ' + x.problemes.map(function (z) { return typeof z === 'string' ? z : (z.message || z.texte || JSON.stringify(z)); }).join(' ; ') : ' : ok'));
      if (x.problemes && x.problemes.length) { erreurs++; }
    });
    (l.notes || []).forEach(function (n) { console.log('    note : ' + n); });
  });
  console.log(erreurs ? '\n' + erreurs + ' point(s) à corriger avant de prévenir Denis.' : '\nRien à corriger.');
  return erreurs ? 1 : 0;
}

const cmd = process.argv[2] || '';
if (cmd === 'gabarit') { console.log(GABARIT); }
else if (cmd === 'controler') { process.exitCode = controler(process.argv[3] || jourDuJour()); }
else { console.log('Usage : node scripts/veilleProposer.js gabarit | controler [AAAA-MM-JJ]'); process.exitCode = 2; }
