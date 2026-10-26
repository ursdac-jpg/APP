/* ============================================================
   modules/mes-competences/filet.js
   FILET DE SÉCURITÉ du module « Découvrir mes compétences » : contrôle AUTOMATIQUE d'une réponse au prompt
   (prompts/mes-competences.md). Source UNIQUE, partagée par l'application et par le banc d'essai
   (scripts/essaiMesCompetences/, qui l'importe). Fonctions pures, testées (tests/essaiMesCompetences.test.js,
   tests/mesCompetencesFilet.test.js). Chargé comme script classique dans le navigateur : tout est dans une
   fermeture, une seule variable globale (MesCompFilet), jamais de nom commun qui en heurte un autre.

   `verifier` ne dit jamais qu'une réponse est « bonne » : il signale
   - des ERREURS : ce qui casse une règle absolue du prompt (extrait absent des
     documents, jugement « vous êtes », contexte de vie repris, chiffre inventé...) ;
   - des AVERTISSEMENTS : ce qui doit être relu par une personne (vocabulaire trop
     haut, phrase trop longue, rappel manquant...).
   `details` donne chaque constat avec la ligne (ou l'envie) concernée : c'est ce que lit l'application.
   `filtrerReponse` en tire ce que l'application garde, rétrograde ou écarte (jamais la réponse brute à la personne).
   ============================================================ */
var MesCompFilet = (function () {
'use strict';

const FAMILLES = ['savoirFaire', 'savoirs', 'savoirEtre'];
const CONFIRMATIONS = ['confirmee', 'relevee', 'aPreciser'];
const NIVEAUX = ['execution', 'technicien', 'cadre'];
const TYPES_DOCUMENT = ['cv', 'lettreMotivation', 'recommandation', 'reponse'];

const MOTS_CREUX = ['leadership', 'stratégique', 'excellence', 'synergie', 'agilité', 'proactiv', 'résilien', 'dynamique', 'passionn', 'force de proposition', 'orienté résultat', 'soft skill'];
const CONTEXTE_DE_VIE = ['détention', 'détenu', 'prison', 'incarcér', 'pénitentiaire', 'casier', 'handicap', 'rqth', 'maladie', 'malade', 'dépression', 'cancer', 'religion', 'arrêt de travail'];

function sansAccents(t) { return String(t || '').normalize('NFD').replace(/[̀-ͯ]/g, ''); }
/* Comparaison tolérante : minuscules, sans accents, apostrophes et ponctuation ramenées à l'espace. */
function normaliser(t) {
  return sansAccents(t).toLowerCase().replace(/[’‘`´']/g, ' ').replace(/[^a-z0-9]+/g, ' ').replace(/\s+/g, ' ').trim();
}
function mots(t) { const n = normaliser(t); return n ? n.split(' ') : []; }

/* Dernier bloc ```json de la réponse. Renvoie { json, avant, coupe } */
function extraireJson(texte) {
  const s = String(texte || '');
  const re = /```json\s*([\s\S]*?)```/gi;
  let dernier = null, m;
  while ((m = re.exec(s)) !== null) { dernier = m; }
  if (!dernier) {
    const ouvert = s.lastIndexOf('```json');
    if (ouvert >= 0) { return { json: null, avant: s.slice(0, ouvert), coupe: true, brut: s.slice(ouvert + 7) }; }
    return { json: null, avant: s, coupe: false, brut: '' };
  }
  let json = null;
  try { json = JSON.parse(dernier[1]); } catch (e) { return { json: null, avant: s.slice(0, dernier.index), coupe: false, brut: dernier[1], erreurJson: e.message }; }
  return { json, avant: s.slice(0, dernier.index), coupe: false, brut: dernier[1] };
}

function nombreDePhrases(t) { return String(t || '').split(/[.!?]+(?:\s|$)/).filter(function (x) { return x.trim().length > 0; }).length; }
function jaccard(a, b) {
  const A = new Set(mots(a)), B = new Set(mots(b));
  if (!A.size || !B.size) { return 0; }
  let inter = 0; A.forEach(function (x) { if (B.has(x)) { inter++; } });
  return inter / (A.size + B.size - inter);
}

/*
  verifier(reponse, profil, options)
    reponse : texte complet collé (phrases d'introduction + bloc JSON)
    profil  : un objet de profils.js (documents, attendus, ...)
    options : { reponsesPersonne: 'texte' } pour un second passage
*/
function verifier(reponse, profil, options) {
  options = options || {};
  const erreurs = [], avertissements = [], infos = {}, details = [];
  let cible = null;   // { ligne } ou { motivation } pendant le contrôle d'une compétence ou d'une envie
  const ou = function () { return { ligne: cible && cible.ligne !== undefined ? cible.ligne : null, motivation: cible && cible.motivation !== undefined ? cible.motivation : null }; };
  const E = function (m, code) { erreurs.push(m); const o = ou(); details.push({ ligne: o.ligne, motivation: o.motivation, gravite: 'erreur', message: m, code: code || null }); };
  const W = function (m, code) { avertissements.push(m); const o = ou(); details.push({ ligne: o.ligne, motivation: o.motivation, gravite: 'avertissement', message: m, code: code || null }); };
  /* Constat attaché à une ligne seulement dans `details` (les contrôles globaux de la réponse existent déjà dans erreurs). */
  const D = function (ligne, m, code) { details.push({ ligne: ligne, motivation: null, gravite: 'erreur', message: m, code: code || null }); };

  const docs = profil.documents.map(function (d, i) { return { type: d.type, numero: i + 1, norm: normaliser(d.texte), brut: d.texte }; });
  const toutNorm = docs.map(function (d) { return d.norm; }).join(' ') + ' ' + normaliser(options.reponsesPersonne || '');
  const chiffresDocs = new Set((docs.map(function (d) { return d.brut; }).join(' ') + ' ' + (options.reponsesPersonne || '')).match(/\d+/g) || []);

  const ext = extraireJson(reponse);
  if (ext.coupe) { E('JSON coupé : la réponse s’arrête avant la fin du bloc (réponse trop longue ?).'); return { erreurs, avertissements, infos, details }; }
  if (ext.erreurJson) { E('JSON invalide : ' + ext.erreurJson); return { erreurs, avertissements, infos, details }; }
  if (!ext.json) { E('Aucun bloc ```json trouvé.'); return { erreurs, avertissements, infos, details }; }
  const rep = ext.json;

  /* Contrôles sur TOUT le texte de la réponse (hors extraits copiés des documents) */
  const copieSansExtraits = JSON.parse(JSON.stringify(rep));
  (copieSansExtraits.competences || []).forEach(function (c) { (c.preuves || []).forEach(function (p) { p.extrait = ''; }); });
  (copieSansExtraits.motivations || []).forEach(function (m) { if (m.preuve) { m.preuve.extrait = ''; } });
  const texteSansExtraits = ext.avant + '\n' + JSON.stringify(copieSansExtraits);
  const texteComplet = ext.avant + '\n' + ext.brut;

  if (/[–—]/.test(texteComplet)) { E('Tiret long (– ou —) dans la réponse.'); }
  if (/\bIA\b/.test(texteComplet)) { E('Le mot « IA » apparaît dans la réponse.'); }
  if (/\b(vous êtes|tu es)\b/i.test(texteSansExtraits)) { E('Jugement « vous êtes » / « tu es » à propos de la personne.'); }
  if (/!/.test(ext.avant)) { W('Point d’exclamation dans l’introduction.'); }
  if (/f[ée]licitations/i.test(ext.avant)) { W('« Félicitations » dans l’introduction.'); }
  const bas = sansAccents(texteComplet).toLowerCase();
  CONTEXTE_DE_VIE.forEach(function (mot) { if (bas.indexOf(sansAccents(mot)) >= 0) { E('Contexte de vie repris : « ' + mot + ' ».'); } });
  if (/[\w.+-]+@[\w-]+\.[\w.-]+/.test(texteComplet)) { E('Une adresse de courriel apparaît dans la réponse.'); }
  if (/(?:\d[ .]?){10}/.test(texteComplet.replace(/\[.*?\]/g, ''))) { E('Un numéro de téléphone semble apparaître dans la réponse.'); }
  (profil.nomsAEviter || []).forEach(function (nom) { if (bas.indexOf(sansAccents(nom).toLowerCase()) >= 0) { E('Nom de tiers repris : « ' + nom + ' ».'); } });
  const basSansExtraits = sansAccents(texteSansExtraits).toLowerCase();
  MOTS_CREUX.forEach(function (mot) { if (basSansExtraits.indexOf(sansAccents(mot)) >= 0) { W('Mot creux ou prétentieux dans les formulations : « ' + mot + ' ».'); } });

  if (rep.analyseImpossible) {
    if (profil.minCompetences > 0) { E('« analyseImpossible » alors que les documents permettent de relever des compétences.'); }
    return { erreurs, avertissements, infos, details };
  }

  const second = !!options.secondPassage;
  /* Niveau du poste (premier passage seulement) */
  if (!second) {
    if (NIVEAUX.indexOf(rep.niveauPoste) < 0) { E('niveauPoste invalide : ' + rep.niveauPoste); }
    if (profil.niveauChoisi && rep.niveauPoste !== profil.niveauChoisi) { W('Le niveau choisi par la personne (' + profil.niveauChoisi + ') n’est pas repris tel quel : niveauPoste = ' + rep.niveauPoste + '.'); }
    if (!rep.niveauPosteIndices || String(rep.niveauPosteIndices).trim().length < 10) { W('niveauPosteIndices vide ou trop court.'); }
    if (profil.niveauChoisi === 'cadre' && !/surtout|montrent|prouv|document/i.test(rep.niveauPosteIndices || '')) { W('Niveau choisi plus haut que la preuve : la réponse ne le dit pas clairement dans niveauPosteIndices.'); }
  } else {
    if (rep.niveauPoste || rep.niveauPosteIndices) { W('Second passage : niveauPoste ne devait pas être renvoyé.'); }
    const retirees = Array.isArray(rep.competencesRetirees) ? rep.competencesRetirees : [];
    if (rep.competencesRetirees !== undefined && !Array.isArray(rep.competencesRetirees)) { E('« competencesRetirees » n’est pas une liste.'); }
    if (options.questionsPosees) {
      const posees = options.questionsPosees.map(normaliser);
      retirees.forEach(function (l) { if (posees.indexOf(normaliser(l)) < 0) { E('Second passage : « ' + l + ' » retirée alors qu’elle n’avait pas de question.'); } });
      (Array.isArray(rep.competences) ? rep.competences : []).forEach(function (c, k) { if (posees.indexOf(normaliser(c.libelle)) < 0) { cible = { ligne: k }; E('Second passage : « ' + c.libelle + ' » ne faisait pas partie des lignes à préciser (ligne modifiée ou ajoutée).', 'ligneNonDemandee'); cible = null; } });
    }
    if (Array.isArray(rep.motivations) && rep.motivations.length) { W('Second passage : des motivations ont été ajoutées.'); }
  }

  /* Compétences */
  const comps = Array.isArray(rep.competences) ? rep.competences : [];
  infos.nbCompetences = comps.length;
  infos.repartition = { confirmee: 0, relevee: 0, aPreciser: 0 };
  if (!Array.isArray(rep.competences)) { E('« competences » absent ou n’est pas une liste.'); }
  if (comps.length > 14) { E(comps.length + ' compétences : plus de 14.'); }
  if (!second && comps.length < (profil.minCompetences || 3)) { W(comps.length + ' compétence(s) : en dessous de ' + (profil.minCompetences || 3) + ' attendues pour ce profil.'); }

  /* Mots dont la forme accentuée existe dans les documents : écrits sans accent dans la réponse = faute */
  const accentues = {};
  docs.forEach(function (d) { (d.brut.match(/[A-Za-zÀ-ÿ]+/g) || []).forEach(function (t) { if (t !== sansAccents(t)) { accentues[sansAccents(t).toLowerCase()] = t.toLowerCase(); } }); });
  const accentsVus = {};
  function accents(champ, nom) {
    (String(champ || '').match(/[A-Za-zÀ-ÿ]+/g) || []).forEach(function (t) {
      const k = t.toLowerCase();
      const acc = accentues[k];
      if (k.length > 3 && t === sansAccents(t) && acc && !(acc.slice(-1) === 'é' && acc.slice(0, -1) === k.slice(0, -1)) && !accentsVus[nom + k]) { accentsVus[nom + k] = true; E(nom + ' : accent manquant (« ' + t + ' » au lieu de « ' + accentues[k] + ' »).'); }
    });
  }
  const vus = {};
  let nbEtrePreciser = 0;
  comps.forEach(function (c, i) {
    cible = { ligne: i };
    const nom = '#' + (i + 1) + ' « ' + (c.libelle || '?') + ' »';
    /* Mêmes règles absolues que les contrôles globaux, mais rattachées à CETTE ligne (extraits compris pour la santé, la détention...). */
    (function () {
      const texteLigne = JSON.stringify(c);
      const sansExtraits = JSON.stringify(Object.assign({}, c, { preuves: [] }));
      const basLigne = sansAccents(texteLigne).toLowerCase();
      CONTEXTE_DE_VIE.forEach(function (mot) { if (basLigne.indexOf(sansAccents(mot)) >= 0) { D(i, nom + ' : contexte de vie repris (« ' + mot + ' »).', 'contexteDeVie'); } });
      if (/[–—]/.test(texteLigne)) { D(i, nom + ' : tiret long.', 'tiretLong'); }
      if (/\bIA\b/.test(texteLigne)) { D(i, nom + ' : le mot « IA » apparaît.', 'motIA'); }
      if (/\b(vous êtes|tu es)\b/i.test(sansExtraits)) { D(i, nom + ' : jugement « vous êtes » / « tu es ».', 'jugement'); }
      if (/[\w.+-]+@[\w-]+\.[\w.-]+/.test(texteLigne)) { D(i, nom + ' : une adresse de courriel apparaît.', 'courriel'); }
      if (/(?:\d[ .]?){10}/.test(texteLigne.replace(/\[.*?\]/g, ''))) { D(i, nom + ' : un numéro de téléphone semble apparaître.', 'telephone'); }
      (profil.nomsAEviter || []).forEach(function (n) { if (basLigne.indexOf(sansAccents(n).toLowerCase()) >= 0) { D(i, nom + ' : nom de tiers repris (« ' + n + ' »).', 'nomTiers'); } });
    })();
    if (!c.libelle || !String(c.libelle).trim()) { E('Compétence #' + (i + 1) + ' sans libellé.'); }
    const clef = normaliser(c.libelle);
    if (vus[clef]) { W(nom + ' : libellé en double.'); } vus[clef] = true;
    if (FAMILLES.indexOf(c.famille) < 0) { E(nom + ' : famille invalide (' + c.famille + ').'); }
    if (CONFIRMATIONS.indexOf(c.confirmation) < 0) { E(nom + ' : confirmation invalide (' + c.confirmation + ').'); } else { infos.repartition[c.confirmation]++; }
    if (!c.enMotsSimples || String(c.enMotsSimples).trim().length < 10) { W(nom + ' : « en mots simples » vide ou trop court.'); }

    const preuves = Array.isArray(c.preuves) ? c.preuves : [];
    if (!preuves.length) { E(nom + ' : aucune preuve.'); }
    const sources = {};
    preuves.forEach(function (p) {
      if (TYPES_DOCUMENT.indexOf(p.typeDocument) < 0) { E(nom + ' : typeDocument invalide (' + p.typeDocument + ').'); }
      sources[p.typeDocument + ':' + p.numeroDocument] = true;
      const ex = normaliser(p.extrait);
      if (!ex) { E(nom + ' : extrait vide.'); return; }
      if (mots(p.extrait).length > 40) { W(nom + ' : extrait de plus de 40 mots (un paragraphe, pas une proposition).'); }
      if (p.typeDocument === 'reponse') {
        if (!options.reponsesPersonne) { E(nom + ' : preuve de type « reponse » sans réponses fournies.'); }
        else if (normaliser(options.reponsesPersonne).indexOf(ex) < 0) { E(nom + ' : extrait absent des réponses de la personne : « ' + p.extrait + ' ».'); }
        return;
      }
      const doc = docs[(p.numeroDocument || 0) - 1];
      if (doc && doc.norm.indexOf(ex) >= 0) { return; }
      if (toutNorm.indexOf(ex) >= 0) { W(nom + ' : extrait trouvé, mais dans un autre document que celui annoncé (' + p.typeDocument + ' ' + p.numeroDocument + ').'); return; }
      E(nom + ' : extrait ABSENT des documents (invention ou reformulation) : « ' + p.extrait + ' ».');
    });

    [c.libelle, c.enMotsSimples, c.pourLeCV, c.pourLOral, c.pourPreparer, c.question].concat(c.synonymes || []).forEach(function (champ) { accents(champ, nom); });
    if (c.confirmation === 'aPreciser' && preuves.length && (profil.intitulesAvecTaches || []).some(function (re) { return preuves.every(function (p) { return re.test(p.extrait || ''); }); })) {
      W(nom + ' : « à préciser » sur un intitulé dont les tâches sont décrites dans les documents (ligne parasite).');
    }
    if (c.confirmation !== 'aPreciser' && preuves.length && (profil.intitulesSeuls || []).some(function (re) { return preuves.every(function (p) { return re.test(p.extrait || ''); }); })) {
      E(nom + ' : un intitulé de poste seul doit être « à préciser », pas une compétence ' + c.confirmation + '.');
    }
    if (/\b(certificat|dipl[oô]me|caces|titre obtenu)\b/i.test((c.question || '') + ' ' + (c.pourPreparer || ''))) { W(nom + ' : une question porte sur un diplôme ou un certificat (interdit).'); }
    /* Libellé sans aucun rapport avec ses extraits (compétence recopiée d'un exemple du prompt ?) */
    if (preuves.length) {
      const racines = function (t) { return mots(t).filter(function (w) { return w.length >= 5; }).map(function (w) { return w.slice(0, 5); }); };
      const rl = racines(c.libelle), rx = {};
      preuves.forEach(function (p) { racines(p.extrait).forEach(function (r) { rx[r] = true; }); });
      if (rl.length && !rl.some(function (r) { return rx[r]; })) { W(nom + ' : le libellé n\u2019a aucun mot en commun avec ses extraits (compétence recopiée d\u2019un exemple de la consigne ?).'); }
    }
    if (c.confirmation === 'aPreciser' && (!c.enMotsSimples || !String(c.enMotsSimples).trim())) { W(nom + ' : « à préciser » sans explication en mots simples.'); }
    if (profil.genreInconnu && /(^|[^A-Za-zÀ-ÿ])(suis|étais|serai|serais|étant|été)(\s+[A-Za-zÀ-ÿ'’]+){0,2}\s+(occupé|occupée|chargé|chargée|devenu|devenue|resté|restée)(?![A-Za-zÀ-ÿ])/i.test(String(c.pourLOral || '') + ' ' + String(c.pourLeCV || ''))) { W(nom + ' : accord au masculin ou au féminin alors que rien n\u2019indique le genre de la personne.'); }
    if (c.confirmation === 'confirmee') {
      if (Object.keys(sources).length < 2) { E(nom + ' : « confirmée » avec une seule source.', 'confirmeeUneSource'); }
      else if (!preuves.some(function (p) { return p.typeDocument === 'recommandation' || p.typeDocument === 'reponse'; })) { E(nom + ' : « confirmée » sans source tierce (lettre de recommandation ou réponse de la personne) : deux documents écrits par la personne comptent comme « relevée ».', 'confirmeeSansTiers'); }
    }
    /* Une envie ou un projet ne doit pas être classé parmi les compétences */
    if (c.confirmation !== 'aPreciser' && preuves.some(function (p) { return /\b(je souhaite|je veux|je voudrais|je désire|j.aimerais|j.aime)\b/i.test(p.extrait || '') && !/\bj.ai\b/i.test(p.extrait || ''); })) {
      W(nom + ' : une envie ou un projet semble classé parmi les compétences (à placer dans les motivations).');
    }
    if (/^\s*pr[ée]ciser\b/i.test(String(c.libelle || ''))) { E(nom + ' : le libellé commence par « Préciser » : ce n\u2019est pas une compétence.'); }
    if (c.confirmation !== 'aPreciser' && c.libelle && !/^(se |s')?[a-zéèêàâîïôûç]+(er|ir|re|oir)\b/i.test(String(c.libelle).trim())) { W(nom + ' : libellé qui ne commence pas par un verbe à l\u2019infinitif.'); }

    const ecrits = [c.pourLeCV, c.pourLOral, c.pourPreparer];
    if (c.confirmation === 'aPreciser') {
      if (ecrits.some(function (x) { return x && String(x).trim(); }) || (c.synonymes && c.synonymes.length)) { E(nom + ' : « à préciser » avec des formulations ou synonymes écrits (doivent rester vides).'); }
      if (!c.question || !String(c.question).trim()) { E(nom + ' : « à préciser » sans question.'); }
      else if (!/\?\s*$/.test(String(c.question).trim())) { W(nom + ' : la question ne se termine pas par un point d’interrogation.'); }
      if (c.famille === 'savoirEtre') { nbEtrePreciser++; }
    } else {
      if (!c.pourLeCV || !String(c.pourLeCV).trim()) { E(nom + ' : « pour le CV » vide.'); }
      else if (/[.!?]\s*$/.test(String(c.pourLeCV).trim())) { W(nom + ' : « pour le CV » se termine par un point.'); }
      if (c.pourLeCV && mots(c.pourLeCV).length > 15) { W(nom + ' : « pour le CV » de ' + mots(c.pourLeCV).length + ' mots (15 au plus).'); }
      if (!c.pourLOral || !String(c.pourLOral).trim()) { E(nom + ' : « pour l’oral » vide.'); }
      else {
        const n = nombreDePhrases(c.pourLOral);
        if (n < 1 || n > 3) { W(nom + ' : « pour l’oral » de ' + n + ' phrase(s) (1 à 3 attendues).'); }
        const phrases = String(c.pourLOral).split(/[.!?]+(?:\s|$)/).filter(function (x) { return x.trim(); });
        for (let a = 0; a < phrases.length; a++) { for (let b = a + 1; b < phrases.length; b++) { if (jaccard(phrases[a], phrases[b]) > 0.5) { W(nom + ' : deux phrases de « pour l’oral » disent presque la même chose.'); } } }
        if (!/\b(j'|j’|je|mon|ma|mes|m')/i.test(c.pourLOral)) { W(nom + ' : « pour l’oral » n’est pas à la première personne.'); }
      }
      if (!c.synonymes || c.synonymes.length < 2) { W(nom + ' : moins de deux synonymes.'); }
      if (c.question && String(c.question).trim()) { W(nom + ' : une question alors que la compétence n’est pas « à préciser ».'); }
    }

    /* Chiffres : tout nombre écrit doit exister dans les documents */
    [c.libelle, c.enMotsSimples, c.pourLeCV, c.pourLOral, c.pourPreparer].forEach(function (champ) {
      (String(champ || '').match(/\d+/g) || []).forEach(function (n) { if (!chiffresDocs.has(n)) { E(nom + ' : chiffre « ' + n + ' » absent des documents.'); } });
    });
    /* Vocabulaire plus haut que la preuve */
    const formulations = sansAccents([c.libelle, c.pourLeCV, c.pourLOral].join(' ')).toLowerCase();
    (profil.motsAuDessusDeLaPreuve || []).forEach(function (mot) { if (formulations.indexOf(sansAccents(mot).toLowerCase()) >= 0) { W(nom + ' : vocabulaire plus haut que la preuve (« ' + mot + ' »).'); } });
    (profil.interditsLibelle || []).forEach(function (re) { if (c.confirmation !== 'aPreciser' && re.test(c.libelle || '')) { W(nom + ' : libellé non prouvé par un fait (adjectif ou loisir transformé en compétence).'); } });
    cible = null;
  });
  /* Un même extrait pour plusieurs compétences */
  const parExtrait = {};
  comps.forEach(function (c) { (c.preuves || []).forEach(function (p) { const k = normaliser(p.extrait); if (k.length > 12) { (parExtrait[k] = parExtrait[k] || []).push(c.libelle); } }); });
  Object.keys(parExtrait).forEach(function (k) { const l = parExtrait[k].filter(function (x, i, a) { return a.indexOf(x) === i; }); if (l.length > 1) { W('Même extrait utilisé par plusieurs compétences (' + l.join(' / ') + ') : fusionner ou couper l\u2019extrait.'); } });
  if (nbEtrePreciser > 3) { W(nbEtrePreciser + ' savoir-être « à préciser » (3 au plus).'); }

  /* Répétition entre « pour l'oral » */
  for (let i = 0; i < comps.length; i++) {
    for (let j = i + 1; j < comps.length; j++) {
      if (comps[i].pourLOral && comps[j].pourLOral && jaccard(comps[i].pourLOral, comps[j].pourLOral) > 0.6) {
        W('Phrases pour l’oral très proches entre « ' + comps[i].libelle + ' » et « ' + comps[j].libelle + ' ».');
      }
    }
  }

  /* Rappel : ce que le relevé devrait retrouver */
  const tousLibelles = comps.map(function (c) { return (c.libelle || '') + ' ' + (c.pourLeCV || '') + ' ' + (c.enMotsSimples || ''); }).join(' | ');
  if (!second) {
    (profil.attendus || []).forEach(function (re) { if (!re.test(tousLibelles)) { W('Rappel : rien ne correspond à ' + re + '.'); } });
    (profil.attendusPreciser || []).forEach(function (re) {
      if (!comps.some(function (c) { return c.confirmation === 'aPreciser' && re.test((c.libelle || '') + ' ' + (c.question || '')); })) { W('Rappel : aucune compétence « à préciser » ne correspond à ' + re + '.'); }
    });
  } else {
    comps.forEach(function (c, i) {
      cible = { ligne: i };
      const nom = '#' + (i + 1) + ' « ' + (c.libelle || '?') + ' »';
      if (c.confirmation !== 'confirmee') { E(nom + ' : au second passage, une ligne renvoyée doit être « confirmée ».'); }
      if (!(c.preuves || []).some(function (p) { return p.typeDocument === 'reponse'; })) { E(nom + ' : aucune preuve de type « reponse ».'); }
      cible = null;
    });
  }

  /* Motivations */
  const motivations = Array.isArray(rep.motivations) ? rep.motivations : [];
  infos.nbMotivations = motivations.length;
  if (motivations.length > 5) { E(motivations.length + ' motivations : plus de 5.'); }
  motivations.forEach(function (m, i) {
    cible = { motivation: i };
    const nom = 'motivation #' + (i + 1);
    (function () {
      const bm = sansAccents(JSON.stringify(m)).toLowerCase();
      CONTEXTE_DE_VIE.forEach(function (mot) { if (bm.indexOf(sansAccents(mot)) >= 0) { details.push({ ligne: null, motivation: i, gravite: 'erreur', message: nom + ' : contexte de vie repris (« ' + mot + ' »).', code: 'contexteDeVie' }); } });
    })();
    const p = m.preuve || {};
    const ex = normaliser(p.extrait);
    if (!ex) { E(nom + ' : sans extrait.'); }
    else if (toutNorm.indexOf(ex) < 0) { E(nom + ' : extrait ABSENT des documents : « ' + p.extrait + ' ».'); }
    if (p.typeDocument === 'cv') { W(nom + ' : tirée du CV (une envie s’exprime d’ordinaire dans une lettre).'); }
    cible = null;
  });

  return { erreurs, avertissements, infos, details };
}

/*
  filtrerReponse(texte, documents, options) : ce que l'APPLICATION fait d'une réponse collée (jamais la réponse brute montrée).
    documents : [{ type, texte }] (les documents envoyés, dans l'ordre des sections DOCUMENT n)
    options   : { secondPassage, reponsesPersonne, questionsPosees }
  Renvoie { ok:false, fatale:'coupee'|'illisible' } ou
    { ok:true, vide, niveauPoste, niveauPosteIndices, competences, ecartees:[{ libelle, raisons }], retrogradees:[libelle],
      motivations, motivationsEcartees, retirees, infos }
  Règle : une ligne avec une erreur est ÉCARTÉE ; une ligne « confirmée » dont la seule faute est de manquer d'une source tierce est
  RÉTROGRADÉE en « relevée » (jamais un niveau plus haut que la preuve) ; les avertissements ne retirent rien.
*/
const CODES_RETROGRADABLES = ['confirmeeUneSource', 'confirmeeSansTiers'];
function filtrerReponse(texte, documents, options) {
  options = options || {};
  const ext = extraireJson(texte);
  if (ext.coupe) { return { ok: false, fatale: 'coupee' }; }
  if (ext.erreurJson || !ext.json || typeof ext.json !== 'object') { return { ok: false, fatale: 'illisible' }; }
  const rep = ext.json;
  if (rep.analyseImpossible) { return { ok: true, vide: true, competences: [], ecartees: [], retrogradees: [], motivations: [], motivationsEcartees: [], retirees: [], niveauPoste: null, niveauPosteIndices: '', infos: {} }; }
  const r = verifier(texte, { documents: documents || [] }, { reponsesPersonne: options.reponsesPersonne, secondPassage: !!options.secondPassage, questionsPosees: options.questionsPosees });
  const brutes = Array.isArray(rep.competences) ? rep.competences : [];
  const competences = [], ecartees = [], retrogradees = [];
  brutes.forEach(function (c, i) {
    if (!c || typeof c !== 'object') { return; }
    const fautes = r.details.filter(function (d) { return d.ligne === i && d.gravite === 'erreur'; });
    if (!fautes.length) { competences.push(c); return; }
    const seulementRang = fautes.every(function (d) { return CODES_RETROGRADABLES.indexOf(d.code) >= 0; });
    if (seulementRang && c.confirmation === 'confirmee') {
      competences.push(Object.assign({}, c, { confirmation: 'relevee' }));
      retrogradees.push(c.libelle);
      return;
    }
    ecartees.push({ libelle: c.libelle || '', raisons: fautes.map(function (d) { return d.message; }) });
  });
  const brutesM = Array.isArray(rep.motivations) ? rep.motivations : [];
  const motivations = [], motivationsEcartees = [];
  brutesM.forEach(function (m, j) {
    if (!m || typeof m !== 'object') { return; }
    const fautes = r.details.filter(function (d) { return d.motivation === j && d.gravite === 'erreur'; });
    if (fautes.length) { motivationsEcartees.push({ libelle: m.libelle || '', raisons: fautes.map(function (d) { return d.message; }) }); }
    else { motivations.push(m); }
  });
  const posees = (options.questionsPosees || []).map(normaliser);
  const retirees = (Array.isArray(rep.competencesRetirees) ? rep.competencesRetirees : []).filter(function (l) { return typeof l === 'string' && (!posees.length || posees.indexOf(normaliser(l)) >= 0); });
  return {
    ok: true, vide: false,
    niveauPoste: NIVEAUX.indexOf(rep.niveauPoste) >= 0 ? rep.niveauPoste : null,
    niveauPosteIndices: typeof rep.niveauPosteIndices === 'string' ? rep.niveauPosteIndices : '',
    competences: competences.slice(0, 14), ecartees: ecartees, retrogradees: retrogradees,
    motivations: motivations.slice(0, 5), motivationsEcartees: motivationsEcartees, retirees: retirees, infos: r.infos
  };
}

const API = { verifier, filtrerReponse, extraireJson, normaliser, sansAccents, nombreDePhrases, jaccard, FAMILLES, CONFIRMATIONS, NIVEAUX, TYPES_DOCUMENT, MOTS_CREUX, CONTEXTE_DE_VIE };
if (typeof module !== 'undefined' && module.exports) { module.exports = API; }
return API;
})();
