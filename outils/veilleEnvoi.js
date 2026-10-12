/* ============================================================
   veilleEnvoi.js  --  preparer les fichiers a envoyer sur GitHub (site web, « Upload files », 100 fichiers au plus a la fois)
   ------------------------------------------------------------
   Utilise par outils/serveur_veille.js. Aucune dependance. NE FAIT JAMAIS DE PUSH et ne contacte aucun site : il fabrique un dossier
   « A_envoyer_sur_GitHub » (ignore par Git) contenant UNIQUEMENT les fichiers modifies depuis le dernier envoi, ranges exactement comme
   dans le depot (modules/comprendre-le-cadre/contenu/emploi/..., modules/comprendre-les-chiffres/..., data/lexique.js...), en lots de 100
   fichiers au plus. En glissant un lot dans GitHub, les fichiers portant le meme nom au meme endroit sont remplaces ; les autres ne sont pas touches.
   Le « dernier envoi » est memorise par une etiquette Git LOCALE (envoye-github), posee quand Denis clique « J'ai tout envoye ».
   ============================================================ */
'use strict';
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const NOM_DOSSIER = 'A_envoyer_sur_GitHub';
const ETIQUETTE = 'envoye-github';
const TAILLE_LOT = 100;
const TAILLE_MAX_FICHIER = 25 * 1024 * 1024;   // limite de GitHub pour un fichier envoye par le site web
const RE_DATE = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;

function git(racine, args, binaire) {
  const env = Object.assign({}, process.env); delete env.NODE_TEST_CONTEXT;
  const r = spawnSync('git', args, { cwd: racine, env: env, encoding: binaire ? 'buffer' : 'utf8', windowsHide: true, maxBuffer: 256 * 1024 * 1024 });
  return { code: (r.status === null ? -1 : r.status), sortie: binaire ? r.stdout : String(r.stdout || ''), erreur: String(r.stderr || '') };
}

function pad(n) { return (n < 10 ? '0' : '') + n; }
function dateFr(iso) { const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso || ''); return m ? (m[3] + '/' + m[2] + '/' + m[1]) : ''; }

function creerEnvoi(racine) {
  const sortie = path.join(path.resolve(racine), NOM_DOSSIER);

  function etiquette() {
    const r = git(racine, ['rev-parse', '-q', '--verify', 'refs/tags/' + ETIQUETTE + '^{commit}']);
    if (r.code !== 0 || !r.sortie.trim()) { return null; }
    const hash = r.sortie.trim();
    const d = git(racine, ['show', '-s', '--format=%cI', hash]);
    return { hash: hash, date: d.sortie.trim() };
  }

  // Quel est le point de depart ? { hash|null, origine: 'etiquette'|'date'|'tout', date? }
  function pointDeDepart(depuis) {
    const e = etiquette();
    if (e) { return { hash: e.hash, origine: 'etiquette', date: e.date }; }
    if (depuis) {
      if (!RE_DATE.test(String(depuis))) { return { erreur: 'Date invalide (attendu AAAA-MM-JJ).' }; }
      const r = git(racine, ['rev-list', '-1', '--before=' + depuis + ' 23:59:59', 'HEAD']);
      if (r.code === 0 && r.sortie.trim()) { return { hash: r.sortie.trim(), origine: 'date', date: depuis }; }
    }
    return { hash: null, origine: 'tout' };
  }

  // Liste des fichiers a envoyer et a supprimer, sans rien ecrire.
  function prevoir(depuis) {
    const depart = pointDeDepart(depuis);
    if (depart.erreur) { return { ok: false, erreur: depart.erreur }; }
    let aEnvoyer = [], aSupprimer = [];
    if (depart.hash) {
      const r = git(racine, ['diff', '--name-status', '--no-renames', '-z', depart.hash, 'HEAD']);
      if (r.code !== 0) { return { ok: false, erreur: 'Git n\'a pas pu comparer les versions : ' + r.erreur.trim() }; }
      const jetons = r.sortie.split('\u0000').filter(function (x) { return x !== ''; });
      for (let i = 0; i + 1 < jetons.length; i += 2) {
        const statut = jetons[i].charAt(0), chemin = jetons[i + 1];
        if (statut === 'D') { aSupprimer.push(chemin); } else { aEnvoyer.push(chemin); }
      }
    } else {
      const r = git(racine, ['ls-files', '-z']);
      if (r.code !== 0) { return { ok: false, erreur: 'Git n\'a pas pu lister les fichiers : ' + r.erreur.trim() }; }
      aEnvoyer = r.sortie.split('\u0000').filter(function (x) { return x !== ''; });
    }
    const exclus = function (c) { return c === NOM_DOSSIER || c.indexOf(NOM_DOSSIER + '/') === 0; };
    aEnvoyer = aEnvoyer.filter(function (c) { return !exclus(c); }).sort();
    aSupprimer = aSupprimer.filter(function (c) { return !exclus(c); }).sort();
    const st = git(racine, ['status', '--porcelain']);
    return {
      ok: true, depart: depart, aEnvoyer: aEnvoyer, aSupprimer: aSupprimer,
      lots: Math.ceil(aEnvoyer.length / TAILLE_LOT),
      modificationsNonEnregistrees: st.code === 0 ? st.sortie.split('\n').filter(Boolean).length : 0
    };
  }

  function cheminSur(c) {
    return c && typeof c === 'string' && c.indexOf('\u0000') === -1 && !path.isAbsolute(c) && c.split('/').indexOf('..') === -1 && c.split('\\').indexOf('..') === -1;
  }

  function viderSortie() {
    if (path.resolve(sortie) !== path.join(path.resolve(racine), NOM_DOSSIER)) { throw new Error('dossier de sortie inattendu'); }
    fs.rmSync(sortie, { recursive: true, force: true });
    fs.mkdirSync(sortie, { recursive: true });
  }

  function preparer(depuis) {
    const p = prevoir(depuis);
    if (!p.ok) { return p; }
    const sales = {};
    const st = git(racine, ['status', '--porcelain', '-z']);
    if (st.code === 0) { st.sortie.split('\u0000').filter(Boolean).forEach(function (l) { sales[l.slice(3)] = true; }); }
    viderSortie();
    const tropGros = [], ignores = [];
    const aCopier = [];
    p.aEnvoyer.forEach(function (c) {
      if (!cheminSur(c)) { ignores.push(c); return; }
      let taille = 0;
      try { taille = fs.statSync(path.join(racine, c)).size; } catch (e) { taille = -1; }
      if (taille > TAILLE_MAX_FICHIER) { tropGros.push(c); return; }
      aCopier.push(c);
    });
    const nbLots = Math.ceil(aCopier.length / TAILLE_LOT);
    const largeur = String(nbLots).length < 2 ? 2 : String(nbLots).length;
    const noms = [];
    for (let k = 0; k < nbLots; k++) {
      const nomLot = 'lot-' + String(k + 1).padStart(largeur, '0');
      noms.push(nomLot);
      aCopier.slice(k * TAILLE_LOT, (k + 1) * TAILLE_LOT).forEach(function (c) {
        const dest = path.join(sortie, nomLot, ...c.split('/'));
        fs.mkdirSync(path.dirname(dest), { recursive: true });
        if (sales[c]) {
          // Fichier en cours de travail dans le depot : on envoie la version ENREGISTREE (jamais un brouillon).
          const b = git(racine, ['show', 'HEAD:' + c], true);
          if (b.code === 0) { fs.writeFileSync(dest, b.sortie); } else { ignores.push(c); }
        } else {
          fs.copyFileSync(path.join(racine, c), dest);
        }
      });
    }
    if (p.aSupprimer.length) {
      fs.writeFileSync(path.join(sortie, 'A_SUPPRIMER_sur_GitHub.txt'),
        ['Ces fichiers n\'existent plus dans votre dossier. Supprimez-les sur GitHub (ouvrez le fichier, trois points en haut a droite, « Delete file »), apres avoir envoye les lots.', ''].concat(p.aSupprimer).join('\r\n') + '\r\n', 'utf8');
    }
    const quand = p.depart.origine === 'tout' ? 'depuis le tout debut (aucun envoi precedent connu)'
      : (p.depart.origine === 'etiquette' ? 'depuis votre dernier envoi du ' + dateFr(p.depart.date) : 'depuis le ' + dateFr(depuis));
    const lignes = [
      'ENVOI SUR GITHUB : MODE D\'EMPLOI',
      '',
      'Prepare automatiquement. ' + aCopier.length + ' fichier' + (aCopier.length > 1 ? 's' : '') + ' modifie' + (aCopier.length > 1 ? 's' : '') + ' ' + quand + ', en ' + nbLots + ' lot' + (nbLots > 1 ? 's' : '') + ' de ' + TAILLE_LOT + ' fichiers au plus.',
      'Les fichiers qui n\'ont pas change ne sont PAS dans ces lots : sur GitHub, ils restent tels quels.',
      '',
      '1. Ouvrez votre depot sur GitHub, bouton « Add file » puis « Upload files ».',
      '2. Sur cet ordinateur, ouvrez le dossier « ' + (noms[0] || 'lot-01') + ' » (dans ce dossier). Selectionnez TOUT son contenu (Ctrl + A) et glissez-le dans la page GitHub.',
      '   Les dossiers sont deja ranges comme dans le depot : GitHub remplace les fichiers qui portent le meme nom au meme endroit et ne touche pas aux autres.',
      '3. Ecrivez un message (par exemple « Mise a jour du contenu ») puis cliquez « Commit changes ».',
      '4. Recommencez avec le lot suivant, jusqu\'au dernier.',
      p.aSupprimer.length ? '5. Le fichier A_SUPPRIMER_sur_GitHub.txt liste ' + p.aSupprimer.length + ' fichier' + (p.aSupprimer.length > 1 ? 's' : '') + ' a supprimer sur GitHub.' : '5. Aucun fichier a supprimer.',
      '6. Quand tout est envoye : dans l\'outil de veille, cliquez « J\'ai tout envoye », pour que le prochain envoi ne contienne que les nouveautes.'
    ];
    if (tropGros.length) { lignes.push('', 'ATTENTION : ces fichiers depassent 25 Mo, GitHub les refuse par le site web : ' + tropGros.join(', ')); }
    fs.writeFileSync(path.join(sortie, 'LISEZ-MOI.txt'), lignes.join('\r\n') + '\r\n', 'utf8');
    return {
      ok: true, nbFichiers: aCopier.length, nbLots: nbLots, lots: noms, supprimes: p.aSupprimer, tropGros: tropGros, ignores: ignores,
      depart: p.depart, dossier: sortie, modificationsNonEnregistrees: p.modificationsNonEnregistrees
    };
  }

  // « J'ai tout envoye » : le prochain envoi ne contiendra que ce qui change apres maintenant.
  function marquerEnvoye() {
    const r = git(racine, ['tag', '-f', ETIQUETTE, 'HEAD']);
    if (r.code !== 0) { return { ok: false, erreur: 'Git n\'a pas pu noter l\'envoi : ' + r.erreur.trim() }; }
    const h = git(racine, ['rev-parse', 'HEAD']).sortie.trim();
    return { ok: true, commit: h.slice(0, 8) };
  }

  function etat(depuis) {
    const p = prevoir(depuis);
    if (!p.ok) { return p; }
    return { ok: true, depart: p.depart, nbFichiers: p.aEnvoyer.length, nbLots: p.lots, nbSupprimes: p.aSupprimer.length, modificationsNonEnregistrees: p.modificationsNonEnregistrees, dossier: sortie, existe: fs.existsSync(sortie) };
  }

  return { etat: etat, preparer: preparer, marquerEnvoye: marquerEnvoye, dossier: function () { return sortie; } };
}

module.exports = { creerEnvoi: creerEnvoi, NOM_DOSSIER: NOM_DOSSIER, ETIQUETTE: ETIQUETTE, TAILLE_LOT: TAILLE_LOT };
