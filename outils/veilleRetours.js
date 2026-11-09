/* ============================================================
   veilleRetours.js  --  les réponses des assistants collées dans l'onglet « Travailler avec Claude » (poste de Denis)
   ------------------------------------------------------------
   Le deuxième chemin de l'outil de veille (décision de Denis, 2026-11-01) : Denis fait chercher les informations sur Internet par ChatGPT ou Perplexity,
   colle chaque réponse dans l'onglet, puis demande à Claude de les comparer aux fiches. Pour que Claude les retrouve sans qu'elles passent par la
   conversation (coût), chaque réponse est écrite dans un fichier : outils/retours/AAAA-MM-JJ/<identifiant>.md, avec un sommaire _index.md.
   Dossier privé : ignoré par Git (jamais envoyé). Le jour est celui de l'ordinateur (jamais celui de la page). Une réponse vide efface le fichier.
   Rien d'autre n'est écrit ni lu ailleurs : identifiants et textes validés, tailles bornées.
   ============================================================ */
'use strict';
const fs = require('fs');
const path = require('path');

const RE_ID = /^[a-z0-9][a-z0-9-]{0,59}$/;
const TAILLE_REPONSE_MAX = 400 * 1024;
const FICHIERS_MAX = 80;
const QUALITES = ['ok', 'attention', 'inutilisable'];
// Les propositions de Claude (lot 4a, puis 4b) : seulement ces noms de fichier, dans outils/retours/<jour>/propositions/.
// chiffres.md, reseau.md, lexique.md (lot 4b), portrait.md et ue.md (lot 4c) sont le texte à mettre dans l'écran existant correspondant.
const RE_PROPOSITION = /^(balayage\.json|fiches-(?:hebdo|mois-[0-9]{1,2}|rayon-[a-z0-9-]{1,40})\.md|chiffres\.md|reseau\.md|lexique\.md|portrait\.md|ue\.md)$/;
function typeDeProposition(nom) { return /\.json$/.test(nom) ? 'changements' : /^fiches-/.test(nom) ? 'fiches' : 'ecran'; }
const COLONNES_CHANGEMENT = ['mois', 'periode', 'domaine', 'intitule', 'nature', 'en_vigueur', 'concerne', 'ce_qui_change', 'source_titre', 'source_url'];
const LIGNES_PROPOSITION_MAX = 200;
const RE_JOUR = /^\d{4}-\d{2}-\d{2}$/;
const JOURS_CONSERVES = 90;

function jourLocal(d) { const p = (n) => (n < 10 ? '0' : '') + n; return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate()); }
function heureLocale(d) { const p = (n) => (n < 10 ? '0' : '') + n; return p(d.getHours()) + ':' + p(d.getMinutes()); }
// Une ligne de texte : sans retour à la ligne, sans le séparateur du sommaire, bornée.
function ligne(s, max) { return String(s == null ? '' : s).replace(/[\r\n]+/g, ' ').replace(/\s*\|\s*/g, ' / ').replace(/\s+/g, ' ').trim().slice(0, max || 200); }

function creerRetours(racine, opt) {
  const o = opt || {};
  const maintenant = function () { return o.maintenant ? o.maintenant() : new Date(); };
  const base = path.join(racine, 'outils', 'retours');
  const dossierDuJour = function () { return path.join(base, jourLocal(maintenant())); };

  // Lit l'en-tête d'un fichier de réponse : { id, titre, categorie, rubrique, le, qualite, motif, taille }.
  function enteteDe(fichier, id) {
    let t = '';
    try { t = fs.readFileSync(fichier, 'utf8'); } catch (e) { return null; }
    const val = function (cle) { const m = new RegExp('^' + cle + ' : (.*)$', 'm').exec(t); return m ? m[1].trim() : ''; };
    const i = t.indexOf('\n---\n');
    return { id: id, titre: val('titre'), categorie: val('categorie'), rubrique: val('rubrique'), le: val('enregistre'), qualite: QUALITES.indexOf(val('qualite')) >= 0 ? val('qualite') : 'ok', motif: val('motif'), taille: i < 0 ? t.length : t.length - i - 5 };
  }
  function entrees(dossier) {
    const d = dossier || dossierDuJour();
    if (!fs.existsSync(d)) { return []; }
    return fs.readdirSync(d).filter(function (n) { return /\.md$/.test(n) && n !== '_index.md' && RE_ID.test(n.slice(0, -3)); }).sort()
      .map(function (n) { return enteteDe(path.join(d, n), n.slice(0, -3)); }).filter(Boolean);
  }
  function ecrireIndex(dossier) {
    const d = dossier || dossierDuJour(), l = entrees(d);
    const txt = '# Réponses des assistants du ' + path.basename(d) + '\n\n'
      + 'Une ligne par réponse : identifiant | catégorie | rubrique | titre | enregistrée à | qualité (ok, attention ou inutilisable : une réponse inutilisable ne se lit pas). Le texte est dans le fichier <identifiant>.md.\n\n'
      + l.map(function (e) { return '- ' + e.id + ' | ' + e.categorie + ' | ' + e.rubrique + ' | ' + e.titre + ' | ' + e.le + ' | ' + e.qualite + (e.motif ? ' (' + e.motif + ')' : ''); }).join('\n') + '\n';
    fs.writeFileSync(path.join(d, '_index.md.tmp'), txt, 'utf8');
    fs.renameSync(path.join(d, '_index.md.tmp'), path.join(d, '_index.md'));
  }

  // donnees : { id, titre, categorie, rubrique, reponse, qualite, motif } ; la qualité est estimée par la page, toute valeur inconnue vaut « ok ». Une réponse vide efface le fichier.
  function enregistrer(donnees) {
    const dn = donnees || {}, id = String(dn.id || '');
    if (!RE_ID.test(id)) { return { ok: false, erreur: 'Identifiant de réponse non valide.' }; }
    debutReport();
    const reponse = typeof dn.reponse === 'string' ? dn.reponse : '';
    if (reponse.length > TAILLE_REPONSE_MAX) { return { ok: false, erreur: 'Cette réponse est trop longue (400 Ko au plus).' }; }
    const d = dossierDuJour(), f = path.join(d, id + '.md');
    try {
      if (!reponse.trim()) {
        if (fs.existsSync(f)) { fs.unlinkSync(f); ecrireIndex(); }
        return { ok: true, effacee: true, retours: entrees() };
      }
      fs.mkdirSync(d, { recursive: true });
      if (!fs.existsSync(f) && entrees().length >= FICHIERS_MAX) { return { ok: false, erreur: 'Trop de réponses pour une seule journée (80 au plus).' }; }
      const en = 'titre : ' + ligne(dn.titre) + '\ncategorie : ' + ligne(dn.categorie, 80) + '\nrubrique : ' + ligne(dn.rubrique) + '\nenregistre : ' + jourLocal(maintenant()) + ' à ' + heureLocale(maintenant()) + '\nqualite : ' + (QUALITES.indexOf(dn.qualite) >= 0 ? dn.qualite : 'ok') + '\nmotif : ' + ligne(dn.motif, 160) + '\n';
      fs.writeFileSync(f + '.tmp', en + '---\n' + reponse.replace(/\r\n/g, '\n'), 'utf8');
      fs.renameSync(f + '.tmp', f);
      ecrireIndex();
    } catch (e) { return { ok: false, erreur: 'Impossible d\'enregistrer la réponse : ' + (e && e.message) }; }
    return { ok: true, retours: entrees() };
  }

  // Les réponses ne se perdent pas d'un jour à l'autre (demande de Denis, 09/11/2026 : « je ramasse les informations pendant 3 jours, puis je donne tout à Claude ») :
  // celles des jours précédents sont DÉPLACÉES dans le dossier du jour (une seule copie, jamais de doublon), avec leur en-tête d'origine (date d'enregistrement).
  // Si le dossier du jour contient déjà la même réponse, c'est la plus récente : l'ancienne copie, périmée, est supprimée. Rien n'est repris après JOURS_CONSERVES jours.
  // Seuls les jours à partir de la mise en service du report sont repris : les réponses des jours d'avant ont déjà été traitées par Claude, elles ne reviennent pas se mêler au travail en cours.
  // La date de mise en service est écrite une fois pour toutes dans outils/retours/_report_depuis.txt (au premier enregistrement ou au premier report).
  function debutReport() {
    const f = path.join(base, '_report_depuis.txt');
    try {
      const t = fs.readFileSync(f, 'utf8').trim();
      if (RE_JOUR.test(t)) { return t; }
    } catch (e) { /* pas encore écrit */ }
    const j = jourLocal(maintenant());
    try { fs.mkdirSync(base, { recursive: true }); fs.writeFileSync(f, j + '\n', 'utf8'); } catch (e) { /* tant pis */ }
    return j;
  }
  function reporter() {
    if (!fs.existsSync(base)) { return 0; }
    const aujourdhui = jourLocal(maintenant()), d = dossierDuJour(), depuis = debutReport();
    const limite = [depuis, jourLocal(new Date(maintenant().getTime() - JOURS_CONSERVES * 86400000))].sort().reverse()[0];
    let n = 0;
    fs.readdirSync(base).filter(function (j) { return RE_JOUR.test(j) && j < aujourdhui && j >= limite; }).sort().reverse().forEach(function (j) {
      const dj = path.join(base, j);
      const noms = entrees(dj).map(function (e) { return e.id; });
      noms.forEach(function (id) {
        const source = path.join(dj, id + '.md'), cible = path.join(d, id + '.md');
        try {
          if (fs.existsSync(cible)) { fs.unlinkSync(source); return; }
          fs.mkdirSync(d, { recursive: true });
          fs.renameSync(source, cible);
          n++;
        } catch (e) { /* tant pis : la réponse reste dans son dossier d'origine, rien n'est perdu */ }
      });
      if (noms.length) { try { ecrireIndex(dj); } catch (e) { /* tant pis */ } }
    });
    if (n) { try { ecrireIndex(); } catch (e) { /* tant pis */ } }
    return n;
  }
  // Une fois les réponses traitées par Claude : elles sont mises de côté (outils/retours/_traitees/<jour>/), jamais supprimées, et ne reviennent plus dans l'onglet.
  function archiver() {
    try {
      reporter();
      const d = dossierDuJour(), l = entrees();
      if (!l.length) { return { ok: true, archivees: 0, retours: [] }; }
      const dest = path.join(base, '_traitees', jourLocal(maintenant()) + '-' + heureLocale(maintenant()).replace(':', 'h'));
      fs.mkdirSync(dest, { recursive: true });
      l.forEach(function (e) { fs.renameSync(path.join(d, e.id + '.md'), path.join(dest, e.id + '.md')); });
      ecrireIndex();
      return { ok: true, archivees: l.length, dossier: 'outils/retours/_traitees/' + path.basename(dest), retours: entrees() };
    } catch (e) { return { ok: false, erreur: 'Impossible de mettre les réponses de côté : ' + (e && e.message) }; }
  }

  // Ce qui est enregistré (aujourd'hui, et ce qui venait des jours précédents), avec le texte (la page se remet ainsi d'un rechargement).
  function lister() {
    let reportees = 0;
    try { reportees = reporter(); } catch (e) { /* tant pis */ }
    const jour = jourLocal(maintenant()), d = dossierDuJour();
    const l = entrees().map(function (e) {
      let reponse = '';
      try { const t = fs.readFileSync(path.join(d, e.id + '.md'), 'utf8'), i = t.indexOf('\n---\n'); reponse = i < 0 ? t : t.slice(i + 5); } catch (x) { /* tant pis */ }
      return Object.assign({}, e, { reponse: reponse });
    });
    return { ok: true, jour: jour, dossier: 'outils/retours/' + jour, retours: l, reportees: reportees };
  }

  // Ce que Claude a préparé aujourd'hui, en LECTURE SEULE : balayage.json (lignes du sas des changements), fiches-<cible>.md (blocs [FICHE] et [RETRAIT],
  // lus ensuite par le lecteur existant du sas des fiches) et chiffres.md / reseau.md / lexique.md (texte à mettre dans l'écran existant, type « ecran »). Rien n'est écrit ici ; le versement passe par les routes qui existent déjà.
  function propositions() {
    const jour = jourLocal(maintenant()), d = path.join(dossierDuJour(), 'propositions'), sortie = [];
    if (fs.existsSync(d)) {
      fs.readdirSync(d).filter(function (n) { return RE_PROPOSITION.test(n); }).sort().forEach(function (n) {
        const id = n.replace(/\.(json|md)$/, '');
        let t = '';
        try {
          if (fs.statSync(path.join(d, n)).size > TAILLE_REPONSE_MAX) { sortie.push({ id: id, type: typeDeProposition(n), erreur: 'Fichier trop gros.' }); return; }
          t = fs.readFileSync(path.join(d, n), 'utf8').replace(/\r\n/g, '\n');
        } catch (e) { sortie.push({ id: id, type: typeDeProposition(n), erreur: 'Fichier illisible.' }); return; }
        if (/\.json$/.test(n)) {
          try {
            const o = JSON.parse(t), liste = Array.isArray(o) ? o : (o && o.lignes);
            if (!Array.isArray(liste)) { throw new Error('liste absente'); }
            const lignes = liste.slice(0, LIGNES_PROPOSITION_MAX).filter(function (x) { return x && typeof x === 'object'; }).map(function (x) {
              const v = {}; COLONNES_CHANGEMENT.forEach(function (k) { v[k] = typeof x[k] === 'string' ? x[k].slice(0, 2000) : ''; }); return v;
            });
            sortie.push({ id: id, type: 'changements', lignes: lignes });
          } catch (e) { sortie.push({ id: id, type: 'changements', erreur: 'Fichier de propositions illisible (' + (e && e.message) + ').' }); }
        } else { sortie.push({ id: id, type: typeDeProposition(n), texte: t }); }
      });
    }
    return { ok: true, jour: jour, dossier: 'outils/retours/' + jour + '/propositions', propositions: sortie };
  }

  return { enregistrer: enregistrer, lister: lister, archiver: archiver, propositions: propositions, dossierDuJour: dossierDuJour };
}

module.exports = { creerRetours, RE_ID };
