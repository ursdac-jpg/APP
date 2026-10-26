/* ============================================================
   veillePont.js  --  le « pont » : lecture, SEULE et en lecture seule, des lignes que l'outil de prospection a deposees pour l'outil de veille
   ------------------------------------------------------------
   Pourquoi : la prospection fait le reperage, la veille ne fait que les verifications et la mise en ligne. Au lieu de copier-coller des lignes d'un outil a l'autre,
   la prospection depose un petit fichier JSON par destination (PROSPECTION/donnees/pont/*.json, dossier VOISIN de ce depot, dans le meme OneDrive) et un bouton de la zone
   de collage du sas le lit. Les lignes lues passent ensuite par EXACTEMENT les memes controles qu'un texte colle (veilleSas.analyserLot).
   Garde-fous : chemin FIXE (jamais une valeur venue d'une requete), trois noms de fichier fixes, 1 Mo au plus, lecture seule (rien n'est ecrit, rien n'est supprime),
   aucun acces a un autre fichier de PROSPECTION (ni le carnet, ni les listes importees).
   ============================================================ */
'use strict';
const fs = require('fs');
const path = require('path');

const FICHIERS = { employeurs: 'employeurs.json', offres: 'offres.json', lieux: 'lieux.json' };
const TAILLE_MAX = 1024 * 1024;
const LIGNES_MAX = 500;
const CARACTERES_MAX = 1200;

function dossierDuPont(racine) { return path.resolve(racine, '..', 'PROSPECTION', 'donnees', 'pont'); }

function creerPont(racine, options) {
  const dossier = (options && options.dossier) || dossierDuPont(racine);
  // Rend { ok:true, deposeLe, lignes } ou { ok:false, absent?:true, erreur }.
  function lire(fichier) {
    const f = String(fichier || '');
    if (!Object.prototype.hasOwnProperty.call(FICHIERS, f)) { return { ok: false, erreur: 'Destination inconnue.' }; }
    const chemin = path.join(dossier, FICHIERS[f]);
    let stat;
    try { stat = fs.statSync(chemin); } catch (e) { return { ok: false, absent: true, erreur: 'Aucun fichier de la prospection pour ce choix.' }; }
    if (!stat.isFile()) { return { ok: false, absent: true, erreur: 'Aucun fichier de la prospection pour ce choix.' }; }
    if (stat.size > TAILLE_MAX) { return { ok: false, erreur: 'Le fichier de la prospection est trop gros (1 Mo au plus).' }; }
    let objet;
    try { objet = JSON.parse(fs.readFileSync(chemin, 'utf8')); } catch (e) { return { ok: false, erreur: 'Le fichier de la prospection est abîmé : redéposez les lignes depuis l\'outil de prospection.' }; }
    if (!objet || objet.fichier !== f || !Array.isArray(objet.lignes)) { return { ok: false, erreur: 'Le fichier de la prospection n\'a pas le bon format.' }; }
    const lignes = objet.lignes.filter(function (l) { return typeof l === 'string' && l.length > 0 && l.length <= CARACTERES_MAX && l.indexOf('\n') === -1; }).slice(0, LIGNES_MAX);
    return { ok: true, deposeLe: typeof objet.deposeLe === 'string' ? objet.deposeLe : '', lignes: lignes };
  }
  // Quels fichiers existent (pour n'afficher le bouton que lorsqu'il y a quelque chose a importer) : rend { employeurs: true|false, ... }.
  function presents() {
    const o = {};
    Object.keys(FICHIERS).forEach(function (f) { const r = lire(f); o[f] = r.ok && r.lignes.length > 0; });
    return o;
  }
  return { lire: lire, presents: presents, dossier: dossier };
}

module.exports = { creerPont: creerPont, FICHIERS: FICHIERS, TAILLE_MAX: TAILLE_MAX, LIGNES_MAX: LIGNES_MAX, dossierDuPont: dossierDuPont };
