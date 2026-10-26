/* ============================================================
   veilleGithub.js  --  envoyer DIRECTEMENT sur GitHub, en un clic, SEULEMENT les fichiers qui different
   ------------------------------------------------------------
   Utilise par outils/serveur_veille.js. Aucune dependance (Node seul : fetch, fs, child_process).
   Principe : on compare l'empreinte Git de chaque fichier ENREGISTRE ici (git ls-tree HEAD) a celle des fichiers de GitHub (API « git/trees »),
   on n'envoie que ceux qui different, en UN seul enregistrement (blobs -> arbre -> enregistrement -> branche), SANS reecrire l'historique de GitHub
   (jamais de force) et sans exiger que les historiques local et GitHub soient identiques. Les fichiers presents seulement sur GitHub ne sont JAMAIS touches.
   Acces : un « jeton » GitHub a droits limites (un seul depot, contenu en ecriture), cree une fois par Denis, garde dans un fichier de son dossier
   utilisateur Windows (hors du depot) ; il n'est jamais renvoye a la page ni ecrit dans un journal. Seul api.github.com est contacte (adresse fixe ;
   une autre adresse n'existe que pour les essais, passee par le code, jamais par une requete).
   ============================================================ */
'use strict';
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

const API_GITHUB = 'https://api.github.com';
const RE_COMPTE = /^[A-Za-z0-9](?:[A-Za-z0-9-]{0,38})$/;
const RE_DEPOT = /^[A-Za-z0-9._-]{1,100}$/;
const RE_BRANCHE = /^[A-Za-z0-9._\/-]{1,100}$/;
const RE_JETON = /^(github_pat_[A-Za-z0-9_]{20,255}|gh[pousr]_[A-Za-z0-9]{20,255})$/;
const TAILLE_LOT_ARBRE = 100;
const TAILLE_MAX_FICHIER = 25 * 1024 * 1024;
const GROUPES = ['cadre', 'chiffres', 'lexique', 'autres'];

function groupeDe(chemin) {
  if (chemin.indexOf('modules/comprendre-le-cadre/') === 0) { return 'cadre'; }
  if (chemin.indexOf('modules/comprendre-les-chiffres/') === 0) { return 'chiffres'; }
  if (/^data\/lexique[^/]*$/.test(chemin)) { return 'lexique'; }
  return 'autres';
}

function cheminConfigParDefaut() {
  const base = process.env.APPDATA || path.join(os.homedir(), 'AppData', 'Roaming');
  return path.join(base, 'assistant-veille', 'github.json');
}

function git(racine, args, binaire) {
  const env = Object.assign({}, process.env); delete env.NODE_TEST_CONTEXT;
  const r = spawnSync('git', args, { cwd: racine, env: env, encoding: binaire ? 'buffer' : 'utf8', windowsHide: true, maxBuffer: 512 * 1024 * 1024 });
  return { code: (r.status === null ? -1 : r.status), sortie: binaire ? r.stdout : String(r.stdout || ''), erreur: String(r.stderr || '') };
}

function creerGithub(racine, options) {
  const opt = options || {};
  const api = opt.apiBase || API_GITHUB;
  const fichierConfig = opt.fichierConfig || cheminConfigParDefaut();
  const appeler = opt.fetch || fetch;

  // ---------- configuration (le jeton ne sort jamais) ----------
  function lire() {
    try { const c = JSON.parse(fs.readFileSync(fichierConfig, 'utf8')); return (c && typeof c === 'object') ? c : null; } catch (e) { return null; }
  }
  function etatConfig() {
    const c = lire();
    if (!c || !c.proprietaire || !c.depot || !c.branche || !c.jeton) { return { ok: true, configure: false }; }
    return { ok: true, configure: true, proprietaire: c.proprietaire, depot: c.depot, branche: c.branche, jetonFin: String(c.jeton).slice(-4) };
  }
  function ecrireConfig(d) {
    if (d && d.effacer) { try { fs.rmSync(fichierConfig, { force: true }); } catch (e) { /* deja absent */ } return { ok: true, configure: false }; }
    const proprietaire = String((d && d.proprietaire) || '').trim(), depot = String((d && d.depot) || '').trim(), branche = String((d && d.branche) || '').trim();
    let jeton = String((d && d.jeton) || '').trim();
    if (!RE_COMPTE.test(proprietaire)) { return { ok: false, erreur: 'Nom de compte GitHub non reconnu (lettres, chiffres et tirets seulement).' }; }
    if (!RE_DEPOT.test(depot) || depot === '.' || depot === '..') { return { ok: false, erreur: 'Nom de depot non reconnu.' }; }
    if (!RE_BRANCHE.test(branche) || branche.indexOf('..') !== -1) { return { ok: false, erreur: 'Nom de branche non reconnu.' }; }
    if (!jeton) { const ancien = lire(); if (ancien && ancien.jeton) { jeton = ancien.jeton; } }   // champ jeton laisse vide : on garde l'ancien
    if (!RE_JETON.test(jeton)) { return { ok: false, erreur: 'Jeton non reconnu : il commence par « github_pat_ » (jeton a droits limites) ou « ghp_ ». Recollez-le en entier.' }; }
    try {
      fs.mkdirSync(path.dirname(fichierConfig), { recursive: true });
      fs.writeFileSync(fichierConfig, JSON.stringify({ proprietaire: proprietaire, depot: depot, branche: branche, jeton: jeton }), { encoding: 'utf8', mode: 0o600 });
    } catch (e) { return { ok: false, erreur: 'Impossible d\'enregistrer la configuration : ' + (e && e.message) }; }
    return etatConfig();
  }

  // ---------- appels a l'API ----------
  async function requete(c, methode, chemin, corps) {
    let r;
    try {
      r = await appeler(api + chemin, {
        method: methode,
        headers: { 'Authorization': 'Bearer ' + c.jeton, 'Accept': 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28', 'User-Agent': 'assistant-veille', 'Content-Type': 'application/json' },
        body: corps === undefined ? undefined : JSON.stringify(corps)
      });
    } catch (e) { return { statut: 0, erreur: 'Pas de connexion a GitHub (internet ?).' }; }
    let json = null; try { json = await r.json(); } catch (e) { json = null; }
    return { statut: r.status, json: json };
  }
  function messageErreur(rep, quoi) {
    const s = rep.statut;
    if (s === 0) { return rep.erreur; }
    if (s === 401) { return 'GitHub refuse le jeton (il a peut-etre expire ou ete revoque). Creez-en un nouveau et recollez-le.'; }
    if (s === 403) { return (quoi ? quoi + ' : ' : '') + 'acces refuse par GitHub (droits du jeton insuffisants, ou limite d\'appels atteinte). Le jeton doit avoir « Contents : Read and write » sur ce depot.'; }
    if (s === 404) { return (quoi ? quoi + ' : ' : '') + 'introuvable sur GitHub. Verifiez le nom du compte, du depot et de la branche (et que le jeton a bien acces a ce depot).'; }
    if (s === 422) { return 'GitHub a refuse l\'enregistrement' + ((rep.json && rep.json.message) ? ' (' + rep.json.message + ')' : '') + '. Si GitHub a change entre-temps, relancez la comparaison.'; }
    return 'Reponse inattendue de GitHub (code ' + s + ')' + ((rep.json && rep.json.message) ? ' : ' + rep.json.message : '') + '.';
  }
  function configComplete() {
    const c = lire();
    if (!c || !c.proprietaire || !c.depot || !c.branche || !c.jeton) { return null; }
    return c;
  }
  const chemRepo = function (c) { return '/repos/' + encodeURIComponent(c.proprietaire) + '/' + encodeURIComponent(c.depot); };

  async function tester() {
    const c = configComplete();
    if (!c) { return { ok: false, erreur: 'GitHub n\'est pas encore configure.' }; }
    const depot = await requete(c, 'GET', chemRepo(c));
    if (depot.statut !== 200) { return { ok: false, erreur: messageErreur(depot, 'Depot') }; }
    if (depot.json && depot.json.permissions && depot.json.permissions.push === false) { return { ok: false, erreur: 'Le jeton peut LIRE ce depot mais pas y ECRIRE : il lui faut « Contents : Read and write ».' }; }
    const br = await requete(c, 'GET', chemRepo(c) + '/branches/' + encodeURIComponent(c.branche));
    if (br.statut !== 200) { return { ok: false, erreur: messageErreur(br, 'Branche « ' + c.branche + ' »') }; }
    return { ok: true, depot: depot.json && depot.json.full_name, branche: c.branche };
  }

  // Le module « Mon territoire » est-il OUVERT au public dans la version enregistree (modules/mon-territoire/logique.js, MT_OUVERT) ? true / false, ou null si illisible.
  // Mettre le site sur GitHub ne doit jamais l'ouvrir au public par mégarde (décision de Denis, 2026-10-18).
  function territoireOuvert() {
    const r = git(racine, ['show', 'HEAD:modules/mon-territoire/logique.js']);
    if (r.code !== 0) { return null; }
    const m = /var MT_OUVERT = (true|false)s*;/.exec(r.sortie);
    return m ? m[1] === 'true' : null;
  }

  // ---------- comparaison ----------
  function entreesLocales() {
    const r = git(racine, ['ls-tree', '-r', '-z', 'HEAD']);
    if (r.code !== 0) { throw new Error('Git n\'a pas pu lister les fichiers enregistres : ' + r.erreur.trim()); }
    const sortie = [];
    r.sortie.split('\u0000').filter(Boolean).forEach(function (ligne) {
      const m = /^(\d{6}) (\w+) ([0-9a-f]{40})\t([\s\S]+)$/.exec(ligne);
      if (!m || m[2] !== 'blob' || (m[1] !== '100644' && m[1] !== '100755')) { return; }   // liens symboliques et sous-modules : ignores
      sortie.push({ mode: m[1], sha: m[3], chemin: m[4] });
    });
    return sortie;
  }

  async function arbreDistant(c) {
    const br = await requete(c, 'GET', chemRepo(c) + '/branches/' + encodeURIComponent(c.branche));
    if (br.statut !== 200) { return { erreur: messageErreur(br, 'Branche « ' + c.branche + ' »') }; }
    const commit = br.json && br.json.commit && br.json.commit.sha, arbre = br.json && br.json.commit && br.json.commit.commit && br.json.commit.commit.tree && br.json.commit.commit.tree.sha;
    if (!commit || !arbre) { return { erreur: 'Reponse de GitHub incomplete (branche).' }; }
    const t = await requete(c, 'GET', chemRepo(c) + '/git/trees/' + arbre + '?recursive=1');
    if (t.statut !== 200) { return { erreur: messageErreur(t, 'Arbre des fichiers') }; }
    if (t.json && t.json.truncated) { return { erreur: 'Le depot GitHub est trop gros pour etre compare d\'un coup. Utilisez les lots a glisser.' }; }
    const parChemin = {};
    ((t.json && t.json.tree) || []).forEach(function (e) { if (e.type === 'blob') { parChemin[e.path] = e.sha; } });
    return { commit: commit, arbre: arbre, parChemin: parChemin };
  }

  function filtrer(entrees, groupes) {
    const gs = (Array.isArray(groupes) && groupes.length) ? groupes.filter(function (g) { return GROUPES.indexOf(g) !== -1; }) : GROUPES;
    return entrees.filter(function (e) { return gs.indexOf(groupeDe(e.chemin)) !== -1; });
  }

  async function comparer(groupes) {
    const c = configComplete();
    if (!c) { return { ok: false, erreur: 'GitHub n\'est pas encore configure.' }; }
    let locales; try { locales = entreesLocales(); } catch (e) { return { ok: false, erreur: e.message }; }
    const d = await arbreDistant(c);
    if (d.erreur) { return { ok: false, erreur: d.erreur }; }
    const differents = locales.filter(function (e) { return d.parChemin[e.chemin] !== e.sha; });
    const parGroupe = { cadre: 0, chiffres: 0, lexique: 0, autres: 0 };
    differents.forEach(function (e) { parGroupe[groupeDe(e.chemin)]++; });
    const choisis = filtrer(differents, groupes);
    const locauxSet = {}; locales.forEach(function (e) { locauxSet[e.chemin] = true; });
    const seulementDistants = Object.keys(d.parChemin).filter(function (p) { return !locauxSet[p]; }).length;
    const st = git(racine, ['status', '--porcelain']);
    const lignesSt = st.code === 0 ? st.sortie.split(String.fromCharCode(10)).filter(Boolean) : [];
    return {
      ok: true, nbDifferents: differents.length,
      // Fichiers NOUVEAUX jamais enregistres dans Git : ils ne sont pas dans l'arbre compare, donc ne partent pas (a enregistrer d'abord).
      nonSuivis: lignesSt.filter(function (l) { return l.indexOf('??') === 0; }).length, parGroupe: parGroupe, nbChoisis: choisis.length,
      nouveaux: choisis.filter(function (e) { return !d.parChemin[e.chemin]; }).length,
      seulementSurGithub: seulementDistants,
      modificationsNonEnregistrees: lignesSt.filter(function (l) { return l.indexOf('??') !== 0; }).length,
      territoireOuvert: territoireOuvert(),
      exemples: choisis.slice(0, 8).map(function (e) { return e.chemin; })
    };
  }

  // ---------- envoi ----------
  function contenuDe(sha) {
    const r = git(racine, ['cat-file', 'blob', sha], true);
    return r.code === 0 ? r.sortie : null;
  }
  function texteValide(buf) {
    if (buf.indexOf(0) !== -1) { return null; }
    try { return new TextDecoder('utf-8', { fatal: true }).decode(buf); } catch (e) { return null; }
  }

  async function envoyer(groupes, message, confirmerTerritoire) {
    const c = configComplete();
    if (!c) { return { ok: false, erreur: 'GitHub n\'est pas encore configure.' }; }
    let locales; try { locales = entreesLocales(); } catch (e) { return { ok: false, erreur: e.message }; }
    const d = await arbreDistant(c);
    if (d.erreur) { return { ok: false, erreur: d.erreur }; }
    const aEnvoyer = filtrer(locales.filter(function (e) { return d.parChemin[e.chemin] !== e.sha; }), groupes);
    if (!aEnvoyer.length) { return { ok: true, rien: true, nbFichiers: 0 }; }
    // Garde-fou : si la version enregistree OUVRE « Mon territoire » au public, l'envoi est refusé tant que Denis ne l'a pas confirmé en connaissance de cause.
    if (!confirmerTerritoire && aEnvoyer.some(function (e) { return e.chemin === 'modules/mon-territoire/logique.js'; }) && territoireOuvert() === true) {
      return { ok: false, code: 'territoire-ouvert', erreur: 'Le module « Mon territoire » est OUVERT au public dans ce qui va partir : tout le monde le verrait sur le site. Rien n’a été envoyé.' };
    }
    const entrees = [], tropGros = [], illisibles = [];
    for (const e of aEnvoyer) {
      const buf = contenuDe(e.sha);
      if (!buf) { illisibles.push(e.chemin); continue; }
      if (buf.length > TAILLE_MAX_FICHIER) { tropGros.push(e.chemin); continue; }
      const texte = texteValide(buf);
      if (texte !== null) { entrees.push({ path: e.chemin, mode: e.mode, type: 'blob', content: texte }); continue; }
      const b = await requete(c, 'POST', chemRepo(c) + '/git/blobs', { content: buf.toString('base64'), encoding: 'base64' });
      if (b.statut !== 201 || !b.json || !b.json.sha) { return { ok: false, erreur: messageErreur(b, 'Envoi de ' + e.chemin) }; }
      entrees.push({ path: e.chemin, mode: e.mode, type: 'blob', sha: b.json.sha });
    }
    if (!entrees.length) { return { ok: false, erreur: 'Aucun fichier envoyable (trop gros ou illisibles).', tropGros: tropGros, illisibles: illisibles }; }
    // Arbres par paquets de 100 : chaque paquet part de l'arbre precedent ; seul le dernier sera reference.
    let base = d.arbre;
    for (let i = 0; i < entrees.length; i += TAILLE_LOT_ARBRE) {
      const t = await requete(c, 'POST', chemRepo(c) + '/git/trees', { base_tree: base, tree: entrees.slice(i, i + TAILLE_LOT_ARBRE) });
      if (t.statut !== 201 || !t.json || !t.json.sha) { return { ok: false, erreur: messageErreur(t, 'Preparation des fichiers') }; }
      base = t.json.sha;
    }
    const msg = String(message || '').trim() || 'Mise a jour du contenu';
    const cm = await requete(c, 'POST', chemRepo(c) + '/git/commits', { message: msg.slice(0, 500), tree: base, parents: [d.commit] });
    if (cm.statut !== 201 || !cm.json || !cm.json.sha) { return { ok: false, erreur: messageErreur(cm, 'Enregistrement sur GitHub') }; }
    // Mise a jour de la branche SANS force : refusee si GitHub a avance entre-temps (rien n'est alors modifie).
    const ref = await requete(c, 'PATCH', chemRepo(c) + '/git/refs/heads/' + c.branche.split('/').map(encodeURIComponent).join('/'), { sha: cm.json.sha, force: false });
    if (ref.statut !== 200) { return { ok: false, erreur: ref.statut === 422 ? 'GitHub a change pendant l\'envoi : rien n\'a ete modifie. Relancez la comparaison puis l\'envoi.' : messageErreur(ref, 'Mise a jour de la branche') }; }
    return {
      ok: true, nbFichiers: entrees.length, commit: cm.json.sha.slice(0, 8),
      adresse: 'https://github.com/' + encodeURIComponent(c.proprietaire) + '/' + encodeURIComponent(c.depot) + '/commit/' + cm.json.sha,
      tropGros: tropGros, illisibles: illisibles
    };
  }

  return { etatConfig: etatConfig, ecrireConfig: ecrireConfig, tester: tester, comparer: comparer, envoyer: envoyer };
}

module.exports = { creerGithub: creerGithub, groupeDe: groupeDe, GROUPES: GROUPES, cheminConfigParDefaut: cheminConfigParDefaut };
