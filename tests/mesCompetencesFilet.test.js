const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const F = require('../modules/mes-competences/filet.js');
const { PROFILS } = require('../scripts/essaiMesCompetences/profils.js');

const REP = path.join(__dirname, '..', 'docs', 'essais_mes_competences', 'reponses');
const lire = (nom) => fs.readFileSync(path.join(REP, nom), 'utf8');
const profil = (id) => PROFILS.filter((p) => p.id === id)[0];
const docs = (id) => profil(id).documents;
const nbJson = (texte) => JSON.parse(texte.match(/```json\n([\s\S]*?)\n```/)[1]).competences.length;

test('les vraies réponses des assistants (profils 01, 04, 05) passent le filet sans ligne écartée', () => {
  [['01_chatgpt.txt', 'logistique_cv_seul'], ['01_perplexity.txt', 'logistique_cv_seul'], ['04_chatgpt.txt', 'technicien_maintenance'],
    ['04_perplexity.txt', 'technicien_maintenance'], ['05_chatgpt.txt', 'chef_equipe_niveau_cadre_choisi'], ['05_perplexity.txt', 'chef_equipe_niveau_cadre_choisi']].forEach(([f, id]) => {
    const texte = lire(f);
    const r = F.filtrerReponse(texte, docs(id));
    assert.equal(r.ok, true, f);
    assert.deepEqual(r.ecartees, [], f);
    assert.equal(r.competences.length, nbJson(texte), f);
  });
});

test('une phrase de preuve qui n’est pas dans les documents écarte la ligne (invention)', () => {
  const texte = lire('01_perplexity.txt').replace('Contrôle des références avant la fermeture des colis', 'Contrôle qualité de toutes les expéditions européennes');
  const r = F.filtrerReponse(texte, docs('logistique_cv_seul'));
  assert.equal(r.ecartees.length, 1);
  assert.equal(r.ecartees[0].libelle, 'Contrôler les références');
  assert.ok(/ABSENT des documents/.test(r.ecartees[0].raisons.join(' ')));
  assert.equal(r.competences.length, nbJson(lire('01_perplexity.txt')) - 1);
});

test('un mot de santé ou de détention dans une ligne l’écarte, même dans un extrait', () => {
  const texte = lire('01_perplexity.txt').replace('"Qu\'est-ce qui vous aidait à préparer les bons colis sans erreur ?"', '"Votre maladie vous a-t-elle gêné ?"');
  const r = F.filtrerReponse(texte, docs('logistique_cv_seul'));
  assert.equal(r.ecartees.length, 1);
  assert.equal(r.ecartees[0].libelle, 'Préparer des colis');
  assert.ok(/contexte de vie/i.test(r.ecartees[0].raisons.join(' ')));
});

test('« vous êtes », tiret long et courriel écartent la ligne qui les porte', () => {
  const base = lire('01_perplexity.txt');
  const r1 = F.filtrerReponse(base.replace('Mettre les marchandises dans un camion pour qu\'elles partent à la livraison.', 'Vous êtes la personne qui charge les camions.'), docs('logistique_cv_seul'));
  assert.equal(r1.ecartees.length, 1);
  const r2 = F.filtrerReponse(base.replace('Je chargeais les camions et je filmais les palettes.', 'Je chargeais les camions — et je filmais les palettes.'), docs('logistique_cv_seul'));
  assert.equal(r2.ecartees.length, 1);
  const r3 = F.filtrerReponse(base.replace('Je chargeais les camions et je filmais les palettes.', 'Contactez-moi à jean.dupont@exemple.fr pour charger les camions.'), docs('logistique_cv_seul'));
  assert.equal(r3.ecartees.length, 1);
});

test('« confirmée » sans source tierce est rétrogradée en « relevée », jamais écartée ni gardée telle quelle', () => {
  const texte = lire('01_perplexity.txt').replace(/("libelle":"Préparer des colis"[\s\S]*?"confirmation":)"relevee"/, '$1"confirmee"');
  assert.ok(texte.includes('"confirmation":"confirmee"'));
  const r = F.filtrerReponse(texte, docs('logistique_cv_seul'));
  assert.deepEqual(r.ecartees, []);
  assert.deepEqual(r.retrogradees, ['Préparer des colis']);
  assert.equal(r.competences.filter((c) => c.libelle === 'Préparer des colis')[0].confirmation, 'relevee');
});

test('une vraie confirmation (CV et lettre de recommandation) reste confirmée', () => {
  const r = F.filtrerReponse(lire('04_perplexity.txt'), docs('technicien_maintenance'));
  assert.deepEqual(r.competences.filter((c) => c.confirmation === 'confirmee').map((c) => c.libelle).sort(), ['Dépanner les machines de production', 'Former de nouveaux techniciens']);
  assert.deepEqual(r.retrogradees, []);
});

test('une réponse coupée, illisible ou sans JSON est une erreur fatale, pas une liste vide', () => {
  assert.deepEqual(F.filtrerReponse('Voici : ```json\n{ "competences": [', docs('logistique_cv_seul')), { ok: false, fatale: 'coupee' });
  assert.equal(F.filtrerReponse('Voici : ```json\n{ pas du json }\n```', docs('logistique_cv_seul')).fatale, 'illisible');
  assert.equal(F.filtrerReponse('Je ne peux pas répondre.', docs('logistique_cv_seul')).fatale, 'illisible');
});

test('« analyseImpossible » donne un résultat vide, sans erreur', () => {
  const r = F.filtrerReponse('```json\n{ "analyseImpossible": true, "message": "x" }\n```', docs('logistique_cv_seul'));
  assert.equal(r.ok, true);
  assert.equal(r.vide, true);
  assert.deepEqual(r.competences, []);
});

test('une envie dont la phrase n’est pas dans les documents est écartée ; une vraie envie est gardée', () => {
  const ok = F.filtrerReponse(lire('05_perplexity.txt'), docs('chef_equipe_niveau_cadre_choisi'));
  assert.equal(ok.motivations.length, 1);
  const texte = lire('05_perplexity.txt').replace('Je souhaite aujourd’hui prendre davantage de responsabilités dans l’organisation d’un entrepôt', 'Je rêve de diriger tout un groupe international');
  const r = F.filtrerReponse(texte, docs('chef_equipe_niveau_cadre_choisi'));
  assert.equal(r.motivations.length, 0);
  assert.equal(r.motivationsEcartees.length, 1);
});

test('le niveau du poste est repris seulement s’il est valide', () => {
  assert.equal(F.filtrerReponse(lire('04_perplexity.txt'), docs('technicien_maintenance')).niveauPoste, 'technicien');
  const faux = lire('04_perplexity.txt').replace('"niveauPoste": "technicien"', '"niveauPoste": "directeur"');
  assert.equal(F.filtrerReponse(faux, docs('technicien_maintenance')).niveauPoste, null);
});

test('second passage « lignes seules » : la ligne demandée est gardée, une ligne renommée ou coupée est écartée', () => {
  const reps = lire('01_reponses_personne_fictives.txt');
  const posees = ['Encadrer l’équipe du samedi'.replace('’', '\'')];
  const bon = F.filtrerReponse(lire('01_passe2v6_perplexity.txt'), docs('logistique_cv_seul'), { secondPassage: true, reponsesPersonne: reps, questionsPosees: posees });
  assert.equal(bon.competences.length, 1);
  assert.deepEqual(bon.ecartees, []);
  const mauvais = F.filtrerReponse(lire('01_passe2v6_chatgpt.txt'), docs('logistique_cv_seul'), { secondPassage: true, reponsesPersonne: reps, questionsPosees: posees });
  assert.equal(mauvais.competences.length, 0);
  assert.equal(mauvais.ecartees.length, 2);
});

test('le détail des constats donne la ligne concernée (rang dans la réponse)', () => {
  const texte = lire('01_perplexity.txt').replace('Contrôle des références avant la fermeture des colis', 'Phrase inventée sans rapport');
  const r = F.verifier(texte, { documents: docs('logistique_cv_seul') });
  const d = r.details.filter((x) => x.ligne === 1 && x.gravite === 'erreur');
  assert.ok(d.length >= 1);
  assert.ok(r.details.every((x) => x.ligne === null || Number.isInteger(x.ligne)));
});

test('le filet est une source unique : le banc d’essai importe le même objet', () => {
  assert.equal(require('../scripts/essaiMesCompetences/verifier.js'), F);
});
