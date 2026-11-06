const test = require('node:test');
const assert = require('node:assert');
const P = require('../outils/veillePreuve.js');

const TIRET = new RegExp(String.fromCharCode(0x2013) + '|' + String.fromCharCode(0x2014));

test('preuve : une ligne complète est lue en trois éléments et jugée solide', () => {
  const e = 'fiche: aides-embauche\netat: A JOUR\npreuve: https://www.service-public.fr/professionnels-entreprises/vosdroits/F23556 | 12/10/2026 | « Le montant de l\'aide est fixé à 4 000 euros par an »\nresume: rien à signaler';
  const p = P.lire(e), ev = P.evaluer(p);
  assert.strictEqual(p.adresse, 'https://www.service-public.fr/professionnels-entreprises/vosdroits/F23556');
  assert.strictEqual(p.date, '12/10/2026');
  assert.strictEqual(p.passage, 'Le montant de l\'aide est fixé à 4 000 euros par an');
  assert.strictEqual(ev.niveau, 'solide');
  assert.deepStrictEqual(ev.problemes, []);
});

test('preuve : « sans date » est accepté, une date au format ISO est remise en français, un lien markdown est lu', () => {
  assert.strictEqual(P.evaluer(P.lire('preuve: https://exemple.gouv.fr/page/aide | sans date | le dispositif reste ouvert aux demandeurs d\'emploi')).niveau, 'solide');
  const p = P.lire('preuve: [la page](https://exemple.gouv.fr/page/aide) | 2026-10-05 | le dispositif reste ouvert aux demandeurs d\'emploi');
  assert.strictEqual(p.adresse, 'https://exemple.gouv.fr/page/aide');
  assert.strictEqual(p.date, '05/10/2026');
});

test('preuve : sans ligne, « aucune », sans passage ou sans adresse = absente', () => {
  assert.strictEqual(P.evaluer(P.lire('fiche: x\netat: A JOUR\nresume: rien')).niveau, 'absente');
  assert.strictEqual(P.evaluer(P.lire('preuve: aucune')).niveau, 'absente');
  assert.strictEqual(P.evaluer(P.lire('preuve: Aucune.')).niveau, 'absente');
  assert.strictEqual(P.evaluer(P.lire('preuve: https://exemple.gouv.fr/page/aide | 12/10/2026 | ')).niveau, 'absente');
  assert.strictEqual(P.evaluer(P.lire('preuve: 12/10/2026 | le dispositif reste ouvert aux demandeurs d\'emploi')).niveau, 'absente');
  assert.strictEqual(P.evaluer(P.lire('preuve: https://exemple.gouv.fr/page/aide | 12/10/2026 | oui')).niveau, 'absente');
});

test('preuve : page d\'accueil, date manquante ou passage trop long = faible, avec la raison dite', () => {
  const accueil = P.evaluer(P.lire('preuve: https://www.service-public.fr | 12/10/2026 | le dispositif reste ouvert aux demandeurs d\'emploi'));
  assert.strictEqual(accueil.niveau, 'faible');
  assert.match(accueil.problemes.join(' '), /page d'accueil/);
  const sansDate = P.evaluer(P.lire('preuve: https://exemple.gouv.fr/page/aide | | le dispositif reste ouvert aux demandeurs d\'emploi'));
  assert.strictEqual(sansDate.niveau, 'faible');
  assert.match(sansDate.problemes.join(' '), /date/);
  const long = P.evaluer(P.lire('preuve: https://exemple.gouv.fr/page/aide | 12/10/2026 | ' + new Array(40).fill('mot').join(' ')));
  assert.strictEqual(long.niveau, 'faible');
  assert.match(long.problemes.join(' '), /trop long/);
});

test('preuve : A JOUR sans preuve utilisable devient INCERTAIN ; les autres états et les preuves faibles ne bougent pas', () => {
  const absente = P.evaluer(P.lire('preuve: aucune')), faible = { niveau: 'faible', problemes: ['x'] };
  assert.deepStrictEqual(P.etatRetenu('A_JOUR', absente), { etat: 'INCERTAIN', declasse: true });
  assert.deepStrictEqual(P.etatRetenu('A_JOUR', faible), { etat: 'A_JOUR', declasse: false });
  assert.deepStrictEqual(P.etatRetenu('CHANGEMENT', absente), { etat: 'CHANGEMENT', declasse: false });
  assert.deepStrictEqual(P.etatRetenu('PRINCIPE_OBSOLETE', absente), { etat: 'PRINCIPE_OBSOLETE', declasse: false });
});

test('preuve : la consigne et le gabarit demandent les trois éléments, sans tiret long', () => {
  const c = P.consigne();
  assert.match(c, /preuve:/);
  assert.match(c, /mot pour mot/);
  assert.match(c, /page d'accueil/);
  assert.match(c, /preuve: aucune/);
  assert.ok(!TIRET.test(c + P.LIGNE_GABARIT), 'aucun tiret long');
  assert.strictEqual(P.evaluer(P.lire(P.LIGNE_GABARIT.replace('https://adresse-exacte-de-la-page-lue', 'https://exemple.gouv.fr/page/aide').replace('JJ/MM/AAAA ou sans date', '12/10/2026').replace('passage recopié mot pour mot', 'passage recopié mot pour mot sur la page'))).niveau, 'solide');
});

test('preuve phase 2 : un passage absent de la page, ou une page inexistante, fait passer un « A JOUR » à INCERTAIN ; une page illisible ou un passage retrouvé ne change rien', () => {
  const solide = { niveau: 'solide', problemes: [] };
  assert.deepStrictEqual(P.etatRetenu('A_JOUR', solide, { verdict: 'non-retrouve' }), { etat: 'INCERTAIN', declasse: true });
  assert.deepStrictEqual(P.etatRetenu('A_JOUR', solide, { verdict: 'adresse-introuvable' }), { etat: 'INCERTAIN', declasse: true });
  assert.deepStrictEqual(P.etatRetenu('A_JOUR', solide, { verdict: 'non-lisible' }), { etat: 'A_JOUR', declasse: false });
  assert.deepStrictEqual(P.etatRetenu('A_JOUR', solide, { verdict: 'retrouve' }), { etat: 'A_JOUR', declasse: false });
  assert.deepStrictEqual(P.etatRetenu('A_JOUR', solide, { verdict: 'proche' }), { etat: 'A_JOUR', declasse: false });
  assert.deepStrictEqual(P.etatRetenu('CHANGEMENT', solide, { verdict: 'non-retrouve' }), { etat: 'CHANGEMENT', declasse: false });
});

test('preuve phase 2 : seules les lignes à preuve utilisable (adresse et passage) sont proposées à la lecture', () => {
  const parId = {
    'fiche-a': { preuveNiveau: 'solide', preuve: { adresse: 'https://exemple.gouv.fr/a', passage: 'un passage assez long pour etre retrouve' } },
    'fiche-b': { preuveNiveau: 'absente', preuve: { adresse: '', passage: '' } },
    'fiche-c': { preuveNiveau: 'faible', preuve: { adresse: 'https://exemple.gouv.fr/', passage: 'un autre passage assez long pour etre retrouve' } },
    'fiche-d': { preuveNiveau: '', preuve: null }
  };
  assert.deepStrictEqual(P.lignesAVerifier(parId).map((x) => x.id), ['fiche-a', 'fiche-c']);
});

test('preuve des messages à entrées : examiner() rend les mêmes champs que le rapport de contrôle, la consigne ne contient aucun tiret long', () => {
  const x = P.examiner('preuve: https://www.legifrance.gouv.fr/loda/id/JORFTEXT000000000001 | 05/10/2026 | Le montant du plafond est porté à 4 000 euros par mois');
  assert.strictEqual(x.preuveNiveau, 'solide');
  assert.strictEqual(x.preuve.adresse, 'https://www.legifrance.gouv.fr/loda/id/JORFTEXT000000000001');
  assert.strictEqual(x.preuve.date, '05/10/2026');
  assert.strictEqual(P.examiner('preuve: ').preuveNiveau, 'absente');
  assert.strictEqual(P.examiner('preuve: aucune').preuveNiveau, 'absente');
  const un = { h1: P.examiner("preuve: https://exemple.gouv.fr/page/aide | sans date | le dispositif reste ouvert aux demandeurs d'emploi") };
  assert.deepStrictEqual(P.lignesAVerifier(un).map((l) => l.id), ['h1']);
  const c = P.consigneEntrees("Si tu n'as ouvert aucune page, ne l'écris pas.");
  assert.match(c, /pour chaque entrée/);
  assert.match(c, /mot pour mot/);
  assert.match(c, /ne l'écris pas/);
  assert.ok(!TIRET.test(c), 'aucun tiret long');
});

