/* ============================================================
   veilleLiens.js  --  le registre des adresses (modules/comprendre-le-cadre/liens-verifies.txt) : lire, valider, modifier, supprimer, ajouter
   ------------------------------------------------------------
   Utilise par outils/veilleDepot.js (type « liens » de « Publier »). Aucune dependance. Format d'une ligne : « nom-court | adresse | AAAA-MM-JJ | portee »
   (date vide = adresse pas encore verifiee). Seules les lignes TOUCHEES sont reecrites : commentaires, lignes vides, ordre et fins de ligne du fichier
   restent exactement comme avant. Une adresse utilisee par une fiche ne se supprime pas (la fiche perdrait sa source).
   ============================================================ */
'use strict';
const fs = require('fs');
const path = require('path');

const RE_NOM = /^[a-z0-9][a-z0-9-]{0,80}$/;
const RE_DATE = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;
const PORTEES = ['national', 'region', '24', '87'];
const CHEMIN_LIENS = 'modules/comprendre-le-cadre/liens-verifies.txt';
const MAX_ACTIONS = 200;

function adresseValide(a) {
  if (typeof a !== 'string') { return false; }
  const t = a.trim();
  if (!t || t.length > 600 || /\s/.test(t) || t.indexOf('|') !== -1 || /[\u0000-\u001f]/.test(t)) { return false; }
  try { const u = new URL(t); return u.protocol === 'https:' || u.protocol === 'http:'; } catch (e) { return false; }
}

// Lit le fichier : { lignes: [{ brut, nom, adresse, date, portee } | { brut }], fin }
function analyser(texte) {
  const fin = texte.indexOf('\r\n') !== -1 ? '\r\n' : '\n';
  const lignes = texte.split(/\r?\n/).map(function (brut) {
    if (!brut.trim() || /^\s*#/.test(brut)) { return { brut: brut }; }
    const p = brut.split('|').map(function (x) { return x.trim(); });
    if (p.length !== 4) { return { brut: brut }; }
    return { brut: brut, nom: p[0], adresse: p[1], date: p[2], portee: p[3] };
  });
  return { lignes: lignes, fin: fin };
}

function formater(e) { return e.nom + ' | ' + e.adresse + ' | ' + (e.date || '') + ' | ' + e.portee; }

// Les adresses utilisees par les fiches : { nom: [id de fiche, ...] } (listes « sources: » et « structures: » de l'en-tete de chaque fiche).
function usagesDesLiens(racine) {
  const usages = {};
  const base = path.join(racine, 'modules', 'comprendre-le-cadre', 'contenu');
  let rayons = [];
  try { rayons = fs.readdirSync(base).filter(function (r) { return fs.statSync(path.join(base, r)).isDirectory(); }); } catch (e) { return usages; }
  rayons.forEach(function (r) {
    let noms = []; try { noms = fs.readdirSync(path.join(base, r)); } catch (e) { return; }
    noms.filter(function (n) { return /\.md$/.test(n) && n !== 'README.md' && !/\.collecte\.md$/.test(n); }).forEach(function (n) {
      let t = ''; try { t = fs.readFileSync(path.join(base, r, n), 'utf8'); } catch (e) { return; }
      const m = /^---\r?\n([\s\S]*?)\r?\n---/.exec(t); if (!m) { return; }
      let cle = '';
      m[1].split(/\r?\n/).forEach(function (l) {
        const k = /^([A-Za-z_]+):\s*(.*)$/.exec(l);
        if (k) { cle = k[1]; return; }
        const it = /^\s+-\s+([a-z0-9][a-z0-9-]*)\s*$/.exec(l);
        if (it && (cle === 'sources' || cle === 'structures')) { (usages[it[1]] = usages[it[1]] || []).push(n.replace(/\.md$/, '')); }
      });
    });
  });
  return usages;
}

// Liste pour l'ecran : chaque adresse avec son etat et ses usages.
function lister(texte, usages) {
  const a = analyser(texte);
  return a.lignes.filter(function (l) { return l.nom; }).map(function (l) {
    const u = (usages && usages[l.nom]) || [];
    return { nom: l.nom, adresse: l.adresse, date: l.date, portee: l.portee, nbFiches: u.length, fiches: u.slice(0, 5) };
  });
}

// Applique des actions et rend { ok, texte, resume } ou { ok:false, erreur }.
//   { op: 'valider', nom }  |  { op: 'modifier', nom, adresse, portee?, dater? }  |  { op: 'supprimer', nom }  |  { op: 'ajouter', nom, adresse, portee, dater? }
function appliquer(texte, actions, aujourdhui, usages) {
  if (!Array.isArray(actions) || !actions.length) { return { ok: false, erreur: 'Aucune modification a enregistrer.' }; }
  if (actions.length > MAX_ACTIONS) { return { ok: false, erreur: 'Trop de modifications d\'un coup (' + MAX_ACTIONS + ' au plus).' }; }
  if (!RE_DATE.test(String(aujourdhui))) { return { ok: false, erreur: 'Date du jour illisible.' }; }
  const a = analyser(texte);
  const lignes = a.lignes.slice();
  const index = function (nom) { for (let i = 0; i < lignes.length; i++) { if (lignes[i].nom === nom) { return i; } } return -1; };
  const resume = { valides: 0, modifies: 0, supprimes: 0, ajoutes: 0 };
  const aSupprimer = {};
  const dejaVu = {};
  for (const ac of actions) {
    if (!ac || typeof ac !== 'object' || !RE_NOM.test(String(ac.nom || ''))) { return { ok: false, erreur: 'Nom d\'adresse non reconnu : ' + String(ac && ac.nom).slice(0, 40) + '.' }; }
    const nom = ac.nom;
    if (dejaVu[nom]) { return { ok: false, erreur: nom + ' : deux modifications sur la meme adresse (une seule par adresse).' }; }
    dejaVu[nom] = true;
    const i = index(nom);
    if (ac.op === 'ajouter') {
      if (i !== -1) { return { ok: false, erreur: nom + ' : cette adresse existe deja (choisissez un autre nom court).' }; }
      if (!adresseValide(ac.adresse)) { return { ok: false, erreur: nom + ' : adresse non valide (elle doit commencer par https:// ou http://, sans espace ni barre verticale).' }; }
      const portee = String(ac.portee || 'national');
      if (PORTEES.indexOf(portee) === -1) { return { ok: false, erreur: nom + ' : portee inconnue (national, region, 24 ou 87).' }; }
      lignes.push({ nom: nom, adresse: String(ac.adresse).trim(), date: ac.dater ? aujourdhui : '', portee: portee, brut: null });
      resume.ajoutes++; continue;
    }
    if (i === -1) { return { ok: false, erreur: nom + ' : adresse introuvable dans le registre.' }; }
    if (ac.op === 'valider') {
      lignes[i] = { nom: nom, adresse: lignes[i].adresse, date: aujourdhui, portee: lignes[i].portee, brut: null }; resume.valides++; continue;
    }
    if (ac.op === 'modifier') {
      if (!adresseValide(ac.adresse)) { return { ok: false, erreur: nom + ' : adresse non valide (elle doit commencer par https:// ou http://, sans espace ni barre verticale).' }; }
      const portee = (ac.portee === undefined || ac.portee === null || ac.portee === '') ? lignes[i].portee : String(ac.portee);
      if (PORTEES.indexOf(portee) === -1) { return { ok: false, erreur: nom + ' : portee inconnue (national, region, 24 ou 87).' }; }
      lignes[i] = { nom: nom, adresse: String(ac.adresse).trim(), date: ac.dater === false ? '' : aujourdhui, portee: portee, brut: null }; resume.modifies++; continue;
    }
    if (ac.op === 'supprimer') {
      const u = (usages && usages[nom]) || [];
      if (u.length) { return { ok: false, erreur: nom + ' : cette adresse est utilisee par ' + u.length + ' fiche' + (u.length > 1 ? 's' : '') + ' (' + u.slice(0, 3).join(', ') + (u.length > 3 ? '...' : '') + '). Retirez-la d\'abord de ces fiches, sinon elles perdent leur source.' }; }
      aSupprimer[i] = true; resume.supprimes++; continue;
    }
    return { ok: false, erreur: nom + ' : action inconnue (« ' + String(ac.op) + ' »).' };
  }
  // Reecriture : seules les lignes touchees changent ; les nouvelles adresses s'ajoutent apres la derniere ligne d'adresse d'origine.
  const n = a.lignes.length;
  let derniereAdresse = -1;
  for (let k = 0; k < n; k++) { if (a.lignes[k].nom) { derniereAdresse = k; } }
  const ajoutees = lignes.slice(n);
  const sortie = [];
  for (let k = 0; k < n; k++) {
    if (!aSupprimer.hasOwnProperty(k)) { sortie.push(lignes[k].brut === null ? formater(lignes[k]) : a.lignes[k].brut); }
    if (k === derniereAdresse) { ajoutees.forEach(function (l) { sortie.push(formater(l)); }); }
  }
  if (derniereAdresse === -1) { ajoutees.forEach(function (l) { sortie.push(formater(l)); }); }
  return { ok: true, texte: sortie.join(a.fin), resume: resume };
}

module.exports = { analyser: analyser, lister: lister, appliquer: appliquer, usagesDesLiens: usagesDesLiens, adresseValide: adresseValide, CHEMIN_LIENS: CHEMIN_LIENS, PORTEES: PORTEES };
