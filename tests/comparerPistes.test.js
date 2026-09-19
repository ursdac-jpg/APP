const { test } = require('node:test');
const assert = require('node:assert/strict');

// comparerNomVersCodeFrein lit le repertoire global (charge avant le
// module en navigateur) -- on le fournit ici avant le require.
global.FREINS_REPERTOIRE = require('../data/freins.js').FREINS_REPERTOIRE;

// Le module s'expose sur module.exports pour ses helpers purs (le reste
// touche le DOM et n'est teste qu'en navigateur).
const cp = require('../modules/comparer-pistes/index.js');

test('_comparerNavIndex : chaque ecran (0..8) tombe sur un repere 0..5', () => {
  const attendu = [0, 0, 1, 2, 3, 3, 3, 4, 5];
  for (let e = 0; e <= 8; e++) {
    assert.equal(cp._comparerNavIndex(e), attendu[e], 'ecran ' + e);
  }
});

test('comparerDateCourte : jour + mois court, 1er, entrees invalides', () => {
  assert.equal(cp.comparerDateCourte('2026-09-01'), '1er sept.');
  assert.equal(cp.comparerDateCourte('2026-08-28'), '28 août');
  assert.equal(cp.comparerDateCourte('2026-01-15'), '15 janv.');
  assert.equal(cp.comparerDateCourte(''), '');
  assert.equal(cp.comparerDateCourte(null), '');
  assert.equal(cp.comparerDateCourte('pas une date'), '');
});

test('_comparerNavIndex : ecran hors bornes -> -1 (barre en sourdine)', () => {
  assert.equal(cp._comparerNavIndex(-1), -1);
  assert.equal(cp._comparerNavIndex(99), -1);
});

test('COMPARER_NAV_ETAPES : 6 reperes, label + icone chacun', () => {
  assert.equal(cp.COMPARER_NAV_ETAPES.length, 6);
  cp.COMPARER_NAV_ETAPES.forEach((et) => {
    assert.ok(et.label && typeof et.label === 'string');
    assert.ok(et.icone && typeof et.icone === 'string');
    assert.ok(!/[A-Za-z]/.test(et.icone), 'icone = entite/objet, jamais du texte : ' + et.icone);
  });
});

test('_comparerTerritoireLibelle : 24 / 87 / ailleurs / inconnu', () => {
  assert.equal(cp._comparerTerritoireLibelle('24'), 'Dordogne (24)');
  assert.equal(cp._comparerTerritoireLibelle('87'), 'Haute-Vienne (87)');
  assert.equal(cp._comparerTerritoireLibelle('ailleurs'), 'Hors Dordogne et Haute-Vienne');
  assert.equal(cp._comparerTerritoireLibelle(null), null);
  assert.equal(cp._comparerTerritoireLibelle('inconnu'), null);
});

test('COMPARER_SITUATIONS : 6 situations, id + libelle, ids stables', () => {
  const ids = cp.COMPARER_SITUATIONS.map((s) => s.id);
  assert.deepEqual(ids, ['emploi', 'sans-emploi', 'formation', 'foyer', 'arret-sante', 'independant']);
  cp.COMPARER_SITUATIONS.forEach((s) => assert.ok(s.libelle && s.libelle.length > 3));
});

test('echapperTexte : neutralise < > & pour un contenu de textarea', () => {
  assert.equal(cp.echapperTexte('<b>a & b</b>'), '&lt;b&gt;a &amp; b&lt;/b&gt;');
  assert.equal(cp.echapperTexte(null), '');
  assert.equal(cp.echapperTexte(undefined), '');
});

test('comparerParserDetection : JSON propre -> pistes + etiquettes + filet', () => {
  const brut = 'Voici : {"pistes":[{"nom":"CAP carrelage","etiquette":"formation","extrait":"..."},' +
    '{"nom":"Rester en poste","etiquette":"situation"}],"ce_qui_ne_rentre_pas":"mal au dos"}';
  const r = cp.comparerParserDetection(brut);
  assert.equal(r.erreur, undefined);
  assert.equal(r.pistes.length, 2);
  assert.equal(r.pistes[0].nom, 'CAP carrelage');
  assert.equal(r.pistes[0].etiquette, 'formation');
  assert.equal(r.pistes[1].etiquette, 'situation');
  assert.equal(r.ceQuiNeRentrePas, 'mal au dos');
});

test('comparerParserDetection : etiquette inconnue -> null, piste sans nom ignoree', () => {
  const r = cp.comparerParserDetection('{"pistes":[{"nom":"X","etiquette":"n_importe_quoi"},{"etiquette":"metier"}]}');
  assert.equal(r.pistes.length, 1);
  assert.equal(r.pistes[0].etiquette, null);
});

test('comparerParserDetection : rien d’exploitable -> { erreur }', () => {
  assert.ok(cp.comparerParserDetection('').erreur);
  assert.ok(cp.comparerParserDetection('bonjour').erreur);
  assert.ok(cp.comparerParserDetection('{cassé').erreur);
});

test('comparerRouterForme : 2 formations -> superposition', () => {
  const p = [{ nom: 'a', etiquette: 'formation' }, { nom: 'b', etiquette: 'metier' }];
  assert.equal(cp.comparerRouterForme(p, 'auto'), 'superposition');
});

test('comparerRouterForme : 2 situations -> frise', () => {
  const p = [{ nom: 'a', etiquette: 'situation' }, { nom: 'b', etiquette: 'situation' }];
  assert.equal(cp.comparerRouterForme(p, 'auto'), 'frise');
});

test('comparerRouterForme : 2 metiers/formations + situation -> mixte, corrections respectees', () => {
  const p = [{ nom: 'a', etiquette: 'formation' }, { nom: 'b', etiquette: 'metier' }, { nom: 'c', etiquette: 'situation' }];
  assert.equal(cp.comparerRouterForme(p, 'auto'), 'mixte');
  assert.equal(cp.comparerRouterForme(p, 'tout-temps'), 'frise');
  assert.equal(cp.comparerRouterForme(p, 'dabord-metiers'), 'superposition');
});

test('comparerRouterForme : 1 metier + 1 situation -> frise (rien a superposer)', () => {
  const p = [{ nom: 'a', etiquette: 'metier' }, { nom: 'b', etiquette: 'situation' }];
  assert.equal(cp.comparerRouterForme(p, 'auto'), 'frise');
});

test('comparerRouterForme : moins de 2 pistes reelles -> orientation-first', () => {
  assert.equal(cp.comparerRouterForme([{ nom: 'a', etiquette: 'metier' }], 'auto'), 'orientation-first');
  assert.equal(cp.comparerRouterForme([{ nom: 'a', etiquette: 'idee_a_explorer' }, { nom: 'b', etiquette: 'frein_ou_etape' }], 'auto'), 'orientation-first');
});

test('comparerNomVersCodeFrein : mots courants -> code du repertoire', () => {
  assert.equal(cp.comparerNomVersCodeFrein('je n’ai pas le permis'), 'mobilite');
  assert.equal(cp.comparerNomVersCodeFrein('pas de logement'), 'hebergement');
  assert.equal(cp.comparerNomVersCodeFrein('CAP carrelage'), null);
  assert.equal(cp.comparerNomVersCodeFrein(''), null);
});

test('comparerRouterBlocB : serie choisie selon la situation', () => {
  const base = { pistes: [{ nom: 'a', etiquette: 'formation' }, { nom: 'b', etiquette: 'metier' }], correctionAngle: 'auto' };
  assert.equal(cp.comparerRouterBlocB(Object.assign({}, base, { situation: 'emploi' })), 'B1');
  assert.equal(cp.comparerRouterBlocB(Object.assign({}, base, { situation: 'sans-emploi' })), 'B3');
  assert.equal(cp.comparerRouterBlocB(Object.assign({}, base, { situation: 'formation' })), 'B5');
  assert.equal(cp.comparerRouterBlocB(Object.assign({}, base, { situation: 'independant' })), 'B6');
  assert.equal(cp.comparerRouterBlocB(Object.assign({}, base, { situation: 'arret-sante' })), 'B8');
});

test('comparerRouterBlocB : RQTH -> B9 ; orientation-first -> B11 ; demission -> B2', () => {
  assert.equal(cp.comparerRouterBlocB({ pistes: [{ nom: 'a', etiquette: 'metier' }, { nom: 'b', etiquette: 'situation' }], situation: 'emploi', handicap: 'rqth' }), 'B9');
  assert.equal(cp.comparerRouterBlocB({ pistes: [{ nom: 'a', etiquette: 'idee_a_explorer' }], situation: 'emploi' }), 'B11');
  assert.equal(cp.comparerRouterBlocB({ pistes: [{ nom: 'demissionner', etiquette: 'situation' }, { nom: 'rester', etiquette: 'situation' }], situation: 'emploi' }), 'B2');
});

test('comparerParserCollecte : JSON de collecte -> pistes normalisees', () => {
  const brut = 'ok {"territoire":"Dordogne (24)","pistes":[{"nom":"CAP carrelage","durable":{"en_quoi_ca_consiste":"x"},' +
    '"a_verifier":[{"element":"duree_formation","valeur":"9","unite":"mois","portee":"nationale",' +
    '"source":{"nom":"Onisep","url":"https://www.onisep.fr/x"},"date_info":"2026-03"},' +
    '{"element":"cout_total","valeur":"null","unite":"euros","source":{"nom":null,"url":null},"date_info":null}],' +
    '"incertitudes":["a"]}],"cloture":"..."}';
  const r = cp.comparerParserCollecte(brut);
  assert.equal(r.erreur, undefined);
  assert.equal(r.pistes.length, 1);
  assert.equal(r.pistes[0].a_verifier[0].source.url, 'https://www.onisep.fr/x');
  assert.equal(r.pistes[0].a_verifier[1].valeur, null); // "null" -> null
});

test('comparerParserCollecte : vide / sans piste -> { erreur }', () => {
  assert.ok(cp.comparerParserCollecte('').erreur);
  assert.ok(cp.comparerParserCollecte('{"pistes":[]}').erreur);
  assert.ok(cp.comparerParserCollecte('pas de json').erreur);
});

test('comparerGardeFouCollecte : reponse sourcee et datee -> fiable', () => {
  const parsed = { pistes: [{ a_verifier: [
    { source: { nom: 'Onisep', url: 'https://www.onisep.fr/x' }, date_info: '2019-04' },
    { source: { nom: 'France Travail', url: 'https://www.francetravail.fr/y' }, date_info: null }
  ] }] };
  const gf = cp.comparerGardeFouCollecte(parsed, '2026-09-01');
  assert.equal(gf.fiable, true);
  assert.equal(gf.alertes.length, 0);
});

test('comparerGardeFouCollecte : aucune URL / dates du jour / source hors liste -> alertes', () => {
  const auj = '2026-09-01';
  const sansUrl = cp.comparerGardeFouCollecte({ pistes: [{ a_verifier: [{ source: { nom: 'X', url: null }, date_info: '2020' }] }] }, auj);
  assert.equal(sansUrl.fiable, false);
  const datesAuj = cp.comparerGardeFouCollecte({ pistes: [{ a_verifier: [
    { source: { nom: 'A', url: 'https://www.onisep.fr/a' }, date_info: '2026-09-01' },
    { source: { nom: 'B', url: 'https://www.onisep.fr/b' }, date_info: '2026-09' }
  ] }] }, auj);
  assert.ok(datesAuj.alertes.some((a) => /aujourd/i.test(a)));
  const horsListe = cp.comparerGardeFouCollecte({ pistes: [{ a_verifier: [
    { source: { nom: 'SalaireBTP', url: 'https://www.salairebtp.fr/carreleur' }, date_info: '2026-08' }
  ] }] }, auj);
  assert.ok(horsListe.alertes.some((a) => /officielle/i.test(a)));
});

test('comparerFormaterValeur : unites lisibles, null -> "non trouve"', () => {
  assert.equal(cp.comparerFormaterValeur({ valeur: '9', unite: 'mois' }), '9 mois');
  assert.equal(cp.comparerFormaterValeur({ valeur: '9 a 24', unite: 'mois' }), '9 a 24 mois');
  assert.equal(cp.comparerFormaterValeur({ valeur: '1870', unite: 'euros_brut_mensuel' }), '1870 € brut par mois');
  assert.equal(cp.comparerFormaterValeur({ valeur: 'beaucoup de recrutements', unite: 'mots' }), 'beaucoup de recrutements');
  assert.equal(cp.comparerFormaterValeur({ valeur: null }), 'non trouvé');
});

test('comparerTexteSurCouleur : blanc sur fonce, sombre sur clair', () => {
  assert.equal(cp.comparerTexteSurCouleur('#2563eb'), '#ffffff');
  assert.equal(cp.comparerTexteSurCouleur('#16a34a'), '#ffffff');
  assert.equal(cp.comparerTexteSurCouleur('#ffe08a'), '#1b2430');
  assert.equal(cp.comparerTexteSurCouleur('pas une couleur'), '#ffffff');
});

test('comparerApparierDossiers : associe par nom, meme legerement reformule', () => {
  const pistes = [{ id: 'p1', nom: 'CAP carrelage' }, { id: 'p2', nom: 'Rester en poste' }];
  const dossiers = [{ nom: 'CAP carrelage mosaïque' }, { nom: 'Rester en poste et me former plus tard' }];
  const m = cp.comparerApparierDossiers(pistes, dossiers);
  assert.equal(m.p1.nom, 'CAP carrelage mosaïque');
  assert.equal(m.p2.nom, 'Rester en poste et me former plus tard');
});

test('comparerApparierDossiers : piste sans dossier -> null', () => {
  const m = cp.comparerApparierDossiers([{ id: 'p1', nom: 'Aide-soignant' }], [{ nom: 'Boulanger' }]);
  assert.equal(m.p1, null);
});

test('comparerParserFrise : JSON de frise -> colonnes + conditions', () => {
  const brut = 'ici : {"colonnes":[{"nom":"Rester en poste","role":"repere","aujourdhui":"a","pendant":"b","apres":"c"},' +
    '{"nom":"CAP carrelage","role":"depart","aujourdhui":"d","pendant":"e","apres":"f"}],' +
    '"conditions_a_reunir":[{"condition":"financement","regle_actuelle":"CPF ou PTP","source":{"nom":"Transitions Pro","url":null},"date_info":"2026-01"}],' +
    '"impact_sur_les_droits":[{"droit":"ARE","effet":"maintenue sous conditions","source":{"nom":null,"url":null}}],' +
    '"questions_conseiller":["Q1"],"incertitudes":["I1"]}';
  const r = cp.comparerParserFrise(brut);
  assert.equal(r.erreur, undefined);
  assert.equal(r.colonnes.length, 2);
  assert.equal(r.colonnes[0].role, 'repere');
  assert.equal(r.colonnes[1].apres, 'f');
  assert.equal(r.conditions_a_reunir[0].libelle, 'financement');
  assert.equal(r.conditions_a_reunir[0].source.nom, 'Transitions Pro');
  assert.equal(r.impact_sur_les_droits[0].libelle, 'ARE');
  assert.deepEqual(r.questions_conseiller, ['Q1']);
});

test('panier de comparaison : ajout / retrait / max 8 / dedoublonnage insensible casse-accents', () => {
  cp.comparerPanierVider();
  assert.equal(cp.comparerPanierAjouter('Carreleur'), true);
  assert.equal(cp.comparerPanierAjouter('carreleur'), false); // deja dedans (normalise)
  assert.equal(cp.comparerPanierContient('CARRELEUR'), true);
  ['Vendeur', 'Aide-soignant', 'Boulanger', 'Fleuriste', 'Menuisier', 'Cuisinier', 'Jardinier'].forEach(function (m) {
    assert.equal(cp.comparerPanierAjouter(m), true);
  });
  assert.equal(cp.comparerPanierListe().length, 8);
  assert.equal(cp.comparerPanierAjouter('Plombier'), false); // plein (8)
  cp.comparerPanierRetirer('vendeur');
  assert.equal(cp.comparerPanierListe().length, 7);
  assert.equal(cp.comparerPanierListe().indexOf('Vendeur'), -1);
  cp.comparerPanierVider();
  assert.deepEqual(cp.comparerPanierListe(), []);
});

test('comparerParserAllerPlusLoin : JSON questions ou repli ligne a ligne', () => {
  const j = cp.comparerParserAllerPlusLoin('voici : {"questions":["Avez-vous observé ce métier ?","Comment financer ?"],"cloture":"..."}');
  assert.equal(j.erreur, undefined);
  assert.equal(j.questions.length, 2);
  const repli = cp.comparerParserAllerPlusLoin('- Avez-vous pensé au trajet sans permis ?\n- Et à la garde le mercredi ?\ntexte sans point d interrogation');
  assert.equal(repli.questions.length, 2);
  assert.ok(cp.comparerParserAllerPlusLoin('').erreur);
  assert.ok(cp.comparerParserAllerPlusLoin('juste du texte plat sans rien').erreur);
});

test('comparerParserFrise : vide / sans colonne -> { erreur }', () => {
  assert.ok(cp.comparerParserFrise('').erreur);
  assert.ok(cp.comparerParserFrise('{"colonnes":[]}').erreur);
  assert.ok(cp.comparerParserFrise('pas de json').erreur);
});

test('comparerExtraireNombres : entiers, fourchettes, milliers avec espace', () => {
  assert.deepEqual(cp.comparerExtraireNombres('9'), { min: 9, max: 9 });
  assert.deepEqual(cp.comparerExtraireNombres('environ 9 mois'), { min: 9, max: 9 });
  assert.deepEqual(cp.comparerExtraireNombres('9 a 24'), { min: 9, max: 24 });
  assert.deepEqual(cp.comparerExtraireNombres('1 450 à 1 700 €'), { min: 1450, max: 1700 });
  assert.equal(cp.comparerExtraireNombres('non trouvé'), null);
  assert.equal(cp.comparerExtraireNombres(null), null);
});

test('COMPARER_DIMENSIONS_REGLETTE : chaque dimension a element + label + question', () => {
  cp.COMPARER_DIMENSIONS_REGLETTE.forEach((d) => {
    assert.ok(d.element && d.label && d.question);
  });
});

test('COMPARER_BLOC_B : 10 series, chacune <= 3 questions, "Je ne sais pas" sur les jetons', () => {
  const ids = Object.keys(cp.COMPARER_BLOC_B);
  assert.equal(ids.length, 10);
  ids.forEach((id) => {
    const s = cp.COMPARER_BLOC_B[id];
    assert.ok(s.titre && s.questions.length >= 1 && s.questions.length <= 3, id);
    s.questions.forEach((q) => {
      if (q.type === 'jetons') { assert.ok(q.options.indexOf('Je ne sais pas') >= 0, id + '/' + q.id); }
    });
  });
});
