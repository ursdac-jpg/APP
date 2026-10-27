const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const F = require('../modules/mes-competences/filet.js');
const L = require('../modules/mes-competences/logique.js');
const E = require('../scripts/essaiMesCompetences/essai.js');
const { PROFILS } = require('../scripts/essaiMesCompetences/profils.js');

const REP = path.join(__dirname, '..', 'docs', 'essais_mes_competences', 'reponses');
const lire = (nom) => fs.readFileSync(path.join(REP, nom), 'utf8');
const profil = (id) => PROFILS.filter((p) => p.id === id)[0];
const logistique = profil('logistique_cv_seul');

function etatPremierPassage(fichier, id) {
  const f = F.filtrerReponse(lire(fichier), profil(id).documents);
  return L.mesCompIntegrerPremierPassage(L.mesCompEtatInitial(), f);
}

// ---------- Documents ----------
test('on dépose jusqu’à 3 CV, 2 lettres de motivation et 3 lettres de recommandation, jamais plus', () => {
  let l = [];
  for (let i = 0; i < 3; i++) { const r = L.mesCompDocumentsAjouter(l, 'cv', 'CV ' + i); assert.equal(r.ajoute, true); l = r.liste; }
  assert.equal(L.mesCompDocumentsAjouter(l, 'cv', 'un quatrième').raison, 'plein');
  l = L.mesCompDocumentsAjouter(l, 'lettreMotivation', 'lettre').liste;
  l = L.mesCompDocumentsAjouter(l, 'lettreMotivation', 'lettre 2').liste;
  assert.equal(L.mesCompPlaceDisponible(l, 'lettreMotivation'), false);
  assert.equal(L.mesCompPlaceDisponible(l, 'recommandation'), true);
  assert.deepEqual(L.mesCompDocumentsCompter(l), { cv: 3, lettreMotivation: 2, recommandation: 0, total: 5 });
});

test('un texte vide ou un type inconnu n’est pas déposé ; la liste d’origine ne change pas', () => {
  const l = [];
  assert.equal(L.mesCompDocumentsAjouter(l, 'cv', '   ').raison, 'vide');
  assert.equal(L.mesCompDocumentsAjouter(l, 'facture', 'texte').raison, 'type');
  assert.equal(l.length, 0);
  const r = L.mesCompDocumentsAjouter(l, 'cv', '  texte  ');
  assert.equal(r.liste[0].texte, 'texte');
  assert.equal(l.length, 0);
});

test('retirer un document ; la raison de blocage disparaît dès qu’un document existe', () => {
  assert.equal(L.mesCompRaisonBlocageDocuments([]), 'Déposez au moins un document pour continuer.');
  const l = L.mesCompDocumentsAjouter([], 'cv', 'CV').liste;
  assert.equal(L.mesCompRaisonBlocageDocuments(l), '');
  assert.deepEqual(L.mesCompDocumentsRetirer(l, l[0].id), []);
});

test('les documents partent dans l’ordre CV, lettres de motivation, recommandations (le numéro DOCUMENT n en dépend)', () => {
  let l = L.mesCompDocumentsAjouter([], 'recommandation', 'reco').liste;
  l = L.mesCompDocumentsAjouter(l, 'cv', 'cv').liste;
  l = L.mesCompDocumentsAjouter(l, 'lettreMotivation', 'lm').liste;
  assert.deepEqual(L.mesCompDocumentsPourEnvoi(l).map((d) => d.type), ['cv', 'lettreMotivation', 'recommandation']);
});

// ---------- Messages ----------
test('le message du premier passage : prompt, sections numérotées, niveau seulement s’il est choisi', () => {
  const docs = [{ type: 'cv', texte: 'Mon CV' }, { type: 'lettreMotivation', texte: 'Ma lettre' }, { type: 'recommandation', texte: 'Sa lettre' }];
  const m = L.mesCompConstruireMessage('PROMPT\n', docs, 'auto');
  assert.ok(m.startsWith('PROMPT\n\nDOCUMENT 1 - CV\n\nMon CV\n'));
  assert.ok(m.includes('DOCUMENT 2 - LETTRE DE MOTIVATION') && m.includes('DOCUMENT 3 - LETTRE DE RECOMMANDATION (écrite par une autre personne)'));
  assert.ok(!m.includes('NIVEAU DU POSTE'));
  assert.ok(L.mesCompConstruireMessage('P', docs, 'cadre').includes('NIVEAU DU POSTE CHOISI PAR LA PERSONNE\n\nCadre ou direction'));
});

test('le banc d’essai et l’application construisent le même message (source unique)', () => {
  const m = E.messagePasse1(logistique);
  assert.equal(m, L.mesCompConstruireMessage(E.consigne(), logistique.documents, 'auto'));
  assert.ok(!/###\s*VERSION/.test(m), 'l’historique des versions ne part pas chez l’assistant');
  assert.ok(m.includes('# PROMPT : DÉCOUVRIR MES COMPÉTENCES'));
});

test('le message du second passage ne porte que les lignes à préciser et les réponses, pas la liste entière', () => {
  const p1 = lire('01_chatgpt.txt');
  const m = E.messagePasse2(logistique, p1, lire('01_reponses_personne_fictives.txt'));
  const fin = m.slice(m.lastIndexOf('COMPÉTENCES À PRÉCISER'));
  assert.equal((fin.match(/"libelle"/g) || []).length, 1);
  assert.ok(fin.includes('RÉPONSES DE LA PERSONNE AUX QUESTIONS DE PRÉCISION') && fin.includes('je donnais à chacun sa liste de colis'));
  assert.ok(!fin.includes('Préparer des colis'));
});

test('le nettoyage du prompt retire seulement les lignes « ### VERSION »', () => {
  assert.equal(L.mesCompNettoyerPrompt('# T\n### VERSION 6 historique\n\n\n\nsuite'), '# T\n\nsuite');
});

test('un message de plus de 45 000 caractères est signalé', () => {
  assert.equal(L.mesCompMessageTropLong('x'.repeat(45000)), false);
  assert.equal(L.mesCompMessageTropLong('x'.repeat(45001)), true);
  assert.ok(L.mesCompConstruireMessage(E.consigne(), logistique.documents, 'auto').length < L.MESCOMP_PLAFOND_CARACTERES);
});

// ---------- État, premier passage ----------
test('un état abîmé ou absent est remis en forme sans exception', () => {
  assert.deepEqual(L.mesCompNormaliserEtat(null), L.mesCompEtatInitial());
  const e = L.mesCompNormaliserEtat({ ecran: 'nimporte', documents: [{ type: 'cv', texte: 'a' }, { type: 'x', texte: 'b' }, 7], lignes: [{ libelle: ' ' }, { libelle: 'Charger', famille: 'bidon', confirmation: 'bidon' }], niveau: 'roi', options: { preuves: false } });
  assert.equal(e.ecran, 'documents');
  assert.equal(e.documents.length, 1);
  assert.equal(e.niveau, 'auto');
  assert.equal(e.lignes.length, 1);
  assert.equal(e.lignes[0].famille, 'savoirFaire');
  assert.equal(e.lignes[0].confirmation, 'relevee');
  assert.equal(e.options.preuves, false);
  assert.equal(e.options.oral, true);
});

test('premier passage : les lignes gardées sont rangées des mieux prouvées aux « à préciser », avec leurs identifiants', () => {
  const e = etatPremierPassage('04_perplexity.txt', 'technicien_maintenance');
  assert.equal(e.ecran, 'relecture');
  assert.equal(e.niveauPropose, 'technicien');
  assert.deepEqual(e.lignes.map((l) => l.id), ['c1', 'c2', 'c3', 'c4', 'c5', 'c6', 'c7']);
  assert.deepEqual(e.lignes.slice(0, 2).map((l) => l.confirmation), ['confirmee', 'confirmee']);
  const e1 = etatPremierPassage('01_chatgpt.txt', 'logistique_cv_seul');
  assert.equal(e1.lignes[e1.lignes.length - 1].confirmation, 'aPreciser');
});

test('les envies viennent de la réponse et ne sont jamais des lignes de compétence', () => {
  const e = etatPremierPassage('05_perplexity.txt', 'chef_equipe_niveau_cadre_choisi');
  assert.equal(e.envies.length, 1);
  assert.ok(e.envies[0].extrait.includes('responsabilités'));
  assert.ok(e.lignes.every((l) => !/responsabilit/i.test(l.libelle)));
});

// ---------- Les trois gestes ----------
test('« C’est exact », « En partie exact » et « Je retire » : un même geste deux fois le retire', () => {
  let e = etatPremierPassage('04_perplexity.txt', 'technicien_maintenance');
  e = L.mesCompBasculerGeste(e, 'c1', 'ok');
  assert.equal(e.lignes[0].geste, 'ok');
  e = L.mesCompBasculerGeste(e, 'c1', 'ok');
  assert.equal(e.lignes[0].geste, '');
  e = L.mesCompBasculerGeste(e, 'c2', 'part');
  assert.equal(e.lignes[1].geste, 'part');
  assert.equal(e.lignes[1].texteCorrige, e.lignes[1].pourLeCV, 'la zone est pré-remplie avec la ligne pour le CV');
  e = L.mesCompCorrigerTexte(e, 'c2', 'Ma version');
  assert.equal(e.lignes[1].texteCorrige, 'Ma version');
  e = L.mesCompBasculerGeste(e, 'c2', 'non');
  assert.equal(e.lignes[1].geste, 'non');
  assert.equal(e.lignes[1].texteCorrige, '');
});

test('une envie n’a que « exact » et « je retire »', () => {
  let e = etatPremierPassage('05_perplexity.txt', 'chef_equipe_niveau_cadre_choisi');
  e = L.mesCompBasculerGeste(e, 'e1', 'part');
  assert.equal(e.envies[0].geste, '');
  e = L.mesCompBasculerGeste(e, 'e1', 'ok');
  assert.equal(e.envies[0].geste, 'ok');
});

test('le décompte et la phrase de la barre : rien de gardé bloque, des lignes non relues sont annoncées', () => {
  let e = etatPremierPassage('04_perplexity.txt', 'technicien_maintenance');
  assert.equal(L.mesCompPeutContinuerRelecture(e), false);
  assert.equal(L.mesCompPhraseRelecture(e), 'Gardez au moins une ligne pour continuer.');
  e = L.mesCompBasculerGeste(e, 'c1', 'ok');
  assert.deepEqual(L.mesCompCompter(e), { gardees: 1, retirees: 0, reste: 6 });
  assert.equal(L.mesCompPhraseRelecture(e), 'Il vous reste 6 lignes à relire ou à passer.');
  ['c2', 'c3', 'c4', 'c5', 'c6'].forEach((id) => { e = L.mesCompBasculerGeste(e, id, 'ok'); });
  e = L.mesCompBasculerGeste(e, 'c7', 'non');
  assert.equal(L.mesCompPhraseRelecture(e), 'Vous avez gardé 6 lignes.');
  assert.equal(L.mesCompPeutContinuerRelecture(e), true);
});

// ---------- Second passage ----------
test('second passage : la ligne à préciser devient confirmée, les autres ne bougent pas d’un caractère', () => {
  let e = etatPremierPassage('01_chatgpt.txt', 'logistique_cv_seul');
  const avant = JSON.parse(JSON.stringify(e.lignes));
  const aPreciser = L.mesCompLignesAPreciser(e);
  assert.equal(aPreciser.length, 1);
  assert.equal(L.mesCompPreparerSecondPassage(e), null, 'aucune réponse : rien à envoyer');
  e = L.mesCompPoserReponse(e, aPreciser[0].id, lire('01_reponses_personne_fictives.txt'));
  const prep = L.mesCompPreparerSecondPassage(e);
  assert.equal(prep.lignesSchema.length, 1);
  assert.deepEqual(prep.libelles, [aPreciser[0].libelle]);
  const f = F.filtrerReponse(lire('01_passe2v6_perplexity.txt'), logistique.documents, { secondPassage: true, reponsesPersonne: lire('01_reponses_personne_fictives.txt'), questionsPosees: prep.libelles });
  assert.equal(f.ok, true);
  const apres = L.mesCompIntegrerSecondPassage(e, f);
  const ligne = apres.lignes.filter((l) => l.id === aPreciser[0].id)[0];
  assert.equal(ligne.confirmation, 'confirmee');
  assert.ok(ligne.preuves.some((p) => p.typeDocument === 'reponse'));
  assert.equal(ligne.question, '');
  assert.equal(apres.reponses[aPreciser[0].id], undefined);
  assert.deepEqual(apres.lignes.filter((l) => l.id !== aPreciser[0].id), avant.filter((l) => l.id !== aPreciser[0].id));
});

test('second passage : une réponse refusée par le filet laisse la ligne « à préciser » ; « je ne l’ai pas fait » retire la ligne', () => {
  let e = etatPremierPassage('01_chatgpt.txt', 'logistique_cv_seul');
  const id = L.mesCompLignesAPreciser(e)[0].id;
  e = L.mesCompPoserReponse(e, id, lire('01_reponses_personne_fictives.txt'));
  const prep = L.mesCompPreparerSecondPassage(e);
  const mauvais = F.filtrerReponse(lire('01_passe2v6_chatgpt.txt'), logistique.documents, { secondPassage: true, reponsesPersonne: lire('01_reponses_personne_fictives.txt'), questionsPosees: prep.libelles });
  const inchange = L.mesCompIntegrerSecondPassage(e, mauvais);
  assert.equal(inchange.lignes.filter((l) => l.id === id)[0].confirmation, 'aPreciser');
  const retire = L.mesCompIntegrerSecondPassage(e, { ok: true, competences: [], retirees: [prep.libelles[0]] });
  assert.equal(retire.lignes.some((l) => l.id === id), false);
});

test('« Je passe » sort la ligne des questions sans la garder', () => {
  let e = etatPremierPassage('01_chatgpt.txt', 'logistique_cv_seul');
  const id = L.mesCompLignesAPreciser(e)[0].id;
  e = L.mesCompPasserLigne(e, id);
  assert.equal(L.mesCompLignesAPreciser(e).length, 0);
  assert.equal(L.mesCompCompter(e).reste, e.lignes.length - 1);
  e = L.mesCompReprendreLigne(e, id);
  assert.equal(L.mesCompLignesAPreciser(e).length, 1, 'la ligne redevient une ligne à préciser');
});

// ---------- Document final ----------
test('le document ne contient que les lignes gardées, jamais une ligne « à préciser » ni une ligne retirée', () => {
  let e = etatPremierPassage('01_chatgpt.txt', 'logistique_cv_seul');
  e = L.mesCompBasculerGeste(e, 'c1', 'ok');
  e = L.mesCompBasculerGeste(e, 'c2', 'non');
  e = L.mesCompBasculerGeste(e, 'c3', 'part', 'Ma phrase à moi');
  const doc = L.mesCompDocumentFinal(e);
  const libelles = [].concat.apply([], doc.sections.map((s) => s.lignes.map((l) => l.libelle)));
  assert.deepEqual(libelles, [e.lignes[0].libelle, e.lignes[2].libelle]);
  assert.ok(!libelles.includes(e.lignes[e.lignes.length - 1].libelle));
  const corrigee = doc.sections[0].lignes.filter((l) => l.libelle === e.lignes[2].libelle)[0];
  assert.equal(corrigee.pourLeCV, 'Ma phrase à moi');
  assert.equal(corrigee.ecritParMoi, true);
});

test('le texte du document suit les cases « phrases de mes documents » et « phrases pour l’oral », et le nom est facultatif', () => {
  let e = etatPremierPassage('04_perplexity.txt', 'technicien_maintenance');
  e = L.mesCompBasculerGeste(e, 'c1', 'ok');
  const complet = L.mesCompTexteDocument(L.mesCompDocumentFinal(e));
  assert.ok(/Mon CV : « /.test(complet) && /À l’oral : « /.test(complet));
  assert.ok(complet.includes('(confirmé par une autre personne)'));
  const sans = L.mesCompTexteDocument(L.mesCompDocumentFinal(e, { preuves: false, oral: false }));
  assert.ok(!/Mon CV : « /.test(sans) && !/À l’oral/.test(sans));
  assert.equal(L.mesCompDocumentFinal(e).nom, '');
  assert.equal(L.mesCompDocumentFinal(e, { nom: true, nomTexte: 'Alex' }).nom, 'Alex');
  assert.equal(L.mesCompDocumentFinal(e, { nom: false, nomTexte: 'Alex' }).nom, '');
});

test('les envies gardées ont leur section ; aucune autre partie ne lit le document avant « Terminer »', () => {
  let e = etatPremierPassage('05_perplexity.txt', 'chef_equipe_niveau_cadre_choisi');
  e = L.mesCompBasculerGeste(e, 'c1', 'ok');
  e = L.mesCompBasculerGeste(e, 'e1', 'ok');
  assert.equal(L.mesCompDocumentFinal(e).envies.length, 1);
  assert.ok(L.mesCompTexteDocument(L.mesCompDocumentFinal(e)).includes('CE QUI ME DONNE ENVIE'));
  assert.equal(L.mesCompObtenirDocument(e), null);
  e.termine = true;
  assert.equal(L.mesCompObtenirDocument(e).titre, 'Mes compétences');
});

test('rien n’est gardé : le document est vide et n’est pas rendu', () => {
  let e = etatPremierPassage('04_perplexity.txt', 'technicien_maintenance');
  e.termine = true;
  assert.equal(L.mesCompDocumentFinal(e).vide, true);
  assert.equal(L.mesCompObtenirDocument(e), null);
});
