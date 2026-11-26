const test = require('node:test');
const assert = require('node:assert/strict');
const L = require('../modules/ce-qui-compte/logique.js');
const P = require('../modules/ce-qui-compte/papier.js');

// Un état avec trois cartes gardées : « Ma journée idéale » et « Ce qui compte au travail » (cochées d'avance), « Ce qui m'a aidé » (très personnelle, décochée d'avance).
function etatDeTest() {
  const etat = L.cqcpmEtatInitial();
  L.cqcpmPoserReponse(etat, 'journee', 'matin', 'Un café au calme');
  L.cqcpmPoserReponse(etat, 'journee', 'faire', 'Je répare des objets');
  L.cqcpmGarder(etat, 'journee', '2026-11-23');
  L.cqcpmPoserReponse(etat, 'valeurs', 'situation', 'Un atelier où je décidais de mon rythme');
  L.cqcpmGarder(etat, 'valeurs', '2026-11-23');
  L.cqcpmPoserReponse(etat, 'aide', 'aide', 'Une voisine qui m’écoutait');
  L.cqcpmGarder(etat, 'aide', '2026-11-23');
  return etat;
}
const MODELE = 'Consigne de Denis.\n\n{DONNEES}\n\nFin.';
const REPONSE = '```json\n{"papier":1,"fin":"complet","revient":["Fabriquer ou réparer de vos mains.","Du calme, sans course."],"compte":["Être libre de vous organiser."],"deuxDirections":"Liberté et horaires réguliers : à regarder métier par métier.","preciser":"Ce que vous accepteriez de supporter.","questions":["Est-ce que je fabrique quelque chose de concret ?"]}\n```';

test('le papier est possible dès deux cartes cochées ; « Ce qui m’a aidé » n’est pas cochée d’avance', () => {
  const etat = etatDeTest();
  assert.deepEqual(P.cqcpmPapierIds(etat), ['journee', 'valeurs']);
  assert.equal(P.cqcpmPapierPossible(etat), true);
  L.cqcpmChoisirEnvoi(etat, 'valeurs', false);
  assert.equal(P.cqcpmPapierPossible(etat), false, 'une seule carte cochée : rien ne revient');
  L.cqcpmChoisirEnvoi(etat, 'aide', true);
  assert.equal(P.cqcpmPapierPossible(etat), true);
  assert.equal(P.cqcpmPapierPossible(L.cqcpmEtatInitial()), false);
  assert.equal(P.cqcpmPapierPossible(null), false);
});

test('la demande : le modèle de Denis, les cartes cochées seulement, jamais la carte décochée', () => {
  const etat = etatDeTest();
  const d = P.cqcpmDemandePapier(MODELE, etat);
  assert.ok(d.texte.startsWith('Consigne de Denis.'));
  assert.ok(d.texte.endsWith('Fin.'));
  assert.match(d.texte, /Nombre de cartes lues : 2 sur 8/);
  assert.match(d.texte, /Je répare des objets/);
  assert.doesNotMatch(d.texte, /voisine/, 'la carte très personnelle ne part que si la personne la coche');
  assert.doesNotMatch(d.texte, /\{DONNEES\}/);
  assert.equal(d.nbCartes, 2);
  assert.equal(P.cqcpmDemandePapier('', etat), null, 'sans modèle, pas de demande');
  L.cqcpmChoisirEnvoi(etat, 'valeurs', false);
  assert.equal(P.cqcpmDemandePapier(MODELE, etat), null, 'moins de deux cartes cochées');
});

test('la demande sans repère {DONNEES} ajoute les données à la fin', () => {
  const d = P.cqcpmDemandePapier('Consigne seule.', etatDeTest());
  assert.ok(d.texte.startsWith('Consigne seule.\n\nCARTES ÉCRITES PAR LA PERSONNE'));
});

test('la lecture de la réponse : un bloc complet est lu, nettoyé, rangé par partie', () => {
  const r = P.cqcpmAnalyserPapier(REPONSE);
  assert.equal(r.ok, true);
  assert.equal(r.parties.revient.length, 2);
  assert.equal(r.parties.compte[0], 'Être libre de vous organiser.');
  assert.match(r.parties.deuxDirections, /métier par métier/);
  const net = P.cqcpmAnalyserPapier('Voici :\n```json\n{"fin":"complet","revient":["Un texte – avec un tiret long et un lien https://exemple.fr/x et <b>une balise</b>."],"compte":["Autre"]}\n```');
  assert.equal(net.ok, true);
  assert.doesNotMatch(net.parties.revient[0], /–|—|https?:|<b>/);
});

test('la lecture de la réponse : vide, coupée, illisible ou trop pauvre = jamais un papier', () => {
  assert.deepEqual(P.cqcpmAnalyserPapier('   '), { ok: false, raison: 'vide' });
  assert.equal(P.cqcpmAnalyserPapier('Bonjour, voici ma réponse sans bloc.').ok, false);
  assert.equal(P.cqcpmAnalyserPapier('```json\n{"papier":1,"revient":["Un début').raison, 'coupee');
  assert.equal(P.cqcpmAnalyserPapier('```json\n{"papier":1,"fin":"complet","revient":["Un début').ok, false, 'un bloc coupé en route n’est jamais lu');
  assert.equal(P.cqcpmAnalyserPapier('{"papier":1,"revient":["a"],"compte":["b"]}').raison, 'coupee', 'sans « fin : complet », la réponse est considérée comme coupée');
  assert.equal(P.cqcpmAnalyserPapier('{"fin":"complet","revient":["Une seule partie"]}').raison, 'sans_contenu');
  assert.equal(P.cqcpmAnalyserPapier('{"fin":"complet","revient":[],"compte":[],"deuxDirections":"","preciser":"","questions":[]}').raison, 'sans_contenu');
  assert.equal(P.cqcpmAnalyserPapier('{"fin":"complet",}').ok, false);
});

test('aucune limite de longueur sur ce que l’assistant écrit (consigne 528)', () => {
  const long = 'Une phrase assez longue. '.repeat(300);
  const r = P.cqcpmAnalyserPapier(JSON.stringify({ fin: 'complet', revient: [long], compte: ['b'] }));
  assert.equal(r.ok, true);
  assert.ok(r.parties.revient[0].length > 5000);
});

test('ranger le papier : jamais joint d’office, lié aux cartes lues, impossible sous deux cartes', () => {
  const etat = etatDeTest();
  assert.equal(P.cqcpmPoserPapier(etat, P.cqcpmAnalyserPapier(REPONSE).parties, '2026-11-23'), true);
  const p = P.cqcpmPapier(etat);
  assert.deepEqual(p.ids, ['journee', 'valeurs']);
  assert.equal(P.cqcpmPapierJoint(etat), false, 'rien n’est joint tant que la personne ne le décide pas');
  assert.equal(P.cqcpmPapierPourSynthese(etat).length, 0, 'non joint : rien ne part vers Ma synthèse');
  const seul = L.cqcpmEtatInitial(); L.cqcpmPoserReponse(seul, 'journee', 'matin', 'x'); L.cqcpmGarder(seul, 'journee', '2026-11-23');
  assert.equal(P.cqcpmPoserPapier(seul, P.cqcpmAnalyserPapier(REPONSE).parties, '2026-11-23'), false);
  assert.equal(P.cqcpmPapier(seul), null);
});

test('joindre et ne plus joindre : seul le papier part vers Ma synthèse, jamais les cartes une à une', () => {
  const etat = etatDeTest();
  P.cqcpmPoserPapier(etat, P.cqcpmAnalyserPapier(REPONSE).parties, '2026-11-23');
  assert.equal(P.cqcpmJoindrePapier(etat, true), true);
  assert.equal(P.cqcpmPapierJoint(etat), true);
  const l = P.cqcpmPapierPourSynthese(etat);
  assert.equal(l.length, 1);
  assert.match(l[0], /Ce qui revient : Fabriquer ou réparer de vos mains\. ; Du calme, sans course\./);
  assert.match(l[0], /Ce qui peut tirer dans deux directions : Liberté et horaires/);
  assert.doesNotMatch(l[0], /Je répare des objets/, 'les mots bruts des cartes ne partent pas : seulement le papier');
  assert.equal(P.cqcpmJoindrePapier(etat, false), true);
  assert.equal(P.cqcpmPapierPourSynthese(etat).length, 0);
  assert.equal(P.cqcpmJoindrePapier(L.cqcpmEtatInitial(), true), false, 'sans papier, rien à joindre');
});

test('le papier est retiré, avec un repère pour le dire, si une carte lue change ou disparaît', () => {
  const etat = etatDeTest();
  P.cqcpmPoserPapier(etat, P.cqcpmAnalyserPapier(REPONSE).parties, '2026-11-23');
  P.cqcpmJoindrePapier(etat, true);
  // Modifier le brouillon sans regarder le résultat gardé ne change rien.
  L.cqcpmPoserReponse(etat, 'journee', 'matin', 'Autre chose, pas encore gardée');
  assert.notEqual(P.cqcpmPapier(etat), null);
  // Re-garder la carte avec un autre texte : le papier ne correspond plus.
  L.cqcpmGarder(etat, 'journee', '2026-11-24');
  assert.equal(P.cqcpmPapier(etat), null);
  assert.equal(P.cqcpmPapierRetire(etat), true);
  assert.equal(P.cqcpmPapierJoint(etat), false);
  assert.equal(P.cqcpmPapierPourSynthese(etat).length, 0, 'un papier retiré ne part jamais');
  P.cqcpmPapierAvisVu(etat);
  assert.equal(P.cqcpmPapierRetire(etat), false);
});

test('effacer une carte lue, ou tout effacer, retire le papier ; effacer une autre carte ne le touche pas', () => {
  let etat = etatDeTest();
  P.cqcpmPoserPapier(etat, P.cqcpmAnalyserPapier(REPONSE).parties, '2026-11-23');
  L.cqcpmEffacerCarte(etat, 'aide');
  assert.notEqual(P.cqcpmPapier(etat), null, 'la carte effacée n’était pas lue par le papier');
  L.cqcpmEffacerCarte(etat, 'valeurs');
  assert.equal(P.cqcpmPapier(etat), null);
  etat = etatDeTest();
  P.cqcpmPoserPapier(etat, P.cqcpmAnalyserPapier(REPONSE).parties, '2026-11-23');
  L.cqcpmToutEffacer(etat);
  assert.equal(etat.papier, undefined);
  assert.equal(P.cqcpmEffacerPapier(etatDeTest()), false);
});

test('les parties du papier : seulement celles qui ont du contenu, dans l’ordre', () => {
  const etat = etatDeTest();
  P.cqcpmPoserPapier(etat, { revient: ['A'], compte: [], deuxDirections: '', preciser: 'B', questions: [] }, '2026-11-23');
  assert.deepEqual(P.cqcpmPapierSections(etat).map((s) => s.id), ['revient', 'preciser']);
});

test('la disquette : le papier voyage avec les cartes et revient à l’identique, joint ou non', () => {
  const etat = etatDeTest();
  P.cqcpmPoserPapier(etat, P.cqcpmAnalyserPapier(REPONSE).parties, '2026-11-23');
  P.cqcpmJoindrePapier(etat, true);
  const f = JSON.parse(JSON.stringify(P.cqcpmFichierAvecPapier(etat)));
  assert.ok(f.papier && f.cartes.journee);
  const retour = P.cqcpmEtatDepuisFichierAvecPapier(f);
  assert.equal(P.cqcpmPapierJoint(retour), true);
  assert.deepEqual(P.cqcpmPapierSections(retour), P.cqcpmPapierSections(etat));
  assert.equal(L.cqcpmNombreGardees(retour), 3);
  // Sans papier : le fichier d'avant (cartes seules) se relit toujours.
  const sans = etatDeTest();
  assert.equal(P.cqcpmFichierAvecPapier(sans).papier, undefined);
  assert.equal(P.cqcpmPapier(P.cqcpmEtatDepuisFichierAvecPapier(P.cqcpmFichierAvecPapier(sans))), null);
  assert.equal(P.cqcpmFichierAvecPapier(L.cqcpmEtatInitial()), null);
});

test('la disquette relue avec méfiance : un fichier abîmé ou trafiqué ne fait jamais apparaître un papier', () => {
  const etat = etatDeTest();
  P.cqcpmPoserPapier(etat, P.cqcpmAnalyserPapier(REPONSE).parties, '2026-11-23');
  const f = JSON.parse(JSON.stringify(P.cqcpmFichierAvecPapier(etat)));
  // Une carte du fichier a changé : le papier ne correspond plus.
  const modifie = JSON.parse(JSON.stringify(f)); modifie.cartes.journee.reponses.matin = 'Autre texte';
  assert.equal(P.cqcpmPapier(P.cqcpmEtatDepuisFichierAvecPapier(modifie)), null);
  // Empreinte absente, papier de n'importe quel type, cartes inconnues.
  [{ ...f, papier: { ...f.papier, signature: '' } }, { ...f, papier: 'texte' }, { ...f, papier: [1, 2] }, { ...f, papier: { ...f.papier, ids: ['inconnue', 'autre'] } }, { ...f, papier: null }].forEach((x) => {
    assert.equal(P.cqcpmPapier(P.cqcpmEtatDepuisFichierAvecPapier(x)), null);
  });
  // Du code dans un texte reste du texte : aucune balise n'est interprétée ailleurs, le papier n'est de toute façon pas valide sans empreinte.
  const faux = JSON.parse(JSON.stringify(f)); faux.papier.revient = ['<script>alert(1)</script>'];
  const retour = P.cqcpmEtatDepuisFichierAvecPapier(faux);
  assert.ok(P.cqcpmPapier(retour) === null || typeof P.cqcpmPapier(retour).revient[0] === 'string');
  assert.equal(P.cqcpmPapier(P.cqcpmEtatDepuisFichierAvecPapier(null)), null);
});

test('les parties sont les mêmes partout (une ouverture, cinq de lecture), sans tiret long ni « facultatif »', () => {
  assert.deepEqual(P.CQCPM_PAPIER_SECTIONS.map((s) => s.id), ['ouverture', 'revient', 'compte', 'deuxDirections', 'preciser', 'questions']);
  const tout = JSON.stringify([P.CQCPM_PAPIER_SECTIONS, P.CQCPM_PAPIER_PRUDENCE, P.CQCPM_PAPIER_PRUDENCE_ECRAN, P.CQCPM_PAPIER_TITRE, P.CQCPM_PAPIER_MESSAGES_ECHEC]);
  assert.doesNotMatch(tout, /—|–|facultatif/i);
  assert.doesNotMatch(tout, /\bIA\b/);
});

test('le paragraphe d’ouverture : lu et rangé en premier, mais il ne compte pas dans le minimum de deux parties', () => {
  const avec = P.cqcpmAnalyserPapier('{"fin":"complet","ouverture":"Un fil se dessine : le geste concret et un rythme choisi.","revient":["A"],"compte":["B"]}');
  assert.equal(avec.ok, true);
  assert.match(avec.parties.ouverture, /geste concret/);
  assert.equal(P.cqcpmAnalyserPapier('{"fin":"complet","ouverture":"Un texte d’ouverture.","revient":["Une seule partie"]}').raison, 'sans_contenu', 'l’ouverture plus une seule partie ne suffit pas');
  assert.equal(P.cqcpmAnalyserPapier('{"fin":"complet","ouverture":"Seule.","revient":[],"compte":[]}').raison, 'sans_contenu');
  const sans = P.cqcpmAnalyserPapier('{"fin":"complet","revient":["A"],"compte":["B"]}');
  assert.equal(sans.ok, true, 'un papier sans ouverture reste valable (anciens papiers, assistant qui la laisse vide)');
  assert.equal(sans.parties.ouverture, '');
  const etat = etatDeTest();
  P.cqcpmPoserPapier(etat, avec.parties, '2026-11-23');
  assert.deepEqual(P.cqcpmPapierSections(etat).map((s) => s.id), ['ouverture', 'revient', 'compte']);
  P.cqcpmJoindrePapier(etat, true);
  assert.match(P.cqcpmPapierPourSynthese(etat)[0], /^En quelques mots : Un fil se dessine/);
  const fichier = P.cqcpmFichierAvecPapier(etat);
  const relu = P.cqcpmEtatDepuisFichierAvecPapier(JSON.parse(JSON.stringify(fichier)));
  assert.match(P.cqcpmPapier(relu).ouverture, /geste concret/, 'l’ouverture voyage avec la disquette');
});

test('vers Ma lecture : ni « à préciser » ni les questions, et jamais une phrase coupée au milieu', () => {
  const etat = etatDeTest();
  P.cqcpmPoserPapier(etat, P.cqcpmAnalyserPapier(REPONSE).parties, '2026-11-23');
  P.cqcpmJoindrePapier(etat, true);
  const court = P.cqcpmPapierPourSynthese(etat)[0];
  assert.doesNotMatch(court, /À préciser|pourrait être précisé|Questions à se poser|Ce que vous accepteriez/, 'les suggestions de l’assistant ne partent pas');
  const long = { ouverture: 'Une phrase d’ouverture complète. '.repeat(20), revient: ['Un thème qui revient, dit en entier. '.repeat(12), 'Un autre thème qui revient, dit en entier. '.repeat(12)], compte: ['Parmi l’essentiel : « Aider ».'], deuxDirections: 'Une tension dite en entier. '.repeat(30), preciser: 'Une piste à préciser.', questions: ['Une question ?'] };
  const e2 = etatDeTest();
  P.cqcpmPoserPapier(e2, long, '2026-11-23');
  P.cqcpmJoindrePapier(e2, true);
  const t = P.cqcpmPapierPourSynthese(e2)[0];
  assert.ok(t.length <= 2500, 'longueur ' + t.length);
  assert.doesNotMatch(t, /…$/, 'aucune coupure au milieu d’une phrase : les dernières parties sont retirées en entier');
  assert.match(t, /Une phrase d’ouverture complète\. \/ Ce qui revient/);
});
