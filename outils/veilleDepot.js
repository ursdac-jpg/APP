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
const path = require('path');
const { spawnSync } = require('child_process');
const lexique = require('./veilleLexique.js');
const liens = require('./veilleLiens.js');

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
    const entete = '\n\n  // -- Ajouts de la veille ' + String(mois || '') + ' --\n\n';
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

  function branche() { const r = git(['rev-parse', '--abbrev-ref', 'HEAD']); return r.code === 0 ? r.sortie.trim() : ''; }

  function etat() {
    const st = git(['status', '--porcelain']);
    return {
      branche: branche(),
      modifications: st.code === 0 ? st.sortie.split('\n').filter(Boolean).length : -1,
      annulable: !!derniere
    };
  }

  function aujourdhui() {
    if (opt.aujourdhui) { return opt.aujourdhui(); }
    const d = new Date(), p = function (n) { return (n < 10 ? '0' : '') + n; };
    return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate());
  }

  function publier(fichiers, options) {
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
    let motsAjoutes = [], motsRemplaces = [], resumeLiens = null;
    for (const v of valides) {
      if (v.type === 'lexique') {
        const courant = (lireOuNull(path.resolve(racine, CHEMIN_LEXIQUE)) || Buffer.from('')).toString('utf8');
        const r = integrerCandidatsLexique(courant, { ids: v.ids, texte: v.texte, entrees: v.entrees }, v.mois, options);
        if (!r.ok) { return { ok: false, code: r.code || 'lexique', ids: r.ids, erreur: v.nom + ' : ' + r.erreur }; }
        prevus[v.chemin] = Buffer.from(r.texte, 'utf8');
        motsAjoutes = motsAjoutes.concat(r.ajoutes); motsRemplaces = motsRemplaces.concat(r.remplaces);
        continue;
      }
      if (v.type === 'liens') {
        const courantL = (lireOuNull(path.resolve(racine, v.chemin)) || Buffer.from('')).toString('utf8');
        const r = liens.appliquer(courantL, v.actions, aujourdhui(), liens.usagesDesLiens(racine));
        if (!r.ok) { return { ok: false, code: 'liens', erreur: r.erreur }; }
        if (r.texte === courantL) { return { ok: false, code: 'liens-rien', erreur: 'Ces modifications ne changent rien au registre des adresses.' }; }
        prevus[v.chemin] = Buffer.from(r.texte, 'utf8'); resumeLiens = r.resume;
        continue;
      }
      prevus[v.chemin] = Buffer.from(v.texte, 'utf8');
      if (v.type === 'fiche' && !fs.existsSync(path.resolve(racine, v.chemin))) { nouvelles.push(v); }
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
    const remplaces = valides.filter(function (v) { return v.type !== 'lexique' && v.type !== 'liens' && fs.existsSync(path.resolve(racine, v.chemin)); }).map(function (v) { return v.chemin; });
    const st = git(['status', '--porcelain', '--'].concat(cibles));
    if (st.code === 0 && st.sortie.trim()) {
      return { ok: false, code: 'travail-en-cours', erreur: 'Un de ces fichiers a deja des modifications non enregistrees (travail en cours) : ' + st.sortie.trim().split('\n')[0].trim() + '. Rien n\'a ete ecrit.' };
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
    try {
      cibles.forEach(function (c) { const p = path.resolve(racine, c); fs.mkdirSync(path.dirname(p), { recursive: true }); fs.writeFileSync(p, prevus[c]); });
    } catch (e) { restaurer(); return { ok: false, code: 'ecriture', erreur: 'Ecriture impossible : ' + (e && e.message) }; }

    // Regeneration des copies derivees, puis tests.
    const etapes = [];
    const base = path.join(racine, 'scripts', 'genererBaseVeille.js');
    if (fs.existsSync(base)) { etapes.push(lancer(process.execPath, ['scripts/genererBaseVeille.js'])); }
    const renvois = path.join(racine, 'scripts', 'genererRenvoisCadre.js');
    if (fs.existsSync(renvois)) { etapes.push(lancer(process.execPath, ['scripts/genererRenvoisCadre.js'])); }
    const echecGen = etapes.find(function (r) { return r.code !== 0; });
    if (echecGen) { restaurer(); return { ok: false, code: 'generation', erreur: 'La mise a jour des copies de l\'outil a echoue : rien n\'est publie.', details: echecGen.sortie.split('\n').slice(-15).join('\n') }; }
    let avertissementsLexique = [];
    if (valides.some(function (v) { return v.type === 'lexique'; })) {
      const verif = lancer(process.execPath, ['scripts/checkLexique.js']);
      if (verif.code !== 0) { restaurer(); return { ok: false, code: 'lexique-verification', erreur: 'La verification du Lexique (checkLexique) a echoue : rien n\'est publie, tout est remis comme avant.', details: verif.sortie.split('\n').slice(-25).join('\n') }; }
      // Avertissements : non bloquants mais montres (par exemple un mot jamais cite par un autre).
      avertissementsLexique = verif.sortie.split('\n').filter(function (l) { return /^\s*-?\s*(Fiche|Parcours|Collection|")/.test(l) || /avertissement/i.test(l); }).slice(0, 20);
    }
    const tests = lancer(process.execPath, ['--test', 'tests/*.test.js']);
    if (tests.code !== 0) {
      restaurer();
      const echecs = tests.sortie.split('\n').filter(function (l) { return /^\s*(not ok|✖)/.test(l); }).slice(0, 8).map(function (l) { return l.trim(); });
      return { ok: false, code: 'tests', erreur: 'Les verifications automatiques ont echoue : rien n\'est publie, tout est remis comme avant.', echecs: echecs, details: tests.sortie.split('\n').slice(-25).join('\n') };
    }

    // Enregistrement Git local, uniquement sur les chemins de cette publication.
    const chemins = cibles.concat(FICHIERS_GENERES.map(function (p) { return p.join('/'); }).filter(function (c) { return fs.existsSync(path.resolve(racine, c)); }));
    const ajout = git(['add', '--'].concat(chemins));
    if (ajout.code !== 0) { return { ok: false, code: 'git', erreur: 'Git n\'a pas pu preparer l\'enregistrement (les fichiers restent ecrits, rien n\'est enregistre).', details: ajout.sortie }; }
    const nb = valides.length;
    const message = 'Veille : mise a jour du contenu (' + nb + ' fichier' + (nb > 1 ? 's' : '') + ')\n\n' + valides.map(function (v) { return '- ' + v.chemin; }).join('\n');
    const commit = git(['commit', '-m', message, '--'].concat(chemins));
    if (commit.code !== 0) {
      git(['reset', '-q', '--'].concat(chemins));
      return { ok: false, code: 'git', erreur: 'Git n\'a pas pu enregistrer (les fichiers restent ecrits, rien n\'est enregistre). Prevenez Claude.', details: commit.sortie };
    }
    const hash = git(['rev-parse', 'HEAD']).sortie.trim();
    derniere = { hash: hash, chemins: chemins };
    return {
      ok: true, commit: hash.slice(0, 8), fichiers: valides.map(function (v) { return v.chemin; }),
      nouvelles: nouvelles.map(function (v) { return v.nom.replace(/\.md$/, ''); }),
      nouveauxMots: motsAjoutes, motsRemplaces: motsRemplaces, resumeLiens: resumeLiens,
      avertissementsLexique: avertissementsLexique, remplaces: remplaces,
      resteAFaire: valides.some(function (v) { return v.type === 'fiche'; }) ? ['Dater les nouvelles adresses : ouvrez « Les adresses » dans le panneau Dépôt, cliquez chaque lien, puis « Valider » (il faut ouvrir et juger chaque page).'] : []
    };
  }

  // Annule la derniere publication de la seance, par un nouvel enregistrement qui la defait (jamais de reecriture de l'historique).
  function annuler() {
    if (!derniere) { return { ok: false, code: 'rien', erreur: 'Aucune publication a annuler dans cette seance.' }; }
    const tete = git(['rev-parse', 'HEAD']).sortie.trim();
    if (tete !== derniere.hash) { return { ok: false, code: 'plus-recente', erreur: 'Un autre enregistrement a ete fait depuis : annulation refusee pour ne rien casser. Demandez a Claude.' }; }
    const st = git(['status', '--porcelain', '--'].concat(derniere.chemins));
    if (st.code === 0 && st.sortie.trim()) { return { ok: false, code: 'travail-en-cours', erreur: 'Ces fichiers ont des modifications non enregistrees : annulation refusee.' }; }
    const r = git(['revert', '--no-edit', derniere.hash]);
    if (r.code !== 0) { git(['revert', '--abort']); return { ok: false, code: 'git', erreur: 'Git n\'a pas pu annuler. Prevenez Claude.', details: r.sortie }; }
    derniere = null;
    return { ok: true, commit: git(['rev-parse', 'HEAD']).sortie.trim().slice(0, 8) };
  }

  // Les adresses du registre avec leur etat et le nombre de fiches qui s'en servent (pour l'ecran des liens).
  function listerLiens() {
    const t = lireOuNull(path.resolve(racine, liens.CHEMIN_LIENS));
    if (!t) { return { ok: false, erreur: 'Registre des adresses introuvable (' + liens.CHEMIN_LIENS + ').' }; }
    return { ok: true, liens: liens.lister(t.toString('utf8'), liens.usagesDesLiens(racine)), aujourdhui: aujourdhui() };
  }

  return { etat: etat, publier: publier, annuler: annuler, listerLiens: listerLiens };
}

module.exports = { analyserCandidatsLexique: analyserCandidatsLexique, integrerCandidatsLexique: integrerCandidatsLexique, creerDepot: creerDepot, validerFichier: validerFichier, ajouterLigneReadme: ajouterLigneReadme, rayonsExistants: rayonsExistants, lancerCommande: lancerCommande, TAILLE_MAX: TAILLE_MAX };
