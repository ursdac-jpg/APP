/* ============================================================
   tests/panneauCandidaturePartage.test.js  (2026-09-29)
   ------------------------------------------------------------
   Panneau « Candidature » partagé : lecture de la situation et de la cible,
   métier proposé depuis le CV, récapitulatif avant l'envoi ; et règles
   « un CV n'existe que s'il est valide » (points désactivés, dépôt annulé).
   L'interface elle-même reste vérifiée au navigateur (pas de jsdom).
   ============================================================ */
const test = require('node:test');
const assert = require('node:assert/strict');

// metiers.js se charge AVANT le stub DOM (il garde ses accès au DOM derrière typeof document).
const metiers = require('../data/metiers.js');
require('./_domStub').installerStubDom();
const app = require('../js/app.js');

function poserDossier(champs) {
  // window.dossier === le dossier du module app.js (même objet) : on ne le
  // remplace pas, on remet ses champs à zéro puis on pose ceux du test.
  const d = global.dossier;
  d.objectif = null; d.metierCible = null; d.secteurCible = null;
  d.titreCV = ''; d.experiences = [];
  d.rechercheCandidature = { entreprise: '', site: '', lienOffre: '', civiliteRecruteur: '', nomRecruteur: '', mettreEnAvantCouleurEntreprise: false, couleurEntreprise: '' };
  Object.assign(d, champs || {});
  return d;
}

test('contexteCandidaturePourAnalyse : reconversion + métier => phrase de situation et cible', () => {
  poserDossier({ objectif: 'reconversion', metierCible: 'Magasinier' });
  const c = app.contexteCandidaturePourAnalyse();
  assert.match(c.situation, /Changement de métier/);
  assert.match(c.situation, /pas une incohérence/);
  assert.equal(c.cible, 'Métier visé : Magasinier');
});

test('contexteCandidaturePourAnalyse : domaine sans métier => « Domaine visé », rien => vide', () => {
  poserDossier({ objectif: 'stage', secteurCible: 'Logistique' });
  assert.equal(app.contexteCandidaturePourAnalyse().cible, 'Domaine visé (pas un métier précis) : Logistique');
  poserDossier();
  const vide = app.contexteCandidaturePourAnalyse();
  assert.equal(vide.situation, '');
  assert.equal(vide.cible, '');
});

test('metierSuggereDepuisCV : titre du CV, sinon expérience en cours, sinon première, sinon vide', () => {
  poserDossier({ titreCV: 'Magasinier' });
  assert.equal(app.metierSuggereDepuisCV(), 'Magasinier');
  poserDossier({ experiences: [{ poste: 'Cariste', dateFin: '2018' }, { poste: 'Préparateur de commandes', dateFin: 'en cours' }] });
  assert.equal(app.metierSuggereDepuisCV(), 'Préparateur de commandes');
  poserDossier({ experiences: [{ poste: 'Cariste', dateFin: '2018' }, { poste: 'Agent', dateFin: '2020' }] });
  assert.equal(app.metierSuggereDepuisCV(), 'Cariste');
  poserDossier();
  assert.equal(app.metierSuggereDepuisCV(), '');
});

test('htmlRecapContexteEnvoi : lignes demandées seulement, « non précisé » pour le vide, offre résumée, texte échappé', () => {
  poserDossier({ objectif: 'offre', metierCible: 'Vendeur <b>' });
  global.dossier.rechercheCandidature.texteOffre = 'Vendeur H/F en boulangerie, CDI, temps plein, Limoges centre-ville, débutant accepté';
  const html = app.htmlRecapContexteEnvoi(['cible', 'offre', 'entreprise']);
  assert.match(html, /Ce que l’assistant saura/);
  assert.match(html, /Métier ou domaine visé :<\/strong> Vendeur &lt;b&gt;/);
  assert.match(html, /fournie \(Vendeur H\/F en boulangerie/);
  assert.match(html, /…\)/);
  assert.match(html, /Entreprise :<\/strong> <span class="text-muted">non précisé/);
  assert.doesNotMatch(html, /Situation/);
  assert.match(html, /Retour/);
});

test('htmlRecapContexteEnvoi : tout rempli => pas de phrase « Retour » ; aucune ligne demandée => vide', () => {
  poserDossier({ objectif: 'spontanee', metierCible: 'Vendeur' });
  Object.assign(global.dossier.rechercheCandidature, { entreprise: 'Boulangerie Martin', texteOffre: 'Offre', typeStructure: 'Artisanat / commerce de proximité' });
  const html = app.htmlRecapContexteEnvoi(['situation', 'cible', 'offre', 'entreprise', 'structure']);
  assert.doesNotMatch(html, /Retour/);
  assert.equal(app.htmlRecapContexteEnvoi([]), '');
});

// ---------- Points désactivés tant que le CV n'est pas valide ----------

function faireBloc(id) {
  const enfants = [];
  const classes = new Set();
  const corps = {
    attrs: {},
    setAttribute(k, v) { this.attrs[k] = v; },
    removeAttribute(k) { delete this.attrs[k]; },
    hasAttribute(k) { return k in this.attrs; }
  };
  return {
    id,
    classList: { toggle(c, on) { if (on) { classes.add(c); } else { classes.delete(c); } }, contains: (c) => classes.has(c) },
    querySelector(sel) {
      if (sel.indexOf('.bloc-verrou-message') !== -1) { return enfants.filter((e) => e.classe === 'bloc-verrou-message')[0] || null; }
      return corps;
    },
    lastElementChild: corps,
    insertBefore(el) {
      el.remove = () => { const i = enfants.indexOf(el); if (i >= 0) { enfants.splice(i, 1); } };
      enfants.push(el);
    },
    _enfants: enfants,
    _corps: corps
  };
}

test('appliquerVerrouBlocs : bloc inactif => verrouillé, inerte, message ; actif => libéré, message retiré', () => {
  const b = faireBloc('blocX');
  const blocs = { blocX: b };
  global.document = {
    getElementById: (id) => blocs[id] || null,
    createElement: () => {
      const e = { textContent: '' };
      Object.defineProperty(e, 'className', { set(v) { e.classe = v; }, get() { return e.classe; } });
      return e;
    }
  };
  metiers.appliquerVerrouBlocs([{ id: 'blocX', actif: false, message: 'Déposez d’abord votre CV' }]);
  assert.equal(b.classList.contains('bloc-verrouille'), true);
  assert.equal(b._corps.hasAttribute('inert'), true);
  assert.equal(b._enfants.length, 1);
  assert.match(b._enfants[0].textContent, /Déposez d’abord votre CV/);
  // rappelé deux fois : jamais de message en double
  metiers.appliquerVerrouBlocs([{ id: 'blocX', actif: false, message: 'Déposez d’abord votre CV' }]);
  assert.equal(b._enfants.length, 1);
  metiers.appliquerVerrouBlocs([{ id: 'blocX', actif: true }]);
  assert.equal(b.classList.contains('bloc-verrouille'), false);
  assert.equal(b._corps.hasAttribute('inert'), false);
  assert.equal(b._enfants.length, 0);
  // id inconnu : sans erreur
  metiers.appliquerVerrouBlocs([{ id: 'absent', actif: false }]);
});

test('fermerAssistantDepotCV : fermé sans validation => restauration, armée une seule fois ; validé => rien restauré', () => {
  global.document = { getElementById: () => null };
  let appels = 0;
  metiers._depotCVDefinirRestauration(() => { appels++; });
  metiers.fermerAssistantDepotCV();
  assert.equal(appels, 1);
  metiers.fermerAssistantDepotCV();          // plus rien d'armé
  assert.equal(appels, 1);
  // validé (désarmé) : la fermeture ne restaure rien
  metiers._depotCVDefinirRestauration(() => { appels++; });
  metiers._depotCVDefinirRestauration(null);
  metiers.fermerAssistantDepotCV();
  assert.equal(appels, 1);
});

// ---------- Formation : type et niveau presélectionnés (R3, 2026-09-29) ----------
// normaliserTexte est un global de data/metiers.js dans le navigateur.
global.normaliserTexte = metiers.normaliserTexte;

test('construireBrouillonDepuisFormation : « Titre professionnel » lu dans le champ niveau', () => {
  const b = app.construireBrouillonDepuisFormation({ niveau: 'Titre professionnel', intitule: 'Assistante de vie aux familles', annee: '2026' });
  assert.equal(b.typeCredential, 'titrepro');
  assert.equal(b.intitule, 'Assistante de vie aux familles');
});

test('construireBrouillonDepuisFormation : CQP, niveau lu dans le texte, diplôme avec niveau connu', () => {
  assert.equal(app.construireBrouillonDepuisFormation({ niveau: 'CQP', intitule: 'Employé de commerce' }).typeCredential, 'cqp');
  const tp = app.construireBrouillonDepuisFormation({ niveau: 'Titre professionnel niveau 3', intitule: 'Agent de propreté' });
  assert.equal(tp.typeCredential, 'titrepro');
  assert.equal(tp.niveauRNCP, 3);
  assert.equal(tp.niveauVisible, 'Niveau 3');
  const d = app.construireBrouillonDepuisFormation({ niveau: 'Bac +2', intitule: 'BTS Commerce' });
  assert.equal(d.typeCredential, 'diplome');
  assert.equal(d.niveauRNCP, 5);
  assert.equal(d.niveauVisible, 'Bac +2');
});

test('construireBrouillonDepuisFormation : rien de fiable => diplôme sans niveau (la personne choisit) ; type enregistré prioritaire', () => {
  const b = app.construireBrouillonDepuisFormation({ intitule: 'Formation interne' });
  assert.equal(b.typeCredential, 'diplome');
  assert.equal(b.niveauRNCP, null);
  assert.equal(app.construireBrouillonDepuisFormation({ typeCredential: 'cqp', niveau: 'Titre professionnel', intitule: 'X' }).typeCredential, 'cqp');
  assert.equal(app.construireBrouillonDepuisFormation({ intitule: 'Titre professionnel - Agent' }).typeCredential, 'titrepro');
});

// ---------- Identité captée dans le CV (R2 + R15, 2026-09-29) ----------

test('extraireIdentiteCapteeDepuisTexte : téléphone, courriel, code postal et ville captés ; rien de deviné', () => {
  const r = metiers.extraireIdentiteCapteeDepuisTexte('MARIE EXEMPLE\n07 49 90 77 34\nmarie.exemple@gmail.com\nBergerac, 24100\nAssistante de vie');
  assert.equal(r.valeurs.telephone, '0749907734');
  assert.equal(r.valeurs.email, 'marie.exemple@gmail.com');
  // Les deux mots sont écrits en majuscules : la casse ne dit pas lequel est le nom, donc rien n'est pré-rempli.
  assert.equal(r.valeurs.prenom, undefined);
  assert.equal(r.valeurs.nom, undefined);
  assert.deepEqual(r.suggestionNom, { prenom: 'Marie', nom: 'EXEMPLE' });
});

test('extraireIdentiteCapteeDepuisTexte : code postal + ville, indicatif +33, plusieurs téléphones signalés', () => {
  const r = metiers.extraireIdentiteCapteeDepuisTexte('Tél : +33 6 12 34 56 78 ou 01 23 45 67 89\n24100 Bergerac');
  assert.equal(r.valeurs.telephone, '0612345678');
  assert.equal(r.plusieurs.telephone, true);
  assert.equal(r.valeurs.codePostal, '24100');
  assert.equal(r.valeurs.ville, 'Bergerac');
});

test('extraireIdentiteCapteeDepuisTexte : « Nom : » rempli, nom croisé avec le courriel rempli aussi (certain), rien => null', () => {
  const etiquete = metiers.extraireIdentiteCapteeDepuisTexte('Nom : Dupont\nPrénom : Léa');
  assert.equal(etiquete.valeurs.nom, 'Dupont');
  assert.equal(etiquete.valeurs.prenom, 'Léa');
  // Décision de Denis 2026-09-30 : le nom est en majuscules, le prénom n'a que sa première lettre en majuscule.
  const croise = metiers.extraireIdentiteCapteeDepuisTexte('Josianne BEKONO\njosianne.bekono@gmail.com');
  assert.equal(croise.valeurs.nom, 'BEKONO');
  assert.equal(croise.valeurs.prenom, 'Josianne');
  assert.equal(croise.suggestionNom, null);
  // Ordre inverse dans le CV ET dans le courriel : c'est la casse qui tranche, jamais l'ordre du courriel.
  const inverse = metiers.extraireIdentiteCapteeDepuisTexte('BEKONO Josianne\nbekono.josianne@gmail.com');
  assert.equal(inverse.valeurs.nom, 'BEKONO');
  assert.equal(inverse.valeurs.prenom, 'Josianne');
  const inverse2 = metiers.extraireIdentiteCapteeDepuisTexte('BEKONO Josianne\njosianne.bekono@gmail.com');
  assert.equal(inverse2.valeurs.nom, 'BEKONO');
  assert.equal(inverse2.valeurs.prenom, 'Josianne');
  // Même casse pour les deux mots : rien de pré-rempli, une suggestion seulement.
  const ambigu = metiers.extraireIdentiteCapteeDepuisTexte('Josianne Bekono\njosianne.bekono@gmail.com');
  assert.equal(ambigu.valeurs.nom, undefined);
  assert.deepEqual(ambigu.suggestionNom, { prenom: 'Josianne', nom: 'Bekono' });
  // Un nom sans lien avec le courriel reste une simple suggestion, jamais pré-rempli.
  const devine = metiers.extraireIdentiteCapteeDepuisTexte("Je m'appelle Paul Durand" + String.fromCharCode(10) + "contact@exemple.fr");
  assert.equal(devine.valeurs.nom, undefined);
  assert.deepEqual(devine.suggestionNom, { prenom: 'Paul', nom: 'Durand' });
  assert.equal(metiers.extraireIdentiteCapteeDepuisTexte('Assistante de vie aux familles, stage 2026'), null);
  assert.equal(metiers.extraireIdentiteCapteeDepuisTexte(''), null);
});

test('extraireIdentiteCapteeDepuisTexte : forme « Ville, 24100 » lue aussi', () => {
  const r = metiers.extraireIdentiteCapteeDepuisTexte('0749907734\nBergerac, 24100\nTitulaire du titre');
  assert.equal(r.valeurs.codePostal, '24100');
  assert.equal(r.valeurs.ville, 'Bergerac');
});

// ---------- R8-1 : une expérience personnelle reste personnelle (2026-09-29) ----------

test('_reformulerCvSeparerExperiencesPersonnelles : « Expérience personnelle » reste personnelle, le reste est professionnel', () => {
  const r = metiers._reformulerCvSeparerExperiencesPersonnelles([
    { poste: 'Assistante de vie aux familles - Stage', entreprise: 'CIAS de Beaumont' },
    { poste: 'Accompagnement de personnes âgées', entreprise: 'Expérience personnelle' },
    { poste: 'Entretien chez les particuliers', entreprise: '' },
    { poste: 'Aide aux devoirs', entreprise: 'Bénévolat' }
  ]);
  assert.deepEqual(r.pro.map((e) => e.poste), ['Assistante de vie aux familles - Stage', 'Entretien chez les particuliers']);
  assert.deepEqual(r.perso.map((e) => e.poste), ['Accompagnement de personnes âgées', 'Aide aux devoirs']);
});

test('normaliserTexte confond « cœur » et « coeur » (assistants qui écrivent sans ligature)', () => {
  assert.strictEqual(normaliserTexte('Bénévole aux Restos du cœur'), normaliserTexte('Bénévole aux Restos du coeur'));
  assert.strictEqual(normaliserTexte('Sœur'), 'soeur');
});

// ---------- Corrections du 2026-09-30 : réponse à un point à vérifier, expérience personnelle, savoir-être ----------

test("précision d'un point à vérifier : « sSsT » devient « SST » seulement si le passage cité correspond exactement", () => {
  const v = { certifications: ['sSsT', 'Permis B'], loisirs: ['Danse'] };
  assert.equal(metiers.remplacerPrecisionDansListes(v, 'ssst', 'SST'), true);
  assert.deepEqual(v.certifications, ['SST', 'Permis B']);
  assert.equal(metiers.remplacerPrecisionDansListes(v, 'introuvable', 'X'), false);
  assert.deepEqual(v.loisirs, ['Danse']);
});

test('reformuler : les qualités « Compétences comportementales : ... » vont dans savoirEtre, pas dans les informations complémentaires', () => {
  const s = metiers._reformulerCvNettoyerStruct({ informationsComplementaires: ['Compétences comportementales : créativité, rigueur, écoute.', 'Compétences médico-sociales.'], savoirEtre: ['Rigueur'] });
  assert.deepEqual(s.savoirEtre, ['Rigueur', 'Créativité', 'Écoute']);
  assert.deepEqual(s.informationsComplementaires, ['Compétences médico-sociales.']);
});

test('reformuler : une expérience personnelle nommée « Expérience personnelle » prend le titre de sa première mission', () => {
  assert.equal(metiers._reformulerCvTitreExperiencePerso({ poste: 'Expérience personnelle', missions: ['Accompagner des personnes âgées dans leur quotidien.'] }), 'Accompagner des personnes âgées dans leur quotidien');
  assert.equal(metiers._reformulerCvTitreExperiencePerso({ poste: 'Aide à un proche', missions: ['x'] }), 'Aide à un proche');
});

test("certification d'intitulé bizarre (« sSsT ») : l'application pose elle-même la question, une seule fois, sans toucher aux intitulés normaux", () => {
  const pts = metiers.pointsCertificationsDouteuses([['sSsT', 'SST', 'CACES 3', 'PSC1'], ['sSsT', 'HACCP']], []);
  assert.equal(pts.length, 1);
  assert.equal(pts[0].extrait, 'sSsT');
  assert.equal(metiers.pointsCertificationsDouteuses([['sSsT']], [{ extrait: 'ssst' }]).length, 0, 'pas de doublon avec un point déjà posé par l\'assistant');
  const brut = JSON.stringify({ pasUnCV: false, pointsAVerifier: [], propositions: [{ certifications: ['sSsT'] }, { certifications: ['sSsT'] }] });
  const parse = metiers._reformulerCvParserReponse(brut, { extraireJSON: (t) => JSON.parse(t) });
  assert.equal(parse.pointsAVerifier.length, 1);
});

test('certifications : « sSsT » proche de SST => suggestion ; intitulés exacts, catégories et diplômes courants => aucune question', () => {
  const c = require('../data/certificationsConnues.js');
  assert.equal(c.suggestionCertificationConnue('sSsT'), 'SST');
  assert.equal(c.suggestionCertificationConnue('Hacpp'), 'HACCP');
  assert.equal(c.suggestionCertificationConnue('SST (Sauveteur Secouriste du Travail)'), null);
  ['SST', 'CACES 3', 'PSC', 'Permis B', 'TOEIC 800', 'Word', 'CAP'].forEach((t) => assert.equal(c.suggestionCertificationConnue(t), null, t));
  const pts = metiers.pointsCertificationsDouteuses([['sSsT', 'CACES 3', 'Hacpp']], []);
  assert.equal(pts.length, 2);
  assert.equal(pts[0].suggestion, 'SST');
  assert.match(pts[0].question, /Vouliez-vous dire « SST »/);
  assert.equal(metiers.pointsCertificationsDouteuses([['a1Bc', 'sSsT', 'Hacpp', 'HccP', 'ssST']], []).length, 3, 'au plus 3 questions par import');
});
