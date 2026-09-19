const { test } = require('node:test');
const assert = require('node:assert/strict');

const { detecterTexteCache } = require('../modules/ats/detectionTexteCache.js');

test('bloc de mots-cles colle au reste par un ecart d\'espaces anormal : suspect', () => {
  const cv = "Employe polyvalent de magasin, 2021 a 2024. Mise en rayon, tenue de caisse, "
    + "accueil et renseignement des clients. References disponibles sur demande."
    + "   management gestion de projet leadership reporting budget pilotage agile scrum analyste"
    + "   Centres d'interet : randonnee.";
  const r = detecterTexteCache(cv);
  assert.equal(r.suspect, true);
  assert.equal(r.extraits.length, 1);
  assert.match(r.extraits[0].bloc, /management gestion de projet leadership/);
  assert.ok(r.extraits[0].avant.length > 0, 'un contexte "avant" est fourni');
  assert.ok(r.extraits[0].apres.length > 0, 'un contexte "apres" est fourni');
});

test('bloc de mots-cles isole par une tabulation : suspect', () => {
  const cv = "Vendeuse en pret-a-porter pendant quatre ans. Conseil client, encaissement, vitrine."
    + "\t leadership management communication negociation reporting budget strategie pilotage synergie";
  const r = detecterTexteCache(cv);
  assert.equal(r.suspect, true);
});

test('CV normal detaille : jamais suspect', () => {
  const cv = "Secretaire dans un cabinet medical, 2019 a 2023. Je recevais les patients a leur arrivee, "
    + "je prenais les rendez-vous par telephone et sur l'ordinateur, je tenais l'agenda des trois medecins, "
    + "je classais les dossiers et j'encaissais les consultations. Avant, vendeuse en boulangerie pendant deux ans.";
  const r = detecterTexteCache(cv);
  assert.equal(r.suspect, false);
});

test('liste de competences separee par des virgules : jamais suspect (liste normale)', () => {
  const cv = "Employe de bureau. Competences informatiques : Word, Excel, PowerPoint, Outlook, "
    + "Canva, Photoshop, Illustrator, InDesign, LibreOffice, Google Docs, Trello, Slack.";
  const r = detecterTexteCache(cv);
  assert.equal(r.suspect, false);
});

test('meme terme repete de facon anormale dans un CV assez long : suspect (repli)', () => {
  const cv = "Assistant commercial pendant cinq ans dans une PME du secteur industriel. "
    + "J'assurais la relation avec les clients, le suivi des commandes et la preparation des devis. "
    + "commercial commercial commercial commercial commercial commercial vente vente vente prospection.";
  const r = detecterTexteCache(cv);
  assert.equal(r.suspect, true);
});

test('texte trop court : jamais suspect', () => {
  assert.equal(detecterTexteCache('Serveur.').suspect, false);
  assert.equal(detecterTexteCache('').suspect, false);
  assert.equal(detecterTexteCache(null).suspect, false);
});

test('ne bloque jamais : retourne toujours un objet exploitable', () => {
  assert.doesNotThrow(() => {
    const r = detecterTexteCache(12345);
    assert.equal(typeof r.suspect, 'boolean');
    assert.ok(Array.isArray(r.extraits));
  });
});

test('au plus 3 extraits', () => {
  const bloc = "   alpha beta gamma delta epsilon zeta eta theta iota kappa";
  const cv = "Poste un. Tache une." + bloc + " Poste deux. Tache deux." + bloc.replace('alpha', 'omega')
    + " Poste trois." + bloc.replace('alpha', 'sigma') + " Poste quatre." + bloc.replace('alpha', 'tau');
  const r = detecterTexteCache(cv);
  assert.ok(r.extraits.length <= 3);
});
