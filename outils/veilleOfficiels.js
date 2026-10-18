/* ============================================================
   veilleOfficiels.js  --  les magasins OFFICIELS d'une enseigne, lus sur le site de l'enseigne (outil de veille, poste de Denis)
   ------------------------------------------------------------
   Le fichier outils/controles/magasins_officiels.json (local, ignoré par Git, chemin fixe) est écrit par Claude après lecture des pages officielles d'une
   enseigne avec un vrai navigateur : pour chaque magasin, son adresse, son numéro et l'adresse de la page où il a été lu. Ce module le LIT, le valide
   (jamais de confiance aveugle : textes bornés, adresses https, aucun séparateur du registre dans une adresse) et rapproche chaque commune du nom que
   l'application connaît. Il n'écrit rien, ne date rien : c'est l'outil (carte du sas) qui propose « Ajouter », « Retirer », et Denis qui décide.
   Aucune dépendance (Node seul).
   ============================================================ */
'use strict';
const fs = require('fs');
const path = require('path');

const CHEMIN = ['outils', 'controles', 'magasins_officiels.json'];
const MOTS_VIDES = ['de', 'du', 'des', 'la', 'le', 'les', 'sur', 'sous', 'en', 'l', 'd', 'et', 'aux', 'au'];

// Clé de rapprochement d'un nom de commune : « ST MEDARD DE MUSSIDAN » et « Saint-Médard-de-Mussidan » donnent la même clé.
function cleCommune(nom) {
  const mots = String(nom || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, ' ').trim().split(' ')
    .map(function (m) { return m === 'st' ? 'saint' : (m === 'ste' ? 'sainte' : m); })
    .filter(function (m) { return m && MOTS_VIDES.indexOf(m) === -1; });
  return mots.join(' ');
}

function texte(v, max) { return String(v === undefined || v === null ? '' : v).replace(/[\r\n|;:]+/g, ' ').replace(/\s+/g, ' ').trim().slice(0, max || 120); }
function adresseHttps(v) { const s = String(v || '').trim(); return /^https:\/\/[^\s"<>]{3,300}$/.test(s) ? s : ''; }
// Un numéro français bien formé en 05 53 00 00 00, ou '' s'il n'a pas 10 chiffres.
function numero(v) { const d = String(v || '').replace(/\D/g, ''); return /^0[1-9]\d{8}$/.test(d) ? d.replace(/(\d{2})(?=\d)/g, '$1 ') : ''; }

// Les communes de l'application avec leurs codes postaux : [{ nom, cps: ['24380', ...] }], lues dans modules/mon-territoire/contenu/communes-*.txt (code | nom | codes postaux | ...).
function communesDuDepot(racine) {
  const dossier = path.resolve(racine, 'modules', 'mon-territoire', 'contenu'), sortie = [];
  try {
    fs.readdirSync(dossier).filter(function (f) { return /^communes-\d+[a-z]?\.txt$/.test(f); }).forEach(function (f) {
      fs.readFileSync(path.join(dossier, f), 'utf8').split(/\r?\n/).forEach(function (l) {
        if (!l.trim() || l.charAt(0) === '#') { return; }
        const c = l.split('|').map(function (x) { return x.trim(); });
        if (c[1]) { sortie.push({ nom: c[1], cps: String(c[2] || '').split(/\s+/).filter(Boolean) }); }
      });
    });
  } catch (e) { /* pas de communes : aucun rapprochement */ }
  return sortie;
}
// Le nom de commune de l'application pour un nom officiel : même clé ; à défaut, une commune dont le nom est contenu dans le nom officiel ET dont un code postal correspond
// (« NOTRE DAME DE SANILHAC », 24660 -> « Sanilhac », qui porte ce code postal) ; jamais autrement.
function rapprocher(commune, cp, communes, parCle) {
  const cle = cleCommune(commune);
  if (parCle[cle]) { return parCle[cle]; }
  let meilleur = '';
  communes.forEach(function (c) {
    const k = cleCommune(c.nom);
    if (k && (' ' + cle + ' ').indexOf(' ' + k + ' ') !== -1 && cp && c.cps.indexOf(cp) !== -1 && k.length > cleCommune(meilleur).length) { meilleur = c.nom; }
  });
  return meilleur;
}

// racine : racine du dépôt ; communes : [{ nom, cps }] connues de l'application (sinon lues dans les fichiers de communes du dépôt).
function lire(racine, communes) {
  let brut;
  try { brut = JSON.parse(fs.readFileSync(path.resolve(racine, ...CHEMIN), 'utf8')); } catch (e) { return { ok: true, enseignes: [], note: 'Aucun magasin officiel lu pour l\'instant.' }; }
  if (!brut || !Array.isArray(brut.enseignes)) { return { ok: false, erreur: 'Fichier des magasins officiels illisible.' }; }
  const liste = communes || communesDuDepot(racine);
  const parCle = {}; liste.forEach(function (c) { parCle[cleCommune(c.nom)] = c.nom; });
  const enseignes = [];
  brut.enseignes.forEach(function (e) {
    if (!e || !/^\d{2,3}[a-z]?$/.test(String(e.departement || '')) || !Array.isArray(e.marques) || !Array.isArray(e.magasins)) { return; }
    const magasins = [];
    e.magasins.forEach(function (m) {
      if (!m || !texte(m.nom) || !texte(m.commune)) { return; }
      const cle = cleCommune(m.commune);
      magasins.push({
        nom: texte(m.nom), marque: texte(m.marque, 40), adresse: texte(m.adresse), cp: /^\d{5}$/.test(String(m.cp || '')) ? String(m.cp) : '', commune: texte(m.commune), cle: cle, communeApp: rapprocher(m.commune, /^\d{5}$/.test(String(m.cp || '')) ? String(m.cp) : '', liste, parCle),
        tel: numero(m.tel), telBrut: texte(m.tel, 30), url: adresseHttps(m.url), aVerifier: texte(m.a_verifier, 200)
      });
    });
    enseignes.push({
      famille: texte(e.famille, 40), marques: e.marques.map(function (x) { return texte(x, 40); }).filter(Boolean), departement: String(e.departement),
      sourceAnnuaire: adresseHttps(e.source_annuaire), luLe: /^\d{4}-\d{2}-\d{2}$/.test(String(e.lu_le || '')) ? String(e.lu_le) : '', listeComplete: e.liste_complete === true, magasins: magasins
    });
  });
  return { ok: true, enseignes: enseignes, note: texte(brut.note, 400) };
}

module.exports = { lire: lire, cleCommune: cleCommune, numero: numero, rapprocher: rapprocher, communesDuDepot: communesDuDepot, CHEMIN: CHEMIN };
