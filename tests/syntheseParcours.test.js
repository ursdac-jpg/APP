/* Tests de « Mon parcours » (étape B2 de Ma synthèse) : métiers exercés, compétences cochées, bagage, comparaison à chaque piste, demande, sauvegarde. Données réelles du ROME. */
const test = require('node:test');
const assert = require('node:assert');
const P = require('../modules/comprendre-les-metiers/syntheseParcoursLogique.js');
const L = require('../modules/comprendre-les-metiers/syntheseLectureLogique.js');
const S = require('../modules/comprendre-les-metiers/syntheseLogique.js');
const D = require('../modules/comprendre-les-metiers/parMetierDonnees.js').pmdDonnees();

const codeDe = (nom) => D.m.find((r) => r[0] === nom).code;
const idxDe = (nom) => D.m.findIndex((r) => r[0] === nom);

test('cinq métiers au plus, jamais deux fois le même, « Autre expérience » compte comme un métier', () => {
  const parcours = [];
  assert.deepStrictEqual(P.synpAjouterMetier(parcours, codeDe('Cuisinier'), 'Cuisinier'), { ok: true });
  assert.deepStrictEqual(P.synpAjouterMetier(parcours, codeDe('Cuisinier'), 'Cuisinier'), { ok: false, raison: 'deja' });
  assert.deepStrictEqual(P.synpAjouterMetier(parcours, '', ''), { ok: true });                    // Autre expérience
  assert.deepStrictEqual(P.synpAjouterMetier(parcours, '', ''), { ok: false, raison: 'deja' });
  ['Animateur', 'Cariste', 'Magasinier'].forEach((n) => assert.ok(P.synpAjouterMetier(parcours, codeDe(n), n).ok));
  assert.strictEqual(parcours.length, 5);
  assert.deepStrictEqual(P.synpAjouterMetier(parcours, codeDe('Aide-soignant'), 'Aide-soignant'), { ok: false, raison: 'plein' });
  assert.strictEqual(parcours[1].nom, P.SYNP_AUTRE);
  assert.strictEqual(parcours[1].rome, '');
  assert.deepStrictEqual(P.synpAjouterMetier(parcours, 'pas un code', 'x'), { ok: false, raison: 'deja' });   // un code mal formé devient « Autre expérience », déjà présente
});

test('une entrée sans nom ou un code mal formé n’est pas ajouté comme un métier', () => {
  const parcours = [];
  assert.deepStrictEqual(P.synpAjouterMetier(parcours, 'K1234', ''), { ok: false, raison: 'invalide' });
  assert.deepStrictEqual(P.synpAjouterMetier(null, 'K1234', 'x'), { ok: false, raison: 'invalide' });
  assert.strictEqual(parcours.length, 0);
});

test('cocher, décocher, tout décocher, plafond de saisie', () => {
  const e = P.synpEntree(codeDe('Cuisinier'), 'Cuisinier'), f = P.synpFiche(D, e);
  assert.ok(P.synpBasculer(e, 'sf', f.sf[0].l));
  assert.strictEqual(P.synpNbCoches(e), 1);
  assert.ok(P.synpBasculer(e, 'sf', f.sf[0].l));
  assert.strictEqual(P.synpNbCoches(e), 0);
  f.se.forEach((x) => P.synpBasculer(e, 'se', x.l));                        // la personne coche à la main : il n'y a plus de « tout cocher »
  assert.strictEqual(e.se.length, f.se.length);
  P.synpBasculer(e, 'se', 'Ajoutée à la main');
  assert.ok(P.synpToutDecocher(e, 'se', f.se.map((x) => x.l)));            // seulement ceux de la fiche
  assert.deepStrictEqual(e.se, ['Ajoutée à la main']);
  assert.ok(P.synpToutDecocher(e, 'se'));
  assert.strictEqual(e.se.length, 0);
  assert.ok(!P.synpBasculer(e, 'xx', 'a'));                                 // type inconnu
  assert.ok(!P.synpBasculer(e, 'sf', ''));
  for (let i = 0; i < 200; i++) { P.synpBasculer(e, 'se', 'libre ' + i); }
  assert.strictEqual(e.se.length, P.SYNP_PLAFOND_SAISIE.se);
});

test('la fiche d’un métier exercé : cœur du métier d’abord, diplômes mis à part, rien pour « Autre expérience »', () => {
  const f = P.synpFiche(D, P.synpEntree(codeDe('Animateur'), 'Animateur'));
  assert.strictEqual(f.nom, 'Animateur');
  assert.ok(f.sf.length > 5 && f.se.length > 0);
  const premierNonCoeur = f.sf.findIndex((x) => !x.c);
  assert.ok(f.sf.slice(0, premierNonCoeur).every((x) => x.c) && f.sf.slice(premierNonCoeur).every((x) => !x.c), 'cœur d’abord');
  assert.ok(f.diplomes.length > 0, 'des diplômes existent pour ce métier');
  assert.ok(f.sv.every((x) => D.sv[x.i].cat !== P.SYNP_CAT_DIPLOMES), 'aucun diplôme parmi les savoirs à cocher');
  f.diplomes.forEach((d) => assert.ok(!f.sv.some((x) => x.l === d)));
  assert.strictEqual(P.synpFiche(D, P.synpEntree('', '')), null);
  assert.strictEqual(P.synpFiche(D, P.synpEntree('Z9999', 'Inconnu')), null);
});

test('le bagage : numéros sans doublon, libellé inconnu ou diplôme ignorés', () => {
  const a = P.synpEntree(codeDe('Cuisinier'), 'Cuisinier'), b = P.synpEntree(codeDe('Animateur'), 'Animateur');
  const fa = P.synpFiche(D, a);
  P.synpBasculer(a, 'sf', fa.sf[0].l); P.synpBasculer(b, 'sf', fa.sf[0].l);   // même libellé dans deux métiers
  P.synpBasculer(a, 'sf', 'Une compétence qui n’existe pas');
  const diplome = P.synpFiche(D, b).diplomes[0];
  P.synpBasculer(b, 'sv', diplome);
  const ids = P.synpBagageIds(D, [a, b]);
  assert.strictEqual(ids.length, 1);
  assert.deepStrictEqual(ids[0], { t: 'sf', i: fa.sf[0].i });
  assert.deepStrictEqual(P.synpBagageIds(D, null), []);
});

test('la comparaison du parcours à chaque piste : transférables, transversales, à acquérir, sans diplômes', () => {
  const cuisinier = P.synpEntree(codeDe('Cuisinier'), 'Cuisinier'), fc = P.synpFiche(D, cuisinier);
  fc.sf.forEach((x) => P.synpBasculer(cuisinier, 'sf', x.l));
  fc.se.forEach((x) => P.synpBasculer(cuisinier, 'se', x.l));
  fc.sv.forEach((x) => P.synpBasculer(cuisinier, 'sv', x.l));
  const bagage = P.synpBagageIds(D, [cuisinier]);
  // le métier se compare à lui-même : tout est déjà là, rien à acquérir
  const soi = L.synComparerPiste(bagage, P.synpFichePourComparaison(D, idxDe('Cuisinier')));
  assert.strictEqual(soi.deja, soi.total);
  assert.strictEqual(soi.aAcquerir.length, 0);
  // vers un autre métier
  const vers = L.synComparerPiste(bagage, P.synpFichePourComparaison(D, idxDe('Animateur')));
  assert.strictEqual(vers.total, vers.deja + vers.aAcquerir.length);
  assert.ok(vers.transferables.every((c) => c.t !== 'se') && vers.transversales.every((c) => c.t === 'se'));
  assert.ok(vers.aAcquerir.every((c) => !(c.t === 'sv' && D.sv[c.i].cat === P.SYNP_CAT_DIPLOMES)), 'aucun diplôme parmi les compétences à acquérir');
  // le total ne compte pas les diplômes
  const brut = D.m[idxDe('Animateur')];
  assert.ok(vers.total < brut[3].length + brut[4].length + brut[5].length);
  // sans rien de coché : rien à comparer (jamais un dessin trompeur)
  assert.strictEqual(L.synComparerPiste([], P.synpFichePourComparaison(D, idxDe('Animateur'))), null);
});

test('la demande : une ligne par métier, cœur d’abord, plafonnée, « Autre expérience » nommée, rien si rien n’est coché', () => {
  assert.deepStrictEqual(P.synpLignesDemande(D, []), []);
  const vide = P.synpEntree(codeDe('Cuisinier'), 'Cuisinier');
  assert.deepStrictEqual(P.synpLignesDemande(D, [vide]), []);
  const e = P.synpEntree(codeDe('Cuisinier'), 'Cuisinier'), f = P.synpFiche(D, e);
  f.sf.forEach((x) => P.synpBasculer(e, 'sf', x.l));
  f.se.forEach((x) => P.synpBasculer(e, 'se', x.l));
  f.sv.forEach((x) => P.synpBasculer(e, 'sv', x.l));
  const autre = P.synpEntree('', '');
  P.synpBasculer(autre, 'sf', f.sf[0].l);
  const lignes = P.synpLignesDemande(D, [e, autre]);
  assert.strictEqual(lignes.length, 2);
  assert.ok(lignes[0].startsWith('Cuisinier : savoir-faire : '));
  assert.ok(lignes[0].includes(f.sf[0].l), 'le cœur du métier est cité en premier');
  assert.ok(/ \(et \d+ autres\)/.test(lignes[0]), 'au-delà du plafond, le nombre d’autres est dit');
  assert.strictEqual(lignes[0].split(' ; ').length, 3);
  assert.ok(lignes[1].startsWith(P.SYNP_AUTRE));
  // les compétences ajoutées à la main viennent après celles de la fiche
  const x = P.synpEntree(codeDe('Cuisinier'), 'Cuisinier'); P.synpBasculer(x, 'sf', 'Compétence ajoutée à la main'); P.synpBasculer(x, 'sf', f.sf[0].l);
  const l2 = P.synpLignesDemande(D, [x])[0];
  assert.ok(l2.indexOf(f.sf[0].l) < l2.indexOf('Compétence ajoutée à la main'));
});

test('la ligne la plus longue possible reste raisonnable', () => {
  const parcours = [];
  ['Cuisinier', 'Cariste', 'Animateur', 'Magasinier', 'Aide-soignant'].forEach((n) => {
    P.synpAjouterMetier(parcours, codeDe(n), n);
    const e = parcours[parcours.length - 1], f = P.synpFiche(D, e);
    f.sf.forEach((x) => P.synpBasculer(e, 'sf', x.l)); f.se.forEach((x) => P.synpBasculer(e, 'se', x.l)); f.sv.forEach((x) => P.synpBasculer(e, 'sv', x.l));
  });
  const total = P.synpLignesDemande(D, parcours).join('\n').length;
  assert.ok(total <= P.SYNP_BUDGET_DEMANDE, 'trop long : ' + total);
  assert.strictEqual(P.synpLignesDemande(D, parcours).length, 5, 'aucun métier n’est retiré pour faire tenir le budget');
  assert.ok(P.synpLignesDemande(D, parcours).every((l) => /savoir-faire : /.test(l)), 'le cœur de chaque métier reste cité');
});

test('la demande entière contient le parcours, sinon dit « non donné »', () => {
  const GARDE = require('fs').readFileSync(require('path').join(__dirname, '../prompts/_garde-fou-reponse.md'), 'utf8').trim();
  const modele = require('fs').readFileSync(require('path').join(__dirname, '../prompts/ma-synthese.md'), 'utf8').replace('{{GARDE_FOU_REPONSE}}', GARDE);
  const sans = L.synConstruireDemande(modele, { parcours: [] });
  assert.ok(sans.texte.includes('PARCOURS PROFESSIONNEL : non donné'));
  const e = P.synpEntree(codeDe('Cuisinier'), 'Cuisinier'), f = P.synpFiche(D, e); P.synpBasculer(e, 'sf', f.sf[0].l);
  const avec = L.synConstruireDemande(modele, { parcours: P.synpLignesDemande(D, [e]) });
  assert.ok(avec.texte.includes('PARCOURS PROFESSIONNEL (métiers exercés'));
  assert.ok(avec.texte.includes('\n- Cuisinier : savoir-faire : ' + f.sf[0].l));
  assert.ok(!avec.texte.includes('non donné. Ne devinez rien : dites que la lecture ne voit pas ce que l’expérience'));
  assert.ok(!/[—–]/.test(avec.texte.split('## 3.')[1] || ''), 'aucun tiret long dans les données');
});

test('la sauvegarde : seulement codes, noms et libellés, plafonnés ; relue avec méfiance', () => {
  const e = P.synpEntree(codeDe('Cuisinier'), 'Cuisinier'); P.synpBasculer(e, 'sf', 'Préparer des plats'); e.dateDebut = '2020'; e.employeur = 'Chez Marcel';
  const sortie = P.synpPourFichier([e, P.synpEntree('', '')]);
  assert.deepStrictEqual(Object.keys(sortie[0]).sort(), ['nom', 'rome', 'se', 'sf', 'sv']);
  assert.strictEqual(sortie[1].nom, P.SYNP_AUTRE);
  // un fichier hostile
  const brut = [
    { rome: 'K1234', nom: 'Un métier', sf: ['a', 'a', 5, null, 'x'.repeat(500)], se: 'pas une liste', sv: [] },
    { rome: 'K1234', nom: 'Le même', sf: ['b'] },                                  // doublon : ignoré
    { rome: 'pas un code', nom: 'Autre', sf: ['c'] },                               // devient « Autre expérience »
    'une chaîne', null, [], 42,
    { rome: 'M1111', nom: '', sf: [] },                                              // sans nom : ignoré
    { rome: 'A1111', nom: 'A', sf: [] }, { rome: 'B1111', nom: 'B' }, { rome: 'C1111', nom: 'C' }, { rome: 'D1111', nom: 'D' }
  ];
  const lu = P.synpNormaliserDepuisFichier(brut);
  assert.ok(lu.length <= P.SYNP_MAX_METIERS);
  assert.deepStrictEqual(lu[0].sf, ['a']);
  assert.deepStrictEqual(lu[0].se, []);
  assert.strictEqual(lu[1].nom, P.SYNP_AUTRE);
  assert.ok(!lu.some((x) => x.nom === 'Le même'));
  assert.deepStrictEqual(P.synpNormaliserDepuisFichier('n’importe quoi'), []);
  assert.deepStrictEqual(P.synpNormaliserDepuisFichier(undefined), []);
});

test('aller-retour dans la disquette : le parcours est gardé avec la synthèse, jamais sans', () => {
  const e = P.synpEntree(codeDe('Cuisinier'), 'Cuisinier'); P.synpBasculer(e, 'sf', 'Préparer des plats'); P.synpBasculer(e, 'se', 'Avoir l’esprit d’équipe');
  const etat = { retenu1: null, retenu2: null, retenu3: null, niveau: null, suivi: [], complements: [], parcours: [e], libre: 'texte libre', lecture: { x: 1 }, gardee: true };
  const fichier = JSON.parse(JSON.stringify(S.synPourFichier(etat)));
  assert.strictEqual(fichier.parcours.length, 1);
  assert.ok(!('libre' in fichier) && !('lecture' in fichier));
  const relu = S.synNormaliserDepuisFichier(fichier, () => null);
  assert.ok(relu, 'un parcours seul suffit à rendre le fichier utilisable');
  assert.deepStrictEqual(relu.parcours[0].sf, ['Préparer des plats']);
  assert.deepStrictEqual(relu.parcours[0].se, ['Avoir l’esprit d’équipe']);
  assert.strictEqual(S.synPourFichier(Object.assign({}, etat, { gardee: false })), null);
  // un ancien fichier sans parcours se relit encore
  const ancien = S.synNormaliserDepuisFichier({ niveau: 3, suivi: ['non'] }, () => null);
  assert.deepStrictEqual(ancien.parcours, []);
});
