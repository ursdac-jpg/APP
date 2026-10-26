/* ============================================================
   veilleDepot.js  --  « Publier » : ecrire, verifier et enregistrer (Git local) les fichiers prepares par l'outil de veille
   ------------------------------------------------------------
   Utilise par outils/serveur_veille.js. Aucune dependance. PAS de push (jamais) : seulement un enregistrement Git local, annulable.
   Garde-fous : liste FERMEE de destinations (par type), noms controles, taille limitee, aucun tiret cadratin, identifiant de fiche egal au nom ;
   aucune commande n'est construite a partir d'un texte recu (arguments fixes, pas de shell) ; sauvegarde avant ecriture et retour en arriere si les
   tests echouent ; chemins explicites pour Git (jamais « git add -A »).
   ============================================================ */
'use strict';
const fs = require('fs');
const os = require('os');
const crypto = require('crypto');
const path = require('path');
const { spawnSync } = require('child_process');
const lexique = require('./veilleLexique.js');
const motsLexique = require('./veilleMots.js');
const reperesChiffres = require('../scripts/reperesChiffres.js');
const reglesLexique = require('../scripts/checkLexique.js');
const ideesLexique = require('./veilleIdees.js');
const liens = require('./veilleLiens.js');
const territoire = require('./veilleTerritoire.js');
const controle = require('./veilleControle.js');
const sas = require('./veilleSas.js');
const { creerPont, FICHIERS: pontFichiers } = require('./veillePont.js');
const chg = require('./veilleChangements.js');
const ficheChamps = require('./veilleFiche.js');
const choix = require('./veilleChoix.js');
const chiffres = require('./veilleChiffres.js');
const sansNumero = require('./veilleSansNumero.js');
const logiqueTerritoire = require('../modules/mon-territoire/logique.js');
const RE_TERRITOIRE_CHIFFRES = /^(departements-region|regions-france|zones-emploi|entreprises-departements|(medecins|dentistes|pharmaciens|specialistes)-(departements-region|regions-france))\.md$/;

// Les fichiers de chiffres que l'outil sait modifier : digest trimestriel, fiches de territoire, documents annuels (portrait, Europe) et fiches methode
// (celles de « Comprendre les chiffres » : « methode/<id>.md » ; celles de « Comprendre le cadre » : « cadre-methode/<id>.md »). Rend { forme, chemin: [...] } ou null.
function cibleChiffres(nom) {
  const n = String(nom || '');
  if (RE_MOIS.test(n)) { return { forme: 'digest', chemin: DOSSIER_CHIFFRES.concat([n]) }; }
  if (RE_TERRITOIRE_CHIFFRES.test(n)) { return { forme: 'territoire', chemin: DOSSIER_CHIFFRES.concat([n]) }; }
  if (/^(portrait|ue)-\d{4}\.md$/.test(n)) { return { forme: 'annuel', chemin: DOSSIER_CHIFFRES.concat([n]) }; }
  let m = /^methode\/([a-z0-9-]+\.md)$/.exec(n);
  if (m) { return { forme: 'methode', chemin: DOSSIER_CHIFFRES.concat(['methode', m[1]]) }; }
  m = /^cadre-methode\/([a-z0-9-]+\.md)$/.exec(n);
  if (m) { return { forme: 'methode', chemin: DOSSIER_CADRE.concat(['methode', m[1]]) }; }
  return null;
}
// La modification d'une forme : rend { ok, texte, resume } (ou { ok: false, erreur }).
function appliquerChiffres(forme, texte, demande, contexte) {
  if (forme === 'digest') { return chiffres.modifierDigest(texte, demande, contexte); }
  if (forme === 'territoire') { return chiffres.modifierTerritoire(texte, demande, contexte); }
  if (forme === 'annuel') { return chiffres.modifierAnnuel(texte, demande, contexte); }
  return chiffres.modifierMethode(texte, demande);
}
// Ce qui designe la ligne modifiee dans le journal.
function cibleDeDemande(forme, demande) {
  if (forme === 'digest' || forme === 'annuel') { return String(demande.ref || ''); }
  if (forme === 'territoire') { return String(demande.lieu || ''); }
  return '';
}

const TAILLE_MAX = 200000;
const TIRET_COURT = String.fromCharCode(0x2013);
const TIRET_LONG = String.fromCharCode(0x2014);
const RE_FICHE = /^[a-z0-9][a-z0-9-]{0,100}\.md$/;
const RE_MOIS = /^\d{4}-(0[1-9]|1[0-2])\.md$/;
const RE_LEXIQUE = /^lexique-candidats-\d{4}-(0[1-9]|1[0-2])\.js$/;
const CHEMIN_LEXIQUE = 'data/lexique.js';
const RAYONS_HORS_FICHES = ['balayage', 'methode'];
const DOSSIER_CADRE = ['modules', 'comprendre-le-cadre', 'contenu'];
const DOSSIER_CHIFFRES = ['modules', 'comprendre-les-chiffres', 'contenu'];
const FICHIERS_GENERES = [['outils', 'base_fiches.js'], ['data', 'lexique-renvois-cadre.js']];

// Lance une commande avec des arguments fixes (jamais un shell). Rend { code, sortie }.
function lancerCommande(racine, programme, args, options) {
  // Environnement propre : la variable du lanceur de tests de Node ferait croire a un sous-processus qu'il est un sous-test (il ne pourrait plus echouer).
  const env = Object.assign({}, process.env); delete env.NODE_TEST_CONTEXT;
  const r = spawnSync(programme, args, Object.assign({ cwd: racine, env: env, encoding: 'utf8', windowsHide: true, maxBuffer: 64 * 1024 * 1024 }, options || {}));
  return { code: (r.status === null ? -1 : r.status), sortie: String(r.stdout || '') + String(r.stderr || ''), erreur: r.error || null };
}

function contientTiret(t) { return String(t).indexOf(TIRET_COURT) !== -1 || String(t).indexOf(TIRET_LONG) !== -1; }

function rayonsExistants(racine) {
  const d = path.join(racine, ...DOSSIER_CADRE);
  try {
    return fs.readdirSync(d).filter(function (n) {
      return RAYONS_HORS_FICHES.indexOf(n) === -1 && fs.statSync(path.join(d, n)).isDirectory();
    });
  } catch (e) { return []; }
}

// ---------- Lexique : entrees candidates preparees par l'outil ----------
// Le format est celui que l'outil ecrit (construireLexiqueSortie). On ne l'EXECUTE jamais (ni eval, ni Function) : chaque ligne doit correspondre a un modele
// ferme, sinon refus avec le numero de la ligne. Les lignes de commentaire (« // ... ») sont retirees avant l'insertion.
const CH = '"(?:[^"\\\\\\n]|\\\\.)*"';
const LEX = {
  id: /^  id: '([a-z0-9][a-z0-9-]*)',$/,
  titre: new RegExp('^  titre: ' + CH + ',$'),
  tri: new RegExp('^  titreDeTri: ' + CH + ", type: '(terme|notion)',$"),
  gabarit: /^  gabarit: '[a-z0-9-]+',$/,
  univers: /^  univers: '[a-z0-9-]*',$/,
  registres: /^  registres: \[('[a-z0-9-]+'(, '[a-z0-9-]+')*)?\],$/,
  variantes: new RegExp('^  variantesRecherche: \\[(' + CH + '(, ' + CH + ')*)?\\],$'),
  corps: new RegExp('^  corps: ' + CH + ',?$'),
  relOuvre: /^  relations: \[$/,
  relVide: /^  relations: \[\]$/,
  relItem: /^    \{ ficheId: '[a-z0-9-]+', type: '(voir-aussi|a-ne-pas-confondre)' \},?$/,
  relFerme: /^  \]$/
};
// Rend { ok, ids, texte (sans commentaires) } ou { ok:false, erreur }.
function analyserCandidatsLexique(brut) {
  const lignes = String(brut).replace(/\r\n/g, '\n').split('\n');
  const gardees = [], ids = [];
  let etat = 'dehors', champs = null;
  const ordre = ['id', 'titre', 'tri', 'gabarit', 'univers', 'registres', 'variantes', 'corps'];
  const requis = ['id', 'titre', 'tri', 'univers', 'registres', 'variantes', 'corps'];
  for (let i = 0; i < lignes.length; i++) {
    const l = lignes[i], n = i + 1;
    if (/^\s*\/\//.test(l)) { continue; }   // commentaire de l'outil : retire
    if (!l.trim()) {
      if (etat === 'dehors') { continue; }
      return { ok: false, erreur: 'Ligne ' + n + ' : ligne vide a l\'interieur d\'une entree.' };
    }
    if (etat === 'dehors') {
      if (l !== '{') { return { ok: false, erreur: 'Ligne ' + n + ' : attendu « { » (debut d\'une entree).' }; }
      etat = 'champs'; champs = { dernier: -1, vus: {} }; gardees.push(l); continue;
    }
    if (etat === 'champs') {
      if (l === '},') {
        const manque = requis.filter(function (k) { return !champs.vus[k]; });
        if (manque.length) { return { ok: false, erreur: 'Ligne ' + n + ' : entree incomplete (manque : ' + manque.join(', ') + ').' }; }
        etat = 'dehors'; gardees.push(l); gardees.push(''); continue;
      }
      if (LEX.relVide.test(l)) {
        if (!champs.vus.corps) { return { ok: false, erreur: 'Ligne ' + n + ' : « relations » avant « corps ».' }; }
        champs.dernier = ordre.length; gardees.push(l); continue;
      }
      if (LEX.relOuvre.test(l)) {
        if (!champs.vus.corps) { return { ok: false, erreur: 'Ligne ' + n + ' : « relations » avant « corps ».' }; }
        etat = 'relations'; gardees.push(l); continue;
      }
      let trouve = -1;
      for (let k = champs.dernier + 1; k < ordre.length; k++) { if (LEX[ordre[k]].test(l)) { trouve = k; break; } }
      if (trouve < 0) { return { ok: false, erreur: 'Ligne ' + n + ' : format non reconnu ou champ hors ordre : ' + l.slice(0, 70) }; }
      champs.dernier = trouve; champs.vus[ordre[trouve]] = true;
      if (ordre[trouve] === 'id') { ids.push(LEX.id.exec(l)[1]); }
      gardees.push(l); continue;
    }
    if (etat === 'relations') {
      if (LEX.relItem.test(l)) { gardees.push(l); continue; }
      if (LEX.relFerme.test(l)) { etat = 'champs'; champs.dernier = ordre.length; gardees.push(l); continue; }
      return { ok: false, erreur: 'Ligne ' + n + ' : relation non reconnue : ' + l.slice(0, 70) };
    }
  }
  if (etat !== 'dehors') { return { ok: false, erreur: 'Le texte se termine au milieu d\'une entree.' }; }
  if (!ids.length) { return { ok: false, erreur: 'Aucune entree trouvee.' }; }
  const doublons = ids.filter(function (x, i) { return ids.indexOf(x) !== i; });
  if (doublons.length) { return { ok: false, erreur: 'Identifiant present deux fois : ' + doublons[0] + '.' }; }
  // Les entrees une par une (blocs « { ... }, »), pour pouvoir remplacer un mot existant.
  const entrees = []; let courante = null;
  gardees.forEach(function (l) {
    if (l === '{') { courante = { id: '', lignes: [l] }; return; }
    if (!courante) { return; }
    courante.lignes.push(l);
    const m = LEX.id.exec(l); if (m) { courante.id = m[1]; }
    if (l === '},') { entrees.push(courante); courante = null; }
  });
  return { ok: true, ids: ids, texte: gardees.join('\n').replace(/\n+$/, '\n'), entrees: entrees };
}

// Insere les entrees NOUVELLES a la FIN de la liste LEXIQUE_FICHES et, si options.remplacerExistants, REMPLACE les mots qui existent deja (les champs que
// l'outil ne produit pas sont recopies de l'ancienne entree). Sans cette option, un mot existant arrete tout (code « lexique-existant », pour demander confirmation).
// Rend { ok, texte, ajoutes, remplaces, conserves } ou { ok:false, erreur, code?, ids? }.
function integrerCandidatsLexique(contenu, candidats, mois, options) {
  const opt = options || {};
  const existants = lexique.identifiantsExistants(contenu);
  if (!existants) { return { ok: false, erreur: 'data/lexique.js : liste LEXIQUE_FICHES introuvable.' }; }
  const entrees = candidats.entrees || [];
  const dejaLa = entrees.filter(function (e) { return existants.indexOf(e.id) !== -1; });
  const nouvelles = entrees.filter(function (e) { return existants.indexOf(e.id) === -1; });
  if (dejaLa.length && !opt.remplacerExistants) {
    return { ok: false, code: 'lexique-existant', ids: dejaLa.map(function (e) { return e.id; }), erreur: 'Ce mot existe deja dans le Lexique : ' + dejaLa.map(function (e) { return e.id; }).join(', ') + '. Voulez-vous le REMPLACER par votre version ? (les champs que l\'outil ne gere pas sont conserves ; « Annuler cette publication » remet tout comme avant)' };
  }
  let texte = contenu;
  const remplaces = [], conserves = {};
  for (const e of dejaLa) {
    const r = lexique.remplacerEntree(texte, e);
    if (!r.ok) { return { ok: false, erreur: r.erreur }; }
    texte = r.texte; remplaces.push(e.id); conserves[e.id] = r.conserves;
  }
  if (nouvelles.length) {
    const fin = lexique.objetsDeLaListe(texte).finListe;
    let avant = texte.slice(0, fin).replace(/\s+$/, '');
    if (!/,$/.test(avant)) { avant += ','; }
    const titreBloc = '// -- Ajouts de la veille ' + String(mois || '') + ' --';
    // Un deuxieme ajout du meme mois s'ajoute a la suite du premier, sans repeter le titre du bloc.
    const entete = texte.indexOf(titreBloc) !== -1 ? '\n\n' : '\n\n  ' + titreBloc + '\n\n';
    const corps = nouvelles.map(function (e) {
      return e.lignes.map(function (l) { return '  ' + l; }).join('\n');
    }).join('\n\n');
    texte = avant + entete + corps + '\n' + texte.slice(fin);
  }
  return { ok: true, texte: texte, ajoutes: nouvelles.map(function (e) { return e.id; }), remplaces: remplaces, conserves: conserves };
}

// Valide UN fichier de la publication. Rend { ok, erreur } ou { ok, chemin (relatif, avec /), sousDossier }.
function validerFichier(racine, f, rayons) {
  if (!f || typeof f !== 'object') { return { ok: false, erreur: 'Fichier mal forme.' }; }
  const type = String(f.type || ''), nom = String(f.nom || ''), texte = f.texte;
  if (type === 'territoire') {
    // Registres du module « Qui fait quoi » (structures, employeurs) : pas de texte envoye, des ACTIONS que veilleTerritoire.js applique ligne par ligne.
    const fichier = String(f.fichier || '');
    if (!territoire.FICHIERS[fichier]) { return { ok: false, erreur: 'Registre du module Qui fait quoi inconnu (« ' + fichier.slice(0, 30) + ' »).' }; }
    if (!Array.isArray(f.actions) || !f.actions.length) { return { ok: false, erreur: 'Aucune modification a enregistrer.' }; }
    const cheminT = territoire.FICHIERS[fichier].chemin;
    return { ok: true, chemin: cheminT, type: 'territoire', fichier: fichier, rayon: '', nom: path.basename(cheminT), texte: '', actions: f.actions };
  }
  if (type === 'sas') {
    // Sas du module « Qui fait quoi » (fiches proposees, pas encore verifiees, jamais lues par l'application) : des ACTIONS que veilleSas.js applique.
    const fichierS = String(f.fichier || '');
    if (!sas.CHEMINS[fichierS]) { return { ok: false, erreur: 'Sas inconnu (« ' + fichierS.slice(0, 30) + ' »).' }; }
    if (!Array.isArray(f.actions) || !f.actions.length) { return { ok: false, erreur: 'Aucune modification du sas a enregistrer.' }; }
    return { ok: true, chemin: sas.CHEMINS[fichierS], type: 'sas', fichier: fichierS, rayon: '', nom: path.basename(sas.CHEMINS[fichierS]), texte: '', actions: f.actions };
  }
  if (type === 'sans-numero') {
    // « Cette fiche n'a pas de numéro » : la confirmation de Denis (date du jour) est gardée dans un petit fichier suivi par Git, que l'application ne lit pas.
    if (!Array.isArray(f.actions) || !f.actions.length) { return { ok: false, erreur: 'Aucune fiche à marquer « sans numéro ».' }; }
    const cheminN = sansNumero.CHEMIN.join('/');
    return { ok: true, chemin: cheminN, type: 'sans-numero', fichier: '', rayon: '', nom: path.basename(cheminN), texte: '', actions: f.actions };
  }
  if (type === 'changements') {
    // Sas des changements du balayage (jamais lu par l'application) : des ACTIONS (importer, retirer, valider) que veilleChangements.js applique ;
    // « valider » ecrit le changement dans contenu/balayage/<mois>.md avec « Verifie le ».
    if (!Array.isArray(f.actions) || !f.actions.length) { return { ok: false, erreur: 'Aucune modification du sas des changements a enregistrer.' }; }
    return { ok: true, chemin: chg.CHEMIN_SAS, type: 'changements', fichier: '', rayon: '', nom: path.basename(chg.CHEMIN_SAS), texte: '', actions: f.actions };
  }
  if (type === 'fiche-champs') {
    // Une fiche EXISTANTE du cadre modifiee champ par champ : pas de texte envoye, des changements que veilleFiche.js applique (jamais une creation).
    const rayonF = String(f.rayon || '');
    if (rayons.indexOf(rayonF) === -1) { return { ok: false, erreur: nom + ' : rayon inconnu (« ' + rayonF + ' »).' }; }
    if (!RE_FICHE.test(nom) || /\.collecte\.md$/.test(nom) || nom === 'readme.md') { return { ok: false, erreur: 'Nom de fiche refuse : ' + nom + '.' }; }
    if (!f.changements || typeof f.changements !== 'object' || Array.isArray(f.changements)) { return { ok: false, erreur: nom + ' : aucune modification a enregistrer.' }; }
    const cheminF = DOSSIER_CADRE.concat([rayonF, nom]).join('/');
    if (path.resolve(racine, cheminF).indexOf(path.resolve(racine) + path.sep) !== 0) { return { ok: false, erreur: nom + ' : destination refusee.' }; }
    return { ok: true, chemin: cheminF, type: 'fiche-champs', rayon: rayonF, nom: nom, texte: '', changements: f.changements, revision: String(f.revision || ''), formeSeule: !!f.formeSeule, datation: f.datation === 'redater' ? 'redater' : 'garder' };
  }
  if (type === 'chiffres-champs') {
    // Un fichier existant de « Comprendre les chiffres » (ou une fiche methode) modifie par ses champs : pas de texte envoye.
    const cib = cibleChiffres(nom);
    if (!cib) { return { ok: false, erreur: 'Fichier de chiffres non pris en charge : ' + nom.slice(0, 50) + '.' }; }
    if (!f.demande || typeof f.demande !== 'object' || Array.isArray(f.demande)) { return { ok: false, erreur: nom + ' : aucune modification a enregistrer.' }; }
    return { ok: true, chemin: cib.chemin.join('/'), type: 'chiffres-champs', rayon: '', nom: nom, texte: '', demande: f.demande, phrase: String(f.phrase || ''), forme: cib.forme };
  }
  if (type === 'mots-liste') {
    // « Ma liste » du Lexique (mots proposes, jamais lus par l'application) : des ACTIONS (ajouter, changer l'etat, ecrire un brouillon) que veilleIdees.js applique.
    if (!Array.isArray(f.actions) || !f.actions.length) { return { ok: false, erreur: 'Aucune modification de la liste des mots a enregistrer.' }; }
    if (f.actions.length > 100) { return { ok: false, erreur: 'Trop d\'actions d\'un coup (100 au plus).' }; }
    return { ok: true, chemin: ideesLexique.CHEMIN_LISTE, type: 'mots-liste', fichier: '', rayon: '', nom: path.basename(ideesLexique.CHEMIN_LISTE), texte: '', actions: f.actions };
  }
  if (type === 'lexique-champs') {
    // Un mot EXISTANT du Lexique modifie champ par champ : pas de texte envoye, des champs que veilleLexique.remplacerChamps applique (jamais une creation).
    const idM = String(f.id || '');
    if (!/^[a-z0-9][a-z0-9-]{0,100}$/.test(idM)) { return { ok: false, erreur: 'Identifiant de mot refuse.' }; }
    if (!f.champs || typeof f.champs !== 'object' || Array.isArray(f.champs) || !Object.keys(f.champs).length) { return { ok: false, erreur: idM + ' : aucune modification a enregistrer.' }; }
    return { ok: true, chemin: CHEMIN_LEXIQUE, type: 'lexique-champs', rayon: '', nom: idM, texte: '', champs: f.champs, phrase: String(f.phrase || '') };
  }
  if (type === 'lexique-nouveau') {
    // Un mot NEUF, ecrit dans l'ecran « Le Lexique » (jamais un fichier de candidats a recopier) : ses champs, que veilleMots.js controle puis ecrit dans la forme stricte.
    if (!f.mot || typeof f.mot !== 'object' || Array.isArray(f.mot)) { return { ok: false, erreur: 'Mot neuf mal forme.' }; }
    return { ok: true, chemin: CHEMIN_LEXIQUE, type: 'lexique-nouveau', rayon: '', nom: String(f.mot.id || ''), texte: '', mot: f.mot, origine: String(f.origine || ''), sasId: String(f.sasId || '') };
  }
  if (type === 'liens') {
    // Registre des adresses : pas de texte envoye, des ACTIONS (valider, modifier, supprimer, ajouter) que veilleLiens.js applique ligne par ligne.
    if (!Array.isArray(f.actions) || !f.actions.length) { return { ok: false, erreur: 'Aucune modification d\'adresse a enregistrer.' }; }
    return { ok: true, chemin: liens.CHEMIN_LIENS, type: 'liens', rayon: '', nom: 'liens-verifies.txt', texte: '', actions: f.actions };
  }
  if (typeof texte !== 'string' || !texte.length) { return { ok: false, erreur: nom + ' : contenu vide.' }; }
  if (texte.length > TAILLE_MAX) { return { ok: false, erreur: nom + ' : trop long (' + TAILLE_MAX + ' caracteres au plus).' }; }
  if (texte.indexOf('\u0000') !== -1) { return { ok: false, erreur: nom + ' : contenu illisible.' }; }
  // (Lexique : le texte de l'outil porte des commentaires avec des tirets ; ils sont retires, le controle porte sur les entrees elles-memes.)
  if (type !== 'lexique' && contientTiret(texte)) { return { ok: false, erreur: nom + ' : contient un tiret cadratin ou demi-cadratin (interdit dans l\'application).' }; }
  let chemin = '';
  if (type === 'fiche') {
    const rayon = String(f.rayon || '');
    if (rayons.indexOf(rayon) === -1) { return { ok: false, erreur: nom + ' : rayon inconnu (« ' + rayon + ' »).' }; }
    if (!RE_FICHE.test(nom) || /\.collecte\.md$/.test(nom) || nom === 'readme.md') { return { ok: false, erreur: 'Nom de fiche refuse : ' + nom + '.' }; }
    if (!/^---\s*\n/.test(texte)) { return { ok: false, erreur: nom + ' : la fiche doit commencer par son en-tete (---).' }; }
    const m = /^id:\s*(.+?)\s*$/m.exec(texte);
    if (!m || m[1].replace(/^["']|["']$/g, '') !== nom.replace(/\.md$/, '')) { return { ok: false, erreur: nom + ' : l\'identifiant de la fiche (id:) doit etre egal au nom du fichier.' }; }
    chemin = DOSSIER_CADRE.concat([rayon, nom]).join('/');
  } else if (type === 'collecte') {
    const rayon = String(f.rayon || '');
    if (rayons.indexOf(rayon) === -1) { return { ok: false, erreur: nom + ' : rayon inconnu (« ' + rayon + ' »).' }; }
    if (nom !== rayon + '.collecte.md') { return { ok: false, erreur: 'Nom de collecte refuse : ' + nom + ' (attendu ' + rayon + '.collecte.md).' }; }
    chemin = DOSSIER_CADRE.concat([rayon, nom]).join('/');
  } else if (type === 'balayage') {
    if (!RE_MOIS.test(nom)) { return { ok: false, erreur: 'Nom de digest refuse : ' + nom + ' (attendu AAAA-MM.md).' }; }
    chemin = DOSSIER_CADRE.concat(['balayage', nom]).join('/');
  } else if (type === 'chiffres') {
    if (!RE_MOIS.test(nom)) { return { ok: false, erreur: 'Nom de digest refuse : ' + nom + ' (attendu AAAA-MM.md).' }; }
    chemin = DOSSIER_CHIFFRES.concat([nom]).join('/');
  } else if (type === 'portrait' || type === 'ue') {
    // Digests ANNUELS : l'outil donne la reponse BRUTE de l'assistant ; elle doit d'abord etre mise en forme (en-tete du module). On refuse tant que ce n'est pas fait.
    const mm = (type === 'portrait' ? /^portrait-(\d{4})\.md$/ : /^ue-(\d{4})\.md$/).exec(nom);
    if (!mm) { return { ok: false, erreur: 'Nom de digest annuel refuse : ' + nom + ' (attendu ' + (type === 'portrait' ? 'portrait-AAAA.md' : 'ue-AAAA.md') + ').' }; }
    const attendu = type === 'portrait' ? 'portrait' : 'chiffres-ue';
    const t = /^type:\s*(.+?)\s*$/m.exec(texte), an = /^annee:\s*(\d{4})\s*$/m.exec(texte);
    if (!/^---\s*\n/.test(texte) || !t || !an) { return { ok: false, erreur: nom + ' : ce fichier n\'est pas encore au format du module (en-tete « --- » avec type: et annee: manquant). Mettez-le en forme selon docs/VEILLE_PROMPTS.md (5ter) avant de le publier.' }; }
    if (t[1].replace(/^["']|["']$/g, '') !== attendu) { return { ok: false, erreur: nom + ' : type: devrait valoir « ' + attendu + ' ».' }; }
    if (an[1] !== mm[1]) { return { ok: false, erreur: nom + ' : annee: (' + an[1] + ') differente de celle du nom du fichier (' + mm[1] + ').' }; }
    chemin = DOSSIER_CHIFFRES.concat([nom]).join('/');
  } else if (type === 'confronter') {
    // « A confronter » : archive de la veille (l'application ne le lit pas), rangee hors du code de l'application.
    if (!RE_MOIS.test(nom)) { return { ok: false, erreur: 'Nom de digest refuse : ' + nom + ' (attendu AAAA-MM.md).' }; }
    chemin = ['docs', 'veille', 'a-confronter', nom].join('/');
  } else if (type === 'lexique') {
    if (!RE_LEXIQUE.test(nom)) { return { ok: false, erreur: 'Nom de fichier du Lexique refuse : ' + nom + ' (attendu lexique-candidats-AAAA-MM.js).' }; }
    const a = analyserCandidatsLexique(texte);
    if (!a.ok) { return { ok: false, erreur: nom + ' : ' + a.erreur }; }
    if (contientTiret(a.texte)) { return { ok: false, erreur: nom + ' : une entree contient un tiret cadratin ou demi-cadratin (interdit dans l\'application).' }; }
    return { ok: true, chemin: CHEMIN_LEXIQUE, type: 'lexique', rayon: '', nom: nom, texte: a.texte, ids: a.ids, entrees: a.entrees, mois: /(\d{4}-\d{2})/.exec(nom)[1] };
  } else {
    return { ok: false, erreur: nom + ' : ce type de fichier n\'est pas pris en charge par « Publier » (type « ' + type + ' »).' };
  }
  // Dernier controle : le chemin resolu doit rester DANS le depot, sans detour.
  const absolu = path.resolve(racine, chemin);
  if (absolu.indexOf(path.resolve(racine) + path.sep) !== 0 || chemin.indexOf('..') !== -1) { return { ok: false, erreur: nom + ' : destination refusee.' }; }
  return { ok: true, chemin: chemin, type: type, rayon: String(f.rayon || ''), nom: nom, texte: texte };
}

// Ajoute la ligne d'une fiche NOUVELLE au tableau « Les N fiches » du README du rayon (et met le nombre a jour). Rend { ok, texte } ou { ok:false, erreur }.
function ajouterLigneReadme(texteReadme, id, titre) {
  const fin = texteReadme.indexOf('\r\n') !== -1 ? '\r\n' : '\n';
  const lignes = texteReadme.split(/\r?\n/);
  const iTitre = lignes.findIndex(function (l) { return /^##\s+Les\s+\d+\s+fiches?\s*$/.test(l); });
  if (iTitre < 0) { return { ok: false, erreur: 'Le README du rayon n\'a pas de tableau « Les N fiches ».' }; }
  let i = iTitre + 1;
  while (i < lignes.length && !/^\|/.test(lignes[i])) { i++; }
  if (i >= lignes.length) { return { ok: false, erreur: 'Tableau « Les N fiches » introuvable dans le README.' }; }
  let dernier = i;
  while (dernier + 1 < lignes.length && /^\|/.test(lignes[dernier + 1])) { dernier++; }
  const dejaLa = lignes.slice(i, dernier + 1).some(function (l) { return l.indexOf('`' + id + '`') !== -1; });
  if (dejaLa) { return { ok: true, texte: texteReadme, ajoutee: false }; }
  const proprete = String(titre || id).replace(/\|/g, '/').trim();
  lignes.splice(dernier + 1, 0, '| `' + id + '` | ' + proprete + ' |');
  const n = parseInt(/\d+/.exec(lignes[iTitre])[0], 10) + 1;
  lignes[iTitre] = '## Les ' + n + (n > 1 ? ' fiches' : ' fiche');
  return { ok: true, texte: lignes.join(fin), ajoutee: true };
}

function titreDeFiche(texte, id) {
  const m = /^titre:\s*(.+?)\s*$/m.exec(texte);
  return m ? m[1].replace(/^["']|["']$/g, '') : id;
}

function lireOuNull(chemin) { try { return fs.readFileSync(chemin); } catch (e) { return null; } }

function creerDepot(racine, options) {
  const opt = options || {};
  const lancer = opt.lancerCommande || function (prog, args) { return lancerCommande(racine, prog, args); };
  const git = function (args) { return lancer('git', args); };
  let derniere = null;   // { hash, chemins } : la derniere publication de cette seance (la seule annulable)
  // La liste de transition des chiffres du Lexique (fichier lu aussi par scripts/checkLexique.js, qui en est l'autorite) : les fiches dont le texte garde un chiffre.
  function transitionIds() { const b = lireOuNull(path.resolve(racine, 'outils/lexique_transition_chiffres.txt')); return b === null ? [] : reglesLexique.lireTransition(b.toString('utf8')); }

  // Les lignes d'etat « XY chemin » d'un `git status --porcelain` (git peut y mele des avertissements, par exemple pour un dossier qui n'existe pas encore : ce ne sont pas des modifications).
  // REPÈRE D'ENREGISTREMENT : posé juste avant d'écrire les fichiers, retiré quand tout est fini. S'il reste, l'enregistrement a été interrompu (page ou fenêtre fermée, programme arrêté).
  // Il vit dans le dossier temporaire du poste, jamais dans le dépôt (il ne doit pas apparaître comme une modification).
  const cheminRepere = path.join(os.tmpdir(), 'veille_enregistrement_en_cours_' + crypto.createHash('sha1').update(path.resolve(racine)).digest('hex').slice(0, 12) + '.json');
  function poserRepere(chemins) { try { fs.writeFileSync(cheminRepere, JSON.stringify({ debut: new Date().toISOString(), chemins: chemins })); } catch (e) { /* tant pis : le contrôle des fichiers modifiés prendra le relais */ } }
  function retirerRepere() { try { fs.rmSync(cheminRepere, { force: true }); } catch (e) { /* rien */ } }
  function lireRepere() { try { return JSON.parse(fs.readFileSync(cheminRepere, 'utf8')); } catch (e) { return null; } }
  // Registres que l'outil modifie (suivis par Git) : un de ces fichiers modifié sans enregistrement = travail à reprendre ou à annuler.
  function cheminsSuivis() {
    const l = [territoire.FICHIERS.lieux.chemin, territoire.FICHIERS.employeurs.chemin, territoire.FICHIERS.offres.chemin, 'modules/comprendre-le-cadre/liens-verifies.txt'];
    return l.concat(FICHIERS_GENERES.map(function (c) { return c.join('/'); }));
  }
  // Ce qui est resté en suspens : { chemins, resume, debut } ou null.
  function interrompue() {
    const repere = lireRepere();
    const st = git(['status', '--porcelain', '--'].concat(cheminsSuivis()));
    const modifies = st.code === 0 ? lignesModifiees(st).map(function (l) { return l.slice(3).trim(); }) : [];
    if (!repere && !modifies.length) { return null; }
    const chemins = modifies.length ? modifies : (repere.chemins || []);
    if (!chemins.length) { retirerRepere(); return null; }
    const d = git(['diff', '--unified=0', '--no-color', '--ignore-space-at-eol', '--'].concat(chemins));
    const lignes = d.code === 0 ? d.sortie.split('\n').filter(function (l) { return /^[-+]/.test(l) && !/^(---|\+\+\+)/.test(l); }).slice(0, 40).map(function (l) { return l.slice(0, 220); }) : [];
    return { chemins: chemins, resume: lignes, debut: repere ? repere.debut : null, repere: !!repere };
  }
  function lignesModifiees(st) { return st.sortie.split('\n').filter(function (l) { return /^[ MADRCTU?!]{2} \S/.test(l); }); }

  function branche() { const r = git(['rev-parse', '--abbrev-ref', 'HEAD']); return r.code === 0 ? r.sortie.trim() : ''; }

  function etat() {
    const st = git(['status', '--porcelain']);
    return {
      branche: branche(),
      modifications: st.code === 0 ? st.sortie.split('\n').filter(Boolean).length : -1,
      annulable: !!derniere,
      interrompue: interrompue()
    };
  }

  function aujourdhui() {
    if (opt.aujourdhui) { return opt.aujourdhui(); }
    const d = new Date(), p = function (n) { return (n < 10 ? '0' : '') + n; };
    return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate());
  }

  // Journal des modifications des registres Qui fait quoi : date ET heure de chaque fiche ajoutée ou modifiée (les registres, eux, ne portent que la date). L'application NE LIT PAS ce fichier.
  const JOURNAL = 'outils/journal_modifications.txt';
  function maintenant() {
    if (opt.maintenant) { return opt.maintenant(); }
    const d = new Date(), p = function (n) { return (n < 10 ? '0' : '') + n; };
    return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate()) + ' ' + p(d.getHours()) + ':' + p(d.getMinutes());
  }
  function fichesTouchees(fichier, avant, apres) {
    const cols = territoire.FICHIERS[fichier].colonnes, vus = {};
    territoire.analyser(avant, cols).lignes.forEach(function (l) { if (l.id) { vus[l.id] = JSON.stringify(l.valeurs); } });
    const sortie = [];
    territoire.analyser(apres, cols).lignes.forEach(function (l) { if (l.id && vus[l.id] !== JSON.stringify(l.valeurs)) { sortie.push({ id: l.id, nouvelle: vus[l.id] === undefined }); } });
    return sortie;
  }
  function liensTouches(avant, apres) {
    const vus = {};
    liens.analyser(avant).lignes.forEach(function (l) { if (l.nom) { vus[l.nom] = l.adresse + '|' + l.date + '|' + l.portee; } });
    const sortie = [];
    liens.analyser(apres).lignes.forEach(function (l) { if (l.nom && vus[l.nom] !== l.adresse + '|' + l.date + '|' + l.portee) { sortie.push({ id: l.nom, nouvelle: vus[l.nom] === undefined }); } });
    return sortie;
  }
  function dernieresModifications(fichier) {
    const t = lireOuNull(path.resolve(racine, JOURNAL)), m = {};
    if (!t) { return m; }
    t.toString('utf8').split('\n').forEach(function (ligne) {
      const c = ligne.split('|').map(function (x) { return x.trim(); });
      if (c.length >= 3 && c[1] === fichier && /^\d{4}-\d\d-\d\d \d\d:\d\d$/.test(c[0])) { m[c[2]] = c[0]; }
    });
    return m;
  }

  // Le repère est retiré à la sortie de chaque enregistrement, sauf si les fichiers restent écrits sans être rangés (échec de Git) : il reste alors pour proposer la reprise.
  let garderRepere = false;
  function publier(fichiers, options) {
    garderRepere = false;
    try { return publierInterne(fichiers, options); }
    finally { if (!garderRepere) { retirerRepere(); } }
  }

  function publierInterne(fichiers, options) {
    if (!Array.isArray(fichiers) || !fichiers.length) { return { ok: false, code: 'vide', erreur: 'Aucun fichier a publier.' }; }
    if (fichiers.length > 60) { return { ok: false, code: 'trop', erreur: 'Trop de fichiers d\'un coup (60 au plus).' }; }
    if (branche() !== 'master') { return { ok: false, code: 'branche', erreur: 'Le depot n\'est pas sur la branche principale (master) : changez de branche avant de publier.' }; }
    const rayons = rayonsExistants(racine);
    const valides = [], erreurs = [], vus = {};
    fichiers.forEach(function (f) {
      const v = validerFichier(racine, f, rayons);
      if (!v.ok) { erreurs.push(v.erreur); return; }
      if (vus[v.chemin]) { erreurs.push(v.nom + ' : present deux fois dans la publication.'); return; }
      vus[v.chemin] = true; valides.push(v);
    });
    if (erreurs.length) { return { ok: false, code: 'invalide', erreur: erreurs[0], erreurs: erreurs }; }

    // README : une fiche NOUVELLE (fichier absent du depot) doit etre ajoutee au tableau de son rayon.
    const prevus = {};   // chemin -> nouveau contenu (Buffer)
    const nouvelles = [];
    const journalAjouts = [];
    let resumeListe = null, motsAjoutes = [], motsRemplaces = [], resumeLiens = null, resumeTerritoire = null, resumeSas = null, resumeSansNumero = null, resumeChangements = null;
    const resumeFiches = [], resumeChiffres = [], resumeLexique = [];
    for (const v of valides) {
      if (v.type === 'lexique') {
        const courant = (lireOuNull(path.resolve(racine, CHEMIN_LEXIQUE)) || Buffer.from('')).toString('utf8');
        const r = integrerCandidatsLexique(courant, { ids: v.ids, texte: v.texte, entrees: v.entrees }, v.mois, options);
        if (!r.ok) { return { ok: false, code: r.code || 'lexique', ids: r.ids, erreur: v.nom + ' : ' + r.erreur }; }
        prevus[v.chemin] = Buffer.from(r.texte, 'utf8');
        motsAjoutes = motsAjoutes.concat(r.ajoutes); motsRemplaces = motsRemplaces.concat(r.remplaces);
        continue;
      }
      if (v.type === 'mots-liste') {
        const courantM = (lireOuNull(path.resolve(racine, v.chemin)) || Buffer.from('')).toString('utf8');
        const lxM = lireOuNull(path.resolve(racine, CHEMIN_LEXIQUE)), tousM = lxM ? lexique.lireMots(lxM.toString('utf8')) : null;
        if (!tousM) { return { ok: false, code: 'lexique', erreur: 'data/lexique.js : liste LEXIQUE_FICHES introuvable.' }; }
        const r = ideesLexique.appliquer(courantM, v.actions, { existants: tousM, aujourdhui: aujourdhui() });
        if (!r.ok) { return { ok: false, code: 'mots-liste', erreur: r.erreur }; }
        if (!r.resume.ajoutees.length && !r.resume.changees && !r.resume.brouillons) { return { ok: false, code: 'mots-liste-rien', erreur: r.resume.ignorees.length ? 'Rien à ajouter : ' + r.resume.ignorees.map(function (x) { return '« ' + x.mot + ' » ' + (x.raison === 'existe' ? 'existe déjà dans le Lexique' : 'est déjà dans votre liste'); }).join(' ; ') + '.' : 'Ces modifications ne changent rien à la liste.' }; }
        prevus[v.chemin] = Buffer.from(r.texte, 'utf8'); resumeListe = r.resume;
        continue;
      }
      if (v.type === 'lexique-champs' || v.type === 'lexique-nouveau') {
        const courantLx = (lireOuNull(path.resolve(racine, CHEMIN_LEXIQUE)) || Buffer.from('')).toString('utf8');
        const tousLx = lexique.lireMots(courantLx);
        if (!tousLx) { return { ok: false, code: 'lexique', erreur: 'data/lexique.js : liste LEXIQUE_FICHES introuvable.' }; }
        const quand = maintenant();
        const vide = { titre: '', titreDeTri: '', univers: '', registres: [], variantes: [], corps: '', relations: [] };
        if (v.type === 'lexique-champs') {
          const original = tousLx.filter(function (x) { return x.id === v.nom; })[0];
          if (!original) { return { ok: false, code: 'mot-absent', erreur: v.nom + ' : ce mot n\'existe pas dans le Lexique (la creation d\'un mot ne passe pas par cette voie).' }; }
          const mot = Object.assign({}, original, v.champs);
          const verif = motsLexique.verifierMot(mot, tousLx.filter(function (x) { return x.id !== v.nom; }), { original: original, phrase: v.phrase, transition: transitionIds() });
          if (verif.erreurs.length) { return { ok: false, code: 'lexique-mot', erreur: v.nom + ' : ' + verif.erreurs[0], erreurs: verif.erreurs }; }
          if (!verif.modifies.length) { return { ok: false, code: 'lexique-rien', erreur: v.nom + ' : ces modifications ne changent rien au mot.' }; }
          const aEcrire = {};
          verif.modifies.forEach(function (c) {
            aEcrire[c] = (c === 'titre' || c === 'corps') ? String(mot[c]).trim() : (c === 'variantes' ? mot[c].map(function (x) { return String(x).trim(); }).filter(Boolean) : mot[c]);
          });
          const r = lexique.remplacerChamps(courantLx, v.nom, aEcrire);
          if (!r.ok) { return { ok: false, code: 'lexique-ecriture', erreur: v.nom + ' : ' + r.erreur }; }
          prevus[v.chemin] = Buffer.from(r.texte, 'utf8');
          const apresMot = Object.assign({}, mot, aEcrire);
          // Migration : si le texte du mot n'a plus aucun chiffre et que la fiche etait sur la liste de transition, elle en sort DANS LE MEME enregistrement
          // (sinon la verification du Lexique refuserait : une fiche listee doit encore avoir un chiffre).
          if (transitionIds().indexOf(v.nom) !== -1 && !reperesChiffres.reperes(String(apresMot.corps || '')).length) {
            const cheminT = 'outils/lexique_transition_chiffres.txt', brutT = (lireOuNull(path.resolve(racine, cheminT)) || Buffer.from('')).toString('utf8');
            prevus[cheminT] = Buffer.from(brutT.split('\n').filter(function (l) { return l.replace(/#.*$/, '').trim() !== v.nom; }).join('\n'), 'utf8');
          }
          const diffs = motsLexique.differences(original, apresMot);
          const ancienEvo = (lireOuNull(path.resolve(racine, motsLexique.CHEMIN_EVOLUTION)) || Buffer.from('')).toString('utf8');
          prevus[motsLexique.CHEMIN_EVOLUTION] = Buffer.from(motsLexique.ajouterEvolution(ancienEvo, motsLexique.lignesEvolution(quand, v.nom, apresMot.titre, 'modifié', v.phrase, diffs)), 'utf8');
          journalAjouts.push(quand + ' | lexique | ' + v.nom + ' | modifiée | ' + String(v.phrase || '').replace(/\|/g, '/'));
          resumeLexique.push({ mot: v.nom, titre: apresMot.titre, action: 'modifié', champs: verif.modifies, avertissements: verif.avertissements });
          motsRemplaces.push(v.nom);
        } else {
          const mot = {
            id: String(v.mot.id || '').trim(), titre: String(v.mot.titre || '').trim(), titreDeTri: String(v.mot.titreDeTri || '').trim(), type: v.mot.type === 'notion' ? 'notion' : 'terme', gabarit: v.mot.type === 'notion' ? String(v.mot.gabarit || '') : '', univers: String(v.mot.univers || ''),
            registres: Array.isArray(v.mot.registres) ? v.mot.registres : [], variantes: (Array.isArray(v.mot.variantes) ? v.mot.variantes : []).map(function (x) { return String(x).trim(); }).filter(Boolean),
            corps: String(v.mot.corps || '').trim(), relations: Array.isArray(v.mot.relations) ? v.mot.relations : [], chiffres: '', details: v.mot.details || null
          };
          const verif = motsLexique.verifierMot(mot, tousLx, { nouveau: true, transition: transitionIds() });
          if (verif.erreurs.length) { return { ok: false, code: 'lexique-mot', erreur: (mot.id || 'mot neuf') + ' : ' + verif.erreurs[0], erreurs: verif.erreurs }; }
          const cand = analyserCandidatsLexique(motsLexique.lignesPourInsertion(mot).join('\n') + '\n');
          if (!cand.ok) { return { ok: false, code: 'lexique-ecriture', erreur: mot.id + ' : ' + cand.erreur }; }
          const r = integrerCandidatsLexique(courantLx, { ids: cand.ids, texte: cand.texte, entrees: cand.entrees }, quand.slice(0, 7), {});
          if (!r.ok) { return { ok: false, code: r.code || 'lexique', ids: r.ids, erreur: mot.id + ' : ' + r.erreur }; }
          let texteNeuf = r.texte;
          if (mot.details) {   // un mot neuf peut naitre avec son bloc « Les chiffres a jour » : insere dans le meme enregistrement
            const rd = lexique.remplacerChamps(texteNeuf, mot.id, { details: mot.details });
            if (!rd.ok) { return { ok: false, code: 'lexique-ecriture', erreur: mot.id + ' : ' + rd.erreur }; }
            texteNeuf = rd.texte;
          }
          prevus[v.chemin] = Buffer.from(texteNeuf, 'utf8');
          const ancienEvo = (lireOuNull(path.resolve(racine, motsLexique.CHEMIN_EVOLUTION)) || Buffer.from('')).toString('utf8');
          prevus[motsLexique.CHEMIN_EVOLUTION] = Buffer.from(motsLexique.ajouterEvolution(ancienEvo, motsLexique.lignesEvolution(quand, mot.id, mot.titre, 'créé', v.origine, motsLexique.differences(vide, mot))), 'utf8');
          journalAjouts.push(quand + ' | lexique | ' + mot.id + ' | ajoutée | ' + String(v.origine || '').replace(/\|/g, '/'));
          resumeLexique.push({ mot: mot.id, titre: mot.titre, action: 'créé', champs: motsLexique.CHAMPS, avertissements: verif.avertissements });
          motsAjoutes.push(mot.id);
          if (v.sasId) {
            const cheminL = ideesLexique.CHEMIN_LISTE, courantL2 = prevus[cheminL] ? prevus[cheminL].toString('utf8') : (lireOuNull(path.resolve(racine, cheminL)) || Buffer.from('')).toString('utf8');
            const rl = ideesLexique.appliquer(courantL2, [{ op: 'publie', k: v.sasId }], { existants: tousLx, aujourdhui: aujourdhui() });
            if (!rl.ok) { return { ok: false, code: 'mots-liste', erreur: rl.erreur }; }
            prevus[cheminL] = Buffer.from(rl.texte, 'utf8');
          }
        }
        continue;
      }
      if (v.type === 'chiffres-champs') {
        const courantCh = lireOuNull(path.resolve(racine, v.chemin));
        if (courantCh === null) { return { ok: false, code: 'chiffres-absent', erreur: v.nom + ' : ce fichier n\'existe pas.' }; }
        const rc = appliquerChiffres(v.forme, courantCh.toString('utf8'), v.demande, { aujourdhui: aujourdhui() });
        if (!rc.ok) { return { ok: false, code: 'chiffres-champs', erreur: v.nom + ' : ' + rc.erreur, bloquants: rc.bloquants }; }
        prevus[v.chemin] = Buffer.from(rc.texte, 'utf8');
        const cibleCh = cibleDeDemande(v.forme, v.demande);
        resumeChiffres.push({ fichier: v.nom, cible: cibleCh, action: rc.resume.action, champs: rc.resume.champs, alertes: rc.resume.alertes || [] });
        journalAjouts.push(maintenant() + ' | chiffres | ' + v.nom + (cibleCh ? ' : ' + cibleCh.replace(/\|/g, '/') : '') + ' | ' + rc.resume.action + ' | ' + String(v.phrase || '').replace(/\|/g, '/'));
        continue;
      }
      if (v.type === 'fiche-champs') {
        const courantF = lireOuNull(path.resolve(racine, v.chemin));
        if (courantF === null) { return { ok: false, code: 'fiche-absente', erreur: v.nom + ' : cette fiche n\'existe pas (la creation d\'une fiche ne passe pas par cet ecran).' }; }
        const tRegistre = lireOuNull(path.resolve(racine, liens.CHEMIN_LIENS)), tLexique = lireOuNull(path.resolve(racine, CHEMIN_LEXIQUE));
        const ids = tLexique ? lexique.identifiantsExistants(tLexique.toString('utf8')) : null;
        const r = ficheChamps.appliquerModification(courantF.toString('utf8'), { changements: v.changements, revision: v.revision, formeSeule: v.formeSeule, datation: v.datation }, {
          aujourdhui: aujourdhui(),
          sourcesConnues: tRegistre ? liens.analyser(tRegistre.toString('utf8')).lignes.map(function (l) { return l.nom; }).filter(Boolean) : null,
          lexiqueIds: ids
        });
        if (!r.ok) { return { ok: false, code: 'fiche-champs', erreur: v.nom + ' : ' + r.erreur }; }
        prevus[v.chemin] = Buffer.from(r.texte, 'utf8'); resumeFiches.push({ fiche: v.nom.replace(/\.md$/, ''), rayon: v.rayon, action: r.resume.action, champs: r.resume.champs, phrase: r.resume.phrase });
        journalAjouts.push(maintenant() + ' | cadre | ' + v.nom.replace(/\.md$/, '') + ' | ' + r.resume.action + ' | ' + String(r.resume.phrase || '').replace(/\|/g, '/'));
        continue;
      }
      if (v.type === 'liens') {
        const courantL = (lireOuNull(path.resolve(racine, v.chemin)) || Buffer.from('')).toString('utf8');
        const r = liens.appliquer(courantL, v.actions, aujourdhui(), liens.usagesDesLiens(racine));
        if (!r.ok) { return { ok: false, code: 'liens', erreur: r.erreur }; }
        if (r.texte === courantL) { return { ok: false, code: 'liens-rien', erreur: 'Ces modifications ne changent rien au registre des adresses.' }; }
        prevus[v.chemin] = Buffer.from(r.texte, 'utf8'); resumeLiens = r.resume;
        liensTouches(courantL, r.texte).forEach(function (x) { journalAjouts.push(maintenant() + ' | liens | ' + x.id + ' | ' + (x.nouvelle ? 'ajoutée' : 'modifiée')); });
        continue;
      }
      if (v.type === 'sas') {
        const courantS = (lireOuNull(path.resolve(racine, v.chemin)) || Buffer.from('')).toString('utf8');
        const r = sas.appliquer(v.fichier, courantS, v.actions, registresDuDepot(), territoire.contexteDepuis(racine, aujourdhui()), aujourdhui());
        if (!r.ok) { return { ok: false, code: 'sas', erreur: r.erreur }; }
        if (r.texte === courantS) { return { ok: false, code: 'sas-rien', erreur: 'Ces modifications ne changent rien au sas.' }; }
        prevus[v.chemin] = Buffer.from(r.texte, 'utf8'); resumeSas = r.resume;
        continue;
      }
      if (v.type === 'sans-numero') {
        const courantN = (lireOuNull(path.resolve(racine, v.chemin)) || Buffer.from('')).toString('utf8');
        const regs = registresDuDepot(), ids = {};
        ['lieux', 'employeurs'].forEach(function (k) { ids[k] = territoire.analyser(regs[k], territoire.FICHIERS[k].colonnes).lignes.map(function (x) { return x.id; }); });
        const r = sansNumero.appliquer(courantN, v.actions, aujourdhui(), ids);
        if (!r.ok) { return { ok: false, code: 'sans-numero', erreur: r.erreur }; }
        prevus[v.chemin] = Buffer.from(r.texte, 'utf8'); resumeSansNumero = r.resume;
        v.actions.forEach(function (a) { journalAjouts.push(maintenant() + ' | sans-numero | ' + a.registre + ' : ' + a.id + ' | confirmée'); });
        continue;
      }
      if (v.type === 'changements') {
        const courantC = (lireOuNull(path.resolve(racine, v.chemin)) || Buffer.from('')).toString('utf8');
        const r = chg.appliquer(courantC, v.actions, {
          aujourdhui: aujourdhui(),
          digest: function (mois) { return (lireOuNull(path.resolve(racine, chg.DOSSIER_DIGESTS, mois + '.md')) || Buffer.from('')).toString('utf8'); }
        });
        if (!r.ok) { return { ok: false, code: 'changements', erreur: r.erreur }; }
        if (r.texteSas === courantC && !Object.keys(r.digests).length) { return { ok: false, code: 'changements-rien', erreur: 'Ces modifications ne changent rien au sas des changements.' }; }
        prevus[v.chemin] = Buffer.from(r.texteSas, 'utf8');
        Object.keys(r.digests).forEach(function (mois) { prevus[chg.DOSSIER_DIGESTS + '/' + mois + '.md'] = Buffer.from(r.digests[mois], 'utf8'); });
        resumeChangements = r.resume;
        continue;
      }
      if (v.type === 'territoire') {
        const courantT = (lireOuNull(path.resolve(racine, v.chemin)) || Buffer.from('')).toString('utf8');
        const r = territoire.appliquer(v.fichier, courantT, v.actions, aujourdhui(), territoire.contexteDepuis(racine, aujourdhui()));
        if (!r.ok) { return { ok: false, code: 'territoire', erreur: r.erreur }; }
        if (r.texte === courantT) { return { ok: false, code: 'territoire-rien', erreur: 'Rien à enregistrer : ces fiches sont déjà à jour (déjà vérifiées aujourd\'hui, ou aucun changement fait). Ce n\'est pas une erreur.' }; }
        prevus[v.chemin] = Buffer.from(r.texte, 'utf8'); resumeTerritoire = r.resume;
        fichesTouchees(v.fichier, courantT, r.texte).forEach(function (x) { journalAjouts.push(maintenant() + ' | ' + v.fichier + ' | ' + x.id + ' | ' + (x.nouvelle ? 'ajoutée' : 'modifiée')); });
        continue;
      }
      prevus[v.chemin] = Buffer.from(v.texte, 'utf8');
      if (v.type === 'fiche' && !fs.existsSync(path.resolve(racine, v.chemin))) { nouvelles.push(v); }
    }
    if (journalAjouts.length) {
      const ancien = (lireOuNull(path.resolve(racine, JOURNAL)) || Buffer.from('# Journal des modifications des registres Qui fait quoi : date, heure | registre | fiche | action. L’application NE LIT PAS ce fichier.\n')).toString('utf8');
      prevus[JOURNAL] = Buffer.from(ancien.replace(/\s*$/, '\n') + journalAjouts.join('\n') + '\n', 'utf8');
    }
    for (const v of nouvelles) {
      const cheminReadme = DOSSIER_CADRE.concat([v.rayon, 'README.md']).join('/');
      const courant = prevus[cheminReadme] ? prevus[cheminReadme].toString('utf8') : (lireOuNull(path.resolve(racine, cheminReadme)) || Buffer.from('')).toString('utf8');
      const r = ajouterLigneReadme(courant, v.nom.replace(/\.md$/, ''), titreDeFiche(v.texte, v.nom.replace(/\.md$/, '')));
      if (!r.ok) { return { ok: false, code: 'readme', erreur: v.nom + ' : ' + r.erreur }; }
      prevus[cheminReadme] = Buffer.from(r.texte, 'utf8');
    }

    // Ne jamais ecraser un travail en cours : un fichier cible deja modifie et non enregistre arrete tout.
    const cibles = Object.keys(prevus);
    // Fichiers EXISTANTS qui vont etre remplaces (une fiche mise a jour, un digest refait) : signales dans le bilan.
    const remplaces = valides.filter(function (v) { return v.type !== 'lexique' && v.type !== 'lexique-champs' && v.type !== 'lexique-nouveau' && v.type !== 'liens' && v.type !== 'territoire' && v.type !== 'sas' && v.type !== 'changements' && fs.existsSync(path.resolve(racine, v.chemin)); }).map(function (v) { return v.chemin; });
    const st = git(['status', '--porcelain', '--'].concat(cibles));
    if (st.code === 0 && lignesModifiees(st).length) {
      return { ok: false, code: 'travail-en-cours', erreur: 'Un enregistrement précédent a été interrompu : le fichier ' + lignesModifiees(st)[0].slice(3).trim() + ' contient des changements qui ne sont pas rangés dans l\'historique. Par prudence, rien n\'a été écrit. Un bandeau en haut de la page vous propose de terminer cet enregistrement ou de le défaire.' };
    }

    // Sauvegarde, ecriture.
    const sauvegarde = {};
    const aSauver = cibles.concat(FICHIERS_GENERES.map(function (p) { return p.join('/'); }));
    aSauver.forEach(function (c) { sauvegarde[c] = lireOuNull(path.resolve(racine, c)); });
    const restaurer = function () {
      Object.keys(sauvegarde).forEach(function (c) {
        const p = path.resolve(racine, c);
        try { if (sauvegarde[c] === null) { fs.rmSync(p, { force: true }); } else { fs.writeFileSync(p, sauvegarde[c]); } } catch (e) { /* on continue la restauration */ }
      });
    };
    poserRepere(cibles.concat(FICHIERS_GENERES.map(function (p) { return p.join('/'); })));
    try {
      cibles.forEach(function (c) { const p = path.resolve(racine, c); fs.mkdirSync(path.dirname(p), { recursive: true }); fs.writeFileSync(p, prevus[c]); });
    } catch (e) { restaurer(); return { ok: false, code: 'ecriture', erreur: 'Ecriture impossible : ' + (e && e.message) }; }

    // Regeneration des copies derivees, puis tests.
    const seulementSas = valides.every(function (v) { return v.type === 'sas' || v.type === 'mots-liste' || v.type === 'sans-numero' || (v.type === 'changements' && !v.actions.some(function (a) { return a && a.op === 'valider'; })); });   // le sas n'est pas lu par l'application : rien a regenerer, rien a tester
    const etapes = [];
    const base = path.join(racine, 'scripts', 'genererBaseVeille.js');
    if (!seulementSas && fs.existsSync(base)) { etapes.push(lancer(process.execPath, ['scripts/genererBaseVeille.js'])); }
    const renvois = path.join(racine, 'scripts', 'genererRenvoisCadre.js');
    if (!seulementSas && fs.existsSync(renvois)) { etapes.push(lancer(process.execPath, ['scripts/genererRenvoisCadre.js'])); }
    const echecGen = etapes.find(function (r) { return r.code !== 0; });
    if (echecGen) { restaurer(); return { ok: false, code: 'generation', erreur: 'La mise a jour des copies de l\'outil a echoue : rien n\'est publie.', details: echecGen.sortie.split('\n').slice(-15).join('\n') }; }
    let avertissementsLexique = [];
    if (valides.some(function (v) { return v.type === 'lexique' || v.type === 'lexique-champs' || v.type === 'lexique-nouveau'; })) {
      const verif = lancer(process.execPath, ['scripts/checkLexique.js']);
      if (verif.code !== 0) { restaurer(); return { ok: false, code: 'lexique-verification', erreur: 'La verification du Lexique (checkLexique) a echoue : rien n\'est publie, tout est remis comme avant.', details: verif.sortie.split('\n').slice(-25).join('\n') }; }
      // Avertissements : non bloquants mais montres (par exemple un mot jamais cite par un autre).
      avertissementsLexique = verif.sortie.split('\n').filter(function (l) { return /^\s*-?\s*(Fiche|Parcours|Collection|")/.test(l) || /avertissement/i.test(l); }).slice(0, 20);
    }
    const tests = seulementSas ? { code: 0, sortie: '' } : lancer(process.execPath, ['--test', 'tests/*.test.js']);
    if (tests.code !== 0) {
      restaurer();
      const echecs = tests.sortie.split('\n').filter(function (l) { return /^\s*(not ok|✖)/.test(l); }).slice(0, 8).map(function (l) { return l.trim(); });
      return { ok: false, code: 'tests', erreur: 'Les verifications automatiques ont echoue : rien n\'est publie, tout est remis comme avant.', echecs: echecs, details: tests.sortie.split('\n').slice(-25).join('\n') };
    }

    // Enregistrement Git local, uniquement sur les chemins de cette publication.
    const chemins = cibles.concat(FICHIERS_GENERES.map(function (p) { return p.join('/'); }).filter(function (c) { return fs.existsSync(path.resolve(racine, c)); }));
    const ajout = git(['add', '--'].concat(chemins));
    if (ajout.code !== 0) { garderRepere = true; return { ok: false, code: 'git', erreur: 'Git n\'a pas pu preparer l\'enregistrement (les fichiers restent ecrits, rien n\'est enregistre).', details: ajout.sortie }; }
    const nb = valides.length;
    const message = 'Veille : mise a jour du contenu (' + nb + ' fichier' + (nb > 1 ? 's' : '') + ')\n\n' + valides.map(function (v) { return '- ' + v.chemin; }).join('\n');
    const commit = git(['commit', '-m', message, '--'].concat(chemins));
    if (commit.code !== 0) {
      git(['reset', '-q', '--'].concat(chemins));
      garderRepere = true;
      return { ok: false, code: 'git', erreur: 'Git n\'a pas pu enregistrer (les fichiers restent ecrits, rien n\'est enregistre). Prevenez Claude.', details: commit.sortie };
    }
    const hash = git(['rev-parse', 'HEAD']).sortie.trim();
    derniere = { hash: hash, chemins: chemins };
    return {
      ok: true, commit: hash.slice(0, 8), fichiers: valides.map(function (v) { return v.chemin; }),
      nouvelles: nouvelles.map(function (v) { return v.nom.replace(/\.md$/, ''); }),
      nouveauxMots: motsAjoutes, motsRemplaces: motsRemplaces, resumeLiens: resumeLiens, resumeTerritoire: resumeTerritoire, resumeSas: resumeSas, resumeSansNumero: resumeSansNumero, resumeChangements: resumeChangements, resumeFiches: resumeFiches, resumeChiffres: resumeChiffres,
      avertissementsLexique: avertissementsLexique, resumeLexique: resumeLexique, resumeListe: resumeListe, remplaces: remplaces,
      resteAFaire: valides.some(function (v) { return v.type === 'fiche'; }) ? ['Dater les nouvelles adresses : ouvrez « Les adresses » dans le panneau Dépôt, cliquez chaque lien, puis « Valider » (il faut ouvrir et juger chaque page).'] : []
    };
  }

  // Reprise d'un enregistrement interrompu : 'terminer' (contrôles, puis rangement dans l'historique) ou 'annuler' (les fichiers redeviennent comme au dernier enregistrement).
  function reprendre(action) {
    const i = interrompue();
    if (!i) { return { ok: false, code: 'rien', erreur: 'Aucun enregistrement interrompu : rien à reprendre.' }; }
    if (action === 'annuler') {
      const r = git(['checkout', '-q', '--'].concat(i.chemins));
      if (r.code !== 0) { return { ok: false, code: 'git', erreur: 'Git n\'a pas pu remettre les fichiers comme avant. Prévenez Claude.', details: r.sortie }; }
      retirerRepere();
      return { ok: true, action: 'annule', chemins: i.chemins };
    }
    if (action === 'terminer') {
      const tests = lancer(process.execPath, ['--test', 'tests/*.test.js']);
      if (tests.code !== 0) {
        const echecs = tests.sortie.split('\n').filter(function (l) { return /^\s*(not ok|✖)/.test(l); }).slice(0, 8).map(function (l) { return l.trim(); });
        return { ok: false, code: 'tests', erreur: 'Les vérifications automatiques ont échoué : rien n\'est rangé. Vous pouvez défaire cet enregistrement, ou prévenir Claude.', echecs: echecs };
      }
      const ajout = git(['add', '--'].concat(i.chemins));
      if (ajout.code !== 0) { return { ok: false, code: 'git', erreur: 'Git n\'a pas pu préparer le rangement. Prévenez Claude.', details: ajout.sortie }; }
      const commit = git(['commit', '-m', 'Veille : enregistrement interrompu repris et rangé\n\n' + i.chemins.map(function (c) { return '- ' + c; }).join('\n'), '--'].concat(i.chemins));
      if (commit.code !== 0) { git(['reset', '-q', '--'].concat(i.chemins)); return { ok: false, code: 'git', erreur: 'Git n\'a pas pu ranger. Prévenez Claude.', details: commit.sortie }; }
      retirerRepere();
      const hash = git(['rev-parse', 'HEAD']).sortie.trim();
      derniere = { hash: hash, chemins: i.chemins };
      return { ok: true, action: 'termine', commit: hash.slice(0, 8), chemins: i.chemins };
    }
    return { ok: false, code: 'action', erreur: 'Action inconnue.' };
  }

  // Annule la derniere publication de la seance, par un nouvel enregistrement qui la defait (jamais de reecriture de l'historique).
  function annuler() {
    if (!derniere) { return { ok: false, code: 'rien', erreur: 'Aucune publication a annuler dans cette seance.' }; }
    const tete = git(['rev-parse', 'HEAD']).sortie.trim();
    if (tete !== derniere.hash) { return { ok: false, code: 'plus-recente', erreur: 'Un autre enregistrement a ete fait depuis : annulation refusee pour ne rien casser. Demandez a Claude.' }; }
    const st = git(['status', '--porcelain', '--'].concat(derniere.chemins));
    if (st.code === 0 && lignesModifiees(st).length) { return { ok: false, code: 'travail-en-cours', erreur: 'Ces fichiers ont des modifications non enregistrees : annulation refusee.' }; }
    const r = git(['revert', '--no-edit', derniere.hash]);
    if (r.code !== 0) { git(['revert', '--abort']); return { ok: false, code: 'git', erreur: 'Git n\'a pas pu annuler. Prevenez Claude.', details: r.sortie }; }
    derniere = null;
    return { ok: true, commit: git(['rev-parse', 'HEAD']).sortie.trim().slice(0, 8) };
  }

  // Les adresses du registre avec leur etat et le nombre de fiches qui s'en servent (pour l'ecran des liens).
  function listerLiens() {
    const t = lireOuNull(path.resolve(racine, liens.CHEMIN_LIENS));
    if (!t) { return { ok: false, erreur: 'Registre des adresses introuvable (' + liens.CHEMIN_LIENS + ').' }; }
    const m = dernieresModifications('liens');
    return { ok: true, liens: liens.lister(t.toString('utf8'), liens.usagesDesLiens(racine)).map(function (l) { if (m[l.nom]) { l.modifieLe = m[l.nom]; } return l; }), aujourdhui: aujourdhui() };
  }

  // Le texte des deux registres publics (structures, employeurs), pour controler ce qu'on propose d'y ajouter.
  function registresDuDepot() {
    const lire = function (chemin) { return (lireOuNull(path.resolve(racine, chemin)) || Buffer.from('')).toString('utf8'); };
    return { lieux: lire(territoire.FICHIERS.lieux.chemin), employeurs: lire(territoire.FICHIERS.employeurs.chemin), offres: lire(territoire.FICHIERS.offres.chemin) };
  }

  // Analyse un lot colle (aucune ecriture) : ligne par ligne, prete / deja connue / a corriger.
  function analyserLot(fichier, texte) {
    const f = String(fichier || '');
    if (!sas.CHEMINS[f]) { return { ok: false, erreur: 'Registre inconnu.' }; }
    if (typeof texte !== 'string' || !texte.trim()) { return { ok: false, erreur: 'Aucun texte colle.' }; }
    if (texte.length > 200000) { return { ok: false, erreur: 'Texte trop long.' }; }
    const t = lireOuNull(path.resolve(racine, sas.CHEMINS[f]));
    return sas.analyserLot(f, texte, registresDuDepot(), t ? t.toString('utf8') : '', territoire.contexteDepuis(racine, aujourdhui()), aujourdhui());
  }

  // ---------- Le pont depuis la prospection : lignes deposees par l'outil de prospection (lecture seule), sans celles que la veille connait deja ----------
  const pont = opt.pont || creerPont(racine);
  function inconnuesDuPont(f) {
    const r = pont.lire(f);
    if (!r.ok) { return r; }
    const t = lireOuNull(path.resolve(racine, sas.CHEMINS[f])), texteSas = t ? t.toString('utf8') : '';
    const regs = registresDuDepot(), ctx = territoire.contexteDepuis(racine, aujourdhui());
    const connues = {}; let nbConnues = 0;
    for (let i = 0; i < r.lignes.length; i += sas.MAX_LIGNES) {
      const paquet = r.lignes.slice(i, i + sas.MAX_LIGNES);
      const a = sas.analyserLot(f, paquet.join('\n'), regs, texteSas, ctx, aujourdhui());
      if (!a.ok) { continue; }
      a.lignes.forEach(function (l) { if (l.statut === 'connue' || l.statut === 'rien') { connues[i + l.numero - 1] = true; nbConnues++; } });
    }
    return { ok: true, deposeLe: r.deposeLe, total: r.lignes.length, connues: nbConnues, inconnues: r.lignes.filter(function (l, k) { return !connues[k]; }) };
  }
  // Rend au plus 100 lignes que la veille ne connait pas encore (le plafond d'un import) et dit combien restent.
  function lirePont(fichier) {
    const f = String(fichier || '');
    if (!sas.CHEMINS[f] || f === 'complements') { return { ok: false, erreur: 'Destination inconnue.' }; }
    const r = inconnuesDuPont(f);
    if (!r.ok) { return r; }
    return { ok: true, deposeLe: r.deposeLe, total: r.total, connues: r.connues, lignes: r.inconnues.slice(0, sas.MAX_LIGNES), restantes: Math.max(0, r.inconnues.length - sas.MAX_LIGNES) };
  }
  // Combien de lignes nouvelles attendent dans chaque fichier du pont (le bouton n'apparait que s'il y en a).
  function etatPont() {
    const o = {};
    Object.keys(pontFichiers).forEach(function (f) { const r = inconnuesDuPont(f); o[f] = r.ok ? r.inconnues.length : 0; });
    return { ok: true, nouvelles: o };
  }

  // Le contenu du sas (fiches proposees en attente de verification).
  function listerSas(fichier) {
    const f = String(fichier || '');
    if (!sas.CHEMINS[f]) { return { ok: false, erreur: 'Sas inconnu.' }; }
    const t = lireOuNull(path.resolve(racine, sas.CHEMINS[f]));
    const regs = registresDuDepot(), r = sas.lister(f, t ? t.toString('utf8') : '', regs);
    if (r.ok && f === 'complements') {
      // Toutes les fiches publiées sans numéro rejoignent le sas (sauf celles déjà proposées ou confirmées « sans numéro » depuis moins de six mois).
      const tn = lireOuNull(path.resolve(racine, sansNumero.CHEMIN.join('/')));
      sansNumero.cartesSansNumero(regs, tn ? tn.toString('utf8') : '', aujourdhui(), r.lignes.map(function (x) { return x.valeurs.cible; })).forEach(function (c) { r.lignes.push(c); });
    }
    if (r.ok) { r.aujourdhui = aujourdhui(); annoterEtablissements(r.lignes); if (f === 'employeurs') { annoterPresenceEnseignes(r.lignes); } }
    return r;
  }

  // ---------- Le Lexique : la liste des mots lue dans le depot, et les controles d'un mot (lecture seule) ----------
  function lireTexteDepot(chemin) { const b = lireOuNull(path.resolve(racine, chemin)); return b ? b.toString('utf8') : null; }
  function listerMots() {
    const t = lireTexteDepot(CHEMIN_LEXIQUE);
    if (t === null) { return { ok: false, erreur: 'data/lexique.js introuvable.' }; }
    const mots = lexique.lireMots(t);
    if (!mots) { return { ok: false, erreur: 'data/lexique.js : liste LEXIQUE_FICHES introuvable.' }; }
    const cols = lexique.lireCollections(t), citations = motsLexique.citationsDuCadre(lireTexteDepot('data/lexique-renvois-cadre.js') || ''), modifs = dernieresModifications('lexique');
    const entrants = {}, parColl = {};
    mots.forEach(function (m) { m.relations.forEach(function (r) { entrants[r[0]] = (entrants[r[0]] || 0) + 1; }); });
    cols.forEach(function (c) { c.fiches.forEach(function (id) { (parColl[id] = parColl[id] || []).push(c.titre); }); });
    const module_ = lireTexteDepot('modules/lexique/index.js') || '', R = motsLexique.REGLES, seuilDetails = motsLexique.lireSeuilDetails(module_);
    return {
      ok: true, aujourdhui: aujourdhui(),
      seuilMois: seuilDetails, migrations: propositionsMigration(), categories: reperesChiffres.CATEGORIES, mots: mots.map(function (m) { return Object.assign({}, m, { detailsEtat: motsLexique.etatDetails(m.details, aujourdhui(), seuilDetails), collections: parColl[m.id] || [], entrants: entrants[m.id] || 0, citeParCadre: citations[m.id] || 0, reperes: reperesChiffres.categoriesDe(m.corps), modifieLe: modifs[m.id] || '' }); }),
      univers: motsLexique.libellesDepuis(module_, '_LEXIQUE_LIBELLES_UNIVERS', R.UNIVERS_CONNUS), registres: motsLexique.libellesDepuis(module_, '_LEXIQUE_LIBELLES_REGISTRES', R.REGISTRES_CONNUS),
      regles: { maxVariantes: R.MAX_VARIANTES, maxVoirAussi: R.MAX_VOIR_AUSSI, maxNePasConfondre: R.MAX_A_NE_PAS_CONFONDRE, gabarits: R.GABARITS_CONNUS, maxLignesDetails: R.MAX_LIGNES_DETAILS },
      evolution: motsLexique.lireEvolution(lireTexteDepot(motsLexique.CHEMIN_EVOLUTION) || '').slice(0, 3000)
    };
  }
  // Les controles d'un mot (bloquants et avertissements), demandes par l'ecran pendant la saisie : l'ecran n'en recopie aucun.
  // « Ma liste » : les idees de mots, avec leur etat (lecture seule).
  function listerListe() {
    const lx = lireTexteDepot(CHEMIN_LEXIQUE), tous = lx === null ? null : lexique.lireMots(lx);
    if (!tous) { return { ok: false, erreur: 'data/lexique.js illisible.' }; }
    const lignes = ideesLexique.parser(lireTexteDepot(ideesLexique.CHEMIN_LISTE) || '').map(ideesLexique.versObjet);
    const nb = {}; ideesLexique.ETATS.forEach(function (e) { nb[e] = 0; }); lignes.forEach(function (l) { nb[l.etat] = (nb[l.etat] || 0) + 1; });
    return { ok: true, lignes: lignes, nb: nb, motifs: ideesLexique.MOTIFS, aujourdhui: aujourdhui() };
  }
  // Porte A : les mots qui reviennent dans l'application sans fiche du Lexique (lecture seule, rien n'est ecrit).
  function idees() {
    const lx = lireTexteDepot(CHEMIN_LEXIQUE), tous = lx === null ? null : lexique.lireMots(lx);
    if (!tous) { return { ok: false, erreur: 'data/lexique.js illisible.' }; }
    const vus = ideesLexique.parser(lireTexteDepot(ideesLexique.CHEMIN_LISTE) || '').map(function (l) { return l.mot; });
    const r = ideesLexique.repererIdees(racine, tous, vus, {});
    return { ok: true, idees: r.idees, total: r.total, lus: r.lus };
  }
  // Les propositions de migration des chiffres (case M7) : outils/sas/migration_chiffres.sas.txt, une ligne JSON par fiche. Seules celles dont la fiche est ENCORE sur la liste de transition sont proposees.
  function propositionsMigration() {
    const brut = lireTexteDepot('outils/sas/migration_chiffres.sas.txt'), sortie = {};
    if (!brut) { return sortie; }
    const encore = transitionIds();
    brut.split(/\r?\n/).forEach(function (l) {
      if (!l.trim() || l.trim().charAt(0) === '#') { return; }
      try { const p = JSON.parse(l); if (p && p.id && encore.indexOf(p.id) !== -1 && typeof p.fond === 'string' && p.source && Array.isArray(p.lignes)) { sortie[p.id] = p; } } catch (e) { /* ligne illisible : ignoree */ }
    });
    return sortie;
  }
  // Verification des chiffres du Lexique par lots (case M6) : le prompt pour un assistant en ligne, puis la lecture de sa reponse. Rien n'est ecrit : ce sont des propositions.
  const MAX_FICHES_PAR_LOT = 8;
  function fichesAvecBloc() {
    const lx = lireTexteDepot(CHEMIN_LEXIQUE), tous = lx === null ? null : lexique.lireMots(lx);
    if (!tous) { return null; }
    const seuil = motsLexique.lireSeuilDetails(lireTexteDepot('modules/lexique/index.js') || '');
    return tous.filter(function (m) { return m.details && !m.details.illisible && Array.isArray(m.details.lignes) && m.details.lignes.length; })
      .map(function (m) { return { id: m.id, titre: m.titre, details: m.details, etat: motsLexique.etatDetails(m.details, aujourdhui(), seuil) }; });
  }
  function promptVerificationChiffres(d) {
    const fiches = fichesAvecBloc();
    if (!fiches) { return { ok: false, erreur: 'data/lexique.js illisible.' }; }
    const demandes = d && Array.isArray(d.ids) && d.ids.length ? d.ids : null;
    const ordre = { perime: 0, jamais: 1, bientot: 2, ajour: 3 };
    let choix = fiches.filter(function (f) { return demandes ? demandes.indexOf(f.id) !== -1 : (f.etat === 'perime' || f.etat === 'jamais' || f.etat === 'bientot'); })
      .sort(function (a, b) { return (ordre[a.etat] - ordre[b.etat]) || (a.details.verifieLe < b.details.verifieLe ? -1 : 1); });
    if (!choix.length) { return { ok: false, erreur: 'Aucune fiche à revérifier : tous les blocs sont à jour (ou n\'ont que des faits qui ne changent pas).' }; }
    const reste = Math.max(0, choix.length - MAX_FICHES_PAR_LOT);
    choix = choix.slice(0, MAX_FICHES_PAR_LOT);
    return { ok: true, prompt: motsLexique.promptVerificationChiffres(choix, aujourdhui()), fiches: choix.map(function (f) { return { id: f.id, titre: f.titre, etat: f.etat, nbLignes: f.details.lignes.length }; }), reste: reste, plafond: MAX_FICHES_PAR_LOT };
  }
  function lireVerificationChiffres(d) {
    const fiches = fichesAvecBloc();
    if (!fiches) { return { ok: false, erreur: 'data/lexique.js illisible.' }; }
    const texte = String((d && d.texte) || '');
    if (!texte.trim()) { return { ok: false, erreur: 'Rien à lire : collez d\'abord la réponse de l\'assistant.' }; }
    const r = motsLexique.lireVerificationChiffres(texte, fiches);
    if (!r.fiches.length) { return { ok: false, erreur: 'Aucune ligne reconnue dans cette réponse. Elle doit reprendre le format demandé : identifiant de la fiche | libellé | statut | valeur lue | adresse | ce qui a été lu.', inconnues: r.inconnues.slice(0, 10) }; }
    return { ok: true, fiches: r.fiches, inconnues: r.inconnues.slice(0, 20) };
  }
  // Porte B : les recherches sans resultat collees depuis Umami (rien n'est ecrit ici : l'ecran montre les idees, Denis agit).
  function recherchesSansResultat(d) {
    const lx = lireTexteDepot(CHEMIN_LEXIQUE), tous = lx === null ? null : lexique.lireMots(lx);
    if (!tous) { return { ok: false, erreur: 'data/lexique.js illisible.' }; }
    const texte = String((d && d.texte) || '');
    if (!texte.trim()) { return { ok: false, erreur: 'Rien à lire : collez d\'abord ce que vous avez copié dans Umami.' }; }
    const vus = ideesLexique.parser(lireTexteDepot(ideesLexique.CHEMIN_LISTE) || '').map(function (l) { return l.mot; });
    return ideesLexique.lireRecherches(texte, tous, vus, {});
  }
  // Porte D : ce mot existe-t-il deja, ou est-il proche d'un mot existant, ou deja dans la liste ?
  function chercherMot(d) {
    const lx = lireTexteDepot(CHEMIN_LEXIQUE), tous = lx === null ? null : lexique.lireMots(lx);
    if (!tous) { return { ok: false, erreur: 'data/lexique.js illisible.' }; }
    const mot = String((d && d.mot) || '').trim();
    const r = ideesLexique.chercherDansLexique(mot, tous);
    const deja = ideesLexique.parser(lireTexteDepot(ideesLexique.CHEMIN_LISTE) || '').filter(function (l) { return motsLexique.norm(l.mot) === motsLexique.norm(mot); })[0];
    return { ok: true, exact: r.exact, proche: r.proche, dansLaListe: deja ? { k: deja.k, etat: deja.etat } : null };
  }
  // Ce que l'outil propose pour un mot neuf (jamais impose) : son identifiant et son titre de tri.
  function proposerMot(d) {
    const mot = String((d && d.mot) || '').trim();
    if (!mot) { return { ok: false, erreur: 'Le mot est vide.' }; }
    return { ok: true, id: motsLexique.idPropose(mot), titreDeTri: motsLexique.titreDeTriPropose(mot) };
  }
  function verifierMotLexique(d) {
    const t = lireTexteDepot(CHEMIN_LEXIQUE), tous = t === null ? null : lexique.lireMots(t);
    if (!tous) { return { ok: false, erreur: 'data/lexique.js illisible.' }; }
    if (!d || typeof d.mot !== 'object' || !d.mot) { return { ok: false, erreur: 'Mot mal forme.' }; }
    const original = d.nouveau ? null : (tous.filter(function (x) { return x.id === String(d.mot.id || ''); })[0] || null);
    if (!d.nouveau && !original) { return { ok: false, erreur: 'Ce mot n\'existe pas dans le Lexique.' }; }
    const mot = Object.assign({}, original || {}, d.mot);
    const v = motsLexique.verifierMot(mot, tous.filter(function (x) { return x.id !== mot.id; }), { nouveau: !!d.nouveau, original: original, phrase: String(d.phrase || ''), transition: transitionIds() });
    return { ok: true, erreurs: v.erreurs, avertissements: v.avertissements, modifies: v.modifies, corpsVerifie: String(mot.corps || ''), reperes: reperesChiffres.reperes(String(mot.corps || '')) };
  }

  // Les fiches du cadre (une ligne par fiche, sans leur texte) pour la liste de l'ecran « Modifier une fiche » ; lecture seule.
  // Les deux fiches « methode » (forme a part) ne sont pas proposees : elles ne se modifient pas depuis l'outil.
  function listerFiches() {
    const dernieres = dernieresModifications('cadre'), fiches = [], rayons = {};
    rayonsExistants(racine).sort().forEach(function (rayon) {
      if (rayon === 'methode') { return; }
      const dossier = path.resolve(racine, ...DOSSIER_CADRE, rayon);
      fs.readdirSync(dossier).filter(function (n) { return RE_FICHE.test(n) && !/\.collecte\.md$/.test(n) && n !== 'readme.md'; }).sort().forEach(function (n) {
        const brut = lireOuNull(path.join(dossier, n)), id = n.replace(/\.md$/, '');
        const fi = brut ? ficheChamps.lire(brut.toString('utf8')) : { ok: false };
        if (!fi.ok) { fiches.push({ rayon: rayon, id: id, titre: id, verifieLe: '', statut: '', illisible: true, modifieLe: dernieres[id] || '' }); }
        else {
          const c = ficheChamps.champs(fi);
          fiches.push({ rayon: rayon, id: id, titre: typeof c.titre === 'string' ? c.titre : id, verifieLe: typeof c.verifie_le === 'string' ? c.verifie_le : '', statut: typeof c.statut === 'string' ? c.statut : 'actif', modifieLe: dernieres[id] || '' });
        }
        rayons[rayon] = (rayons[rayon] || 0) + 1;
      });
    });
    return { ok: true, fiches: fiches, rayons: rayons, aujourdhui: aujourdhui() };
  }

  // Le journal des modifications (date, heure, registre, fiche, action, phrase), du plus recent au plus ancien ; lecture seule. Pour les fiches du cadre, le rayon est ajoute.
  function listerHistorique() {
    const brut = lireOuNull(path.resolve(racine, JOURNAL));
    if (!brut) { return { ok: true, entrees: [], rayons: [], aujourdhui: aujourdhui() }; }
    const rayonDe = {};
    rayonsExistants(racine).forEach(function (rayon) {
      try { fs.readdirSync(path.resolve(racine, ...DOSSIER_CADRE, rayon)).forEach(function (n) { if (/\.md$/.test(n)) { rayonDe[n.replace(/\.md$/, '')] = rayon; } }); } catch (e) { /* rayon illisible : sans rayon */ }
    });
    const entrees = [];
    brut.toString('utf8').split('\n').forEach(function (ligne, i) {
      const c = ligne.split('|').map(function (x) { return x.trim(); });
      if (c.length < 4 || !/^\d{4}-\d\d-\d\d( \d\d:\d\d)?$/.test(c[0])) { return; }
      entrees.push({ n: i, quand: c[0], registre: c[1], fiche: c[2], action: c[3], phrase: c.slice(4).join(' | '), rayon: c[1] === 'cadre' ? (rayonDe[c[2]] || '') : '' });
    });
    entrees.sort(function (a, b) { return a.quand < b.quand ? 1 : (a.quand > b.quand ? -1 : b.n - a.n); });
    return { ok: true, entrees: entrees.slice(0, 3000).map(function (e) { delete e.n; return e; }), total: entrees.length, aujourdhui: aujourdhui() };
  }

  // Les fichiers de « Comprendre les chiffres » que l'outil sait modifier (digests, fiches de territoire, portrait, Europe, fiches methode) ; lecture seule.
  function listerChiffres() {
    const dernieres = dernieresModifications('chiffres'), fichiers = [];
    const dossierChiffres = path.resolve(racine, ...DOSSIER_CHIFFRES), dossierMethodeCadre = path.resolve(racine, ...DOSSIER_CADRE, 'methode');
    let noms = [];
    try { noms = fs.readdirSync(dossierChiffres).sort(); } catch (e) { return { ok: false, erreur: 'Dossier des chiffres introuvable.' }; }
    try { fs.readdirSync(path.join(dossierChiffres, 'methode')).sort().forEach(function (n) { if (/\.md$/.test(n)) { noms.push('methode/' + n); } }); } catch (e) { /* pas de dossier */ }
    try { fs.readdirSync(dossierMethodeCadre).sort().forEach(function (n) { if (/\.md$/.test(n) && !/^README/i.test(n)) { noms.push('cadre-methode/' + n); } }); } catch (e) { /* pas de dossier */ }
    noms.forEach(function (nom) {
      const cib = cibleChiffres(nom);
      if (!cib) { return; }
      const brut = lireOuNull(path.resolve(racine, ...cib.chemin));
      if (!brut) { return; }
      const texte = brut.toString('utf8');
      const lu = cib.forme === 'digest' ? chiffres.lireDigest(texte) : (cib.forme === 'territoire' ? chiffres.lireTerritoire(texte) : (cib.forme === 'annuel' ? chiffres.lireAnnuel(texte) : chiffres.lireMethode(texte)));
      if (!lu.ok) { fichiers.push({ fichier: nom, forme: cib.forme, illisible: true, modifieLe: '' }); return; }
      const modif = Object.keys(dernieres).filter(function (k) { return k.indexOf(nom + ' : ') === 0 || k === nom; }).map(function (k) { return dernieres[k]; }).sort().pop() || '';
      const entete = lu.entete || '';
      const periode = /^(?:periode|annee):\s*"?([^"\n]+?)"?\s*$/m.exec(entete);
      fichiers.push({
        fichier: nom, forme: cib.forme, periode: periode ? periode[1] : '', titre: cib.forme === 'methode' ? lu.champs.titre : '', verifieLe: entete ? chiffres.verifieDe(entete) : '', modifieLe: modif,
        nb: cib.forme === 'digest' ? lu.entrees.filter(function (e) { return e.entree; }).length : (cib.forme === 'territoire' ? lu.blocs.length : (cib.forme === 'annuel' ? lu.puces.length : 1)),
        aCompleter: (texte.match(/\[[^\]]*(?:à vérifier|a verifier)[^\]]*\]/gi) || []).length
      });
    });
    return { ok: true, fichiers: fichiers, aujourdhui: aujourdhui() };
  }
  // Un fichier de chiffres lu champ par champ.
  function lireChiffres(fichier) {
    const nom = String(fichier || ''), cib = cibleChiffres(nom);
    if (!cib) { return { ok: false, erreur: 'Fichier de chiffres non pris en charge.' }; }
    const brut = lireOuNull(path.resolve(racine, ...cib.chemin));
    if (!brut) { return { ok: false, erreur: 'Fichier introuvable.' }; }
    const texte = brut.toString('utf8'), forme = cib.forme;
    const lu = forme === 'digest' ? chiffres.lireDigest(texte) : (forme === 'territoire' ? chiffres.lireTerritoire(texte) : (forme === 'annuel' ? chiffres.lireAnnuel(texte) : chiffres.lireMethode(texte)));
    if (!lu.ok) { return { ok: false, erreur: 'Fichier illisible : ' + lu.erreur }; }
    const base = { ok: true, fichier: nom, forme: forme, aujourdhui: aujourdhui() };
    if (forme === 'methode') {
      base.champs = { titre: lu.champs.titre, pour_qui: lu.champs.pour_qui, tags: lu.champs.tags }; base.verrouilles = { id: lu.champs.id, type: lu.champs.type }; base.corps = lu.corps; base.verifieLe = '';
      return base;
    }
    base.verifieLe = chiffres.verifieDe(lu.entete);
    base.sources = lu.sources.map(function (s) { return { id: s.id, titre: s.titre, url: s.url, date: s.date }; });
    if (forme === 'digest') {
      base.entrees = lu.entrees.map(function (e) {
        const x = e.entree;
        return x ? { ref: e.ref, section: e.section, label: e.label, modifiable: true, valeur: x.valeur, periode: x.periode, precedent: x.precedent, anPrecedent: x.anPrecedent, sourceNom: x.sourceNom, sourceUrl: x.sourceUrl, serie: x.serie, annuelle: x.annuelle, histoH: x.histoH, histoB: x.histoB, repere: x.repere,
          aPrecedent: /;\s*précédent\s*:/.test(x.apres), aAn: /;\s*il y a un an\s*:/.test(x.apres), aPeriode: /^\s*\(/.test(x.apres), aSerie: x.ordre.indexOf('serie') !== -1, aAnnuelle: x.ordre.indexOf('annuelle') !== -1, aHisto: x.ordre.indexOf('histo') !== -1, aRepere: x.ordre.indexOf('repere') !== -1 }
          : (function () { const ml = /^(- .+? : )(.*)$/.exec(e.brutes[0]); return { ref: e.ref, section: e.section, label: e.label, modifiable: false, libre: !!ml && e.brutes.length === 1, texte: ml ? ml[2] : e.brutes[0].slice(0, 200) }; })();
      });
    } else if (forme === 'territoire') {
      base.lieux = lu.blocs.map(function (b) {
        return { lieu: b.nom, groupe: b.groupe, champs: b.champs.filter(function (c) { return c.cle !== 'sources'; }).map(function (c) { return { cle: c.cle, valeur: c.valeur, forme: chiffres.FORMES_CHAMP[c.cle] || 'txt' }; }), sources: b.sources, prose: b.prose };
      });
      base.formes = chiffres.AIDE_FORME; base.champsPossibles = Object.keys(chiffres.FORMES_CHAMP);
    } else {
      // Les lignes chiffrées ET les paragraphes de texte (introductions, notes), dans l'ordre du fichier ; un paragraphe n'a jamais de source propre.
      const lignesPuces = lu.puces.map(function (p) { return { pos: p.ligne, ref: p.ref, section: p.section, rang: p.rang, genre: 'ligne', texte: p.avant, source: p.source, aVerifier: p.aVerifier, modifiable: p.modifiable }; });
      const lignesParagraphes = lu.paragraphes.map(function (p) { return { pos: p.debut, ref: p.ref, section: p.section, rang: p.rang, genre: p.genre, texte: p.avant, source: { type: 'aucune', nom: '', url: '', brut: '' }, aVerifier: false, modifiable: true }; });
      base.puces = lignesPuces.concat(lignesParagraphes).sort(function (a, b) { return a.pos - b.pos; });
    }
    return base;
  }

  // Verifie une modification de chiffres SANS rien ecrire : les controles entre chiffres, les erreurs et les lignes qui seraient ecrites (le meme code que l'enregistrement).
  function verifierChiffres(fichier, demande) {
    const nom = String(fichier || ''), cib = cibleChiffres(nom);
    if (!cib) { return { ok: false, erreur: 'Fichier de chiffres non pris en charge.' }; }
    const brut = lireOuNull(path.resolve(racine, ...cib.chemin));
    if (!brut) { return { ok: false, erreur: 'Fichier introuvable.' }; }
    if (!demande || typeof demande !== 'object' || Array.isArray(demande)) { return { ok: false, erreur: 'Demande illisible.' }; }
    const texte = brut.toString('utf8'), dem = Object.assign({}, demande, { confirmeSource: true });
    const r = appliquerChiffres(cib.forme, texte, dem, { aujourdhui: aujourdhui() });
    if (!r.ok) { return { ok: true, valide: false, erreur: r.erreur, bloquants: r.bloquants || [], alertes: r.alertes || [] }; }
    let lignes = '';
    if (cib.forme === 'digest') { const e = chiffres.lireDigest(r.texte).entrees.filter(function (x) { return x.ref === demande.ref; })[0]; lignes = e ? e.brutes.join('\n') : ''; }
    else if (cib.forme === 'territoire') { const b = chiffres.lireTerritoire(r.texte).blocs.filter(function (x) { return x.nom === demande.lieu && (!demande.groupe || x.groupe === demande.groupe); })[0]; lignes = b ? b.lignesBrutes.join('\n') : ''; }
    else if (cib.forme === 'annuel' && chiffres.lireAnnuel(texte).paragraphes.some(function (y) { return y.ref === demande.ref; })) {
      const ancien = chiffres.lireAnnuel(texte).paragraphes.filter(function (y) { return y.ref === demande.ref; })[0], nouveau = chiffres.lireAnnuel(r.texte);
      const q = nouveau.paragraphes.filter(function (x) { return x.section === ancien.section && x.rang === ancien.rang; })[0];
      lignes = q ? nouveau.lignes.slice(q.debut, q.fin + 1).join('\n') : '';
    }
    else if (cib.forme === 'annuel') { const p = chiffres.lireAnnuel(r.texte).puces.filter(function (x) { return x.rang === (chiffres.lireAnnuel(texte).puces.filter(function (y) { return y.ref === demande.ref; })[0] || {}).rang && x.section === (chiffres.lireAnnuel(texte).puces.filter(function (y) { return y.ref === demande.ref; })[0] || {}).section; })[0]; lignes = p ? p.brute : ''; }
    else { lignes = r.texte.split('\n').slice(0, 8).join('\n') + '\n...'; }
    return { ok: true, valide: true, alertes: r.resume.alertes || [], champs: r.resume.champs, action: r.resume.action, lignes: lignes };
  }

  // Une fiche du cadre, champ par champ, avec de quoi remplir l'ecran (adresses du registre, derniere modification). Lecture seule.
  function lireFiche(rayon, id) {
    const r = String(rayon || ''), n = String(id || '') + '.md';
    if (rayonsExistants(racine).indexOf(r) === -1 || r === 'methode') { return { ok: false, erreur: 'Rayon inconnu.' }; }
    if (!RE_FICHE.test(n) || /\.collecte\.md$/.test(n) || n === 'readme.md') { return { ok: false, erreur: 'Nom de fiche refuse.' }; }
    const brut = lireOuNull(path.resolve(racine, ...DOSSIER_CADRE, r, n));
    if (!brut) { return { ok: false, erreur: 'Fiche introuvable.' }; }
    const fi = ficheChamps.lire(brut.toString('utf8'));
    if (!fi.ok) { return { ok: false, erreur: 'Fiche illisible : ' + fi.erreur }; }
    const c = ficheChamps.champs(fi);
    // Un champ dont la forme n'est pas reconnue (valeur nulle) n'est jamais propose a la modification : il reste tel quel dans le fichier.
    const nonModifiables = Object.keys(c).filter(function (k) { return c[k] === null; });
    const champsSortie = {};
    Object.keys(c).forEach(function (k) { if (c[k] !== null) { champsSortie[k] = c[k]; } });
    const tRegistre = lireOuNull(path.resolve(racine, liens.CHEMIN_LIENS));
    const registre = tRegistre ? liens.analyser(tRegistre.toString('utf8')).lignes.filter(function (l) { return l.nom; }).map(function (l) { return { nom: l.nom, date: l.date || '' }; }) : [];
    // Les CHOIX proposés à l'ecran (sources du rayon, mots du Lexique lies, mots de recherche du rayon) : calcules ici, jamais devines par l'ecran.
    const autres = [];
    try {
      fs.readdirSync(path.resolve(racine, ...DOSSIER_CADRE, r)).forEach(function (nom) {
        if (nom === n || !RE_FICHE.test(nom) || /.collecte.md$/.test(nom) || nom === 'readme.md') { return; }
        const b = lireOuNull(path.resolve(racine, ...DOSSIER_CADRE, r, nom)), x = b ? ficheChamps.lire(b.toString('utf8')) : null;
        if (x && x.ok) { const cx = ficheChamps.champs(x); autres.push({ voir_aussi: Array.isArray(cx.voir_aussi_lexique) ? cx.voir_aussi_lexique : [], tags: Array.isArray(cx.tags) ? cx.tags : [] }); }
      });
    } catch (e) { /* rayon illisible : pas de suggestions */ }
    // Les phrases du bouton « vers Comprendre les chiffres » deja utilisees par des fiches de TOUS les rayons (proposees en un clic, jamais ecrites toutes seules).
    const phrasesChiffres = {};
    try {
      rayonsExistants(racine).filter(function (rr) { return rr !== 'methode'; }).forEach(function (rr) {
        fs.readdirSync(path.resolve(racine, ...DOSSIER_CADRE, rr)).forEach(function (nom) {
          if (!RE_FICHE.test(nom) || /\.collecte\.md$/.test(nom) || nom === 'readme.md') { return; }
          const b = lireOuNull(path.resolve(racine, ...DOSSIER_CADRE, rr, nom)), x = b ? ficheChamps.lire(b.toString('utf8')) : null;
          const ph = x && x.ok ? ficheChamps.champs(x).voir_aussi_chiffres : '';
          if (typeof ph === 'string' && ph.trim()) { phrasesChiffres[ph] = (phrasesChiffres[ph] || 0) + 1; }
        });
      });
    } catch (e) { /* illisible : pas de propositions */ }
    const tCollecte = lireOuNull(path.resolve(racine, ...DOSSIER_CADRE, r, r + '.collecte.md')), tLex = lireOuNull(path.resolve(racine, CHEMIN_LEXIQUE));
    const entrees = (tLex && lexique.lireEntrees(tLex.toString('utf8'))) || [];
    const sourcesRayon = choix.sourcesDuRayon(tCollecte ? tCollecte.toString('utf8') : '', registre);
    const choixSortie = {
      sourcesRayon: sourcesRayon, lexique: choix.motsDuLexique(entrees), nbFichesRayon: autres.length + 1,
      propositions: choix.propositionsVoirAussi({ id: String(id), titre: champsSortie.titre || '', pour_qui: champsSortie.pour_qui || '', corps: ficheChamps.corpsDe(fi), voir_aussi: champsSortie.voir_aussi_lexique || [] }, autres, entrees),
      motsRecherche: choix.motsDeRechercheDuRayon(autres),
      phrasesChiffres: Object.keys(phrasesChiffres).sort(function (a, b) { return (phrasesChiffres[b] - phrasesChiffres[a]) || a.localeCompare(b, 'fr'); }).map(function (p) { return { phrase: p, nb: phrasesChiffres[p] }; }),
      longueurMaxPhraseChiffres: ficheChamps.LONGUEUR_MAX_PHRASE_CHIFFRES
    };
    return {
      ok: true, rayon: r, id: String(id), champs: champsSortie, choix: choixSortie, corps: ficheChamps.corpsDe(fi), nonModifiables: nonModifiables,
      verrouilles: ficheChamps.CLES_VERROUILLEES.filter(function (k) { return c[k] !== undefined; }).map(function (k) { return { cle: k, valeur: c[k] }; }),
      // Champs montres mais jamais modifiables (decision de Denis, 2026-10-18) : sans effet sur le site aujourd'hui.
      lectureSeule: { frein: c.frein === 'true' ? 'oui' : (c.frein === 'false' ? 'non' : ''), structures: Array.isArray(c.structures) ? c.structures : [] },
      registre: registre, territoires: ficheChamps.TERRITOIRES, modifieLe: dernieresModifications('cadre')[String(id)] || '', aujourdhui: aujourdhui()
    };
  }

  // Le sas des changements du balayage (proposes, pas encore verifies), avec ce qui est deja publie.
  function listerChangements() {
    const t = lireOuNull(path.resolve(racine, chg.CHEMIN_SAS));
    const r = chg.lister(t ? t.toString('utf8') : '', function (mois) { return (lireOuNull(path.resolve(racine, chg.DOSSIER_DIGESTS, mois + '.md')) || Buffer.from('')).toString('utf8'); });
    r.aujourdhui = aujourdhui();
    // trois cartes deja publiees (digest le plus recent) : modeles de style du prompt « Faire verifier »
    try {
      const dossier = path.resolve(racine, chg.DOSSIER_DIGESTS);
      const noms = fs.readdirSync(dossier).filter(function (f) { return /^\d{4}-\d{2}\.md$/.test(f); }).sort();
      const dernier = noms[noms.length - 1];
      r.exemples = dernier ? chg.exemplesDeStyle(fs.readFileSync(path.join(dossier, dernier), 'utf8'), dernier.replace(/\.md$/, '')) : [];
    } catch (e) { r.exemples = []; }
    return r;
  }

  // Le prompt « Faire verifier par un assistant » d'une carte (le socle de recherche vient de l'ecran : une seule source de verite).
  function promptChangement(d) {
    const v = (d && d.valeurs) || {};
    const l = listerChangements();
    return { ok: true, prompt: chg.construirePrompt(v, l.exemples || [], d && d.socle) };
  }
  function lireReponseChangement(d) {
    return chg.lireReponse(d && d.texte, d && d.actuel);
  }

  // Les fiches d'un registre du module « Qui fait quoi » avec leur fraicheur (pour l'ecran de mise a jour).
  // Pour chaque ligne qui a des etablissements (« Commune:adresse ; Commune:adresse »), ajoute l.etabs = [{ commune, adresse, dep }] : le departement vient du code de la commune.
  // Pour chaque ENSEIGNE, les départements où une fiche du même nom existe (registre publié ET sas confondus) : l.depsEnseigne = ['24', '87'] ou ['24']. Calculé à chaque lecture
  // d'après le nom et la commune des magasins : aucune mention à saisir à la main, une fiche ajoutée à la main ou arrivée par un balayage compte pareil.
  function annoterPresenceEnseignes(lignes) {
    const parNom = {};
    function ramasser(liste) {
      (liste || []).forEach(function (l) {
        const v = l.valeurs || {};
        if (v.nature !== 'enseigne' || !v.nom || !l.etabs) { return; }
        const k = logiqueTerritoire.mtNormaliser(v.nom);
        parNom[k] = parNom[k] || {};
        l.etabs.forEach(function (e) { if (e.dep) { parNom[k][e.dep] = true; } });
      });
    }
    try {
      const f = territoire.FICHIERS.employeurs, t = lireOuNull(path.resolve(racine, f.chemin));
      if (t) { const r = territoire.lister('employeurs', t.toString('utf8'), aujourdhui(), territoire.contexteDepuis(racine, aujourdhui())); if (r.ok) { annoterEtablissements(r.lignes); ramasser(r.lignes); } }
    } catch (e) { /* registre illisible : on continue avec le sas seul */ }
    try {
      const ts = lireOuNull(path.resolve(racine, sas.CHEMINS.employeurs));
      if (ts) { const r = sas.lister('employeurs', ts.toString('utf8'), registresDuDepot()); if (r.ok) { annoterEtablissements(r.lignes); ramasser(r.lignes); } }
    } catch (e) { /* sas illisible : on continue avec le registre seul */ }
    (lignes || []).forEach(function (l) {
      const v = l.valeurs || {};
      if (v.nature === 'enseigne' && v.nom) { l.depsEnseigne = Object.keys(parNom[logiqueTerritoire.mtNormaliser(v.nom)] || {}).sort(); }
    });
  }
  function annoterEtablissements(lignes) {
    let codes = {};
    try { codes = territoire.contexteDepuis(racine, aujourdhui()).communesCodes || {}; } catch (e) { codes = {}; }
    (lignes || []).forEach(function (l) {
      const brut = l && l.valeurs && l.valeurs.etablissements;
      if (!brut) { return; }
      l.etabs = logiqueTerritoire.mtParserEtablissements(brut).map(function (e) { const c = codes[logiqueTerritoire.mtNormaliser(e.commune)]; return { commune: e.commune, adresse: e.adresse, dep: c ? String(c).slice(0, 2) : '' }; });
    });
  }

  function listerTerritoire(fichier) {
    const f = territoire.FICHIERS[String(fichier || '')];
    if (!f) { return { ok: false, erreur: 'Registre du module Qui fait quoi inconnu.' }; }
    const t = lireOuNull(path.resolve(racine, f.chemin));
    if (!t) { return { ok: false, erreur: 'Registre introuvable (' + f.chemin + ').' }; }
    const r = territoire.lister(String(fichier), t.toString('utf8'), aujourdhui(), territoire.contexteDepuis(racine, aujourdhui()));
    if (r.ok) { const m = dernieresModifications(String(fichier)); r.lignes.forEach(function (l) { if (m[l.id]) { l.modifieLe = m[l.id]; } }); annoterEtablissements(r.lignes); if (String(fichier) === 'employeurs') { annoterPresenceEnseignes(r.lignes); } }
    return r;
  }

  // Contrôle automatique des adresses d'un registre (pages d'offres seulement) : n'écrit RIEN, rend un état par adresse. Les adresses viennent du registre, jamais de la fenêtre.
  function controlerTerritoire(fichier) {
    if (String(fichier || '') !== 'offres') { return { ok: false, erreur: 'Le contrôle automatique ne concerne que les pages d\'offres.' }; }
    const l = listerTerritoire('offres');
    if (!l.ok) { return l; }
    const adresses = l.lignes.map(function (x) { return { id: x.id, url: x.valeurs.page }; });
    return controle.controler(adresses).then(function (resultats) { return { ok: true, resultats: resultats, date: aujourdhui() }; });
  }

  return { etat: etat, publier: publier, annuler: annuler, listerLiens: listerLiens, listerTerritoire: listerTerritoire, controlerTerritoire: controlerTerritoire, reprendre: reprendre, analyserLot: analyserLot, lirePont: lirePont, etatPont: etatPont, listerSas: listerSas, listerChangements: listerChangements, listerFiches: listerFiches, listerMots: listerMots, verifierMotLexique: verifierMotLexique, proposerMot: proposerMot, listerListe: listerListe, idees: idees, chercherMot: chercherMot, recherchesSansResultat: recherchesSansResultat, promptVerificationChiffres: promptVerificationChiffres, lireVerificationChiffres: lireVerificationChiffres, listerChiffres: listerChiffres, verifierChiffres: verifierChiffres, lireChiffres: lireChiffres, lireFiche: lireFiche, listerHistorique: listerHistorique, promptChangement: promptChangement, lireReponseChangement: lireReponseChangement };
}

module.exports = { analyserCandidatsLexique: analyserCandidatsLexique, integrerCandidatsLexique: integrerCandidatsLexique, creerDepot: creerDepot, validerFichier: validerFichier, ajouterLigneReadme: ajouterLigneReadme, rayonsExistants: rayonsExistants, lancerCommande: lancerCommande, TAILLE_MAX: TAILLE_MAX };
