const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

// L'onglet « Travailler avec Claude » juge chaque réponse collée : un refus, une période « non définie », un « Non vérifié » sans source
// ou un bloc absent ne doivent pas passer pour un travail fait (essai de Denis, 01/11/2026).
const html = fs.readFileSync(path.join(__dirname, '..', 'outils', 'veille.html'), 'utf8');
function fn(nom) {
  const i = html.indexOf('function ' + nom + '('); assert.ok(i >= 0, nom);
  const j = html.indexOf('\n  function ', i + 10), k = html.indexOf('\n  /*', i + 10);
  const fin = [j, k].filter((x) => x > 0).sort((a, b) => a - b)[0];
  return html.slice(i, fin);
}
const analyser = new Function(['deMd', 'semAvecAjout', 'semEstMain', 'semSections', 'analyserReponse'].map(fn).join('\n') + '\nreturn analyserReponse;')();
const NL = String.fromCharCode(10);
const bloc = (nom, corps) => '[' + nom + ']' + NL + corps + NL + '[/' + nom + ']';
const PREUVE = 'preuve: https://www.legifrance.gouv.fr/jorf/id/JORFTEXT000000000000';

test('le refus de Denis (« Je ne peux pas répondre… signal : Non vérifié ») est inutilisable', () => {
  const t = 'Je ne peux pas répondre conformément à votre demande : la période n’est pas définie.' + NL + 'signal: Non vérifié';
  assert.strictEqual(analyser('hebdo', t).niveau, 'inutilisable');
});

test('« la période APP n’est pas définie » est inutilisable, même avec un bloc ouvert vide', () => {
  const t = 'Avant de commencer, la période APP n’est pas définie. Pouvez-vous préciser les dates ?';
  assert.strictEqual(analyser('balayage-1', t).niveau, 'inutilisable');
  assert.strictEqual(analyser('medecins', t + ' '.repeat(300)).niveau, 'inutilisable');
});

test('une réponse correcte avec son bloc et une adresse est ok ; la phrase « n’ai pas pu ouvrir » dans [SITES-NON-OUVERTS] ne la condamne pas', () => {
  const t = bloc('VEILLE-HEBDO', 'point: RSA' + NL + PREUVE) + NL + NL + bloc('SITES-NON-OUVERTS', 'service-public.fr | https://x.fr | je n’ai pas pu ouvrir la page | montant');
  assert.strictEqual(analyser('hebdo', t).niveau, 'ok');
});

test('le bloc attendu manque : inutilisable ; un bloc voisin ne le remplace pas ([CHIFFRES-UE] pour [CHIFFRES])', () => {
  assert.strictEqual(analyser('hebdo', 'Voici un résumé de la semaine, rien de précis.' + NL + PREUVE).niveau, 'inutilisable');
  assert.strictEqual(analyser('chiffres', bloc('CHIFFRES-UE', 'indicateur: x' + NL + PREUVE)).niveau, 'inutilisable');
  assert.strictEqual(analyser('chiffres', bloc('CHIFFRES', 'indicateur: x' + NL + PREUVE)).niveau, 'ok');
});

test('un rapport de contrôle de rayon s’ouvre par [CONTROLE rayon: ...] et reste ok', () => {
  assert.strictEqual(analyser('rayon-emploi', '[CONTROLE rayon: emploi]' + NL + 'fiche: a' + NL + 'etat: A JOUR' + NL + PREUVE + NL + '[/CONTROLE]').niveau, 'ok');
});

test('réponse coupée : bloc non refermé, ou ligne « SUITE DISPONIBLE » après le dernier bloc fermé', () => {
  const ouvert = analyser('balayage-2', '[BALAYAGE]' + NL + 'domaine: Emploi' + NL + PREUVE);
  assert.strictEqual(ouvert.niveau, 'attention'); assert.strictEqual(ouvert.coupee, true);
  const suite = analyser('hebdo', bloc('VEILLE-HEBDO', 'point: a' + NL + PREUVE) + NL + 'SUITE DISPONIBLE : il reste 3 points. Voulez-vous la suite ?');
  assert.strictEqual(suite.coupee, true);
  const complete = analyser('hebdo', bloc('VEILLE-HEBDO', 'point: a' + NL + PREUVE) + NL + 'SUITE DISPONIBLE : il reste 3.' + NL + bloc('VEILLE-HEBDO', 'point: b' + NL + PREUVE));
  assert.strictEqual(complete.coupee, false);
});

test('un bloc sans aucune adresse est « à vérifier », jamais refusé', () => {
  const a = analyser('hebdo', bloc('VEILLE-HEBDO', 'point: RSA, montant relevé'));
  assert.strictEqual(a.niveau, 'attention'); assert.strictEqual(a.coupee, false);
});

test('prompts sans bloc propre (médecins) : trop court = inutilisable ; texte copié à la main : jamais refusé', () => {
  assert.strictEqual(analyser('medecins', 'ok').niveau, 'inutilisable');
  assert.strictEqual(analyser('medecins', 'Densité de médecins généralistes : ' + 'x'.repeat(250)).niveau, 'ok');
  assert.strictEqual(analyser('main-legifrance', 'Je ne peux pas dire mieux, voici le texte de la page : ' + 'x'.repeat(50)).niveau, 'ok');
  assert.strictEqual(analyser('main-legifrance', 'court').niveau, 'attention');
  assert.strictEqual(analyser('hebdo', '   ').niveau, 'ok');
});

test('les passages sont notés comme les anciens écrans, et la commande /veille existe', () => {
  const np = fn('noterPassageDe');
  ['noterPassage(\'veille\'', 'noterPassage(\'rayon:\'', 'marquerTrimFait(\'balayage\'', 'marquerTrimFait(\'chiffres\'', 'marquerTrimFait(\'confronter\'', 'marquerTrimFait(\'lexique\')']
    .forEach((s) => assert.ok(np.includes(s), s));
  assert.ok(html.includes('qualite: a.niveau, motif: a.motif'), 'la qualité part avec la réponse');
  assert.ok(!/veille_hebdo_derniere', new Date\(\)\.toISOString/.test(html), 'le jour de la veille hebdo ne passe plus par toISOString');
  const cmd = fs.readFileSync(path.join(__dirname, '..', '.claude', 'commands', 'veille.md'), 'utf8');
  assert.match(cmd, /\$ARGUMENTS/); assert.match(cmd, /inutilisable/); assert.match(cmd, /_index\.md/);
});

// « Relancer » : chaque cause d'échec donne un message de relance précis, à coller dans la même conversation.
const relance = new Function(fn('messageRelance') + '\nreturn messageRelance;')();
test('chaque cause donne un message de relance, et une réponse correcte n’en donne pas', () => {
  const refus = analyser('hebdo', 'Je ne peux pas répondre à cette demande.');
  assert.strictEqual(refus.cause, 'refus'); assert.match(relance('hebdo', refus), /pages officielles une par une[\s\S]*\[VEILLE-HEBDO\]/);
  const sans = analyser('rayon-emploi', 'Voici un résumé, rien de précis. ' + 'x'.repeat(300));
  assert.strictEqual(sans.cause, 'bloc'); assert.match(relance('rayon-emploi', sans), /Il manque \[CONTROLE\]/);
  // Scan du mois (09/11/2026) : un texte brut est accepté ; sans aucune adresse de source il reste « à vérifier ».
  assert.strictEqual(analyser('balayage-1', 'Voici un résumé, rien de précis. ' + 'x'.repeat(300)).cause, 'sans-source');
  const coupee = analyser('chiffres', '[CHIFFRES periode: T1]' + NL + 'indicateur: a' + NL + 'valeur: 1');
  assert.strictEqual(coupee.cause, 'coupee'); assert.match(relance('chiffres', coupee), /Continue exactement[\s\S]*\[\/CHIFFRES\]/);
  const nonVerifie = analyser('hebdo', bloc('VEILLE-HEBDO', 'signal: Non vérifié'));
  assert.strictEqual(nonVerifie.cause, 'rien-verifie'); assert.match(relance('hebdo', nonVerifie), /Non vérifié/);
  const bon = analyser('hebdo', bloc('VEILLE-HEBDO', 'point: RSA' + NL + PREUVE));
  assert.strictEqual(bon.cause, ''); assert.strictEqual(relance('hebdo', bon), '');
  [refus, sans, coupee, nonVerifie].forEach((a) => assert.ok(!/—|–/.test(relance('hebdo', a))));
});

test('une réponse copiée depuis ChatGPT avec des crochets protégés (\[VEILLE-HEBDO\]) reste utilisable', () => {
  const t = '\[VEILLE-HEBDO\]' + NL + 'point: RSA' + NL + PREUVE + NL + '\[/VEILLE-HEBDO\]';
  assert.strictEqual(analyser('hebdo', t).niveau, 'ok');
});
