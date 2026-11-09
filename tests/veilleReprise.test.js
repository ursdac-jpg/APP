const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

// Scan du mois dans l'onglet « Travailler avec Claude » (09/11/2026) : les domaines que les réponses n'ont pas couverts sont repérés
// (jamais pris pour « rien à signaler »), et un message de reprise peut être copié depuis la carte.
const html = fs.readFileSync(path.join(__dirname, '..', 'outils', 'veille.html'), 'utf8');
function fn(nom) {
  const i = html.indexOf('function ' + nom + '('); assert.ok(i >= 0, nom);
  const j = html.indexOf('\n  function ', i + 10), k = html.indexOf('\n  /*', i + 10), l = html.indexOf('\n  //', i + 10);
  const fin = [j, k, l].filter((x) => x > 0).sort((a, b) => a - b)[0];
  return html.slice(i, fin);
}
const cles = /var BAL_CLES = \[[^\]]*\];/.exec(html)[0];
const R = new Function(cles + '\n' + ['balNorm', 'balMemeDomaine', 'balLireCouverture', 'balItemVide', 'balEstVide', 'balParserDomaines', 'balBlocsDe', 'balCalculerCouverture', 'balDomainesAReprendre'].map(fn).join('\n')
  + '\nreturn { balParserDomaines: balParserDomaines, balCalculerCouverture: balCalculerCouverture, balDomainesAReprendre: balDomainesAReprendre, balLireCouverture: balLireCouverture };')();
const NL = String.fromCharCode(10);
const L = (...l) => l.join(NL);

const REPONSE = L(
  '[BALAYAGE periode: octobre 2026]',
  'domaine: Assurance chômage et France Travail',
  'intitule: Aucun changement retenu sur les pages effectivement consultées',
  'type: déploiement de dispositif',
  'publie_le: à vérifier',
  'ce_qui_change: Rien.',
  '',
  'domaine: RSA, prime d’activité, AAH et leurs cumuls',
  'intitule: Calcul de l’AAH pour les bénéficiaires travaillant en Esat',
  'type: décret',
  'publie_le: 2026-06-26',
  'en_vigueur: 2026-10-01',
  'ce_qui_change: Calculée sur le dernier trimestre.',
  '[/BALAYAGE]',
  '[COUVERTURE]', 'domaine: Assurance chômage et France Travail', 'statut: non couvert', 'pages_ouvertes: https://www.legifrance.gouv.fr', 'raison: pages non ouvertes', '[/COUVERTURE]',
  '[COUVERTURE]', 'domaine: RSA, prime d’activité, AAH et leurs cumuls', 'statut: changements trouvés', 'pages_ouvertes: https://www.legifrance.gouv.fr/jorf/id/X', 'raison: ', '[/COUVERTURE]',
  '[COUVERTURE]', 'domaine: Mobilité et aides associées', 'statut: rien trouvé', 'pages_ouvertes: https://a.fr ; https://b.fr', 'raison: ', '[/COUVERTURE]'
);
const ATTENDUS = ['Assurance chômage et France Travail', 'RSA, prime d’activité, AAH et leurs cumuls', 'Mobilité et aides associées', 'Accompagnement des jeunes'];

test('une entrée « Aucun changement retenu » n’est pas un changement ; les domaines non couverts, « rien trouvé » avec moins de trois pages et sans déclaration sont à reprendre', () => {
  const doms = R.balParserDomaines(REPONSE);
  assert.strictEqual(doms.length, 2, 'deux domaines lus, dont celui qui ne contient que « Aucun changement »');
  const reprise = R.balDomainesAReprendre(REPONSE, ATTENDUS);
  assert.deepStrictEqual(reprise, ['Assurance chômage et France Travail', 'Mobilité et aides associées', 'Accompagnement des jeunes']);
  assert.ok(!reprise.includes('RSA, prime d’activité, AAH et leurs cumuls'), 'un domaine avec un changement lu est couvert');
});

test('une reprise collée à la suite couvre le domaine : le meilleur statut déclaré l’emporte', () => {
  const suite = L(REPONSE, '', '[BALAYAGE periode: octobre 2026]', 'domaine: Assurance chômage et France Travail', 'intitule: Un vrai changement', 'type: décret', 'publie_le: 2026-10-10', 'ce_qui_change: x', '[/BALAYAGE]',
    '[COUVERTURE]', 'domaine: Assurance chômage et France Travail', 'statut: changements trouvés', 'pages_ouvertes: https://unedic.org/x ; https://francetravail.org/y', 'raison: ', '[/COUVERTURE]');
  const reprise = R.balDomainesAReprendre(suite, ATTENDUS);
  assert.ok(!reprise.includes('Assurance chômage et France Travail'));
  assert.ok(reprise.includes('Accompagnement des jeunes'));
});

test('le calcul de couverture donne une ligne par domaine attendu, utilisée par l’écran du balayage', () => {
  const c = R.balCalculerCouverture(R.balParserDomaines(REPONSE), R.balLireCouverture(REPONSE), ATTENDUS);
  assert.strictEqual(c.lignes.length, ATTENDUS.length);
  assert.ok(c.lignes.every((l) => l.nom && l.icone && l.txt));
  assert.ok(html.includes('var calc = balCalculerCouverture(domaines, couv, balNomsDomaines())'), 'l’écran du balayage utilise le même calcul');
  assert.ok(html.includes('function balMessageReprise(domaines)') && html.includes('balMessageReprise(dr).texte'), 'un seul constructeur du message de reprise, pour l’écran et pour la carte');
});

test('le prompt du scan interdit « non essayé » et la page d’accueil comme preuve ; la carte propose la reprise ; aucun tiret long', () => {
  assert.ok(html.includes('ne déclare jamais une source « non essayée »') && html.includes('n\'est jamais une preuve'));
  assert.ok(html.includes('data-tc="reprise"') && html.includes('id="trp_'));
  const bloc = html.slice(html.indexOf('8. Capacité'), html.indexOf('8. Capacité') + 900);
  assert.ok(!/—|–/.test(bloc));
});
