const test = require('node:test');
const assert = require('node:assert');
const SN = require('../outils/veilleSansNumero.js');

// Demande de Denis (04/11/2026) : une fiche publiée dont le NOM est le numéro court (« Le 115 ») n'a pas à être « Jamais vérifiée » :
// le numéro est proposé, prêt à enregistrer. Les autres fiches sans numéro restent à chercher.
const ENTETE = '# Registre\n# FORMAT : id | type | nom | description | commune | zone | telephone | site | portee | rayons | source | date\n#\n';
const ligne = (id, nom) => [id, 'logement-hebergement', nom, 'une phrase', '', '', '', 'https://exemple.gouv.fr/', 'national', 'logement', 'Source', '2026-10-17'].join(' | ');

test('cartesSansNumero : « Le 115 » arrive avec son numéro, « CCAS » reste sans numéro', () => {
  const regs = { lieux: ENTETE + ligne('115-samu-social', 'Le 115') + '\n' + ligne('le-3919', 'Le 3919') + '\n' + ligne('ccas-87', 'CCAS de Limoges') + '\n', employeurs: '' };
  const c = SN.cartesSansNumero(regs, '', '2026-11-04', []);
  const par = {}; c.forEach((x) => { par[x.valeurs.cible] = x; });
  assert.strictEqual(par['115-samu-social'].valeurs.telephone, '115');
  assert.strictEqual(par['115-samu-social'].numeroCourt, true);
  assert.strictEqual(par['le-3919'].valeurs.telephone, '3919');
  assert.strictEqual(par['ccas-87'].valeurs.telephone, '');
  assert.strictEqual(par['ccas-87'].numeroCourt, false);
});
