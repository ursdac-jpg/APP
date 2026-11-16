/* ============================================================
   veilleTaches.js  --  les tâches programmées de l'outil de veille (poste de Denis)
   ------------------------------------------------------------
   Décision de Denis (2026-11-10, consigne 233) : des tâches qui dépendent d'une DATE (publication d'un chiffre, d'un décret...) ou à REPRENDRE plus tard
   (exemple : « Reprendre à la deuxième étape » quand l'Insee répond de nouveau). À la date, la tâche passe en « À faire » : l'outil rappelle, donne le contexte
   et prépare le prompt à coller dans le cloud (ou la phrase de reprise à coller dans une fenêtre de travail avec Claude).
   Un seul fichier, outils/taches_programmees.json, suivi par Git (il survit au changement de poste et à la passation entre comptes) ; L'APPLICATION NE LE LIT JAMAIS.
   Rien d'autre n'est écrit. Écriture atomique ; rien n'est écrit si le fichier existant est illisible (on ne l'écrase pas). Aucune dépendance (Node seul).
   Forme : { taches: [ { id, titre, date (AAAA-MM-JJ), estimee, pourquoi, quoi, fichiers[], sources[{nom,url}], miseAJour?{module,rubriques[],nouveaute}, reprise?{phrase,contexte}, faite (date ou null), creee_le } ] }
   Les réponses collées par Denis au retour du cloud passent par le module existant des retours (veilleRetours.js, identifiant « tache-<id> ») : pas de deuxième mécanisme.
   ============================================================ */
'use strict';
const fs = require('fs');
const path = require('path');

const RE_ID = /^[a-z0-9][a-z0-9-]{0,49}$/;   // 50 au plus : la réponse du cloud est rangée sous « tache-<id> » (60 au plus pour les retours)
const RE_DATE = /^\d{4}-\d{2}-\d{2}$/;
const RE_HTTPS = /^https:\/\/[^\s<>"']{4,300}$/;
const MAX_TACHES = 200;
const JOURS_DE_GRACE = 7;   // au-delà de 7 jours après la date, « En retard »

function dateReelle(s) {
  if (typeof s !== 'string' || !RE_DATE.test(s)) { return false; }
  const d = new Date(s + 'T00:00:00Z');
  return !isNaN(d.getTime()) && d.toISOString().slice(0, 10) === s;
}
function jourLocal(d) { const p = (n) => (n < 10 ? '0' : '') + n; return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate()); }
function dateFr(iso) { const p = String(iso).split('-'); return p.length === 3 ? p[2] + '/' + p[1] + '/' + p[0] : String(iso); }
function ecart(a, b) { return Math.round((Date.parse(a + 'T00:00:00Z') - Date.parse(b + 'T00:00:00Z')) / 86400000); }
function texte(s, max) { return String(s == null ? '' : s).replace(/\r\n/g, '\n').trim().slice(0, max); }
function ligne(s, max) { return texte(s, max).replace(/\s*\n+\s*/g, ' '); }

// L'état d'une tâche un jour donné.
function statut(t, aujourdhui) {
  if (t.faite) { return { cle: 'faite', texte: 'Faite le ' + dateFr(t.faite) }; }
  const d = ecart(t.date, aujourdhui);
  if (d > 0) { return { cle: 'avenir', texte: 'À venir, dans ' + d + ' jour' + (d > 1 ? 's' : '') }; }
  if (d >= -JOURS_DE_GRACE) { return { cle: 'afaire', texte: 'À faire' + (d === 0 ? ' aujourd’hui' : ' (depuis ' + (-d) + ' jour' + (d < -1 ? 's' : '') + ')') }; }
  return { cle: 'retard', texte: 'En retard de ' + (-d) + ' jours' };
}

// La consigne pour Claude (décision de Denis, 2026-11-10) : une tâche n'est pas faite pour le plaisir de la faire, son résultat doit NOURRIR les modules.
// Elle dit quel module, quelles rubriques mettre à jour ou créer, et rappelle les Nouveautés. Elle accompagne toujours la réponse du cloud (ou la phrase de reprise).
function consigneClaude(t) {
  const m = t.miseAJour || {};
  const rub = (m.rubriques && m.rubriques.length) ? m.rubriques : ['à préciser avec Denis avant de coder (quelles rubriques de quel module ce résultat doit nourrir)'];
  return 'MISE À JOUR DE L’APPLICATION À FAIRE AVEC CE RÉSULTAT (c’est le but de cette tâche : le relevé seul ne suffit pas)\n'
    + 'Tâche : ' + t.titre + ' (identifiant « ' + t.id + ' »).\n'
    + 'Module à nourrir : ' + (m.module || 'à préciser avec Denis') + '.\n'
    + 'Rubriques à mettre à jour ou à créer :\n' + rub.map(function (r) { return '- ' + r; }).join('\n') + '\n'
    + 'Règles : seulement des valeurs avec leur période, leur date de publication et la page réellement lue (jamais de mémoire). Si une rubrique n’existe pas encore, la créer ; s’il y a un doute d’interface, maquette et questions avant le code. '
    + 'Brancher la recherche de toute nouvelle rubrique (barre d’accueil et Lexique). Mettre à jour les dates « à jour » et tous les textes qui citent ces chiffres (recherche dans tout le dépôt), puis `npm test` (et `node scripts/checkLexique.js` si le Lexique change).\n'
    + 'NOUVEAUTÉS : ' + (m.nouveaute || 'si le changement est visible par les personnes, ajouter une ligne') + ' dans `docs/JOURNAL_DES_CHANGEMENTS.md` et dans `data/nouveautes.js` (date système réelle, titre court, une ou deux phrases simples, route, icône, module, carte de l’accueil du module), dans le même commit, puis me l’annoncer en une ligne. Aucune ligne si rien n’est visible.\n'
    + 'Enfin marquer la tâche faite (date système réelle) dans `outils/taches_programmees.json`, dans le même commit.';
}

// Le texte à copier : le prompt du cloud (mêmes règles que les autres prompts de l'outil), ou la phrase de reprise suivie de la consigne de mise à jour.
function promptDe(t, aujourdhui) {
  if (t.reprise) { return t.reprise.phrase + '\n\n' + t.reprise.contexte + '\n\n' + consigneClaude(t); }
  const src = t.sources.map(function (s) { return '- ' + s.nom + ' : ' + s.url; }).join('\n');
  return 'Nous sommes le ' + dateFr(aujourdhui) + '. Tâche programmée de l’outil de veille de l’application APP : ' + t.titre + '.\n\n'
    + 'CONTEXTE : ' + t.pourquoi + '\n\n'
    + 'CE QU’IL FAUT RELEVER : ' + t.quoi + '\n\n'
    + 'SOURCES À OUVRIR :\n' + (src || '- à chercher sur le site officiel de l’organisme concerné') + '\n\n'
    + 'RÈGLES : n’utilise que des pages réellement ouvertes, jamais de mémoire ni de déduction. Pour chaque valeur, donne : la valeur, la période, la date de publication et l’adresse exacte de la page lue. Si l’information n’est pas encore publiée, dis-le clairement et donne la date annoncée par la source. Ne modifie aucun fichier et ne propose aucun code.\n\n'
    + 'FORMAT DE LA RÉPONSE : du texte seulement, un bloc par valeur, dans l’ordre ci-dessus, puis une ligne « Ce qui reste incertain ».\n\n'
    + 'À OUVRIR PAR MOI : pour chaque site que tu n’as pas pu ouvrir (blocage anti-robot ou page absente), donne son nom et son adresse en lien cliquable, pour que j’aille copier le texte à la main.';
}

// Nettoie une tâche lue dans le fichier ; null si elle n'a pas la forme attendue.
function nettoyer(b) {
  if (!b || typeof b !== 'object' || !RE_ID.test(String(b.id || '')) || !dateReelle(b.date)) { return null; }
  const titre = ligne(b.titre, 140); if (!titre) { return null; }
  const sources = (Array.isArray(b.sources) ? b.sources : []).map(function (s) { return { nom: ligne(s && s.nom, 140), url: String((s && s.url) || '').trim() }; })
    .filter(function (s) { return s.nom && RE_HTTPS.test(s.url); }).slice(0, 10);
  const t = { id: b.id, titre: titre, date: b.date, estimee: !!b.estimee, pourquoi: texte(b.pourquoi, 1500), quoi: texte(b.quoi, 1500),
    fichiers: (Array.isArray(b.fichiers) ? b.fichiers : []).map(function (f) { return ligne(f, 200); }).filter(Boolean).slice(0, 10), sources: sources,
    faite: dateReelle(b.faite) ? b.faite : null, creee_le: dateReelle(b.creee_le) ? b.creee_le : '' };
  if (b.miseAJour && typeof b.miseAJour === 'object') {
    t.miseAJour = { module: ligne(b.miseAJour.module, 140), rubriques: (Array.isArray(b.miseAJour.rubriques) ? b.miseAJour.rubriques : []).map(function (r) { return ligne(r, 300); }).filter(Boolean).slice(0, 12), nouveaute: ligne(b.miseAJour.nouveaute, 300) };
  }
  if (b.reprise && typeof b.reprise === 'object' && texte(b.reprise.phrase, 300)) { t.reprise = { phrase: texte(b.reprise.phrase, 300), contexte: texte(b.reprise.contexte, 2000) }; }
  return t;
}

function creerTaches(racine, opt) {
  const o = opt || {};
  const fichier = path.join(racine, 'outils', 'taches_programmees.json');
  const aujourdhui = function () { return jourLocal(o.maintenant ? o.maintenant() : new Date()); };

  function lireFichier() {
    if (!fs.existsSync(fichier)) { return { ok: true, taches: [] }; }
    try {
      const brut = JSON.parse(fs.readFileSync(fichier, 'utf8'));
      if (!brut || !Array.isArray(brut.taches)) { return { ok: false, erreur: 'Le fichier des tâches programmées (outils/taches_programmees.json) n\'a pas la forme attendue : rien n\'a été écrit.' }; }
      return { ok: true, taches: brut.taches.map(nettoyer).filter(Boolean) };
    } catch (e) { return { ok: false, erreur: 'Le fichier des tâches programmées (outils/taches_programmees.json) est illisible : rien n\'a été écrit.' }; }
  }
  function ecrire(taches) {
    const tmp = fichier + '.tmp';
    try { fs.writeFileSync(tmp, JSON.stringify({ taches: taches }, null, 2) + '\n', 'utf8'); fs.renameSync(tmp, fichier); return null; }
    catch (e) { return 'Impossible d\'écrire les tâches programmées : ' + (e && e.message); }
  }
  // La liste telle que la page l'affiche : état et texte à copier calculés par ici (une seule source), les plus urgentes d'abord.
  function vue(taches) {
    const j = aujourdhui();
    const liste = taches.map(function (t) {
      const s = statut(t, j);
      return Object.assign({}, t, { etat: s.cle, etatTexte: s.texte, dateFr: dateFr(t.date), faiteFr: t.faite ? dateFr(t.faite) : '', texteACopier: promptDe(t, j), consigneClaude: t.reprise ? '' : consigneClaude(t), genre: t.reprise ? 'reprise' : 'releve' });
    });
    liste.sort(function (a, b) { return a.date < b.date ? -1 : (a.date > b.date ? 1 : (a.id < b.id ? -1 : 1)); });
    const compte = { afaire: 0, avenir: 0, faite: 0 };
    liste.forEach(function (t) { if (t.etat === 'faite') { compte.faite++; } else if (t.etat === 'avenir') { compte.avenir++; } else { compte.afaire++; } });
    return { ok: true, aujourdhui: j, aujourdhuiFr: dateFr(j), taches: liste, compte: compte };
  }
  function lire() { const l = lireFichier(); return l.ok ? vue(l.taches) : l; }

  // donnees : { op: 'ajouter' | 'confirmer' | 'reporter' | 'fait' | 'rouvrir', id?, ... } ; rend la liste à jour.
  function agir(donnees) {
    const d = donnees || {}, op = String(d.op || '');
    const l = lireFichier(); if (!l.ok) { return l; }
    const taches = l.taches;
    if (op === 'ajouter') {
      const titre = ligne(d.titre, 140), quoi = texte(d.quoi, 1500);
      if (!titre || !quoi) { return { ok: false, erreur: 'Il faut un titre et ce qu\'il faut relever.' }; }
      if (!dateReelle(d.date)) { return { ok: false, erreur: 'La date n\'est pas valide.' }; }
      const adresse = String(d.source || '').trim();
      if (adresse && !RE_HTTPS.test(adresse)) { return { ok: false, erreur: 'L\'adresse de la source doit commencer par https://.' }; }
      if (taches.length >= MAX_TACHES) { return { ok: false, erreur: 'Trop de tâches (200 au plus) : marquez des tâches faites ou retirez-en du fichier.' }; }
      let id = 'perso-' + aujourdhui().replace(/-/g, '') + '-' + (taches.length + 1);
      while (taches.some(function (t) { return t.id === id; })) { id += 'b'; }
      taches.push({ id: id, titre: titre, date: d.date, estimee: !!d.estimee, pourquoi: 'Tâche ajoutée à la main le ' + dateFr(aujourdhui()) + '.', quoi: quoi, fichiers: ['à préciser avec Claude'],
        sources: adresse ? [{ nom: 'Source indiquée', url: adresse }] : [], faite: null, creee_le: aujourdhui() });
    } else {
      const t = taches.filter(function (x) { return x.id === String(d.id || ''); })[0];
      if (!t) { return { ok: false, erreur: 'Tâche introuvable.' }; }
      if (op === 'confirmer') { t.estimee = false; }
      else if (op === 'reporter') { if (!dateReelle(d.date)) { return { ok: false, erreur: 'La date n\'est pas valide.' }; } t.date = d.date; }
      else if (op === 'fait') { t.faite = aujourdhui(); }
      else if (op === 'rouvrir') { t.faite = null; }
      else { return { ok: false, erreur: 'Action inconnue.' }; }
    }
    const e = ecrire(taches); if (e) { return { ok: false, erreur: e }; }
    return vue(taches);
  }

  return { lire: lire, agir: agir, fichier: fichier };
}

module.exports = { creerTaches, statut, promptDe, consigneClaude, dateReelle };
