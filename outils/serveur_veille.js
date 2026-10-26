/* ============================================================
   serveur_veille.js  --  petit serveur LOCAL de l'outil de veille (outils/veille.html)
   ------------------------------------------------------------
   Lance par « Lancer l'outil de veille.bat ». Aucune dependance (Node seul).
   Il est VOLONTAIREMENT tres limite :
     - il n'ecoute que sur 127.0.0.1 (cet ordinateur, jamais le reseau) ;
     - il ne sert que DEUX fichiers (veille.html et base_fiches.js) et des reponses d'API, rien d'autre : aucun autre fichier du dossier, aucun
       dossier parent, aucune liste de dossier ;
     - GET et HEAD pour les pages ; POST seulement pour /api/..., et seulement avec un JETON secret (tire au sort a chaque lancement, ecrit dans la
       page servie, donc connu de la page ouverte par le lanceur et de personne d'autre), une adresse locale, et une origine locale ;
     - il refuse toute requete dont l'adresse demandee n'est pas 127.0.0.1 ou localhost (protection contre un site web qui chercherait a lui parler) ;
     - sorties vers Internet, en LECTURE : le controle automatique des pages d'offres (/api/territoire/controler) ouvre les adresses https ECRITES
       dans modules/mon-territoire/contenu/offres.txt (jamais une adresse venue de la page) et n'ecrit rien ; le controle des cartes du sas des employeurs
       (/api/sas/controle/...) LIT en plus le texte des pages (500 Ko au plus, redirections verifiees une a une, jamais de site prive ou local), a partir des
       adresses ECRITES dans outils/sas/employeurs.sas.txt (la fenetre n'envoie que des identifiants) ; son seul fichier ecrit est outils/controles/sas_employeurs.json
       (dernier resultat, chemin fixe, ignore par Git) ;
     - lecture d'UN dossier hors depot : le pont depuis l'outil de prospection (/api/pont/...) lit, en LECTURE SEULE, trois fichiers de noms fixes dans le dossier voisin
       PROSPECTION/donnees/pont (chemin fixe calcule a partir du depot, 1 Mo au plus, aucun autre fichier de PROSPECTION, rien n'est ecrit ni supprime) ;
     - il N'ECRIT RIEN LUI-MEME et ne construit aucune commande a partir d'une requete : l'ecriture, les verifications et Git sont dans
       veilleDepot.js (« Publier ») et veilleEnvoi.js (lots pour GitHub), sur des listes fermees de destinations. JAMAIS DE PUSH.
   ============================================================ */
'use strict';
const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { spawn } = require('child_process');
const { creerDepot } = require('./veilleDepot.js');
const { creerEnvoi } = require('./veilleEnvoi.js');
const { creerGithub } = require('./veilleGithub.js');
const { creerControleSas } = require('./veilleControleSas.js');
const veilleOfficiels = require('./veilleOfficiels.js');

const DOSSIER = __dirname;
const RACINE_DEPOT = path.resolve(__dirname, '..');
const PORT_DEPART = 8791;
const TAILLE_CORPS_MAX = 6 * 1024 * 1024;
// Seuls fichiers servis : adresse demandee -> nom du fichier dans ce dossier.
const FICHIERS = {
  '/': { nom: 'veille.html', type: 'text/html; charset=utf-8' },
  '/veille.html': { nom: 'veille.html', type: 'text/html; charset=utf-8' },
  '/base_fiches.js': { nom: 'base_fiches.js', type: 'text/javascript; charset=utf-8' }
};
const HOTE_AUTORISE = /^(127\.0\.0\.1|localhost)(:\d{1,5})?$/i;
const ORIGINE_AUTORISEE = /^http:\/\/(127\.0\.0\.1|localhost)(:\d{1,5})?$/i;

function repondre(res, code, type, corps, extra) {
  const entetes = Object.assign({
    'Content-Type': type,
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'no-referrer'
  }, extra || {});
  res.writeHead(code, entetes);
  res.end(corps);
}
function json(res, code, objet) { repondre(res, code, 'application/json; charset=utf-8', JSON.stringify(objet)); }

// Ouvre une adresse web ou un dossier dans Windows (arguments fixes, jamais une valeur venue d'une requete : l'appelant ne passe que l'adresse du
// serveur ou le dossier de sortie du depot).
function ouvrirParDefaut(cible) {
  try { spawn('cmd.exe', ['/c', 'start', '', cible], { detached: true, stdio: 'ignore' }).unref(); } catch (e) { /* on affiche l'adresse : ouvrez-la a la main */ }
}

function jetonValide(attendu, recu) {
  const a = Buffer.from(String(attendu)), b = Buffer.from(String(recu || ''));
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

function lireCorps(req, rappel) {
  const morceaux = []; let total = 0, fini = false;
  req.on('data', function (c) {
    if (fini) { return; }
    total += c.length;
    if (total > TAILLE_CORPS_MAX) { fini = true; rappel({ trop: true }); req.destroy(); return; }
    morceaux.push(c);
  });
  req.on('end', function () { if (fini) { return; } fini = true; rappel(null, Buffer.concat(morceaux).toString('utf8')); });
  req.on('error', function () { if (!fini) { fini = true; rappel({ erreur: true }); } });
}

function creerServeur(options) {
  const opt = options || {};
  const racine = opt.racine || RACINE_DEPOT;
  const depot = opt.depot || creerDepot(racine);
  const envoi = opt.envoi || creerEnvoi(racine);
  const github = opt.github || creerGithub(racine);
  const controleSas = opt.controleSas || creerControleSas(racine, depot, { fetch: opt.fetchControle, resoudre: opt.resoudreControle });
  const ouvrir = opt.ouvrir || ouvrirParDefaut;
  const jeton = opt.jeton || crypto.randomBytes(24).toString('hex');

  // Rend la valeur (ou la promesse) du module au navigateur ; une erreur interne devient une reponse 500 propre.
  function repondreResultat(res, valeur) {
    Promise.resolve(valeur).then(function (r) { json(res, 200, r); }, function (e) { json(res, 500, { ok: false, erreur: 'Erreur interne : ' + (e && e.message) }); });
  }
  function api(req, res, chemin, donnees) {
    switch (chemin) {
      case '/api/publier': return repondreResultat(res, depot.publier(donnees && donnees.fichiers, { remplacerExistants: !!(donnees && donnees.remplacerExistants) }));
      case '/api/liens/lister': return repondreResultat(res, depot.listerLiens());
      case '/api/territoire/lister': return repondreResultat(res, depot.listerTerritoire(donnees && donnees.fichier));
      case '/api/territoire/controler': return repondreResultat(res, depot.controlerTerritoire(donnees && donnees.fichier));
      case '/api/sas/analyser': return repondreResultat(res, depot.analyserLot(donnees && donnees.fichier, donnees && donnees.texte));
      case '/api/sas/lister': return repondreResultat(res, depot.listerSas(donnees && donnees.fichier));
      // Le pont depuis l'outil de prospection : lecture seule d'un fichier a chemin fixe (veillePont.js), sans les lignes que la veille connait deja.
      case '/api/pont/etat': return repondreResultat(res, depot.etatPont());
      case '/api/pont/lire': return repondreResultat(res, depot.lirePont(donnees && donnees.fichier));
      // Contrôle automatique des cartes du sas des employeurs : la fenêtre n'envoie que des identifiants de cartes ; les adresses viennent des fichiers du sas.
      case '/api/sas/controle/demarrer': return repondreResultat(res, controleSas.demarrer(Object.assign({}, donnees, { genre: 'sas' })));
      case '/api/sas/controle/etat': return repondreResultat(res, controleSas.etat(Object.assign({}, donnees, { genre: 'sas' })));
      // Revérification des fiches PUBLIÉES (même contrôle, mêmes preuves, comparaison avec le dernier contrôle) : lecture seule, rien n'est modifié ni daté.
      case '/api/registre/controle/demarrer': return repondreResultat(res, controleSas.demarrer(Object.assign({}, donnees, { genre: 'registre' })));
      case '/api/registre/controle/etat': return repondreResultat(res, controleSas.etat(Object.assign({}, donnees, { genre: 'registre' })));
      // Magasins officiels d'une enseigne (fichier local ecrit par Claude apres lecture des pages officielles) : lecture seule, rien n'est ecrit.
      case '/api/sas/officiels': return repondreResultat(res, opt.officiels ? opt.officiels() : veilleOfficiels.lire(racine));
      case '/api/fiches/lister': return repondreResultat(res, depot.listerFiches());
      // Le Lexique (data/lexique.js lu comme du texte) : la liste des mots, et les controles d'un mot pendant la saisie. Lecture seule : l'ecriture passe par /api/publier.
      case '/api/lexique/lister': return repondreResultat(res, depot.listerMots());
      case '/api/lexique/verifier': return repondreResultat(res, depot.verifierMotLexique(donnees));
      case '/api/lexique/liste': return repondreResultat(res, depot.listerListe());
      case '/api/lexique/idees': return repondreResultat(res, depot.idees());
      case '/api/lexique/chercher': return repondreResultat(res, depot.chercherMot(donnees));
      case '/api/lexique/verification-prompt': return repondreResultat(res, depot.promptVerificationChiffres(donnees));
      case '/api/lexique/verification-lire': return repondreResultat(res, depot.lireVerificationChiffres(donnees));
      case '/api/lexique/recherches': return repondreResultat(res, depot.recherchesSansResultat(donnees));
      case '/api/lexique/proposer': return repondreResultat(res, depot.proposerMot(donnees));
      case '/api/fiches/historique': return repondreResultat(res, depot.listerHistorique());
      case '/api/chiffres/lister': return repondreResultat(res, depot.listerChiffres());
      case '/api/chiffres/verifier': return repondreResultat(res, depot.verifierChiffres(donnees && donnees.fichier, donnees && donnees.demande));
      case '/api/chiffres/lire': return repondreResultat(res, depot.lireChiffres(donnees && donnees.fichier));
      case '/api/fiches/lire': return repondreResultat(res, depot.lireFiche(donnees && donnees.rayon, donnees && donnees.id));
      case '/api/changements/lister': return repondreResultat(res, depot.listerChangements());
      case '/api/changements/prompt': return repondreResultat(res, depot.promptChangement(donnees));
      case '/api/changements/lire': return repondreResultat(res, depot.lireReponseChangement(donnees));
      case '/api/annuler': return repondreResultat(res, depot.annuler());
      case '/api/depot/reprendre': return repondreResultat(res, depot.reprendre(donnees && donnees.action));
      case '/api/depot/etat': return repondreResultat(res, Object.assign({ ok: true }, depot.etat()));
      case '/api/envoi/etat': return repondreResultat(res, envoi.etat(donnees && donnees.depuis));
      case '/api/envoi/preparer': return repondreResultat(res, envoi.preparer(donnees && donnees.depuis));
      case '/api/envoi/marquer': return repondreResultat(res, envoi.marquerEnvoye());
      case '/api/envoi/ouvrir': ouvrir(envoi.dossier()); return json(res, 200, { ok: true });
      // Envoi direct sur GitHub : le jeton entre par /api/github/config et ne ressort JAMAIS (seulement ses 4 derniers caracteres).
      case '/api/github/etat': return repondreResultat(res, github.etatConfig());
      case '/api/github/config': return repondreResultat(res, github.ecrireConfig(donnees));
      case '/api/github/tester': return repondreResultat(res, github.tester());
      case '/api/github/comparer': return repondreResultat(res, github.comparer(donnees && donnees.groupes));
      case '/api/github/envoyer': return repondreResultat(res, github.envoyer(donnees && donnees.groupes, donnees && donnees.message, !!(donnees && donnees.confirmerTerritoire)));
      default: return json(res, 404, { ok: false, erreur: 'Introuvable.' });
    }
  }

  function gestionnaire(req, res) {
    if (!HOTE_AUTORISE.test(String(req.headers.host || ''))) {
      return repondre(res, 403, 'text/plain; charset=utf-8', 'Adresse refusee.');
    }
    const chemin = String(req.url || '/').split('?')[0].split('#')[0];
    if (req.method === 'POST') {
      if (chemin.indexOf('/api/') !== 0) { return repondre(res, 405, 'text/plain; charset=utf-8', 'Methode non autorisee.', { Allow: 'GET, HEAD' }); }
      const origine = req.headers.origin;
      if (origine !== undefined && !ORIGINE_AUTORISEE.test(String(origine))) { return json(res, 403, { ok: false, erreur: 'Origine refusee.' }); }
      if (!jetonValide(jeton, req.headers['x-veille-jeton'])) { return json(res, 403, { ok: false, erreur: 'Jeton absent ou invalide : rechargez la page depuis le lanceur.' }); }
      if (!/^application\/json(\s*;|$)/i.test(String(req.headers['content-type'] || ''))) { return json(res, 415, { ok: false, erreur: 'Format attendu : JSON.' }); }
      return lireCorps(req, function (erreur, texte) {
        if (erreur) { return json(res, erreur.trop ? 413 : 400, { ok: false, erreur: erreur.trop ? 'Envoi trop volumineux.' : 'Requete illisible.' }); }
        let donnees = {};
        if (texte.trim()) { try { donnees = JSON.parse(texte); } catch (e) { return json(res, 400, { ok: false, erreur: 'JSON invalide.' }); } }
        try { api(req, res, chemin, donnees); } catch (e) { json(res, 500, { ok: false, erreur: 'Erreur interne : ' + (e && e.message) }); }
      });
    }
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      return repondre(res, 405, 'text/plain; charset=utf-8', 'Methode non autorisee.', { Allow: 'GET, HEAD' });
    }
    // Seul le chemin compte : la requete (apres « ? ») est ignoree, aucune partie de l'adresse n'est jamais utilisee pour construire un chemin de fichier.
    if (chemin === '/api/etat') {
      return json(res, 200, { serveur: true, version: 2 });
    }
    const f = Object.prototype.hasOwnProperty.call(FICHIERS, chemin) ? FICHIERS[chemin] : null;
    if (!f) { return repondre(res, 404, 'text/plain; charset=utf-8', 'Introuvable.'); }
    fs.readFile(path.join(DOSSIER, f.nom), function (erreur, contenu) {
      if (erreur) { return repondre(res, 500, 'text/plain; charset=utf-8', 'Fichier illisible : ' + f.nom); }
      let corps = contenu;
      if (f.nom === 'veille.html') {
        // Le jeton est ecrit dans la page : seule la page servie par ce serveur le connait (un autre site ne peut pas la lire).
        corps = Buffer.from(contenu.toString('utf8').replace('<head>', '<head><meta name="veille-jeton" content="' + jeton + '">'), 'utf8');
      }
      repondre(res, 200, f.type, req.method === 'HEAD' ? '' : corps);
    });
  }

  const serveur = http.createServer(gestionnaire);
  serveur.jetonDeLancement = jeton;
  return serveur;
}

// Ecoute sur 127.0.0.1 seulement ; si le port est pris, essaie les suivants (10 essais au plus). port 0 = port libre choisi par le systeme (essais).
function demarrer(port, rappel, essaisRestants, options) {
  const serveur = creerServeur(options);
  const restants = (essaisRestants === undefined) ? 10 : essaisRestants;
  serveur.once('error', function (erreur) {
    if (erreur && erreur.code === 'EADDRINUSE' && restants > 0 && port !== 0) { demarrer(port + 1, rappel, restants - 1, options); } else { rappel(erreur); }
  });
  serveur.listen(port, '127.0.0.1', function () { rappel(null, serveur); });
}

if (require.main === module) {
  demarrer(PORT_DEPART, function (erreur, serveur) {
    if (erreur) {
      console.log('');
      console.log('Impossible de demarrer le serveur local : ' + (erreur.message || erreur));
      console.log('Fermez cette fenetre et reessayez. Si cela recommence, prevenez Claude.');
      process.exit(1);
    }
    const adresse = 'http://127.0.0.1:' + serveur.address().port + '/veille.html';
    console.log('');
    console.log('L\'outil de veille est lance sur cet ordinateur.');
    console.log('Adresse : ' + adresse);
    console.log('');
    console.log('Il s\'ouvre dans votre navigateur. Pour l\'arreter, fermez cette fenetre.');
    ouvrirParDefaut(adresse);
  });
}

module.exports = { creerServeur: creerServeur, demarrer: demarrer, FICHIERS: FICHIERS };
