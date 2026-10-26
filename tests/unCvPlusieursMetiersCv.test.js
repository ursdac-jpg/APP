const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

// Logique pure des pages 4 (accroches) et 6 (lettres) : demandes à l'assistant et lecture des réponses. Les fonctions des autres fichiers du module
// sont globales dans le navigateur : on les fournit ici.
const base = require('../modules/un-cv-plusieurs-metiers/logique.js');
Object.assign(global, base);
const metiers = require('../modules/un-cv-plusieurs-metiers/logiqueMetiers.js');
Object.assign(global, metiers);
const cv = require('../modules/un-cv-plusieurs-metiers/logiqueCv.js');

const racine = path.join(__dirname, '..');
const lire = (p) => fs.readFileSync(path.join(racine, p), 'utf8');
const rep = (nom) => lire('docs/essais_prompts_ucpm/reponses/' + nom);
const LIGNES = {
  spontanee: 'ligne spontanée', offre: 'ligne offre', reconversion: 'ligne reconversion', stage: 'ligne stage', pmsmp: 'ligne immersion', alternance: 'ligne alternance', formation: 'ligne formation'
};

function etatDeuxMetiers() {
  const e = metiers.ucpmCreerListes({ intitulesMemeMetier: [{ masculin: 'Agent technique', feminin: 'Agent technique', retrouveDansLeCV: '' }], autresMetiers: [
    { masculin: 'Peintre en bâtiment', feminin: 'Peintre en bâtiment', retrouveDansLeCV: ['a', 'b'], aVerifier: '' },
    { masculin: 'Électricien d’entretien', feminin: 'Électricienne d’entretien', retrouveDansLeCV: ['a', 'b'], aVerifier: 'Habilitation à vérifier' }] });
  metiers.ucpmBasculerCoche(e, 'g1', true); metiers.ucpmBasculerCoche(e, 'd1', true); metiers.ucpmBasculerCoche(e, 'd2', true);
  const o = metiers.ucpmObjectifVide('alternance'); o.secteur = 'bâtiment'; o.dureeQuantite = '2'; o.dureeUnite = 'ans';
  metiers.ucpmAppliquerObjectif(e, 'tous', null, o);
  e.reponseMetiers = { synthese: { metier: 'Agent technique' } };
  return e;
}

test('genre : trois phrases, la phrase « non précisé » interdit tout accord', () => {
  assert.match(cv.ucpmGenreTexte('f'), /Féminin/);
  assert.match(cv.ucpmGenreTexte('m'), /Masculin/);
  assert.match(cv.ucpmGenreTexte(''), /aucun mot qui s’accorde/);
});

test('accroches : le CV de référence n’a pas d’accroche à demander, les autres cochés oui', () => {
  const e = etatDeuxMetiers();
  const ids = cv.ucpmEntreesPourAccroches(e).map((x) => x.id);
  assert.ok(!ids.includes('g1'), 'g1 est la référence (métier du CV)');
  assert.deepEqual(ids, ['d1', 'd2']);
});

test('accroches : le bloc des métiers reprend objectif, ligne directrice et détails, forme du sexe connu', () => {
  const e = etatDeuxMetiers();
  const entrees = cv.ucpmEntreesPourAccroches(e);
  const f = cv.ucpmBlocMetiersAccroches(entrees, 'f', LIGNES);
  assert.ok(f.includes('1. Métier : Peintre en bâtiment'));
  assert.ok(f.includes('2. Métier : Électricienne d’entretien'));
  assert.ok(f.includes('Objectif : Alternance'));
  assert.ok(f.includes('Ligne directrice de cet objectif : ligne alternance'));
  assert.ok(f.includes('Détails : secteur : bâtiment ; durée : 2 ans'));
  const n = cv.ucpmBlocMetiersAccroches(entrees, '', LIGNES);
  assert.ok(n.includes('2. Métier : Électricien d’entretien'), 'sexe inconnu : forme masculine, aucun accord ailleurs');
});

test('accroches : le prompt est rempli (genre, profil validé, métiers), sans marqueur restant', () => {
  const modele = lire('prompts/ucpm-accroches.md');
  const t = cv.ucpmConstruirePromptAccroches(modele, { sexe: 'f', profil: 'Titre du CV de référence : Agent', metiers: '1. Métier : Peintre' });
  assert.ok(!/\{(GENRE|PROFIL|METIERS)\}/.test(t));
  assert.ok(t.includes('Féminin : la personne est une femme'));
  assert.ok(t.includes('Titre du CV de référence : Agent'));
});

test('accroches : les vraies réponses de ChatGPT sont lues, deux accroches courtes par métier', () => {
  ['02_accroches_V3_feminin_chatgpt_1.txt', '02_accroches_V3_9_masculin_ou_neutre_chatgpt_1.txt', '02_accroches_V3_9_masculin_ou_neutre_chatgpt_2.txt'].forEach((f) => {
    const r = cv.ucpmLireReponseAccroches(rep(f), ['a1', 'a2', 'a3', 'a4', 'a5', 'a6', 'a7', 'a8', 'a9']);
    assert.equal(r.succes, true, f + ' : ' + r.erreur);
    Object.keys(r.accroches).forEach((id) => { assert.equal(r.accroches[id].length, 2, f + ' ' + id); assert.ok(!/[\u2013\u2014]/.test(r.accroches[id].join(' '))); });
    assert.ok(Object.keys(r.accroches).length >= 8, f + ' : au moins 8 métiers servis');
  });
});

test('accroches : un métier manquant n’empêche pas les autres ; coupée, vide et illisible donnent un message clair', () => {
  const json = JSON.stringify([{ id: 1, metier: 'A', accroches: ['Une.', 'Deux.'] }]);
  const r = cv.ucpmLireReponseAccroches(json, ['x', 'y']);
  assert.equal(r.succes, true);
  assert.deepEqual(Object.keys(r.accroches), ['x']);
  assert.deepEqual(r.manquants, ['y']);
  assert.equal(cv.ucpmLireReponseAccroches('', ['x']).succes, false);
  assert.equal(cv.ucpmLireReponseAccroches('[{"id":1,"accroches":[]}]', ['x']).succes, false);
  const brut = rep('02_accroches_V3_feminin_chatgpt_1.txt');
  const coupee = cv.ucpmLireReponseAccroches(brut.slice(0, Math.floor(brut.length * 0.5)), ['a', 'b']);
  assert.equal(coupee.succes, false);
  assert.equal(coupee.coupe, true);
});

test('apostrophes : droites remplacées par l’apostrophe typographique, guillemets laissés', () => {
  assert.equal(cv.ucpmNormaliserApostrophes("l'entretien d'un bâtiment"), 'l’entretien d’un bâtiment');
  assert.equal(cv.ucpmNormaliserApostrophes('"cité"'), '"cité"');
});

test('profil validé : titre, accroche, compétences, expériences, formations, engagement, sans coordonnées', () => {
  const d = {
    titreCV: 'Agent d’entretien des bâtiments', identite: { nom: 'MARTIN', prenom: 'Camille', telephone: '0612345678', email: 'c@x.fr' },
    ia: { cv: { profil: 'Dix ans d’entretien de bâtiments.' } }, competencesCV: ['Petite plomberie', { nom: 'Peinture' }],
    experiences: [{ poste: 'Agent d’entretien', entreprise: 'Habitat', dateDebut: '2019-01', dateFin: '2024-06', missions: ['120 logements', 'Dépannages'] }, { poste: 'Agent polyvalent', dateDebut: '2014-01', dateFin: '', missions: 'Bâtiments\nEspaces verts' }],
    formations: [{ niveau: 'CAP', intitule: 'Peintre applicateur', annee: '2014' }], certifications: ['Habilitation électrique BS'],
    engagements: [{ texte: 'Bénévole à la banque alimentaire' }], permis: { possede: true, categories: ['B'] }, langues: [], loisirs: []
  };
  const p = cv.ucpmConstruireProfilValide(d);
  ['Titre du CV de référence : Agent d’entretien des bâtiments', 'Accroche retenue : Dix ans', 'Compétences clés : Petite plomberie, Peinture.', '- 2019-2024, Agent d’entretien (Habitat) : 120 logements, Dépannages.',
    '- 2014-aujourd’hui, Agent polyvalent : Bâtiments, Espaces verts.', 'Formations : CAP Peintre applicateur (2014) ; Habilitation électrique BS.', 'Engagement : Bénévole à la banque alimentaire. Permis B.'].forEach((x) => assert.ok(p.includes(x), x + ' dans ' + p));
  assert.ok(!/MARTIN|Camille|0612|c@x\.fr/.test(p), 'aucune coordonnée');
  assert.equal(cv.ucpmConstruireProfilValide({}), '');
});

test('lettres : le bloc des CV porte objectif complet, employeur, recruteur, poste, offre et « autre chose à dire »', () => {
  const o = metiers.ucpmObjectifVide('offre');
  Object.assign(o, { secteur: 'bâtiment', contrat: ['CDI'], tempsTravail: ['Temps plein'], disponibleA: 'septembre', employeur: 'Lacroix Peinture', civiliteRecruteur: 'Madame', nomRecruteur: 'Martin', posteOffre: 'Peintre', texteOffre: 'Peinture\n intérieure  et revêtements', autreChose: 'Je prépare un CAP en parallèle.' });
  const t = cv.ucpmBlocCvLettres([{ titre: 'Peintre en bâtiment', accroche: 'CAP Peintre.', objectif: o }, { titre: 'Agent', accroche: 'Agent.', objectif: metiers.ucpmObjectifVide('spontanee') }], LIGNES);
  ['1. Titre du CV : Peintre en bâtiment', 'Accroche retenue : CAP Peintre.', 'Objectif : Réponse à une offre', 'Ligne directrice de cet objectif : ligne offre', 'contrat : CDI ; temps plein', 'disponible à partir de : septembre',
    'Employeur : Lacroix Peinture', 'Recruteur : Madame Martin', 'Poste visé : Peintre', 'Extrait de l’offre : Peinture intérieure et revêtements', 'Autre chose à dire', 'Je prépare un CAP en parallèle.', '2. Titre du CV : Agent'].forEach((x) => assert.ok(t.includes(x), x));
  assert.ok(!t.includes('Employeur') || t.indexOf('Employeur') < t.indexOf('2. Titre'), 'employeur seulement pour le CV 1');
});

test('lettres : le prompt est rempli, sans marqueur restant', () => {
  const t = cv.ucpmConstruirePromptLettres(lire('prompts/ucpm-lettres.md'), { sexe: 'm', profil: 'Profil', cvs: '1. Titre du CV : X' });
  assert.ok(!/\{(GENRE|PROFIL|CVS)\}/.test(t));
  assert.ok(t.includes('Masculin : la personne est un homme'));
});

test('lettres : la formule d’appel est imposée par l’application (Madame Martin, ou Madame, Monsieur,)', () => {
  const avec = metiers.ucpmObjectifVide('offre'); avec.civiliteRecruteur = 'Madame'; avec.nomRecruteur = 'Martin';
  assert.equal(cv.ucpmFormuleAppel(avec), 'Madame Martin,');
  assert.equal(cv.ucpmFormuleAppel(metiers.ucpmObjectifVide('spontanee')), 'Madame, Monsieur,');
  const sans = metiers.ucpmObjectifVide('spontanee');
  assert.equal(cv.ucpmImposerFormuleAppel('Monsieur, Madame,\n\nCorps.', sans), 'Madame, Monsieur,\n\nCorps.', 'formule à l’envers corrigée');
  assert.equal(cv.ucpmImposerFormuleAppel('Madame, Monsieur,\n\nCorps.', avec), 'Madame Martin,\n\nCorps.', 'recruteur connu');
  assert.equal(cv.ucpmImposerFormuleAppel('Je vous écris pour un poste.\n\nSuite.', sans), 'Madame, Monsieur,\n\nJe vous écris pour un poste.\n\nSuite.', 'formule ajoutée si absente');
  assert.equal(cv.ucpmImposerFormuleAppel('', sans), 'Madame, Monsieur,\n\n');
});

test('lettres : les vraies réponses de ChatGPT (V6, dix lettres) sont lues et recevront la formule imposée', () => {
  ['03_lettres_V6_10_feminin_chatgpt_1.txt', '03_lettres_V6_10_masculin_chatgpt_1.txt'].forEach((f) => {
    const ids = ['l1', 'l2', 'l3', 'l4', 'l5', 'l6', 'l7', 'l8', 'l9', 'l10'];
    const r = cv.ucpmLireReponseLettres(rep(f), ids);
    assert.equal(r.succes, true, f + ' : ' + r.erreur);
    assert.equal(Object.keys(r.lettres).length, 10, f);
    Object.keys(r.lettres).forEach((id) => {
      const mots = cv.ucpmNombreMots(r.lettres[id]);
      assert.ok(mots > 100 && mots < 300, f + ' ' + id + ' : ' + mots + ' mots');
      const corrigee = cv.ucpmImposerFormuleAppel(r.lettres[id], metiers.ucpmObjectifVide('spontanee'));
      assert.ok(corrigee.startsWith('Madame, Monsieur,\n'), f + ' ' + id);
    });
  });
});

test('lettres : lettre manquante signalée, texte coupé reconnu, aucun tiret long', () => {
  const r = cv.ucpmLireReponseLettres(JSON.stringify([{ id: 1, metier: 'A', lettre: 'Madame, Monsieur,\n\nCorps ' + String.fromCharCode(0x2013) + ' fin.' }]), ['a', 'b']);
  assert.equal(r.succes, true);
  assert.deepEqual(r.manquants, ['b']);
  assert.ok(!/[\u2013\u2014]/.test(r.lettres.a));
  const brut = rep('03_lettres_V6_10_feminin_chatgpt_1.txt');
  const coupee = cv.ucpmLireReponseLettres(brut.slice(0, Math.floor(brut.length * 0.6)), ['a']);
  assert.equal(coupee.succes, false);
  assert.equal(coupee.coupe, true);
});

test('lettres : la signature est le prénom et le nom, ajoutée une seule fois, la formule d’appel est imposée', () => {
  const NL = String.fromCharCode(10);
  const sans = metiers.ucpmObjectifVide('spontanee');
  const avec = Object.assign(metiers.ucpmObjectifVide('offre'), { civiliteRecruteur: 'Madame', nomRecruteur: 'Martin' });
  const corps = 'Madame, Monsieur,' + NL + NL + 'Je vous écris pour un poste.' + NL + NL + 'Cordialement.';
  assert.equal(cv.ucpmFinaliserLettre(corps, sans, 'Camille Dupont'), corps + NL + NL + 'Camille Dupont');
  assert.equal(cv.ucpmFinaliserLettre(corps, avec, 'Camille Dupont').split(NL)[0], 'Madame Martin,', 'recruteur connu');
  const deja = corps + NL + NL + 'camille dupont';
  assert.equal(cv.ucpmFinaliserLettre(deja, sans, 'Camille Dupont'), deja, 'signature déjà présente : rien n’est ajouté');
  assert.equal(cv.ucpmFinaliserLettre(corps, sans, ''), corps, 'sans nom connu, pas de signature');
});

test('lettres : le nom complet vient de l’identité, les espaces sont nettoyés', () => {
  assert.equal(cv.ucpmNomComplet({ prenom: ' Camille ', nom: 'Dupont  ' }), 'Camille Dupont');
  assert.equal(cv.ucpmNomComplet({ nom: 'Dupont' }), 'Dupont');
  assert.equal(cv.ucpmNomComplet(null), '');
});

test('lettres : les lettres reçues sont préparées CV par CV, la fusion ne supprime rien', () => {
  const entrees = [{ id: 'g1', objectif: metiers.ucpmObjectifVide('spontanee') }, { id: 'd1', objectif: metiers.ucpmObjectifVide('spontanee') }];
  const pretes = cv.ucpmPreparerLettresRecues({ g1: 'Monsieur, Madame,' + String.fromCharCode(10) + 'Texte.' }, entrees, 'Camille Dupont');
  assert.deepEqual(Object.keys(pretes), ['g1'], 'une lettre manquante reste manquante');
  assert.match(pretes.g1, /^Madame, Monsieur,/);
  assert.match(pretes.g1, /Camille Dupont$/);
  const fusion = cv.ucpmFusionnerLettres({ g1: 'ancienne g1', d1: 'ancienne d1' }, { g1: 'nouvelle g1' });
  assert.deepEqual(fusion, { g1: 'nouvelle g1', d1: 'ancienne d1' });
  assert.deepEqual(cv.ucpmFusionnerLettres(null, null), {});
});

test('lettres : une lettre de plus de 330 mots est signalée longue, sans bloquer', () => {
  const court = Array(300).fill('mot').join(' ');
  const longue = Array(331).fill('mot').join(' ');
  assert.equal(cv.ucpmLettreLongue(court), false);
  assert.equal(cv.ucpmLettreLongue(longue), true);
  assert.equal(cv.UCPM_LETTRE_LONGUE_MOTS, 330);
});

test('lettres : les tirets longs sont remplacés par un tiret court', () => {
  const cadratin = String.fromCharCode(0x2014), demi = String.fromCharCode(0x2013);
  assert.equal(cv.ucpmSansTiretLong('un ' + cadratin + ' deux ' + demi + ' trois'), 'un - deux - trois');
});

test('retour : les accroches reçues sont à jour tant que rien n’a changé, puis périmées si l’objectif, l’identité ou le profil changent', () => {
  const e = etatDeuxMetiers();
  e.sexe = 'f';
  e.accroches = { d1: ['Phrase A.'], d2: ['Phrase B.'] };
  e.accrochesManquantes = [];
  e.accrochesSig = cv.ucpmSignaturesAccroches(e, 'profil');
  assert.deepEqual(cv.ucpmAccrochesPerimees(e, 'profil'), { perimees: [], nouveaux: [] });
  assert.deepEqual(cv.ucpmAccrochesPerimees(e, 'autre profil').perimees.map((x) => x.id), ['d1', 'd2'], 'le CV de référence a changé');
  e.sexe = 'm';
  assert.deepEqual(cv.ucpmAccrochesPerimees(e, 'profil').perimees.map((x) => x.id), ['d1', 'd2'], 'l’identité a changé');
  e.sexe = 'f';
  const o = metiers.ucpmObjectifVide('stage'); o.secteur = 'bâtiment';
  metiers.ucpmAppliquerObjectif(e, 'un', 'd1', o);
  assert.deepEqual(cv.ucpmAccrochesPerimees(e, 'profil').perimees.map((x) => x.id), ['d1'], 'seul le métier dont l’objectif a changé est périmé');
});

test('retour : un métier ajouté depuis la demande est signalé, sauf si l’assistant n’avait rien proposé pour lui ou si une phrase est déjà choisie', () => {
  const e = etatDeuxMetiers();
  e.sexe = 'f';
  e.accroches = { d1: ['Phrase A.'] };
  e.accrochesManquantes = [];
  e.accrochesSig = cv.ucpmSignaturesAccroches(e, 'p');
  assert.deepEqual(cv.ucpmAccrochesPerimees(e, 'p').nouveaux.map((x) => x.id), ['d2']);
  e.accrochesManquantes = ['d2'];
  assert.deepEqual(cv.ucpmAccrochesPerimees(e, 'p').nouveaux, [], 'déjà signalé comme sans proposition');
  e.accrochesManquantes = [];
  e.cvs = { d2: { accrocheChoisie: true, accroche: 'La mienne.' } };
  assert.deepEqual(cv.ucpmAccrochesPerimees(e, 'p').nouveaux, [], 'la personne a déjà sa phrase');
  assert.deepEqual(cv.ucpmAccrochesPerimees({ accroches: null }, 'p'), { perimees: [], nouveaux: [] }, 'rien reçu, rien de périmé');
});

test('retour : une lettre est périmée si le titre, la phrase d’accroche, l’objectif, l’identité, le profil ou le nom ont changé ; jamais sans empreinte', () => {
  const e = etatDeuxMetiers();
  e.sexe = 'f';
  e.cvs = { g1: { titre: 'Agent', accroche: 'Phrase 1.' }, d1: { titre: 'Peintre', accroche: 'Phrase 2.' }, d2: { titre: 'Électricienne', accroche: 'Phrase 3.' } };
  e.lettres = { g1: 'Lettre 1', d1: 'Lettre 2' };
  const entrees = metiers.ucpmEntreesCochees(e).filter((x) => x.id !== 'd2');
  e.lettresSig = cv.ucpmSignaturesLettres(e, entrees, 'profil', 'Camille Martin');
  assert.deepEqual(cv.ucpmLettresPerimees(e, 'profil', 'Camille Martin'), []);
  e.cvs.d1.accroche = 'Phrase 2 modifiée.';
  assert.deepEqual(cv.ucpmLettresPerimees(e, 'profil', 'Camille Martin').map((x) => x.id), ['d1'], 'phrase d’accroche modifiée');
  e.cvs.d1.accroche = 'Phrase 2.';
  e.cvs.g1.titre = 'Agent technique';
  assert.deepEqual(cv.ucpmLettresPerimees(e, 'profil', 'Camille Martin').map((x) => x.id), ['g1'], 'titre modifié');
  e.cvs.g1.titre = 'Agent';
  assert.deepEqual(cv.ucpmLettresPerimees(e, 'profil', 'Camille Dupont').map((x) => x.id), ['g1', 'd1'], 'la signature changerait');
  assert.deepEqual(cv.ucpmLettresPerimees(e, 'autre', 'Camille Martin').map((x) => x.id), ['g1', 'd1'], 'le profil a changé');
  e.lettres.d2 = 'Lettre écrite à la main';
  assert.ok(!cv.ucpmLettresPerimees(e, 'autre', 'Camille Martin').some((x) => x.id === 'd2'), 'sans empreinte, jamais périmée');
  e.lettresSig = {};
  assert.deepEqual(cv.ucpmLettresPerimees(e, 'autre', 'x'), [], 'ancienne sauvegarde : rien n’est déclaré périmé');
});

test('retour : l’empreinte est stable et sensible au moindre changement', () => {
  assert.equal(cv.ucpmHachage('abc'), cv.ucpmHachage('abc'));
  assert.notEqual(cv.ucpmHachage('abc'), cv.ucpmHachage('abd'));
});

// Lettres par groupes de 5 : la suite n'est annoncée qu'au-delà de 5 CV (24/10/2026).
test('suite des lettres : aucun message jusqu’à 5 CV, même s’il manque une lettre', () => {
  assert.equal(cv.UCPM_LETTRES_PAR_REPONSE, 5);
  assert.deepEqual(cv.ucpmIdsEnAttenteDeSuite(['a', 'b', 'c', 'd'], { a: 'x', b: 'x' }), []);
  assert.deepEqual(cv.ucpmIdsEnAttenteDeSuite(['a', 'b', 'c', 'd', 'e'], {}), []);
});

test('suite des lettres : 7 CV et 5 lettres reçues, les 2 autres sont à récupérer', () => {
  const ids = ['a', 'b', 'c', 'd', 'e', 'f', 'g'];
  const lettres = { a: 'L', b: 'L', c: 'L', d: 'L', e: 'L' };
  assert.deepEqual(cv.ucpmIdsEnAttenteDeSuite(ids, lettres), ['f', 'g']);
  assert.deepEqual(cv.ucpmIdsEnAttenteDeSuite(ids, Object.assign({}, lettres, { f: 'L', g: ' ' })), ['g']);
  assert.deepEqual(cv.ucpmIdsEnAttenteDeSuite(ids, Object.assign({}, lettres, { f: 'L', g: 'L' })), []);
});

test('suite des lettres : la deuxième réponse (CV 6 et 7 seulement) est lue à leur place', () => {
  const ids = ['a', 'b', 'c', 'd', 'e', 'f', 'g'];
  const reponse = '```json\n[{"id":6,"metier":"F","lettre":"Madame, Monsieur,\\n\\nSixième."},{"id":7,"metier":"G","lettre":"Madame, Monsieur,\\n\\nSeptième."}]\n```\nPour recevoir la suite, répondez : oui.';
  const r = cv.ucpmLireReponseLettres(reponse, ids);
  assert.equal(r.succes, true);
  assert.deepEqual(Object.keys(r.lettres).sort(), ['f', 'g']);
  assert.deepEqual(r.manquants, ['a', 'b', 'c', 'd', 'e']);
});
