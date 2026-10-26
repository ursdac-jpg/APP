'use strict';
/* ============================================================
   scripts/essaiMesCompetences/verifier.js
   Contrôle AUTOMATIQUE d'une réponse au prompt « Découvrir mes compétences »
   (prompts/mes-competences.md). Fonctions pures, testées (tests/essaiMesCompetences.test.js).

   Ce script ne dit jamais qu'une réponse est « bonne » : il signale
   - des ERREURS : ce qui casse une règle absolue du prompt (extrait absent des
     documents, jugement « vous êtes », contexte de vie repris, chiffre inventé...) ;
   - des AVERTISSEMENTS : ce qui doit être relu par une personne (vocabulaire trop
     haut, phrase trop longue, rappel manquant...).
   ============================================================ */

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
  const erreurs = [], avertissements = [], infos = {};
  const E = function (m) { erreurs.push(m); }, W = function (m) { avertissements.push(m); };

  const docs = profil.documents.map(function (d, i) { return { type: d.type, numero: i + 1, norm: normaliser(d.texte), brut: d.texte }; });
  const toutNorm = docs.map(function (d) { return d.norm; }).join(' ') + ' ' + normaliser(options.reponsesPersonne || '');
  const chiffresDocs = new Set((docs.map(function (d) { return d.brut; }).join(' ') + ' ' + (options.reponsesPersonne || '')).match(/\d+/g) || []);

  const ext = extraireJson(reponse);
  if (ext.coupe) { E('JSON coupé : la réponse s’arrête avant la fin du bloc (réponse trop longue ?).'); return { erreurs, avertissements, infos }; }
  if (ext.erreurJson) { E('JSON invalide : ' + ext.erreurJson); return { erreurs, avertissements, infos }; }
  if (!ext.json) { E('Aucun bloc ```json trouvé.'); return { erreurs, avertissements, infos }; }
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
    return { erreurs, avertissements, infos };
  }

  /* Niveau du poste */
  if (NIVEAUX.indexOf(rep.niveauPoste) < 0) { E('niveauPoste invalide : ' + rep.niveauPoste); }
  if (profil.niveauChoisi && rep.niveauPoste !== profil.niveauChoisi) { W('Le niveau choisi par la personne (' + profil.niveauChoisi + ') n’est pas repris tel quel : niveauPoste = ' + rep.niveauPoste + '.'); }
  if (!rep.niveauPosteIndices || String(rep.niveauPosteIndices).trim().length < 10) { W('niveauPosteIndices vide ou trop court.'); }
  if (profil.niveauChoisi === 'cadre' && !/surtout|montrent|prouv|document/i.test(rep.niveauPosteIndices || '')) { W('Niveau choisi plus haut que la preuve : la réponse ne le dit pas clairement dans niveauPosteIndices.'); }

  /* Compétences */
  const comps = Array.isArray(rep.competences) ? rep.competences : [];
  infos.nbCompetences = comps.length;
  infos.repartition = { confirmee: 0, relevee: 0, aPreciser: 0 };
  if (!Array.isArray(rep.competences)) { E('« competences » absent ou n’est pas une liste.'); }
  if (comps.length > 14) { E(comps.length + ' compétences : plus de 14.'); }
  if (comps.length < (profil.minCompetences || 3)) { W(comps.length + ' compétence(s) : en dessous de ' + (profil.minCompetences || 3) + ' attendues pour ce profil.'); }

  const vus = {};
  let nbEtrePreciser = 0;
  comps.forEach(function (c, i) {
    const nom = '#' + (i + 1) + ' « ' + (c.libelle || '?') + ' »';
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

    if (c.confirmation === 'confirmee' && Object.keys(sources).length < 2) { E(nom + ' : « confirmée » avec une seule source.'); }

    const ecrits = [c.pourLeCV, c.pourLOral, c.pourPreparer];
    if (c.confirmation === 'aPreciser') {
      if (ecrits.some(function (x) { return x && String(x).trim(); }) || (c.synonymes && c.synonymes.length)) { E(nom + ' : « à préciser » avec des formulations ou synonymes écrits (doivent rester vides).'); }
      if (!c.question || !String(c.question).trim()) { E(nom + ' : « à préciser » sans question.'); }
      else if (!/\?\s*$/.test(String(c.question).trim())) { W(nom + ' : la question ne se termine pas par un point d’interrogation.'); }
      if (c.famille === 'savoirEtre') { nbEtrePreciser++; }
    } else {
      if (!c.pourLeCV || !String(c.pourLeCV).trim()) { E(nom + ' : « pour le CV » vide.'); }
      else if (mots(c.pourLeCV).length > 15) { W(nom + ' : « pour le CV » de ' + mots(c.pourLeCV).length + ' mots (15 au plus).'); }
      if (!c.pourLOral || !String(c.pourLOral).trim()) { E(nom + ' : « pour l’oral » vide.'); }
      else {
        const n = nombreDePhrases(c.pourLOral);
        if (n < 2 || n > 4) { W(nom + ' : « pour l’oral » de ' + n + ' phrase(s) (2 à 3 attendues).'); }
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
  });
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
  (profil.attendus || []).forEach(function (re) { if (!re.test(tousLibelles)) { W('Rappel : rien ne correspond à ' + re + '.'); } });

  /* Motivations */
  const motivations = Array.isArray(rep.motivations) ? rep.motivations : [];
  infos.nbMotivations = motivations.length;
  if (motivations.length > 5) { E(motivations.length + ' motivations : plus de 5.'); }
  motivations.forEach(function (m, i) {
    const nom = 'motivation #' + (i + 1);
    const p = m.preuve || {};
    const ex = normaliser(p.extrait);
    if (!ex) { E(nom + ' : sans extrait.'); }
    else if (toutNorm.indexOf(ex) < 0) { E(nom + ' : extrait ABSENT des documents : « ' + p.extrait + ' ».'); }
    if (p.typeDocument === 'cv') { W(nom + ' : tirée du CV (une envie s’exprime d’ordinaire dans une lettre).'); }
  });

  return { erreurs, avertissements, infos };
}

module.exports = { verifier, extraireJson, normaliser, nombreDePhrases, jaccard, FAMILLES, CONFIRMATIONS, NIVEAUX, TYPES_DOCUMENT, MOTS_CREUX, CONTEXTE_DE_VIE };
