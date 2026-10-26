const { test } = require('node:test');
const assert = require('node:assert/strict');

// En-tête de la lettre : coordonnées et bloc du destinataire (temps 3, décisions 22, 26, 27, 28, 68 du cahier lettre).
const D = require('../modules/lettre-core/destinataireLettreCo.js');
const { normaliserDonneesLettre } = require('../modules/lettre-core/normaliserDonneesLettre.js');

const base = (extra) => Object.assign({ rechercheCandidature: { entreprise: 'XEFI Bergerac', civiliteRecruteur: '', nomRecruteur: '' } }, extra || {});

test('entreprise : le nouveau parcours d\'abord, puis l\'ancien circuit, sinon vide', () => {
  assert.equal(D.entrepriseCibleDuDossierLettreCo(base()), 'XEFI Bergerac');
  assert.equal(D.entrepriseCibleDuDossierLettreCo({ objectif: 'stage', stage: { structure: 'Mairie' } }), 'Mairie');
  assert.equal(D.entrepriseCibleDuDossierLettreCo({ rechercheCandidature: { entreprise: '  ' }, objectif: 'stage', stage: { structure: 'Mairie' } }), 'Mairie');
  assert.equal(D.entrepriseCibleDuDossierLettreCo({}), '');
  assert.equal(D.entrepriseCibleDuDossierLettreCo(undefined), '');
});

test('sans entreprise visée (candidature générale) : seule la ligne « À l’attention du service recrutement » est imprimée', () => {
  const r = D.blocDestinataireLettreCo({});
  assert.deepEqual(r.lignes, ['À l’attention du service recrutement']);
  assert.deepEqual(r.lignesSansAdresse, ['À l’attention du service recrutement']);
  assert.equal(r.entreprise, '');
  assert.deepEqual(D.blocDestinataireLettreCo({ lettreDestinataire: { choix: 'direction', adresse: 'jamais imprimée', pour: '' } }).lignes, ['À l’attention de la direction']);
  assert.deepEqual(D.blocDestinataireLettreCo({ rechercheCandidature: { civiliteRecruteur: 'Madame', nomRecruteur: 'Machin' } }).lignes, ['À l’attention de Madame Machin']);
});

test('place du bloc : sous les coordonnées par défaut, à leur droite quand la lettre est longue', () => {
  assert.equal(D.destinataireCoteLettreCo(2000, 3), false);
  assert.equal(D.destinataireCoteLettreCo(4100, 3), true);
  assert.equal(D.destinataireCoteLettreCo(4100, 0), false);
  assert.equal(D.destinataireCoteLettreCo(3900, 2, 4200), false);
});

test('personne inconnue : entreprise, puis « À l’attention du service recrutement » par défaut', () => {
  const r = D.blocDestinataireLettreCo(base());
  assert.deepEqual(r.lignes, ['XEFI Bergerac', 'À l’attention du service recrutement']);
  assert.equal(r.personneConnue, false);
  assert.equal(r.ligneAttention, 'À l’attention du service recrutement');
});

test('une seule liste de choix : services, responsable, direction, gérant, « Autre » écrit à la main', () => {
  const ligne = (choix, autre) => D.blocDestinataireLettreCo(base({ lettreDestinataire: { choix, autre } })).lignes[1];
  assert.equal(ligne('rh'), 'À l’attention du service des ressources humaines');
  assert.equal(ligne('technique'), 'À l’attention du service technique');
  assert.equal(ligne('responsable'), 'À l’attention du responsable du recrutement');
  assert.equal(ligne('direction'), 'À l’attention de la direction');
  assert.equal(ligne('gerant'), 'À l’attention du gérant');
  assert.equal(ligne('autre', 'de Monsieur le Directeur'), 'À l’attention de Monsieur le Directeur');
  assert.equal(ligne('autre', ''), 'À l’attention du service recrutement');   // « Autre » encore vide : retombe sur le choix par défaut
  assert.equal(ligne('inconnu'), 'À l’attention du service recrutement');
  assert.equal(D.CHOIX_DESTINATAIRE_LETTRE_CO.length, 9);
});

test('personne connue (civilité et nom) : entreprise, service, « À l’attention de Madame Machin »', () => {
  const connue = (lettreDestinataire) => D.blocDestinataireLettreCo({ rechercheCandidature: { entreprise: 'XEFI Bergerac', civiliteRecruteur: 'Madame', nomRecruteur: 'Machin' }, lettreDestinataire });
  assert.deepEqual(connue().lignes, ['XEFI Bergerac', 'Service recrutement', 'À l’attention de Madame Machin']);
  assert.equal(connue().personneConnue, true);
  assert.equal(connue({ choix: 'technique' }).lignes[1], 'Service technique');
  assert.equal(connue({ choix: 'autre', autre: 'service logistique' }).lignes[1], 'Service logistique');
  assert.equal(connue({ choix: 'direction' }).lignes[1], 'Service recrutement');   // la direction n'est pas un service : on ne la propose pas ici
});

test('choix proposés : tous si la personne est inconnue, seulement les services si elle est connue', () => {
  assert.equal(D.choixProposesLettreCo(false).length, 9);
  assert.deepEqual(D.choixProposesLettreCo(true).map((c) => c.id), ['recrutement', 'rh', 'technique', 'commercial', 'compta', 'autre']);
});

test('civilité sans nom : traitée comme une personne inconnue (la formule d\'appel garde la civilité)', () => {
  const r = D.blocDestinataireLettreCo({ rechercheCandidature: { entreprise: 'XEFI', civiliteRecruteur: 'Madame', nomRecruteur: '' } });
  assert.deepEqual(r.lignes, ['XEFI', 'À l’attention du service recrutement']);
});

test('adresse : imprimée si saisie pour cette entreprise, jamais reprise pour une autre ; lignesSansAdresse la retire', () => {
  const ok = D.blocDestinataireLettreCo(base({ lettreDestinataire: { adresse: '12 rue des Lilas, 24100 Bergerac', pour: 'XEFI Bergerac' } }));
  assert.deepEqual(ok.lignes, ['XEFI Bergerac', '12 rue des Lilas, 24100 Bergerac', 'À l’attention du service recrutement']);
  assert.deepEqual(ok.lignesSansAdresse, ['XEFI Bergerac', 'À l’attention du service recrutement']);
  const autre = D.blocDestinataireLettreCo({ rechercheCandidature: { entreprise: 'Autre société' }, lettreDestinataire: { adresse: '12 rue des Lilas', pour: 'XEFI Bergerac' } });
  assert.deepEqual(autre.lignes, ['Autre société', 'À l’attention du service recrutement']);
});

test('code postal et ville : jamais de code postal oublié ni doublé', () => {
  assert.equal(D.ligneCodePostalVilleLettreCo({ codePostal: '24100', ville: 'Bergerac' }), '24100 Bergerac');
  assert.equal(D.ligneCodePostalVilleLettreCo({ codePostal: '24100', ville: '24100 Bergerac' }), '24100 Bergerac');
  assert.equal(D.ligneCodePostalVilleLettreCo({ ville: 'Bergerac' }), 'Bergerac');
  assert.equal(D.ligneCodePostalVilleLettreCo({ codePostal: '24100' }), '24100');
  assert.equal(D.ligneCodePostalVilleLettreCo({}), '');
  assert.equal(D.ligneCodePostalVilleLettreCo(undefined), '');
});

test('rue : seulement si la personne l\'a choisie', () => {
  assert.equal(D.ligneRueLettreCo({ adresse: '12 rue des Lilas' }, false), '');
  assert.equal(D.ligneRueLettreCo({ adresse: '12 rue des Lilas' }, true), '12 rue des Lilas');
  assert.equal(D.ligneRueLettreCo({}, true), '');
});

test('normaliserDonneesLettre : porte le bloc destinataire et le choix de la rue', () => {
  const r = normaliserDonneesLettre(base({ ia: { lettre: { lettre: { objet: 'X', texte: 'Y' } } } }));
  assert.deepEqual(r.destinataire.lignes, ['XEFI Bergerac', 'À l’attention du service recrutement']);
  assert.equal(r.inclureRue, false);
  assert.equal(normaliserDonneesLettre(base({ lettreDestinataire: { rue: true } })).inclureRue, true);
  assert.deepEqual(normaliserDonneesLettre({}).destinataire.lignes, ['À l’attention du service recrutement']);
});

test('mise en page de la lettre : essais du plus aéré au plus serré, empreinte liée au contenu', () => {
  const c = D.CANDIDATS_MISE_EN_PAGE_LETTRE_CO;
  const d = D.INDICE_MISE_EN_PAGE_DEFAUT_LETTRE_CO;
  assert.ok(c[0].tailleCorps > c[d].tailleCorps);                       // « Mise en page » commence par agrandir (lettre courte)
  assert.equal(c[d].tailleCorps, 21);                                    // l'essai par défaut garde la taille d'origine (10,5 pt)
  assert.equal(c[d].cote, false);
  for (let i = 1; i < c.length; i++) { assert.ok(c[i].tailleCorps <= c[i - 1].tailleCorps, 'la taille ne remonte jamais en descendant la liste'); }
  const premierCote = c.findIndex((x) => x.cote);
  assert.ok(premierCote > d);                                            // le destinataire monte au niveau des coordonnées après l'essai par défaut
  assert.equal(c[premierCote].tailleCorps, c[d].tailleCorps);           // ... AVANT que le texte rapetisse
  assert.ok(c[c.length - 1].tailleCorps < c[d].tailleCorps);
  assert.ok(c.every((x) => ['large', 'normal', 'serre', 'tres-serre'].includes(x.espacement)));
  assert.equal(c[c.length - 1].espacement, 'tres-serre');
  const base = { texte: 'A', objet: 'O', destinataire: { lignes: ['X'] }, inclureRue: false };
  assert.equal(D.signatureMiseEnPageLettreCo(base), D.signatureMiseEnPageLettreCo(Object.assign({}, base)));
  assert.notEqual(D.signatureMiseEnPageLettreCo(base), D.signatureMiseEnPageLettreCo(Object.assign({}, base, { texte: 'B' })));
  assert.notEqual(D.signatureMiseEnPageLettreCo(base), D.signatureMiseEnPageLettreCo(Object.assign({}, base, { inclureRue: true })));
  assert.equal(typeof D.signatureMiseEnPageLettreCo(undefined), 'string');
});

test('gabarits de la lettre : cinq, Sobre par défaut ; couleur choisie, sinon celle du CV (hors Sobre), sinon celle du gabarit', () => {
  assert.equal(D.GABARITS_LETTRE_CO.length, 5);
  assert.equal(D.gabaritLettreCo('inconnu').id, 'g0');
  assert.equal(D.gabaritLettreCo('g3').nom, 'Bandeau coloré');
  assert.equal(D.couleurLettreEffectiveCo('g0', '', '#7A2E8A'), '1A1A1A');          // le Sobre reste neutre
  assert.equal(D.couleurLettreEffectiveCo('g2', '', '#7a2e8a'), '7A2E8A');          // la couleur du CV est reprise
  assert.equal(D.couleurLettreEffectiveCo('g2', '#1f5fbf', '#7a2e8a'), '1F5FBF');   // la couleur choisie l'emporte
  assert.equal(D.couleurLettreEffectiveCo('g2', '', ''), '0B3D6E');                 // rien : couleur du gabarit
  assert.equal(D.couleurLettreEffectiveCo('g1', 'pas-une-couleur', null), '2C4A7A');
  assert.equal(D.gabaritLettreCo('g2').wordFidele, false);                           // colonne pleine hauteur : message « PDF conseillé »
  const r = normaliserDonneesLettre({ lettreDestinataire: { gabarit: 'g4', couleur: '#123456' }, metierCible: 'Magasinier' });
  assert.equal(r.gabarit, 'g4'); assert.equal(r.couleurChoisie, '#123456'); assert.equal(r.poste, 'Magasinier');
  assert.equal(normaliserDonneesLettre({}).gabarit, 'g0');
});
