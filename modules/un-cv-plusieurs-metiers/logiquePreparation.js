/* ============================================================
   Module « Un CV, plusieurs métiers » : PRÉPARATION À L'ENTRETIEN D'EMBAUCHE (page 8), LOGIQUE PURE (aucun DOM).
   Chargé après logiqueCv.js. Testé par tests/unCvMetiersPreparation.test.js (Node). Plan : docs/PLAN_LETTRES_RETRAVAILLEES_ET_PREPARATION_ENTRETIEN_UCPM_2026-10-15.md.

   Une feuille de préparation par métier : questions probables (dont les questions délicates), ce que le recruteur cherche, une piste pour répondre, ce qu'il faut mettre en avant,
   et des conseils de savoir-être écrits par l'application (jamais par l'assistant). Deux modes : « général » (plusieurs métiers, version courte, niveau réaliste) et
   « approfondi » (un seul métier, niveau d'exigence, nombre de questions, sujets et pistes au choix, relance du recruteur aux niveaux exigeants).
   Prompt : prompts/ucpm-preparation.md.
   ============================================================ */

var UCPM_PREP_NIVEAUX = [
  { id: 'rassurant', titre: 'Rassurant', texte: 'Les questions les plus classiques, avec un ton encourageant et beaucoup d’aide pour répondre.' },
  { id: 'realiste', titre: 'Réaliste', texte: 'Les questions que posent le plus souvent les recruteurs, avec un ton encourageant.' },
  { id: 'exigeant', titre: 'Exigeant', texte: 'Un recruteur direct : des questions plus précises et des relances sur vos exemples.' },
  { id: 'tres-exigeant', titre: 'Très exigeant', texte: 'Questions de déstabilisation, mises en situation difficiles et relances serrées. Pour s’entraîner quand on se sent déjà prêt(e).' }
];

// Les sujets que la personne peut cocher en mode approfondi (clé : sujet donné à l'assistant).
var UCPM_PREP_SUJETS = [
  { id: 'parcours', titre: 'Mon parcours', prompt: 'le parcours' },
  { id: 'delicat', titre: 'Mes points délicats (périodes sans activité, ruptures)', prompt: 'les points délicats (périodes sans activité, ruptures)' },
  { id: 'entreprise', titre: 'Pourquoi cette entreprise ou cette structure', prompt: 'pourquoi cette entreprise ou cette structure' },
  { id: 'changement', titre: 'Pourquoi ce changement de métier ou de secteur', prompt: 'pourquoi ce changement de métier ou de secteur' },
  { id: 'competences', titre: 'Mes compétences, avec des exemples', prompt: 'les compétences, avec des exemples' },
  { id: 'situation', titre: 'Mises en situation', prompt: 'les mises en situation' },
  { id: 'qualites', titre: 'Mes qualités et mes défauts', prompt: 'les qualités et les défauts' },
  { id: 'pratique', titre: 'Disponibilités, contrat, rémunération', prompt: 'les disponibilités, le contrat et la rémunération' }
];

var UCPM_PREP_NOMBRES = [8, 10, 12];
var UCPM_PREP_MAX_QUESTIONS = 12;
var UCPM_PREP_MAX_METIERS_GENERAL = 6;   // au-delà, la réponse risque d'être coupée par l'assistant (environ 2 000 mots constatés sur les lettres)
// Sujets de la réponse de l'assistant : ceux du prompt (les sujets de la liste ci-dessus, plus « motivation »).
var UCPM_PREP_SUJETS_REPONSE = ['parcours', 'motivation', 'delicat', 'entreprise', 'changement', 'competences', 'situation', 'qualites', 'pratique'];
// Une question de ces sujets est « délicate » (repère imprimé), quel que soit le mode.
var UCPM_PREP_SUJETS_DELICATS = ['delicat', 'entreprise', 'changement', 'qualites'];

function ucpmReglagesPreparationParDefaut(mode) {
  return {
    mode: mode === 'approfondi' ? 'approfondi' : 'general',
    niveau: 'realiste',
    nombre: 10,
    sujets: UCPM_PREP_SUJETS.map(function (s) { return s.id; }).filter(function (id) { return ['parcours', 'delicat', 'entreprise', 'changement', 'competences'].indexOf(id) >= 0; }),
    pistes: true
  };
}

function _ucpmPrepNiveau(id) { return UCPM_PREP_NIVEAUX.filter(function (n) { return n.id === id; })[0] || UCPM_PREP_NIVEAUX[1]; }
function ucpmPreparationAvecRelance(niveau) { return niveau === 'exigeant' || niveau === 'tres-exigeant'; }

// Bloc {REGLAGES} du prompt. Le mode général est fixe (niveau réaliste, 5 questions, sujets par défaut, pistes courtes).
function ucpmBlocReglagesPreparation(reglages) {
  var r = reglages || {};
  if (r.mode !== 'approfondi') {
    return 'Mode : général (plusieurs métiers, version courte)\nNiveau d’exigence : Réaliste\nNombre de questions par métier : 5\nSujets : le parcours ; les points délicats ; pourquoi ce métier ou ce changement\nPistes de réponse : oui, courtes';
  }
  var niveau = _ucpmPrepNiveau(r.niveau);
  var nombre = UCPM_PREP_NOMBRES.indexOf(parseInt(r.nombre, 10)) >= 0 ? parseInt(r.nombre, 10) : 10;
  var sujets = UCPM_PREP_SUJETS.filter(function (s) { return (r.sujets || []).indexOf(s.id) >= 0; }).map(function (s) { return s.prompt; });
  if (!sujets.length) { sujets = [UCPM_PREP_SUJETS[0].prompt]; }
  return 'Mode : approfondi (un seul métier)\nNiveau d’exigence : ' + niveau.titre + '\nNombre de questions par métier : ' + nombre + '\nSujets : ' + sujets.join(' ; ') + '\nPistes de réponse : ' + (r.pistes === false ? 'non (mets une chaîne vide dans « piste »)' : 'oui');
}

// ---------------- Périodes sans activité (repérées par l'application, jamais devinées) ----------------
// Année et mois d'une date écrite dans le dossier (« 2019 », « 2019-03 », « 03/2019 ») ; null si on ne sait pas.
function _ucpmPrepDate(v) {
  var t = String(v == null ? '' : v).trim();
  if (!t) { return null; }
  var m = t.match(/^(\d{4})[-\/.](\d{1,2})\b/) || null;
  if (m) { return { a: parseInt(m[1], 10), m: Math.min(12, Math.max(1, parseInt(m[2], 10))) }; }
  m = t.match(/^(\d{1,2})[-\/.](\d{4})\b/);
  if (m) { return { a: parseInt(m[2], 10), m: Math.min(12, Math.max(1, parseInt(m[1], 10))) }; }
  m = t.match(/^(\d{4})$/);
  if (m) { return { a: parseInt(m[1], 10), m: null }; }
  return null;
}

var UCPM_PREP_MOIS_MINI_TROU = 6;

// Périodes d'au moins six mois SANS aucune expérience indiquée, certaines même si les mois sont inconnus (début au plus tôt, fin au plus tard). Une expérience sans date de fin
// n'est jamais devinée « en cours » : elle ne produit aucune période. Une année seule veut dire cette année-là. aujourdhui : { a, m } (par défaut la date du jour).
// Renvoie [{ de, a, mois }] : de et a sont des textes (« 2022 » ou « mars 2022 »).
var _UCPM_PREP_NOMS_MOIS = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
function _ucpmPrepLibelleDate(d) { return d.m ? _UCPM_PREP_NOMS_MOIS[d.m - 1] + ' ' + d.a : String(d.a); }
function ucpmPeriodesSansActivite(experiences, aujourdhui) {
  var maintenant = aujourdhui || { a: new Date().getFullYear(), m: new Date().getMonth() + 1 };
  var plages = [];
  (experiences || []).forEach(function (e) {
    if (!e) { return; }
    var d = _ucpmPrepDate(e.dateDebut);
    if (!d) { return; }
    var f = _ucpmPrepDate(e.dateFin);
    var ouverte = !f;   // pas de date de fin : on ne devine rien, la plage va jusqu'à aujourd'hui
    plages.push({ debut: d, fin: f, ouverte: ouverte, idxDebut: d.a * 12 + (d.m || 1), idxFin: ouverte ? Infinity : f.a * 12 + (f.m || 12) });
  });
  plages.sort(function (x, y) { return x.idxDebut - y.idxDebut; });
  var periodes = [];
  var couvert = null;   // plage dont la fin est la plus tardive jusqu'ici
  plages.forEach(function (p) {
    if (couvert && p.idxDebut - couvert.idxFin - 1 >= UCPM_PREP_MOIS_MINI_TROU) {
      var apres = couvert.fin, avant = p.debut;
      periodes.push({ de: _ucpmPrepLibelleDate(apres), a: _ucpmPrepLibelleDate(avant), mois: p.idxDebut - couvert.idxFin - 1 });
    }
    if (!couvert || p.idxFin > couvert.idxFin) { couvert = p; }
  });
  // Depuis la dernière fin connue jusqu'à aujourd'hui : seulement si toutes les plages se terminent par une date écrite.
  if (couvert && !couvert.ouverte) {
    var depuis = (maintenant.a * 12 + maintenant.m) - couvert.idxFin - 1;
    if (depuis >= UCPM_PREP_MOIS_MINI_TROU) { periodes.push({ de: _ucpmPrepLibelleDate(couvert.fin), a: 'aujourd’hui', mois: depuis }); }
  }
  return periodes;
}

// Les périodes en une ligne pour le prompt (« aucune » si rien n'est repéré).
function ucpmTextePeriodesSansActivite(periodes) {
  if (!periodes || !periodes.length) { return 'aucune'; }
  return periodes.map(function (p) {
    var annees = Math.floor(p.mois / 12), reste = p.mois % 12;
    var duree = annees >= 1 ? (annees + (annees > 1 ? ' ans' : ' an') + (reste >= 6 ? ' et demi' : '')) : (p.mois + ' mois');
    return 'de ' + p.de + ' à ' + p.a + ' (environ ' + duree + ') : aucune expérience indiquée sur le CV';
  }).join(' ; ');
}

// ---------------- Demande à l'assistant ----------------

// Bloc {METIERS} : un bloc par métier. items = [{ titre, accroche, objectif, lettre, periodes, changement }] (lettre sans signature, periodes : texte de ucpmTextePeriodesSansActivite,
// changement : vrai quand le métier est un AUTRE métier que celui du CV de référence, décidé par l'application et non deviné par l'assistant).
function ucpmBlocMetiersPreparation(items) {
  return (items || []).map(function (it, i) {
    var o = ucpmNormaliserObjectif(it.objectif) || ucpmObjectifVide('');
    var l = (i + 1) + '. Métier : ' + it.titre +
      '\n   Titre du CV : ' + it.titre +
      '\n   Accroche retenue : ' + (it.accroche || '') +
      '\n   Objectif : ' + ucpmTitreDemarche(o.demarche) +
      '\n   Détails : ' + (ucpmDetailsObjectif(o) || 'aucun détail donné');
    if (o.employeur) { l += '\n   Employeur : ' + o.employeur; }
    if (o.posteOffre) { l += '\n   Poste visé : ' + o.posteOffre; }
    if (o.texteOffre) { l += '\n   Extrait de l’offre : ' + String(o.texteOffre).replace(/\s+/g, ' ').trim().slice(0, 600); }
    l += '\n   Changement de métier par rapport au CV de référence : ' + (it.changement ? 'oui (un autre métier que celui du CV de référence)' : 'non (même métier que le CV de référence)');
    l += '\n   Périodes sans activité repérées par l’application : ' + (it.periodes || 'aucune');
    l += '\n   Lettre actuelle (sans signature) :\n"""\n' + (String(it.lettre || '').trim() || 'non écrite') + '\n"""';
    return l;
  }).join('\n\n');
}

function ucpmConstruirePromptPreparation(template, valeurs) {
  var v = valeurs || {};
  var t = { GENRE: ucpmGenreTexte(v.sexe), PROFIL: String(v.profil || '').trim() || 'Non fourni', REGLAGES: String(v.reglages || '').trim(), METIERS: String(v.metiers || '').trim() };
  return String(template == null ? '' : template).replace(/\{(GENRE|PROFIL|REGLAGES|METIERS)\}/g, function (m, nom) { return t[nom]; });
}

// ---------------- Lecture de la réponse ----------------

function _ucpmPrepTexte(x) { return ucpmNormaliserApostrophes(ucpmNettoyerTexte(x)); }
function _ucpmPrepListe(liste, max) {
  if (!Array.isArray(liste)) { return []; }
  var vus = {};
  return liste.map(_ucpmPrepTexte).filter(function (t) { if (!t || vus[t.toLowerCase()]) { return false; } vus[t.toLowerCase()] = true; return true; }).slice(0, max);
}

// [{ id, metier, questions: [{ question, sujet, delicate, attente, piste, relance }], aMettreEnAvant: [...] }], un élément par métier demandé, même ordre.
// Renvoie { succes, preparations: { identifiant : { questions, aMettreEnAvant } }, manquants: [ids], erreur, coupe }. Un métier sans question lisible n'empêche pas les autres.
// Le repère « délicate » suit le sujet (règle fixe du prompt) ; une question que l'assistant marque délicate le reste.
function ucpmLireReponsePreparation(texte, ids) {
  var brut = String(texte == null ? '' : texte);
  if (!brut.trim()) { return { succes: false, erreur: 'Aucun texte n’a été collé.', coupe: false }; }
  var r = ucpmExtraireJson(brut);
  if (r.erreur) { return { succes: false, coupe: !!r.coupe, erreur: r.coupe ? UCPM_MSG_REPONSE_COUPEE : UCPM_MSG_REPONSE_ILLISIBLE }; }
  var liste = Array.isArray(r.json) ? r.json : (r.json && Array.isArray(r.json.preparations) ? r.json.preparations : null);
  if (!liste) { return { succes: false, coupe: false, erreur: UCPM_MSG_REPONSE_ILLISIBLE }; }
  var parId = {};
  liste.forEach(function (x, i) {
    if (!x || typeof x !== 'object') { return; }
    var id = parseInt(x.id, 10); if (isNaN(id)) { id = i + 1; }
    var questions = (Array.isArray(x.questions) ? x.questions : []).map(function (q) {
      if (!q || typeof q !== 'object') { return null; }
      var question = _ucpmPrepTexte(q.question);
      if (!question) { return null; }
      var sujet = UCPM_PREP_SUJETS_REPONSE.indexOf(String(q.sujet || '').trim()) >= 0 ? String(q.sujet).trim() : 'parcours';
      return { question: question, sujet: sujet, delicate: UCPM_PREP_SUJETS_DELICATS.indexOf(sujet) >= 0 || q.delicate === true,
        attente: _ucpmPrepTexte(q.attente), piste: _ucpmPrepTexte(q.piste), relance: _ucpmPrepTexte(q.relance) };
    }).filter(Boolean).slice(0, UCPM_PREP_MAX_QUESTIONS);
    if (questions.length) { parId[id] = { questions: questions, aMettreEnAvant: _ucpmPrepListe(x.aMettreEnAvant, 4) }; }
  });
  var attendus = ids || Object.keys(parId).map(Number);
  var preparations = {};
  var manquants = [];
  attendus.forEach(function (id, i) { var cle = i + 1; if (parId[cle]) { preparations[id] = parId[cle]; } else { manquants.push(id); } });
  if (!Object.keys(preparations).length) { return { succes: false, coupe: false, erreur: 'La réponse est lisible, mais elle ne contient aucune question. Redemandez-la à l’assistant.' }; }
  return { succes: true, preparations: preparations, manquants: manquants };
}

// Une préparation générale se garde, une approfondie la remplace (avec confirmation côté page) : on garde le mode avec la préparation.
function ucpmFusionnerPreparations(anciennes, recues, mode, niveau) {
  var sortie = {};
  Object.keys(anciennes || {}).forEach(function (id) { sortie[id] = anciennes[id]; });
  Object.keys(recues || {}).forEach(function (id) { sortie[id] = { questions: recues[id].questions, aMettreEnAvant: recues[id].aMettreEnAvant, mode: mode === 'approfondi' ? 'approfondi' : 'general', niveau: mode === 'approfondi' ? _ucpmPrepNiveau(niveau).id : '' }; });
  return sortie;
}

// ---------------- Conseils écrits par l'application (identiques sur toutes les feuilles, à relire par Denis) ----------------

// Courts à dessein : la feuille d'une préparation générale doit tenir sur une page A4 (essais de mise en page du 2026-10-15).
var UCPM_CONSEILS_ENTRETIEN = {
  avant: ['Arrivez dix minutes en avance.', 'Relisez votre CV et votre lettre.', 'Préparez une tenue simple et propre.'],
  pendant: ['Regardez la personne, écoutez jusqu’au bout.', 'Répondez avec un exemple vécu.', 'Si vous ne savez pas, dites-le simplement.'],
  apres: ['Remerciez avant de partir.', 'Envoyez un court message de remerciement.', 'Notez ce que vous voulez améliorer.'],
  rassurance: 'Il est normal d’hésiter. Une réponse simple et vraie vaut mieux qu’une réponse parfaite.'
};

// ---------------- Feuille imprimable : taille et cibles ----------------

// Le CV (entrées cochées) dont la préparation est demandée : les entrées cochées choisies, dans l'ordre. choix = { ids: [...] } ou null (= tous).
function ucpmCiblesPreparation(entreesCochees, ids) {
  var liste = entreesCochees || [];
  if (!Array.isArray(ids)) { return liste.slice(); }
  var gardees = liste.filter(function (e) { return ids.indexOf(e.id) >= 0; });
  return gardees.length ? gardees : liste.slice();
}

// Le mode général ne prend pas plus de six métiers par demande ; au-delà, la réponse risque d'être coupée.
function ucpmPreparationTropDeMetiers(nbMetiers, mode) { return mode !== 'approfondi' && nbMetiers > UCPM_PREP_MAX_METIERS_GENERAL; }

// Estimation grossière du nombre de signes d'une feuille (pour les essais et un premier avis ; la vraie mesure se fait à l'écran).
function ucpmSignesPreparation(prep) {
  if (!prep) { return 0; }
  var n = 0;
  (prep.questions || []).forEach(function (q) { n += String(q.question).length + String(q.attente).length + String(q.piste).length + String(q.relance || '').length + 60; });
  (prep.aMettreEnAvant || []).forEach(function (a) { n += String(a).length + 4; });
  return n;
}

// ---------------- Feuille imprimable (A4) ----------------
// Une préparation = une ou deux feuilles A4 (décision de Denis, D7 : le mode général tient sur une page, l'approfondi peut en prendre deux, corps de 10 points au moins).
// Les blocs (en-tête, chaque question, « à mettre en avant », conseils) sont mesurés à l'écran (page8Entretiens.js) puis répartis par ucpmRepartirBlocs : jamais une question coupée entre deux pages.
// Mise en page sobre, sans couleur de fond (impression en noir et blanc), la question délicate est repérée par une étiquette écrite, jamais par la couleur seule.

var UCPM_PREP_TAILLES_PT = [11, 10.5, 10];   // du plus lisible au plus petit permis
var UCPM_PREP_LARGEUR_MM = 210;
var UCPM_PREP_HAUTEUR_MM = 296;
var UCPM_PREP_MARGE_MM = 12;
var UCPM_PREP_MARGE_LATERALE_MM = 14;

function ucpmCssPreparation() {
  return ':host{display:block;}' +
    '.prep{box-sizing:border-box;width:' + UCPM_PREP_LARGEUR_MM + 'mm;height:' + UCPM_PREP_HAUTEUR_MM + 'mm;padding:' + UCPM_PREP_MARGE_MM + 'mm ' + UCPM_PREP_MARGE_LATERALE_MM + 'mm;background:#fff;color:#111;font-family:Arial,Helvetica,sans-serif;line-height:1.3;overflow:hidden;}' +
    '.prep p{margin:0;}' +
    '.prep h1{font-size:1.55em;line-height:1.2;margin:0 0 .15em 0;}' +
    '.prep .sous{color:#333;margin:0 0 .7em 0;padding-bottom:.4em;border-bottom:2px solid #222;}' +
    '.prep .suite{color:#333;margin:0 0 .7em 0;padding-bottom:.3em;border-bottom:1px solid #999;font-weight:700;}' +
    '.prep .q{margin:0 0 .5em 0;break-inside:avoid;}' +
    '.prep .q .enonce{font-weight:700;}' +
    '.prep .q .num{display:inline-block;min-width:1.5em;}' +
    '.prep .q .detail{margin:.1em 0 0 1.5em;}' +
    '.prep .q .lib{font-weight:700;color:#222;}' +
    '.prep .delicate{display:inline-block;border:1px solid #222;border-radius:3px;font-size:.72em;font-weight:700;padding:0 .35em;margin-left:.5em;letter-spacing:.03em;vertical-align:.1em;white-space:nowrap;}' +
    '.prep h2{font-size:1.1em;margin:.9em 0 .3em 0;padding-left:.5em;border-left:4px solid #222;}' +
    '.prep ul{margin:.1em 0 0 0;padding-left:1.2em;}' +
    '.prep li{margin:0 0 .15em 0;}' +
    '.prep .conseils{display:grid;grid-template-columns:repeat(3,1fr);gap:.8em;}' +
    '.prep .conseils h3{font-size:1em;margin:0 0 .2em 0;}' +
    '.prep .bloc{break-inside:avoid;}' +
    '.prep .tete,.prep .q,.prep .bloc,.prep .pied{display:flow-root;}' +
    '.prep .pied{margin-top:.9em;padding-top:.4em;border-top:1px solid #aaa;color:#444;font-size:.92em;}';
}

// Les blocs HTML d'une préparation. d = { metier, etiquette, niveauTitre ('' en mode général), prep : { questions, aMettreEnAvant } }.
// Renvoie { entete, suite, questions : [html], mettre : html ou '', conseils : html, pied : html }.
function ucpmBlocsHtmlPreparation(d) {
  var e = ucpmEchapperHtml;
  var prep = d.prep || {};
  var sous = [d.etiquette, d.niveauTitre ? 'niveau ' + d.niveauTitre.toLowerCase() : '', 'Document personnel, à ne pas envoyer'].filter(Boolean).join(' · ');
  var entete = '<div class="tete"><h1>Préparer mon entretien : ' + e(d.metier) + '</h1><p class="sous">' + e(sous) + '</p></div>';
  var suite = '<div class="tete"><p class="suite">Préparer mon entretien : ' + e(d.metier) + ' (suite)</p></div>';
  var questions = (prep.questions || []).map(function (q, i) {
    return '<div class="q"><p class="enonce"><span class="num">' + (i + 1) + '.</span>' + e(q.question) + (q.delicate ? '<span class="delicate">QUESTION DÉLICATE</span>' : '') + '</p>' +
      (q.attente ? '<p class="detail"><span class="lib">Ce que le recruteur cherche :</span> ' + e(q.attente) + '</p>' : '') +
      (q.piste ? '<p class="detail"><span class="lib">Une piste :</span> ' + e(q.piste) + '</p>' : '') +
      (q.relance ? '<p class="detail"><span class="lib">Il peut relancer :</span> ' + e(q.relance) + '</p>' : '') + '</div>';
  });
  var mettre = (prep.aMettreEnAvant && prep.aMettreEnAvant.length)
    ? '<div class="bloc"><h2>Ce que vous pouvez mettre en avant</h2><ul>' + prep.aMettreEnAvant.map(function (a) { return '<li>' + e(a) + '</li>'; }).join('') + '</ul></div>' : '';
  var c = UCPM_CONSEILS_ENTRETIEN;
  var colonne = function (titre, liste) { return '<div><h3>' + e(titre) + '</h3><ul>' + liste.map(function (x) { return '<li>' + e(x) + '</li>'; }).join('') + '</ul></div>'; };
  var conseils = '<div class="bloc"><h2>Savoir-être, attitude et comportement</h2><div class="conseils">' + colonne('Avant', c.avant) + colonne('Pendant', c.pendant) + colonne('Après', c.apres) + '</div></div>';
  var pied = '<p class="pied">' + e(c.rassurance) + '</p>';
  return { entete: entete, suite: suite, questions: questions, mettre: mettre, conseils: conseils, pied: pied };
}

// Les blocs répartis sur les pages, dans l'ordre : chaque question, « à mettre en avant », conseils, pied.
function ucpmListeBlocsPreparation(blocs) { return [].concat(blocs.questions, [blocs.mettre, blocs.conseils, blocs.pied]); }

// Une page A4 : en-tête (première page) ou rappel (pages suivantes), puis les blocs d'indices donnés. taillePt : corps du texte.
function ucpmHtmlPagePreparation(blocs, indices, options) {
  var o = options || {};
  var tous = ucpmListeBlocsPreparation(blocs);
  return '<div class="prep" style="font-size:' + (o.taillePt || 11) + 'pt;">' + (o.premiere ? blocs.entete : blocs.suite) +
    indices.map(function (i) { return tous[i]; }).join('') + '</div>';
}

// Répartit des blocs (hauteurs en pixels, dans l'ordre) sur des pages : un bloc n'est jamais coupé ; un bloc plus haut qu'une page reste seul sur la sienne.
// hauteurs : [px] ; capacites : { premiere : px disponibles sur la 1re page (après l'en-tête), suivantes : px disponibles sur les suivantes (après le rappel) }.
// Renvoie [[indices de blocs]] (une liste par page).
function ucpmRepartirBlocs(hauteurs, capacites) {
  var pages = [[]];
  var reste = capacites.premiere;
  (hauteurs || []).forEach(function (h, i) {
    var page = pages[pages.length - 1];
    if (h > reste && page.length) { pages.push([]); reste = capacites.suivantes; page = pages[pages.length - 1]; }
    page.push(i);
    reste -= h;
  });
  return pages;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    UCPM_PREP_NIVEAUX: UCPM_PREP_NIVEAUX, UCPM_PREP_SUJETS: UCPM_PREP_SUJETS, UCPM_PREP_NOMBRES: UCPM_PREP_NOMBRES, UCPM_PREP_MAX_QUESTIONS: UCPM_PREP_MAX_QUESTIONS,
    UCPM_PREP_MAX_METIERS_GENERAL: UCPM_PREP_MAX_METIERS_GENERAL, UCPM_PREP_SUJETS_REPONSE: UCPM_PREP_SUJETS_REPONSE, UCPM_PREP_SUJETS_DELICATS: UCPM_PREP_SUJETS_DELICATS,
    UCPM_CONSEILS_ENTRETIEN: UCPM_CONSEILS_ENTRETIEN,
    ucpmReglagesPreparationParDefaut: ucpmReglagesPreparationParDefaut, ucpmPreparationAvecRelance: ucpmPreparationAvecRelance, ucpmBlocReglagesPreparation: ucpmBlocReglagesPreparation,
    ucpmPeriodesSansActivite: ucpmPeriodesSansActivite, ucpmTextePeriodesSansActivite: ucpmTextePeriodesSansActivite,
    ucpmBlocMetiersPreparation: ucpmBlocMetiersPreparation, ucpmConstruirePromptPreparation: ucpmConstruirePromptPreparation, ucpmLireReponsePreparation: ucpmLireReponsePreparation,
    ucpmCssPreparation: ucpmCssPreparation, ucpmBlocsHtmlPreparation: ucpmBlocsHtmlPreparation, ucpmHtmlPagePreparation: ucpmHtmlPagePreparation, ucpmListeBlocsPreparation: ucpmListeBlocsPreparation, ucpmRepartirBlocs: ucpmRepartirBlocs,
    UCPM_PREP_TAILLES_PT: UCPM_PREP_TAILLES_PT, UCPM_PREP_HAUTEUR_MM: UCPM_PREP_HAUTEUR_MM, UCPM_PREP_MARGE_MM: UCPM_PREP_MARGE_MM, UCPM_PREP_LARGEUR_MM: UCPM_PREP_LARGEUR_MM, UCPM_PREP_MARGE_LATERALE_MM: UCPM_PREP_MARGE_LATERALE_MM,
    ucpmFusionnerPreparations: ucpmFusionnerPreparations, ucpmCiblesPreparation: ucpmCiblesPreparation, ucpmPreparationTropDeMetiers: ucpmPreparationTropDeMetiers, ucpmSignesPreparation: ucpmSignesPreparation
  };
}
